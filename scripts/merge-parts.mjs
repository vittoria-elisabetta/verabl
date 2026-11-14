// Merges lib/data/parts/<dataset>.part*.json into lib/data/<dataset>.json.
// Duplicate ids: first occurrence wins (parts are read in file-name order), and each drop is reported.
// Usage: node scripts/merge-parts.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const DIR = 'lib/data/parts'
for (const dataset of ['symptoms', 'myths', 'conditions']) {
  const files = readdirSync(DIR).filter((f) => f.startsWith(dataset + '.part') && f.endsWith('.json')).sort()
  const byId = new Map()
  for (const f of files) {
    for (const r of JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'))) {
      if (byId.has(r.id)) console.log(`${dataset}: duplicate id ${r.id} in ${f} dropped`)
      else byId.set(r.id, r)
    }
  }
  const records = [...byId.values()].sort((a, b) => (a.name ?? a.myth).localeCompare(b.name ?? b.myth))
  writeFileSync(`lib/data/${dataset}.json`, JSON.stringify(records, null, 1) + '\n')
  console.log(`${dataset}: ${records.length} records from ${files.length} files`)
}
