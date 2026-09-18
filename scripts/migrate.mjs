import fs from 'fs'
import path from 'path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const src = path.join(root, 'src')

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) walk(full, acc)
    else acc.push(full)
  }
  return acc
}

function getAttr(attrs, name) {
  const re = new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)')`)
  const m = attrs.match(re)
  if (!m) return null
  return m[2] !== undefined ? m[2] : m[3]
}

function removeAttr(attrs, name) {
  return attrs.replace(new RegExp(`\\s+${name}\\s*=\\s*("[^"]*"|'[^']*')`, 'g'), '')
}

function transformTemplate(html) {
  html = html.replace(/el-submenu/g, 'el-sub-menu')
  html = html.replace(/\.native\b/g, '')
  html = html.replace(/popper-append-to-body/g, ':teleported="true"')
  html = html.replace(/custom-class=/g, 'class=')
  html = html.replace(/size="mini"/g, 'size="small"')
  html = html.replace(/size='mini'/g, "size='small'")
  html = html.replace(/size="medium"/g, 'size="default"')
  html = html.replace(/size='medium'/g, "size='default'")
  html = html.replace(/:visible\.sync=/g, 'v-model=')
  html = html.replace(/:current-page\.sync=/g, 'v-model:current-page=')
  html = html.replace(/:page-size\.sync=/g, 'v-model:page-size=')
  html = html.replace(/:([A-Za-z0-9_-]+)\.sync=/g, 'v-model:$1=')
  html = html.replace(/\s+v-on="\$listeners"/g, '')
  html = html.replace(/\s+v-on='\$listeners'/g, '')

  const re = /<!--[\s\S]*?-->|<\/([A-Za-z][\w:-]*)\s*>|<([A-Za-z][\w:-]*)((?:\s+[^\s=\/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g
  let result = ''
  let last = 0
  const stack = []
  let match
  while ((match = re.exec(html))) {
    result += html.slice(last, match.index)
    const full = match[0]
    if (full.startsWith('<!--')) {
      result += full
    } else if (full.startsWith('</')) {
      const name = match[1]
      let frame = null
      while (stack.length) {
        frame = stack.pop()
        if (frame.name.toLowerCase() === name.toLowerCase()) break
        frame = null
      }
      result += full
      if (frame && frame.wrap) result += '</template>'
    } else {
      const name = match[2]
      let attrs = match[3] || ''
      const selfClose = match[4] === '/'
      const slot = getAttr(attrs, 'slot')
      const slotScope = getAttr(attrs, 'slot-scope')
      attrs = removeAttr(attrs, 'slot')
      attrs = removeAttr(attrs, 'slot-scope')
      if (name === 'template') {
        if (slot && slotScope) attrs += ` #${slot}="${slotScope}"`
        else if (slot) attrs += ` #${slot}`
        else if (slotScope) attrs += ` #default="${slotScope}"`
      }
      const open = `<${name}${attrs}${selfClose ? ' /' : ''}>`
      const needWrap = name !== 'template' && (slot || slotScope)
      if (needWrap) {
        const slotName = slot || 'default'
        const scope = slotScope ? `="${slotScope}"` : ''
        result += `<template #${slotName}${scope}>${open}`
        if (selfClose) result += '</template>'
      } else {
        result += open
      }
      if (!selfClose) stack.push({ name, wrap: needWrap })
    }
    last = match.index + full.length
  }
  result += html.slice(last)
  return result
}

function transformDeep(content) {
  return content
    .replace(/::v-deep\s+([^{\n;]+?)\s*\{/g, ':deep($1) {')
    .replace(/\/deep\/\s+([^{\n;]+?)\s*\{/g, ':deep($1) {')
    .replace(/>>>\s+([^{\n;]+?)\s*\{/g, ':deep($1) {')
}

function transformScript(content, file) {
  content = content.replace(/from\s+['"]element-ui['"]/g, "from 'element-plus'")
  content = content.replace(/import\s*\{([^}]+)\}\s*from\s+'element-plus'/g, (full, names) => {
    const map = {
      Message: 'ElMessage as Message',
      MessageBox: 'ElMessageBox as MessageBox',
      Notification: 'ElNotification as Notification',
      Loading: 'ElLoading as Loading'
    }
    const next = names.split(',').map((part) => {
      const raw = part.trim()
      if (!raw || raw.includes(' as ')) return raw
      return map[raw] || raw
    }).join(', ')
    return `import { ${next} } from 'element-plus'`
  })
  content = content.replace(/process\.env\.VUE_APP_(\w+)/g, 'import.meta.env.VUE_APP_$1')
  content = content.replace(/process\.env\.NODE_ENV/g, 'import.meta.env.MODE')
  content = content.replace(/\bbeforeDestroy\b/g, 'beforeUnmount')
  content = content.replace(/\bdestroyed\s*\(/g, 'unmounted(')
  content = content.replace(/@riophae\/vue-treeselect\/dist\/vue-treeselect\.css/g, 'vue3-treeselect/dist/vue3-treeselect.css')
  content = content.replace(/@riophae\/vue-treeselect/g, 'vue3-treeselect')
  content = content.replace(/from\s+['"]vue-count-to['"]/g, "from 'vue3-count-to'")
  content = content.replace(/from\s+['"]vue-print-nb['"]/g, "from 'vue3-print-nb'")
  if (file.includes(`${path.sep}directive${path.sep}`)) {
    content = content.replace(/\binserted\s*\(/g, 'mounted(')
    content = content.replace(/\bbind\s*\(/g, 'beforeMount(')
    content = content.replace(/\bunbind\s*\(/g, 'unmounted(')
    content = content.replace(/\bcomponentUpdated\s*\(/g, 'updated(')
  }
  return content
}

function transformVue(content, file) {
  const scriptIdx = content.search(/<script[\s>]/)
  const styleIdx = content.search(/<style[\s>]/)
  let end = content.length
  if (scriptIdx !== -1) end = Math.min(end, scriptIdx)
  if (styleIdx !== -1 && styleIdx < end) {
    /* style after script is normal; template is before script */
  }
  const cut = scriptIdx === -1 ? (styleIdx === -1 ? content.length : styleIdx) : scriptIdx
  let head = transformTemplate(content.slice(0, cut))
  let tail = content.slice(cut)
  tail = transformScript(tail, file)
  tail = transformDeep(tail)
  return head + tail
}

const files = walk(src)
for (const file of files) {
  if (!/\.(vue|js|scss)$/.test(file)) continue
  let content = fs.readFileSync(file, 'utf8')
  const original = content
  if (file.endsWith('.vue')) content = transformVue(content, file)
  else if (file.endsWith('.js')) content = transformDeep(transformScript(content, file))
  else content = transformDeep(content)
  if (content !== original) fs.writeFileSync(file, content)
}

console.log('migrated', files.filter(f => /\.(vue|js|scss)$/.test(f)).length, 'files')
