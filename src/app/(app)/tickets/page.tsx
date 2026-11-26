import { LifeBuoy } from 'lucide-react'

export const instant = false

export default function TicketsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">Tickets</h1>
        <p className="text-sm text-[#4E525A]">
          Gerez les demandes de support client
        </p>
      </div>

      <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-[14px] bg-[#F5F7F9] flex items-center justify-center">
          <LifeBuoy className="w-12 h-12 text-[#9BA0A6]" strokeWidth={1.5} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF3E0] text-[#E65100] text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E65100]"></span>
          Bientot disponible
        </div>
        <h2 className="text-xl font-semibold text-[#0D0F14] mb-2">Support tickets</h2>
        <p className="text-[#4E525A] max-w-md mx-auto mb-6">
          Centralisez et traitez les demandes de support de vos clients efficacement.
        </p>
        <button
          className="px-5 py-2.5 rounded-[10px] bg-[#F5F7F9] text-[#9BA0A6] text-sm font-medium cursor-not-allowed"
          disabled
        >
          Etre notifie
        </button>
      </div>
    </div>
  )
}
