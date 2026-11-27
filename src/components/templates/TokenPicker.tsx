'use client'

import { useState, useRef, useEffect } from 'react'
import {
  AVAILABLE_TOKENS,
  getTokensByCategory,
  TOKEN_CATEGORY_LABELS,
  Token,
  TokenCategory,
} from '@/lib/utils/tokens'
import { Search, X, User, Building2, Briefcase, UserCircle, Building, Calendar } from 'lucide-react'

type TokenPickerProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: Token) => void
  position?: { top: number; left: number }
  searchQuery?: string
}

const CategoryIcon = ({ category }: { category: TokenCategory }) => {
  const iconProps = { className: 'w-4 h-4', strokeWidth: 1.5 }

  switch (category) {
    case 'lead':
      return <User {...iconProps} />
    case 'company':
      return <Building2 {...iconProps} />
    case 'deal':
      return <Briefcase {...iconProps} />
    case 'user':
      return <UserCircle {...iconProps} />
    case 'organization':
      return <Building {...iconProps} />
    case 'date':
      return <Calendar {...iconProps} />
    default:
      return null
  }
}

export function TokenPicker({
  isOpen,
  onClose,
  onSelect,
  position,
  searchQuery: initialSearch = '',
}: TokenPickerProps) {
  const [search, setSearch] = useState(initialSearch)
  const [activeCategory, setActiveCategory] = useState<TokenCategory | 'all'>('all')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const tokensByCategory = getTokensByCategory()
  const categories = Object.keys(tokensByCategory) as TokenCategory[]

  // Filter tokens based on search and category
  let filteredTokens = activeCategory === 'all'
    ? AVAILABLE_TOKENS
    : tokensByCategory[activeCategory] || []

  if (search.trim()) {
    const searchLower = search.toLowerCase()
    filteredTokens = filteredTokens.filter(
      token =>
        token.label.toLowerCase().includes(searchLower) ||
        token.description.toLowerCase().includes(searchLower) ||
        token.name.toLowerCase().includes(searchLower)
    )
  }

  const handleSelect = (token: Token) => {
    onSelect(token)
    onClose()
  }

  const style = position
    ? {
        position: 'absolute' as const,
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 100,
      }
    : {}

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-[#0D1117] rounded-xl shadow-xl border border-black/[0.08] dark:border-[#30363D] w-80 max-h-[400px] overflow-hidden flex flex-col"
      style={style}
    >
      {/* Header */}
      <div className="p-3 border-b border-black/[0.06] dark:border-[#30363D]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">Inserer un token</span>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#4E525A] dark:text-[#8B949E]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9BA0A6] dark:text-[#8B949E]" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un token..."
            className="w-full pl-9 pr-3 py-2 bg-[#F5F7F9] dark:bg-[#161B22] border-none rounded-lg text-sm text-[#0D0F14] dark:text-[#E6EDF3] placeholder:text-[#9BA0A6] dark:placeholder:text-[#8B949E] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-2 border-b border-black/[0.06] dark:border-[#30363D] overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-[#0066FF] text-white'
              : 'bg-[#F5F7F9] dark:bg-[#21262D] text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.06] dark:hover:bg-[#30363D]'
          }`}
        >
          Tous
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeCategory === category
                ? 'bg-[#0066FF] text-white'
                : 'bg-[#F5F7F9] dark:bg-[#21262D] text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.06] dark:hover:bg-[#30363D]'
            }`}
          >
            <CategoryIcon category={category} />
            {TOKEN_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {/* Token list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredTokens.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#9BA0A6] dark:text-[#8B949E]">
            Aucun token trouve
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => handleSelect(token)}
                className="w-full text-left p-2.5 rounded-lg hover:bg-[#F5F7F9] dark:hover:bg-[#21262D] transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">
                        {token.label}
                      </span>
                      <span className="text-[10px] text-[#9BA0A6] dark:text-[#8B949E] bg-[#F5F7F9] dark:bg-[#21262D] px-1.5 py-0.5 rounded group-hover:bg-white dark:group-hover:bg-[#161B22]">
                        {TOKEN_CATEGORY_LABELS[token.category]}
                      </span>
                    </div>
                    <p className="text-xs text-[#4E525A] dark:text-[#8B949E] mt-0.5 truncate">
                      {token.description}
                    </p>
                  </div>
                  <code className="text-[10px] text-[#0066FF] bg-[#0066FF]/5 dark:bg-[#0066FF]/10 px-2 py-1 rounded ml-2 font-mono whitespace-nowrap">
                    {`{{${token.name}}}`}
                  </code>
                </div>
                <div className="mt-1.5 text-[11px] text-[#9BA0A6] dark:text-[#8B949E]">
                  Exemple: <span className="text-[#4E525A] dark:text-[#E6EDF3]">{token.example}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-2 border-t border-black/[0.06] dark:border-[#30363D] bg-[#FAFBFC] dark:bg-[#161B22]">
        <p className="text-[10px] text-[#9BA0A6] dark:text-[#8B949E] text-center">
          Tapez <code className="bg-white dark:bg-[#21262D] px-1 rounded">{'{'}</code> dans l'editeur pour ouvrir ce menu
        </p>
      </div>
    </div>
  )
}
