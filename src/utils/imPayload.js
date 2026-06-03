/**
 * 统一解析私聊 WS / HTTP 历史里的字段（兼容 snake_case、camelCase、部分嵌套）
 */

function toNum (v) {
  if (v === null || v === undefined || v === '') return NaN
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

function toTimestampMs (v) {
  if (v === null || v === undefined || v === '') return NaN
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return NaN
    return v > 1e12 ? v : v * 1000
  }
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return NaN
    const n = Number(s)
    if (Number.isFinite(n)) {
      return n > 1e12 ? n : n * 1000
    }
    const parsed = Date.parse(s)
    return Number.isFinite(parsed) ? parsed : NaN
  }
  return NaN
}

function firstNum (obj, keys) {
  if (!obj || typeof obj !== 'object') return NaN
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const n = toNum(obj[k])
      if (Number.isFinite(n)) return n
    }
  }
  return NaN
}

function firstStr (obj, keys) {
  if (!obj || typeof obj !== 'object') return ''
  for (const k of keys) {
    if (!Object.prototype.hasOwnProperty.call(obj, k)) continue
    const v = obj[k]
    if (v === null || v === undefined) continue
    const s = String(v)
    if (s) return s
  }
  return ''
}

/**
 * 会话在 store 里按「对方 userId」分桶；当前用户 me 已知时，从 sender/receiver 推出对方 id
 */
export function conversationPeerId (me, raw) {
  if (raw == null || typeof raw !== 'object') return NaN
  let o = raw
  if (typeof o === 'string') {
    try {
      o = JSON.parse(o)
    } catch {
      return NaN
    }
  }
  const sid = firstNum(o, ['sender_id', 'senderId', 'SenderID', 'from_id', 'fromId', 'FromID'])
  const rid = firstNum(o, ['receiver_id', 'receiverId', 'ReceiverID', 'to_id', 'toId'])

  if (Number.isFinite(me)) {
    if (Number.isFinite(sid) && sid === me) return rid
    if (Number.isFinite(rid) && rid === me) return sid
  }
  if (Number.isFinite(sid)) return sid
  if (Number.isFinite(rid)) return rid
  return NaN
}

export function normalizeIncomingPrivate (raw) {
  if (raw == null) return null
  let o = raw
  if (typeof o === 'string') {
    try {
      o = JSON.parse(o)
    } catch {
      return null
    }
  }
  if (typeof o !== 'object') return null

  const sender_id = firstNum(o, ['sender_id', 'senderId', 'SenderID', 'from_id', 'fromId'])
  const receiver_id = firstNum(o, ['receiver_id', 'receiverId', 'ReceiverID', 'to_id', 'toId'])
  const msg_type = toNum(o.msg_type ?? o.msgType ?? o.MsgType)
  const msg = firstStr(o, ['msg', 'Msg', 'context', 'Context', 'content', 'Content'])
  const file_url = firstStr(o, ['file_url', 'fileUrl', 'FileURL'])
  const file_name = firstStr(o, ['file_name', 'fileName', 'FileName'])
  const tsRaw =
    o.timestamp ??
    o.Timestamp ??
    o.create_time ??
    o.createTime ??
    o.msg_time ??
    o.msgTime ??
    o._client_received_at ??
    o.time
  const timestamp = toTimestampMs(tsRaw)

  return {
    type: o.type || o.Type,
    sender_id,
    receiver_id,
    msg_type: Number.isFinite(msg_type) && msg_type > 0 ? msg_type : 1,
    msg,
    file_url,
    file_name,
    timestamp: Number.isFinite(timestamp) ? timestamp : NaN
  }
}

function looksLikeHttpUrl (s) {
  return /^https?:\/\//i.test(String(s || '').trim())
}

