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

export function normalizeHistoryRow (row, me, index, friendId) {
  if (row == null || typeof row !== 'object') return null
  const senderId = firstNum(row, ['sender_id', 'senderId', 'SenderID', 'from_id', 'fromId'])
  const body = firstStr(row, ['context', 'Context', 'msg', 'Msg', 'content', 'Content'])
  const tsRaw = row.create_time ?? row.createTime ?? row.timestamp ?? row.Timestamp ?? row.msg_time ?? row.msgTime ?? row.time
  const ts = toTimestampMs(tsRaw)
  const msgTypeRaw = row.msg_type ?? row.msgType ?? row.MsgType
  const msgType = Number.isFinite(toNum(msgTypeRaw)) ? toNum(msgTypeRaw) : 1
  const outgoing = Number.isFinite(me) && Number.isFinite(senderId) && senderId === me
  const fid = toNum(friendId)
  return {
    id: `hist-${fid}-${Number.isFinite(ts) ? ts : 0}-${index}`,
    outgoing,
    pending: false,
    failed: false,
    msg_type: msgType,
    msg: body,
    file_url: firstStr(row, ['file_url', 'fileUrl']),
    file_name: firstStr(row, ['file_name', 'fileName']),
    timestamp: Number.isFinite(ts) ? ts : 0
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
    data.list,
    data.data,
    data.messages,
    data.rows,
    data.Data,
    data.List
  ]
  for (const c of cands) {
    if (Array.isArray(c)) return c
  }
  if (data.data && typeof data.data === 'object') {
    const inner = data.data.list || data.data.List || data.data.messages
    if (Array.isArray(inner)) return inner
  }
  return []
}
