'use client'

import { useState, useCallback, useRef } from 'react'
import { FillButton } from '@/components/ui/buttons'
import { parseCSV, autoMapColumns, LEAD_FIELD_MAPPINGS } from '@/lib/utils/csv'

interface ImportCSVModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: Record<string, string>[]) => Promise<{ success: number; errors: number }>
  fieldLabels?: Record<string, string>
  title?: string
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'done'

const DEFAULT_LEAD_FIELDS: Record<string, string> = {
  first_name: 'Prenom',
  last_name: 'Nom',
  email: 'Email',
  phone: 'Telephone',
  company_name: 'Entreprise',
  company_siret: 'SIRET',
  address_city: 'Ville',
  address_postal_code: 'Code postal',
  source: 'Source',
}

export const COMPANY_FIELD_LABELS: Record<string, string> = {
  name: 'Nom entreprise',
  website: 'Site web',
  industry: 'Secteur',
  employees_count: 'Effectif',
  phone: 'Telephone',
  email: 'Email',
  address_street: 'Adresse',
  address_city: 'Ville',
  address_postal_code: 'Code postal',
}

export function ImportCSVModal({ isOpen, onClose, onImport, fieldLabels, title = 'Importer des leads' }: ImportCSVModalProps) {
  const FIELD_LABELS = fieldLabels || DEFAULT_LEAD_FIELDS
  const [step, setStep] = useState<Step>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setStep('upload')
    setHeaders([])
    setRows([])
    setMapping({})
    setParseErrors([])
    setImportResult(null)
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const result = parseCSV(text)

      setHeaders(result.headers)
      setRows(result.rows)
      setParseErrors(result.errors)
      setMapping(autoMapColumns(result.headers))
      setStep('mapping')
    }
    reader.readAsText(file)
  }, [])

  const handleMappingChange = useCallback((field: string, csvColumn: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: csvColumn || '',
    }))
  }, [])

  const getMappedLeads = useCallback((): Record<string, string>[] => {
    const headerIndex = headers.reduce((acc, h, i) => {
      acc[h] = i
      return acc
    }, {} as Record<string, number>)

    return rows.map((row) => {
      const lead: Record<string, string> = {}
      for (const [field, csvColumn] of Object.entries(mapping)) {
        if (csvColumn && headerIndex[csvColumn] !== undefined) {
          lead[field] = row[headerIndex[csvColumn]] || ''
        }
      }
      return lead
    })
  }, [headers, rows, mapping])

  const handleImport = useCallback(async () => {
    setIsProcessing(true)
    setStep('importing')

    try {
      const leads = getMappedLeads()
      const result = await onImport(leads)
      setImportResult(result)
      setStep('done')
    } catch (err) {
      console.error('Erreur import CSV:', err)
      setImportResult({ success: 0, errors: rows.length })
      setStep('done')
    }

    setIsProcessing(false)
  }, [getMappedLeads, onImport, rows.length])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-[#0D1117] rounded-[14px] shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E4E6] dark:border-[#30363D]">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">{title}</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-[8px] hover:bg-[#F5F7F9] dark:hover:bg-white/[0.05] transition-colors"
              aria-label="Fermer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {step === 'upload' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F7F9] dark:bg-[#21262D] flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                  Selectionnez un fichier CSV
                </h3>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-6">
                  Formats acceptes: .csv (separateur virgule ou point-virgule)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#17191F] dark:bg-[#E6EDF3] text-white dark:text-[#0D1117] rounded-[10px] font-medium cursor-pointer hover:bg-[#2D3038] dark:hover:bg-[#C9D1D9] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Choisir un fichier
                </label>
              </div>
            )}

            {step === 'mapping' && (
              <div>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
                  {rows.length} lignes detectees. Mappez les colonnes de votre fichier aux champs du CRM.
                </p>

                {parseErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-[#FFF3E0] dark:bg-[#E65100]/10 text-[#E65100] text-sm rounded-[10px]">
                    {parseErrors.length} erreurs de parsing
                  </div>
                )}

                <div className="space-y-3">
                  {Object.keys(LEAD_FIELD_MAPPINGS).map((field) => (
                    <div key={field} className="flex items-center gap-4">
                      <label className="w-32 text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">
                        {FIELD_LABELS[field]}
                      </label>
                      <select
                        value={mapping[field] || ''}
                        onChange={(e) => handleMappingChange(field, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-[#E2E4E6] dark:border-[#30363D] bg-white dark:bg-[#161B22] text-[#0D0F14] dark:text-[#E6EDF3] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#17191F]/10 dark:focus:ring-white/10"
                      >
                        <option value="">-- Ne pas importer --</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'preview' && (
              <div>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
                  Apercu des {Math.min(5, rows.length)} premieres lignes
                </p>

                <div className="overflow-x-auto border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F5F7F9] dark:bg-[#21262D]">
                        {Object.keys(LEAD_FIELD_MAPPINGS)
                          .filter((f) => mapping[f])
                          .map((field) => (
                            <th key={field} className="px-3 py-2 text-left font-medium text-[#4E525A] dark:text-[#8B949E]">
                              {FIELD_LABELS[field]}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getMappedLeads().slice(0, 5).map((lead, i) => (
                        <tr key={i} className="border-t border-[#E2E4E6] dark:border-[#30363D]">
                          {Object.keys(LEAD_FIELD_MAPPINGS)
                            .filter((f) => mapping[f])
                            .map((field) => (
                              <td key={field} className="px-3 py-2 text-[#0D0F14] dark:text-[#E6EDF3]">
                                {lead[field] || '-'}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 border-2 border-[#17191F] dark:border-[#E6EDF3] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Import en cours...</p>
              </div>
            )}

            {step === 'done' && importResult && (
              <div className="text-center py-12">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  importResult.errors > 0 ? 'bg-[#FFF3E0] dark:bg-[#E65100]/10' : 'bg-[#E8F5E9] dark:bg-[#147A3A]/10'
                }`}>
                  {importResult.errors > 0 ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Import termine</h3>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
                  {importResult.success} leads importes
                  {importResult.errors > 0 && `, ${importResult.errors} erreurs`}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E4E6] dark:border-[#30363D] bg-[#F5F7F9] dark:bg-[#161B22]">
            {step === 'upload' && (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-[#4E525A] dark:text-[#8B949E] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
              >
                Annuler
              </button>
            )}

            {step === 'mapping' && (
              <>
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-[#4E525A] dark:text-[#8B949E] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
                >
                  Retour
                </button>
                <FillButton
                  onClick={() => setStep('preview')}
                  disabled={!Object.values(mapping).some(Boolean)}
                >
                  Apercu
                </FillButton>
              </>
            )}

            {step === 'preview' && (
              <>
                <button
                  onClick={() => setStep('mapping')}
                  className="px-4 py-2 text-sm font-medium text-[#4E525A] dark:text-[#8B949E] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors"
                >
                  Retour
                </button>
                <FillButton
                  onClick={handleImport}
                  disabled={isProcessing}
                >
                  Importer {rows.length} leads
                </FillButton>
              </>
            )}

            {step === 'done' && (
              <FillButton onClick={handleClose} className="ml-auto">
                Fermer
              </FillButton>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
