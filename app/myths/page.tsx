import { PageShell, PageIntro } from '@/components/page-shell'
import { MythsGrid } from '@/components/myths-grid'

export const metadata = {
  title: 'Medical Myths vs Facts — Verabl',
  description: 'Common health myths debunked with the science, and trusted sources you can share.',
}

export default function MythsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PageIntro
          eyebrow="Medical Myths"
          title="Myth vs Fact"
          description="Health misinformation spreads fast. Here is what the science actually says — and everything is ready to share."
        />
        <MythsGrid />
      </section>
    </PageShell>
  )
}