function looksLikeMediaPathOrUrl (s) {
  const t = String(s || '').trim()
  if (!t) return false
  if (looksLikeHttpUrl(t)) {
    return /\.(png|jpe?g|gif|webp|bmp|mp4|webm|ogg|mov|m4v|avi|mkv)(\?|#|$)/i.test(t) ||
      /\/(upload|file|static|storage|cdn|img)\b/i.test(t)
  }
  if (t.startsWith('//')) return /\.(png|jpe?g|gif|webp|bmp|mp4|webm)(\?|#|$)/i.test(t)
  if (t.startsWith('/')) {
    return /\.(png|jpe?g|gif|webp|bmp|mp4|webm|ogg|mov|m4v|avi|mkv)(\?|#|$)/i.test(t) ||
      /\/(upload|file|static|storage)\b/i.test(t)
  }
  return false
}

/** 历史行可能是 { message: {...} } 等包装 */
function unwrapHistoryRow (row) {
  if (!row || typeof row !== 'object') return row
  const inner =
    row.chat_msg ?? row.chatMsg ?? row.ChatMsg ??
    row.record ?? row.Record ??
    row.payload ?? row.Payload
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    const hasLeaf = k => inner[k] != null && String(inner[k]).trim() !== ''
    if (hasLeaf('context') || hasLeaf('msg') || hasLeaf('sender_id') || hasLeaf('senderId')) {
      return inner
    }
  }
  if (row.message && typeof row.message === 'object' && !Array.isArray(row.message)) {
    const m = row.message
    if (m.context != null || m.msg != null || m.sender_id != null || m.senderId != null) return m
  }
  return row
}

function pickUrlFromNestedObjects (row) {
  if (!row || typeof row !== 'object') return ''
  const nests = [
    row.file, row.File, row.attachment, row.Attachment,
    row.media, row.Media, row.resource, row.Resource,
    row.image, row.Image, row.pic, row.Pic, row.photo, row.Photo,
    row.data, row.Data
  ]
  const subKeys = [
    'url', 'file_url', 'fileUrl', 'abs_url', 'absUrl', 'src', 'path',
    'link', 'location', 'file_path', 'filePath'
  ]
  for (const sub of nests) {
    if (!sub || typeof sub !== 'object') continue
    const u = firstStr(sub, subKeys)
    if (u) return u
  }
  if (Array.isArray(row.attachments)) {
    for (const a of row.attachments) {
      if (!a || typeof a !== 'object') continue
      const u = firstStr(a, subKeys)
      if (u) return u
    }
  }
  return ''
}

/** 兜底：从整行里找最像媒体地址的字符串，避免后端字段名不在白名单时丢图 */
function pickUrlDeepFallback (row) {
  if (!row || typeof row !== 'object') return ''
  const skipKeys = new Set([
    'sender_name', 'senderName', 'receiver_name', 'receiverName',
    'user_name', 'userName', 'nickname', 'nickName', 'remark',
    'friend_name', 'friendName', 'friend_picture', 'friendPicture'
  ])
  const scored = []
  const visit = (obj, depth) => {
    if (!obj || typeof obj !== 'object' || depth > 3) return
    if (Array.isArray(obj)) {
      for (const x of obj) visit(x, depth + 1)
      return
    }
    for (const k of Object.keys(obj)) {
      if (skipKeys.has(k)) continue
      const v = obj[k]
      if (typeof v === 'string') {
        const s = v.trim()
        if (!s || s.length < 8) continue
        if (looksLikeMediaPathOrUrl(s)) scored.push({ s, score: /\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(s) ? 4 : 2 })
      } else if (v && typeof v === 'object') visit(v, depth + 1)
    }
  }
  visit(row, 0)
  if (!scored.length) return ''
  scored.sort((a, b) => b.score - a.score)
  return scored[0].s
}

/**
 * 与 setFriendMessagesFromHistory 去重一致：同一条气泡在「拉历史」与本地之间对齐
 */
export function bubbleDedupeKey (m) {
  if (!m || typeof m !== 'object') return ''
  const ts = Number(m.timestamp) || 0
  const out = m.outgoing ? 1 : 0
  const mt = Number(m.msg_type)
  if (mt === 2 || mt === 3) {
    const u = String(m.file_url || m.msg || '').trim()
    return `${ts}|${out}|f|${u}`
  }
  return `${ts}|${out}|1|${String(m.msg || '').trim().slice(0, 200)}`
}

export function normalizeHistoryRow (row, me, index, friendId) {
  if (row == null || typeof row !== 'object') return null
  row = unwrapHistoryRow(row)
  const senderId = firstNum(row, ['sender_id', 'senderId', 'SenderID', 'from_id', 'fromId'])
  const body = firstStr(row, [
    'context', 'Context', 'msg', 'Msg', 'content', 'Content',
    'message', 'Message', 'text', 'Text'
  ])
  const tsRaw = row.create_time ?? row.createTime ?? row.timestamp ?? row.Timestamp ?? row.msg_time ?? row.msgTime ?? row.time
  const ts = toTimestampMs(tsRaw)
  const msgTypeRaw =
    row.msg_type ?? row.msgType ?? row.MsgType ??
    row.message_type ?? row.messageType ?? row.kind ?? row.Type
  let msgType = Number.isFinite(toNum(msgTypeRaw)) ? toNum(msgTypeRaw) : 1
  const outgoing = Number.isFinite(me) && Number.isFinite(senderId) && senderId === me
  const fid = toNum(friendId)
  let fileUrl = firstStr(row, [
    'file_url', 'fileUrl', 'FileURL',
    'abs_url', 'absUrl', 'AbsURL',
    'file_path', 'filePath',
    'path', 'link', 'location',
    'url', 'file'
  ])
  if (!fileUrl) fileUrl = pickUrlFromNestedObjects(row)
  const fileNameHint = firstStr(row, ['file_name', 'fileName', 'FileName', 'filename'])
  if (msgType === 1 && fileNameHint && looksLikeHttpUrl(body)) {
    msgType = 2
  }
  if (msgType === 1 && fileUrl && looksLikeHttpUrl(fileUrl)) {
    msgType = 2
  }
  if (msgType === 1 && looksLikeMediaPathOrUrl(body)) {
    msgType = 2
  }
  let msgVal = body
  if (msgType === 2 || msgType === 3) {
    if (!fileUrl && body) fileUrl = body
    if (!msgVal && fileUrl) msgVal = fileUrl
    if (!fileUrl && !msgVal) {
      const fb = pickUrlDeepFallback(row)
      if (fb) {
        fileUrl = fb
        msgVal = fb
      }
    }
    if (msgType === 3 && !fileUrl && !msgVal) {
      msgType = 1
    }
  }
  if (msgType === 1 && fileUrl && looksLikeMediaPathOrUrl(fileUrl)) {
    msgType = 2
    if (!msgVal) msgVal = fileUrl
  }
  const senderName = firstStr(row, ['sender_name', 'senderName', 'SenderName', 'nickname', 'nickName'])
  const senderPicture = firstStr(row, ['sender_picture', 'senderPicture', 'SenderPicture', 'picture', 'avatar'])

  return {
    id: `hist-${fid}-${Number.isFinite(ts) ? ts : 0}-${index}`,
    outgoing,
    pending: false,
    failed: false,
    msg_type: msgType,
    msg: msgVal,
    file_url: fileUrl,
    file_name: fileNameHint,
    timestamp: Number.isFinite(ts) ? ts : 0,
    sender_id: senderId,
    sender_name: senderName,
    sender_picture: senderPicture
  }
}

export function isHistorySuccess (data) {
  if (!data || typeof data !== 'object') return false
  if (data.error === 'success' || data.err === 'success') return true
  if (data.msg === 'success' || data.message === 'success') return true
  if (data.code === 0 || data.code === '0') return true
  return false
}

export function extractHistoryList (data) {
  if (!data || typeof data !== 'object') return []
  const cands = [
    data.list, data.List,
    data.messages, data.rows,
    data.records, data.Records,
    data.items, data.Items,
    data.pageList, data.PageList,
    data.chat_list, data.chatList,
    data.data, data.Data,
    data.result, data.Result
  ]
  for (const c of cands) {
    if (Array.isArray(c)) return c
  }
  if (data.data && typeof data.data === 'object') {
    const d = data.data
    const inner = d.list || d.List || d.messages || d.rows || d.records || d.items || d.pageList || d.data
    if (Array.isArray(inner)) return inner
  }
  if (data.result && typeof data.result === 'object') {
    const r = data.result
    const inner = r.list || r.List || r.records || r.items || r.rows || r.data || r.messages
    if (Array.isArray(inner)) return inner
  }
  return []
}
