export const instant = false

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[23.5px] font-semibold text-foreground mb-1">Rapports</h1>
        <p className="text-sm text-muted-foreground">
          Analysez vos performances de prospection
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-card rounded-[14px] border border-border p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Bientot disponible</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Les rapports detailles de vos performances seront disponibles dans une prochaine mise a jour.
        </p>
      </div>
    </div>
  )
}
