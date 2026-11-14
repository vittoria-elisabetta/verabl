import { HeartPulse, Building2, GraduationCap } from 'lucide-react'

const points = [
  {
    icon: HeartPulse,
    title: 'Support informed decisions',
    description:
      'People can review evidence-based guidance and prepare clearer questions for conversations with healthcare professionals.',
  },
  {
    icon: Building2,
    title: 'Recognise warning signs',
    description:
      'Clear educational guidance helps people recognise potential warning signs and understand when professional advice matters.',
  },
  {
    icon: GraduationCap,
    title: 'Improve health literacy',
    description:
      'Communities gain the skills to recognise misinformation and make safer, more confident health decisions.',
  },
]

export function HospitalSection() {
  return (
    <section id="hospitals" className="scroll-mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
            For healthcare systems
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Built to support hospitals and clinics
          </h2>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-primary-foreground/80">
            Verabl is designed to work alongside healthcare providers, extending trusted guidance beyond the clinic
            walls.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className="rounded-3xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15">
                <point.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
