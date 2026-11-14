import { PageShell, PageIntro } from '@/components/page-shell'
import { ConditionsBrowser } from '@/components/conditions-browser'

export const metadata = {
  title: 'Conditions A–Z — Verabl',
  description: 'Plain-language guides to common diseases and conditions, with links to trusted medical sources.',
}

export default function ConditionsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PageIntro
          eyebrow="Conditions A–Z"
          title="Common conditions, explained simply"
          description="Symptoms, causes, treatment, prevention and when to get help, for the conditions people ask about most."
        />
        <ConditionsBrowser />
      </section>
    </PageShell>
  )
}
