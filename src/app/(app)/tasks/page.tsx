import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NewTaskButton } from '@/components/tasks/NewTaskButton'

export const instant = false

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Erreur de chargement</h2>
          <p className="text-[#4E525A] dark:text-[#8B949E] mb-4">Impossible de charger votre profil.</p>
          <Link href="/tasks" className="text-[#17191F] dark:text-[#E6EDF3] font-medium hover:underline">Reessayer</Link>
        </div>
      </div>
    )
  }

  const orgId = profile?.organization_id as number | null
  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Organisation non configuree</h2>
          <p className="text-[#4E525A] dark:text-[#8B949E]">Completez votre onboarding pour acceder aux taches.</p>
        </div>
      </div>
    )
  }

  // Get tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, uuid, title, description, status, priority, due_date')
    .eq('organization_id', orgId)
    .order('due_date', { ascending: true })
    .limit(50)

  if (tasksError) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">Taches</h1>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Gerez vos taches et suivis</p>
          </div>
        </div>
        <div className="bg-card rounded-[14px] border border-border p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-foreground mb-2">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground mb-4">Impossible de charger les taches.</p>
            <Link href="/tasks" className="text-foreground font-medium hover:underline">Reessayer</Link>
          </div>
        </div>
      </div>
    )
  }

  // Normalize today's date to UTC for consistent comparison
  const now = new Date()
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().split('T')[0]

  const pendingTasks = tasks?.filter((t) => t.status === 'pending') || []
  const inProgressTasks = tasks?.filter((t) => t.status === 'in_progress') || []
  const completedTasks = tasks?.filter((t) => t.status === 'completed') || []

  return (
    <div>
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-foreground mb-1">Taches</h1>
          <p className="text-sm text-muted-foreground">
            Gerez vos taches et suivis
          </p>
        </div>
        <NewTaskButton />
      </div>

      {/* Task Columns - Responsive: horizontal scroll on mobile, grid on desktop */}
      <div className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
        {/* To Do */}
        <div className="flex-shrink-0 w-[280px] lg:w-auto bg-card rounded-[14px] border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#9BA0A6]" aria-hidden="true" />
              <h3 className="font-semibold text-foreground">A faire</h3>
              <span className="text-sm text-muted-foreground">{pendingTasks.length}</span>
            </div>
          </div>
          <div className="p-4 space-y-3 min-h-[300px]">
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune tache</p>
            ) : (
              pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} today={today} />
              ))
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="flex-shrink-0 w-[280px] lg:w-auto bg-card rounded-[14px] border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1565C0]" aria-hidden="true" />
              <h3 className="font-semibold text-foreground">En cours</h3>
              <span className="text-sm text-muted-foreground">{inProgressTasks.length}</span>
            </div>
          </div>
          <div className="p-4 space-y-3 min-h-[300px]">
            {inProgressTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune tache</p>
            ) : (
              inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} today={today} />
              ))
            )}
          </div>
        </div>

        {/* Done */}
        <div className="flex-shrink-0 w-[280px] lg:w-auto bg-card rounded-[14px] border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#147A3A]" aria-hidden="true" />
              <h3 className="font-semibold text-foreground">Termine</h3>
              <span className="text-sm text-muted-foreground">{completedTasks.length}</span>
            </div>
          </div>
          <div className="p-4 space-y-3 min-h-[300px]">
            {completedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune tache</p>
            ) : (
              completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} today={today} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Task {
  id: number
  uuid: string
  title: string
  description: string | null
  status: string
  priority: string | null
  due_date: string | null
}

function TaskCard({ task, today }: { task: Task; today: string }) {
  // Normalize due_date to date-only string for comparison
  const dueDate = task.due_date ? task.due_date.split('T')[0] : null
  const isOverdue = dueDate && dueDate < today && task.status !== 'completed'
  const isDueToday = dueDate === today

  const priorityColors: Record<string, string> = {
    urgent: 'bg-[#B71C1C] dark:bg-[#B71C1C]/30 text-white dark:text-[#FFCDD2]',
    high: 'bg-[#FFEBEE] dark:bg-[#C62828]/20 text-[#C62828] dark:text-[#EF9A9A]',
    medium: 'bg-[#FFF3E0] dark:bg-[#E65100]/20 text-[#E65100] dark:text-[#FFCC80]',
    low: 'bg-muted text-muted-foreground',
  }

  const priorityLabels: Record<string, string> = {
    urgent: 'Urgent',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
  }

  return (
    <Link
      href={`/tasks/${task.uuid}`}
      className="block p-3 bg-muted rounded-[10px] hover:bg-muted/80 transition-colors cursor-pointer"
      role="article"
      aria-label={`Tache: ${task.title}`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="font-medium text-foreground text-sm">{task.title}</p>
        {task.priority && (
          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${priorityColors[task.priority] || priorityColors.low}`}>
            {priorityLabels[task.priority] || 'Basse'}
          </span>
        )}
      </div>
      {dueDate && (
        <div className="flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isOverdue ? '#C62828' : isDueToday ? '#E65100' : '#9BA0A6'}
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={`text-xs ${isOverdue ? 'text-[#C62828]' : isDueToday ? 'text-[#E65100]' : 'text-[#9BA0A6]'}`}>
            {new Date(dueDate + 'T00:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
          </span>
        </div>
      )}
    </Link>
  )
}
