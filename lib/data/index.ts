// Typed access to the curated datasets. The JSON files are built from lib/data/parts
// by scripts/merge-parts.mjs and checked by scripts/validate-data.mjs.
import type { Condition, Myth, Symptom } from './types'
import symptomsJson from './symptoms.json'
import mythsJson from './myths.json'
import conditionsJson from './conditions.json'

export * from './types'

export const symptoms = symptomsJson as Symptom[]
export const myths = mythsJson as Myth[]
export const conditions = conditionsJson as Condition[]
