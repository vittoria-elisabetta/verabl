// Validates the curated datasets in lib/data/*.json against the shapes in lib/data/types.ts.
// Usage: node scripts/validate-data.mjs [file ...]   (default: all dataset files)
// Exits 1 on any error. Checks required fields, types, enums, unique ids, URL hosts.
import { readFileSync, existsSync } from 'node:fs'
import { basename } from 'node:path'

const typesSrc = readFileSync(new URL('../lib/data/types.ts', import.meta.url), 'utf8')
const constList = (name) => {
  const m = typesSrc.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`))
  return [...m[1].matchAll(/(['"])(.*?)\1,/g)].map((x) => x[2])
}
const BODY_AREAS = constList('BODY_AREAS')
const MYTH_CATEGORIES = constList('MYTH_CATEGORIES')
const CONDITION_CATEGORIES = constList('CONDITION_CATEGORIES')
const RATINGS = ['true', 'mostly-true', 'misleading', 'false']

// Sources must come from reputable public-health / clinical publishers.
const ALLOWED_HOSTS = [
  'www.nhs.uk', 'www.nhsinform.scot', 'medlineplus.gov', 'www.cdc.gov', 'www.who.int', 'www.nih.gov',
  'ods.od.nih.gov', 'www.niddk.nih.gov', 'www.nimh.nih.gov', 'www.nia.nih.gov', 'www.nhlbi.nih.gov',
  'www.cancer.gov', 'www.niaid.nih.gov', 'www.ninds.nih.gov', 'www.nei.nih.gov', 'www.nccih.nih.gov',
  'www.nidcd.nih.gov', 'www.niams.nih.gov', 'www.nichd.nih.gov', 'www.nidcr.nih.gov', 'www.fda.gov',
  'www.mayoclinic.org', 'my.clevelandclinic.org', 'www.health.harvard.edu', 'www.hopkinsmedicine.org',
  'www.healthychildren.org', 'www.heart.org', 'www.cancer.org', 'diabetes.org', 'www.aao.org',
  'www.aad.org', 'www.ada.org', 'www.mouthhealthy.org', 'www.acog.org', 'www.redcross.org', 'www.sleepfoundation.org',
]

const errors = []
const err = (file, id, msg) => errors.push(`${file} [${id}] ${msg}`)
const isStr = (v) => typeof v === 'string' && v.trim().length > 0
const isStrArr = (v, min = 1) => Array.isArray(v) && v.length >= min && v.every(isStr)
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

function checkSources(file, id, sources) {
  if (!Array.isArray(sources) || sources.length < 1) return err(file, id, 'sources: need >= 1')
  for (const s of sources) {
    if (!isStr(s?.label) || !isStr(s?.url)) { err(file, id, 'source needs label + url'); continue }
    let u
    try { u = new URL(s.url) } catch { err(file, id, `bad url ${s.url}`); continue }
    if (u.protocol !== 'https:') err(file, id, `non-https url ${s.url}`)
    if (!ALLOWED_HOSTS.includes(u.host)) err(file, id, `host not in allow-list: ${u.host}`)
  }
}

const SPEC = {
  'symptoms.json': (r, f) => {
    for (const k of ['name', 'summary']) if (!isStr(r[k])) err(f, r.id, `${k} missing`)
    if (!BODY_AREAS.includes(r.bodyArea)) err(f, r.id, `bad bodyArea ${r.bodyArea}`)
    if (!isStrArr(r.aliases, 2)) err(f, r.id, 'aliases: need >= 2 strings')
    if (!isStrArr(r.redFlags, 1)) err(f, r.id, 'redFlags: need >= 1')
    if (!isStrArr(r.urgentFlags, 1)) err(f, r.id, 'urgentFlags: need >= 1')
    if (!Array.isArray(r.commonCauses) || r.commonCauses.length < 2 || !r.commonCauses.every((c) => isStr(c?.title) && isStr(c?.detail)))
      err(f, r.id, 'commonCauses: need >= 2 {title, detail}')
    for (const k of ['selfCare', 'avoid', 'seeDoctorIf']) if (!isStrArr(r[k], 2)) err(f, r.id, `${k}: need >= 2`)
    if (!Number.isInteger(r.selfCareMaxDays) || r.selfCareMaxDays < 0 || r.selfCareMaxDays > 60) err(f, r.id, 'selfCareMaxDays: int 0..60')
  },
  'myths.json': (r, f) => {
    for (const k of ['myth', 'fact', 'explanation', 'lastReviewed']) if (!isStr(r[k])) err(f, r.id, `${k} missing`)
    if (!MYTH_CATEGORIES.includes(r.category)) err(f, r.id, `bad category ${r.category}`)
    if (!RATINGS.includes(r.rating)) err(f, r.id, `bad rating ${r.rating}`)
    if (!isStrArr(r.keywords, 3)) err(f, r.id, 'keywords: need >= 3')
    else if (r.keywords.some((k) => k !== k.toLowerCase())) err(f, r.id, 'keywords must be lower-case')
  },
  'conditions.json': (r, f) => {
    for (const k of ['name', 'overview', 'diagnosis']) if (!isStr(r[k])) err(f, r.id, `${k} missing`)
    if (!CONDITION_CATEGORIES.includes(r.category)) err(f, r.id, `bad category ${r.category}`)
    if (!Array.isArray(r.aliases) || !r.aliases.every(isStr)) err(f, r.id, 'aliases: string[]')
    for (const k of ['symptoms', 'causes', 'treatment', 'whenToSeeDoctor']) if (!isStrArr(r[k], 2)) err(f, r.id, `${k}: need >= 2`)
    for (const k of ['riskFactors', 'selfCare', 'prevention', 'emergencySigns'])
      if (!Array.isArray(r[k]) || !r[k].every(isStr)) err(f, r.id, `${k}: string[]`)
    if (typeof r.contagious !== 'boolean') err(f, r.id, 'contagious: boolean')
  },
}

// Accept part files (e.g. symptoms.part1.json) and validate them with the base spec.
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['lib/data/symptoms.json', 'lib/data/myths.json', 'lib/data/conditions.json']
const counts = {}
for (const path of files) {
  if (!existsSync(path)) { errors.push(`${path}: missing`); continue }
  const f = basename(path)
  const specKey = f.replace(/\.part[A-Za-z0-9-]+\.json$/, '.json')
  const check = SPEC[specKey]
  if (!check) { errors.push(`${f}: unknown dataset`); continue }
  let data
  try { data = JSON.parse(readFileSync(path, 'utf8')) } catch (e) { errors.push(`${f}: invalid JSON ${e.message}`); continue }
  if (!Array.isArray(data)) { errors.push(`${f}: top level must be an array`); continue }
  const seen = new Set()
  for (const r of data) {
    if (!isStr(r?.id) || !KEBAB.test(r.id)) { err(f, r?.id, 'id must be kebab-case'); continue }
    if (seen.has(r.id)) err(f, r.id, 'duplicate id')
    seen.add(r.id)
    check(r, f)
    checkSources(f, r.id, r.sources)
  }
  counts[f] = data.length
}
console.log('records:', counts)
if (errors.length) {
  console.log(`${errors.length} error(s):\n` + errors.slice(0, 200).join('\n'))
  process.exit(1)
}
console.log('OK')
