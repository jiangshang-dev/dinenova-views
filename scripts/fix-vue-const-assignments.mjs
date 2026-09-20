#!/usr/bin/env node
/**
 * Fix bare assignments to const ref/reactive bindings in <script setup> blocks.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '../src')

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, files)
    else if (ent.name.endsWith('.vue')) files.push(p)
  }
  return files
}

function extractScriptSetup(content) {
  const m = content.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)
  return m ? m[1] : null
}

function parseBindings(script) {
  const bindings = new Map() // name -> 'ref' | 'reactive' | 'refFromToRefs'

  const refRe = /const\s+(\w+)\s*=\s*ref\s*[<(]/g
  const refSimple = /const\s+(\w+)\s*=\s*ref\s*\(/g
  let m
  while ((m = refSimple.exec(script)) !== null) {
    bindings.set(m[1], 'ref')
  }

  const reactiveRe = /const\s+(\w+)\s*=\s*reactive\s*\(/g
  while ((m = reactiveRe.exec(script)) !== null) {
    bindings.set(m[1], 'reactive')
  }

  // const { foo } = toRefs(state) — less common, skip deep parse; ref from destructuring
  const toRefsRe = /const\s+\{\s*([^}]+)\s*\}\s*=\s*toRefs\s*\(/g
  while ((m = toRefsRe.exec(script)) !== null) {
    const parts = m[1].split(',').map((s) => s.trim())
    for (const part of parts) {
      const name = part.includes(':') ? part.split(':')[1].trim() : part.split(':')[0].trim()
      const alias = part.includes(':') ? part.split(':')[0].trim() : part
      bindings.set(alias, 'ref')
    }
  }

  return bindings
}

function isArrayInit(script, name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*reactive\\s*\\(\\s*\\[`)
  return re.test(script)
}

function replaceReactiveArrayAssign(script, name, rhs, line) {
  const trimmedRhs = rhs.trim()
      if (trimmedRhs === '[]' || trimmedRhs.startsWith('[];')) {
        return `${name}.length = 0`
      }
  if (trimmedRhs.startsWith('[') && !trimmedRhs.includes('...')) {
    // literal array assign: uploadFiles = [{...}]
    return `${name}.length = 0; ${name}.push(...${trimmedRhs})`
  }
  // expression array
  return `${name}.length = 0; ${name}.push(...(${trimmedRhs} || []))`
}

function replaceReactiveObjectAssign(_script, name, rhs) {
  const trimmed = rhs.trim().replace(/;\s*$/, '')
  if (trimmed.startsWith('{')) {
    return `Object.assign(${name}, ${trimmed})`
  }
  return `Object.assign(${name}, ${trimmed})`
}

function fixScript(script, bindings) {
  let fixed = script
  let changeCount = 0
  const lines = script.split('\n')
  const newLines = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    // Skip comments
    if (/^\s*\/\//.test(line)) {
      newLines.push(line)
      continue
    }

    let replaced = false
    for (const [name, kind] of bindings) {
      // Match assignment at start of statement (after whitespace)
      const assignRe = new RegExp(`^(\\s*)${name}\\s*=\\s*(.+)$`)
      const am = line.match(assignRe)
      if (!am) continue
      const rhs = am[2].replace(/;\s*$/, '')
      // Skip if already .value on lhs (shouldn't match)
      if (kind === 'ref') {
        const nl = `${am[1]}${name}.value = ${rhs}${am[2].endsWith(';') ? ';' : ''}`
        line = nl
        changeCount++
        replaced = true
        break
      }
      if (kind === 'reactive') {
        const isArr = isArrayInit(script, name)
        let nl
        if (isArr) {
          nl = `${am[1]}${replaceReactiveArrayAssign(script, name, rhs, line)}${am[2].trim().endsWith(';') || rhs.endsWith(';') ? ';' : ''}`
          if (!nl.endsWith(';') && am[2].includes(';')) nl += ';'
        } else {
          nl = `${am[1]}${replaceReactiveObjectAssign(script, name, rhs)}${am[2].trim().endsWith(';') ? ';' : (am[2].includes(';') ? ';' : '')}`
        }
        line = nl
        changeCount++
        replaced = true
        break
      }
    }
    newLines.push(line)
  }

  return { script: newLines.join('\n'), changeCount }
}

function scanIssues(script, bindings) {
  const issues = []
  const lines = script.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*\/\//.test(line)) continue
    for (const [name, kind] of bindings) {
      const assignRe = new RegExp(`^\\s*${name}\\s*=\\s*(?!.*\\.value)`)
      if (assignRe.test(line) && !line.includes(`${name}.value =`)) {
        issues.push({ line: i + 1, text: line.trim(), name, kind })
      }
    }
  }
  return issues
}

const dryRun = process.argv.includes('--scan-only')
const files = walk(SRC)
let totalFixed = 0
let filesChanged = 0
const remaining = []

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  const script = extractScriptSetup(content)
  if (!script) continue

  const bindings = parseBindings(script)
  if (bindings.size === 0) continue

  if (dryRun) {
    const issues = scanIssues(script, bindings)
    if (issues.length) {
      remaining.push({ file: path.relative(SRC, file), issues })
    }
    continue
  }

  const beforeIssues = scanIssues(script, bindings)
  if (beforeIssues.length === 0) continue

  const { script: newScript, changeCount } = fixScript(script, bindings)
  if (changeCount === 0) {
    remaining.push({ file: path.relative(SRC, file), issues: beforeIssues })
    continue
  }

  const newContent = content.replace(
    /(<script setup[^>]*>)([\s\S]*?)(<\/script>)/,
    (_, open, _old, close) => open + newScript + close
  )
  fs.writeFileSync(file, newContent, 'utf8')
  filesChanged++
  totalFixed += changeCount

  const afterIssues = scanIssues(newScript, bindings)
  if (afterIssues.length) {
    remaining.push({ file: path.relative(SRC, file), issues: afterIssues })
  }
}

if (dryRun) {
  console.log(JSON.stringify({ remainingCount: remaining.length, remaining }, null, 2))
} else {
  console.log(JSON.stringify({ filesChanged, totalFixed, remainingCount: remaining.length, remaining }, null, 2))
}
