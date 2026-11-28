'use client'

import { useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'

export type PropertyType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'url' | 'email' | 'phone'

export type PropertyOption = {
  value: string
  label: string
}

export type CustomProperty = {
  id: number
  uuid: string
  entity_type: string
  field_name: string
  field_label: string
  field_type: PropertyType
  options?: PropertyOption[]
  default_value?: string
  is_required: boolean
  display_order: number
}

export type PropertyValue = {
  value_text?: string | null
  value_number?: number | null
  value_date?: string | null
  value_boolean?: boolean | null
  value_json?: unknown | null
}

interface PropertyFieldProps {
  property: CustomProperty
  value: PropertyValue
  onChange: (value: PropertyValue) => void
  disabled?: boolean
  error?: string
}

export function PropertyField({
  property,
  value,
  onChange,
  disabled = false,
  error,
}: PropertyFieldProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false)

  const getCurrentValue = () => {
    switch (property.field_type) {
      case 'checkbox':
        return value.value_boolean ?? false
      case 'number':
        return value.value_number ?? ''
      case 'date':
        return value.value_date ?? ''
      case 'multiselect':
        return value.value_json ?? []
      default:
        return value.value_text ?? ''
    }
  }

  const handleChange = (newValue: unknown) => {
    switch (property.field_type) {
      case 'checkbox':
        onChange({ value_boolean: newValue as boolean })
        break
      case 'number':
        onChange({ value_number: newValue === '' ? null : Number(newValue) })
        break
      case 'date':
        onChange({ value_date: newValue as string || null })
        break
      case 'multiselect':
        onChange({ value_json: newValue })
        break
      default:
        onChange({ value_text: newValue as string || null })
    }
  }

  const toggleMultiselectOption = (optionValue: string) => {
    const currentValues = (value.value_json as string[]) || []
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue]
    handleChange(newValues)
  }

  const renderField = () => {
    const baseInputClasses = `
      w-full px-3 py-2 bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm border rounded-lg text-sm text-[#0D0F14] dark:text-[#E6EDF3]
      focus:outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/10
      transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
      ${error ? 'border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]/10' : 'border-black/[0.08] dark:border-[#30363D] hover:border-black/[0.12] dark:hover:border-[#484F58]'}
    `

    switch (property.field_type) {
      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={getCurrentValue() as boolean}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={disabled}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                getCurrentValue()
                  ? 'bg-[#0066FF] border-[#0066FF]'
                  : 'border-black/[0.2] dark:border-[#484F58] hover:border-black/[0.3] dark:hover:border-[#6E7681]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {getCurrentValue() && (
                  <Check className="w-3.5 h-3.5 text-white" />
                )}
              </div>
            </div>
            <span className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">{property.field_label}</span>
          </label>
        )

      case 'select':
        return (
          <div className="relative">
            <button
              type="button"
              onClick={() => !disabled && setIsSelectOpen(!isSelectOpen)}
              disabled={disabled}
              className={`${baseInputClasses} flex items-center justify-between text-left`}
            >
              <span className={getCurrentValue() ? 'text-[#0D0F14] dark:text-[#E6EDF3]' : 'text-[#9BA0A6] dark:text-[#8B949E]'}>
                {property.options?.find(o => o.value === getCurrentValue())?.label || 'Selectionner...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#9BA0A6] dark:text-[#8B949E] transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSelectOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#161B22] rounded-lg border border-black/[0.08] dark:border-[#30363D] shadow-lg z-10 max-h-48 overflow-y-auto">
                {property.options?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      handleChange(option.value)
                      setIsSelectOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-[#F5F7F9] dark:hover:bg-[#0D1117] flex items-center justify-between ${
                      getCurrentValue() === option.value ? 'bg-[#0066FF]/5 text-[#0066FF]' : 'text-[#0D0F14] dark:text-[#E6EDF3]'
                    }`}
                  >
                    {option.label}
                    {getCurrentValue() === option.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )

      case 'multiselect':
        const selectedValues = (getCurrentValue() as string[]) || []
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-white/80 dark:bg-[#0D1117]/80 border border-black/[0.08] dark:border-[#30363D] rounded-lg">
              {selectedValues.length > 0 ? (
                selectedValues.map((val) => {
                  const option = property.options?.find(o => o.value === val)
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#0066FF]/10 text-[#0066FF] text-xs font-medium rounded"
                    >
                      {option?.label || val}
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => toggleMultiselectOption(val)}
                          className="hover:bg-[#0066FF]/20 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  )
                })
              ) : (
                <span className="text-sm text-[#9BA0A6] dark:text-[#8B949E]">Aucune selection</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {property.options?.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    selectedValues.includes(option.value)
                      ? 'bg-[#0066FF]/10'
                      : 'hover:bg-[#F5F7F9] dark:hover:bg-[#0D1117]'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => !disabled && toggleMultiselectOption(option.value)}
                    disabled={disabled}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                    selectedValues.includes(option.value)
                      ? 'bg-[#0066FF] border-[#0066FF]'
                      : 'border-black/[0.2] dark:border-[#484F58]'
                  }`}>
                    {selectedValues.includes(option.value) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={getCurrentValue() as number | string}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder={property.default_value || 'Entrez un nombre...'}
            className={baseInputClasses}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={getCurrentValue() as string}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className={baseInputClasses}
          />
        )

      case 'url':
        return (
          <input
            type="url"
            value={getCurrentValue() as string}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder="https://..."
            className={baseInputClasses}
          />
        )

      case 'email':
        return (
          <input
            type="email"
            value={getCurrentValue() as string}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder="email@exemple.com"
            className={baseInputClasses}
          />
        )

      case 'phone':
        return (
          <input
            type="tel"
            value={getCurrentValue() as string}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder="+33 1 23 45 67 89"
            className={baseInputClasses}
          />
        )

      default: // text
        return (
          <input
            type="text"
            value={getCurrentValue() as string}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder={property.default_value || 'Entrez une valeur...'}
            className={baseInputClasses}
          />
        )
    }
  }

  // For checkbox, the label is part of the field
  if (property.field_type === 'checkbox') {
    return (
      <div>
        {renderField()}
        {error && <p className="text-xs text-[#B42318] mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
        {property.field_label}
        {property.is_required && <span className="text-[#B42318] ml-1">*</span>}
      </label>
      {renderField()}
      {error && <p className="text-xs text-[#B42318] mt-1">{error}</p>}
    </div>
  )
}
