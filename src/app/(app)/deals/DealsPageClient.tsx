'use client'

import { useState, useMemo } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { KanbanColumn, PipelineStage } from '@/components/deals/KanbanColumn'
import { DealCard, Deal } from '@/components/deals/DealCard'
import { CreateDealModal } from '@/components/modals/CreateDealModal'
import { EmptyState } from '@/components/ui/EmptyState'

interface DealsPageClientProps {
  initialDeals: Deal[]
  initialStages: PipelineStage[]
  organizationId: number
  userId: string
}

export function DealsPageClient({
  initialDeals,
  initialStages,
  organizationId,
  userId,
}: DealsPageClientProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [stages] = useState<PipelineStage[]>(initialStages)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage.id] = deals.filter((d) => d.stage_id === stage.id)
      return acc
    }, {} as Record<number, Deal[]>)
  }, [deals, stages])

  // Calculate totals
  const totalValue = useMemo(() => {
    return deals.reduce((sum, d) => sum + (d.value || 0), 0)
  }, [deals])

  const weightedValue = useMemo(() => {
    return deals.reduce((sum, d) => {
      const stage = stages.find((s) => s.id === d.stage_id)
      return sum + (d.value || 0) * ((stage?.probability || 0) / 100)
    }, 0)
  }, [deals, stages])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const deal = deals.find((d) => d.id === active.id)
    setActiveDeal(deal || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveDeal(null)

    if (!over) return

    const dealId = active.id as number
    const overId = over.id as number

    // Validate that over.id is a valid stage_id (not a deal_id)
    const targetStage = stages.find((s) => s.id === overId)
    if (!targetStage) {
      // over.id is not a valid stage, might be a deal card
      return
    }

    const newStageId = targetStage.id

    // Find the deal
    const deal = deals.find((d) => d.id === dealId)
    if (!deal || deal.stage_id === newStageId) return

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage_id: newStageId } : d))
    )

    // Update in database
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('deals')
        .update({ stage_id: newStageId, updated_at: new Date().toISOString() })
        .eq('id', dealId)

      if (error) {
        console.error('Error updating deal stage:', error)
        // Revert on error
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage_id: deal.stage_id } : d))
        )
      }
    } catch (err) {
      console.error('Failed to update deal:', err)
      // Revert on error
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage_id: deal.stage_id } : d))
      )
    }
  }

  const handleDealCreated = (newDeal: Deal) => {
    setDeals((prev) => [newDeal, ...prev])
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
            Affaires
          </h1>
          <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
            {deals.length} affaire{deals.length !== 1 ? 's' : ''} •{' '}
            {totalValue.toLocaleString('fr-FR')} EUR total •{' '}
            {weightedValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} EUR pondéré
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#0066FF] rounded-xl hover:bg-[#0052CC] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle affaire
        </button>
      </div>

      {/* Kanban Board */}
      {deals.length === 0 ? (
        <div className="bg-white dark:bg-[#0D1117] rounded-2xl border border-[#E2E4E6] dark:border-[#30363D]">
          <EmptyState type="pipeline" action={() => setIsCreateModalOpen(true)} actionLabel="Créer une affaire" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          {stages
            .filter((s) => !s.is_lost)
            .map((stage) => {
              const stageDeals = dealsByStage[stage.id] || []
              const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)

              return (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  deals={stageDeals}
                  totalValue={stageTotal}
                />
              )
            })}

          {/* Lost Column (Read-only) */}
          {stages
            .filter((s) => s.is_lost)
            .map((stage) => {
              const stageDeals = dealsByStage[stage.id] || []
              const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)

              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-[240px] bg-white/60 dark:bg-[#0D1117]/60 backdrop-blur-sm rounded-2xl border border-black/[0.06] dark:border-[#30363D] opacity-60"
                >
                  <div className="flex items-center justify-between p-4 border-b border-black/[0.06] dark:border-[#30363D]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-semibold text-[#616161] dark:text-[#8B949E]">
                        {stage.name}
                      </h3>
                      <span className="text-sm text-[#9BA0A6] dark:text-[#8B949E]">
                        {stageDeals.length}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 border-b border-black/[0.06] dark:border-[#30363D] bg-black/[0.02] dark:bg-white/[0.02]">
                    <p className="text-xs text-[#4E525A] dark:text-[#8B949E] text-center">
                      {stageTotal.toLocaleString('fr-FR')} EUR
                    </p>
                  </div>
                  <div className="p-3 space-y-2 min-h-[200px]">
                    {stageDeals.length === 0 ? (
                      <p className="text-sm text-[#9BA0A6] dark:text-[#8B949E] text-center py-4">
                        -
                      </p>
                    ) : (
                      stageDeals.slice(0, 3).map((deal) => (
                        <div
                          key={deal.id}
                          className="p-2 bg-white/80 dark:bg-[#161B22]/80 rounded-lg text-xs text-[#616161] dark:text-[#8B949E] truncate"
                        >
                          {deal.name}
                        </div>
                      ))
                    )}
                    {stageDeals.length > 3 && (
                      <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] text-center">
                        +{stageDeals.length - 3} autres
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
        </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDeal ? <DealCard deal={activeDeal} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create Modal */}
      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDealCreated={handleDealCreated}
        organizationId={organizationId}
        userId={userId}
        stages={stages}
      />
    </div>
  )
}
