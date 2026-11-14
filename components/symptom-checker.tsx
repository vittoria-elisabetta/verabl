'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  RotateCcw,
  Check,
  ShieldAlert,
  Stethoscope,
  Siren,
  Leaf,
  ExternalLink,
  Phone,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Disclaimer } from '@/components/disclaimer'
import { saveSearch } from '@/lib/user-store'
import { symptoms, BODY_AREAS, type Symptom } from '@/lib/data'
import { rank } from '@/lib/search'

// Guided symptom check, fully rule-based:
//   any red flag ticked              -> emergency
//   any urgent flag ticked           -> urgent (see a doctor today)
//   lasted longer than the symptom's self-care window, severe,
//   or person in a higher-risk group -> see a doctor
//   otherwise                        -> self-care
// Thresholds come from each symptom record in lib/data/symptoms.json.

type Urgency = 'emergency' | 'urgent' | 'see-a-doctor' | 'self-care'
type Step = 'input' | 'questions' | 'result'

const DURATIONS = [
  { label: 'Less than a day', days: 0 },
  { label: '1 to 3 days', days: 3 },
  { label: '4 to 7 days', days: 7 },
  { label: '1 to 3 weeks', days: 21 },
  { label: 'More than 3 weeks', days: 30 },
] as const

const SEVERITIES = ['Mild', 'Moderate', 'Severe – it stops me doing normal activities'] as const

const RISK_GROUPS = [
  'None of these',
  'Under 5 years old',
  'Pregnant',
  'Aged 65 or over',
  'Long-term condition or weakened immune system',
] as const

const NONE = 'None of these'

const urgencyMeta = {
  emergency: {
    label: 'Get emergency help now',
    icon: Phone,
    className: 'bg-destructive text-white border-destructive',
    summary:
      'You ticked a warning sign that can mean a serious problem. Call your local emergency number (such as 911, 999 or 112) or go to the nearest emergency department now. Do not wait for symptoms to get worse.',
  },
  urgent: {
    label: 'See a doctor today',
    icon: Siren,
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    summary:
      'Your answers suggest this should be checked by a doctor today. Contact your doctor for an urgent appointment, an urgent care centre, or a non-emergency medical helpline (such as NHS 111 in the UK). If things get worse, call your local emergency number.',
  },
  'see-a-doctor': {
    label: 'Book a doctor appointment',
    icon: Stethoscope,
    className: 'bg-warning/10 text-warning-foreground border-warning/40',
    summary:
      'Nothing you described needs emergency care, but your answers suggest it is worth booking an appointment with a doctor so they can check it properly.',
  },
  'self-care': {
    label: 'Likely manageable at home',
    icon: Leaf,
    className: 'bg-success/10 text-success border-success/30',
    summary:
      'From your answers, this can usually be looked after at home for now. Keep an eye on it, and get help if it lasts, gets worse or any warning sign appears.',
  },
} as const

type Answers = {
  redFlags: string[]
  urgentFlags: string[]
  durationDays: number | null
  severity: string | null
  riskGroup: string | null
}

const emptyAnswers: Answers = { redFlags: [], urgentFlags: [], durationDays: null, severity: null, riskGroup: null }

/** Answers + symptom record -> urgency level. */
function decide(symptom: Symptom, a: Answers): Urgency {
  if (a.redFlags.some((f) => f !== NONE)) return 'emergency'
  if (a.urgentFlags.some((f) => f !== NONE)) return 'urgent'
  if (symptom.selfCareMaxDays === 0) return 'see-a-doctor'
  if ((a.durationDays ?? 0) > symptom.selfCareMaxDays) return 'see-a-doctor'
  if (a.severity === SEVERITIES[2]) return 'see-a-doctor'
  if (a.riskGroup && a.riskGroup !== NONE) return 'see-a-doctor'
  return 'self-care'
}

function findSymptoms(query: string) {
  return rank(
    query,
    symptoms,
    (s) => [
      { text: s.name, weight: 3, phrase: true },
      ...s.aliases.map((alias) => ({ text: alias, weight: 2, phrase: true })),
    ],
    0.8,
    'best',
  )
}

