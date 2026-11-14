import { PageShell, PageIntro } from '@/components/page-shell'
import { ProfileDashboard } from '@/components/profile-dashboard'

export const metadata = {
  title: 'Your Profile — Verabl',
  description: 'Review your recent searches, saved topics, and bookmarked resources.',
}

export default function ProfilePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PageIntro
          eyebrow="Your Profile"
          title="Your health learning space"
          description="Keep track of what you've checked, follow topics you care about, and bookmark trusted resources."
        />
        <ProfileDashboard />
      </section>
    </PageShell>
  )
}
