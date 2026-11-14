import Link from 'next/link'
import { Stethoscope, ScanSearch, BookOpenCheck, ArrowRight, LibraryBig } from 'lucide-react'

const tools = [
  {
    href: '/symptom-checker',
    icon: Stethoscope,
    title: 'Symptom Checker',
    description:
      'Describe how you feel and answer a few simple questions. Get possible explanations and clear next steps.',
  },
  {
    href: '/fact-checker',
    icon: ScanSearch,
    title: 'Fact Checker',
    description:
      'Paste a medical claim you saw online and see what trusted medical sources say about it.',
  },
  {
    href: '/conditions',
    icon: LibraryBig,
    title: 'Conditions A–Z',
    description:
      'Plain-language guides to common diseases: symptoms, causes, treatment, prevention and when to get help.',
  },
  {
    href: '/myths',
    icon: BookOpenCheck,
    title: 'Myth vs Fact',
    description:
      'Explore common health myths, the science that debunks them, and trusted sources to share.',
  },
]

export function ToolsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Four ways to find the truth about your health
        </h2>
        <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
          Every answer is framed with what the evidence actually shows, and links you back to trusted medical
          organisations.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <tool.icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{tool.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Open tool
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
