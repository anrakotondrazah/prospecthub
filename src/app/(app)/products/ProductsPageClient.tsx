'use client'

import { useState, useMemo } from 'react'
import { CreateProductModal } from '@/components/products/CreateProductModal'
import { createClient } from '@/lib/supabase/client'
import { FillButton, AnimatedCheckbox } from '@/components/ui/buttons'

type Product = {
  id: number
  uuid: string
  sku: string | null
  name: string
  description: string | null
  unit_price: number
  currency: string
  unit: string
  tax_rate: number
  category: string | null
  is_recurring: boolean
  is_active: boolean
  created_at: string
}

type ProductsPageClientProps = {
  initialProducts: Product[]
  organizationId: number
  userId: string
}

const UNITS_LABELS: Record<string, string> = {
  unit: 'Unite',
  hour: 'Heure',
  day: 'Jour',
  month: 'Mois',
  year: 'Annee',
  kg: 'Kg',
  m2: 'm2',
}

export function ProductsPageClient({
  initialProducts,
  organizationId,
  userId,
}: ProductsPageClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const catégories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach((p) => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats).sort()
  }, [products])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesActive = showInactive || product.is_active

    return matchesSearch && matchesCategory && matchesActive
  })

  const handleProductCreated = (newProduct: Omit<Product, 'created_at'> & { created_at?: string }) => {
    const productWithDate: Product = {
      ...newProduct,
      created_at: newProduct.created_at || new Date().toISOString(),
    }
    setProducts([productWithDate, ...products])
    setIsCreateModalOpen(false)
  }

  const toggleProductStatus = async (productId: number, currentStatus: boolean) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', productId)

    if (!error) {
      setProducts(products.map((p) =>
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ))
    }
  }

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  // Stats
  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    recurring: products.filter((p) => p.is_recurring).length,
    catégories: catégories.length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">Produits</h1>
          <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
            Gérez votre catalogue produits et services
          </p>
        </div>
        <FillButton onClick={() => setIsCreateModalOpen(true)}>
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Créer un produit
          </span>
        </FillButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] dark:bg-[#21262D] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#17191F] dark:text-[#E6EDF3]">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">{stats.total}</p>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Total produits</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#E8F5E9] dark:bg-[#147A3A]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">{stats.active}</p>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#E3F2FD] dark:bg-[#1565C0]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">{stats.recurring}</p>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Recurrents</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#F3E5F5] dark:bg-[#7B1FA2]/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">{stats.catégories}</p>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Catégories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BA0A6] dark:text-[#6E7681]"
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
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#161B22] border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm text-[#0D0F14] dark:text-[#E6EDF3] placeholder:text-[#9BA0A6] dark:placeholder:text-[#6E7681] focus:outline-none focus:border-[#17191F] dark:focus:border-[#58A6FF] transition-colors"
          />
        </div>

        {catégories.length > 0 && (
          <div className="flex gap-2 p-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                !selectedCategory
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Tous
            </button>
            {catégories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <AnimatedCheckbox
          id="showInactive"
          checked={showInactive}
          onChange={setShowInactive}
          label="Afficher les inactifs"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F7F9] dark:bg-[#21262D] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#4E525A] dark:text-[#8B949E]">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              {searchQuery || selectedCategory ? 'Aucun produit trouvé' : 'Aucun produit'}
            </h3>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-6 max-w-md mx-auto">
              {searchQuery || selectedCategory
                ? 'Essayez avec d\'autres criteres de recherche'
                : 'Creez votre premier produit pour commencer'}
            </p>
            {!searchQuery && !selectedCategory && (
              <FillButton onClick={() => setIsCreateModalOpen(true)}>
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Créer un produit
                </span>
              </FillButton>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-5 hover:border-[#17191F]/30 dark:hover:border-white/30 hover:shadow-sm transition-all ${
                !product.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#0D0F14] dark:text-[#E6EDF3] truncate">{product.name}</h3>
                  {product.sku && (
                    <p className="text-xs text-[#9BA0A6] dark:text-[#6E7681]">REF: {product.sku}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {product.is_recurring && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E3F2FD] dark:bg-[#1565C0]/20 text-[#1565C0] dark:text-[#58A6FF] font-medium">
                      Recurrent
                    </span>
                  )}
                  {!product.is_active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F7F9] dark:bg-[#21262D] text-[#9BA0A6] dark:text-[#6E7681] font-medium">
                      Inactif
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-3 line-clamp-2">{product.description}</p>
              )}

              {/* Category & Unit */}
              <div className="flex items-center gap-3 text-xs text-[#9BA0A6] dark:text-[#6E7681] mb-4">
                {product.category && (
                  <span className="px-2 py-0.5 rounded-full bg-[#F5F7F9] dark:bg-[#21262D]">{product.category}</span>
                )}
                <span>TVA {product.tax_rate}%</span>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#EFF1F3] dark:border-[#30363D]">
                <div>
                  <p className="text-lg font-bold text-[#0D0F14] dark:text-[#E6EDF3]">
                    {formatCurrency(product.unit_price, product.currency)}
                  </p>
                  <p className="text-xs text-[#9BA0A6] dark:text-[#6E7681]">/ {UNITS_LABELS[product.unit] || product.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleProductStatus(product.id, product.is_active)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      product.is_active
                        ? 'hover:bg-[#FDE8E5] dark:hover:bg-[#B42318]/10 text-[#9BA0A6] dark:text-[#6E7681] hover:text-[#B42318]'
                        : 'hover:bg-[#E8F5E9] dark:hover:bg-[#147A3A]/10 text-[#9BA0A6] dark:text-[#6E7681] hover:text-[#147A3A]'
                    }`}
                    title={product.is_active ? 'Desactiver' : 'Activer'}
                  >
                    {product.is_active ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={handleProductCreated}
        organizationId={organizationId}
        userId={userId}
      />
    </div>
  )
}
