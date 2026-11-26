import { useState, useCallback } from 'react'

export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'task' | 'other'

export interface Activity {
  id: number
  uuid: string
  organization_id: number
  user_id: number
  activity_type: ActivityType
  subject: string | null
  body: string | null
  outcome: string | null
  duration_minutes: number | null
  activity_date: string
  associated_lead_id: number | null
  associated_company_id: number | null
  associated_deal_id: number | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface CreateNoteData {
  subject?: string
  body: string
  associated_lead_id?: number
  associated_company_id?: number
  associated_deal_id?: number
}

export interface LogCallData {
  subject?: string
  outcome: string
  duration_minutes?: number
  body?: string
  associated_lead_id?: number
  associated_company_id?: number
  associated_deal_id?: number
}

export interface CreateActivityData {
  activity_type: ActivityType
  subject?: string
  body?: string
  outcome?: string
  duration_minutes?: number
  activity_date?: string
  associated_lead_id?: number
  associated_company_id?: number
  associated_deal_id?: number
  metadata?: Record<string, unknown>
}

export interface UpdateActivityData {
  activity_type?: ActivityType
  subject?: string
  body?: string
  outcome?: string
  duration_minutes?: number
  activity_date?: string
  metadata?: Record<string, unknown>
}

interface UseActivitiesReturn {
  activities: Activity[]
  isLoading: boolean
  error: string | null
  fetchActivities: (entityType: 'lead' | 'deal' | 'company', entityId: number) => Promise<Activity[]>
  createNote: (data: CreateNoteData) => Promise<Activity | null>
  logCall: (data: LogCallData) => Promise<Activity | null>
  createActivity: (data: CreateActivityData) => Promise<Activity | null>
  updateActivity: (id: number, data: UpdateActivityData) => Promise<Activity | null>
  deleteActivity: (id: number) => Promise<boolean>
}

export function useActivities(): UseActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async (
    entityType: 'lead' | 'deal' | 'company',
    entityId: number
  ): Promise<Activity[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        entity_type: entityType,
        entity_id: entityId.toString(),
      })

      const response = await fetch(`/api/activities?${params}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la recuperation des activites')
      }

      setActivities(data.activities)
      return data.activities
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createNote = useCallback(async (data: CreateNoteData): Promise<Activity | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'note',
          subject: data.subject || 'Note',
          body: data.body,
          associated_lead_id: data.associated_lead_id,
          associated_company_id: data.associated_company_id,
          associated_deal_id: data.associated_deal_id,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur lors de la creation de la note')
      }

      // Add to activities list
      setActivities(prev => [result.activity, ...prev])
      return result.activity
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logCall = useCallback(async (data: LogCallData): Promise<Activity | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'call',
          subject: data.subject || 'Appel',
          body: data.body,
          outcome: data.outcome,
          duration_minutes: data.duration_minutes,
          associated_lead_id: data.associated_lead_id,
          associated_company_id: data.associated_company_id,
          associated_deal_id: data.associated_deal_id,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur lors de l\'enregistrement de l\'appel')
      }

      // Add to activities list
      setActivities(prev => [result.activity, ...prev])
      return result.activity
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createActivity = useCallback(async (data: CreateActivityData): Promise<Activity | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur lors de la creation de l\'activite')
      }

      setActivities(prev => [result.activity, ...prev])
      return result.activity
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateActivity = useCallback(async (
    id: number,
    data: UpdateActivityData
  ): Promise<Activity | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur lors de la mise a jour')
      }

      // Update in list
      setActivities(prev =>
        prev.map(a => a.id === id ? result.activity : a)
      )
      return result.activity
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteActivity = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur lors de la suppression')
      }

      // Remove from list
      setActivities(prev => prev.filter(a => a.id !== id))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    activities,
    isLoading,
    error,
    fetchActivities,
    createNote,
    logCall,
    createActivity,
    updateActivity,
    deleteActivity,
  }
}
