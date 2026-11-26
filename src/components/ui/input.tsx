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
          'flex h-11 w-full rounded-xl border border-black/[0.08] bg-white/80 backdrop-blur-sm px-3 text-sm text-[#0D0F14] transition-all duration-200 shadow-sm',
          'placeholder:text-[#9BA0A6]',
          'hover:border-black/[0.12] hover:bg-white/90 hover:shadow',
          'focus:border-[#0066FF] focus:outline-none focus:ring-[3px] focus:ring-[#0066FF]/10 focus:bg-white focus:shadow-md',
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
