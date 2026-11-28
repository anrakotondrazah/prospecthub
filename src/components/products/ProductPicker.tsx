'use client'

import { useState, useMemo } from 'react'

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
}

type ProductPickerProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: Product) => void
  onAddEmpty: () => void
  products: Product[]
}

export function ProductPicker({
  isOpen,
  onClose,
  onSelect,
  onAddEmpty,
  products,
}: ProductPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach((p) => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats).sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.is_active) return false

      const matchesSearch = searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !selectedCategory || product.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const formatCurrency = (value: number, currency: string) => {
    // Validate currency code (must be 3 uppercase letters)
    const validCurrency = /^[A-Z]{3}$/.test(currency) ? currency : 'EUR'
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: validCurrency,
        minimumFractionDigits: 2,
      }).format(value)
    } catch (err) {
      console.error('Erreur format currency:', err)
      // Fallback if currency is still invalid
      return `${value.toFixed(2)} EUR`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06]">
          <h2 className="text-xl font-semibold text-[#0D0F14]">Ajouter un produit</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-black/[0.04] flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4E525A" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-black/[0.06] space-y-3">
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
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7F9] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-[#17191F] text-white'
                    : 'bg-[#F5F7F9] text-[#4E525A] hover:bg-[#E2E4E6]'
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#17191F] text-white'
                      : 'bg-[#F5F7F9] text-[#4E525A] hover:bg-[#E2E4E6]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#F5F7F9] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              </div>
              <p className="text-sm text-[#4E525A] mb-4">
                {searchQuery || selectedCategory
                  ? 'Aucun produit ne correspond a votre recherche'
                  : 'Aucun produit dans le catalogue'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onSelect(product)}
                  className="w-full text-left p-4 bg-white border border-[#E2E4E6] rounded-xl hover:border-[#17191F]/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-[#0D0F14] group-hover:text-[#17191F]">{product.name}</h4>
                        {product.is_recurring && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E3F2FD] text-[#1565C0] font-medium">
                            Recurrent
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-sm text-[#4E525A] line-clamp-1">{product.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#9BA0A6]">
                        {product.sku && <span>REF: {product.sku}</span>}
                        {product.category && <span>{product.category}</span>}
                        <span>TVA {product.tax_rate}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-semibold text-[#0D0F14]">
                        {formatCurrency(product.unit_price, product.currency)}
                      </p>
                      <p className="text-xs text-[#9BA0A6]">/ {product.unit}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/[0.06]">
          <button
            onClick={onAddEmpty}
            className="w-full px-4 py-2.5 border border-dashed border-[#E2E4E6] text-[#4E525A] rounded-xl font-medium hover:bg-[#F5F7F9] hover:border-[#17191F]/30 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter une ligne personnalisée
          </button>
        </div>
      </div>
    </div>
  )
}
