import { PageShell, PageIntro } from '@/components/page-shell'
import { ResourcesSection } from '@/components/resources-section'

export const metadata = {
  title: 'Reliable Resources — Verabl',
  description: 'Trusted health organisations and peer-reviewed sources for evidence-based medical information.',
}

export default function ResourcesPage() {
  return (
    <PageShell>
      <section className="px-4 pt-16 sm:px-6">
        <PageIntro
          eyebrow="Reliable Resources"
          title="Go straight to the source"
          description="When you want to dig deeper, these are the organisations that set the global standard for medical evidence."
        />
      </section>
      <ResourcesSection heading={false} />
    </PageShell>
  )
}
