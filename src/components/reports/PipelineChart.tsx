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

interface PipelineStage {
  name: string
  value: number
  color: string
}

interface PipelineChartProps {
  stages: PipelineStage[]
}

// Default stage colors if none provided
const DEFAULT_COLORS: Record<string, string> = {
  prospection: '#6B7280',
  qualification: '#3B82F6',
  proposition: '#8B5CF6',
  negociation: '#F59E0B',
  won: '#10B981',
  lost: '#EF4444',
}

export function PipelineChart({ stages }: PipelineChartProps) {
  const isEmpty = stages.length === 0 || stages.every(s => s.value === 0)

  if (isEmpty) {
    return (
      <div className="bg-card rounded-[14px] border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Valeur du pipeline par etape
        </h3>
        <div className="h-[280px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Aucune affaire en cours</p>
          </div>
        </div>
      </div>
    )
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  return (
    <div className="bg-card rounded-[14px] border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Valeur du pipeline par etape
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stages}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={formatValue}
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
              formatter={(value) => [`${formatValue(Number(value))} EUR`, 'Valeur']}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              barSize={50}
            >
              {stages.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[entry.name.toLowerCase()] || '#6B7280'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border mt-4">
        {stages.map((stage) => (
          <div key={stage.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: stage.color || DEFAULT_COLORS[stage.name.toLowerCase()] || '#6B7280' }}
            />
            <span className="text-xs text-muted-foreground">{stage.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
