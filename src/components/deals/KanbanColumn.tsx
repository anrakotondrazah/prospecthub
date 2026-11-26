'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DealCard, Deal } from './DealCard'

export interface PipelineStage {
  id: number
  name: string
  code: string
  color: string
  probability: number
  is_won: boolean
  is_lost: boolean
}

interface KanbanColumnProps {
  stage: PipelineStage
  deals: Deal[]
  totalValue: number
}

export function KanbanColumn({ stage, deals, totalValue }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  })

  return (
    <div
      className={`flex-shrink-0 w-[300px] bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] shadow-sm ${
        stage.is_lost ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-black/[0.06] dark:border-[#30363D]">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: stage.color }}
            aria-hidden="true"
          />
          <h3 className="font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {stage.name}
          </h3>
          <span className="text-sm text-[#9BA0A6] dark:text-[#8B949E]">
            {deals.length}
          </span>
        </div>
        <span className="text-xs font-medium text-[#9BA0A6] dark:text-[#8B949E]">
          {stage.probability}%
        </span>
      </div>

      {/* Total Value */}
      <div className="px-4 py-2.5 border-b border-black/[0.06] dark:border-[#30363D] bg-black/[0.02] dark:bg-white/[0.02]">
        <p className="text-xs text-[#4E525A] dark:text-[#8B949E] text-center font-medium">
          {totalValue.toLocaleString('fr-FR')} EUR
        </p>
      </div>

      {/* Deals List */}
      <div
        ref={setNodeRef}
        className={`p-3 space-y-2.5 min-h-[400px] transition-colors duration-200 ${
          isOver ? 'bg-[#0066FF]/5 dark:bg-[#58A6FF]/5' : ''
        }`}
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-[#9BA0A6] dark:text-[#8B949E]">
                Aucune affaire
              </p>
            </div>
          ) : (
            deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
          )}
        </SortableContext>
      </div>
    </div>
  )
}
