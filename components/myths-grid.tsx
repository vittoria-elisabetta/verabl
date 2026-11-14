'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { myths, MYTH_CATEGORIES } from '@/lib/data'
import { MythCard } from '@/components/myth-card'
import { matchClaims } from '@/components/fact-checker'

const PAGE_SIZE = 24

export function MythsGrid() {
  const categories = useMemo(() => ['All', ...MYTH_CATEGORIES.filter((c) => myths.some((m) => m.category === c))], [])
  const [active, setActive] = useState('All')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const base = query.trim() ? matchClaims(query).map((r) => r.item) : myths
    return active === 'All' ? base : base.filter((m) => m.category === active)
  }, [active, query])

  return (
    <div className="mt-10">
      <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-border bg-card px-4 py-1 shadow-sm">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShown(PAGE_SIZE)
          }}
          placeholder={`Search ${myths.length} health claims`}
          aria-label="Search health claims"
          className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => {
          const selected = active === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActive(cat)
                setShown(PAGE_SIZE)
              }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-pressed={selected}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && <p className="mt-10 text-center text-sm text-muted-foreground">No claims match your search.</p>}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, shown).map((myth) => (
          <MythCard key={myth.id} myth={myth} />
        ))}
      </div>

      {filtered.length > shown && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Show more ({filtered.length - shown} left)
          </button>
        </div>
      )}
    </div>
  )
}
