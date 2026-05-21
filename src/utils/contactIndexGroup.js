import { pinyin } from 'pinyin-pro'

/**
 * 取展示名首字母（A-Z），数字/符号/无法识别拼音的字符归入 #
 */
export function getSortLetter (name) {
  const s = String(name || '').trim()
  if (!s) return '#'
  const ch = s.charAt(0)
  if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase()
  if (/[0-9]/.test(ch)) return '#'
  try {
    const py = pinyin(ch, { pattern: 'first', toneType: 'none' })
    const letter = py && py.charAt(0) ? py.charAt(0).toUpperCase() : ''
    if (/[A-Z]/.test(letter)) return letter
  } catch (e) {
    /* ignore */
  }
  return '#'
}

/**
 * 按首字母分组并排序，返回 [{ letter, items }, ...]
 * @param {Array} items
 * @param {(item: *) => string} getName
 */
export function groupByLetter (items, getName) {
  if (!Array.isArray(items) || !items.length) return []
  const map = {}
  items.forEach(item => {
    const letter = getSortLetter(getName(item))
    if (!map[letter]) map[letter] = []
    map[letter].push(item)
  })
  Object.keys(map).forEach(letter => {
    map[letter].sort((a, b) => {
      const na = String(getName(a) || '')
      const nb = String(getName(b) || '')
      return na.localeCompare(nb, 'zh-CN')
    })
  })
  const letters = Object.keys(map).sort((a, b) => {
    if (a === '#') return 1
    if (b === '#') return -1
    return a.localeCompare(b)
  })
  return letters.map(letter => ({ letter, items: map[letter] }))
}
