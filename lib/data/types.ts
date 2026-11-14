// Shared types for the curated health datasets in lib/data/*.json.
// Every record is hand-curated and links to reputable public sources.
// No content on this site is generated at request time.

export type Source = { label: string; url: string }

export const BODY_AREAS = [
  'Head & brain',
  'Eyes',
  'Ears, nose & throat',
  'Mouth & teeth',
  'Chest, heart & lungs',
  'Stomach & digestion',
  'Urinary & kidneys',
  'Sexual & reproductive health',
  'Skin, hair & nails',
  'Muscles, bones & joints',
  'Mental health & sleep',
  'Whole body',
  'Babies & children',
] as const
export type BodyArea = (typeof BODY_AREAS)[number]

export type Symptom = {
  id: string // kebab-case, unique
  name: string // "Headache"
  aliases: string[] // lay phrases used for search: "head hurts", "head pain"
  bodyArea: BodyArea
  summary: string // 1-2 plain-language sentences
  redFlags: string[] // any present now => emergency (call emergency number / A&E)
  urgentFlags: string[] // any present => see a doctor today / urgent care
  commonCauses: { title: string; detail: string }[] // possibilities, never a diagnosis
  selfCare: string[]
  avoid: string[]
  seeDoctorIf: string[] // routine appointment triggers
  selfCareMaxDays: number // lasting longer than this => see a doctor
  sources: Source[]
}

export const MYTH_CATEGORIES = [
  'Nutrition',
  'Supplements',
  'Vaccines',
  'Infections & colds',
  'Cancer',
  'Heart & blood pressure',
  'Diabetes',
  'Mental health',
  'Sleep',
  'Exercise & fitness',
  'Weight',
  'Skin & hair',
  'Pregnancy & fertility',
  "Children's health",
  'Medicines & antibiotics',
  "Women's health",
  "Men's health",
  'Eyes & vision',
  'Teeth & mouth',
  'First aid',
  'Ageing & brain',
  'Bones & joints',
  'Allergies & asthma',
  'Digestion',
] as const
export type MythCategory = (typeof MYTH_CATEGORIES)[number]

export type Rating = 'true' | 'mostly-true' | 'misleading' | 'false'

export type Myth = {
  id: string
  category: MythCategory
  myth: string // the claim as people say it
  rating: Rating
  fact: string // what the evidence says, 1-3 sentences
  explanation: string // extra context, 2-4 sentences
  keywords: string[] // lower-case words/phrases used by the fact checker
  sources: Source[]
  lastReviewed: string
}

export const CONDITION_CATEGORIES = [
  'Infections',
  'Heart & circulation',
  'Lungs & breathing',
  'Digestive system',
  'Hormones & metabolism',
  'Brain & nerves',
  'Mental health',
  'Skin',
  'Bones, joints & muscles',
  'Kidneys & urinary',
  'Sexual & reproductive health',
  'Eyes & ears',
  'Blood & immune system',
  'Cancer',
  'Children',
] as const
export type ConditionCategory = (typeof CONDITION_CATEGORIES)[number]

export type Condition = {
  id: string
  name: string
  aliases: string[]
  category: ConditionCategory
  overview: string // 2-3 sentences
  symptoms: string[]
  causes: string[]
  riskFactors: string[]
  diagnosis: string // 1-2 sentences on how it is usually diagnosed
  treatment: string[] // general approaches, no doses
  selfCare: string[]
  prevention: string[]
  whenToSeeDoctor: string[]
  emergencySigns: string[]
  contagious: boolean
  sources: Source[]
}
