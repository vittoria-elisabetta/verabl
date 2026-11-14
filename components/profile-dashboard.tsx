'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Stethoscope, ScanSearch, History, Bookmark, Plus, Trash2, X } from 'lucide-react'
import { getSearches, clearSearches, type SearchEntry } from '@/lib/user-store'
import { resources } from '@/components/resources-section'

const suggestedTopics = ['Vaccines', 'Nutrition', 'Mental health', 'Heart health', 'Sleep', 'Infections']

export function ProfileDashboard() {
  const [searches, setSearches] = useState<SearchEntry[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [bookmarks, setBookmarks] = useState<string[]>([])

  useEffect(() => {
    const refresh = () => setSearches(getSearches())
    refresh()
    setTopics(load('verabl:topics'))
    setBookmarks(load('verabl:bookmarks'))
    window.addEventListener('verabl:searches-updated', refresh)
    return () => window.removeEventListener('verabl:searches-updated', refresh)
  }, [])

  function toggleTopic(topic: string) {
    setTopics((prev) => {
      const next = prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
      save('verabl:topics', next)
      return next
    })
  }

  function toggleBookmark(name: string) {
    setBookmarks((prev) => {
      const next = prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
      save('verabl:bookmarks', next)
      return next
    })
  }

  return (
    <div className="mx-auto mt-10 max-w-5xl">
      <div className="rounded-2xl border border-primary/30 bg-accent/50 p-4 text-sm text-accent-foreground">
        Your activity is saved on this device for now. Sign-in with saved accounts across devices is coming next.
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <StatCard icon={History} label="Searches" value={searches.length} />
        <StatCard icon={Bookmark} label="Followed topics" value={topics.length} />
        <StatCard icon={Bookmark} label="Bookmarks" value={bookmarks.length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">Recent searches</h2>
            {searches.length > 0 && (
              <button
                onClick={() => {
                  clearSearches()
                  setSearches([])
                }}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Clear
              </button>
            )}
          </div>

          {searches.length === 0 ? (
            <EmptyState
              text="You haven't checked anything yet."
              cta={{ label: 'Try the Symptom Checker', href: '/symptom-checker' }}
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {searches.slice(0, 8).map((entry) => (
                <li key={entry.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2">
                    {entry.type === 'symptom' ? (
                      <Stethoscope className="size-4 text-primary" aria-hidden="true" />
                    ) : (
                      <ScanSearch className="size-4 text-primary" aria-hidden="true" />
                    )}
                    <p className="text-sm font-medium text-foreground">{entry.query}</p>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{entry.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-foreground">Topics you follow</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick areas you want to learn more about.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestedTopics.map((topic) => {
              const on = topics.includes(topic)
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    on
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                  aria-pressed={on}
                >
                  {on ? <X className="size-3.5" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
                  {topic}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground">Bookmark trusted resources</h2>
        <p className="mt-1 text-sm text-muted-foreground">Save reliable organisations to return to any time.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => {
            const on = bookmarks.includes(r.name)
            return (
              <div key={r.name} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background p-4">
                <div>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary">
                    {r.name}
                  </a>
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.tag}</p>
                </div>
                <button
                  onClick={() => toggleBookmark(r.name)}
                  aria-label={on ? `Remove ${r.name} bookmark` : `Bookmark ${r.name}`}
                  aria-pressed={on}
                  className="shrink-0"
                >
                  <Bookmark className={`size-5 transition-colors ${on ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}`} aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function EmptyState({ text, cta }: { text: string; cta: { label: string; href: string } }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-6 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link href={cta.href} className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
        {cta.label}
      </Link>
    </div>
  )
}

function load(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}

function save(key: string, value: string[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value))
}
