'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, Check, Users, Lock, Trash2 } from 'lucide-react'

export type SavedView = {
  id: number
  uuid: string
  name: string
  entity_type: string
  filters: Record<string, unknown>
  columns: string[]
  sort_by: string | null
  sort_order: 'asc' | 'desc'
  is_default: boolean
  is_shared: boolean
  user_id: string | null
}

interface ViewSelectorProps {
  views: SavedView[]
  currentViewId: number | null
  onViewSelect: (view: SavedView | null) => void
  onCreateView: () => void
  onDeleteView?: (viewId: number) => void
  entityType: 'leads' | 'companies' | 'deals' | 'contacts'
  isLoading?: boolean
}

export function ViewSelector({
  views,
  currentViewId,
  onViewSelect,
  onCreateView,
  onDeleteView,
  entityType,
  isLoading = false,
}: ViewSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentView = views.find(v => v.id === currentViewId)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const myViews = views.filter(v => !v.is_shared)
  const sharedViews = views.filter(v => v.is_shared)

  const handleViewSelect = (view: SavedView) => {
    onViewSelect(view)
    setIsOpen(false)
  }

  const handleDelete = (e: React.MouseEvent, viewId: number) => {
    e.stopPropagation()
    if (onDeleteView) {
      onDeleteView(viewId)
    }
  }

  const entityLabels: Record<string, string> = {
    leads: 'Leads',
    companies: 'Entreprises',
    deals: 'Transactions',
    contacts: 'Contacts',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
          ${isOpen
            ? 'bg-[#17191F] text-white'
            : 'bg-white/80 backdrop-blur-sm border border-black/[0.08] text-[#0D0F14] hover:border-black/[0.12] hover:bg-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
        <span>{currentView?.name || `Tous les ${entityLabels[entityType]?.toLowerCase() || entityType}`}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-black/[0.08] z-50 overflow-hidden">
          {/* Default View */}
          <div className="p-2">
            <button
              onClick={() => {
                onViewSelect(null)
                setIsOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${!currentViewId
                  ? 'bg-[#0066FF]/10 text-[#0066FF]'
                  : 'text-[#0D0F14] hover:bg-black/[0.04]'
                }
              `}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <span className="font-medium">Tous les {entityLabels[entityType]?.toLowerCase() || entityType}</span>
              {!currentViewId && <Check className="w-4 h-4 ml-auto" />}
            </button>
          </div>

          {/* Divider */}
          {(myViews.length > 0 || sharedViews.length > 0) && (
            <div className="border-t border-black/[0.06]" />
          )}

          {/* My Views */}
          {myViews.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-1.5 text-xs font-medium text-[#9BA0A6] uppercase tracking-wide">
                Mes vues
              </p>
              {myViews.map(view => (
                <button
                  key={view.id}
                  onClick={() => handleViewSelect(view)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group
                    ${currentViewId === view.id
                      ? 'bg-[#0066FF]/10 text-[#0066FF]'
                      : 'text-[#0D0F14] hover:bg-black/[0.04]'
                    }
                  `}
                >
                  <Lock className="w-4 h-4 text-[#9BA0A6]" />
                  <span className="font-medium flex-1 text-left truncate">{view.name}</span>
                  {view.is_default && (
                    <span className="text-xs bg-[#E8F4EA] text-[#147A3A] px-1.5 py-0.5 rounded">
                      Defaut
                    </span>
                  )}
                  {currentViewId === view.id && <Check className="w-4 h-4" />}
                  {onDeleteView && (
                    <button
                      onClick={(e) => handleDelete(e, view.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#FDE8E5] rounded transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#B42318]" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Shared Views */}
          {sharedViews.length > 0 && (
            <div className="p-2 border-t border-black/[0.06]">
              <p className="px-3 py-1.5 text-xs font-medium text-[#9BA0A6] uppercase tracking-wide">
                Vues partagees
              </p>
              {sharedViews.map(view => (
                <button
                  key={view.id}
                  onClick={() => handleViewSelect(view)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                    ${currentViewId === view.id
                      ? 'bg-[#0066FF]/10 text-[#0066FF]'
                      : 'text-[#0D0F14] hover:bg-black/[0.04]'
                    }
                  `}
                >
                  <Users className="w-4 h-4 text-[#9BA0A6]" />
                  <span className="font-medium flex-1 text-left truncate">{view.name}</span>
                  {currentViewId === view.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}

          {/* Create View Action */}
          <div className="p-2 border-t border-black/[0.06]">
            <button
              onClick={() => {
                onCreateView()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#0066FF] hover:bg-[#0066FF]/5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Créer une vue</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
