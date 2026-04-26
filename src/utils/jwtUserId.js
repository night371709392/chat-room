import store from '@/store'

function decodeJwtPayload (token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.trim().split('.')
  if (parts.length < 2) return null
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = (4 - (b64.length % 4)) % 4
    b64 += '='.repeat(pad)
    return JSON.parse(atob(b64))
  } catch {
    return null
  }
}

function firstPositiveInt (...candidates) {
  for (const v of candidates) {
    if (v === null || v === undefined || v === '') continue
    const n = Number(v)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}

/**
 * 从 JWT payload 解析数字型 user id（不校验签名，仅作展示与收发方向用）
 */
export function userIdFromJwtToken (token) {
  const p = decodeJwtPayload(token)
  if (!p || typeof p !== 'object') return null
  const sub = p.sub
  const subNum = sub != null && String(sub).trim() !== '' && /^\d+$/.test(String(sub).trim())
    ? Number(sub)
    : null
  return firstPositiveInt(
    p.user_id,
    p.userId,
    p.uid,
    p.id,
    p.userID,
    subNum
  )
}

export function userIdFromLoginResponse (data) {
  if (!data || typeof data !== 'object') return null
  if (data.user && typeof data.user === 'object') {
    const u = firstPositiveInt(
      data.user.id,
      data.user.user_id,
      data.user.userId
    )
    if (u != null) return u
  }
  return firstPositiveInt(
    data.user_id,
    data.userId,
    data.id
  )
}

/**
 * 在 Socket 收消息或拉 profile 之前尽量写入 userId，避免私聊气泡左右错位。
 * @param {object} [loginResponse] 登录接口 JSON，若含 id 字段则优先使用
 */
export function hydrateUserIdFromToken (loginResponse) {
  const cur = store.state.userId
  if (cur !== null && cur !== undefined && cur !== '') {
    const n = Number(cur)
    if (Number.isFinite(n)) return
  }
  let id = userIdFromLoginResponse(loginResponse)
  if (id == null && typeof sessionStorage !== 'undefined') {
    const t = sessionStorage.getItem('token')
    id = userIdFromJwtToken(t)
  }
  if (id != null) {
    store.commit('setUserId', id)
  }
}
