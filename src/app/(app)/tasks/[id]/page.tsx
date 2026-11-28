import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TaskDetailClient } from './TaskDetailClient'

export const instant = false

const TASK_TYPE_LABELS: Record<string, string> = {
  task: 'Tache',
  call: 'Appel',
  email: 'Email',
  meeting: 'Reunion',
  follow_up: 'Suivi',
  reminder: 'Rappel',
  other: 'Autre',
}

interface TaskOwner {
  id: string
  first_name: string
  last_name: string
}

interface AssociatedLead {
  id: number
  uuid: string
  first_name: string | null
  last_name: string | null
  email: string | null
}

interface AssociatedCompany {
  id: number
  uuid: string
  name: string
}

interface AssociatedDeal {
  id: number
  uuid: string
  name: string
}

interface Task {
  id: number
  uuid: string
  title: string
  description: string | null
  task_type: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  due_date: string | null
  completed_at: string | null
  reminder_at: string | null
  created_at: string
  updated_at: string
  assigned_to_profile: TaskOwner | TaskOwner[] | null
  created_by_profile: TaskOwner | TaskOwner[] | null
  lead: AssociatedLead | AssociatedLead[] | null
  company: AssociatedCompany | AssociatedCompany[] | null
  deal: AssociatedDeal | AssociatedDeal[] | null
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id as number | null
  if (!orgId) return notFound()

  // Fetch task with relations
  const { data: task, error } = await supabase
    .from('tasks')
    .select(`
      id,
      uuid,
      title,
      description,
      task_type,
      priority,
      status,
      due_date,
      completed_at,
      reminder_at,
      created_at,
      updated_at,
      assigned_to_profile:profiles!tasks_assigned_to_fkey(id, first_name, last_name),
      created_by_profile:profiles!tasks_created_by_fkey(id, first_name, last_name),
      lead:leads(id, uuid, first_name, last_name, email),
      company:companies(id, uuid, name),
      deal:deals(id, uuid, name)
    `)
    .eq('uuid', id)
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .single()

  if (error || !task) {
    return notFound()
  }

  // Normalize relations
  const assignedTo = Array.isArray(task.assigned_to_profile)
    ? task.assigned_to_profile[0]
    : task.assigned_to_profile
  const createdBy = Array.isArray(task.created_by_profile)
    ? task.created_by_profile[0]
    : task.created_by_profile
  const lead = Array.isArray(task.lead) ? task.lead[0] : task.lead
  const company = Array.isArray(task.company) ? task.company[0] : task.company
  const deal = Array.isArray(task.deal) ? task.deal[0] : task.deal

  const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
    high: { bg: 'bg-[#FDE8E5]', text: 'text-[#B42318]', label: 'Haute' },
    medium: { bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]', label: 'Moyenne' },
    low: { bg: 'bg-[#F5F7F9]', text: 'text-[#9BA0A6]', label: 'Faible' },
  }

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-[#F5F7F9]', text: 'text-[#9BA0A6]', label: 'À faire' },
    in_progress: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', label: 'En cours' },
    completed: { bg: 'bg-[#E8F5E9]', text: 'text-[#147A3A]', label: 'Terminé' },
  }

  const priority = priorityConfig[task.priority] || priorityConfig.medium
  const status = statusConfig[task.status] || statusConfig.pending

  // Check if task is overdue
  const isOverdue = task.due_date
    && new Date(task.due_date) < new Date()
    && task.status !== 'completed'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/tasks"
          className="w-9 h-9 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-all duration-200 active:scale-95"
          aria-label="Retour aux taches"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
            {task.title}
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${priority.bg} ${priority.text}`}>
              {priority.label}
            </span>
            {isOverdue && (
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-[#FDE8E5] text-[#B42318]">
                En retard
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm">
            <h2 className="text-sm font-medium text-[#9BA0A6] dark:text-[#8B949E] mb-2">Description</h2>
            <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3] whitespace-pre-wrap">
              {task.description || 'Aucune description'}
            </p>
          </div>

          {/* Client component for editable form */}
          <TaskDetailClient
            task={{
              id: task.id,
              uuid: task.uuid,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              due_date: task.due_date,
            }}
            organizationId={orgId}
            userId={user.id}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">
              Details
            </h2>

            {/* Type */}
            <div>
              <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Type</p>
              <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                {TASK_TYPE_LABELS[task.task_type] || 'Tache'}
              </p>
            </div>

            {/* Due Date */}
            {task.due_date && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Échéance</p>
                <p className={`text-sm ${isOverdue ? 'text-[#B42318]' : 'text-[#0D0F14] dark:text-[#E6EDF3]'}`}>
                  {new Date(task.due_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Assignéd To */}
            {assignedTo && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Assigné à</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {assignedTo.first_name} {assignedTo.last_name}
                </p>
              </div>
            )}

            {/* Created By */}
            {createdBy && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Creee par</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {createdBy.first_name} {createdBy.last_name}
                </p>
              </div>
            )}

            {/* Created At */}
            <div>
              <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Creee le</p>
              <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                {new Date(task.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Completed At */}
            {task.completed_at && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Terminée le</p>
                <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3]">
                  {new Date(task.completed_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Associations Card */}
          <div className="bg-white/80 dark:bg-[#0D1117]/80 backdrop-blur-sm rounded-2xl border border-black/[0.08] dark:border-[#30363D] p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">
              Associe a
            </h2>

            {/* Associated Lead */}
            {lead && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Lead</p>
                <Link
                  href={`/leads/${lead.uuid}`}
                  className="text-sm font-medium text-[#0066FF] hover:underline"
                >
                  {lead.first_name} {lead.last_name}
                  {lead.email && <span className="text-[#9BA0A6] ml-1">({lead.email})</span>}
                </Link>
              </div>
            )}

            {/* Associated Company */}
            {company && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Entreprise</p>
                <Link
                  href={`/companies/${company.uuid}`}
                  className="text-sm font-medium text-[#0066FF] hover:underline"
                >
                  {company.name}
                </Link>
              </div>
            )}

            {/* Associated Deal */}
            {deal && (
              <div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E] mb-1">Affaire</p>
                <Link
                  href={`/deals/${deal.uuid}`}
                  className="text-sm font-medium text-[#0066FF] hover:underline"
                >
                  {deal.name}
                </Link>
              </div>
            )}

            {!lead && !company && !deal && (
              <p className="text-sm text-[#9BA0A6] dark:text-[#8B949E]">
                Aucune association
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
