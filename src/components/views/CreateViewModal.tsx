'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton, AnimatedCheckbox } from '@/components/ui/buttons'
import { Users, Lock } from 'lucide-react'

type Filter = {
  field: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'is_empty' | 'is_not_empty'
  value: string | number | boolean
}

type CreateViewModalProps = {
  isOpen: boolean
  onClose: () => void
  onViewCreated: (view: any) => void
  organizationId: number
  userId: string
  entityType: 'leads' | 'companies' | 'deals' | 'contacts'
  availableColumns: Array<{ key: string; label: string }>
  currentFilters?: Filter[]
  currentColumns?: string[]
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
}

export function CreateViewModal({
  isOpen,
  onClose,
  onViewCreated,
  organizationId,
  userId,
  entityType,
  availableColumns,
  currentFilters = [],
  currentColumns = [],
  currentSortBy,
  currentSortOrder = 'asc',
}: CreateViewModalProps) {
  const [name, setName] = useState('')
  const [isShared, setIsShared] = useState(false)
  const [isDefault, setIsDefault] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    currentColumns.length > 0 ? currentColumns : availableColumns.slice(0, 5).map(c => c.key)
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Le nom est obligatoire')
      return
    }

    if (selectedColumns.length === 0) {
      setError('Selectionnez au moins une colonne')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('saved_views')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          entity_type: entityType,
          name: name.trim(),
          filters: currentFilters,
          columns: selectedColumns,
          sort_by: currentSortBy || null,
          sort_order: currentSortOrder,
          is_default: isDefault,
          is_shared: isShared,
        })
        .select('*')
        .single()

      if (insertError) throw insertError

      // Reset form
      setName('')
      setIsShared(false)
      setIsDefault(false)
      setSelectedColumns(availableColumns.slice(0, 5).map(c => c.key))

      onViewCreated(data)
    } catch (err: any) {
      console.error('Error creating view:', err)
      setError(err.message || 'Erreur lors de la creation de la vue')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleColumn = (key: string) => {
    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  if (!isOpen) return null

  const entityLabels: Record<string, string> = {
    leads: 'Leads',
    companies: 'Entreprises',
    deals: 'Transactions',
    contacts: 'Contacts',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06]">
          <div>
            <h2 className="text-xl font-semibold text-[#0D0F14]">Creer une vue</h2>
            <p className="text-sm text-[#4E525A] mt-1">
              {entityLabels[entityType] || entityType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-black/[0.04] flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[#FDE8E5] border border-[#B42318]/20 rounded-xl flex items-start gap-3 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-[#B42318]">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="view-name" className="block text-sm font-medium text-[#0D0F14] mb-2">
                Nom de la vue <span className="text-[#B42318]">*</span>
              </label>
              <input
                id="view-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Leads qualifies Q4"
                className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12]"
                disabled={isLoading}
                maxLength={255}
              />
            </div>

            {/* Visibility Selection */}
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] mb-3">
                Visibilite
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsShared(false)}
                  disabled={isLoading}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    !isShared
                      ? 'border-[#0066FF] bg-[#0066FF]/5 shadow-sm'
                      : 'border-black/[0.08] hover:border-black/[0.12] hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className={`w-5 h-5 ${!isShared ? 'text-[#0066FF]' : 'text-[#9BA0A6]'}`} />
                    <span className="font-medium text-[#0D0F14]">Privee</span>
                  </div>
                  <p className="text-xs text-[#4E525A] text-left">
                    Visible uniquement par vous
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsShared(true)}
                  disabled={isLoading}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    isShared
                      ? 'border-[#0066FF] bg-[#0066FF]/5 shadow-sm'
                      : 'border-black/[0.08] hover:border-black/[0.12] hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className={`w-5 h-5 ${isShared ? 'text-[#0066FF]' : 'text-[#9BA0A6]'}`} />
                    <span className="font-medium text-[#0D0F14]">Partagee</span>
                  </div>
                  <p className="text-xs text-[#4E525A] text-left">
                    Visible par toute l&apos;equipe
                  </p>
                </button>
              </div>
            </div>

            {/* Default View Checkbox */}
            <div className="flex items-center gap-3">
              <AnimatedCheckbox
                id="default-view-checkbox"
                checked={isDefault}
                onChange={setIsDefault}
              />
              <div>
                <span className="text-sm font-medium text-[#0D0F14]">Definir comme vue par defaut</span>
                <p className="text-xs text-[#4E525A]">Cette vue s&apos;affichera automatiquement</p>
              </div>
            </div>

            {/* Columns Selection */}
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] mb-3">
                Colonnes a afficher
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {availableColumns.map((col) => (
                  <label
                    key={col.key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      selectedColumns.includes(col.key)
                        ? 'bg-[#0066FF]/10 border border-[#0066FF]/30'
                        : 'bg-[#F5F7F9] border border-transparent hover:bg-[#E8EAED]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      disabled={isLoading}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                      selectedColumns.includes(col.key)
                        ? 'bg-[#0066FF] border-[#0066FF]'
                        : 'border-black/[0.2]'
                    }`}>
                      {selectedColumns.includes(col.key) && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-[#0D0F14] truncate">{col.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-[#9BA0A6] mt-2">
                {selectedColumns.length} colonne{selectedColumns.length > 1 ? 's' : ''} selectionnee{selectedColumns.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Current Filters Info */}
            {currentFilters.length > 0 && (
              <div className="p-3 bg-[#F5F7F9] rounded-xl">
                <p className="text-sm text-[#4E525A]">
                  <span className="font-medium">{currentFilters.length} filtre{currentFilters.length > 1 ? 's' : ''}</span> sera{currentFilters.length > 1 ? 'ont' : ''} enregistre{currentFilters.length > 1 ? 's' : ''} avec cette vue
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 p-6 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-transparent border border-black/[0.08] text-[#4E525A] rounded-xl font-medium hover:bg-black/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              Annuler
            </button>
            <FillButton
              disabled={isLoading || !name.trim() || selectedColumns.length === 0}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Creation...
                </span>
              ) : (
                'Creer la vue'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
