'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton, AnimatedCheckbox } from '@/components/ui/buttons'
import { Plus, X, GripVertical } from 'lucide-react'
import type { PropertyType, PropertyOption } from './PropertyField'

type CreatePropertyModalProps = {
  isOpen: boolean
  onClose: () => void
  onPropertyCreated: (property: any) => void
  organizationId: number
  entityType: 'leads' | 'companies' | 'deals' | 'contacts'
  existingFieldNames: string[]
}

const FIELD_TYPES: Array<{ value: PropertyType; label: string; description: string }> = [
  { value: 'text', label: 'Texte', description: 'Champ texte libre' },
  { value: 'number', label: 'Nombre', description: 'Valeur numerique' },
  { value: 'date', label: 'Date', description: 'Selecteur de date' },
  { value: 'select', label: 'Liste deroulante', description: 'Une seule option' },
  { value: 'multiselect', label: 'Selection multiple', description: 'Plusieurs options' },
  { value: 'checkbox', label: 'Case a cocher', description: 'Oui ou Non' },
  { value: 'url', label: 'URL', description: 'Lien web' },
  { value: 'email', label: 'Email', description: 'Adresse email' },
  { value: 'phone', label: 'Téléphone', description: 'Numéro de téléphone' },
]

export function CreatePropertyModal({
  isOpen,
  onClose,
  onPropertyCreated,
  organizationId,
  entityType,
  existingFieldNames,
}: CreatePropertyModalProps) {
  const [fieldLabel, setFieldLabel] = useState('')
  const [fieldType, setFieldType] = useState<PropertyType>('text')
  const [isRequired, setIsRequired] = useState(false)
  const [defaultValue, setDefaultValue] = useState('')
  const [options, setOptions] = useState<PropertyOption[]>([])
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate field_name from label (snake_case)
  const generateFieldName = (label: string): string => {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 100)
  }

  const addOption = () => {
    if (!newOptionLabel.trim()) return
    const value = generateFieldName(newOptionLabel)
    if (options.some(o => o.value === value)) {
      setError('Cette option existe deja')
      return
    }
    setOptions([...options, { value, label: newOptionLabel.trim() }])
    setNewOptionLabel('')
    setError(null)
  }

  const removeOption = (value: string) => {
    setOptions(options.filter(o => o.value !== value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fieldLabel.trim()) {
      setError('Le nom du champ est obligatoire')
      return
    }

    const fieldName = generateFieldName(fieldLabel)
    if (existingFieldNames.includes(fieldName)) {
      setError('Un champ avec ce nom existe deja')
      return
    }

    if ((fieldType === 'select' || fieldType === 'multiselect') && options.length === 0) {
      setError('Ajoutez au moins une option')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('custom_properties')
        .insert({
          organization_id: organizationId,
          entity_type: entityType,
          field_name: fieldName,
          field_label: fieldLabel.trim(),
          field_type: fieldType,
          options: (fieldType === 'select' || fieldType === 'multiselect') ? options : null,
          default_value: defaultValue.trim() || null,
          is_required: isRequired,
        })
        .select('*')
        .single()

      if (insertError) throw insertError

      // Reset form
      setFieldLabel('')
      setFieldType('text')
      setIsRequired(false)
      setDefaultValue('')
      setOptions([])

      onPropertyCreated(data)
    } catch (err: any) {
      console.error('Error creating property:', err)
      setError(err.message || 'Erreur lors de la creation du champ')
    } finally {
      setIsLoading(false)
    }
  }

  const needsOptions = fieldType === 'select' || fieldType === 'multiselect'

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
            <h2 className="text-xl font-semibold text-[#0D0F14]">Créer une propriete</h2>
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

            {/* Field Label */}
            <div>
              <label htmlFor="field-label" className="block text-sm font-medium text-[#0D0F14] mb-2">
                Nom du champ <span className="text-[#B42318]">*</span>
              </label>
              <input
                id="field-label"
                type="text"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                placeholder="Ex: Secteur d'activité"
                className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12]"
                disabled={isLoading}
                maxLength={255}
              />
              {fieldLabel && (
                <p className="text-xs text-[#9BA0A6] mt-1">
                  Identifiant: {generateFieldName(fieldLabel)}
                </p>
              )}
            </div>

            {/* Field Type */}
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] mb-3">
                Type de champ
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FIELD_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setFieldType(type.value)
                      setDefaultValue('')
                      if (type.value !== 'select' && type.value !== 'multiselect') {
                        setOptions([])
                      }
                    }}
                    disabled={isLoading}
                    className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                      fieldType === type.value
                        ? 'border-[#0066FF] bg-[#0066FF]/5 shadow-sm'
                        : 'border-black/[0.08] hover:border-black/[0.12] hover:bg-black/[0.02]'
                    }`}
                  >
                    <span className="block text-sm font-medium text-[#0D0F14]">{type.label}</span>
                    <span className="block text-xs text-[#4E525A] mt-0.5">{type.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options for select/multiselect */}
            {needsOptions && (
              <div>
                <label className="block text-sm font-medium text-[#0D0F14] mb-3">
                  Options
                </label>
                <div className="space-y-2">
                  {/* Existing Options */}
                  {options.map((option, index) => (
                    <div
                      key={option.value}
                      className="flex items-center gap-2 px-3 py-2 bg-[#F5F7F9] rounded-lg"
                    >
                      <GripVertical className="w-4 h-4 text-[#9BA0A6]" />
                      <span className="flex-1 text-sm text-[#0D0F14]">{option.label}</span>
                      <span className="text-xs text-[#9BA0A6]">{option.value}</span>
                      <button
                        type="button"
                        onClick={() => removeOption(option.value)}
                        className="p-1 hover:bg-[#FDE8E5] rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-[#B42318]" />
                      </button>
                    </div>
                  ))}

                  {/* Add Option Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newOptionLabel}
                      onChange={(e) => setNewOptionLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addOption()
                        }
                      }}
                      placeholder="Ajouter une option..."
                      className="flex-1 px-3 py-2 bg-white border border-black/[0.08] rounded-lg text-sm focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      disabled={!newOptionLabel.trim() || isLoading}
                      className="p-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Default Value (for text/number) */}
            {(fieldType === 'text' || fieldType === 'number') && (
              <div>
                <label htmlFor="default-value" className="block text-sm font-medium text-[#0D0F14] mb-2">
                  Valeur par defaut (optionnel)
                </label>
                <input
                  id="default-value"
                  type={fieldType === 'number' ? 'number' : 'text'}
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="Laisser vide si aucune"
                  className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-black/[0.08] rounded-xl text-sm focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Required Checkbox */}
            <div className="flex items-center gap-3">
              <AnimatedCheckbox
                id="required-checkbox"
                checked={isRequired}
                onChange={setIsRequired}
              />
              <div>
                <span className="text-sm font-medium text-[#0D0F14]">Champ obligatoire</span>
                <p className="text-xs text-[#4E525A]">Ce champ doit etre renseigne</p>
              </div>
            </div>
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
              disabled={isLoading || !fieldLabel.trim() || (needsOptions && options.length === 0)}
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
                'Créer la propriete'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
