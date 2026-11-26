'use client'

interface QuoteSummaryProps {
  subtotal: number
  discountType: 'percentage' | 'fixed'
  discountValue: number
  discountAmount: number
  taxAmount: number
  total: number
  currency?: string
  onDiscountTypeChange?: (type: 'percentage' | 'fixed') => void
  onDiscountValueChange?: (value: number) => void
  editable?: boolean
}

export function QuoteSummary({
  subtotal,
  discountType,
  discountValue,
  discountAmount,
  taxAmount,
  total,
  currency = 'EUR',
  onDiscountTypeChange,
  onDiscountValueChange,
  editable = true,
}: QuoteSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="bg-[#F5F7F9] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#0D0F14] mb-4">Recapitulatif</h3>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#4E525A]">Sous-total HT</span>
          <span className="text-sm font-medium text-[#0D0F14]">{formatCurrency(subtotal)} {currency}</span>
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#4E525A]">Remise globale</span>
          {editable ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={discountValue}
                onChange={(e) => onDiscountValueChange?.(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-20 px-2 py-1.5 bg-white border border-[#E2E4E6] rounded-lg text-sm text-right focus:outline-none focus:border-[#17191F] transition-colors"
              />
              <select
                value={discountType}
                onChange={(e) => onDiscountTypeChange?.(e.target.value as 'percentage' | 'fixed')}
                className="w-16 px-2 py-1.5 bg-white border border-[#E2E4E6] rounded-lg text-sm focus:outline-none focus:border-[#17191F] transition-colors"
              >
                <option value="percentage">%</option>
                <option value="fixed">{currency}</option>
              </select>
            </div>
          ) : (
            <span className="text-sm text-[#B42318]">
              -{formatCurrency(discountAmount)} {currency}
            </span>
          )}
        </div>

        {/* Show discount amount when editable */}
        {editable && discountAmount > 0 && (
          <div className="flex items-center justify-between pl-4">
            <span className="text-xs text-[#9BA0A6]">Montant remise</span>
            <span className="text-xs text-[#B42318]">-{formatCurrency(discountAmount)} {currency}</span>
          </div>
        )}

        {/* Tax */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#4E525A]">TVA</span>
          <span className="text-sm text-[#0D0F14]">{formatCurrency(taxAmount)} {currency}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E2E4E6] my-3"></div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-[#0D0F14]">Total TTC</span>
          <span className="text-xl font-bold text-[#0D0F14]">{formatCurrency(total)} {currency}</span>
        </div>
      </div>
    </div>
  )
}
