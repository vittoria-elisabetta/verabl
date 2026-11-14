'use client'

import { useState } from 'react'
import {
  Loader2,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldQuestion,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Disclaimer } from '@/components/disclaimer'
import { saveSearch } from '@/lib/user-store'

type Rating = 'true' | 'mostly-true' | 'misleading' | 'false' | 'unverified'

type Result = {
  claim: string
  verdict: string
  rating: Rating
  headline: string
  explanation: string
  scientificContext: string
  evidenceStrength: string
  evidence: string[]
  limitations: string[]
  references: { label: string; title: string; url: string; date: string }[]
}

const ratingMeta: Record<Rating, { label: string; icon: React.ComponentType<{ className?: string }>; className: string; bar: string }> = {
  true: { label: 'Accurate', icon: CheckCircle2, className: 'text-success border-success/30 bg-success/10', bar: 'bg-success' },
  'mostly-true': { label: 'Mostly accurate', icon: CheckCircle2, className: 'text-success border-success/30 bg-success/10', bar: 'bg-success' },
  misleading: { label: 'Misleading', icon: AlertTriangle, className: 'text-warning-foreground border-warning/40 bg-warning/10', bar: 'bg-warning' },
  false: { label: 'False', icon: XCircle, className: 'text-destructive border-destructive/30 bg-destructive/10', bar: 'bg-destructive' },
  unverified: { label: 'Unverified', icon: HelpCircle, className: 'text-muted-foreground border-border bg-muted', bar: 'bg-muted-foreground' },
}

const examples = [
  'I saw a video saying vaccines weaken your immune system.',
  'Drinking celery juice every morning cures arthritis.',
  'You only need to drink water when you feel thirsty.',
]

export function FactChecker() {
  const [claim, setClaim] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function check(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = claim.trim()
    if (!trimmed || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/fact-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: trimmed, sourceUrl: sourceUrl.trim() }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'request failed')
      const data = payload as Result
      setResult(data)
      saveSearch({ type: 'fact-check', query: trimmed, summary: `${ratingMeta[data.rating].label}: ${data.headline}` })
    } catch {
      setError('We could not check that claim. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const meta = result ? ratingMeta[result.rating] : null

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <form onSubmit={check} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <label htmlFor="claim" className="font-display text-lg font-semibold text-foreground">
          Paste a medical claim you saw online
        </label>
        <p className="mt-1 text-sm text-muted-foreground">
          A social media post, a video caption, a message from a group chat &mdash; paste it and we&apos;ll check it.
        </p>
        <textarea
          id="claim"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          rows={4}
          placeholder="e.g. I saw a video saying vaccines weaken your immune system."
          className="mt-4 w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm text-foreground outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
        />
        <label htmlFor="source-url" className="mt-4 block text-sm font-medium text-foreground">Original post link <span className="font-normal text-muted-foreground">(optional)</span></label>
        <input id="source-url" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." className="mt-2 w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2" />
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setClaim(ex)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {ex.length > 40 ? ex.slice(0, 40) + '\u2026' : ex}
            </button>
          ))}
        </div>
        <Button type="submit" size="lg" disabled={loading || !claim.trim()} className="mt-4 w-full rounded-full">
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : 'Check this claim'}
        </Button>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </form>

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-3xl border border-border bg-card p-10 text-sm text-muted-foreground shadow-sm">
          <ShieldQuestion className="size-5 animate-pulse text-primary" aria-hidden="true" />
          Weighing this against the medical evidence&hellip;
        </div>
      )}

      {result && meta && (
        <div className="mt-6 space-y-5">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className={`h-1.5 w-full ${meta.bar}`} aria-hidden="true" />
            <div className="p-6">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
                <meta.icon className="size-3.5" aria-hidden="true" />
                Accuracy: {meta.label}
              </span>
              <h2 className="mt-3 text-balance font-display text-xl font-bold text-foreground">{result.headline}</h2>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">{result.explanation}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-muted/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence strength</p><p className="mt-1 text-sm font-medium text-foreground">{result.evidenceStrength}</p></div>
                <div className="rounded-2xl bg-muted/60 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verdict</p><p className="mt-1 text-sm font-medium text-foreground">{result.verdict.replace('-', ' ')}</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display text-base font-semibold text-foreground">Scientific context</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.scientificContext}</p>
            {result.limitations.length > 0 && (
              <div>
                <h3 className="mt-5 font-display text-base font-semibold text-foreground">Important limitations</h3>
                <ul className="mt-3 space-y-2">
                  {result.limitations.map((item, i) => (
                    <li key={i} className="text-sm leading-relaxed text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {result.evidence.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-base font-semibold text-foreground">What the evidence shows</h3>
              <ul className="mt-3 space-y-2">
                {result.evidence.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.references.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-base font-semibold text-foreground">Trusted references</h3>
              <div className="mt-3 space-y-2">
                {result.references.map((ref) => (
                  <a
                    key={ref.url}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                    <span><span className="block">{ref.label}</span><span className="block text-xs font-normal text-muted-foreground">{ref.title} · {ref.date}</span></span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setResult(null)
              setClaim('')
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Check another claim
          </button>

          <Disclaimer />
        </div>
      )}
    </div>
  )
}
