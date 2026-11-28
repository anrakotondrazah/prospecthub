'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Avatar,
  AvatarImage,
  AvatarText,
  AvatarBadge,
  AvatarBadgeStatus,
  AvatarGroup,
  AvatarGroupAction,
  StatusVariant,
} from '@/components/ui/Avatar'

interface TeamMember {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  status: StatusVariant
  last_seen: string | null
}

interface TeamPresenceProps {
  organizationId: number
  compact?: boolean
  max?: number
  showLabels?: boolean
}

export function TeamPresence({
  organizationId,
  compact = false,
  max = 5,
  showLabels = true,
}: TeamPresenceProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMembers() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, settings')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .limit(20)

        if (error) throw error

        const membersWithStatus: TeamMember[] = (data || []).map((member) => {
          const settings = member.settings as Record<string, unknown> || {}
          const presenceStatus = (settings.presence_status as StatusVariant) || 'offline'

          return {
            id: member.id,
            first_name: member.first_name,
            last_name: member.last_name,
            avatar_url: member.avatar_url,
            status: presenceStatus,
            last_seen: null,
          }
        })

        setMembers(membersWithStatus)
      } catch (error) {
        console.error('Error fetching team members:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()

    // Subscribe to realtime presence updates
    const supabase = createClient()
    const channel = supabase.channel(`team-presence-${organizationId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setMembers(prev => prev.map(member => {
          const userPresence = state[member.id]
          if (userPresence && userPresence.length > 0) {
            const presence = userPresence[0] as { status?: StatusVariant }
            return { ...member, status: presence.status || 'online' }
          }
          return member
        }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId])

  const getInitials = (member: TeamMember): string => {
    const first = member.first_name?.[0] || ''
    const last = member.last_name?.[0] || ''
    return (first + last).toUpperCase() || '?'
  }

  const getFullName = (member: TeamMember): string => {
    return `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Membre'
  }

  const getStatusLabel = (status: StatusVariant): string => {
    const labels: Record<StatusVariant, string> = {
      'online': 'En ligne',
      'busy': 'Occupe',
      'away': 'Absent',
      'offline': 'Hors ligne',
      'do-not-disturb': 'Ne pas deranger',
      'recording': 'En enregistrement',
      'typing': 'Ecrit...',
      'in-call': 'En appel',
    }
    return labels[status]
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full bg-[#F5F7F9] dark:bg-[#21262D] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-[#9BA0A6] dark:text-[#8B949E]">
        Aucun membre dans l'equipe
      </p>
    )
  }

  // Compact mode: AvatarGroup
  if (compact) {
    const onlineCount = members.filter(m => m.status === 'online' || m.status === 'in-call').length

    return (
      <div className="flex items-center gap-3">
        <AvatarGroup size="sm" max={max}>
          {members.map((member) => (
            <Avatar key={member.id} variant="default">
              {member.avatar_url ? (
                <AvatarImage src={member.avatar_url} alt={getFullName(member)} />
              ) : (
                <AvatarText>{getInitials(member)}</AvatarText>
              )}
              <AvatarBadge position="bottom">
                <AvatarBadgeStatus status={member.status} />
              </AvatarBadge>
            </Avatar>
          ))}
        </AvatarGroup>
        {showLabels && (
          <span className="text-xs text-[#4E525A] dark:text-[#8B949E]">
            {onlineCount} en ligne
          </span>
        )}
      </div>
    )
  }

  // Full mode: List with names
  return (
    <div className="space-y-2">
      {members.slice(0, max).map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5F7F9] dark:hover:bg-[#0D1117] transition-colors"
        >
          <Avatar size="md" variant="default">
            {member.avatar_url ? (
              <AvatarImage src={member.avatar_url} alt={getFullName(member)} />
            ) : (
              <AvatarText>{getInitials(member)}</AvatarText>
            )}
            <AvatarBadge position="bottom">
              <AvatarBadgeStatus status={member.status} />
            </AvatarBadge>
          </Avatar>
          {showLabels && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
                {getFullName(member)}
              </p>
              <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                {getStatusLabel(member.status)}
              </p>
            </div>
          )}
        </div>
      ))}
      {members.length > max && (
        <div className="text-center pt-2">
          <span className="text-xs text-[#4E525A] dark:text-[#8B949E]">
            +{members.length - max} autres membres
          </span>
        </div>
      )}
    </div>
  )
}

// Quick status selector for the current user
interface StatusSelectorProps {
  currentStatus: StatusVariant
  onStatusChange: (status: StatusVariant) => void
}

export function StatusSelector({ currentStatus, onStatusChange }: StatusSelectorProps) {
  const statuses: Array<{ value: StatusVariant; label: string; color: string }> = [
    { value: 'online', label: 'En ligne', color: 'bg-[#16A34A]' },
    { value: 'busy', label: 'Occupe', color: 'bg-[#B42318]' },
    { value: 'away', label: 'Absent', color: 'bg-[#E65100]' },
    { value: 'do-not-disturb', label: 'Ne pas deranger', color: 'bg-[#B42318]' },
    { value: 'offline', label: 'Invisible', color: 'bg-[#9BA0A6]' },
  ]

  return (
    <div className="p-2 bg-white dark:bg-[#161B22] rounded-xl border border-[#E2E4E6] dark:border-[#30363D] shadow-lg">
      <p className="text-xs font-medium text-[#9BA0A6] dark:text-[#8B949E] px-2 pb-2">
        Changer le statut
      </p>
      <div className="space-y-0.5">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              currentStatus === status.value
                ? 'bg-[#0066FF]/5 text-[#0066FF]'
                : 'hover:bg-[#F5F7F9] dark:hover:bg-[#0D1117] text-[#0D0F14] dark:text-[#E6EDF3]'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
            <span className="text-sm">{status.label}</span>
            {currentStatus === status.value && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
