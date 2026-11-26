'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Lead = {
  id: number
  uuid: string
  first_name: string | null
  last_name: string | null
  email: string | null
  company_name: string | null
  status: string
}

type List = {
  id: number
  uuid: string
  name: string
  member_count: number
}

type AddToListModalProps = {
  isOpen: boolean
  onClose: () => void
  leads: Lead[]
  organizationId: number
  userId: string
  onSuccess?: (addedCount: number) => void
}

export function AddToListModal({
  isOpen,
  onClose,
  leads,
  organizationId,
  userId,
  onSuccess,
}: AddToListModalProps) {
  const [lists, setLists] = useState<List[]>([])
  const [selectedListId, setSelectedListId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch available lists
  useEffect(() => {
    if (!isOpen) return

    const fetchLists = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('lists')
          .select('id, uuid, name, member_count')
          .eq('organization_id', organizationId)
          .eq('type', 'static') // Only static lists can have manual members
          .order('name')

        if (fetchError) throw fetchError
        setLists(data || [])
      } catch (err: unknown) {
        console.error('Error fetching lists:', err)
        setError('Erreur lors du chargement des listes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLists()
  }, [isOpen, organizationId])

  const handleAddToList = useCallback(async () => {
    if (!selectedListId || leads.length === 0) return

    setIsAdding(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get existing members to avoid duplicates
      const { data: existingMembers, error: fetchError } = await supabase
        .from('list_members')
        .select('lead_id')
        .eq('list_id', selectedListId)
        .in('lead_id', leads.map(l => l.id))

      if (fetchError) throw fetchError

      const existingLeadIds = new Set(existingMembers?.map(m => m.lead_id) || [])
      const leadsToAdd = leads.filter(l => !existingLeadIds.has(l.id))

      if (leadsToAdd.length === 0) {
        setError('Tous les leads sont deja dans cette liste')
        setIsAdding(false)
        return
      }

      const membersToInsert = leadsToAdd.map(lead => ({
        list_id: selectedListId,
        lead_id: lead.id,
        added_by: userId,
      }))

      const { error: insertError } = await supabase
        .from('list_members')
        .insert(membersToInsert)

      if (insertError) throw insertError

      onSuccess?.(leadsToAdd.length)
      onClose()
    } catch (err: unknown) {
      console.error('Error adding to list:', err)
      setError('Erreur lors de l\'ajout a la liste')
    } finally {
      setIsAdding(false)
    }
  }, [selectedListId, leads, userId, onSuccess, onClose])

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getLeadName = (lead: Lead) => {
    const firstName = lead.first_name || ''
    const lastName = lead.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || lead.email || 'Sans nom'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[20px] shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EFF1F3]">
          <div>
            <h2 className="text-xl font-semibold text-[#0D0F14]">Ajouter a une liste</h2>
            <p className="text-sm text-[#4E525A] mt-1">
              {leads.length} lead{leads.length > 1 ? 's' : ''} selectionne{leads.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[10px] hover:bg-[#F5F7F9] flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-[#FDE8E5] border border-[#B42318]/20 rounded-[10px] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-[#B42318]">{error}</p>
          </div>
        )}

        {/* Search */}
        <div className="p-6 pb-4 border-b border-[#EFF1F3]">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une liste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E4E6] rounded-[10px] text-sm focus:outline-none focus:border-[#17191F] transition-colors"
            />
          </div>
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#17191F] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLists.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F5F7F9] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-[#4E525A]">
                {searchQuery ? 'Aucune liste trouvee' : 'Aucune liste statique disponible'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-[12px] border-2 transition-all ${
                    selectedListId === list.id
                      ? 'border-[#17191F] bg-[#F5F7F9]'
                      : 'border-[#E2E4E6] hover:border-[#C5C9CE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedListId === list.id ? 'border-[#17191F] bg-[#17191F]' : 'border-[#C5C9CE]'
                      }`}
                    >
                      {selectedListId === list.id && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-[#0D0F14]">{list.name}</span>
                  </div>
                  <span className="text-sm text-[#4E525A]">
                    {list.member_count} membre{list.member_count > 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected leads preview */}
        {leads.length <= 5 && leads.length > 0 && (
          <div className="px-6 py-3 border-t border-[#EFF1F3] bg-[#F5F7F9]">
            <p className="text-xs text-[#4E525A] mb-2">Leads a ajouter:</p>
            <div className="flex flex-wrap gap-1.5">
              {leads.map((lead) => (
                <span
                  key={lead.id}
                  className="px-2 py-1 bg-white border border-[#E2E4E6] rounded-md text-xs text-[#0D0F14]"
                >
                  {getLeadName(lead)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-[#EFF1F3]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-[#E2E4E6] text-[#0D0F14] rounded-[10px] font-medium hover:bg-[#F5F7F9] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleAddToList}
            disabled={!selectedListId || isAdding}
            className="flex-1 px-4 py-2.5 bg-[#17191F] text-white rounded-[10px] font-medium hover:bg-[#2A2D35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Ajout...
              </span>
            ) : (
              'Ajouter a la liste'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
