'use client'

import { useState } from 'react'
import { Plus, X, ChevronDown } from 'lucide-react'

export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'is_empty' | 'is_not_empty'

export type Filter = {
  id: string
  field: string
  operator: FilterOperator
  value: string | number | boolean
}

export type FilterField = {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  options?: Array<{ value: string; label: string }>
}

interface ViewFiltersProps {
  filters: Filter[]
  availableFields: FilterField[]
  onFiltersChange: (filters: Filter[]) => void
  onApply: () => void
  onClear: () => void
}

const OPERATORS: Record<string, Array<{ value: FilterOperator; label: string }>> = {
  text: [
    { value: 'equals', label: 'Est egal a' },
    { value: 'not_equals', label: 'N\'est pas egal a' },
    { value: 'contains', label: 'Contient' },
    { value: 'not_contains', label: 'Ne contient pas' },
    { value: 'is_empty', label: 'Est vide' },
    { value: 'is_not_empty', label: 'N\'est pas vide' },
  ],
  number: [
    { value: 'equals', label: 'Est egal a' },
    { value: 'not_equals', label: 'N\'est pas egal a' },
    { value: 'gt', label: 'Superieur a' },
    { value: 'gte', label: 'Superieur ou egal a' },
    { value: 'lt', label: 'Inferieur a' },
    { value: 'lte', label: 'Inferieur ou egal a' },
    { value: 'is_empty', label: 'Est vide' },
    { value: 'is_not_empty', label: 'N\'est pas vide' },
  ],
  date: [
    { value: 'equals', label: 'Est le' },
    { value: 'gt', label: 'Apres le' },
    { value: 'gte', label: 'A partir du' },
    { value: 'lt', label: 'Avant le' },
    { value: 'lte', label: 'Jusqu\'au' },
    { value: 'is_empty', label: 'Est vide' },
    { value: 'is_not_empty', label: 'N\'est pas vide' },
  ],
  select: [
    { value: 'equals', label: 'Est' },
    { value: 'not_equals', label: 'N\'est pas' },
    { value: 'is_empty', label: 'Est vide' },
    { value: 'is_not_empty', label: 'N\'est pas vide' },
  ],
  boolean: [
    { value: 'equals', label: 'Est' },
  ],
}

export function ViewFilters({
  filters,
  availableFields,
  onFiltersChange,
  onApply,
  onClear,
}: ViewFiltersProps) {
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null)

  const addFilter = () => {
    const newFilter: Filter = {
      id: crypto.randomUUID(),
      field: availableFields[0]?.key || '',
      operator: 'equals',
      value: '',
    }
    onFiltersChange([...filters, newFilter])
    setExpandedFilter(newFilter.id)
  }

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(f => f.id !== id))
  }

  const updateFilter = (id: string, updates: Partial<Filter>) => {
    onFiltersChange(filters.map(f => (f.id === id ? { ...f, ...updates } : f)))
  }

  const getFieldType = (fieldKey: string): string => {
    return availableFields.find(f => f.key === fieldKey)?.type || 'text'
  }

  const getFieldOptions = (fieldKey: string) => {
    return availableFields.find(f => f.key === fieldKey)?.options
  }

  const needsValue = (operator: FilterOperator): boolean => {
    return !['is_empty', 'is_not_empty'].includes(operator)
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-black/[0.08] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06]">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="text-sm font-medium text-[#0D0F14]">Filtres</span>
          {filters.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-[#0066FF]/10 text-[#0066FF] rounded">
              {filters.length}
            </span>
          )}
        </div>
        <button
          onClick={onClear}
          className="text-xs text-[#4E525A] hover:text-[#B42318] transition-colors"
        >
          Effacer tout
        </button>
      </div>

      {/* Filters List */}
      <div className="p-3 space-y-2">
        {filters.map((filter, index) => {
          const field = availableFields.find(f => f.key === filter.field)
          const fieldType = getFieldType(filter.field)
          const operators = OPERATORS[fieldType] || OPERATORS.text
          const fieldOptions = getFieldOptions(filter.field)
          const isExpanded = expandedFilter === filter.id

          return (
            <div
              key={filter.id}
              className="bg-[#F5F7F9] rounded-lg overflow-hidden"
            >
              {/* Filter Summary */}
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#E8EAED] transition-colors"
                onClick={() => setExpandedFilter(isExpanded ? null : filter.id)}
              >
                {index > 0 && (
                  <span className="text-xs font-medium text-[#9BA0A6] uppercase">ET</span>
                )}
                <span className="text-sm text-[#0D0F14] font-medium">{field?.label || filter.field}</span>
                <span className="text-sm text-[#4E525A]">
                  {operators.find(o => o.value === filter.operator)?.label || filter.operator}
                </span>
                {needsValue(filter.operator) && (
                  <span className="text-sm text-[#0D0F14] font-medium truncate max-w-[100px]">
                    {String(filter.value) || '...'}
                  </span>
                )}
                <div className="flex-1" />
                <ChevronDown className={`w-4 h-4 text-[#9BA0A6] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFilter(filter.id)
                  }}
                  className="p-1 hover:bg-[#FDE8E5] rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-[#B42318]" />
                </button>
              </div>

              {/* Filter Editor */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3">
                  {/* Field Select */}
                  <div>
                    <label className="block text-xs font-medium text-[#4E525A] mb-1">Champ</label>
                    <select
                      value={filter.field}
                      onChange={(e) => {
                        const newFieldType = getFieldType(e.target.value)
                        const newOperators = OPERATORS[newFieldType] || OPERATORS.text
                        updateFilter(filter.id, {
                          field: e.target.value,
                          operator: newOperators[0].value,
                          value: '',
                        })
                      }}
                      className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10"
                    >
                      {availableFields.map((f) => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Operator Select */}
                  <div>
                    <label className="block text-xs font-medium text-[#4E525A] mb-1">Operateur</label>
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, { operator: e.target.value as FilterOperator })}
                      className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10"
                    >
                      {operators.map((op) => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Value Input */}
                  {needsValue(filter.operator) && (
                    <div>
                      <label className="block text-xs font-medium text-[#4E525A] mb-1">Valeur</label>
                      {fieldType === 'select' && fieldOptions ? (
                        <select
                          value={String(filter.value)}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10"
                        >
                          <option value="">Selectionner...</option>
                          {fieldOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : fieldType === 'boolean' ? (
                        <select
                          value={String(filter.value)}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value === 'true' })}
                          className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10"
                        >
                          <option value="true">Oui</option>
                          <option value="false">Non</option>
                        </select>
                      ) : fieldType === 'date' ? (
                        <input
                          type="date"
                          value={String(filter.value)}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10"
                        />
                      ) : fieldType === 'number' ? (
                        <input
                          type="number"
                          value={String(filter.value)}
                          onChange={(e) => updateFilter(filter.id, { value: parseFloat(e.target.value) || '' })}
                          placeholder="Valeur..."
                          className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(filter.value)}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          placeholder="Valeur..."
                          className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Add Filter Button */}
        <button
          onClick={addFilter}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-[#0066FF] hover:bg-[#0066FF]/5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un filtre</span>
        </button>
      </div>

      {/* Apply Button */}
      {filters.length > 0 && (
        <div className="px-3 pb-3">
          <button
            onClick={onApply}
            className="w-full px-4 py-2.5 bg-[#0066FF] text-white rounded-lg font-medium hover:bg-[#0052CC] transition-colors"
          >
            Appliquer les filtres
          </button>
        </div>
      )}
    </div>
  )
}
