'use client'

import { useState, useMemo } from 'react'
import { DocumentItem, type DocumentItemData } from './DocumentItem'

interface DocumentListProps {
  documents: DocumentItemData[]
  isLoading?: boolean
  onView?: (document: DocumentItemData) => void
  onDownload?: (document: DocumentItemData) => void
  onDelete?: (document: DocumentItemData) => void
  emptyMessage?: string
}

type SortField = 'name' | 'created_at' | 'file_size' | 'file_type'
type SortOrder = 'asc' | 'desc'
type FilterType = 'all' | 'pdf' | 'doc' | 'xls' | 'image' | 'other'

export function DocumentList({
  documents,
  isLoading = false,
  onView,
  onDownload,
  onDelete,
  emptyMessage = 'Aucun document',
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterType, setFilterType] = useState<FilterType>('all')

  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((doc) => {
        const type = doc.file_type?.toLowerCase() || ''
        switch (filterType) {
          case 'pdf':
            return type === 'pdf'
          case 'doc':
            return ['doc', 'docx'].includes(type)
          case 'xls':
            return ['xls', 'xlsx'].includes(type)
          case 'image':
            return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(type)
          case 'other':
            return !['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(type)
          default:
            return true
        }
      })
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'file_size':
          comparison = a.file_size - b.file_size
          break
        case 'file_type':
          comparison = (a.file_type || '').localeCompare(b.file_type || '')
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [documents, searchQuery, sortField, sortOrder, filterType])

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'Word' },
    { value: 'xls', label: 'Excel' },
    { value: 'image', label: 'Images' },
    { value: 'other', label: 'Autres' },
  ]

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'created_at', label: 'Date' },
    { value: 'name', label: 'Nom' },
    { value: 'file_size', label: 'Taille' },
    { value: 'file_type', label: 'Type' },
  ]

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="p-4 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6] dark:text-[#8B949E]"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des documents..."
            className="w-full pl-10 pr-4 py-2 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200"
          />
        </div>

        {/* Filter Type */}
        <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] rounded-xl">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterType(option.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filterType === option.value
                  ? 'bg-[#0066FF] text-white'
                  : 'text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-2 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] rounded-xl text-xs text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-[#4E525A] dark:text-[#8B949E] transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
            >
              <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
        {filteredAndSortedDocuments.length} document{filteredAndSortedDocuments.length !== 1 ? 's' : ''}
        {searchQuery && ` pour "${searchQuery}"`}
      </div>

      {/* Document List */}
      {filteredAndSortedDocuments.length > 0 ? (
        <div className="space-y-3">
          {filteredAndSortedDocuments.map((document) => (
            <DocumentItem
              key={document.id}
              document={document}
              onView={onView}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="mx-auto mb-4 text-[#9BA0A6] dark:text-[#8B949E]"
          >
            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">{emptyMessage}</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-sm text-[#0066FF] hover:underline"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      )}
    </div>
  )
}
