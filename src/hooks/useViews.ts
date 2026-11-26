'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SavedView } from '@/components/views/ViewSelector'

type EntityType = 'leads' | 'companies' | 'deals' | 'contacts'

interface UseViewsOptions {
  entityType: EntityType
  autoFetch?: boolean
}

interface UseViewsReturn {
  views: SavedView[]
  isLoading: boolean
  error: string | null
  currentView: SavedView | null
  setCurrentView: (view: SavedView | null) => void
  fetchViews: () => Promise<void>
  createView: (viewData: Partial<SavedView>) => Promise<SavedView | null>
  deleteView: (viewId: number) => Promise<boolean>
}

export function useViews({ entityType, autoFetch = true }: UseViewsOptions): UseViewsReturn {
  const [views, setViews] = useState<SavedView[]>([])
  const [currentView, setCurrentView] = useState<SavedView | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchViews = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/views?entity_type=${entityType}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors du chargement des vues')
      }

      setViews(data.views)

      // Set default view if exists
      const defaultView = data.views.find((v: SavedView) => v.is_default)
      if (defaultView && !currentView) {
        setCurrentView(defaultView)
      }
    } catch (err: unknown) {
      console.error('Error fetching views:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des vues')
    } finally {
      setIsLoading(false)
    }
  }, [entityType, currentView])

  const createView = useCallback(async (viewData: Partial<SavedView>): Promise<SavedView | null> => {
    try {
      const response = await fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...viewData,
          entity_type: entityType,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la creation de la vue')
      }

      setViews(prev => [data.view, ...prev])
      return data.view
    } catch (err: unknown) {
      console.error('Error creating view:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la creation de la vue')
      return null
    }
  }, [entityType])

  const deleteView = useCallback(async (viewId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/views?id=${viewId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la suppression de la vue')
      }

      setViews(prev => prev.filter(v => v.id !== viewId))

      // Reset current view if deleted
      if (currentView?.id === viewId) {
        setCurrentView(null)
      }

      return true
    } catch (err: unknown) {
      console.error('Error deleting view:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la vue')
      return false
    }
  }, [currentView])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!mounted || !autoFetch) return
      await fetchViews()
    }
    load()
    return () => { mounted = false }
  }, [autoFetch, fetchViews])

  return {
    views,
    isLoading,
    error,
    currentView,
    setCurrentView,
    fetchViews,
    createView,
    deleteView,
  }
}
