'use client'

import { useState, useMemo } from 'react'
import DOMPurify from 'dompurify'
import { generatePreview, extractTokensFromText, AVAILABLE_TOKENS, Token } from '@/lib/utils/tokens'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

type TokenPreviewProps = {
  subject?: string
  body: string
  showToggle?: boolean
}

export function TokenPreview({ subject, body, showToggle = true }: TokenPreviewProps) {
  const [showPreview, setShowPreview] = useState(true)

  // Extract used tokens
  const usedTokenNames = [
    ...(subject ? extractTokensFromText(subject) : []),
    ...extractTokensFromText(body),
  ]
  const uniqueTokenNames = [...new Set(usedTokenNames)]

  // Find valid and invalid tokens
  const validTokens: Token[] = []
  const invalidTokens: string[] = []

  uniqueTokenNames.forEach((name) => {
    const token = AVAILABLE_TOKENS.find((t) => t.name === name)
    if (token) {
      validTokens.push(token)
    } else {
      invalidTokens.push(name)
    }
  })

  // Generate preview content
  const previewSubject = subject ? generatePreview(subject) : null
  const previewBody = generatePreview(body)

  return (
    <div className="border border-black/[0.08] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAFBFC] border-b border-black/[0.06]">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#4E525A]" />
          <span className="text-sm font-medium text-[#0D0F14]">Aperçu</span>
          {invalidTokens.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#B42318] bg-[#FDE8E5] px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              {invalidTokens.length} token{invalidTokens.length > 1 ? 's' : ''} invalide{invalidTokens.length > 1 ? 's' : ''}
            </span>
          )}
          {invalidTokens.length === 0 && validTokens.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" />
              {validTokens.length} token{validTokens.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {showToggle && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 text-xs text-[#4E525A] hover:text-[#0D0F14] transition-colors"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Masquer
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Afficher
              </>
            )}
          </button>
        )}
      </div>

      {showPreview && (
        <div className="p-4">
          {/* Invalid tokens warning */}
          {invalidTokens.length > 0 && (
            <div className="mb-4 p-3 bg-[#FDE8E5] rounded-lg">
              <p className="text-sm text-[#B42318] font-medium mb-1">Tokens non reconnus:</p>
              <div className="flex flex-wrap gap-1.5">
                {invalidTokens.map((token) => (
                  <span
                    key={token}
                    className="text-xs bg-white/80 text-[#B42318] px-2 py-1 rounded font-medium"
                  >
                    [{token}]
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Email preview mock */}
          <div className="bg-white border border-black/[0.08] rounded-lg overflow-hidden">
            {/* Email header */}
            {previewSubject && (
              <div className="px-4 py-3 border-b border-black/[0.06] bg-[#FAFBFC]">
                <div className="flex items-center gap-2 text-xs text-[#9BA0A6] mb-1">
                  <span>Objet:</span>
                </div>
                <p className="text-sm font-medium text-[#0D0F14]">{previewSubject}</p>
              </div>
            )}

            {/* Email body */}
            <div className="p-4">
              <div
                className="text-sm text-[#0D0F14] whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    previewBody
                      .replace(/\n/g, '<br />')
                      // Highlight tokens that couldn't be replaced
                      .replace(
                        /\{\{([^}]+)\}\}/g,
                        '<span class="bg-[#FEF3C7] text-[#92400E] px-1 rounded font-medium text-xs">[$1]</span>'
                      ),
                    { ALLOWED_TAGS: ['br', 'span'], ALLOWED_ATTR: ['class'] }
                  ),
                }}
              />
            </div>
          </div>

          {/* Token legend */}
          {validTokens.length > 0 && (
            <div className="mt-4 pt-4 border-t border-black/[0.06]">
              <p className="text-xs font-medium text-[#4E525A] mb-2">Tokens utilisés:</p>
              <div className="flex flex-wrap gap-1.5">
                {validTokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center gap-1 text-xs bg-[#F5F7F9] px-2 py-1 rounded"
                    title={token.description}
                  >
                    <span className="text-[#0066FF] font-medium">[{token.label}]</span>
                    <span className="text-[#9BA0A6]">=</span>
                    <span className="text-[#4E525A]">{token.example}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
