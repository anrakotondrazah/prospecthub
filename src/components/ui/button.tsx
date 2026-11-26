'use client'

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[#0066FF] text-white hover:bg-[#0052CC] shadow-sm hover:shadow-md active:scale-[0.98]',
        secondary: 'bg-white/80 backdrop-blur-sm text-[#4E525A] hover:bg-white/90 border border-black/[0.08] shadow-sm hover:shadow',
        outline: 'border border-black/[0.08] bg-transparent text-[#4E525A] hover:bg-white/50 backdrop-blur-sm shadow-sm',
        ghost: 'bg-transparent text-[#4E525A] hover:bg-black/[0.04] active:bg-black/[0.08]',
        link: 'text-[#0066FF] underline-offset-4 hover:underline',
        destructive: 'bg-[#B42318] text-white hover:bg-[#991B1B] shadow-sm hover:shadow-md active:scale-[0.98]',
        glass: 'glass-bg glass-border text-[#17191F] hover:bg-white/90 shadow-glass-sm hover:shadow-glass active:scale-[0.98]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-[42px] px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
