import fs from 'fs'
import path from 'path'

const root = path.resolve(import.meta.dirname, '..')
const dirs = ['src/views/member', 'src/views/merchant', 'src/views/cashier', 'src/views/dashboard', 'src/views/login.vue', 'src/views/index.vue']
const files = []
function walk(p) {
  const full = path.join(root, p)
  if (p.endsWith('.vue')) { files.push(full); return }
  if (!fs.existsSync(full)) return
  for (const n of fs.readdirSync(full)) walk(path.join(p, n))
}
dirs.forEach(walk)

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8')
  if (!c.includes('<script setup>')) continue
  c = c.replace(/v-if="!this\.\$store\.getters\.storeId"/g, 'v-if="!store.getters.storeId"')
  c = c.replace(/v-if="this\.(\w+)\./g, 'v-if="$1.')
  c = c.replace(/v-if="!this\.(\w+)\./g, 'v-if="!$1.')
  c = c.replace(/:src="([^"]+)\+ this\.(\w+)\./g, ':src="$1 + $2.')
  c = c.replace(/\bthis\.\$emit\b/g, 'emit')
  c = c.replace(/\bthis\.\$store\b/g, 'store')
  c = c.replace(/\bthis\.addDateRange\b/g, 'addDateRange')
  c = c.replace(/\bthis\.(\w+)\b/g, (m, id) => {
    if (id === 'addDateRange') return 'addDateRange'
    return m
  })
  fs.writeFileSync(file, c)
}
console.log('postfix done', files.length)
