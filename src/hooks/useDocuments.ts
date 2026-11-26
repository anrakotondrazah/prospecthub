'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DocumentItemData } from '@/components/documents/DocumentItem'

interface UseDocumentsOptions {
  entityType?: 'lead' | 'deal' | 'company'
  entityId?: number
  fileType?: string
  limit?: number
  autoFetch?: boolean
}

interface UseDocumentsReturn {
  documents: DocumentItemData[]
  isLoading: boolean
  error: string | null
  fetchDocuments: () => Promise<void>
  uploadDocument: (file: File, metadata: UploadDocumentMetadata) => Promise<DocumentItemData | null>
  deleteDocument: (documentId: number) => Promise<boolean>
  logAccess: (documentId: number, action: 'view' | 'download' | 'share') => Promise<void>
}

interface UploadDocumentMetadata {
  name: string
  description?: string
  visibility?: 'private' | 'team' | 'organization'
  leadId?: number
  companyId?: number
  dealId?: number
}

export function useDocuments(options: UseDocumentsOptions = {}): UseDocumentsReturn {
  const { entityType, entityId, fileType, limit = 50, autoFetch = true } = options

  const [documents, setDocuments] = useState<DocumentItemData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (entityType && entityId) {
        params.append('entity_type', entityType)
        params.append('entity_id', entityId.toString())
      }
      if (fileType) {
        params.append('file_type', fileType)
      }
      params.append('limit', limit.toString())

      const response = await fetch(`/api/documents?${params.toString()}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la recuperation des documents')
      }

      setDocuments(data.documents)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Error fetching documents:', err)
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId, fileType, limit])

  const uploadDocument = useCallback(async (
    file: File,
    metadata: UploadDocumentMetadata
  ): Promise<DocumentItemData | null> => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Non authentifie')
      }

      // Get organization_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) {
        throw new Error('Organisation non trouvee')
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
      const fileName = `${profile.organization_id}/${Date.now()}_${crypto.randomUUID()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // Create document record via API
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metadata.name,
          description: metadata.description,
          file_url: urlData.publicUrl,
          file_type: fileExt,
          file_size: file.size,
          mime_type: file.type,
          storage_path: uploadData.path,
          visibility: metadata.visibility || 'organization',
          associated_lead_id: metadata.leadId,
          associated_company_id: metadata.companyId,
          associated_deal_id: metadata.dealId,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la creation du document')
      }

      // Add to local state
      setDocuments((prev) => [data.document, ...prev])

      return data.document
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Error uploading document:', err)
      return null
    }
  }, [])

  const deleteDocument = useCallback(async (documentId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la suppression')
      }

      // Remove from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      console.error('Error deleting document:', err)
      return false
    }
  }, [])

  const logAccess = useCallback(async (
    documentId: number,
    action: 'view' | 'download' | 'share'
  ): Promise<void> => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from('document_access_logs').insert({
        document_id: documentId,
        user_id: user.id,
        action,
      })
    } catch (err) {
      console.error('Error logging document access:', err)
    }
  }, [])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchDocuments()
    }
  }, [autoFetch, fetchDocuments])

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    logAccess,
  }
}
