'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ListFilters } from '@/components/lists/ListFiltersEditor'

export type List = {
  id: number
  uuid: string
  organization_id: number
  name: string
  description: string | null
  type: 'static' | 'dynamic'
  filters: ListFilters | null
  member_count: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ListMember = {
  id: number
  list_id: number
  lead_id: number
  added_at: string
  added_by: string | null
  leads: {
    id: number
    uuid: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
    company_name: string | null
    job_title: string | null
    status: string
    score: number
    is_hot: boolean
  }
}

type UseListsOptions = {
  organizationId: number
  userId: string
}

type UseListsReturn = {
  lists: List[]
  isLoading: boolean
  error: string | null
  fetchLists: () => Promise<void>
  createList: (data: CreateListData) => Promise<List | null>
  updateList: (listId: number, data: Partial<CreateListData>) => Promise<List | null>
  deleteList: (listId: number) => Promise<boolean>
  addMembers: (listId: number, leadIds: number[]) => Promise<ListMember[]>
  removeMembers: (listId: number, memberIds: number[]) => Promise<boolean>
  removeMembersByLeadIds: (listId: number, leadIds: number[]) => Promise<boolean>
}

type CreateListData = {
  name: string
  description?: string | null
  type: 'static' | 'dynamic'
  filters?: ListFilters | null
}

export function useLists({ organizationId, userId }: UseListsOptions): UseListsReturn {
  const [lists, setLists] = useState<List[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLists = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('lists')
        .select('*')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError
      setLists(data || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error fetching lists:', err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  const createList = useCallback(async (data: CreateListData): Promise<List | null> => {
    try {
      const supabase = createClient()
      const { data: newList, error: insertError } = await supabase
        .from('lists')
        .insert({
          organization_id: organizationId,
          name: data.name.trim(),
          description: data.description?.trim() || null,
          type: data.type,
          filters: data.filters || null,
          created_by: userId,
        })
        .select('*')
        .single()

      if (insertError) throw insertError

      setLists(prev => [newList, ...prev])
      return newList
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error creating list:', err)
      setError(message)
      return null
    }
  }, [organizationId, userId])

  const updateList = useCallback(async (listId: number, data: Partial<CreateListData>): Promise<List | null> => {
    try {
      const supabase = createClient()

      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.description !== undefined) updateData.description = data.description?.trim() || null
      if (data.type !== undefined) updateData.type = data.type
      if (data.filters !== undefined) updateData.filters = data.filters

      const { data: updatedList, error: updateError } = await supabase
        .from('lists')
        .update(updateData)
        .eq('id', listId)
        .select('*')
        .single()

      if (updateError) throw updateError

      setLists(prev => prev.map(list => list.id === listId ? updatedList : list))
      return updatedList
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error updating list:', err)
      setError(message)
      return null
    }
  }, [])

  const deleteList = useCallback(async (listId: number): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId)

      if (deleteError) throw deleteError

      setLists(prev => prev.filter(list => list.id !== listId))
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error deleting list:', err)
      setError(message)
      return false
    }
  }, [])

  const addMembers = useCallback(async (listId: number, leadIds: number[]): Promise<ListMember[]> => {
    try {
      const supabase = createClient()

      // Get existing members to avoid duplicates
      const { data: existingMembers, error: fetchError } = await supabase
        .from('list_members')
        .select('lead_id')
        .eq('list_id', listId)
        .in('lead_id', leadIds)

      if (fetchError) throw fetchError

      const existingLeadIds = new Set(existingMembers?.map(m => m.lead_id) || [])
      const newLeadIds = leadIds.filter(id => !existingLeadIds.has(id))

      if (newLeadIds.length === 0) {
        return []
      }

      const membersToInsert = newLeadIds.map(leadId => ({
        list_id: listId,
        lead_id: leadId,
        added_by: userId,
      }))

      const { data: newMembers, error: insertError } = await supabase
        .from('list_members')
        .insert(membersToInsert)
        .select(`
          id,
          list_id,
          lead_id,
          added_at,
          added_by,
          leads!inner (
            id,
            uuid,
            first_name,
            last_name,
            email,
            phone,
            company_name,
            job_title,
            status,
            score,
            is_hot
          )
        `)
        .returns<ListMember[]>()

      if (insertError) throw insertError

      // Update member count in local state
      setLists(prev => prev.map(list =>
        list.id === listId
          ? { ...list, member_count: list.member_count + (newMembers?.length || 0) }
          : list
      ))

      return newMembers || []
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error adding members:', err)
      setError(message)
      return []
    }
  }, [userId])

  const removeMembers = useCallback(async (listId: number, memberIds: number[]): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('list_members')
        .delete()
        .eq('list_id', listId)
        .in('id', memberIds)

      if (deleteError) throw deleteError

      // Update member count in local state
      setLists(prev => prev.map(list =>
        list.id === listId
          ? { ...list, member_count: Math.max(0, list.member_count - memberIds.length) }
          : list
      ))

      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error removing members:', err)
      setError(message)
      return false
    }
  }, [])

  const removeMembersByLeadIds = useCallback(async (listId: number, leadIds: number[]): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('list_members')
        .delete()
        .eq('list_id', listId)
        .in('lead_id', leadIds)

      if (deleteError) throw deleteError

      // Update member count in local state
      setLists(prev => prev.map(list =>
        list.id === listId
          ? { ...list, member_count: Math.max(0, list.member_count - leadIds.length) }
          : list
      ))

      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error removing members by lead ids:', err)
      setError(message)
      return false
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  return {
    lists,
    isLoading,
    error,
    fetchLists,
    createList,
    updateList,
    deleteList,
    addMembers,
    removeMembers,
    removeMembersByLeadIds,
  }
}

