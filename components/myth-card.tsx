'use client'

import { useState } from 'react'
import { XCircle, CheckCircle2, AlertTriangle, Share2, Check, ExternalLink } from 'lucide-react'
import type { Myth } from '@/lib/myths'

// Header badge per rating: most entries are false claims ("Myth"), some are true claims people doubt.
const badge = {
  false: { label: 'Myth', icon: XCircle, tone: 'bg-destructive/5', pill: 'bg-destructive/10 text-destructive' },
  misleading: { label: 'Misleading', icon: AlertTriangle, tone: 'bg-warning/5', pill: 'bg-warning/10 text-warning-foreground' },
  'mostly-true': { label: 'Mostly true', icon: CheckCircle2, tone: 'bg-success/5', pill: 'bg-success/10 text-success' },
  true: { label: 'True', icon: CheckCircle2, tone: 'bg-success/5', pill: 'bg-success/10 text-success' },
} as const

export function MythCard({ myth }: { myth: Myth }) {
  const b = badge[myth.rating]
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const text = `${b.label.toUpperCase()}: ${myth.myth}\n\nFACT: ${myth.fact}\n\nShared via Verabl`
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Health myth vs fact', text })
        return
      }
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* user dismissed share sheet */
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className={`border-b border-border/70 p-6 ${b.tone}`}>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${b.pill}`}>
            <b.icon className="size-3.5" aria-hidden="true" />
            {b.label}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{myth.category}</span>
        </div>
        <p className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">
          {`\u201C${myth.myth}\u201D`}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          Fact
        </span>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{myth.fact}</p>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{myth.explanation}</p>

        <p className="mt-4 text-xs text-muted-foreground">{myth.lastReviewed}</p>
        <div className="mt-3 space-y-1.5">
          {myth.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              {source.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {copied ? (
            <>
              <Check className="size-4 text-success" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Share2 className="size-4" aria-hidden="true" />
              Share the facts
            </>
          )}
        </button>
      </div>
    </article>
  )
}
