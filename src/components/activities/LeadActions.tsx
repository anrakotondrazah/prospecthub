'use client'

import { useState, useCallback } from 'react'
import { CreateNoteModal } from './CreateNoteModal'
import { LogCallModal } from './LogCallModal'

interface LeadActionsProps {
  leadId: number
}

export function LeadActions({ leadId }: LeadActionsProps) {
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [callModalOpen, setCallModalOpen] = useState(false)

  const handleNoteCreated = useCallback(() => {
    // Could trigger a refresh of activities here via router.refresh() if needed
    // For now, the modal closes and the note is saved
  }, [])

  const handleCallLogged = useCallback(() => {
    // Could trigger a refresh of activities here
  }, [])

  return (
    <>
      <div className="flex gap-2 mb-6">
        <button
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white/60 bg-[#17191F]/60 rounded-[10px] cursor-not-allowed"
          disabled
          title="Bientôt disponible"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Envoyer email
        </button>
        <button
          onClick={() => setCallModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#4E525A] border border-[#E2E4E6] rounded-[10px] hover:bg-[#F5F7F9] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
          Appeler
        </button>
        <button
          onClick={() => setNoteModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#4E525A] border border-[#E2E4E6] rounded-[10px] hover:bg-[#F5F7F9] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Ajouter note
        </button>
      </div>

      <CreateNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onNoteCreated={handleNoteCreated}
        associatedLeadId={leadId}
      />

      <LogCallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        onCallLogged={handleCallLogged}
        associatedLeadId={leadId}
      />
    </>
  )
}
