'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type EntityType = 'leads' | 'companies' | 'deals' | 'contacts'

interface SearchResult {
  id: number
  uuid: string
  name: string
  subtitle?: string
  type: EntityType
}

interface AssociationPickerProps {
  organizationId: number
  entityTypes?: EntityType[]
  excludeType?: EntityType
  excludeId?: number
  onSelect: (entity: SearchResult) => void
  placeholder?: string
}

export function AssociationPicker({
  organizationId,
  entityTypes = ['leads', 'companies', 'deals'],
  excludeType,
  excludeId,
  onSelect,
  placeholder = 'Rechercher...',
}: AssociationPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const searchEntities = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const allResults: SearchResult[] = []

      // Search leads
      if (entityTypes.includes('leads')) {
        const { data: leads } = await supabase
          .from('leads')
          .select('id, uuid, first_name, last_name, email, company_name')
          .eq('organization_id', organizationId)
          .is('deleted_at', null)
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`)
          .limit(5)

        if (leads) {
          allResults.push(...leads.map(lead => ({
            id: lead.id,
            uuid: lead.uuid,
            name: [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Sans nom',
            subtitle: lead.email || lead.company_name || undefined,
            type: 'leads' as EntityType,
          })).filter(r => !(excludeType === 'leads' && r.id === excludeId)))
        }
      }

      // Search companies
      if (entityTypes.includes('companies')) {
        const { data: companies } = await supabase
          .from('companies')
          .select('id, uuid, name, industry')
          .eq('organization_id', organizationId)
          .is('deleted_at', null)
          .ilike('name', `%${searchQuery}%`)
          .limit(5)

        if (companies) {
          allResults.push(...companies.map(company => ({
            id: company.id,
            uuid: company.uuid,
            name: company.name,
            subtitle: company.industry || undefined,
            type: 'companies' as EntityType,
          })).filter(r => !(excludeType === 'companies' && r.id === excludeId)))
        }
      }

      // Search deals
      if (entityTypes.includes('deals')) {
        const { data: deals } = await supabase
          .from('deals')
          .select('id, uuid, name, value, currency')
          .eq('organization_id', organizationId)
          .is('deleted_at', null)
          .ilike('name', `%${searchQuery}%`)
          .limit(5)

        if (deals) {
          allResults.push(...deals.map(deal => ({
            id: deal.id,
            uuid: deal.uuid,
            name: deal.name,
            subtitle: deal.value ? `${deal.value.toLocaleString('fr-FR')} ${deal.currency}` : undefined,
            type: 'deals' as EntityType,
          })).filter(r => !(excludeType === 'deals' && r.id === excludeId)))
        }
      }

      setResults(allResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [organizationId, entityTypes, excludeType, excludeId])

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchEntities(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, searchEntities])

  const handleSelect = (entity: SearchResult) => {
    onSelect(entity)
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  const getTypeLabel = (type: EntityType): string => {
    const labels: Record<EntityType, string> = {
      leads: 'Lead',
      companies: 'Entreprise',
      deals: 'Affaire',
      contacts: 'Contact',
    }
    return labels[type]
  }

  const getTypeColor = (type: EntityType): string => {
    const colors: Record<EntityType, string> = {
      leads: 'bg-[#E3F2FD] text-[#1565C0]',
      companies: 'bg-[#F3E5F5] text-[#7B1FA2]',
      deals: 'bg-[#E8F5E9] text-[#2E7D32]',
      contacts: 'bg-[#FFF3E0] text-[#E65100]',
    }
    return colors[type]
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2.5 bg-[#F5F7F9] dark:bg-white/[0.05] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin text-[#9BA0A6]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full px-3 py-2.5 text-left hover:bg-[#F5F7F9] dark:hover:bg-white/[0.05] transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getTypeColor(result.type)}`}>
                  {getTypeLabel(result.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
                    {result.name}
                  </p>
                  {result.subtitle && (
                    <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] truncate">
                      {result.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#0D1117] border border-black/[0.08] dark:border-[#30363D] rounded-xl shadow-lg p-4">
          <p className="text-sm text-[#9BA0A6] dark:text-[#8B949E] text-center">
            Aucun résultat pour "{query}"
          </p>
        </div>
      )}
    </div>
  )
}
