'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreateListModal } from '@/components/modals/CreateListModal'
import { FillButton } from '@/components/ui/buttons'

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
          <h1 className="text-[23.5px] font-semibold text-foreground mb-1">Listes</h1>
          <p className="text-sm text-muted-foreground">
            Organisez vos leads en listes statiques ou dynamiques
          </p>
        </div>
        <FillButton onClick={() => setIsCreateModalOpen(true)}>
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Creer une liste
          </span>
        </FillButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-[14px] border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-muted flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{lists.length}</p>
              <p className="text-sm text-muted-foreground">Total listes</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-[14px] border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#E8F5E9] dark:bg-[#147A3A]/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {lists.filter(l => l.type === 'static').length}
              </p>
              <p className="text-sm text-muted-foreground">Listes statiques</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-[14px] border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#E3F2FD] dark:bg-[#1565C0]/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {lists.filter(l => l.type === 'dynamic').length}
              </p>
              <p className="text-sm text-muted-foreground">Listes dynamiques</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {/* Lists Table */}
      {filteredLists.length === 0 ? (
        <div className="bg-card rounded-[14px] border border-border p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'Aucune liste trouvee' : 'Aucune liste'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Essayez avec dautres mots-cles'
                : 'Creez votre premiere liste pour organiser vos leads'}
            </p>
            {!searchQuery && (
              <FillButton onClick={() => setIsCreateModalOpen(true)}>
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Creer une liste
                </span>
              </FillButton>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-[14px] border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Nom
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Membres
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Cree le
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Mis a jour
                </th>
                <th className="w-12 px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLists.map((list) => (
                <tr key={list.id} className="hover:bg-muted transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/lists/${list.id}`} className="block">
                      <p className="font-medium text-foreground hover:opacity-80">{list.name}</p>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{list.description}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                      list.type === 'static'
                        ? 'bg-[#E8F5E9] dark:bg-[#147A3A]/20 text-[#147A3A]'
                        : 'bg-[#E3F2FD] dark:bg-[#1565C0]/20 text-[#1565C0]'
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
                    <span className="text-foreground font-medium">{list.member_count}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {formatDate(list.created_at)}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {formatDate(list.updated_at)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/lists/${list.id}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
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
