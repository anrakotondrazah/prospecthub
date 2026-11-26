'use client'

import { useState } from 'react'
import { useAssociations } from '@/hooks/useAssociations'
import { AssociationList, AssociateRecordModal } from '@/components/associations'

interface DealAssociationsProps {
  dealId: number
  organizationId: number
  userId: string
}

export function DealAssociations({ dealId, organizationId, userId }: DealAssociationsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    associations,
    isLoading,
    error,
    refetch,
    deleteAssociation,
  } = useAssociations({
    entityType: 'deals',
    entityId: dealId,
  })

  return (
    <>
      <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            Associations
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.05] text-[#9BA0A6] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
            title="Ajouter une association"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FDE8E5] rounded-xl text-sm text-[#B42318]">
            {error}
          </div>
        )}

        <AssociationList
          associations={associations}
          onRemove={deleteAssociation}
          isLoading={isLoading}
          emptyMessage="Aucune association. Cliquez sur + pour en ajouter."
        />
      </div>

      <AssociateRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssociated={refetch}
        organizationId={organizationId}
        userId={userId}
        sourceType="deals"
        sourceId={dealId}
      />
    </>
  )
}
