'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'
import { TemplateEditor } from './TemplateEditor'
import { validateTemplate, extractTokensFromText } from '@/lib/utils/tokens'
import { X, Mail, MessageSquare, Loader2 } from 'lucide-react'

type TemplateType = 'email' | 'sms' | 'whatsapp' | 'linkedin'

type CreateTemplateModalProps = {
  isOpen: boolean
  onClose: () => void
  onTemplateCreated: (template: MessageTemplate) => void
  organizationId: number
  userId: string
  categories?: { id: number; name: string; color: string }[]
  editTemplate?: MessageTemplate | null
}

export type MessageTemplate = {
  id: number
  uuid: string
  organization_id: number
  name: string
  subject: string | null
  body: string
  type: TemplateType
  category: string | null
  tokens: string[]
  is_active: boolean
  usage_count: number
  last_used_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

const TEMPLATE_TYPES: { value: TemplateType; label: string; icon: React.ReactNode }[] = [
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'linkedin', label: 'LinkedIn', icon: <MessageSquare className="w-4 h-4" /> },
]

export function CreateTemplateModal({
  isOpen,
  onClose,
  onTemplateCreated,
  organizationId,
  userId,
  categories = [],
  editTemplate = null,
}: CreateTemplateModalProps) {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<TemplateType>('email')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!editTemplate

  // Populate form when editing
  useEffect(() => {
    if (editTemplate) {
      setName(editTemplate.name)
      setSubject(editTemplate.subject || '')
      setBody(editTemplate.body)
      setType(editTemplate.type)
      setCategory(editTemplate.category || '')
    } else {
      // Reset form for new template
      setName('')
      setSubject('')
      setBody('')
      setType('email')
      setCategory('')
    }
    setError(null)
  }, [editTemplate, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (!name.trim()) {
      setError('Le nom du template est obligatoire')
      return
    }

    const validation = validateTemplate({ subject, body })
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Extract tokens used in the template
      const usedTokens = [
        ...extractTokensFromText(subject),
        ...extractTokensFromText(body),
      ]

      const templateData = {
        organization_id: organizationId,
        name: name.trim(),
        subject: subject.trim() || null,
        body: body.trim(),
        type,
        category: category.trim() || null,
        tokens: JSON.stringify([...new Set(usedTokens)]),
        created_by: userId,
      }

      let result

      if (isEditing && editTemplate) {
        // Update existing template
        const { data, error: updateError } = await supabase
          .from('message_templates')
          .update({
            name: templateData.name,
            subject: templateData.subject,
            body: templateData.body,
            type: templateData.type,
            category: templateData.category,
            tokens: templateData.tokens,
          })
          .eq('id', editTemplate.id)
          .select('*')
          .single()

        if (updateError) throw updateError
        result = data
      } else {
        // Create new template
        const { data, error: insertError } = await supabase
          .from('message_templates')
          .insert(templateData)
          .select('*')
          .single()

        if (insertError) throw insertError
        result = data
      }

      // Reset form
      setName('')
      setSubject('')
      setBody('')
      setType('email')
      setCategory('')

      // Call parent callback
      onTemplateCreated(result)
      onClose()
    } catch (err: unknown) {
      console.error('Error saving template:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde du template'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-[#30363D]">
          <div>
            <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
              {isEditing ? 'Modifier le template' : 'Creer un template'}
            </h2>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mt-0.5">
              Utilisez des tokens pour personnaliser vos messages
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-[#4E525A] dark:text-[#8B949E]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[#FDE8E5] dark:bg-[#B42318]/10 border border-[#B42318]/20 rounded-xl flex items-start gap-3 shadow-sm">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-0.5 text-[#B42318] dark:text-[#F87171]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-sm text-[#B42318] dark:text-[#F87171]">{error}</p>
              </div>
            )}

            {/* Row 1: Name and Type */}
            <div className="grid grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <label htmlFor="template-name" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                  Nom du template <span className="text-[#B42318]">*</span>
                </label>
                <input
                  id="template-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Premier contact prospect"
                  className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200"
                  disabled={isLoading}
                  maxLength={255}
                />
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Type</label>
                <div className="flex gap-2">
                  {TEMPLATE_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      disabled={isLoading}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                        type === t.value
                          ? 'border-[#0066FF] bg-[#0066FF]/5 text-[#0066FF]'
                          : 'border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] hover:border-black/[0.12] dark:hover:border-[#30363D] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      {t.icon}
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="template-category" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Categorie (optionnel)
              </label>
              {categories.length > 0 ? (
                <select
                  id="template-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200"
                  disabled={isLoading}
                >
                  <option value="">Aucune categorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="template-category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Prospection, Suivi, Relance..."
                  className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200"
                  disabled={isLoading}
                  maxLength={100}
                />
              )}
            </div>

            {/* Template Editor */}
            <TemplateEditor
              subject={subject}
              body={body}
              onSubjectChange={setSubject}
              onBodyChange={setBody}
              showPreview={true}
              disabled={isLoading}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-black/[0.06] dark:border-[#30363D] bg-[#FAFBFC] dark:bg-[#161B22]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 bg-transparent border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              Annuler
            </button>
            <FillButton
              disabled={isLoading || !name.trim() || !body.trim()}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Mise a jour...' : 'Creation...'}
                </span>
              ) : isEditing ? (
                'Mettre a jour'
              ) : (
                'Creer le template'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
