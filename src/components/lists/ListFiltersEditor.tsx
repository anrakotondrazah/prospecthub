'use client'

import { useState, useCallback } from 'react'

export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'

export type FilterCondition = {
  id: string
  field: string
  operator: FilterOperator
  value: string
}

export type FilterGroup = {
  id: string
  logic: 'AND' | 'OR'
  conditions: FilterCondition[]
}

export type ListFilters = {
  groups: FilterGroup[]
  logic: 'AND' | 'OR'
}

type ListFiltersEditorProps = {
  filters: ListFilters
  onChange: (filters: ListFilters) => void
  disabled?: boolean
}

const FIELD_OPTIONS = [
  { value: 'status', label: 'Statut', type: 'select' },
  { value: 'score', label: 'Score', type: 'number' },
  { value: 'is_hot', label: 'Lead chaud', type: 'boolean' },
  { value: 'source', label: 'Source', type: 'text' },
  { value: 'company_name', label: 'Entreprise', type: 'text' },
  { value: 'address_city', label: 'Ville', type: 'text' },
  { value: 'address_postal_code', label: 'Code postal', type: 'text' },
  { value: 'email', label: 'Email', type: 'text' },
  { value: 'created_at', label: 'Date de creation', type: 'date' },
  { value: 'last_contacted_at', label: 'Dernier contact', type: 'date' },
]

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nouveau' },
  { value: 'contacted', label: 'Contacte' },
  { value: 'qualified', label: 'Qualifie' },
  { value: 'unqualified', label: 'Non qualifie' },
  { value: 'nurturing', label: 'En nurturing' },
  { value: 'converted', label: 'Converti' },
  { value: 'lost', label: 'Perdu' },
]

const OPERATOR_OPTIONS: Record<string, { value: FilterOperator; label: string }[]> = {
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
    { value: 'greater_than', label: 'Superieur a' },
    { value: 'less_than', label: 'Inferieur a' },
  ],
  select: [
    { value: 'equals', label: 'Est' },
    { value: 'not_equals', label: 'N\'est pas' },
  ],
  boolean: [
    { value: 'equals', label: 'Est' },
  ],
  date: [
    { value: 'equals', label: 'Est le' },
    { value: 'greater_than', label: 'Apres le' },
    { value: 'less_than', label: 'Avant le' },
    { value: 'is_empty', label: 'Non defini' },
    { value: 'is_not_empty', label: 'Defini' },
  ],
}

function generateId() {
  return Math.random().toString(36).substring(2, 11)
}

function createEmptyCondition(): FilterCondition {
  return {
    id: generateId(),
    field: 'status',
    operator: 'equals',
    value: 'new',
  }
}

function createEmptyGroup(): FilterGroup {
  return {
    id: generateId(),
    logic: 'AND',
    conditions: [createEmptyCondition()],
  }
}

export function createEmptyFilters(): ListFilters {
  return {
    groups: [createEmptyGroup()],
    logic: 'AND',
  }
}

