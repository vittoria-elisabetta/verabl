'use client'

// Lightweight client-side activity store.
// NOTE: This is a temporary local store for the core build. It will be
// replaced with database-backed accounts in the dashboard follow-up.

export type SearchEntry = {
  id: string
  type: 'symptom' | 'fact-check'
  query: string
  summary: string
  createdAt: number
}

const KEY = 'verabl:searches'

function read(): SearchEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

function write(entries: SearchEntry[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 50)))
  window.dispatchEvent(new Event('verabl:searches-updated'))
}

export function saveSearch(entry: Omit<SearchEntry, 'id' | 'createdAt'>) {
  const entries = read()
  entries.unshift({ ...entry, id: crypto.randomUUID(), createdAt: Date.now() })
  write(entries)
}

export function getSearches(): SearchEntry[] {
  return read()
}

export function clearSearches() {
  write([])
}
