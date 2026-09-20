#!/usr/bin/env node
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
  const bindings = new Map()
  let m
  const refSimple = /const\s+(\w+)\s*=\s*ref\s*\(/g
  while ((m = refSimple.exec(script)) !== null) bindings.set(m[1], 'ref')
  const reactiveRe = /const\s+(\w+)\s*=\s*reactive\s*\(/g
  while ((m = reactiveRe.exec(script)) !== null) bindings.set(m[1], 'reactive')
  return bindings
}

const issues = []
for (const file of walk(SRC)) {
  const content = fs.readFileSync(file, 'utf8')
  const script = extractScriptSetup(content)
  if (!script) continue
  const bindings = parseBindings(script)
  const lines = script.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*\/\//.test(line)) continue
    for (const [name, kind] of bindings) {
      if (new RegExp(`^\\s*${name}\\s*=\\s`).test(line) && !line.includes(`${name}.value =`)) {
        issues.push({ file: path.relative(SRC, file), line: i + 1, kind, text: line.trim() })
      }
    }
  }
  // form.value but form not ref
  if (/\bform\.value\b/.test(script)) {
    const formKind = bindings.get('form')
    if (formKind && formKind !== 'ref') {
      issues.push({ file: path.relative(SRC, file), line: 0, kind: 'form.value-on-non-ref', text: `form is ${formKind} but uses form.value` })
    }
    if (!bindings.has('form') && /const\s+form\s*=\s*\{/.test(script)) {
      issues.push({ file: path.relative(SRC, file), line: 0, kind: 'form.value-on-plain', text: 'const form = {} uses form.value' })
    }
  }
}

console.log(JSON.stringify({ issueCount: issues.length, issues }, null, 2))
