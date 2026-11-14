// Applies a URL fix map to every part file: { oldUrl: {url, label} } replaces, { oldUrl: null } removes.
// Reports any record left with zero sources. Usage: node scripts/replace-urls.mjs fixes.json
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
const fixes = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const DIR = 'lib/data/parts'
for (const f of readdirSync(DIR)) {
  const path = `${DIR}/${f}`
  const records = JSON.parse(readFileSync(path, 'utf8'))
  let changed = 0
  for (const r of records) {
    const out = []
    for (const s of r.sources) {
      if (!(s.url in fixes)) { out.push(s); continue }
      changed++
      const fix = fixes[s.url]
      if (fix && !out.some((o) => o.url === fix.url)) out.push(fix)
    }
    r.sources = out
    if (out.length === 0) console.log(`NO SOURCES LEFT: ${f} ${r.id}`)
  }
  if (changed) { writeFileSync(path, JSON.stringify(records, null, 2) + '\n'); console.log(`${f}: ${changed} fixed`) }
}
