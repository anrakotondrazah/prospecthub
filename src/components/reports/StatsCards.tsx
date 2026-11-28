'use client'

interface StatsCardsProps {
  totalLeads: number
  conversionRate: number
  totalRevenue: number
  tasksCompleted: number
  leadsThisMonth: number
  dealsWon: number
}

export function StatsCards({
  totalLeads,
  conversionRate,
  totalRevenue,
  tasksCompleted,
  leadsThisMonth,
  dealsWon,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Leads ce mois',
      value: leadsThisMonth.toString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      bgColor: 'bg-[#E3F2FD]',
      iconColor: '#1565C0',
    },
    {
      label: 'Taux de conversion',
      value: `${conversionRate}%`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      bgColor: 'bg-[#E8F5E9]',
      iconColor: '#147A3A',
    },
    {
      label: 'Revenue total',
      value: totalRevenue >= 1000
        ? `${(totalRevenue / 1000).toFixed(0)}k EUR`
        : `${totalRevenue} EUR`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      bgColor: 'bg-[#FFF3E0]',
      iconColor: '#E65100',
    },
    {
      label: 'Tâches completees',
      value: tasksCompleted.toString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      bgColor: 'bg-[#F3E8FF]',
      iconColor: '#7C3AED',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-[14px] border border-border p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div
              className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}
              style={{ color: stat.iconColor }}
            >
              {stat.icon}
            </div>
          </div>
          <span className="text-3xl font-semibold text-foreground">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}