export function SymptomChecker() {
  const params = useSearchParams()
  const [step, setStep] = useState<Step>('input')
  const [query, setQuery] = useState('')
  const [area, setArea] = useState<string | null>(null)
  const [symptom, setSymptom] = useState<Symptom | null>(null)
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)

  useEffect(() => {
    const q = params.get('q')
    if (q) setQuery(q)
  }, [params])

  const matches = useMemo(() => (query.trim() ? findSymptoms(query).slice(0, 8).map((m) => m.item) : []), [query])
  const areaList = useMemo(
    () => (area ? symptoms.filter((s) => s.bodyArea === area).sort((a, b) => a.name.localeCompare(b.name)) : []),
    [area],
  )

  function choose(s: Symptom) {
    setSymptom(s)
    setAnswers(emptyAnswers)
    setStep('questions')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setStep('input')
    setQuery('')
    setArea(null)
    setSymptom(null)
    setAnswers(emptyAnswers)
  }

  function toggle(list: 'redFlags' | 'urgentFlags', item: string) {
    setAnswers((prev) => {
      const current = prev[list]
      let next: string[]
      if (item === NONE) next = current.includes(NONE) ? [] : [NONE]
      else next = current.includes(item) ? current.filter((x) => x !== item) : [...current.filter((x) => x !== NONE), item]
      return { ...prev, [list]: next }
    })
  }

  // An emergency answer ends the questions straight away.
  const emergencyNow = answers.redFlags.some((f) => f !== NONE)
  const complete =
    emergencyNow ||
    (answers.redFlags.length > 0 &&
      answers.urgentFlags.length > 0 &&
      answers.durationDays !== null &&
      answers.severity !== null &&
      answers.riskGroup !== null)

  function showResult() {
    if (!symptom || !complete) return
    const urgency = decide(symptom, answers)
    saveSearch({ type: 'symptom', query: symptom.name, summary: urgencyMeta[urgency].label })
    setStep('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <Disclaimer className="mb-6" />

      {step === 'input' && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <label htmlFor="concern" className="font-display text-lg font-semibold text-foreground">
            What are you experiencing?
          </label>
          <p className="mt-1 text-sm text-muted-foreground">
            Type a symptom, such as &ldquo;headache&rdquo;, &ldquo;sore throat&rdquo; or &ldquo;tummy ache&rdquo;, or browse by body
            area. {symptoms.length} symptoms covered.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-1">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              id="concern"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setArea(null)
              }}
              placeholder="Describe a symptom..."
              autoComplete="off"
              className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          {query.trim() && (
            <div className="mt-3">
              {matches.length > 0 ? (
                <SymptomList items={matches} onChoose={choose} />
              ) : (
                <p className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  We could not find that symptom. Try different words, or browse by body area below. If you feel very
                  unwell, call your local emergency number.
                </p>
              )}
            </div>
          )}

          <p className="mt-6 text-sm font-medium text-foreground">Browse by body area</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BODY_AREAS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setArea(area === a ? null : a)
                  setQuery('')
                }}
                aria-pressed={area === a}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  area === a
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-muted'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          {area && (
            <div className="mt-3">
              <SymptomList items={areaList} onChoose={choose} />
            </div>
          )}
        </div>
      )}

      {step === 'questions' && symptom && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">{symptom.name}: a few quick questions</h2>
            <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <RotateCcw className="size-4" aria-hidden="true" />
              Start over
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{symptom.summary}</p>

          <div className="mt-6 space-y-7">
            <Checklist
              legend="Do you have any of these right now?"
              items={symptom.redFlags}
              selected={answers.redFlags}
              onToggle={(item) => toggle('redFlags', item)}
              danger
            />
            {emergencyNow ? (
              <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                This can be a sign of something serious. Call your local emergency number (such as 911, 999 or 112) now.
              </p>
            ) : (
              <>
                <Checklist
                  legend="Do you have any of these?"
                  items={symptom.urgentFlags}
                  selected={answers.urgentFlags}
                  onToggle={(item) => toggle('urgentFlags', item)}
                />
                <Choice
                  legend="How long have you had it?"
                  options={DURATIONS.map((d) => d.label)}
                  value={DURATIONS.find((d) => d.days === answers.durationDays)?.label ?? null}
                  onChange={(label) =>
                    setAnswers((p) => ({ ...p, durationDays: DURATIONS.find((d) => d.label === label)!.days }))
                  }
                />
                <Choice
                  legend="How bad is it?"
                  options={[...SEVERITIES]}
                  value={answers.severity}
                  onChange={(v) => setAnswers((p) => ({ ...p, severity: v }))}
                />
                <Choice
                  legend="Does any of these apply to the person with the symptom?"
                  options={[...RISK_GROUPS]}
                  value={answers.riskGroup}
                  onChange={(v) => setAnswers((p) => ({ ...p, riskGroup: v }))}
                />
              </>
            )}
          </div>

          <Button onClick={showResult} size="lg" disabled={!complete} className="mt-7 w-full rounded-full">
            See guidance
          </Button>
        </div>
      )}

      {step === 'result' && symptom && <ResultView symptom={symptom} answers={answers} onReset={reset} />}
    </div>
  )
}

