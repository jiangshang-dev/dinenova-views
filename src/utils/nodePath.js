/**
 * 浏览器环境没有 Node 的 process，path-browserify 的 resolve 会调用 process.cwd()。
 * 菜单、页签、搜索只用到 posix 路径拼接，工作目录按站点根 '/' 处理。
 */
export function resolve(...segments) {
  let resolved = ''
  let absolute = false
  for (let i = segments.length - 1; i >= -1 && !absolute; i--) {
    const part = i >= 0 ? segments[i] : '/'
    if (typeof part !== 'string') {
      throw new TypeError('Path must be a string. Received ' + JSON.stringify(part))
    }
    if (!part) continue
    resolved = part + '/' + resolved
    absolute = part.charCodeAt(0) === 47
  }
  const parts = []
  for (const seg of resolved.split('/')) {
    if (!seg || seg === '.') continue
    if (seg === '..') {
      if (parts.length && parts[parts.length - 1] !== '..') parts.pop()
      else if (!absolute) parts.push('..')
    } else {
      parts.push(seg)
    }
  }
  const out = parts.join('/')
  if (absolute) return out ? '/' + out : '/'
  return out || '.'
}

export default { resolve }
