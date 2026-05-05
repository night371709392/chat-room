/**
 * 解析 /api/contact/friend/main 等接口返回体中的单条好友对象（常见为 { err, list }，list 可为对象或数组）。
 */
export function extractFriendMainRow (body) {
  if (!body || typeof body !== 'object') return {}
  const list = body.list
  if (Array.isArray(list)) {
    const first = list[0]
    return first && typeof first === 'object' ? first : {}
  }
  if (list && typeof list === 'object') return list
  if (body.friend && typeof body.friend === 'object') return body.friend
  const inner = body.data
  if (inner && typeof inner === 'object') {
    if (Array.isArray(inner)) {
      const first = inner[0]
      return first && typeof first === 'object' ? first : {}
    }
    return inner
  }
  return body
}
