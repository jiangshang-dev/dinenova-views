/**
 * Semi-automated Options API → script setup for Ruoyi-style pages.
 * Run: node scripts/convert-vue-setup.mjs [glob dirs...]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const TARGET_DIRS = process.argv.slice(2).length
  ? process.argv.slice(2).map((d) => path.resolve(d))
  : [
      path.join(root, 'src/views/system'),
      path.join(root, 'src/views/tool'),
      path.join(root, 'src/views/components'),
      path.join(root, 'src/layout'),
      path.join(root, 'src/components'),
    ]

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, acc)
    else if (name.endsWith('.vue')) acc.push(p)
  }
  return acc
}

function extractBlock(content, tag) {
  const re = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = content.match(re)
  if (!m) return { attrs: '', body: '', full: '' }
  return { attrs: m[1] || '', body: m[2], full: m[0] }
}

function convertSimpleComponent(content) {
  const template = extractBlock(content, 'template')
  const script = extractBlock(content, 'script')
  const style = extractBlock(content, 'style')

  if (!script.body || script.body.includes('script setup')) return null
  if (script.body.includes('render(') && !script.body.includes('export default')) return null

  let s = script.body.trim()
  const nameMatch = s.match(/name\s*:\s*['"]([^'"]+)['"]/)
  const name = nameMatch ? nameMatch[1] : null

  // Skip complex: mixins, dicts, render-only without template logic we handle elsewhere
  if (/mixins\s*:|dicts\s*:|render\s*\(\)/.test(s)) return null

  const propsMatch = s.match(/props\s*:\s*(\{[\s\S]*?\n  \}),?\n/m)
  const emitsFromMethods = s.includes('this.$emit')

  let setup = `<script setup>\n`
  if (name) setup += `defineOptions({ name: '${name}' })\n\n`

  const imports = new Set()
  if (/computed\s*:/.test(s)) imports.add("import { computed } from 'vue'")
  if (/watch\s*:/.test(s) || /\$route/.test(s)) {
    imports.add("import { ref, watch, onMounted } from 'vue'")
    if (/\$route/.test(s)) imports.add("import { useRoute, useRouter } from 'vue-router'")
  } else if (/data\s*\(\)/.test(s)) imports.add("import { ref, reactive, onMounted } from 'vue'")
  if (/mapGetters|mapState|\$store/.test(s)) imports.add("import { useStore } from 'vuex'")
  if (/\$modal/.test(s)) imports.add("import modal from '@/plugins/modal'")
  if (/\$message/.test(s)) imports.add("import { ElMessage } from 'element-plus'")
  if (/\$confirm/.test(s)) imports.add("import { ElMessageBox } from 'element-plus'")
  if (/dicts\s*:/.test(s)) imports.add("import { useDict } from '@/composables/useDict'")

  if (imports.size) setup += [...imports].join('\n') + '\n\n'

  // dicts
  const dictsMatch = s.match(/dicts\s*:\s*\[([^\]]+)\]/)
  if (dictsMatch) {
    setup += `const dict = useDict(${dictsMatch[1].trim()})\n\n`
  }

  if (/\$store|mapState|mapGetters/.test(s)) setup += `const store = useStore()\n`
  if (/\$route/.test(s)) setup += `const route = useRoute()\nconst router = useRouter()\n`

  // props - keep as defineProps block if found (naive)
  if (propsMatch) {
    setup += `const props = defineProps(${propsMatch[1]})\n\n`
  }

  if (emitsFromMethods) setup += `const emit = defineEmits([])\n\n`

  setup += `// TODO: manual migration required for this file\n`
  setup += `</script>`

  return null // script returns null - we only use for detection; full auto is unsafe
}

function main() {
  const files = []
  for (const d of TARGET_DIRS) {
    if (d.endsWith('.vue')) files.push(d)
    else walk(d, files)
  }
  const appVue = path.join(root, 'src/App.vue')
  if (!files.includes(appVue)) files.push(appVue)

  const pending = []
  for (const f of files) {
    const c = fs.readFileSync(f, 'utf8')
    if (c.includes('<script setup>')) continue
    if (/<script[^>]*setup/.test(c)) continue
    pending.push(path.relative(root, f))
  }
  console.log('Pending conversion:', pending.length)
  pending.forEach((p) => console.log(' -', p))
}

main()
