'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'

type CreatedProduct = {
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
  created_at?: string
}

type CreateProductModalProps = {
  isOpen: boolean
  onClose: () => void
  onProductCreated: (product: CreatedProduct) => void
  organizationId: number
  userId: string
}

const UNITS = [
  { value: 'unit', label: 'Unite' },
  { value: 'hour', label: 'Heure' },
  { value: 'day', label: 'Jour' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Annee' },
  { value: 'kg', label: 'Kilogramme' },
  { value: 'm2', label: 'Metre carre' },
]

const TAX_RATES = [
  { value: 0, label: '0%' },
  { value: 5.5, label: '5.5%' },
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
]

export function CreateProductModal({
  isOpen,
  onClose,
  onProductCreated,
  organizationId,
  userId,
}: CreateProductModalProps) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [unit, setUnit] = useState('unit')
  const [taxRate, setTaxRate] = useState(20)
  const [category, setCategory] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Le nom est obligatoire')
      return
    }

    if (!unitPrice || parseFloat(unitPrice) < 0) {
      setError('Le prix unitaire est obligatoire')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          organization_id: organizationId,
          name: name.trim(),
          sku: sku.trim() || null,
          description: description.trim() || null,
          unit_price: parseFloat(unitPrice),
          currency: 'EUR',
          unit,
          tax_rate: taxRate,
          category: category.trim() || null,
          is_recurring: isRecurring,
          is_active: true,
          created_by: userId,
        })
        .select('id, uuid, sku, name, description, unit_price, currency, unit, tax_rate, category, is_recurring, is_active')
        .single()

      if (insertError) throw insertError

      // Reset form
      setName('')
      setSku('')
      setDescription('')
      setUnitPrice('')
      setUnit('unit')
      setTaxRate(20)
      setCategory('')
      setIsRecurring(false)

      onProductCreated(data)
    } catch (err: unknown) {
      console.error('Error creating product:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la creation du produit'
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
        className="relative bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-[#30363D] sticky top-0 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">Creer un produit</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-[#FDE8E5] dark:bg-[#B42318]/10 border border-[#B42318]/20 rounded-xl flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-[#B42318]">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Nom du produit <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Consultation 1h"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {/* SKU & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-sku" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Reference / SKU
              </label>
              <input
                id="product-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="CONS-001"
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="product-category" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Categorie
              </label>
              <input
                id="product-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Services"
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="product-description" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Description
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Decrivez votre produit ou service..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Price & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-price" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Prix unitaire HT <span className="text-[#B42318]">*</span>
              </label>
              <div className="relative">
                <input
                  id="product-price"
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 pr-12 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                  disabled={isLoading}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#9BA0A6] dark:text-[#8B949E]">EUR</span>
              </div>
            </div>
            <div>
              <label htmlFor="product-unit" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Unite
              </label>
              <select
                id="product-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tax Rate */}
          <div>
            <label htmlFor="product-tax" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Taux de TVA
            </label>
            <div className="flex gap-2">
              {TAX_RATES.map((rate) => (
                <button
                  key={rate.value}
                  type="button"
                  onClick={() => setTaxRate(rate.value)}
                  disabled={isLoading}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    taxRate === rate.value
                      ? 'bg-[#17191F] dark:bg-[#E6EDF3] text-white dark:text-[#0D1117]'
                      : 'bg-[#F5F7F9] dark:bg-[#21262D] text-[#4E525A] dark:text-[#8B949E] hover:bg-[#E2E4E6] dark:hover:bg-[#30363D]'
                  } disabled:opacity-50`}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between p-4 bg-[#F5F7F9] dark:bg-[#21262D] rounded-xl">
            <div>
              <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">Produit recurrent</p>
              <p className="text-xs text-[#4E525A] dark:text-[#8B949E]">Ce produit est facture de maniere recurrente</p>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              disabled={isLoading}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isRecurring ? 'bg-[#147A3A]' : 'bg-[#E2E4E6]'
              } disabled:opacity-50`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  isRecurring ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-transparent border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              Annuler
            </button>
            <FillButton
              disabled={isLoading || !name.trim() || !unitPrice}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Creation...
                </span>
              ) : (
                'Creer le produit'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
