'use client'

import { useState } from 'react'

export type QuoteLine = {
  id?: number
  uuid?: string
  product_id: number | null
  name: string
  description: string | null
  sku: string | null
  quantity: number
  unit: string
  unit_price: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  subtotal: number
  total: number
  display_order: number
}

interface QuoteLineItemProps {
  line: QuoteLine
  index: number
  onUpdate: (index: number, line: QuoteLine) => void
  onRemove: (index: number) => void
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
  isFirst: boolean
  isLast: boolean
  disabled?: boolean
}

export function QuoteLineItem({
  line,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  disabled = false,
}: QuoteLineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const calculateLine = (updates: Partial<QuoteLine>): QuoteLine => {
    const updated = { ...line, ...updates }

    // Calculate discount amount
    const baseAmount = updated.quantity * updated.unit_price
    if (updated.discount_type === 'percentage') {
      updated.discount_amount = Math.round(baseAmount * (updated.discount_value / 100) * 100) / 100
    } else {
      updated.discount_amount = updated.discount_value
    }

    // Calculate subtotal
    updated.subtotal = Math.round((baseAmount - updated.discount_amount) * 100) / 100

    // Calculate tax
    updated.tax_amount = Math.round(updated.subtotal * (updated.tax_rate / 100) * 100) / 100

    // Calculate total
    updated.total = Math.round((updated.subtotal + updated.tax_amount) * 100) / 100

    return updated
  }

  const handleChange = (field: keyof QuoteLine, value: string | number) => {
    const updated = calculateLine({ [field]: value })
    onUpdate(index, updated)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="bg-white border border-[#E2E4E6] rounded-xl p-4 hover:border-[#17191F]/20 transition-colors">
      {/* Main row */}
      <div className="flex items-start gap-4">
        {/* Drag handle & order */}
        <div className="flex flex-col items-center gap-1 pt-2">
          <span className="text-xs text-[#9BA0A6] font-medium">{index + 1}</span>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => onMoveUp?.(index)}
              disabled={disabled || isFirst}
              className="w-6 h-5 rounded flex items-center justify-center hover:bg-[#F5F7F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onMoveDown?.(index)}
              disabled={disabled || isLast}
              className="w-6 h-5 rounded flex items-center justify-center hover:bg-[#F5F7F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={line.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nom du produit"
            disabled={disabled}
            className="w-full px-3 py-2 bg-[#F5F7F9] border border-transparent rounded-lg text-sm font-medium focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
          />
          {isExpanded && (
            <textarea
              value={line.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description (optionnel)"
              disabled={disabled}
              rows={2}
              className="w-full mt-2 px-3 py-2 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors resize-none disabled:opacity-50"
            />
          )}
        </div>

        {/* Quantity */}
        <div className="w-24">
          <label className="block text-[10px] font-medium text-[#9BA0A6] uppercase mb-1">Quantite</label>
          <input
            type="number"
            value={line.quantity}
            onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            disabled={disabled}
            className="w-full px-3 py-2 bg-[#F5F7F9] border border-transparent rounded-lg text-sm text-right focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        {/* Unit price */}
        <div className="w-28">
          <label className="block text-[10px] font-medium text-[#9BA0A6] uppercase mb-1">Prix unitaire</label>
          <div className="relative">
            <input
              type="number"
              value={line.unit_price}
              onChange={(e) => handleChange('unit_price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              disabled={disabled}
              className="w-full px-3 py-2 pr-7 bg-[#F5F7F9] border border-transparent rounded-lg text-sm text-right focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9BA0A6]">EUR</span>
          </div>
        </div>

        {/* Total */}
        <div className="w-28 text-right pt-5">
          <p className="text-sm font-semibold text-[#0D0F14]">{formatCurrency(line.subtotal)} EUR</p>
          {line.tax_amount > 0 && (
            <p className="text-[10px] text-[#9BA0A6]">+{formatCurrency(line.tax_amount)} TVA</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5F7F9] transition-colors"
            title={isExpanded ? 'Réduire' : 'Etendre'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4E525A"
              strokeWidth="2"
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={disabled}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FDE8E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Supprimer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#EFF1F3] grid grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-medium text-[#9BA0A6] uppercase mb-1">Reference/SKU</label>
            <input
              type="text"
              value={line.sku || ''}
              onChange={(e) => handleChange('sku', e.target.value)}
              placeholder="REF-001"
              disabled={disabled}
              className="w-full px-3 py-2 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#9BA0A6] uppercase mb-1">Unite</label>
            <select
              value={line.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
            >
              <option value="unit">Unite</option>
              <option value="hour">Heure</option>
              <option value="day">Jour</option>
              <option value="month">Mois</option>
              <option value="year">Annee</option>
              <option value="kg">Kg</option>
              <option value="m2">m2</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#9BA0A6] uppercase mb-1">Remise</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={line.discount_value}
                onChange={(e) => handleChange('discount_value', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                disabled={disabled}
                className="flex-1 px-3 py-2 bg-[#F5F7F9] border border-transparent rounded-lg text-sm text-right focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
              />
              <select
                value={line.discount_type}
                onChange={(e) => handleChange('discount_type', e.target.value)}
                disabled={disabled}
                className="w-16 px-2 py-2 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
              >
                <option value="percentage">%</option>
                <option value="fixed">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#9BA0A6] uppercase mb-1">TVA (%)</label>
            <select
              value={line.tax_rate}
              onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2 bg-[#F5F7F9] border border-transparent rounded-lg text-sm focus:outline-none focus:border-[#17191F] focus:bg-white transition-colors disabled:opacity-50"
            >
              <option value="0">0%</option>
              <option value="5.5">5.5%</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
