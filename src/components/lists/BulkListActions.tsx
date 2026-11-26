'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type Lead = {
  id: number
  uuid: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  company_name: string | null
  job_title: string | null
  status: string
}

type Member = {
  id: number
  lead_id: number
  added_at: string
  leads: Lead
}

type BulkListActionsProps = {
  selectedMembers: Member[]
  onRemove: (memberIds: number[]) => Promise<void>
  onExport: (members: Member[], format: 'csv' | 'json') => void
  onAddToList?: (leadIds: number[]) => void
  onClearSelection: () => void
  listName: string
}

export function BulkListActions({
  selectedMembers,
  onRemove,
  onExport,
  onAddToList,
  onClearSelection,
  listName,
}: BulkListActionsProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRemove = useCallback(async () => {
    if (selectedMembers.length === 0) return

    setIsRemoving(true)
    try {
      await onRemove(selectedMembers.map(m => m.id))
      setShowConfirmRemove(false)
      onClearSelection()
    } catch (error) {
      console.error('Error removing members:', error)
    } finally {
      setIsRemoving(false)
    }
  }, [selectedMembers, onRemove, onClearSelection])

  const handleExportCSV = useCallback(() => {
    setIsActionsOpen(false)
    onExport(selectedMembers, 'csv')
  }, [selectedMembers, onExport])

  const handleExportJSON = useCallback(() => {
    setIsActionsOpen(false)
    onExport(selectedMembers, 'json')
  }, [selectedMembers, onExport])

  const handleAddToList = useCallback(() => {
    setIsActionsOpen(false)
    onAddToList?.(selectedMembers.map(m => m.lead_id))
  }, [selectedMembers, onAddToList])

  if (selectedMembers.length === 0) return null

  return (
    <>
      <div className="sticky top-0 z-10 bg-[#E3F2FD] border border-[#1565C0]/20 rounded-[12px] p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1565C0] text-white flex items-center justify-center text-sm font-medium">
            {selectedMembers.length}
          </div>
          <span className="text-sm font-medium text-[#0D0F14]">
            {selectedMembers.length === 1
              ? '1 membre selectionne'
              : `${selectedMembers.length} membres selectionnes`}
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-[#1565C0] hover:text-[#0D47A1] underline transition-colors"
          >
            Deselectionner
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="px-3 py-2 bg-white border border-[#E2E4E6] text-[#0D0F14] rounded-[8px] text-sm font-medium hover:bg-[#F5F7F9] transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
              Actions
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform ${isActionsOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-[12px] border border-[#E2E4E6] shadow-lg z-20 py-1.5">
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0D0F14] hover:bg-[#F5F7F9] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Exporter en CSV
                </button>

                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0D0F14] hover:bg-[#F5F7F9] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M10 9l-3 3 3 3" />
                    <path d="M14 9l3 3-3 3" />
                  </svg>
                  Exporter en JSON
                </button>

                {onAddToList && (
                  <>
                    <div className="border-t border-[#EFF1F3] my-1.5" />
                    <button
                      onClick={handleAddToList}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0D0F14] hover:bg-[#F5F7F9] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        <line x1="12" y1="10" x2="12" y2="16" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                      </svg>
                      Ajouter a une autre liste
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={() => setShowConfirmRemove(true)}
            className="px-3 py-2 bg-[#FDE8E5] border border-[#B42318]/20 text-[#B42318] rounded-[8px] text-sm font-medium hover:bg-[#FCE4EC] transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Retirer
          </button>
        </div>
      </div>

      {/* Confirm Remove Modal */}
      {showConfirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmRemove(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-[20px] shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FDE8E5] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0D0F14] mb-2">
                Confirmer le retrait
              </h3>
              <p className="text-sm text-[#4E525A]">
                Voulez-vous vraiment retirer {selectedMembers.length === 1 ? 'ce membre' : `ces ${selectedMembers.length} membres`} de la liste "{listName}"?
              </p>
              <p className="text-xs text-[#9BA0A6] mt-2">
                Les leads ne seront pas supprimes, seulement retires de cette liste.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmRemove(false)}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 bg-white border border-[#E2E4E6] text-[#0D0F14] rounded-[10px] font-medium hover:bg-[#F5F7F9] transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="flex-1 px-4 py-2.5 bg-[#B42318] text-white rounded-[10px] font-medium hover:bg-[#8F1D14] transition-colors disabled:opacity-50"
              >
                {isRemoving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Retrait...
                  </span>
                ) : (
                  'Confirmer le retrait'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Export utility function for downloading data
export function downloadAsFile(data: string, filename: string, type: string) {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportMembersToCSV(members: Member[]): string {
  const headers = ['Prenom', 'Nom', 'Email', 'Telephone', 'Entreprise', 'Poste', 'Statut', 'Ajoute le']
  const rows = members.map(m => [
    m.leads.first_name || '',
    m.leads.last_name || '',
    m.leads.email || '',
    m.leads.phone || '',
    m.leads.company_name || '',
    m.leads.job_title || '',
    m.leads.status || '',
    new Date(m.added_at).toLocaleDateString('fr-FR'),
  ])

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';')),
  ].join('\n')

  return csvContent
}

export function exportMembersToJSON(members: Member[]): string {
  const data = members.map(m => ({
    first_name: m.leads.first_name,
    last_name: m.leads.last_name,
    email: m.leads.email,
    phone: m.leads.phone,
    company_name: m.leads.company_name,
    job_title: m.leads.job_title,
    status: m.leads.status,
    added_at: m.added_at,
  }))

  return JSON.stringify(data, null, 2)
}
