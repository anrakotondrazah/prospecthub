'use client'

import { useState, useCallback } from 'react'
import { CreateNoteModal } from './CreateNoteModal'
import { LogCallModal } from './LogCallModal'

interface DealActionsProps {
  dealId: number
}

export function DealActions({ dealId }: DealActionsProps) {
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [callModalOpen, setCallModalOpen] = useState(false)

  const handleNoteCreated = useCallback(() => {
    // Could trigger a refresh of activities here via router.refresh() if needed
  }, [])

  const handleCallLogged = useCallback(() => {
    // Could trigger a refresh of activities here
  }, [])

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={() => setNoteModalOpen(true)}
          className="w-full px-4 py-2.5 bg-[#0066FF] text-white rounded-xl text-sm font-medium hover:bg-[#0052CC] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Ajouter note
        </button>
        <button
          onClick={() => setCallModalOpen(true)}
          className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl text-sm font-medium hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
          Enregistrer appel
        </button>
      </div>

      <CreateNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onNoteCreated={handleNoteCreated}
        associatedDealId={dealId}
      />

      <LogCallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        onCallLogged={handleCallLogged}
        associatedDealId={dealId}
      />
    </>
  )
}
