'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { RotateCcw, ExternalLink, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Disclaimer } from '@/components/disclaimer'
import { saveSearch } from '@/lib/user-store'
import { myths, type Myth, type Rating } from '@/lib/data'
import { rank } from '@/lib/search'

// Rule-based fact check: the claim is matched against the curated claims in lib/data/myths.json
// by keyword and word overlap (lib/search.ts). We only ever show verdicts a person wrote and sourced;
// a claim we have not reviewed gets "not in our database", never a guess.

// Score thresholds, tuned on the dataset: at or above MATCH_SCORE we show the verdict of the
// best match; between RELATED_SCORE and MATCH_SCORE we only list related claims.
const MATCH_SCORE = 4
const RELATED_SCORE = 2

export const ratingMeta: Record<Rating, { label: string; icon: React.ComponentType<{ className?: string }>; className: string; bar: string }> = {
  true: { label: 'Accurate', icon: CheckCircle2, className: 'text-success border-success/30 bg-success/10', bar: 'bg-success' },
  'mostly-true': { label: 'Mostly accurate', icon: CheckCircle2, className: 'text-success border-success/30 bg-success/10', bar: 'bg-success' },
  misleading: { label: 'Misleading', icon: AlertTriangle, className: 'text-warning-foreground border-warning/40 bg-warning/10', bar: 'bg-warning' },
  false: { label: 'False', icon: XCircle, className: 'text-destructive border-destructive/30 bg-destructive/10', bar: 'bg-destructive' },
}

const examples = [
  'I saw a video saying vaccines weaken your immune system.',
  'Cracking your knuckles gives you arthritis',
  'Antibiotics will clear up my cold faster',
]

export function matchClaims(claim: string) {
  return rank(
    claim,
    myths,
    (m) => [{ text: m.myth, weight: 4 }, ...m.keywords.map((k) => ({ text: k, weight: 1.5, phrase: true }))],
    RELATED_SCORE,
  )
}

type Outcome = { claim: string; best: Myth | null; related: Myth[] }

export function FactChecker() {
  const params = useSearchParams()
  const [claim, setClaim] = useState('')
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  function check(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const ranked = matchClaims(trimmed)
    const best = ranked[0] && ranked[0].score >= MATCH_SCORE ? ranked[0].item : null
    const related = ranked
      .filter((r) => r.item !== best)
      .slice(0, best ? 3 : 5)
      .map((r) => r.item)
    setOutcome({ claim: trimmed, best, related })
    saveSearch({
      type: 'fact-check',
      query: trimmed,
      summary: best ? `${ratingMeta[best.rating].label}: ${best.myth}` : 'Not in our database yet',
    })
  }

  // The home page hero links here with ?claim=...
  useEffect(() => {
    const fromUrl = params.get('claim')
    if (fromUrl) {
      setClaim(fromUrl)
      check(fromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          check(claim)
        }}
        className="rounded-3xl border border-border bg-card p-6 shadow-sm"
      >
        <label htmlFor="claim" className="font-display text-lg font-semibold text-foreground">
          Paste a medical claim you saw online
        </label>
        <p className="mt-1 text-sm text-muted-foreground">
          A social media post, a video caption, a message from a group chat. We compare it with {myths.length} health
          claims our sources have reviewed.
        </p>
        <textarea
          id="claim"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          rows={4}
          placeholder="e.g. I saw a video saying vaccines weaken your immune system."
          className="mt-4 w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm text-foreground outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setClaim(ex)}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {ex.length > 40 ? ex.slice(0, 40) + '…' : ex}
            </button>
          ))}
        </div>
        <Button type="submit" size="lg" disabled={!claim.trim()} className="mt-4 w-full rounded-full">
          Check this claim
        </Button>
      </form>

      {outcome && (
        <div className="mt-6 space-y-5">
          {outcome.best ? (
            <VerdictCard myth={outcome.best} />
          ) : (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                <HelpCircle className="size-3.5" aria-hidden="true" />
                Not in our database yet
              </span>
              <h2 className="mt-3 font-display text-xl font-bold text-foreground">We haven&apos;t reviewed this claim</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We only show verdicts that have been checked against trusted medical sources, so we won&apos;t guess. Try
                rewording it with the key words (for example &ldquo;garlic cures infections&rdquo;), browse the{' '}
                <Link href="/myths/" className="font-medium text-primary hover:underline">
                  myths library
                </Link>
                , or look the topic up on the NHS, CDC or WHO websites.
              </p>
            </div>
          )}

          {outcome.related.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                <Search className="size-4 text-primary" aria-hidden="true" />
                {outcome.best ? 'Related claims' : 'Closest claims we have checked'}
              </h3>
              <ul className="mt-3 space-y-3">
                {outcome.related.map((m) => {
                  const meta = ratingMeta[m.rating]
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setOutcome({ claim: outcome.claim, best: m, related: [] })}
                        className="w-full rounded-2xl border border-border bg-background p-3 text-left hover:bg-muted"
                      >
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.className}`}>
                          <meta.icon className="size-3" aria-hidden="true" />
                          {meta.label}
                        </span>
                        <span className="mt-1.5 block text-sm font-medium text-foreground">&ldquo;{m.myth}&rdquo;</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          <button
            onClick={() => {
              setOutcome(null)
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

function VerdictCard({ myth }: { myth: Myth }) {
  const meta = ratingMeta[myth.rating]
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className={`h-1.5 w-full ${meta.bar}`} aria-hidden="true" />
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">The closest claim we have checked</p>
        <h2 className="mt-2 text-balance font-display text-xl font-bold text-foreground">&ldquo;{myth.myth}&rdquo;</h2>
        <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}>
          <meta.icon className="size-3.5" aria-hidden="true" />
          Verdict: {meta.label}
        </span>
        <h3 className="mt-5 font-display text-base font-semibold text-foreground">What the evidence says</h3>
        <p className="mt-2 text-pretty leading-relaxed text-foreground">{myth.fact}</p>
        <h3 className="mt-5 font-display text-base font-semibold text-foreground">Context</h3>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{myth.explanation}</p>
        <p className="mt-5 text-xs text-muted-foreground">
          {myth.category} · {myth.lastReviewed}
        </p>
        <div className="mt-3 space-y-2">
          {myth.sources.map((ref) => (
            <a
              key={ref.url}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
              {ref.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
