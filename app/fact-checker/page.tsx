import { PageShell, PageIntro } from '@/components/page-shell'
import { FactChecker } from '@/components/fact-checker'

export const metadata = {
  title: 'Fact Checker — Verabl',
  description:
    'Paste a medical claim you saw on social media and get an accuracy rating backed by trusted evidence.',
}

export default function FactCheckerPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PageIntro
          eyebrow="Fact Checker"
          title="Is that health claim actually true?"
          description="Paste something you saw online and get a clear accuracy rating, an explanation, and the trusted evidence behind it."
        />
        <FactChecker />
      </section>
    </PageShell>
  )
}
