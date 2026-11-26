'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreateListModal } from '@/components/modals/CreateListModal'

type List = {
  id: number
  uuid: string
  name: string
  description: string | null
  type: 'static' | 'dynamic'
  member_count: number
  created_at: string
  updated_at: string
}

type ListsPageClientProps = {
  initialLists: List[]
  organizationId: number
  userId: string
}

export function ListsPageClient({ initialLists, organizationId, userId }: ListsPageClientProps) {
  const [lists, setLists] = useState<List[]>(initialLists)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter lists based on search query
  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleListCreated = (newList: List) => {
    setLists([newList, ...lists])
    setIsCreateModalOpen(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[23.5px] font-semibold text-[#0D0F14] mb-1">Listes</h1>
          <p className="text-sm text-[#4E525A]">
            Organisez vos leads en listes statiques ou dynamiques
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#17191F] text-white rounded-[10px] font-medium hover:bg-[#2A2D35] transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Creer une liste
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17191F" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14]">{lists.length}</p>
              <p className="text-sm text-[#4E525A]">Total listes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#E8F5E9] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14]">
                {lists.filter(l => l.type === 'static').length}
              </p>
              <p className="text-sm text-[#4E525A]">Listes statiques</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#E3F2FD] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14]">
                {lists.filter(l => l.type === 'dynamic').length}
              </p>
              <p className="text-sm text-[#4E525A]">Listes dynamiques</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher une liste..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E4E6] rounded-[10px] text-sm focus:outline-none focus:border-[#17191F] transition-colors"
          />
        </div>
      </div>

      {/* Lists Table */}
      {filteredLists.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F7F9] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0D0F14] mb-2">
              {searchQuery ? 'Aucune liste trouvee' : 'Aucune liste'}
            </h3>
            <p className="text-sm text-[#4E525A] mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Essayez avec dautres mots-cles'
                : 'Creez votre premiere liste pour organiser vos leads'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-[#17191F] text-white rounded-[10px] font-medium hover:bg-[#2A2D35] transition-colors inline-flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Creer une liste
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[14px] border border-[#E2E4E6] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFF1F3]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] uppercase tracking-wide">
                  Nom
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] uppercase tracking-wide">
                  Membres
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] uppercase tracking-wide">
                  Cree le
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#4E525A] uppercase tracking-wide">
                  Mis a jour
                </th>
                <th className="w-12 px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFF1F3]">
              {filteredLists.map((list) => (
                <tr key={list.id} className="hover:bg-[#F5F7F9] transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/lists/${list.id}`} className="block">
                      <p className="font-medium text-[#0D0F14] hover:text-[#17191F]">{list.name}</p>
                      {list.description && (
                        <p className="text-sm text-[#4E525A] mt-0.5 line-clamp-1">{list.description}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                      list.type === 'static'
                        ? 'bg-[#E8F5E9] text-[#147A3A]'
                        : 'bg-[#E3F2FD] text-[#1565C0]'
                    }`}>
                      {list.type === 'static' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      )}
                      {list.type === 'static' ? 'Statique' : 'Dynamique'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[#0D0F14] font-medium">{list.member_count}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#4E525A]">
                    {formatDate(list.created_at)}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#4E525A]">
                    {formatDate(list.updated_at)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/lists/${list.id}`}
                      className="text-[#4E525A] hover:text-[#0D0F14] transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create List Modal */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListCreated={handleListCreated}
        organizationId={organizationId}
        userId={userId}
      />
    </div>
  )
}
