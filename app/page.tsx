import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Hero } from '@/components/hero'
import { ToolsSection } from '@/components/tools-section'
import { MythPreview } from '@/components/myth-preview'
import { DoDontSection } from '@/components/do-dont-section'
import { HospitalSection } from '@/components/hospital-section'
import { ResourcesSection } from '@/components/resources-section'

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ToolsSection />
        <MythPreview />
        <DoDontSection />
        <HospitalSection />
        <ResourcesSection />
      </main>
      <SiteFooter />
    </div>
  )
}
