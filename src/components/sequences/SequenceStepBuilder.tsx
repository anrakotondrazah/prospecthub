'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SequenceStep {
  id: number
  step_order: number
  step_type: 'email' | 'task' | 'delay'
  delay_days: number
  delay_hours: number
  subject: string | null
  body: string | null
  task_title: string | null
  task_description: string | null
  template_id: number | null
  created_at: string
}

interface SequenceStepBuilderProps {
  sequenceId: number
  steps: SequenceStep[]
  onStepsReordered: () => void
  onAddStep: () => void
  onEditStep: (step: SequenceStep) => void
  onDeleteStep: (stepId: number) => void
}

const STEP_TYPE_CONFIG = {
  email: {
    label: 'Email',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    color: 'bg-[#0066FF]',
    lightColor: 'bg-[#0066FF]/10',
  },
  task: {
    label: 'Tâche',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    color: 'bg-[#E65100]',
    lightColor: 'bg-[#E65100]/10',
  },
  delay: {
    label: 'Délai',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: 'bg-[#9BA0A6]',
    lightColor: 'bg-[#9BA0A6]/10',
  },
}

function formatDelay(days: number, hours: number): string {
  if (days === 0 && hours === 0) return 'Immédiatement'
  const parts: string[] = []
  if (days > 0) parts.push(`${days}j`)
  if (hours > 0) parts.push(`${hours}h`)
  return parts.join(' ')
}

interface SortableStepItemProps {
  step: SequenceStep
  onEdit: (step: SequenceStep) => void
  onDelete: (stepId: number) => void
}

