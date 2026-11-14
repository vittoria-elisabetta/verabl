'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/fact-checker?claim=${encodeURIComponent(trimmed)}` : '/fact-checker')
  }

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-accent)_0%,transparent_60%)] opacity-70" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Evidence-based, not opinion-based
          </span>

          <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Not everything you see about health online is true. Find out what the evidence says.
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Check medical claims, challenge common health myths and access reliable, evidence-based health information.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-xl">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full sm:pl-5">
              <div className="flex flex-1 items-center gap-3">
                <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <label htmlFor="hero-search" className="sr-only">
                  Describe a symptom or health concern
                </label>
                <input
                  id="hero-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Paste a health claim you saw online..."
                  className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-full">
                Check Information
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Sources from WHO, CDC & NHS
            </span>
            <Link href="/fact-checker" className="font-medium text-primary hover:underline">
              Or check a claim you saw online &rarr;
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm">
            <Image
              src="/hero-filter.png"
              alt="Illustration of health misinformation being filtered into reliable, verified medical knowledge"
              width={1024}
              height={1024}
              priority
              className="h-auto w-full rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
