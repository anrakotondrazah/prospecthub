'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Association } from '@/components/associations'
import type { EntityType } from '@/components/associations'

interface UseAssociationsOptions {
  entityType: EntityType
  entityId: number
  autoFetch?: boolean
}

interface UseAssociationsReturn {
  associations: Association[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createAssociation: (targetType: EntityType, targetId: number) => Promise<boolean>
  deleteAssociation: (associationId: number) => Promise<boolean>
}

export function useAssociations({
  entityType,
  entityId,
  autoFetch = true,
}: UseAssociationsOptions): UseAssociationsReturn {
  const [associations, setAssociations] = useState<Association[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAssociations = useCallback(async () => {
    if (!entityId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/associations?entity_type=${entityType}&entity_id=${entityId}`
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors du chargement')
      }

      setAssociations(data.associations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setAssociations([])
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId])

  const createAssociation = useCallback(async (
    targetType: EntityType,
    targetId: number
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/associations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_type: entityType,
          source_id: entityId,
          target_type: targetType,
          target_id: targetId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la creation')
      }

      // Refetch to get updated list
      await fetchAssociations()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }, [entityType, entityId, fetchAssociations])

  const deleteAssociation = useCallback(async (
    associationId: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/associations?id=${associationId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la suppression')
      }

      // Update local state
      setAssociations(prev => prev.filter(a => a.id !== associationId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }, [])

  useEffect(() => {
    if (autoFetch && entityId) {
      fetchAssociations()
    }
  }, [autoFetch, entityId, fetchAssociations])

  return {
    associations,
    isLoading,
    error,
    refetch: fetchAssociations,
    createAssociation,
    deleteAssociation,
  }
}
