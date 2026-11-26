'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  type: 'lead' | 'company' | 'deal'
  id: number
  title: string
  subtitle: string | null
  href: string
}

interface GlobalSearchProps {
  organizationId: number | null
}

export function GlobalSearch({ organizationId }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  const search = useCallback(async (searchQuery: string) => {
    if (!organizationId || searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)

    try {
      const [leadsRes, companiesRes, dealsRes] = await Promise.all([
        supabase
          .from('leads')
          .select('id, first_name, last_name, company_name, email')
          .eq('organization_id', organizationId)
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .limit(5),
        supabase
          .from('companies')
          .select('id, name, email')
          .eq('organization_id', organizationId)
          .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .limit(5),
        supabase
          .from('deals')
          .select('id, name, value')
          .eq('organization_id', organizationId)
          .ilike('name', `%${searchQuery}%`)
          .limit(5),
      ])

      const searchResults: SearchResult[] = [
        ...(leadsRes.data || []).map((lead) => ({
          type: 'lead' as const,
          id: lead.id,
          title: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sans nom',
          subtitle: lead.company_name || lead.email,
          href: `/leads/${lead.id}`,
        })),
        ...(companiesRes.data || []).map((company) => ({
          type: 'company' as const,
          id: company.id,
          title: company.name,
          subtitle: company.email,
          href: `/companies/${company.id}`,
        })),
        ...(dealsRes.data || []).map((deal) => ({
          type: 'deal' as const,
          id: deal.id,
          title: deal.name,
          subtitle: deal.value ? `${deal.value.toLocaleString('fr-FR')} EUR` : null,
          href: '/deals',
        })),
      ]

      setResults(searchResults)
      setSelectedIndex(0)
    } catch {
      setResults([])
    }

    setIsLoading(false)
  }, [organizationId, supabase])

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      router.push(results[selectedIndex].href)
      setIsOpen(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href)
    setIsOpen(false)
  }

  const typeIcons: Record<string, string> = {
    lead: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z',
    company: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5',
    deal: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  }

  const typeLabels: Record<string, string> = {
    lead: 'Lead',
    company: 'Entreprise',
    deal: 'Affaire',
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div className="fixed inset-x-0 top-20 z-50 flex justify-center px-4">
        <div className="w-full max-w-xl bg-white rounded-[14px] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E2E4E6]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher leads, entreprises, affaires..."
              className="flex-1 text-sm bg-transparent outline-none placeholder-[#9BA0A6]"
              aria-label="Recherche globale"
            />
            {isLoading && (
              <div className="w-4 h-4 border-2 border-[#9BA0A6] border-t-transparent rounded-full animate-spin" />
            )}
            <kbd className="hidden sm:inline-flex px-2 py-1 text-[10px] font-medium text-[#9BA0A6] bg-[#F5F7F9] rounded border border-[#E2E4E6]">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {query.length < 2 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#9BA0A6]">Tapez au moins 2 caracteres</p>
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#9BA0A6]">Aucun resultat pour "{query}"</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      index === selectedIndex ? 'bg-[#F5F7F9]' : 'hover:bg-[#F5F7F9]/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-[8px] bg-[#F5F7F9] flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
                        <path d={typeIcons[result.type]} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0D0F14] truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-[#9BA0A6] truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-[#9BA0A6] uppercase">
                      {typeLabels[result.type]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-[#E2E4E6] bg-[#F5F7F9]">
            <div className="flex items-center gap-4 text-[10px] text-[#9BA0A6]">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E2E4E6]">↑↓</kbd>
                naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E2E4E6]">↵</kbd>
                ouvrir
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#E2E4E6]">esc</kbd>
                fermer
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
