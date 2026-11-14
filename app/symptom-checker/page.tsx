import { PageShell, PageIntro } from '@/components/page-shell'
import { SymptomChecker } from '@/components/symptom-checker'

export const metadata = {
  title: 'Symptom Checker — Verabl',
  description:
    'Answer a few simple questions and get evidence-based educational guidance on your symptoms, with clear next steps.',
}

export default async function SymptomCheckerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PageIntro
          eyebrow="Symptom Checker"
          title="Understand your symptoms, step by step"
          description="Describe how you feel, answer a few simple questions, and get calm, evidence-based guidance on what to do next."
        />
        <SymptomChecker initialConcern={q ?? ''} />
      </section>
    </PageShell>
  )
}
