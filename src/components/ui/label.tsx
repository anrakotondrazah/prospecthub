'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          'block text-sm font-medium text-[#0D0F14] mb-2',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Label.displayName = 'Label'

export { Label }