function SortableStepItem({ step, onEdit, onDelete }: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = STEP_TYPE_CONFIG[step.step_type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative
        ${isDragging ? 'opacity-50 z-50' : ''}
      `}
    >
      <div
        className={`
          relative flex items-start gap-3 p-4 rounded-xl
          bg-white dark:bg-[#161B22]
          border border-[#E2E4E6] dark:border-[#30363D]
          hover:border-[#0066FF]/30 dark:hover:border-[#0066FF]/30
          transition-all duration-200
          ${isDragging ? 'shadow-lg' : 'shadow-sm'}
        `}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="
            flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing
            text-[#9BA0A6] dark:text-[#8B949E]
            hover:text-[#0D0F14] dark:hover:text-[#E6EDF3]
            transition-colors
          "
          aria-label="Déplacer l'étape"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
        </button>

        {/* Step icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.lightColor} flex items-center justify-center`}>
          <div className="text-[#0D0F14] dark:text-[#E6EDF3]">
            {config.icon}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 min-w-0">
          {/* Header: type badge + step number */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase rounded ${config.lightColor} text-[#0D0F14] dark:text-[#E6EDF3]`}>
              {config.label}
            </span>
            <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
              Étape {step.step_order}
            </span>
          </div>

          {/* Delay info */}
          {(step.delay_days > 0 || step.delay_hours > 0) && (
            <div className="flex items-center gap-2 mb-2 text-xs text-[#9BA0A6] dark:text-[#8B949E]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Attendre {formatDelay(step.delay_days, step.delay_hours)}</span>
            </div>
          )}

          {/* Step details */}
          {step.step_type === 'email' && (
            <div>
              <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] line-clamp-1">
                {step.subject || 'Sans objet'}
              </p>
              {step.body && (
                <p className="text-xs text-[#4E525A] dark:text-[#8B949E] line-clamp-2 mt-1">
                  {step.body}
                </p>
              )}
              {step.template_id && (
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mt-1">
                  Template #{step.template_id}
                </p>
              )}
            </div>
          )}

          {step.step_type === 'task' && (
            <div>
              <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] line-clamp-1">
                {step.task_title || 'Sans titre'}
              </p>
              {step.task_description && (
                <p className="text-xs text-[#4E525A] dark:text-[#8B949E] line-clamp-2 mt-1">
                  {step.task_description}
                </p>
              )}
            </div>
          )}

          {step.step_type === 'delay' && (
            <div>
              <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">
                Pause de {formatDelay(step.delay_days, step.delay_hours)}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Edit button */}
          <button
            onClick={() => onEdit(step)}
            className="
              p-2 rounded-lg
              bg-white/60 dark:bg-[#0D1117]/60
              backdrop-blur-xl
              border border-[#E2E4E6]/50 dark:border-[#30363D]/50
              text-[#0D0F14] dark:text-[#E6EDF3]
              hover:bg-[#0066FF]/10 dark:hover:bg-[#0066FF]/20
              hover:border-[#0066FF]/30 dark:hover:border-[#0066FF]/30
              transition-all duration-200
            "
            aria-label="Modifier l'étape"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(step.id)}
            className="
              p-2 rounded-lg
              bg-white/60 dark:bg-[#0D1117]/60
              backdrop-blur-xl
              border border-[#E2E4E6]/50 dark:border-[#30363D]/50
              text-[#DA3633]
              hover:bg-[#DA3633]/10 dark:hover:bg-[#DA3633]/20
              hover:border-[#DA3633]/30 dark:hover:border-[#DA3633]/30
              transition-all duration-200
            "
            aria-label="Supprimer l'étape"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export function SequenceStepBuilder({
  sequenceId,
  steps,
  onStepsReordered,
  onAddStep,
  onEditStep,
  onDeleteStep,
}: SequenceStepBuilderProps) {
  const [localSteps, setLocalSteps] = useState(steps)
  const [isReordering, setIsReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = localSteps.findIndex((s) => s.id === active.id)
    const newIndex = localSteps.findIndex((s) => s.id === over.id)

    const reorderedSteps = arrayMove(localSteps, oldIndex, newIndex)

    // Update local state immediately for smooth UX
    setLocalSteps(reorderedSteps)
    setIsReordering(true)

    try {
      // Update step_order for the moved step
      const movedStep = reorderedSteps[newIndex]
      const newStepOrder = newIndex + 1

      const response = await fetch(`/api/sequences/${sequenceId}/steps/${movedStep.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_order: newStepOrder }),
      })

      if (!response.ok) {
        throw new Error('Failed to update step order')
      }

      // Refresh the full list to ensure consistency
      onStepsReordered()
    } catch (error) {
      console.error('Error reordering steps:', error)
      // Revert on error
      setLocalSteps(steps)
    } finally {
      setIsReordering(false)
    }
  }

  // Update local state when props change
  if (steps !== localSteps && !isReordering) {
    setLocalSteps(steps)
  }

  const sortedSteps = [...localSteps].sort((a, b) => a.step_order - b.step_order)

  if (sortedSteps.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F7F9] dark:bg-[#0D1117] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[#4E525A] dark:text-[#8B949E] mb-2">
          Aucune étape configurée
        </p>
        <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-6">
          Créez votre première étape pour commencer
        </p>
        <button
          onClick={onAddStep}
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-lg
            bg-[#0066FF]
            text-white text-sm font-medium
            hover:bg-[#0052CC]
            transition-colors duration-200
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter une étape
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">
            Étapes de la séquence
          </h3>
          <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mt-1">
            Glissez-déposez pour réorganiser
          </p>
        </div>
        <button
          onClick={onAddStep}
          className="
            inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
            bg-white/60 dark:bg-[#0D1117]/60
            backdrop-blur-xl
            border border-[#E2E4E6]/50 dark:border-[#30363D]/50
            text-[#0066FF] text-sm font-medium
            hover:bg-[#0066FF]/10 dark:hover:bg-[#0066FF]/20
            hover:border-[#0066FF]/30 dark:hover:border-[#0066FF]/30
            transition-all duration-200
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Drag-drop context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSteps.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sortedSteps.map((step) => (
              <SortableStepItem
                key={step.id}
                step={step}
                onEdit={onEditStep}
                onDelete={onDeleteStep}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Reordering indicator */}
      {isReordering && (
        <div className="flex items-center justify-center gap-2 text-xs text-[#9BA0A6] dark:text-[#8B949E] py-2">
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span>Réorganisation en cours...</span>
        </div>
      )}
    </div>
  )
}
