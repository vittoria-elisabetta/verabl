export type Myth = {
  id: string
  category: string
  myth: string
  fact: string
  sources: { label: string; url: string }[]
  lastReviewed: string
}

export const myths: Myth[] = [
  {
    id: 'lemon-water-cancer',
    category: 'Cancer',
    myth: 'Drinking lemon water cures cancer.',
    fact: 'A healthy diet supports overall wellbeing, but there is no scientific evidence that lemon water cures or prevents cancer. Cancer requires diagnosis and treatment guided by qualified oncologists.',
    lastReviewed: 'Source links checked November 2026',
    sources: [
      { label: 'World Health Organization — Cancer', url: 'https://www.who.int/news-room/fact-sheets/detail/cancer' },
      { label: 'National Cancer Institute', url: 'https://www.cancer.gov/' },
    ],
  },
  {
    id: 'vaccines-immune',
    category: 'Vaccines',
    myth: 'Vaccines weaken your immune system.',
    fact: 'Vaccines train your immune system to recognise specific pathogens. They strengthen your body\u2019s defences rather than weakening them, and are among the most studied medical interventions in history.',
    lastReviewed: 'Source links checked November 2026',
    sources: [
      { label: 'WHO — Vaccines and immunization', url: 'https://www.who.int/health-topics/vaccines-and-immunization' },
      { label: 'CDC — Vaccine safety', url: 'https://www.cdc.gov/vaccine-safety/' },
    ],
  },
  {
    id: 'antibiotics-viral',
    category: 'Infections',
    myth: 'Antibiotics can treat colds and the flu.',
    fact: 'Colds and flu are caused by viruses, and antibiotics only work against bacteria. Taking antibiotics for viral infections is ineffective and fuels antibiotic resistance.',
    lastReviewed: 'Source links checked November 2026',
    sources: [
      { label: 'WHO — Antimicrobial resistance', url: 'https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance' },
      { label: 'CDC — Antibiotic use', url: 'https://www.cdc.gov/antibiotic-use/' },
    ],
  },
  {
    id: 'detox-teas',
    category: 'Nutrition',
    myth: 'Detox teas flush toxins out of your body.',
    fact: 'Your liver and kidneys already remove waste efficiently. "Detox" products are not proven to remove toxins and some can cause dehydration or digestive harm.',
    lastReviewed: 'Source links checked November 2026',
    sources: [
      { label: 'NIH — "Detoxes" and cleanses', url: 'https://www.nccih.nih.gov/health/detoxes-and-cleanses-what-you-need-to-know' },
    ],
  },
  {
    id: 'natural-safe',
    category: 'Supplements',
    myth: 'If it\u2019s natural, it\u2019s automatically safe.',
    fact: '"Natural" does not mean risk-free. Many plants and supplements interact with medications or can be toxic in large doses. Always check with a pharmacist or doctor.',
    lastReviewed: 'Source links checked November 2026',
    sources: [
      { label: 'NIH — Dietary supplements', url: 'https://ods.od.nih.gov/HealthInformation/' },
    ],
  },
  {
    id: 'crack-knuckles',
    category: 'Bones & joints',
    myth: 'Cracking your knuckles causes arthritis.',
    fact: 'Research has found no link between habitual knuckle cracking and arthritis. The sound comes from gas bubbles in the joint fluid, not damage.',
    lastReviewed: 'Source links checked November 2026',
    sources: [
      { label: 'Harvard Health', url: 'https://www.health.harvard.edu/' },
    ],
  },
]
