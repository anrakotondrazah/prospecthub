'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface LeadFunnelChartProps {
  totalLeads: number
  qualifiedLeads: number
  convertedLeads: number
}

// Validated palette from dataviz skill - blue sequential
const COLORS = {
  total: '#257de0',      // blue 500
  qualified: '#338ced',  // blue 400
  converted: '#6aabf1',  // blue 300
}

export function LeadFunnelChart({
  totalLeads,
  qualifiedLeads,
  convertedLeads,
}: LeadFunnelChartProps) {
  const data = [
    { name: 'Total leads', value: totalLeads, fill: COLORS.total },
    { name: 'Qualifiés', value: qualifiedLeads, fill: COLORS.qualified },
    { name: 'Convertis', value: convertedLeads, fill: COLORS.converted },
  ]

  const isEmpty = totalLeads === 0 && qualifiedLeads === 0 && convertedLeads === 0

  if (isEmpty) {
    return (
      <div className="bg-card rounded-[14px] border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Funnel des leads
        </h3>
        <div className="h-[280px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Aucun lead pour le moment</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-[14px] border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Funnel des leads
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 13 }}
              width={90}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
              itemStyle={{ color: 'var(--muted-foreground)' }}
              formatter={(value) => [`${value}`, 'Leads']}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              barSize={40}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-border mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.total }} />
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.qualified }} />
          <span className="text-xs text-muted-foreground">Qualifiés</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.converted }} />
          <span className="text-xs text-muted-foreground">Convertis</span>
        </div>
      </div>
    </div>
  )
}
