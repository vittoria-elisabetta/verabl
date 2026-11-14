import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Siren, Stethoscope } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { Disclaimer } from '@/components/disclaimer'
import { conditions } from '@/lib/data'

// One static HTML page per condition, generated at build time.
export const dynamicParams = false

export function generateStaticParams() {
  return conditions.map((c) => ({ id: c.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = conditions.find((x) => x.id === id)
  if (!c) return {}
  return { title: `${c.name} — Verabl`, description: c.overview }
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary opacity-60" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function ConditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = conditions.find((x) => x.id === id)
  if (!c) notFound()

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href="/conditions/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          All conditions
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary">{c.category}</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-foreground">{c.name}</h1>
        {c.aliases.length > 0 && <p className="mt-2 text-sm text-muted-foreground">Also called: {c.aliases.join(', ')}</p>}
        <p className="mt-5 text-pretty text-lg leading-relaxed text-foreground">{c.overview}</p>
        {c.contagious && (
          <p className="mt-3 inline-flex rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning-foreground">
            Can spread from person to person
          </p>
        )}

        <Disclaimer className="mt-8" />

        {c.emergencySigns.length > 0 && (
          <div className="mt-6 rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-destructive">
              <Siren className="size-4" aria-hidden="true" />
              Call your local emergency number (such as 911, 999 or 112) if
            </h2>
            <ul className="mt-3 space-y-2">
              {c.emergencySigns.map((s, i) => (
                <li key={i} className="text-sm leading-relaxed text-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 space-y-5">
          <Section title="Symptoms" items={c.symptoms} />
          <Section title="Causes" items={c.causes} />
          <Section title="Who is more at risk" items={c.riskFactors} />
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-base font-semibold text-foreground">How it is diagnosed</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.diagnosis}</p>
          </div>
          <Section title="Treatment" items={c.treatment} />
          <Section title="Looking after yourself" items={c.selfCare} />
          <Section title="Prevention" items={c.prevention} />
          <div className="rounded-3xl border border-warning/40 bg-card p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <Stethoscope className="size-4 text-warning" aria-hidden="true" />
              See a doctor if
            </h2>
            <ul className="mt-3 space-y-2">
              {c.whenToSeeDoctor.map((s, i) => (
                <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-base font-semibold text-foreground">Sources</h2>
            <div className="mt-3 space-y-2">
              {c.sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </article>
    </PageShell>
  )
}
