import axios from 'axios'
import { firstMsgIdStr } from '@/utils/imPayload'

/**
 * POST /chat/upload（经 devServer 代理为 /api/chat/upload）
 * formData: file（必填）、receiver_id（integer）或 group_id（integer）
 * 成功后从 JSON 中取可访问 URL（优先 abs_url），再经 Socket msg_type=2 发送。
 *
 * 覆盖环境变量：VUE_APP_CHAT_UPLOAD_URL、VUE_APP_CHAT_UPLOAD_FIELD、VUE_APP_GROUP_UPLOAD_URL
 */
const DEFAULT_UPLOAD_URL =
  (typeof process !== 'undefined' && process.env && process.env.VUE_APP_CHAT_UPLOAD_URL) ||
  '/api/chat/upload'

const DEFAULT_GROUP_UPLOAD_URL =
  (typeof process !== 'undefined' && process.env && process.env.VUE_APP_GROUP_UPLOAD_URL) ||
  '/api/group/upload/doc'

function pickUrlFromObject (obj) {
  if (!obj || typeof obj !== 'object') return ''
  const keys = [
    'abs_url',
    'absUrl',
    'AbsURL',
    'url',
    'fileUrl',
    'file_url',
    'file',
    'path',
    'link',
    'filePath',
    'file_path',
    'location'
  ]
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const v = obj[k]
      if (typeof v === 'string' && v.trim()) return v.trim()
    }
  }
  if (obj.data != null) {
    if (typeof obj.data === 'string' && obj.data.trim()) return obj.data.trim()
    if (typeof obj.data === 'object') {
      const nested = pickUrlFromObject(obj.data)
      if (nested) return nested
    }
  }
  return ''
}

/** 与历史接口约定一致：部分后端用 error/err 字段承载字面量 "success" 表示成功 */
function isBenignApiStatusString (s) {
  if (typeof s !== 'string') return false
  const t = s.trim().toLowerCase()
  return t === 'success' || t === 'ok'
}

function pickFileNameFromObject (obj, fallback) {
  if (!obj || typeof obj !== 'object') return fallback
  const n = obj.file_name ?? obj.fileName ?? obj.FileName
  if (typeof n === 'string' && n.trim()) return n.trim()
  const nested = obj.data && typeof obj.data === 'object'
    ? (obj.data.file_name ?? obj.data.fileName)
    : ''
  if (typeof nested === 'string' && nested.trim()) return nested.trim()
  return fallback
}

function pickMsgIdFromObject (obj) {
  if (!obj || typeof obj !== 'object') return null
  const id = firstMsgIdStr(obj, ['msg_id', 'msgId', 'MsgId', 'MsgID', 'message_id', 'messageId', 'id', 'Id', 'ID'])
  if (id) return id
  if (obj.data && typeof obj.data === 'object') return pickMsgIdFromObject(obj.data)
  return null
}

/**
 * @param {File} file
 * @param {{ receiverId?: number|string, groupId?: number|string, uploadUrl?: string, fieldName?: string }} options
 * @returns {Promise<{ url: string, fileName: string, msgId: string|null }>}
 */
export async function uploadChatAttachment (file, options = {}) {
  if (!file || !(file instanceof File)) {
    throw new Error('无效文件')
  }
  const isGroup = !!(options.groupId != null && options.groupId !== '')
  const rid = isGroup ? options.groupId : options.receiverId
  if (rid === null || rid === undefined || rid === '') {
    throw new Error('缺少接收方 id')
  }
  const n = Number(rid)
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('id 无效')
  }

  const uploadUrl = options.uploadUrl || (isGroup ? DEFAULT_GROUP_UPLOAD_URL : DEFAULT_UPLOAD_URL)
  const fieldName =
    options.fieldName ||
    (typeof process !== 'undefined' && process.env && process.env.VUE_APP_CHAT_UPLOAD_FIELD) ||
    'file'

  const form = new FormData()
  form.append(fieldName, file)
  if (isGroup) {
    form.append('group_id', String(n))
  } else {
    form.append('receiver_id', String(n))
  }

  const res = await axios.post(uploadUrl, form)
  const data = res.data

  if (data && typeof data === 'object') {
    const errStr =
      (typeof data.err === 'string' && data.err.trim()) ||
      (typeof data.error === 'string' && data.error.trim()) ||
      ''
    if (errStr && !isBenignApiStatusString(errStr)) {
      throw new Error(errStr)
    }
  }

  const url = pickUrlFromObject(data)
  if (!url) {
    throw new Error('上传成功但未返回文件地址（需要 abs_url / url / file_url 等字段）')
  }

  const fileName = pickFileNameFromObject(data, file.name || '文件')
  const msgId = pickMsgIdFromObject(data)
  return { url, fileName, msgId }
}
