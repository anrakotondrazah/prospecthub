import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const instant = false

const statusColors: Record<string, string> = {
  new: 'bg-[#E8F5E9] text-[#147A3A]',
  qualified: 'bg-[#E3F2FD] text-[#1565C0]',
  hot: 'bg-[#FFF3E0] text-[#E65100]',
  contacted: 'bg-[#F5F7F9] text-[#4E525A]',
  converted: 'bg-[#E8F5E9] text-[#147A3A]',
}

const priorityColors: Record<string, string> = {
  high: 'text-[#B42318]',
  medium: 'text-[#A66A08]',
  low: 'text-[#4E525A]',
}

const taskIcons: Record<string, string> = {
  call: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  meeting: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  note: 'M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z',
  task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  other: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
}

const DEFAULT_STAGES = [
  { id: 1, name: 'Prospection', code: 'prospection', color: '#6B7280', probability: 10 },
  { id: 2, name: 'Qualification', code: 'qualification', color: '#3B82F6', probability: 25 },
  { id: 3, name: 'Proposition', code: 'proposition', color: '#8B5CF6', probability: 50 },
  { id: 4, name: 'Negociation', code: 'negociation', color: '#F59E0B', probability: 75 },
  { id: 5, name: 'Gagne', code: 'won', color: '#10B981', probability: 100 },
]

function getRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}j`
  return past.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function getDueLabel(date: string): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(date)
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((due.getTime() - now.getTime()) / 86400000)

  if (diffDays < 0) return 'En retard'
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Demain'
  return due.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name, organization_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">Erreur de chargement</h2>
          <p className="text-[#4E525A] mb-4">Impossible de charger votre profil.</p>
          <a href="/dashboard" className="text-[#17191F] font-medium hover:underline">Reessayer</a>
        </div>
      </div>
    )
  }

  const orgId = profile?.organization_id as number | null

  let leadStats = { total: 0, new: 0, qualified: 0, hot: 0, totalLastMonth: 0 }
  let taskStats = { total: 0, overdue: 0, today: 0 }
  let pipelineStats: { stage: string; count: number; value: number; color: string }[] = []
  let totalPipelineValue = 0
  let recentLeads: { id: number; name: string; company: string | null; status: string; score: number | null; createdAt: string }[] = []
  let upcomingTasks: { id: number; title: string; dueDate: string; priority: string; type: string }[] = []
  let creditsBalance = 0
  let activityStats: { day: string; emails: number; calls: number; meetings: number; notes: number }[] = []
  let dealsCount = 0

  if (orgId) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
      totalRes,
      newRes,
      qualifiedRes,
      hotRes,
      totalLastMonthRes,
      leadsRes,
      tasksRes,
      taskStatsRes,
      dealsRes,
      stagesRes,
      orgRes,
      activitiesRes,
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'new'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'qualified'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('is_hot', true),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
      supabase.from('leads').select('id, first_name, last_name, company_name, status, score, is_hot, created_at').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(4),
      supabase.from('tasks').select('id, title, due_date, priority, task_type, status').eq('organization_id', orgId).in('status', ['pending', 'in_progress']).order('due_date', { ascending: true }).limit(4),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).in('status', ['pending', 'in_progress']),
      supabase.from('deals').select('id, stage_id, value').eq('organization_id', orgId),
      supabase.from('pipeline_stages').select('id, name, color, probability, is_won, is_lost').eq('organization_id', orgId).order('display_order'),
      supabase.from('organizations').select('credits_balance').eq('id', orgId).single(),
      supabase.from('activities').select('id, activity_type, created_at').eq('organization_id', orgId).gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }),
    ])

    leadStats = {
      total: totalRes.count || 0,
      new: newRes.count || 0,
      qualified: qualifiedRes.count || 0,
      hot: hotRes.count || 0,
      totalLastMonth: totalLastMonthRes.count || 0,
    }

    dealsCount = dealsRes.data?.length || 0

    const taskNow = new Date()
    taskNow.setHours(0, 0, 0, 0)
    const todayStr = taskNow.toISOString().split('T')[0]
    const [overdueRes, todayRes] = await Promise.all([
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).in('status', ['pending', 'in_progress']).lt('due_date', todayStr),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).in('status', ['pending', 'in_progress']).eq('due_date', todayStr),
    ])

    taskStats = {
      total: taskStatsRes.count || 0,
      overdue: overdueRes.count || 0,
      today: todayRes.count || 0,
    }

    creditsBalance = orgRes.data?.credits_balance || 0

    recentLeads = (leadsRes.data || []).map((lead) => ({
      id: lead.id,
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sans nom',
      company: lead.company_name,
      status: lead.is_hot ? 'hot' : lead.status,
      score: lead.score,
      createdAt: getRelativeTime(lead.created_at),
    }))

    upcomingTasks = (tasksRes.data || []).map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.due_date ? getDueLabel(task.due_date) : '-',
      priority: task.priority || 'medium',
      type: task.task_type || 'task',
    }))

    const stages = stagesRes.data && stagesRes.data.length > 0 ? stagesRes.data : DEFAULT_STAGES
    const deals = dealsRes.data || []

    pipelineStats = stages
      .filter((s) => !('is_lost' in s && s.is_lost))
      .map((stage) => {
        const stageDeals = deals.filter((d) => d.stage_id === stage.id)
        const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
        return {
          stage: stage.name,
          count: stageDeals.length,
          value: stageValue,
          color: stage.color,
        }
      })

    totalPipelineValue = pipelineStats.reduce((sum, s) => sum + s.value, 0)

    // Préparer les stats d'activité pour les 7 derniers jours
    const activities = activitiesRes.data || []
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

    activityStats = last7Days.map((day) => {
      const dayActivities = activities.filter((a) => a.created_at.startsWith(day))
      return {
        day: new Date(day).toLocaleDateString('fr-FR', { weekday: 'short' }),
        emails: dayActivities.filter((a) => a.activity_type === 'email').length,
        calls: dayActivities.filter((a) => a.activity_type === 'call').length,
        meetings: dayActivities.filter((a) => a.activity_type === 'meeting').length,
        notes: dayActivities.filter((a) => a.activity_type === 'note').length,
      }
    })
  }

  const firstName = profile?.first_name || user.email?.split('@')[0] || 'Utilisateur'
  const leadsTrend = leadStats.totalLastMonth > 0
    ? Math.round(((leadStats.total - leadStats.totalLastMonth) / leadStats.totalLastMonth) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-[#0D0F14]">
            Bonjour, {firstName}
          </h1>
          <p className="text-sm text-[#4E525A]">
            Voici un apercu de vos performances
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F7F9] rounded-[10px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-sm font-medium text-[#0D0F14]">{creditsBalance} credits</span>
          </div>
          <Link
            href="/base-entreprises"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#17191F] text-white rounded-[10px] text-sm font-medium hover:bg-[#2a2d35] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Trouver leads
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#4E525A]">Total leads</span>
            <div className="w-8 h-8 rounded-lg bg-[#E3F2FD] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#0D0F14]">{leadStats.total}</span>
            {leadsTrend !== 0 && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${leadsTrend > 0 ? 'text-[#147A3A]' : 'text-[#B42318]'}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {leadsTrend > 0 ? (
                    <path d="M18 15l-6-6-6 6" />
                  ) : (
                    <path d="M6 9l6 6 6-6" />
                  )}
                </svg>
                {Math.abs(leadsTrend)}%
              </span>
            )}
          </div>
          <p className="text-xs text-[#4E525A] mt-1">
            {leadStats.new} nouveaux ce mois
          </p>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#4E525A]">Leads chauds</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
          <span className="text-3xl font-semibold text-[#0D0F14]">{leadStats.hot}</span>
          <p className="text-xs text-[#E65100] mt-1">A traiter en priorite</p>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#4E525A]">Affaires actives</span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <span className="text-3xl font-semibold text-[#0D0F14]">{dealsCount}</span>
          <p className="text-xs text-[#4E525A] mt-1">
            {totalPipelineValue > 0 ? `${(totalPipelineValue / 1000).toFixed(0)}k EUR` : '0 EUR'} en pipeline
          </p>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#4E525A]">Taches</span>
            <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] flex items-center justify-center relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
              </svg>
              {taskStats.overdue > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#B42318] rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">{taskStats.overdue > 9 ? '9+' : taskStats.overdue}</span>
                </div>
              )}
            </div>
          </div>
          <span className="text-3xl font-semibold text-[#0D0F14]">{taskStats.total}</span>
          {taskStats.overdue > 0 ? (
            <p className="text-xs text-[#B42318] mt-1 font-medium">{taskStats.overdue} en retard</p>
          ) : taskStats.today > 0 ? (
            <p className="text-xs text-[#E65100] mt-1">{taskStats.today} aujourd'hui</p>
          ) : (
            <p className="text-xs text-[#147A3A] mt-1">A jour</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[14px] border border-[#E2E4E6] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#0D0F14]">Activite des 7 derniers jours</h2>
            <Link href="/activities" className="text-sm text-[#4E525A] hover:text-[#0D0F14]">
              Voir tout
            </Link>
          </div>
          {activityStats.length === 0 || activityStats.every(d => d.emails + d.calls + d.meetings + d.notes === 0) ? (
            <div className="text-center py-12 bg-[#F5F7F9] rounded-[10px]">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <p className="text-sm text-[#4E525A]">Aucune activite recente</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-end justify-between gap-2 h-48">
                {activityStats.map((day, idx) => {
                  const total = day.emails + day.calls + day.meetings + day.notes
                  const maxTotal = Math.max(...activityStats.map(d => d.emails + d.calls + d.meetings + d.notes), 1)
                  const heightPercent = (total / maxTotal) * 100

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '160px' }}>
                        {day.emails > 0 && (
                          <div
                            className="w-full bg-[#3B82F6] rounded-t-md transition-all hover:opacity-80"
                            style={{ height: `${(day.emails / total) * heightPercent}%` }}
                            title={`${day.emails} emails`}
                          />
                        )}
                        {day.calls > 0 && (
                          <div
                            className="w-full bg-[#10B981] transition-all hover:opacity-80"
                            style={{ height: `${(day.calls / total) * heightPercent}%` }}
                            title={`${day.calls} appels`}
                          />
                        )}
                        {day.meetings > 0 && (
                          <div
                            className="w-full bg-[#8B5CF6] transition-all hover:opacity-80"
                            style={{ height: `${(day.meetings / total) * heightPercent}%` }}
                            title={`${day.meetings} reunions`}
                          />
                        )}
                        {day.notes > 0 && (
                          <div
                            className="w-full bg-[#F59E0B] transition-all hover:opacity-80"
                            style={{ height: `${(day.notes / total) * heightPercent}%` }}
                            title={`${day.notes} notes`}
                          />
                        )}
                      </div>
                      <div className="text-xs text-[#9BA0A6] font-medium">{day.day}</div>
                      {total > 0 && (
                        <div className="text-xs font-semibold text-[#0D0F14]">{total}</div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#E2E4E6]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#3B82F6]" />
                  <span className="text-xs text-[#4E525A]">Emails</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#10B981]" />
                  <span className="text-xs text-[#4E525A]">Appels</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#8B5CF6]" />
                  <span className="text-xs text-[#4E525A]">Reunions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#F59E0B]" />
                  <span className="text-xs text-[#4E525A]">Notes</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#0D0F14]">Credits restants</h2>
            <Link href="/settings/credits" className="text-sm text-[#4E525A] hover:text-[#0D0F14]">
              Recharger
            </Link>
          </div>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E3F2FD] to-[#E8F5E9] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="text-4xl font-bold text-[#0D0F14] mb-1">{creditsBalance}</div>
            <p className="text-sm text-[#4E525A]">credits disponibles</p>
          </div>
          <div className="pt-4 border-t border-[#E2E4E6]">
            <p className="text-xs text-[#9BA0A6] text-center">1 credit = 1 enrichissement entreprise</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[14px] border border-[#E2E4E6] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#0D0F14]">Pipeline des affaires</h2>
            <Link href="/deals" className="text-sm text-[#4E525A] hover:text-[#0D0F14]">
              Voir tout
            </Link>
          </div>
          {pipelineStats.length === 0 || totalPipelineValue === 0 ? (
            <div className="text-center py-12 bg-[#F5F7F9] rounded-[10px]">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <p className="text-sm text-[#4E525A]">Aucune affaire en cours</p>
              <Link href="/deals" className="text-xs text-[#1565C0] hover:underline mt-1 inline-block">
                Creer une affaire
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pipelineStats.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-[#4E525A] truncate">{stage.stage}</div>
                  <div className="flex-1 h-8 bg-[#F5F7F9] rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg flex items-center px-3 transition-all"
                      style={{
                        width: `${Math.max((stage.value / totalPipelineValue) * 100, 15)}%`,
                        backgroundColor: stage.color,
                      }}
                    >
                      <span className="text-xs font-medium text-white">{stage.count}</span>
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-medium text-[#0D0F14]">
                    {stage.value > 0 ? `${(stage.value / 1000).toFixed(0)}k` : '0'} EUR
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0D0F14]">Taches a venir</h2>
            <Link href="/tasks" className="text-sm text-[#4E525A] hover:text-[#0D0F14]">
              Voir tout
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 bg-[#F5F7F9] rounded-[10px]">
              <p className="text-sm text-[#4E525A]">Aucune tache</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const priorityBadge = task.priority === 'high'
                  ? { bg: 'bg-[#FDE8E5]', text: 'text-[#B42318]', label: 'Haute' }
                  : task.priority === 'medium'
                  ? { bg: 'bg-[#FFF3E0]', text: 'text-[#A66A08]', label: 'Moyenne' }
                  : { bg: 'bg-[#F5F7F9]', text: 'text-[#4E525A]', label: 'Basse' }

                const isOverdue = task.dueDate === 'En retard'
                const isToday = task.dueDate === "Aujourd'hui"

                return (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#F5F7F9] transition-colors group">
                    <div className={`w-8 h-8 rounded-lg ${priorityBadge.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={priorityBadge.text.replace('text-', '#')} strokeWidth="2" className={priorityBadge.text}>
                        <path d={taskIcons[task.type] || taskIcons.task} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[#0D0F14] truncate">{task.title}</p>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${priorityBadge.bg} ${priorityBadge.text}`}>
                          {priorityBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-medium ${isOverdue ? 'text-[#B42318]' : isToday ? 'text-[#E65100]' : 'text-[#4E525A]'}`}>
                          {task.dueDate}
                        </p>
                        {isOverdue && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0D0F14]">Leads recents</h2>
            <Link href="/leads" className="text-sm text-[#4E525A] hover:text-[#0D0F14]">
              Voir tout
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <div className="text-center py-8 bg-[#F5F7F9] rounded-[10px]">
              <p className="text-sm text-[#4E525A]">Aucun lead</p>
              <Link href="/base-entreprises" className="text-xs text-[#1565C0] hover:underline mt-1 inline-block">
                Trouver des leads
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => {
                const score = lead.score || 0
                const scoreColor = score >= 70 ? 'text-[#147A3A] bg-[#E8F5E9]' : score >= 40 ? 'text-[#A66A08] bg-[#FFF3E0]' : 'text-[#B42318] bg-[#FDE8E5]'
                const scoreIcon = score >= 70 ? '↗' : score >= 40 ? '→' : '↘'

                return (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F5F7F9] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#17191F] to-[#2a2d35] flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#0D0F14]">{lead.name}</p>
                        {lead.status === 'hot' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#E65100] animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-[#4E525A] truncate">{lead.company || 'Entreprise inconnue'}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-md flex items-center gap-1 ${scoreColor}`}>
                      <span className="text-xs font-semibold">{score}</span>
                      <span className="text-[10px]">{scoreIcon}</span>
                    </div>
                    <span className="text-xs text-[#9BA0A6] min-w-[48px] text-right">{lead.createdAt}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0D0F14]">Statistiques</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
              <p className="text-xs text-[#9BA0A6] mb-1">Leads qualifies</p>
              <p className="text-2xl font-semibold text-[#0D0F14]">{leadStats.qualified}</p>
            </div>
            <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
              <p className="text-xs text-[#9BA0A6] mb-1">Taux conversion</p>
              <p className="text-2xl font-semibold text-[#0D0F14]">
                {leadStats.total > 0 ? Math.round((leadStats.qualified / leadStats.total) * 100) : 0}%
              </p>
            </div>
            <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
              <p className="text-xs text-[#9BA0A6] mb-1">Credits restants</p>
              <p className="text-2xl font-semibold text-[#0D0F14]">{creditsBalance}</p>
            </div>
            <div className="p-4 bg-[#F5F7F9] rounded-[10px]">
              <p className="text-xs text-[#9BA0A6] mb-1">Taches aujourd'hui</p>
              <p className="text-2xl font-semibold text-[#0D0F14]">{taskStats.today}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/leads"
          className="bg-white rounded-[14px] border border-[#E2E4E6] p-4 hover:border-[#17191F] transition-colors group"
        >
          <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center mb-3 group-hover:bg-[#17191F] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] group-hover:text-white transition-colors">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="font-medium text-[#0D0F14] text-sm">Leads</h3>
        </Link>

        <Link
          href="/base-entreprises"
          className="bg-white rounded-[14px] border border-[#E2E4E6] p-4 hover:border-[#17191F] transition-colors group"
        >
          <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center mb-3 group-hover:bg-[#17191F] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] group-hover:text-white transition-colors">
              <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <h3 className="font-medium text-[#0D0F14] text-sm">Base B2B</h3>
        </Link>

        <Link
          href="/deals"
          className="bg-white rounded-[14px] border border-[#E2E4E6] p-4 hover:border-[#17191F] transition-colors group"
        >
          <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center mb-3 group-hover:bg-[#17191F] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] group-hover:text-white transition-colors">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h3 className="font-medium text-[#0D0F14] text-sm">Affaires</h3>
        </Link>

        <Link
          href="/inbox"
          className="bg-white rounded-[14px] border border-[#E2E4E6] p-4 hover:border-[#17191F] transition-colors group"
        >
          <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center mb-3 group-hover:bg-[#17191F] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] group-hover:text-white transition-colors">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
            </svg>
          </div>
          <h3 className="font-medium text-[#0D0F14] text-sm">Inbox</h3>
        </Link>
      </div>
    </div>
  )
}
