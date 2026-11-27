'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreateTemplateModal, type MessageTemplate } from '@/components/templates'
import { FillButton } from '@/components/ui/buttons'
import {
  Plus,
  Search,
  Mail,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  FileText,
  Filter,
  Loader2,
} from 'lucide-react'

type TemplatesPageClientProps = {
  initialTemplates: MessageTemplate[]
  initialCategories: { id: number; name: string; color: string }[]
  organizationId: number
  userId: string
}

type TemplateType = 'email' | 'sms' | 'whatsapp' | 'linkedin'

const TYPE_ICONS: Record<TemplateType, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4" />,
  linkedin: <MessageSquare className="w-4 h-4" />,
}

const TYPE_LABELS: Record<TemplateType, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
}

export function TemplatesPageClient({
  initialTemplates,
  initialCategories,
  organizationId,
  userId,
}: TemplatesPageClientProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(initialTemplates)
  const [categories] = useState(initialCategories)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        template.name.toLowerCase().includes(searchLower) ||
        template.body.toLowerCase().includes(searchLower) ||
        template.subject?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Type filter
    if (filterType !== 'all' && template.type !== filterType) {
      return false
    }

    // Category filter
    if (filterCategory !== 'all' && template.category !== filterCategory) {
      return false
    }

    return true
  })

  // Handle template created/updated
  const handleTemplateCreated = useCallback((template: MessageTemplate) => {
    setTemplates((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === template.id)
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prev]
        updated[existingIndex] = template
        return updated
      }
      // Add new
      return [template, ...prev]
    })
    setEditingTemplate(null)
  }, [])

  // Handle delete template
  const handleDelete = async (template: MessageTemplate) => {
    if (!confirm(`Supprimer le template "${template.name}" ?`)) {
      return
    }

    setIsDeleting(template.id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('message_templates').delete().eq('id', template.id)

      if (error) throw error

      setTemplates((prev) => prev.filter((t) => t.id !== template.id))
    } catch (err) {
      console.error('Error deleting template:', err)
      alert('Erreur lors de la suppression')
    } finally {
      setIsDeleting(null)
      setActiveDropdown(null)
    }
  }

  // Handle duplicate template
  const handleDuplicate = async (template: MessageTemplate) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          organization_id: organizationId,
          name: `${template.name} (copie)`,
          subject: template.subject,
          body: template.body,
          type: template.type,
          category: template.category,
          tokens: typeof template.tokens === 'string' ? template.tokens : JSON.stringify(template.tokens || []),
          created_by: userId,
        })
        .select('*')
        .single()

      if (error) throw error

      setTemplates((prev) => [data, ...prev])
    } catch (err) {
      console.error('Error duplicating template:', err)
      alert('Erreur lors de la duplication')
    }
    setActiveDropdown(null)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setActiveDropdown(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Extract unique categories from templates
  const templateCategories = [...new Set(templates.map((t) => t.category).filter(Boolean))]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">Templates</h1>
          <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
            {templates.length} template{templates.length !== 1 ? 's' : ''} de messages
          </p>
        </div>
        <FillButton onClick={() => {
            setEditingTemplate(null)
            setShowCreateModal(true)
          }}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau template
          </span>
        </FillButton>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA0A6] dark:text-[#8B949E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un template..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#161B22] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] placeholder:text-[#9BA0A6] dark:placeholder:text-[#8B949E] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2 p-1 bg-[#F5F7F9] dark:bg-[#21262D] rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              filterType === 'all'
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Tous
          </button>
          {(['email', 'sms', 'whatsapp', 'linkedin'] as TemplateType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                filterType === type
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {TYPE_ICONS[type]}
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {templateCategories.length > 0 && (
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-white dark:bg-[#161B22] border border-black/[0.08] dark:border-white/[0.08] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 cursor-pointer"
            >
              <option value="all">Toutes categories</option>
              {templateCategories.map((cat) => (
                <option key={cat} value={cat as string}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA0A6] dark:text-[#8B949E] pointer-events-none" />
          </div>
        )}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-[14px] bg-[#F5F7F9] dark:bg-[#21262D] flex items-center justify-center">
            <FileText className="w-12 h-12 text-[#9BA0A6] dark:text-[#8B949E]" strokeWidth={1.5} />
          </div>
          {templates.length === 0 ? (
            <>
              <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Aucun template</h2>
              <p className="text-[#4E525A] dark:text-[#8B949E] max-w-md mx-auto mb-6">
                Creez votre premier template de message pour accelerer vos communications.
              </p>
              <FillButton onClick={() => setShowCreateModal(true)}>
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Creer un template
                </span>
              </FillButton>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Aucun resultat</h2>
              <p className="text-[#4E525A] dark:text-[#8B949E] max-w-md mx-auto">
                Aucun template ne correspond a vos criteres de recherche.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-[#161B22] rounded-xl border border-black/[0.08] dark:border-white/[0.08] p-5 hover:shadow-md hover:border-black/[0.12] dark:hover:border-white/[0.12] transition-all duration-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      template.type === 'email'
                        ? 'bg-[#0066FF]/10 text-[#0066FF]'
                        : template.type === 'sms'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : template.type === 'whatsapp'
                            ? 'bg-[#25D366]/10 text-[#25D366]'
                            : 'bg-[#0A66C2]/10 text-[#0A66C2]'
                    }`}
                  >
                    {TYPE_ICONS[template.type]}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#0D0F14] dark:text-[#E6EDF3] text-sm">{template.name}</h3>
                    <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">{TYPE_LABELS[template.type]}</span>
                  </div>
                </div>

                {/* Actions dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveDropdown(activeDropdown === template.id ? null : template.id)
                    }}
                    className="w-7 h-7 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-[#4E525A] dark:text-[#8B949E]" />
                  </button>

                  {activeDropdown === template.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#161B22] rounded-lg shadow-lg border border-black/[0.08] dark:border-white/[0.08] py-1 z-10">
                      <button
                        onClick={() => {
                          setEditingTemplate(template)
                          setShowCreateModal(true)
                          setActiveDropdown(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0D0F14] dark:text-[#E6EDF3] hover:bg-[#F5F7F9] dark:hover:bg-[#21262D]"
                      >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDuplicate(template)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#0D0F14] dark:text-[#E6EDF3] hover:bg-[#F5F7F9] dark:hover:bg-[#21262D]"
                      >
                        <Copy className="w-4 h-4" />
                        Dupliquer
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
                        disabled={isDeleting === template.id}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#B42318] hover:bg-[#FDE8E5] dark:hover:bg-[#B42318]/10"
                      >
                        {isDeleting === template.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              {template.subject && (
                <div className="mb-2">
                  <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Objet:</span>
                  <p className="text-sm text-[#0D0F14] dark:text-[#E6EDF3] truncate">{template.subject}</p>
                </div>
              )}

              {/* Body preview */}
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E] line-clamp-3 mb-3">{template.body}</p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                {template.category ? (
                  <span className="text-xs text-[#4E525A] dark:text-[#8B949E] bg-[#F5F7F9] dark:bg-[#21262D] px-2 py-1 rounded">
                    {template.category}
                  </span>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-3 text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                  {template.usage_count > 0 && (
                    <span>{template.usage_count} utilisation{template.usage_count > 1 ? 's' : ''}</span>
                  )}
                  {template.tokens && (Array.isArray(template.tokens) ? template.tokens : JSON.parse(template.tokens as unknown as string)).length > 0 && (
                    <span className="text-[#0066FF]">
                      {(Array.isArray(template.tokens) ? template.tokens : JSON.parse(template.tokens as unknown as string)).length} token{(Array.isArray(template.tokens) ? template.tokens : JSON.parse(template.tokens as unknown as string)).length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingTemplate(null)
        }}
        onTemplateCreated={handleTemplateCreated}
        organizationId={organizationId}
        userId={userId}
        categories={categories}
        editTemplate={editingTemplate}
      />
    </div>
  )
}
