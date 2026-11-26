'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EntityType } from './AssociationPicker'

export interface Association {
  id: number
  related_type: EntityType
  related_id: number
  related_name: string
  related_subtitle?: string
  related_uuid?: string
  direction: 'incoming' | 'outgoing'
  created_at: string
}

interface AssociationListProps {
  associations: Association[]
  onRemove?: (associationId: number) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function AssociationList({
  associations,
  onRemove,
  isLoading = false,
  emptyMessage = 'Aucune association',
}: AssociationListProps) {
  const [removingId, setRemovingId] = useState<number | null>(null)

  const handleRemove = async (associationId: number) => {
    if (!onRemove) return

    setRemovingId(associationId)
    try {
      await onRemove(associationId)
    } finally {
      setRemovingId(null)
    }
  }

  const getTypeLabel = (type: EntityType): string => {
    const labels: Record<EntityType, string> = {
      leads: 'Lead',
      companies: 'Entreprise',
      deals: 'Affaire',
      contacts: 'Contact',
    }
    return labels[type]
  }

  const getTypeColor = (type: EntityType): string => {
    const colors: Record<EntityType, string> = {
      leads: 'bg-[#E3F2FD] text-[#1565C0]',
      companies: 'bg-[#F3E5F5] text-[#7B1FA2]',
      deals: 'bg-[#E8F5E9] text-[#2E7D32]',
      contacts: 'bg-[#FFF3E0] text-[#E65100]',
    }
    return colors[type]
  }

  const getEntityPath = (type: EntityType, uuid?: string, id?: number): string => {
    const identifier = uuid || id
    const paths: Record<EntityType, string> = {
      leads: `/leads/${identifier}`,
      companies: `/companies/${identifier}`,
      deals: `/deals/${identifier}`,
      contacts: `/leads/${identifier}`,
    }
    return paths[type]
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3 bg-[#F5F7F9] dark:bg-white/[0.05] rounded-xl animate-pulse"
          >
            <div className="flex items-center gap-2">
              <div className="w-16 h-4 bg-black/[0.08] dark:bg-white/[0.1] rounded" />
              <div className="flex-1">
                <div className="w-24 h-4 bg-black/[0.08] dark:bg-white/[0.1] rounded mb-1" />
                <div className="w-16 h-3 bg-black/[0.08] dark:bg-white/[0.1] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (associations.length === 0) {
    return (
      <p className="text-sm text-[#9BA0A6] dark:text-[#8B949E] py-4 text-center">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {associations.map((association) => (
        <div
          key={association.id}
          className="p-3 bg-[#F5F7F9] dark:bg-white/[0.05] rounded-xl group hover:bg-[#EFF1F3] dark:hover:bg-white/[0.08] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${getTypeColor(association.related_type)}`}>
              {getTypeLabel(association.related_type)}
            </span>
            <div className="flex-1 min-w-0">
              <Link
                href={getEntityPath(association.related_type, association.related_uuid, association.related_id)}
                className="text-sm font-medium text-[#0066FF] hover:underline truncate block"
              >
                {association.related_name}
              </Link>
              {association.related_subtitle && (
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] truncate">
                  {association.related_subtitle}
                </p>
              )}
            </div>
            {onRemove && (
              <button
                onClick={() => handleRemove(association.id)}
                disabled={removingId === association.id}
                className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FDE8E5] text-[#9BA0A6] hover:text-[#B42318] transition-all disabled:opacity-50"
                title="Supprimer l'association"
              >
                {removingId === association.id ? (
                  <svg
                    className="animate-spin"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
