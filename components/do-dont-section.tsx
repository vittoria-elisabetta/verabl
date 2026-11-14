import { Check, X } from 'lucide-react'

const guides = [
  {
    concern: 'Headache',
    dos: ['Stay hydrated', 'Rest in a quiet, dark room', 'Monitor how symptoms change'],
    donts: ['Take random medications without guidance', 'Believe unverified online remedies', 'Ignore a sudden, severe headache'],
  },
  {
    concern: 'Fever',
    dos: ['Drink plenty of fluids', 'Rest and dress lightly', 'Track your temperature over time'],
    donts: ['Use antibiotics without a prescription', 'Wrap up in heavy blankets', 'Delay care for a very high fever'],
  },
  {
    concern: 'Cold or cough',
    dos: ['Rest and sleep well', 'Use honey or warm fluids for a sore throat', 'Wash hands to avoid spreading it'],
    donts: ['Demand antibiotics for a virus', 'Trust "miracle cure" videos', 'Ignore breathing difficulty'],
  },
]

export function DoDontSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          What to do &mdash; and what to avoid
        </h2>
        <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
          Clear, practical steps for everyday health concerns, so you can act with confidence instead of guessing.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {guides.map((guide) => (
          <div key={guide.concern} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display text-xl font-semibold text-foreground">{guide.concern}</h3>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-success">Do</p>
              <ul className="mt-2 space-y-2">
                {guide.dos.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 border-t border-border/70 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Don&apos;t</p>
              <ul className="mt-2 space-y-2">
                {guide.donts.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
