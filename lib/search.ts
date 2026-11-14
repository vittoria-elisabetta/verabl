// Deterministic, in-browser text matching for the symptom and fact checkers.
// No AI: text is lower-cased, split into words, stop words removed and words
// reduced to a crude stem, then records are scored by weighted word and phrase overlap.

const STOP_WORDS = new Set(
  (
    'a an the and or but if of to in on at by for with from about into over after before is are was were be been being ' +
    'am do does did have has had i me my we our you your he she it its they them their this that these those there here ' +
    'what which who whom how why when where can could should would will shall may might must not no yes so than too very ' +
    'just also really saw seen heard read said says say someone people video post told online tiktok facebook instagram ' +
    'whatsapp youtube twitter friend group chat message claim true false fact myth that\'s it\'s is it does get got make makes ' +
    'feel feeling feels like lot lots thing things one any all some much many more most'
  ).split(/\s+/),
)

/** Reduce an English word to a rough stem so "vaccines", "vaccinated" and "vaccine" meet. */
function stem(word: string): string {
  let w = word
  for (const suffix of ['ations', 'ation', 'ings', 'ing', 'edly', 'ed', 'ies', 'es', 's', 'ly']) {
    if (w.length > suffix.length + 3 && w.endsWith(suffix)) {
      w = w.slice(0, -suffix.length)
      break
    }
  }
  return w
}

/** Text -> list of stemmed content words. */
export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .map(stem)
}

export type Field = { text: string; weight: number; phrase?: boolean }

/**
 * Score one record for a query.
 * Each field contributes weight * (share of its words found in the query) for multi-word phrases,
 * or weight per query word it contains. A whole phrase appearing verbatim in the query gets a bonus.
 */
export function score(queryText: string, fields: Field[]): number {
  const q = tokens(queryText)
  if (q.length === 0) return 0
  const qSet = new Set(q)
  const qJoined = ' ' + q.join(' ') + ' '
  let total = 0
  for (const f of fields) {
    const ft = tokens(f.text)
    if (ft.length === 0) continue
    if (f.phrase) {
      // Keyword / alias phrase: reward if all of its words are in the query, partial credit otherwise.
      const hit = ft.filter((t) => qSet.has(t)).length
      if (hit === 0) continue
      const share = hit / ft.length
      total += f.weight * (share === 1 ? 1 : share * 0.4)
      if (ft.length > 1 && qJoined.includes(' ' + ft.join(' ') + ' ')) total += f.weight * 0.5
    } else {
      // Free text (e.g. the myth sentence): fraction of query words it covers.
      const fSet = new Set(ft)
      const hit = q.filter((t) => fSet.has(t)).length
      total += f.weight * (hit / q.length)
    }
  }
  return total
}

/** Rank records by score, best first, dropping those under minScore. */
export function rank<T>(queryText: string, records: T[], fieldsOf: (r: T) => Field[], minScore: number): { item: T; score: number }[] {
  return records
    .map((item) => ({ item, score: score(queryText, fieldsOf(item)) }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
}
