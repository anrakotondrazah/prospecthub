'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { TokenPicker } from './TokenPicker'
import { TokenPreview } from './TokenPreview'
import { Token, insertTokenAtCursor, validateTemplate } from '@/lib/utils/tokens'
import { Plus, AlertCircle, CheckCircle } from 'lucide-react'

type TemplateEditorProps = {
  subject: string
  body: string
  onSubjectChange: (value: string) => void
  onBodyChange: (value: string) => void
  showPreview?: boolean
  disabled?: boolean
}

export function TemplateEditor({
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  showPreview = true,
  disabled = false,
}: TemplateEditorProps) {
  const [showTokenPicker, setShowTokenPicker] = useState(false)
  const [tokenPickerPosition, setTokenPickerPosition] = useState({ top: 0, left: 0 })
  const [activeField, setActiveField] = useState<'subject' | 'body'>('body')
  const [cursorPosition, setCursorPosition] = useState(0)

  const subjectRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Validation
  const validation = validateTemplate({ subject, body })

  // Handle token insertion
  const handleTokenSelect = useCallback(
    (token: Token) => {
      if (activeField === 'subject' && subjectRef.current) {
        const result = insertTokenAtCursor(subject, cursorPosition, token)
        onSubjectChange(result.newText)
        // Restore focus and cursor
        setTimeout(() => {
          if (subjectRef.current) {
            subjectRef.current.focus()
            subjectRef.current.setSelectionRange(result.newCursorPosition, result.newCursorPosition)
          }
        }, 0)
      } else if (bodyRef.current) {
        const result = insertTokenAtCursor(body, cursorPosition, token)
        onBodyChange(result.newText)
        // Restore focus and cursor
        setTimeout(() => {
          if (bodyRef.current) {
            bodyRef.current.focus()
            bodyRef.current.setSelectionRange(result.newCursorPosition, result.newCursorPosition)
          }
        }, 0)
      }
    },
    [activeField, subject, body, cursorPosition, onSubjectChange, onBodyChange]
  )

  // Open token picker at current cursor position
  const openTokenPicker = useCallback(
    (field: 'subject' | 'body') => {
      setActiveField(field)

      const ref = field === 'subject' ? subjectRef : bodyRef
      const element = ref.current

      if (element && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const elementRect = element.getBoundingClientRect()

        setCursorPosition(element.selectionStart || 0)
        setTokenPickerPosition({
          top: elementRect.bottom - containerRect.top + 8,
          left: Math.min(elementRect.left - containerRect.left, containerRect.width - 320),
        })
        setShowTokenPicker(true)
      }
    },
    []
  )

  // Handle keyboard shortcut for token picker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open token picker on { key
      if (e.key === '{' && !showTokenPicker) {
        const target = e.target as HTMLElement
        if (target === subjectRef.current) {
          openTokenPicker('subject')
        } else if (target === bodyRef.current) {
          openTokenPicker('body')
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showTokenPicker, openTokenPicker])

  // Track cursor position on selection change
  const handleSelectionChange = useCallback(
    (field: 'subject' | 'body') => {
      const ref = field === 'subject' ? subjectRef : bodyRef
      if (ref.current) {
        setCursorPosition(ref.current.selectionStart || 0)
        setActiveField(field)
      }
    },
    []
  )

  return (
    <div ref={containerRef} className="relative space-y-4">
      {/* Subject field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="template-subject" className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">
            Objet (optionnel)
          </label>
          <button
            type="button"
            onClick={() => openTokenPicker('subject')}
            disabled={disabled}
            className="flex items-center gap-1 text-xs text-[#0066FF] hover:text-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Token
          </button>
        </div>
        <input
          ref={subjectRef}
          id="template-subject"
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          onSelect={() => handleSelectionChange('subject')}
          onClick={() => handleSelectionChange('subject')}
          placeholder="Ex: Bonjour {{lead.first_name}}, decouvrez notre solution"
          disabled={disabled}
          className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 disabled:bg-[#F5F7F9] dark:disabled:bg-[#21262D] disabled:cursor-not-allowed"
        />
      </div>

      {/* Body field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="template-body" className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">
            Corps du message <span className="text-[#B42318]">*</span>
          </label>
          <button
            type="button"
            onClick={() => openTokenPicker('body')}
            disabled={disabled}
            className="flex items-center gap-1 text-xs text-[#0066FF] hover:text-[#0052CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Token
          </button>
        </div>
        <textarea
          ref={bodyRef}
          id="template-body"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          onSelect={() => handleSelectionChange('body')}
          onClick={() => handleSelectionChange('body')}
          placeholder={`Bonjour {{lead.first_name}},

Je me permets de vous contacter concernant...

{{lead.company_name}} pourrait beneficier de notre solution...

Cordialement,
{{user.full_name}}
{{organization.name}}`}
          rows={12}
          disabled={disabled}
          className="w-full px-4 py-3 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 resize-y min-h-[200px] disabled:bg-[#F5F7F9] dark:disabled:bg-[#21262D] disabled:cursor-not-allowed font-mono"
        />
        <div className="flex items-center justify-between mt-2 text-xs text-[#9BA0A6] dark:text-[#8B949E]">
          <span>
            Tapez <code className="bg-[#F5F7F9] dark:bg-[#21262D] px-1 rounded">{'{'}</code> pour inserer un token
          </span>
          <span>{body.length} caracteres</span>
        </div>
      </div>

      {/* Validation messages */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, i) => (
            <div
              key={`error-${i}`}
              className="flex items-start gap-2 p-3 bg-[#FDE8E5] dark:bg-[#B42318]/10 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-[#B42318] dark:text-[#F87171] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-[#B42318] dark:text-[#F87171]">{error}</span>
            </div>
          ))}
          {validation.warnings.map((warning, i) => (
            <div
              key={`warning-${i}`}
              className="flex items-start gap-2 p-3 bg-[#FEF3C7] dark:bg-[#92400E]/10 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-[#92400E] dark:text-[#F59E0B] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-[#92400E] dark:text-[#F59E0B]">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Success indicator */}
      {validation.isValid && validation.usedTokens.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-[#ECFDF5] dark:bg-[#059669]/10 rounded-lg">
          <CheckCircle className="w-4 h-4 text-[#059669]" />
          <span className="text-sm text-[#059669]">
            Template valide avec {validation.usedTokens.length} token{validation.usedTokens.length > 1 ? 's' : ''} de personnalisation
          </span>
        </div>
      )}

      {/* Preview */}
      {showPreview && body.trim() && (
        <TokenPreview subject={subject} body={body} />
      )}

      {/* Token Picker */}
      <TokenPicker
        isOpen={showTokenPicker}
        onClose={() => setShowTokenPicker(false)}
        onSelect={handleTokenSelect}
        position={tokenPickerPosition}
      />
    </div>
  )
}