// Hook for single list with members
type UseListDetailOptions = {
  listId: number
  organizationId: number
  userId: string
}

type UseListDetailReturn = {
  list: List | null
  members: ListMember[]
  isLoading: boolean
  error: string | null
  fetchList: () => Promise<void>
  addMembers: (leadIds: number[]) => Promise<ListMember[]>
  removeMember: (memberId: number) => Promise<boolean>
  removeMembers: (memberIds: number[]) => Promise<boolean>
  updateList: (data: Partial<CreateListData>) => Promise<List | null>
  deleteList: () => Promise<boolean>
}

export function useListDetail({ listId, organizationId, userId }: UseListDetailOptions): UseListDetailReturn {
  const [list, setList] = useState<List | null>(null)
  const [members, setMembers] = useState<ListMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchList = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch list
      const { data: listData, error: listError } = await supabase
        .from('lists')
        .select('*')
        .eq('id', listId)
        .eq('organization_id', organizationId)
        .single()

      if (listError) throw listError
      setList(listData)

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('list_members')
        .select(`
          id,
          list_id,
          lead_id,
          added_at,
          added_by,
          leads!inner (
            id,
            uuid,
            first_name,
            last_name,
            email,
            phone,
            company_name,
            job_title,
            status,
            score,
            is_hot
          )
        `)
        .eq('list_id', listId)
        .order('added_at', { ascending: false })
        .returns<ListMember[]>()

      if (membersError) throw membersError
      setMembers(membersData || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error fetching list:', err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [listId, organizationId])

  const addMembers = useCallback(async (leadIds: number[]): Promise<ListMember[]> => {
    try {
      const supabase = createClient()

      const existingLeadIds = new Set(members.map(m => m.lead_id))
      const newLeadIds = leadIds.filter(id => !existingLeadIds.has(id))

      if (newLeadIds.length === 0) {
        return []
      }

      const membersToInsert = newLeadIds.map(leadId => ({
        list_id: listId,
        lead_id: leadId,
        added_by: userId,
      }))

      const { data: newMembers, error: insertError } = await supabase
        .from('list_members')
        .insert(membersToInsert)
        .select(`
          id,
          list_id,
          lead_id,
          added_at,
          added_by,
          leads!inner (
            id,
            uuid,
            first_name,
            last_name,
            email,
            phone,
            company_name,
            job_title,
            status,
            score,
            is_hot
          )
        `)
        .returns<ListMember[]>()

      if (insertError) throw insertError

      setMembers(prev => [...(newMembers || []), ...prev])
      setList(prev => prev ? { ...prev, member_count: prev.member_count + (newMembers?.length || 0) } : null)

      return newMembers || []
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error adding members:', err)
      setError(message)
      return []
    }
  }, [listId, userId, members])

  const removeMember = useCallback(async (memberId: number): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('list_members')
        .delete()
        .eq('id', memberId)

      if (deleteError) throw deleteError

      setMembers(prev => prev.filter(m => m.id !== memberId))
      setList(prev => prev ? { ...prev, member_count: Math.max(0, prev.member_count - 1) } : null)

      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error removing member:', err)
      setError(message)
      return false
    }
  }, [])

  const removeMembers = useCallback(async (memberIds: number[]): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('list_members')
        .delete()
        .eq('list_id', listId)
        .in('id', memberIds)

      if (deleteError) throw deleteError

      setMembers(prev => prev.filter(m => !memberIds.includes(m.id)))
      setList(prev => prev ? { ...prev, member_count: Math.max(0, prev.member_count - memberIds.length) } : null)

      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error removing members:', err)
      setError(message)
      return false
    }
  }, [listId])

  const updateList = useCallback(async (data: Partial<CreateListData>): Promise<List | null> => {
    try {
      const supabase = createClient()

      const updateData: Record<string, unknown> = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.description !== undefined) updateData.description = data.description?.trim() || null
      if (data.type !== undefined) updateData.type = data.type
      if (data.filters !== undefined) updateData.filters = data.filters

      const { data: updatedList, error: updateError } = await supabase
        .from('lists')
        .update(updateData)
        .eq('id', listId)
        .select('*')
        .single()

      if (updateError) throw updateError

      setList(updatedList)
      return updatedList
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error updating list:', err)
      setError(message)
      return null
    }
  }, [listId])

  const deleteList = useCallback(async (): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId)

      if (deleteError) throw deleteError

      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Error deleting list:', err)
      setError(message)
      return false
    }
  }, [listId])

  // Initial fetch
  useEffect(() => {
    fetchList()
  }, [fetchList])

  return {
    list,
    members,
    isLoading,
    error,
    fetchList,
    addMembers,
    removeMember,
    removeMembers,
    updateList,
    deleteList,
  }
}
