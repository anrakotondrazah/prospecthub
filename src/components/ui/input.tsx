'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[10px] border border-[#E2E4E6] bg-white px-3 text-sm text-[#0D0F14] transition-colors',
          'placeholder:text-[#9BA0A6]',
          'hover:border-[#D2D5D9]',
          'focus:border-[#17191F] focus:outline-none focus:ring-[3px] focus:ring-[#17191F]/10',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]/10',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
