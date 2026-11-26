'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type MessageTemplate } from '@/components/templates'
import { replaceTokens, type TokenContext } from '@/lib/utils/tokens'

type UseTemplatesReturn = {
  templates: MessageTemplate[]
  isLoading: boolean
  error: string | null
  fetchTemplates: () => Promise<void>
  createTemplate: (data: CreateTemplateData) => Promise<MessageTemplate | null>
  updateTemplate: (id: number, data: CreateTemplateData) => Promise<MessageTemplate | null>
  deleteTemplate: (id: number) => Promise<boolean>
  useTemplate: (id: number) => Promise<void>
  applyTemplate: (template: MessageTemplate, context: TokenContext) => { subject: string | null; body: string }
}

type CreateTemplateData = {
  name: string
  subject?: string
  body: string
  type?: 'email' | 'sms' | 'whatsapp' | 'linkedin'
  category?: string
  tokens?: string[]
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all templates
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/templates')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la recuperation')
      }

      setTemplates(data.templates)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      console.error('Error fetching templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new template
  const createTemplate = useCallback(async (data: CreateTemplateData): Promise<MessageTemplate | null> => {
    setError(null)

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la creation')
      }

      setTemplates((prev) => [result.template, ...prev])
      return result.template
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      console.error('Error creating template:', err)
      return null
    }
  }, [])

  // Update an existing template
  const updateTemplate = useCallback(async (id: number, data: CreateTemplateData): Promise<MessageTemplate | null> => {
    setError(null)

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la mise a jour')
      }

      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? result.template : t))
      )
      return result.template
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      console.error('Error updating template:', err)
      return null
    }
  }, [])

  // Delete a template
  const deleteTemplate = useCallback(async (id: number): Promise<boolean> => {
    setError(null)

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la suppression')
      }

      setTemplates((prev) => prev.filter((t) => t.id !== id))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      console.error('Error deleting template:', err)
      return false
    }
  }, [])

  // Record template usage (increment counter)
  const useTemplate = useCallback(async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/templates/${id}/use`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        // Update local state with new usage count
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  usage_count: result.template.usage_count,
                  last_used_at: result.template.last_used_at,
                }
              : t
          )
        )
      }
    } catch (err) {
      console.error('Error recording template usage:', err)
    }
  }, [])

  // Apply a template with context (replace tokens)
  const applyTemplate = useCallback(
    (template: MessageTemplate, context: TokenContext): { subject: string | null; body: string } => {
      return {
        subject: template.subject ? replaceTokens(template.subject, context, 'placeholder') : null,
        body: replaceTokens(template.body, context, 'placeholder'),
      }
    },
    []
  )

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    applyTemplate,
  }
}
