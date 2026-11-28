'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'
import { AssociationPicker, type EntityType } from './AssociationPicker'

interface SelectedEntity {
  id: number
  uuid: string
  name: string
  subtitle?: string
  type: EntityType
}

interface AssociateRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onAssociated: () => void
  organizationId: number
  userId: string
  sourceType: EntityType
  sourceId: number
  excludeTypes?: EntityType[]
}

export function AssociateRecordModal({
  isOpen,
  onClose,
  onAssociated,
  organizationId,
  userId,
  sourceType,
  sourceId,
  excludeTypes = [],
}: AssociateRecordModalProps) {
  const [selectedEntities, setSelectedEntities] = useState<SelectedEntity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter out source type and excluded types
  const availableTypes: EntityType[] = (['leads', 'companies', 'deals'] as EntityType[])
    .filter(type => type !== sourceType && !excludeTypes.includes(type))

  const handleSelect = (entity: SelectedEntity) => {
    // Check if already selected
    const isAlreadySelected = selectedEntities.some(
      e => e.type === entity.type && e.id === entity.id
    )

    if (!isAlreadySelected) {
      setSelectedEntities(prev => [...prev, entity])
    }
  }

  const handleRemove = (entity: SelectedEntity) => {
    setSelectedEntities(prev =>
      prev.filter(e => !(e.type === entity.type && e.id === entity.id))
    )
  }

  const handleSubmit = async () => {
    if (selectedEntities.length === 0) {
      setError('Sélectionnez au moins un element a associer')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create associations for each selected entity
      const associations = selectedEntities.map(entity => ({
        organization_id: organizationId,
        source_type: sourceType,
        source_id: sourceId,
        target_type: entity.type,
        target_id: entity.id,
        created_by: userId,
      }))

      const { error: insertError } = await supabase
        .from('associations')
        .upsert(associations, {
          onConflict: 'organization_id,source_type,source_id,target_type,target_id',
        })

      if (insertError) throw insertError

      setSelectedEntities([])
      onAssociated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la creation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedEntities([])
    setError(null)
    onClose()
  }

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#0D1117] rounded-2xl shadow-xl w-full max-w-md border border-black/[0.08] dark:border-[#30363D]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.08] dark:border-[#30363D]">
          <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            Associer des enregistrements
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.05] text-[#9BA0A6] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FDE8E5] rounded-xl text-sm text-[#B42318]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1.5">
              Rechercher et selectionner
            </label>
            <AssociationPicker
              organizationId={organizationId}
              entityTypes={availableTypes}
              excludeType={sourceType}
              excludeId={sourceId}
              onSelect={handleSelect}
              placeholder="Rechercher un lead, une entreprise ou une affaire..."
            />
          </div>

          {/* Selected entities */}
          {selectedEntities.length > 0 && (
            <div>
              <label className="block text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1.5">
                Selectionnes ({selectedEntities.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedEntities.map((entity) => (
                  <div
                    key={`${entity.type}-${entity.id}`}
                    className="flex items-center gap-2 p-2.5 bg-[#F5F7F9] dark:bg-white/[0.05] rounded-xl"
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getTypeColor(entity.type)}`}>
                      {getTypeLabel(entity.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
                        {entity.name}
                      </p>
                      {entity.subtitle && (
                        <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] truncate">
                          {entity.subtitle}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(entity)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#FDE8E5] text-[#9BA0A6] hover:text-[#B42318] transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-black/[0.08] dark:border-[#30363D]">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-[#30363D] text-[#0D0F14] dark:text-[#E6EDF3] rounded-xl text-sm font-medium hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
          >
            Annulér
          </button>
          <FillButton
            onClick={handleSubmit}
            disabled={isLoading || selectedEntities.length === 0}
            className="flex-1"
          >
            {isLoading ? 'Association...' : `Associer (${selectedEntities.length})`}
          </FillButton>
        </div>
      </div>
    </div>
  )
}
