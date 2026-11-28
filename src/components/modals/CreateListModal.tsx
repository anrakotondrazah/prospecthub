'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'
import { ListFiltersEditor, createEmptyFilters, type ListFilters } from '@/components/lists/ListFiltersEditor'

type List = {
  id: number
  uuid: string
  name: string
  description: string | null
  type: 'static' | 'dynamic'
  filters: ListFilters | null
  member_count: number
  created_at: string
  updated_at: string
}

type CreateListModalProps = {
  isOpen: boolean
  onClose: () => void
  onListCreated: (list: List) => void
  organizationId: number
  userId: string
}

export function CreateListModal({ isOpen, onClose, onListCreated, organizationId, userId }: CreateListModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'static' | 'dynamic'>('static')
  const [filters, setFilters] = useState<ListFilters>(createEmptyFilters())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setType('static')
    setFilters(createEmptyFilters())
    setError(null)
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Le nom est obligatoire')
      return
    }

    // Validate filters for dynamic lists
    if (type === 'dynamic') {
      const hasValidConditions = filters.groups.some(g => g.conditions.length > 0)
      if (!hasValidConditions) {
        setError('Une liste dynamique doit avoir au moins une condition de filtre')
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('lists')
        .insert({
          organization_id: organizationId,
          name: name.trim(),
          description: description.trim() || null,
          type,
          filters: type === 'dynamic' ? filters : null,
          created_by: userId,
        })
        .select('id, uuid, name, description, type, filters, member_count, created_at, updated_at')
        .single()

      if (insertError) throw insertError

      // Reset form
      resetForm()

      // Call parent callback
      onListCreated(data)
    } catch (err: unknown) {
      console.error('Error creating list:', err)
      const message = err instanceof Error ? err.message : 'Erreur lors de la creation de la liste'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl shadow-lg w-full ${
          type === 'dynamic' ? 'max-w-2xl max-h-[90vh] overflow-hidden flex flex-col' : 'max-w-md'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-[#30363D]">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">Créer une liste</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`p-6 space-y-5 ${type === 'dynamic' ? 'flex-1 overflow-y-auto' : ''}`}>
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-[#FDE8E5] dark:bg-[#B42318]/10 border border-[#B42318]/20 rounded-xl flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-[#B42318] dark:text-[#F87171]">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-[#B42318] dark:text-[#F87171]">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="list-name" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Nom de la liste <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="list-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Leads chauds Q4"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="list-description" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Description (optionnel)
            </label>
            <textarea
              id="list-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Decrivez lobjectif de cette liste..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
              Type de liste
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('static')}
                disabled={isLoading}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  type === 'static'
                    ? 'border-[#0066FF] bg-[#0066FF]/5 shadow-sm'
                    : 'border-black/[0.08] dark:border-[#30363D] hover:border-black/[0.12] dark:hover:border-[#30363D] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    type === 'static' ? 'border-[#0066FF]' : 'border-black/[0.2] dark:border-[#30363D]'
                  }`}>
                    {type === 'static' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
                    )}
                  </div>
                  <span className="font-medium text-[#0D0F14] dark:text-[#E6EDF3]">Statique</span>
                </div>
                <p className="text-xs text-[#4E525A] dark:text-[#8B949E] text-left">
                  Ajoutez et retirez des leads manuellement
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('dynamic')}
                disabled={isLoading}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  type === 'dynamic'
                    ? 'border-[#0066FF] bg-[#0066FF]/5 shadow-sm'
                    : 'border-black/[0.08] dark:border-[#30363D] hover:border-black/[0.12] dark:hover:border-[#30363D] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    type === 'dynamic' ? 'border-[#0066FF]' : 'border-black/[0.2] dark:border-[#30363D]'
                  }`}>
                    {type === 'dynamic' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
                    )}
                  </div>
                  <span className="font-medium text-[#0D0F14] dark:text-[#E6EDF3]">Dynamique</span>
                </div>
                <p className="text-xs text-[#4E525A] dark:text-[#8B949E] text-left">
                  Mise a jour automatique par filtres
                </p>
              </button>
            </div>
          </div>

          {/* Dynamic List Filters */}
          {type === 'dynamic' && (
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
                Filtres de la liste
              </label>
              <p className="text-xs text-[#4E525A] dark:text-[#8B949E] mb-4">
                Les leads correspondant a ces criteres seront automatiquement ajoutes a la liste.
              </p>
              <ListFiltersEditor
                filters={filters}
                onChange={setFilters}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-transparent border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              Annuler
            </button>
            <FillButton
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Création...
                </span>
              ) : (
                'Créer la liste'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
