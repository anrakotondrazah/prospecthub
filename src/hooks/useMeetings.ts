'use client'

import { useState, useCallback, useEffect } from 'react'
import type { MeetingData } from '@/components/meetings/MeetingCard'

interface UseMeetingsOptions {
  entityType?: 'lead' | 'deal' | 'company'
  entityId?: number
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  startDate?: string
  endDate?: string
  limit?: number
  autoFetch?: boolean
}

interface UseMeetingsReturn {
  meetings: MeetingData[]
  isLoading: boolean
  error: string | null
  fetchMeetings: () => Promise<void>
  createMeeting: (data: CreateMeetingData) => Promise<MeetingData | null>
  updateMeeting: (id: number, updates: Partial<UpdateMeetingData>) => Promise<MeetingData | null>
  cancelMeeting: (id: number) => Promise<boolean>
  completeMeeting: (id: number, outcome?: string, outcomeNotes?: string) => Promise<boolean>
  deleteMeeting: (id: number) => Promise<boolean>
  getTodayMeetings: () => MeetingData[]
  getUpcomingMeetings: (days?: number) => MeetingData[]
}

interface CreateMeetingData {
  title: string
  description?: string
  meeting_type?: 'call' | 'video' | 'in_person' | 'demo' | 'discovery' | 'closing'
  start_time: string
  end_time: string
  timezone?: string
  location?: string
  video_link?: string
  associated_lead_id?: number
  associated_company_id?: number
  associated_deal_id?: number
  reminder_before_minutes?: number
  color?: string
  attendees?: Array<{ user_id?: string; lead_id?: number; email?: string }>
}

interface UpdateMeetingData {
  title?: string
  description?: string
  meeting_type?: string
  start_time?: string
  end_time?: string
  location?: string
  video_link?: string
  status?: string
  outcome?: string
  outcome_notes?: string
}

export function useMeetings(options: UseMeetingsOptions = {}): UseMeetingsReturn {
  const {
    entityType,
    entityId,
    status,
    startDate,
    endDate,
    limit = 50,
    autoFetch = true,
  } = options

  const [meetings, setMeetings] = useState<MeetingData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (entityType && entityId) {
        params.append('entity_type', entityType)
        params.append('entity_id', entityId.toString())
      }
      if (status) {
        params.append('status', status)
      }
      if (startDate) {
        params.append('start_date', startDate)
      }
      if (endDate) {
        params.append('end_date', endDate)
      }
      params.append('limit', limit.toString())

      const response = await fetch(`/api/meetings?${params.toString()}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la recuperation des rendez-vous')
      }

      setMeetings(data.meetings)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Error fetching meetings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId, status, startDate, endDate, limit])

  const createMeeting = useCallback(async (data: CreateMeetingData): Promise<MeetingData | null> => {
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la creation du rendez-vous')
      }

      // Add to local state
      setMeetings((prev) => {
        const newMeetings = [result.meeting, ...prev]
        // Sort by start_time
        return newMeetings.sort((a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )
      })

      return result.meeting
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Error creating meeting:', err)
      return null
    }
  }, [])

  const updateMeeting = useCallback(async (
    id: number,
    updates: Partial<UpdateMeetingData>
  ): Promise<MeetingData | null> => {
    try {
      const response = await fetch('/api/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la mise a jour')
      }

      // Update local state
      setMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === id ? { ...meeting, ...result.meeting } : meeting
        )
      )

      return result.meeting
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Error updating meeting:', err)
      return null
    }
  }, [])

  const cancelMeeting = useCallback(async (id: number): Promise<boolean> => {
    const result = await updateMeeting(id, { status: 'cancelled' })
    return result !== null
  }, [updateMeeting])

  const completeMeeting = useCallback(async (
    id: number,
    outcome?: string,
    outcomeNotes?: string
  ): Promise<boolean> => {
    const result = await updateMeeting(id, {
      status: 'completed',
      outcome,
      outcome_notes: outcomeNotes,
    })
    return result !== null
  }, [updateMeeting])

  const deleteMeeting = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/meetings?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la suppression')
      }

      // Remove from local state
      setMeetings((prev) => prev.filter((meeting) => meeting.id !== id))

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Error deleting meeting:', err)
      return false
    }
  }, [])

  const getTodayMeetings = useCallback((): MeetingData[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.start_time)
      return meetingDate >= today && meetingDate < tomorrow
    })
  }, [meetings])

  const getUpcomingMeetings = useCallback((days: number = 7): MeetingData[] => {
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + days)

    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.start_time)
      return meetingDate >= now && meetingDate <= future && meeting.status !== 'cancelled'
    })
  }, [meetings])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchMeetings()
    }
  }, [autoFetch, fetchMeetings])

  return {
    meetings,
    isLoading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    cancelMeeting,
    completeMeeting,
    deleteMeeting,
    getTodayMeetings,
    getUpcomingMeetings,
  }
}
