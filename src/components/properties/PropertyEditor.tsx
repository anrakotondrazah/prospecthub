'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Pencil, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { CustomProperty, PropertyType } from './PropertyField'

interface PropertyEditorProps {
  properties: CustomProperty[]
  entityType: 'leads' | 'companies' | 'deals' | 'contacts'
  organizationId: number
  onCreateProperty: () => void
  onPropertiesChange: (properties: CustomProperty[]) => void
}

const FIELD_TYPE_LABELS: Record<PropertyType, string> = {
  text: 'Texte',
  number: 'Nombre',
  date: 'Date',
  select: 'Liste',
  multiselect: 'Multi-selection',
  checkbox: 'Case a cocher',
  url: 'URL',
  email: 'Email',
  phone: 'Téléphone',
}

export function PropertyEditor({
  properties,
  entityType,
  organizationId,
  onCreateProperty,
  onPropertiesChange,
}: PropertyEditorProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEdit = (property: CustomProperty) => {
    setEditingId(property.id)
    setEditLabel(property.field_label)
    setError(null)
  }

  const handleSaveEdit = async (property: CustomProperty) => {
    if (!editLabel.trim()) {
      setError('Le nom ne peut pas être vide')
      return
    }

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('custom_properties')
        .update({ field_label: editLabel.trim() })
        .eq('id', property.id)

      if (updateError) throw updateError

      onPropertiesChange(
        properties.map(p =>
          p.id === property.id ? { ...p, field_label: editLabel.trim() } : p
        )
      )
      setEditingId(null)
      setEditLabel('')
      setError(null)
    } catch (err: any) {
      console.error('Error updating property:', err)
      setError(err.message || 'Erreur lors de la mise a jour')
    }
  }

  const handleDelete = async (propertyId: number) => {
    setIsDeleting(propertyId)
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('custom_properties')
        .delete()
        .eq('id', propertyId)

      if (deleteError) throw deleteError

      onPropertiesChange(properties.filter(p => p.id !== propertyId))
    } catch (err: any) {
      console.error('Error deleting property:', err)
      setError(err.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newProperties = [...properties]
    const [removed] = newProperties.splice(fromIndex, 1)
    newProperties.splice(toIndex, 0, removed)

    // Update display_order
    const updatedProperties = newProperties.map((p, i) => ({ ...p, display_order: i }))
    onPropertiesChange(updatedProperties)

    // Persist to database
    try {
      const supabase = createClient()
      await Promise.all(
        updatedProperties.map(p =>
          supabase
            .from('custom_properties')
            .update({ display_order: p.display_order })
            .eq('id', p.id)
        )
      )
    } catch (err) {
      console.error('Error reordering properties:', err)
    }
  }

  const entityLabels: Record<string, string> = {
    leads: 'Leads',
    companies: 'Entreprises',
    deals: 'Transactions',
    contacts: 'Contacts',
  }

  return (
    <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-[#E2E4E6] dark:border-[#30363D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#0066FF]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
              Proprietes personnalisées
            </h3>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
              {entityLabels[entityType]} - {properties.length} champ{properties.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={onCreateProperty}
          className="flex items-center gap-2 px-4 py-2 bg-[#0066FF] text-white rounded-xl font-medium hover:bg-[#0052CC] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-[#FDE8E5] border border-[#B42318]/20 rounded-lg flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-[#B42318]">{error}</p>
        </div>
      )}

      {/* Properties List */}
      <div className="p-4 lg:p-6">
        {properties.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#F5F7F9] flex items-center justify-center">
              <Settings className="w-6 h-6 text-[#9BA0A6]" />
            </div>
            <p className="text-sm text-[#4E525A] mb-4">
              Aucune propriete personnalisée
            </p>
            <button
              onClick={onCreateProperty}
              className="text-sm text-[#0066FF] font-medium hover:underline"
            >
              Créer votre première propriete
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {properties
              .sort((a, b) => a.display_order - b.display_order)
              .map((property, index) => (
                <div
                  key={property.id}
                  className="flex items-center gap-3 p-3 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-lg group"
                >
                  {/* Drag Handle */}
                  <button
                    className="p-1 text-[#9BA0A6] hover:text-[#4E525A] cursor-grab active:cursor-grabbing"
                    title="Reorganiser"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>

                  {/* Property Info */}
                  <div className="flex-1 min-w-0">
                    {editingId === property.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(property)
                            if (e.key === 'Escape') {
                              setEditingId(null)
                              setEditLabel('')
                            }
                          }}
                          className="flex-1 px-2 py-1 border border-[#0066FF] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(property)}
                          className="px-2 py-1 text-xs bg-[#0066FF] text-white rounded hover:bg-[#0052CC]"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditLabel('')
                          }}
                          className="px-2 py-1 text-xs text-[#4E525A] hover:bg-black/[0.05] rounded"
                        >
                          Annulér
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
                          {property.field_label}
                          {property.is_required && (
                            <span className="text-[#B42318] ml-1">*</span>
                          )}
                        </p>
                        <p className="text-xs text-[#9BA0A6]">
                          {property.field_name} - {FIELD_TYPE_LABELS[property.field_type] || property.field_type}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Options Count */}
                  {property.options && property.options.length > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-[#E8EAED] text-[#4E525A] rounded">
                      {property.options.length} opt
                    </span>
                  )}

                  {/* Actions */}
                  {editingId !== property.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(property)}
                        className="p-1.5 text-[#4E525A] hover:bg-[#E8EAED] rounded transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        disabled={isDeleting === property.id}
                        className="p-1.5 text-[#B42318] hover:bg-[#FDE8E5] rounded transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        {isDeleting === property.id ? (
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56" />
                          </svg>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
