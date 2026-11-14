import { Suspense } from 'react'
import { PageShell, PageIntro } from '@/components/page-shell'
import { FactChecker } from '@/components/fact-checker'

export const metadata = {
  title: 'Fact Checker — Verabl',
  description:
    'Paste a medical claim you saw on social media and compare it with health claims reviewed against trusted sources.',
}

export default function FactCheckerPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PageIntro
          eyebrow="Fact Checker"
          title="Is that health claim actually true?"
          description="Paste something you saw online and see what trusted medical sources say about it."
        />
        {/* Suspense is required around useSearchParams in a statically exported page. */}
        <Suspense>
          <FactChecker />
        </Suspense>
      </section>
    </PageShell>
  )
}
