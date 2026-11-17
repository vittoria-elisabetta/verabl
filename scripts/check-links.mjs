// Checks every source URL in lib/data/*.json (or given files) and lists the broken ones.
// A link is OK if a GET (following redirects) ends in HTTP 2xx. 403/429 are reported separately:
// some publishers block automated clients, so those need a manual look rather than removal.
// Usage: node scripts/check-links.mjs [file ...]   -> writes scripts/link-report.json
import { readFileSync, writeFileSync } from 'node:fs'

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['lib/data/symptoms.json', 'lib/data/myths.json', 'lib/data/conditions.json']
const CONCURRENCY = 3 // low, so publishers (www.nhs.uk) do not rate-limit the check
const TIMEOUT_MS = 20000
const UA = 'VerablLinkChecker/1.0 (+https://github.com)' // honest client name; sites that block bots show up as 'blocked'

const urls = new Map() // url -> [record ids]
for (const f of files) {
  for (const r of JSON.parse(readFileSync(f, 'utf8'))) {
    for (const s of r.sources ?? []) urls.set(s.url, [...(urls.get(s.url) ?? []), r.id])
  }
}

async function check(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA, Accept: 'text/html' }, signal: AbortSignal.timeout(TIMEOUT_MS) })
      await res.body?.cancel()
      return { status: res.status, finalUrl: res.url }
    } catch (e) {
      if (attempt === 1) return { status: 0, error: String(e.cause?.code ?? e.name) }
    }
  }
}

const list = [...urls.keys()]
const results = {}
let next = 0
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < list.length) {
      const url = list[next++]
      results[url] = await check(url)
    }
  }),
)

const broken = list.filter((u) => results[u].status === 404 || results[u].status === 410 || results[u].status === 0)
const blocked = list.filter((u) => [401, 403, 429].includes(results[u].status) || results[u].status >= 500)
const ok = list.filter((u) => results[u].status >= 200 && results[u].status < 300)
const report = list.map((u) => ({ url: u, ...results[u], usedBy: urls.get(u) }))
writeFileSync('scripts/link-report.json', JSON.stringify(report, null, 1))
console.log(`${list.length} unique URLs: ${ok.length} ok, ${broken.length} broken, ${blocked.length} blocked/server error`)
for (const u of broken) console.log(`BROKEN ${results[u].status || results[u].error} ${u}  <- ${urls.get(u).slice(0, 3).join(', ')}`)
for (const u of blocked) console.log(`BLOCKED ${results[u].status} ${u}`)
