'use client'

import { useMemo, useState } from 'react'
import { myths } from '@/lib/myths'
import { MythCard } from '@/components/myth-card'

export function MythsGrid() {
  const categories = useMemo(() => ['All', ...Array.from(new Set(myths.map((m) => m.category)))], [])
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? myths : myths.filter((m) => m.category === active)

  return (
    <div className="mt-10">
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => {
          const selected = active === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
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

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((myth) => (
          <MythCard key={myth.id} myth={myth} />
        ))}
      </div>
    </div>
  )
}
