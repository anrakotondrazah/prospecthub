'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'

type UploadDocumentModalProps = {
  isOpen: boolean
  onClose: () => void
  onDocumentUploaded: (document: Document) => void
  organizationId: number
  userId: string
  // Optional associations
  leadId?: number
  companyId?: number
  dealId?: number
}

export interface Document {
  id: number
  uuid: string
  name: string
  description: string | null
  file_url: string
  file_type: string | null
  file_size: number
  mime_type: string | null
  visibility: 'private' | 'team' | 'organization'
  created_at: string
}

const FILE_TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  pdf: { icon: 'M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z', color: '#B42318' },
  docx: { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: '#2563EB' },
  xlsx: { icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: '#16A34A' },
  png: { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#7C3AED' },
  jpg: { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#7C3AED' },
  default: { icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: '#6B7280' },
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export function UploadDocumentModal({
  isOpen,
  onClose,
  onDocumentUploaded,
  organizationId,
  userId,
  leadId,
  companyId,
  dealId,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'team' | 'organization'>('organization')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }, [])

  const processFile = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Le fichier est trop volumineux (max 50 MB)')
      return
    }

    setFile(selectedFile)
    setName(selectedFile.name.replace(/\.[^/.]+$/, '')) // Remove extension for display name
    setError(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Veuillez selectionner un fichier')
      return
    }

    if (!name.trim()) {
      setError('Le nom est obligatoire')
      return
    }

    setIsLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const supabase = createClient()
      const fileExt = getFileExtension(file.name)
      const fileName = `${organizationId}/${Date.now()}_${crypto.randomUUID()}.${fileExt}`

      // Upload file to Supabase Storage
      setUploadProgress(20)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      setUploadProgress(60)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      setUploadProgress(80)

      // Create document record
      const { data, error: insertError } = await supabase
        .from('documents')
        .insert({
          organization_id: organizationId,
          name: name.trim(),
          description: description.trim() || null,
          file_url: urlData.publicUrl,
          file_type: fileExt,
          file_size: file.size,
          mime_type: file.type,
          storage_path: uploadData.path,
          visibility,
          associated_lead_id: leadId || null,
          associated_company_id: companyId || null,
          associated_deal_id: dealId || null,
          uploaded_by: userId,
        })
        .select('id, uuid, name, description, file_url, file_type, file_size, mime_type, visibility, created_at')
        .single()

      if (insertError) throw insertError

      setUploadProgress(100)

      // Reset form
      setFile(null)
      setName('')
      setDescription('')
      setVisibility('organization')

      // Callback
      onDocumentUploaded(data as Document)
      onClose()
    } catch (err: unknown) {
      console.error('Error uploading document:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du telechargement'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  const fileTypeInfo = file ? FILE_TYPE_ICONS[getFileExtension(file.name)] || FILE_TYPE_ICONS.default : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-[#30363D] sticky top-0 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl z-10">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            Ajouter un document
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-[#FDE8E5] dark:bg-[#B42318]/10 border border-[#B42318]/20 rounded-xl flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-[#B42318]">{error}</p>
            </div>
          )}

          {/* File Upload Zone */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#0066FF] bg-[#0066FF]/5'
                  : 'border-black/[0.12] dark:border-[#30363D] hover:border-[#0066FF]/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.gif,.webp,.svg"
              />
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto mb-4 text-[#9BA0A6] dark:text-[#8B949E]"
              >
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-1">
                Glissez-deposez un fichier ici, ou <span className="text-[#0066FF] font-medium">parcourez</span>
              </p>
              <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                PDF, Word, Excel, Images (max 50 MB)
              </p>
            </div>
          ) : (
            <div className="bg-[#F5F7F9] dark:bg-[#161B22] rounded-xl p-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${fileTypeInfo?.color}15` }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={fileTypeInfo?.color}
                  strokeWidth="1.5"
                >
                  <path d={fileTypeInfo?.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#0D0F14] dark:text-[#E6EDF3] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="w-8 h-8 rounded-lg hover:bg-black/[0.08] dark:hover:bg-white/[0.08] flex items-center justify-center transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {isLoading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4E525A] dark:text-[#8B949E]">Telechargement en cours...</span>
                <span className="text-[#0066FF] font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-black/[0.06] dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0066FF] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="doc-name" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Nom du document <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="doc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Contrat de service"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="doc-description" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Description (optionnel)
            </label>
            <textarea
              id="doc-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez une description..."
              rows={2}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
              Visibilite
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'private', label: 'Prive', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { value: 'team', label: 'Équipe', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                { value: 'organization', label: 'Organisation', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVisibility(option.value as typeof visibility)}
                  disabled={isLoading}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1.5 ${
                    visibility === option.value
                      ? 'bg-[#0066FF]/10 text-[#0066FF] border-2 border-[#0066FF]'
                      : 'bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={option.icon} />
                  </svg>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-transparent border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              Annuler
            </button>
            <FillButton
              disabled={isLoading || !file || !name.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Telechargement...
                </span>
              ) : (
                'Ajouter'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
