import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { myths } from '@/lib/myths'
import { MythCard } from '@/components/myth-card'

export function MythPreview() {
  return (
    <section className="bg-secondary/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Myth vs Fact
            </h2>
            <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
              Misinformation spreads fast. Here is what the science actually says, ready to share.
            </p>
          </div>
          <Link
            href="/myths"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            See all myths
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {myths.slice(0, 3).map((myth) => (
            <MythCard key={myth.id} myth={myth} />
          ))}
        </div>
      </div>
    </section>
  )
}
