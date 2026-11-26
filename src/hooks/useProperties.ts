'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CustomProperty, PropertyValue } from '@/components/properties/PropertyField'

type EntityType = 'leads' | 'companies' | 'deals' | 'contacts'

interface UsePropertiesOptions {
  entityType: EntityType
  autoFetch?: boolean
}

interface UsePropertiesReturn {
  properties: CustomProperty[]
  isLoading: boolean
  error: string | null
  fetchProperties: () => Promise<void>
  createProperty: (propertyData: Partial<CustomProperty>) => Promise<CustomProperty | null>
  updateProperty: (id: number, updates: Partial<CustomProperty>) => Promise<CustomProperty | null>
  deleteProperty: (propertyId: number) => Promise<boolean>
  reorderProperties: (orderedIds: number[]) => Promise<boolean>
}

export function useProperties({ entityType, autoFetch = true }: UsePropertiesOptions): UsePropertiesReturn {
  const [properties, setProperties] = useState<CustomProperty[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/properties?entity_type=${entityType}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors du chargement des proprietes')
      }

      setProperties(data.properties)
    } catch (err: any) {
      console.error('Error fetching properties:', err)
      setError(err.message || 'Erreur lors du chargement des proprietes')
    } finally {
      setIsLoading(false)
    }
  }, [entityType])

  const createProperty = useCallback(async (propertyData: Partial<CustomProperty>): Promise<CustomProperty | null> => {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...propertyData,
          entity_type: entityType,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la creation de la propriete')
      }

      setProperties(prev => [...prev, data.property])
      return data.property
    } catch (err: any) {
      console.error('Error creating property:', err)
      setError(err.message || 'Erreur lors de la creation de la propriete')
      return null
    }
  }, [entityType])

  const updateProperty = useCallback(async (id: number, updates: Partial<CustomProperty>): Promise<CustomProperty | null> => {
    try {
      const response = await fetch('/api/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la mise a jour de la propriete')
      }

      setProperties(prev =>
        prev.map(p => (p.id === id ? data.property : p))
      )
      return data.property
    } catch (err: any) {
      console.error('Error updating property:', err)
      setError(err.message || 'Erreur lors de la mise a jour de la propriete')
      return null
    }
  }, [])

  const deleteProperty = useCallback(async (propertyId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/properties?id=${propertyId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la suppression de la propriete')
      }

      setProperties(prev => prev.filter(p => p.id !== propertyId))
      return true
    } catch (err: any) {
      console.error('Error deleting property:', err)
      setError(err.message || 'Erreur lors de la suppression de la propriete')
      return false
    }
  }, [])

  const reorderProperties = useCallback(async (orderedIds: number[]): Promise<boolean> => {
    try {
      // Update local state immediately (optimistic)
      setProperties(prev => {
        const propertyMap = new Map(prev.map(p => [p.id, p]))
        return orderedIds
          .map((id, index) => {
            const prop = propertyMap.get(id)
            return prop ? { ...prop, display_order: index } : null
          })
          .filter(Boolean) as CustomProperty[]
      })

      // Persist to server
      await Promise.all(
        orderedIds.map((id, index) =>
          fetch('/api/properties', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, display_order: index }),
          })
        )
      )

      return true
    } catch (err: any) {
      console.error('Error reordering properties:', err)
      setError(err.message || 'Erreur lors du reordonnancement')
      // Refetch to restore correct order
      fetchProperties()
      return false
    }
  }, [fetchProperties])

  useEffect(() => {
    if (autoFetch) {
      fetchProperties()
    }
  }, [autoFetch, fetchProperties])

  return {
    properties,
    isLoading,
    error,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    reorderProperties,
  }
}

// Hook for managing property values on an entity
interface UsePropertyValuesOptions {
  entityType: EntityType
  entityId: number
  properties: CustomProperty[]
}

interface UsePropertyValuesReturn {
  values: Record<string, PropertyValue>
  isLoading: boolean
  error: string | null
  getValue: (fieldName: string) => PropertyValue
  setValue: (fieldName: string, value: PropertyValue) => void
  saveValues: () => Promise<boolean>
}

export function usePropertyValues({
  entityType,
  entityId,
  properties,
}: UsePropertyValuesOptions): UsePropertyValuesReturn {
  const [values, setValues] = useState<Record<string, PropertyValue>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch existing values
  useEffect(() => {
    async function fetchValues() {
      if (!entityId || properties.length === 0) return

      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/properties/values?entity_type=${entityType}&entity_id=${entityId}`
        )
        const data = await response.json()

        if (data.success) {
          const valueMap: Record<string, PropertyValue> = {}
          data.values?.forEach((v: any) => {
            const prop = properties.find(p => p.id === v.property_id)
            if (prop) {
              valueMap[prop.field_name] = {
                value_text: v.value_text,
                value_number: v.value_number,
                value_date: v.value_date,
                value_boolean: v.value_boolean,
                value_json: v.value_json,
              }
            }
          })
          setValues(valueMap)
        }
      } catch (err) {
        console.error('Error fetching property values:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchValues()
  }, [entityType, entityId, properties])

  const getValue = useCallback((fieldName: string): PropertyValue => {
    return values[fieldName] || {}
  }, [values])

  const setValue = useCallback((fieldName: string, value: PropertyValue) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value,
    }))
  }, [])

  const saveValues = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/properties/values', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          values: Object.entries(values).map(([fieldName, value]) => {
            const prop = properties.find(p => p.field_name === fieldName)
            return {
              property_id: prop?.id,
              ...value,
            }
          }).filter(v => v.property_id),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde')
      }

      return true
    } catch (err: any) {
      console.error('Error saving property values:', err)
      setError(err.message || 'Erreur lors de la sauvegarde')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId, values, properties])

  return {
    values,
    isLoading,
    error,
    getValue,
    setValue,
    saveValues,
  }
}
