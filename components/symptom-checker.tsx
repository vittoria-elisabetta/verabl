'use client'

import { useState } from 'react'
import {
  Search,
  Loader2,
  RotateCcw,
  Check,
  ShieldAlert,
  Stethoscope,
  Siren,
  Leaf,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Disclaimer } from '@/components/disclaimer'
import { saveSearch } from '@/lib/user-store'

type Question = { id: string; question: string; options: string[] }

type Result = {
  summary: string
  urgency: 'self-care' | 'see-a-doctor' | 'urgent'
  possibleExplanations: { title: string; detail: string }[]
  whatYouCanDo: string[]
  whatToAvoid: string[]
  whenToSeekHelp: string[]
}

type Step = 'input' | 'questions' | 'result'

const urgencyMeta = {
  'self-care': {
    label: 'Likely manageable at home',
    icon: Leaf,
    className: 'bg-success/10 text-success border-success/30',
  },
  'see-a-doctor': {
    label: 'Consider seeing a doctor',
    icon: Stethoscope,
    className: 'bg-warning/10 text-warning-foreground border-warning/40',
  },
  urgent: {
    label: 'Seek medical care promptly',
    icon: Siren,
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
} as const

export function SymptomChecker({ initialConcern = '' }: { initialConcern?: string }) {
  const [step, setStep] = useState<Step>('input')
  const [concern, setConcern] = useState(initialConcern)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function startCheck(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = concern.trim()
    if (!trimmed || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'questions', concern: trimmed }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'request failed')
      const data = payload
      setQuestions(data.questions ?? [])
      setAnswers({})
      setStep('questions')
    } catch {
      setError('We could not start the check. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function getResults() {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const payload = {
        stage: 'result',
        concern: concern.trim(),
        answers: questions.map((q) => ({ question: q.question, answer: answers[q.id] ?? 'Not sure' })),
      }
      const res = await fetch('/api/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()
      if (!res.ok) throw new Error(responseData.error || 'request failed')
      const data = responseData as Result
      setResult(data)
      setStep('result')
      saveSearch({ type: 'symptom', query: concern.trim(), summary: data.summary })
    } catch {
      setError('We could not generate results. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep('input')
    setConcern('')
    setQuestions([])
    setAnswers({})
    setResult(null)
    setError('')
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id])

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <Disclaimer className="mb-6" />

      {step === 'input' && (
        <form onSubmit={startCheck} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <label htmlFor="concern" className="font-display text-lg font-semibold text-foreground">
            What are you experiencing?
          </label>
          <p className="mt-1 text-sm text-muted-foreground">
            For example: &ldquo;I have a headache&rdquo; or &ldquo;my throat has been sore for two days&rdquo;.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-1">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              id="concern"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              placeholder="Describe a symptom or health concern..."
              className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" size="lg" disabled={loading || !concern.trim()} className="mt-4 w-full rounded-full">
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'Start guided check'}
          </Button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </form>
      )}

      {step === 'questions' && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">A few quick questions</h2>
            <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <RotateCcw className="size-4" aria-hidden="true" />
              Start over
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">About: &ldquo;{concern.trim()}&rdquo;</p>

          <div className="mt-6 space-y-6">
            {questions.map((q) => (
              <fieldset key={q.id}>
                <legend className="text-sm font-medium text-foreground">{q.question}</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                        aria-pressed={selected}
                      >
                        {selected && <Check className="size-3.5" aria-hidden="true" />}
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <Button onClick={getResults} size="lg" disabled={loading || !allAnswered} className="mt-6 w-full rounded-full">
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'See guidance'}
          </Button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      )}

      {step === 'result' && result && (
        <ResultView result={result} concern={concern.trim()} onReset={reset} />
      )}
    </div>
  )
}

function ResultView({ result, concern, onReset }: { result: Result; concern: string; onReset: () => void }) {
  const meta = urgencyMeta[result.urgency]
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
        <p className="mt-2 text-xs text-muted-foreground">About: &ldquo;{concern}&rdquo;</p>
        <p className="mt-3 text-pretty leading-relaxed text-foreground">{result.summary}</p>
      </div>

      <ResultBlock title="Possible explanations" tone="neutral">
        <ul className="space-y-3">
          {result.possibleExplanations.map((item) => (
            <li key={item.title}>
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>
      </ResultBlock>

      <div className="grid gap-5 sm:grid-cols-2">
        <ResultBlock title="What you can do" tone="success" icon={Check}>
          <List items={result.whatYouCanDo} />
        </ResultBlock>
        <ResultBlock title="What to avoid" tone="destructive" icon={ShieldAlert}>
          <List items={result.whatToAvoid} />
        </ResultBlock>
      </div>

      <ResultBlock title="When to seek medical help" tone="warning" icon={Siren}>
        <List items={result.whenToSeekHelp} />
      </ResultBlock>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Trusted medical sources</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { label: 'NHS conditions', url: 'https://www.nhs.uk/conditions/' },
            { label: 'CDC', url: 'https://www.cdc.gov/' },
            { label: 'MedlinePlus', url: 'https://medlineplus.gov/' },
          ].map((s) => (
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
