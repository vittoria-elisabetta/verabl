// Checks the fact checker's matching on realistic claim wording (run: node scripts/test-fact-matching.ts).
// Each positive case lists ids that are acceptable as the top match; negatives must not match.
import { rank } from '../lib/search.ts'
import myths from '../lib/data/myths.json' with { type: 'json' }

const MATCH = Number(process.env.MATCH ?? 4)
const RELATED = 2
const match = (q: string) =>
  rank(q, myths as any[], (m: any) => [{ text: m.myth, weight: 4 }, ...m.keywords.map((k: string) => ({ text: k, weight: 1.5, phrase: true }))], RELATED)

const pick = (re: RegExp) => (myths as any[]).filter((m) => re.test(m.id)).map((m) => m.id)
const positives: [string, string[]][] = [
  ['my aunt says the MMR jab causes autism', pick(/mmr|autism/)],
  ['vaccines make your immune system weaker', pick(/vaccines-immune/)],
  ['saw on tiktok that cracking knuckles gives you arthritis', pick(/knuckle/)],
  ['Antibiotics will clear up my cold faster', pick(/antibiotic/)],
  ['is it true that microwaving food causes cancer', pick(/microwave/)],
  ['put butter on a burn', pick(/burn/)],
  ['tilt your head back for a nosebleed', pick(/nosebleed/)],
  ['5G towers spread covid', pick(/5g|covid/)],
  ['reading in dim light ruins your eyesight', pick(/dim|light|read/)],
  ['carrots help you see in the dark', pick(/carrot/)],
  ['we only use 10 percent of our brain', pick(/brain|10/)],
  ['you cant get pregnant on your period', pick(/period|pregnan/)],
  ['sugar makes kids hyperactive', pick(/sugar|hyperactiv/)],
  ['apple cider vinegar cures diabetes', pick(/vinegar|diabetes/)],
  ['eating eggs raises your cholesterol', pick(/egg|cholesterol/)],
  ['detox tea flushes out toxins', pick(/detox/)],
  ['shaving makes hair grow back thicker', pick(/shav/)],
  ['you dont need sunscreen when its cloudy', pick(/sunscreen|cloud/)],
  ['feed a cold starve a fever', pick(/feed|starve|fever|cold/)],
  ['washing your hands with soap stops infections', pick(/hand/)],
  ['depression is just being weak', pick(/depress|weak/)],
  ['a glass of red wine is good for your heart', pick(/wine|alcohol|heart/)],
  ['colloidal silver kills viruses', pick(/silver/)],
  ['you need 8 glasses of water a day', pick(/water|glasses|8/)],
  ['going out with wet hair gives you a cold', pick(/wet|hair|cold/)],
]
const negatives = [
  'my car battery keeps dying',
  'the best pizza in new york',
  'how tall is the eiffel tower',
  'I have a doctor appointment tomorrow',
  'bitcoin will reach 200k next year',
  'my dog ate chocolate',
]

let pass = 0
for (const [q, ok] of positives) {
  const r = match(q)
  const top = r[0]
  const good = top && top.score >= MATCH && ok.includes(top.item.id)
  if (good) pass++
  console.log(`${good ? 'PASS' : 'FAIL'} ${top ? top.score.toFixed(2) : '-'} ${q} -> ${top?.item.id ?? 'none'}${good ? '' : `  (ok: ${ok.slice(0, 4).join(',')})`}`)
}
let negPass = 0
for (const q of negatives) {
  const top = match(q)[0]
  const good = !top || top.score < MATCH
  if (good) negPass++
  console.log(`${good ? 'PASS' : 'FAIL'} neg ${top ? top.score.toFixed(2) : '-'} ${q} -> ${top?.item.id ?? 'none'}`)
}
console.log(`positives ${pass}/${positives.length}, negatives ${negPass}/${negatives.length}`)