function SymptomList({ items, onChoose }: { items: Symptom[]; onChoose: (s: Symptom) => void }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
      {items.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => onChoose(s)}
            className="flex w-full items-center justify-between gap-3 bg-background px-4 py-3 text-left hover:bg-muted"
          >
            <span>
              <span className="block text-sm font-medium text-foreground">{s.name}</span>
              <span className="block text-xs text-muted-foreground">{s.bodyArea}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )
}

function Checklist({
  legend,
  items,
  selected,
  onToggle,
  danger = false,
}: {
  legend: string
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
  danger?: boolean
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <p className="text-xs text-muted-foreground">Tick all that apply.</p>
      <div className="mt-2.5 space-y-2">
        {[...items, NONE].map((item) => {
          const on = selected.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              aria-pressed={on}
              className={`flex w-full items-start gap-2.5 rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
                on
                  ? danger && item !== NONE
                    ? 'border-destructive bg-destructive/10 text-foreground'
                    : 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
                  on ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                }`}
              >
                {on && <Check className="size-3" aria-hidden="true" />}
              </span>
              {item}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function Choice({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string
  options: string[]
  value: string | null
  onChange: (v: string) => void
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              {on && <Check className="size-3.5" aria-hidden="true" />}
              {opt}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function ResultView({ symptom, answers, onReset }: { symptom: Symptom; answers: Answers; onReset: () => void }) {
  const urgency = decide(symptom, answers)
  const meta = urgencyMeta[urgency]
  const flagged = [...answers.redFlags, ...answers.urgentFlags].filter((f) => f !== NONE)
  const reasons: string[] = []
  if (urgency === 'see-a-doctor') {
    if (symptom.selfCareMaxDays === 0) reasons.push(`${symptom.name} should always be checked by a doctor.`)
    if ((answers.durationDays ?? 0) > symptom.selfCareMaxDays && symptom.selfCareMaxDays > 0)
      reasons.push(`It has lasted longer than ${symptom.selfCareMaxDays} day${symptom.selfCareMaxDays === 1 ? '' : 's'}.`)
    if (answers.severity === SEVERITIES[2]) reasons.push('It is severe enough to affect normal activities.')
    if (answers.riskGroup && answers.riskGroup !== NONE) reasons.push(`The person is in a higher-risk group (${answers.riskGroup.toLowerCase()}).`)
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
            <meta.icon className="size-3.5" aria-hidden="true" />
            {meta.label}
          </span>
          <button onClick={onReset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <RotateCcw className="size-4" aria-hidden="true" />
            New check
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">About: {symptom.name}</p>
        <p className="mt-3 text-pretty leading-relaxed text-foreground">{meta.summary}</p>
        {flagged.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">You ticked:</p>
            <List items={flagged} />
          </div>
        )}
        {reasons.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Why:</p>
            <List items={reasons} />
          </div>
        )}
      </div>

      {urgency !== 'emergency' && (
        <>
          <ResultBlock title="Common causes" tone="neutral">
            <p className="mb-3 text-xs text-muted-foreground">Possibilities only, not a diagnosis. Most common first.</p>
            <ul className="space-y-3">
              {symptom.commonCauses.map((item) => (
                <li key={item.title}>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                </li>
              ))}
            </ul>
          </ResultBlock>

          <div className="grid gap-5 sm:grid-cols-2">
            <ResultBlock title="What you can do" tone="success" icon={Check}>
              <List items={symptom.selfCare} />
            </ResultBlock>
            <ResultBlock title="What to avoid" tone="destructive" icon={ShieldAlert}>
              <List items={symptom.avoid} />
            </ResultBlock>
          </div>

          <ResultBlock title="See a doctor if" tone="warning" icon={Stethoscope}>
            <List items={symptom.seeDoctorIf} />
          </ResultBlock>
        </>
      )}

      <ResultBlock title="Get emergency help if" tone="destructive" icon={Siren}>
        <List items={symptom.redFlags} />
      </ResultBlock>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Sources</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {symptom.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <Disclaimer />
    </div>
  )
}

const toneMap = {
  neutral: 'border-border',
  success: 'border-success/30',
  destructive: 'border-destructive/30',
  warning: 'border-warning/40',
} as const

const iconTone = {
  neutral: 'text-primary',
  success: 'text-success',
  destructive: 'text-destructive',
  warning: 'text-warning',
} as const

function ResultBlock({
  title,
  tone,
  icon: Icon,
  children,
}: {
  title: string
  tone: keyof typeof toneMap
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-3xl border bg-card p-6 shadow-sm ${toneMap[tone]}`}>
      <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
        {Icon && <Icon className={`size-4 ${iconTone[tone]}`} aria-hidden="true" />}
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current opacity-40" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}
