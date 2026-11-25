export const instant = false

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">Rapports</h1>
        <p className="text-sm text-[#4E525A]">
          Analysez vos performances de prospection
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F7F9] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="2">
            <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">Bientot disponible</h2>
        <p className="text-[#4E525A] max-w-md mx-auto">
          Les rapports detailles de vos performances seront disponibles dans une prochaine mise a jour.
        </p>
      </div>
    </div>
  )
}
