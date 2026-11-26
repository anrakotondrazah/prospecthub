import { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  className?: string
}

const VARIANT_STYLES = {
  default: 'bg-[#F5F7F9] text-[#4E525A]',
  success: 'bg-[#E8F5E9] text-[#147A3A]',
  warning: 'bg-[#FFF3E0] text-[#E65100]',
  error: 'bg-[#FFEBEE] text-[#C62828]',
  info: 'bg-[#E3F2FD] text-[#1565C0]',
  neutral: 'bg-[#F5F5F5] text-[#616161]',
}

const SIZE_STYLES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
    >
      {children}
    </span>
  )
}
