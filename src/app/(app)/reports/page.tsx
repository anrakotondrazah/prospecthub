import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/reports/StatsCards'
import { LeadFunnelChart } from '@/components/reports/LeadFunnelChart'
import { PipelineChart } from '@/components/reports/PipelineChart'
import { DownloadButton } from '@/components/ui/buttons'

export const instant = false

interface PipelineStageRow {
  id: number
  name: string
  color: string
  is_won?: boolean
  is_lost?: boolean
}

interface DealRow {
  id: number
  stage_id: number
  value: number | null
  lead_id: number | null
  pipeline_stages: PipelineStageRow | null
}

const DEFAULT_STAGES: PipelineStageRow[] = [
  { id: 1, name: 'Prospection', color: '#6B7280' },
  { id: 2, name: 'Qualification', color: '#3B82F6' },
  { id: 3, name: 'Proposition', color: '#8B5CF6' },
  { id: 4, name: 'Négociation', color: '#F59E0B' },
  { id: 5, name: 'Gagné', color: '#10B981', is_won: true },
]

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id as number | null

  // Default stats
  let totalLeads = 0
  let qualifiedLeads = 0
  let convertedLeads = 0
  let leadsThisMonth = 0
  let totalRevenue = 0
  let tasksCompleted = 0
  let dealsWon = 0
  let conversionRate = 0
  let pipelineStages: { name: string; value: number; color: string }[] = []
  let hasError = false

  if (orgId) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Execute all queries in parallel
    const [
      totalLeadsRes,
      qualifiedLeadsRes,
      leadsThisMonthRes,
      tasksCompletedRes,
      dealsRes,
      stagesRes,
      convertedLeadsRes,
    ] = await Promise.all([
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'qualified'),
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .gte('created_at', startOfMonth),
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'completed'),
      supabase
        .from('deals')
        .select('id, stage_id, value, lead_id, pipeline_stages(id, name, color, is_won)')
        .eq('organization_id', orgId),
      supabase
        .from('pipeline_stages')
        .select('id, name, color, is_won, is_lost')
        .eq('organization_id', orgId)
        .order('display_order'),
      // Count distinct leads that have been converted (status = converted)
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'converted'),
    ])

    // Check for errors
    if (totalLeadsRes.error || dealsRes.error || stagesRes.error) {
      hasError = true
    }

    // Only use data if queries succeeded
    if (!totalLeadsRes.error) totalLeads = totalLeadsRes.count || 0
    if (!qualifiedLeadsRes.error) qualifiedLeads = qualifiedLeadsRes.count || 0
    if (!leadsThisMonthRes.error) leadsThisMonth = leadsThisMonthRes.count || 0
    if (!tasksCompletedRes.error) tasksCompleted = tasksCompletedRes.count || 0
    if (!convertedLeadsRes.error) convertedLeads = convertedLeadsRes.count || 0

    const deals = !dealsRes.error ? ((dealsRes.data || []) as unknown as DealRow[]) : []
    const stages: PipelineStageRow[] = !stagesRes.error && stagesRes.data && stagesRes.data.length > 0
      ? (stagesRes.data as PipelineStageRow[])
      : DEFAULT_STAGES

    // Calculate deals won and total revenue
    dealsWon = deals.filter((d) => d.pipeline_stages?.is_won === true).length

    totalRevenue = deals
      .filter((d) => d.pipeline_stages?.is_won === true)
      .reduce((sum, d) => sum + (d.value || 0), 0)

    // Calculate conversion rate using converted leads count
    conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

    // Build pipeline stages data
    pipelineStages = stages
      .filter((s) => !s.is_lost)
      .map((stage) => {
        const stageDeals = deals.filter((d) => d.stage_id === stage.id)
        const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
        return {
          name: stage.name,
          value: stageValue,
          color: stage.color,
        }
      })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23.5px] font-semibold text-foreground mb-1">
            Rapports
          </h1>
          <p className="text-sm text-muted-foreground">
            Analysez vos performances de prospection
          </p>
        </div>
        <DownloadButton tooltip="Exporter PDF" disabled />
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Certaines données n&apos;ont pas pu etre chargees. Les metriques affichées peuvent etre partielles.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards
        totalLeads={totalLeads}
        conversionRate={conversionRate}
        totalRevenue={totalRevenue}
        tasksCompleted={tasksCompleted}
        leadsThisMonth={leadsThisMonth}
        dealsWon={dealsWon}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadFunnelChart
          totalLeads={totalLeads}
          qualifiedLeads={qualifiedLeads}
          convertedLeads={convertedLeads}
        />
        <PipelineChart stages={pipelineStages} />
      </div>
    </div>
  )
}
