'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import { conditions, CONDITION_CATEGORIES } from '@/lib/data'
import { rank } from '@/lib/search'

export function ConditionsBrowser() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const list = useMemo(() => {
    const pool = category === 'All' ? conditions : conditions.filter((c) => c.category === category)
    if (!query.trim()) return [...pool].sort((a, b) => a.name.localeCompare(b.name))
    return rank(
      query,
      pool,
      (c) => [
        { text: c.name, weight: 3, phrase: true },
        ...c.aliases.map((a) => ({ text: a, weight: 2, phrase: true })),
        ...c.symptoms.map((s) => ({ text: s, weight: 0.5 })),
      ],
      0.5,
      'best',
    ).map((r) => r.item)
  }, [query, category])

  const usedCategories = CONDITION_CATEGORIES.filter((cat) => conditions.some((c) => c.category === cat))

  return (
    <div className="mt-10">
      <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-border bg-card px-4 py-1 shadow-sm">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${conditions.length} conditions, e.g. "asthma" or "high blood pressure"`}
          aria-label="Search conditions"
          className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['All', ...usedCategories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">No conditions match your search.</p>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <Link
              key={c.id}
              href={`/conditions/${c.id}/`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
            >
              <span>
                <span className="block font-medium text-foreground">{c.name}</span>
                <span className="block text-xs text-muted-foreground">{c.category}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