export function ListFiltersEditor({ filters, onChange, disabled = false }: ListFiltersEditorProps) {
  const getFieldType = (fieldValue: string) => {
    return FIELD_OPTIONS.find(f => f.value === fieldValue)?.type || 'text'
  }

  const handleAddCondition = useCallback((groupId: string) => {
    const newFilters = { ...filters }
    const group = newFilters.groups.find(g => g.id === groupId)
    if (group) {
      group.conditions.push(createEmptyCondition())
      onChange(newFilters)
    }
  }, [filters, onChange])

  const handleRemoveCondition = useCallback((groupId: string, conditionId: string) => {
    const newFilters = { ...filters }
    const group = newFilters.groups.find(g => g.id === groupId)
    if (group) {
      group.conditions = group.conditions.filter(c => c.id !== conditionId)
      if (group.conditions.length === 0) {
        newFilters.groups = newFilters.groups.filter(g => g.id !== groupId)
      }
      onChange(newFilters)
    }
  }, [filters, onChange])

  const handleUpdateCondition = useCallback((
    groupId: string,
    conditionId: string,
    updates: Partial<FilterCondition>
  ) => {
    const newFilters = { ...filters }
    const group = newFilters.groups.find(g => g.id === groupId)
    if (group) {
      const condition = group.conditions.find(c => c.id === conditionId)
      if (condition) {
        Object.assign(condition, updates)
        // Reset value when field or operator changes
        if (updates.field) {
          const fieldType = getFieldType(updates.field)
          const operators = OPERATOR_OPTIONS[fieldType]
          if (operators && !operators.find(o => o.value === condition.operator)) {
            condition.operator = operators[0].value
          }
          condition.value = updates.field === 'is_hot' ? 'true' : ''
        }
        onChange(newFilters)
      }
    }
  }, [filters, onChange])

  const handleAddGroup = useCallback(() => {
    const newFilters = { ...filters }
    newFilters.groups.push(createEmptyGroup())
    onChange(newFilters)
  }, [filters, onChange])

  const handleUpdateGroupLogic = useCallback((groupId: string, logic: 'AND' | 'OR') => {
    const newFilters = { ...filters }
    const group = newFilters.groups.find(g => g.id === groupId)
    if (group) {
      group.logic = logic
      onChange(newFilters)
    }
  }, [filters, onChange])

  const handleUpdateGlobalLogic = useCallback((logic: 'AND' | 'OR') => {
    onChange({ ...filters, logic })
  }, [filters, onChange])

  const renderValueInput = (condition: FilterCondition, groupId: string) => {
    const field = FIELD_OPTIONS.find(f => f.value === condition.field)
    const fieldType = field?.type || 'text'

    if (condition.operator === 'is_empty' || condition.operator === 'is_not_empty') {
      return null
    }

    if (condition.field === 'status') {
      return (
        <select
          value={condition.value}
          onChange={(e) => handleUpdateCondition(groupId, condition.id, { value: e.target.value })}
          disabled={disabled}
          className="flex-1 px-3 py-2 bg-white border border-[#E2E4E6] rounded-[8px] text-sm focus:outline-none focus:border-[#17191F] transition-colors disabled:opacity-50"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )
    }

    if (condition.field === 'is_hot') {
      return (
        <select
          value={condition.value}
          onChange={(e) => handleUpdateCondition(groupId, condition.id, { value: e.target.value })}
          disabled={disabled}
          className="flex-1 px-3 py-2 bg-white border border-[#E2E4E6] rounded-[8px] text-sm focus:outline-none focus:border-[#17191F] transition-colors disabled:opacity-50"
        >
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      )
    }

    if (fieldType === 'number') {
      return (
        <input
          type="number"
          value={condition.value}
          onChange={(e) => handleUpdateCondition(groupId, condition.id, { value: e.target.value })}
          disabled={disabled}
          placeholder="Valeur"
          className="flex-1 px-3 py-2 bg-white border border-[#E2E4E6] rounded-[8px] text-sm focus:outline-none focus:border-[#17191F] transition-colors disabled:opacity-50"
        />
      )
    }

    if (fieldType === 'date') {
      return (
        <input
          type="date"
          value={condition.value}
          onChange={(e) => handleUpdateCondition(groupId, condition.id, { value: e.target.value })}
          disabled={disabled}
          className="flex-1 px-3 py-2 bg-white border border-[#E2E4E6] rounded-[8px] text-sm focus:outline-none focus:border-[#17191F] transition-colors disabled:opacity-50"
        />
      )
    }

    return (
      <input
        type="text"
        value={condition.value}
        onChange={(e) => handleUpdateCondition(groupId, condition.id, { value: e.target.value })}
        disabled={disabled}
        placeholder="Valeur"
        className="flex-1 px-3 py-2 bg-white border border-[#E2E4E6] rounded-[8px] text-sm focus:outline-none focus:border-[#17191F] transition-colors disabled:opacity-50"
      />
    )
  }

  return (
    <div className="space-y-4">
      {filters.groups.map((group, groupIndex) => (
        <div key={group.id} className="relative">
          {groupIndex > 0 && (
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#F5F7F9] rounded-full">
                <button
                  type="button"
                  onClick={() => handleUpdateGlobalLogic('AND')}
                  disabled={disabled}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                    filters.logic === 'AND'
                      ? 'bg-[#17191F] text-white'
                      : 'text-[#4E525A] hover:bg-[#E2E4E6]'
                  } disabled:opacity-50`}
                >
                  ET
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateGlobalLogic('OR')}
                  disabled={disabled}
                  className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                    filters.logic === 'OR'
                      ? 'bg-[#17191F] text-white'
                      : 'text-[#4E525A] hover:bg-[#E2E4E6]'
                  } disabled:opacity-50`}
                >
                  OU
                </button>
              </div>
            </div>
          )}

          <div className="border border-[#E2E4E6] rounded-[12px] p-4 bg-white">
            <div className="space-y-3">
              {group.conditions.map((condition, conditionIndex) => {
                const fieldType = getFieldType(condition.field)
                const operators = OPERATOR_OPTIONS[fieldType] || OPERATOR_OPTIONS.text

                return (
                  <div key={condition.id} className="flex items-center gap-2">
                    {conditionIndex > 0 && (
                      <div className="flex items-center gap-1 mr-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateGroupLogic(group.id, 'AND')}
                          disabled={disabled}
                          className={`px-1.5 py-0.5 text-xs font-medium rounded transition-colors ${
                            group.logic === 'AND'
                              ? 'bg-[#E3F2FD] text-[#1565C0]'
                              : 'text-[#9BA0A6] hover:bg-[#F5F7F9]'
                          } disabled:opacity-50`}
                        >
                          ET
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateGroupLogic(group.id, 'OR')}
                          disabled={disabled}
                          className={`px-1.5 py-0.5 text-xs font-medium rounded transition-colors ${
                            group.logic === 'OR'
                              ? 'bg-[#FFF3E0] text-[#E65100]'
                              : 'text-[#9BA0A6] hover:bg-[#F5F7F9]'
                          } disabled:opacity-50`}
                        >
                          OU
                        </button>
                      </div>
                    )}

                    <select
                      value={condition.field}
                      onChange={(e) => handleUpdateCondition(group.id, condition.id, { field: e.target.value })}
                      disabled={disabled}
                      className="w-36 px-3 py-2 bg-white border border-[#E2E4E6] rounded-[8px] text-sm focus:outline-none focus:border-[#17191F] transition-colors disabled:opacity-50"
                    >
                      {FIELD_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    <select
                      value={condition.operator}
                      onChange={(e) => handleUpdateCondition(group.id, condition.id, { operator: e.target.value as FilterOperator })}
                      disabled={disabled}
                      className="w-40 px-3 py-2 bg-white border border-[#E2E4E6] rounded-[8px] text-sm focus:outline-none focus:border-[#17191F] transition-colors disabled:opacity-50"
                    >
                      {operators.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>

                    {renderValueInput(condition, group.id)}

                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(group.id, condition.id)}
                      disabled={disabled}
                      className="p-2 text-[#9BA0A6] hover:text-[#B42318] hover:bg-[#FDE8E5] rounded-[8px] transition-colors disabled:opacity-50"
                      aria-label="Supprimer la condition"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => handleAddCondition(group.id)}
              disabled={disabled}
              className="mt-3 flex items-center gap-1.5 text-sm text-[#1565C0] hover:text-[#0D47A1] transition-colors disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ajouter une condition
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddGroup}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#17191F] bg-[#F5F7F9] hover:bg-[#E2E4E6] rounded-[10px] transition-colors disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Ajouter un groupe de filtres
      </button>
    </div>
  )
}
