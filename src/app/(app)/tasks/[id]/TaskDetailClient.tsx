'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface TaskData {
  id: number
  uuid: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
}

interface TaskDetailClientProps {
  task: TaskData
  organizationId: number
  userId: string
}

export function TaskDetailClient({ task, organizationId, userId }: TaskDetailClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState(task.priority)
  const [dueDate, setDueDate] = useState(task.due_date?.split('T')[0] || '')

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Le titre est obligatoire')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const updateData: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        due_date: dueDate || null,
        updated_at: new Date().toISOString(),
      }

      // Set completed_at if status is completed
      if (status === 'completed' && task.status !== 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else if (status !== 'completed') {
        updateData.completed_at = null
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id)
        .eq('organization_id', organizationId)

      if (updateError) throw updateError

      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setTitle(task.title)
    setDescription(task.description || '')
    setStatus(task.status)
    setPriority(task.priority)
    setDueDate(task.due_date?.split('T')[0] || '')
    setIsEditing(false)
    setError(null)
  }

  const handleDelete = async () => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette tache ?')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: deleteError } = await supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', task.id)
        .eq('organization_id', organizationId)

      if (deleteError) throw deleteError

      router.push('/tasks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      setIsLoading(false)
    }
  }

  const handleQuickStatusChange = async (newStatus: 'pending' | 'in_progress' | 'completed') => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }

      const { error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id)
        .eq('organization_id', organizationId)

      if (updateError) throw updateError

      setStatus(newStatus)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise a jour')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            Actions rapides
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FDE8E5] rounded-xl text-sm text-[#B42318]">
            {error}
          </div>
        )}

        {/* Quick status buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleQuickStatusChange('pending')}
            disabled={isLoading || status === 'pending'}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${status === 'pending'
                ? 'bg-[#F5F7F9] text-[#9BA0A6] cursor-default'
                : 'bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-[#30363D] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-[#0D0F14] dark:text-[#E6EDF3]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            À faire
          </button>
          <button
            onClick={() => handleQuickStatusChange('in_progress')}
            disabled={isLoading || status === 'in_progress'}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${status === 'in_progress'
                ? 'bg-[#E3F2FD] text-[#1565C0] cursor-default'
                : 'bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-[#30363D] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-[#0D0F14] dark:text-[#E6EDF3]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            En cours
          </button>
          <button
            onClick={() => handleQuickStatusChange('completed')}
            disabled={isLoading || status === 'completed'}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${status === 'completed'
                ? 'bg-[#E8F5E9] text-[#147A3A] cursor-default'
                : 'bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-[#30363D] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-[#0D0F14] dark:text-[#E6EDF3]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Terminé
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 px-4 py-2.5 bg-[#17191F] text-white rounded-xl text-sm font-medium hover:bg-[#2D2F36] transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-[#B42318]/20 text-[#B42318] rounded-xl text-sm font-medium hover:bg-[#FDE8E5] transition-colors disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      </div>
    )
  }

  // Edit form
  return (
    <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-6">
        Modifier la tache
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-[#FDE8E5] rounded-xl text-sm text-[#B42318]">
          {error}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1.5">
            Titre *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#F5F7F9] dark:bg-white/[0.05] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
            placeholder="Titre de la tache"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 bg-[#F5F7F9] dark:bg-white/[0.05] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] resize-none"
            placeholder="Description de la tache..."
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1.5">
            Statut
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full px-3 py-2.5 bg-[#F5F7F9] dark:bg-white/[0.05] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
          >
            <option value="pending">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1.5">
            Priorité
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="w-full px-3 py-2.5 bg-[#F5F7F9] dark:bg-white/[0.05] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1.5">
            Échéance
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#F5F7F9] dark:bg-white/[0.05] border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-[#17191F] text-white rounded-xl text-sm font-medium hover:bg-[#2D2F36] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-[#30363D] text-[#0D0F14] dark:text-[#E6EDF3] rounded-xl text-sm font-medium hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            Annulér
          </button>
        </div>
      </form>
    </div>
  )
}
