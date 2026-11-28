'use client'

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface DocumentItemData {
  id: number
  uuid: string
  name: string
  description: string | null
  file_url: string
  file_type: string | null
  file_size: number
  mime_type: string | null
  visibility: 'private' | 'team' | 'organization'
  version: number
  created_at: string
  uploaded_by?: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
}

interface DocumentItemProps {
  document: DocumentItemData
  onView?: (document: DocumentItemData) => void
  onDownload?: (document: DocumentItemData) => void
  onDelete?: (document: DocumentItemData) => void
}

const FILE_TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  pdf: {
    icon: 'M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    color: '#B42318',
    bg: '#FDE8E5',
  },
  doc: {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  docx: {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  xls: {
    icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  xlsx: {
    icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  ppt: {
    icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2',
    color: '#EA580C',
    bg: '#FFF7ED',
  },
  pptx: {
    icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2',
    color: '#EA580C',
    bg: '#FFF7ED',
  },
  png: {
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  jpg: {
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  jpeg: {
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  default: {
    icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    color: '#6B7280',
    bg: '#F3F4F6',
  },
}

const VISIBILITY_CONFIG = {
  private: { label: 'Prive', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  team: { label: 'Équipe', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  organization: { label: 'Organisation', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
}

export function DocumentItem({ document, onView, onDownload, onDelete }: DocumentItemProps) {
  const fileType = document.file_type?.toLowerCase() || 'default'
  const config = FILE_TYPE_CONFIG[fileType] || FILE_TYPE_CONFIG.default
  const visibilityConfig = VISIBILITY_CONFIG[document.visibility]

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const timeAgo = formatDistanceToNow(new Date(document.created_at), {
    addSuffix: true,
    locale: fr,
  })

  return (
    <div className="group p-4 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl hover:bg-white dark:hover:bg-[#161B22] hover:shadow-md hover:border-black/[0.12] dark:hover:border-[#30363D] transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* File Type Icon */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: config.bg }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="1.5">
            <path d={config.icon} />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium text-sm text-[#0D0F14] dark:text-[#E6EDF3] truncate">
                {document.name}
              </h4>
              {document.description && (
                <p className="text-xs text-[#4E525A] dark:text-[#8B949E] line-clamp-1 mt-0.5">
                  {document.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onView && (
                <button
                  onClick={() => onView(document)}
                  className="p-1.5 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
                  title="Voir"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}
              {onDownload && (
                <button
                  onClick={() => onDownload(document)}
                  className="p-1.5 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
                  title="Télécharger"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(document)}
                  className="p-1.5 rounded-lg hover:bg-[#FDE8E5] transition-colors"
                  title="Supprimer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E] uppercase font-medium">
              {document.file_type || 'File'}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#9BA0A6] dark:bg-[#8B949E]" />
            <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
              {formatFileSize(document.file_size)}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#9BA0A6] dark:bg-[#8B949E]" />
            <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
              {timeAgo}
            </span>
            {document.version > 1 && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#9BA0A6] dark:bg-[#8B949E]" />
                <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                  v{document.version}
                </span>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.04] dark:border-[#30363D]">
            {/* Uploaded by */}
            {document.uploaded_by && (
              <div className="flex items-center gap-2">
                {document.uploaded_by.avatar_url ? (
                  <img
                    src={document.uploaded_by.avatar_url}
                    alt=""
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-[#0066FF]">
                      {document.uploaded_by.first_name?.[0]}{document.uploaded_by.last_name?.[0]}
                    </span>
                  </div>
                )}
                <span className="text-xs text-[#4E525A] dark:text-[#8B949E]">
                  {document.uploaded_by.first_name} {document.uploaded_by.last_name}
                </span>
              </div>
            )}

            {/* Visibility Badge */}
            <div className="flex items-center gap-1 text-xs text-[#9BA0A6] dark:text-[#8B949E]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={visibilityConfig.icon} />
              </svg>
              <span>{visibilityConfig.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
