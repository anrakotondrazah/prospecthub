'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EmptyState } from '@/components/ui/EmptyState'

type List = {
  id: number
  uuid: string
  name: string
  description: string | null
  type: 'static' | 'dynamic'
  member_count: number
  created_at: string
  updated_at: string
}

type Lead = {
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

type Member = {
  id: number
  lead_id: number
  added_at: string
  leads: Lead
}

type SupabaseMember = {
  id: number
  lead_id: number
  added_at: string
  leads: Lead[]
}

type AvailableLead = {
  id: number
  uuid: string
  first_name: string | null
  last_name: string | null
  email: string | null
  company_name: string | null
  status: string
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacte',
  qualified: 'Qualifie',
  unqualified: 'Non qualifie',
  nurturing: 'En maturation',
  converted: 'Converti',
  lost: 'Perdu',
}

type ListDetailClientProps = {
  list: List
  initialMembers: Member[]
  availableLeads: AvailableLead[]
  organizationId: number
  userId: string
}

export function ListDetailClient({ list, initialMembers, availableLeads, organizationId, userId }: ListDetailClientProps) {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [memberCount, setMemberCount] = useState(list.member_count)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const memberLeadIds = new Set(members.map(m => m.lead_id))
  const leadsToAdd = availableLeads.filter(lead => !memberLeadIds.has(lead.id))

  const handleAddLeads = async (leadIds: number[]) => {
    if (leadIds.length === 0) return

    try {
      const supabase = createClient()

      const membersToInsert = leadIds.map(leadId => ({
        list_id: list.id,
        lead_id: leadId,
        added_by: userId,
      }))

      const { data, error } = await supabase
        .from('list_members')
        .insert(membersToInsert)
        .select(`
          id,
          lead_id,
          added_at,
          leads (
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

      if (error) throw error

      const supabaseData = data as SupabaseMember[]
      const mappedMembers: Member[] = supabaseData.map(member => ({
        ...member,
        leads: member.leads[0]
      }))

      setMembers([...mappedMembers, ...members])
      setMemberCount(memberCount + mappedMembers.length)
      setIsAddModalOpen(false)
    } catch (err: any) {
      console.error('Error adding leads:', err)
      alert('Erreur lors de lajout des leads')
    }
  }

  const handleRemoveMember = async (memberId: number, leadId: number) => {
    if (!confirm('Voulez-vous vraiment retirer ce lead de la liste ?')) return

    setDeletingMemberId(memberId)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('list_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMembers(members.filter(m => m.id !== memberId))
      setMemberCount(memberCount - 1)
    } catch (err: any) {
      console.error('Error removing member:', err)
      alert('Erreur lors du retrait du lead')
    } finally {
      setDeletingMemberId(null)
    }
  }

  const handleDeleteList = async () => {
    if (!confirm(`Voulez-vous vraiment supprimer la liste "${list.name}" ? Cette action est irreversible.`)) return

    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('lists').delete().eq('id', list.id)
      if (error) throw error
      router.push('/lists')
    } catch (err: any) {
      console.error('Error deleting list:', err)
      alert('Erreur lors de la suppression de la liste')
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLeadName = (lead: Lead | AvailableLead) => {
    const firstName = lead.first_name || ''
    const lastName = lead.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()
    return fullName || lead.email || 'Sans nom'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-[#E8F5E9] text-[#147A3A]',
      contacted: 'bg-[#E3F2FD] text-[#1565C0]',
      qualified: 'bg-[#F3E8FF] text-[#6B21A8]',
      unqualified: 'bg-[#F5F7F9] text-[#4E525A]',
      nurturing: 'bg-[#FFF3E0] text-[#E65100]',
      converted: 'bg-[#E8F5E9] text-[#147A3A]',
      lost: 'bg-[#FDE8E5] text-[#B42318]',
    }
    return colors[status] || colors.new
  }

  const filteredMembers = members.filter(member => {
    const leadName = getLeadName(member.leads).toLowerCase()
    const companyName = member.leads.company_name?.toLowerCase() || ''
    const email = member.leads.email?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return leadName.includes(query) || companyName.includes(query) || email.includes(query)
  })

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm mb-4">
        <Link href="/lists" className="text-muted-foreground hover:text-foreground">Listes</Link>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-foreground font-medium">{list.name}</span>
      </nav>

      <div className="bg-card rounded-[14px] border border-border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-foreground">{list.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                list.type === 'static' ? 'bg-[#E8F5E9] text-[#147A3A]' : 'bg-[#E3F2FD] text-[#1565C0]'
              }`}>
                {list.type === 'static' ? 'Statique' : 'Dynamique'}
              </span>
            </div>
            {list.description && <p className="text-muted-foreground">{list.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-[#17191F] text-white rounded-[10px] font-medium hover:bg-[#2A2D35] transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ajouter des leads
            </button>
            <button
              onClick={handleDeleteList}
              disabled={isDeleting}
              className="px-4 py-2.5 bg-card border border-border text-[#B42318] rounded-[10px] font-medium hover:bg-[#FDE8E5] dark:hover:bg-[#B42318]/20 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium text-foreground">{memberCount}</span> membres
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Cree le {formatDate(list.created_at)}
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Mis a jour le {formatDate(list.updated_at)}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher dans les membres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {filteredMembers.length === 0 && !searchQuery ? (
        <div className="bg-white dark:bg-[#0D1117] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D]">
          <EmptyState type="lists" action={() => setIsAddModalOpen(true)} />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-[#0D1117] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F7F9] dark:bg-[#161B22] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Aucun résultat</h3>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Essayez avec d'autres mots-clés</p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-[14px] border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nom</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entreprise</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ajoute le</th>
                <th className="w-12 px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-muted transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/leads/${member.leads.id}`} className="block">
                      <div className="flex items-center gap-2">
                        {member.leads.is_hot && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#F97316" stroke="#F97316" strokeWidth="2">
                            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                        )}
                        <span className="font-medium text-foreground hover:text-foreground/80">{getLeadName(member.leads)}</span>
                      </div>
                      {member.leads.job_title && <p className="text-sm text-muted-foreground mt-0.5">{member.leads.job_title}</p>}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-foreground">{member.leads.company_name || '-'}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{member.leads.email || '-'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(member.leads.status)}`}>
                      {STATUS_LABELS[member.leads.status] || 'Nouveau'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-foreground rounded-full" style={{ width: `${member.leads.score}%` }} />
                      </div>
                      <span className="text-sm font-medium text-foreground w-8 text-right">{member.leads.score}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(member.added_at)}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleRemoveMember(member.id, member.lead_id)}
                      disabled={deletingMemberId === member.id}
                      className="text-[#B42318] hover:text-[#8F1D14] transition-colors disabled:opacity-50"
                      title="Retirer de la liste"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAddModalOpen && (
        <AddLeadsModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddLeads={handleAddLeads}
          availableLeads={leadsToAdd}
        />
      )}
    </div>
  )
}

function AddLeadsModal({ isOpen, onClose, onAddLeads, availableLeads }: {
  isOpen: boolean
  onClose: () => void
  onAddLeads: (leadIds: number[]) => void
  availableLeads: AvailableLead[]
}) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLeads = availableLeads.filter(lead => {
    const firstName = lead.first_name || ''
    const lastName = lead.last_name || ''
    const fullName = `${firstName} ${lastName}`.trim()
    const name = fullName || lead.email || ''
    const companyName = lead.company_name || ''
    const query = searchQuery.toLowerCase()
    return name.toLowerCase().includes(query) || companyName.toLowerCase().includes(query)
  })

  const toggleLead = (leadId: number) => {
    const newSelected = new Set(selectedLeadIds)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeadIds(newSelected)
  }

  const handleSubmit = () => {
    onAddLeads(Array.from(selectedLeadIds))
    setSelectedLeadIds(new Set())
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-card rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Ajouter des leads</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? 's' : ''} selectionne{selectedLeadIds.size > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[10px] hover:bg-muted flex items-center justify-center transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 pb-4 border-b border-border">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher des leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'Aucun lead trouve' : 'Tous les leads sont deja dans cette liste'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeads.map((lead) => {
                const isSelected = selectedLeadIds.has(lead.id)
                const firstName = lead.first_name || ''
                const lastName = lead.last_name || ''
                const fullName = `${firstName} ${lastName}`.trim()
                const displayName = fullName || lead.email || 'Sans nom'

                return (
                  <button
                    key={lead.id}
                    onClick={() => toggleLead(lead.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-[10px] border-2 transition-all ${
                      isSelected ? 'border-foreground bg-muted' : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-muted-foreground'
                    }`}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{displayName}</p>
                      {lead.company_name && <p className="text-sm text-muted-foreground">{lead.company_name}</p>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md ${
                      lead.status === 'new' ? 'bg-[#E8F5E9] text-[#147A3A]' :
                      lead.status === 'contacted' ? 'bg-[#E3F2FD] text-[#1565C0]' :
                      'bg-[#F5F7F9] text-[#4E525A]'
                    }`}>
                      {STATUS_LABELS[lead.status] || 'Nouveau'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-card border border-border text-foreground rounded-[10px] font-medium hover:bg-muted transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedLeadIds.size === 0}
            className="flex-1 px-4 py-2.5 bg-[#17191F] text-white rounded-[10px] font-medium hover:bg-[#2A2D35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ajouter {selectedLeadIds.size > 0 && `(${selectedLeadIds.size})`}
          </button>
        </div>
      </div>
    </div>
  )
}
