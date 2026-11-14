import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <span className="font-display text-base font-bold text-foreground">Verabl</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Evidence-based health guidance that helps you separate medical facts from the noise of social media.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterCol
              title="Tools"
              items={[
                { label: 'Symptom Checker', href: '/symptom-checker' },
                { label: 'Fact Checker', href: '/fact-checker' },
                { label: 'Conditions A–Z', href: '/conditions' },
                { label: 'Medical Myths', href: '/myths' },
              ]}
            />
            <FooterCol
              title="Learn"
              items={[
                { label: 'Resources', href: '/resources' },
                { label: 'For Hospitals', href: '/#hospitals' },
                { label: 'Profile', href: '/profile' },
              ]}
            />
            <FooterCol
              title="Trusted sources"
              items={[
                { label: 'WHO', href: 'https://www.who.int/' },
                { label: 'CDC', href: 'https://www.cdc.gov/' },
                { label: 'NHS', href: 'https://www.nhs.uk/' },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Verabl provides educational information and does not replace professional medical advice, diagnosis, or
            treatment. Always seek the advice of a qualified health provider with any questions about a medical
            condition. In an emergency, contact your local emergency services immediately.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  items,
}: {
  title: string
  items: { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
