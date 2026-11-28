'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Member = {
  id: number
  lead_id: number
  leads: {
    id: number
    uuid: string
    first_name: string | null
    last_name: string | null
    email: string | null
  }
}

type ListMemberActionsProps = {
  member: Member
  onRemove: (memberId: number, leadId: number) => void
  onExport?: (member: Member) => void
  isRemoving?: boolean
}

export function ListMemberActions({
  member,
  onRemove,
  onExport,
  isRemoving = false,
}: ListMemberActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRemove = () => {
    setIsOpen(false)
    onRemove(member.id, member.lead_id)
  }

  const handleExport = () => {
    setIsOpen(false)
    onExport?.(member)
  }

  const getLeadName = () => {
    const firstName = member.leads.first_name || ''
    const lastName = member.leads.last_name || ''
    return `${firstName} ${lastName}`.trim() || member.leads.email || 'Sans nom'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isRemoving}
        className="p-1.5 rounded-[8px] hover:bg-[#F5F7F9] text-[#4E525A] hover:text-[#0D0F14] transition-colors disabled:opacity-50"
        aria-label="Actions"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-[12px] border border-[#E2E4E6] shadow-lg z-20 py-1.5">
          <Link
            href={`/leads/${member.leads.id}`}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#0D0F14] hover:bg-[#F5F7F9] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Voir le lead
          </Link>

          {member.leads.email && (
            <a
              href={`mailto:${member.leads.email}`}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#0D0F14] hover:bg-[#F5F7F9] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Envoyér un email
            </a>
          )}

          {onExport && (
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0D0F14] hover:bg-[#F5F7F9] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exporter
            </button>
          )}

          <div className="border-t border-[#EFF1F3] my-1.5" />

          <button
            onClick={handleRemove}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#B42318] hover:bg-[#FDE8E5] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Retirer de la liste
          </button>
        </div>
      )}
    </div>
  )
}
