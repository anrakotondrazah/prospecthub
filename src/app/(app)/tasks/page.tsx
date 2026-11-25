import { createClient } from '@/lib/supabase/server'

export const instant = false

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id as number | null

  // Get tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', orgId || 0)
    .order('due_date', { ascending: true })
    .limit(50)

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">Taches</h1>
          <p className="text-sm text-[#4E525A]">
            Gerez vos taches et suivis
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#17191F] rounded-[10px] hover:bg-[#2D3039] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle tache
        </button>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-3 gap-4">
        {/* To Do */}
        <div className="bg-white rounded-[14px] border border-[#E2E4E6]">
          <div className="flex items-center justify-between p-4 border-b border-[#E2E4E6]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#9BA0A6]" />
              <h3 className="font-semibold text-[#0D0F14]">A faire</h3>
              <span className="text-sm text-[#9BA0A6]">
                {tasks?.filter((t) => t.status === 'pending').length || 0}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 min-h-[300px]">
            {tasks?.filter((t) => t.status === 'pending').length === 0 ? (
              <p className="text-sm text-[#9BA0A6] text-center py-8">Aucune tache</p>
            ) : (
              tasks
                ?.filter((t) => t.status === 'pending')
                .map((task) => (
                  <TaskCard key={task.id} task={task} today={today} />
                ))
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-[14px] border border-[#E2E4E6]">
          <div className="flex items-center justify-between p-4 border-b border-[#E2E4E6]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1565C0]" />
              <h3 className="font-semibold text-[#0D0F14]">En cours</h3>
              <span className="text-sm text-[#9BA0A6]">
                {tasks?.filter((t) => t.status === 'in_progress').length || 0}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 min-h-[300px]">
            {tasks?.filter((t) => t.status === 'in_progress').length === 0 ? (
              <p className="text-sm text-[#9BA0A6] text-center py-8">Aucune tache</p>
            ) : (
              tasks
                ?.filter((t) => t.status === 'in_progress')
                .map((task) => (
                  <TaskCard key={task.id} task={task} today={today} />
                ))
            )}
          </div>
        </div>

        {/* Done */}
        <div className="bg-white rounded-[14px] border border-[#E2E4E6]">
          <div className="flex items-center justify-between p-4 border-b border-[#E2E4E6]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#147A3A]" />
              <h3 className="font-semibold text-[#0D0F14]">Termine</h3>
              <span className="text-sm text-[#9BA0A6]">
                {tasks?.filter((t) => t.status === 'completed').length || 0}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 min-h-[300px]">
            {tasks?.filter((t) => t.status === 'completed').length === 0 ? (
              <p className="text-sm text-[#9BA0A6] text-center py-8">Aucune tache</p>
            ) : (
              tasks
                ?.filter((t) => t.status === 'completed')
                .map((task) => (
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
  title: string
  description: string | null
  status: string
  priority: string | null
  due_date: string | null
}

function TaskCard({ task, today }: { task: Task; today: string }) {
  const isOverdue = task.due_date && task.due_date < today && task.status !== 'completed'
  const isDueToday = task.due_date === today

  const priorityColors: Record<string, string> = {
    high: 'bg-[#FFEBEE] text-[#C62828]',
    medium: 'bg-[#FFF3E0] text-[#E65100]',
    low: 'bg-[#F5F5F5] text-[#616161]',
  }

  return (
    <div className="p-3 bg-[#F5F7F9] rounded-[10px] hover:bg-[#EFF1F3] transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <p className="font-medium text-[#0D0F14] text-sm">{task.title}</p>
        {task.priority && (
          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${priorityColors[task.priority] || priorityColors.low}`}>
            {task.priority}
          </span>
        )}
      </div>
      {task.due_date && (
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isOverdue ? '#C62828' : isDueToday ? '#E65100' : '#9BA0A6'} strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={`text-xs ${isOverdue ? 'text-[#C62828]' : isDueToday ? 'text-[#E65100]' : 'text-[#9BA0A6]'}`}>
            {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      )}
    </div>
  )
}
