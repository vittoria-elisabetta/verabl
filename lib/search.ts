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

/**
 * Reduce an English word to a rough stem so singular/plural and simple verb forms meet:
 * "vaccines"/"vaccine" -> "vaccin", "glasses"/"glass" -> "glass", "allergies"/"allergy" -> "allergi",
 * "cracking"/"crack" -> "crack". Words of 3 letters or fewer are left alone.
 */
function stem(word: string): string {
  let w = word
  for (const suffix of ['ations', 'ation', 'ings', 'ing', 'edly', 'ed', 'ly']) {
    if (w.length > suffix.length + 3 && w.endsWith(suffix)) {
      w = w.slice(0, -suffix.length)
      break
    }
  }
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1)
  if (w.length > 3 && w.endsWith('e')) w = w.slice(0, -1)
  if (w.length > 3 && w.endsWith('y')) w = w.slice(0, -1) + 'i'
  return w
}

/** Text -> list of stemmed content words. */
export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '') // "can't" -> "cant", so it is one word either way it is typed
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
//
// mode 'sum' (fact checker): field scores add up, so a claim matching several distinct keywords wins.
// mode 'best' (names + aliases of one thing, e.g. a symptom): only the best single field counts, scaled
// by the share of the query's words it covers. Otherwise a record with many similar aliases ("cough",
// "coughing", "chesty cough") would outrank the record that matches the whole query ("coughing up blood").
export function score(queryText: string, fields: Field[], mode: 'sum' | 'best' = 'sum'): number {
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
      const share = hit / ft.length // share of the field's words found in the query
      const bonus = ft.length > 1 && qJoined.includes(' ' + ft.join(' ') + ' ') ? f.weight * 0.5 : 0
      if (mode === 'best') {
        // coverage: share of the query's words found in the field. "chest pain" fully covered by the
        // name "Chest pain or tightness" (coverage 1, share 2/3) scores 0.83 * weight.
        const fSet = new Set(ft)
        const coverage = q.filter((t) => fSet.has(t)).length / q.length
        total = Math.max(total, f.weight * coverage * (0.5 + 0.5 * share) + bonus)
      } else {
        total += f.weight * (share === 1 ? 1 : share * 0.4) + bonus
      }
    } else {
      // Free text (e.g. the myth sentence): fraction of query words it covers.
      const fSet = new Set(ft)
      const hit = q.filter((t) => fSet.has(t)).length
      const s = f.weight * (hit / q.length)
      total = mode === 'best' ? Math.max(total, s) : total + s
    }
  }
  return total
}

/** Rank records by score, best first, dropping those under minScore. */
export function rank<T>(
  queryText: string,
  records: T[],
  fieldsOf: (r: T) => Field[],
  minScore: number,
  mode: 'sum' | 'best' = 'sum',
): { item: T; score: number }[] {
  return records
    .map((item) => ({ item, score: score(queryText, fieldsOf(item), mode) }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
}
