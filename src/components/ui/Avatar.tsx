'use client'

import { createContext, useContext, forwardRef, HTMLAttributes, ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

type AvatarSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type AvatarShape = 'circle' | 'rounded'
type AvatarVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
type StatusVariant = 'online' | 'busy' | 'away' | 'offline' | 'do-not-disturb' | 'recording' | 'typing' | 'in-call'
type BadgePosition = 'top' | 'bottom'

interface AvatarContextValue {
  size: AvatarSize
  shape: AvatarShape
  variant: AvatarVariant
}

// ============================================================================
// CONTEXT
// ============================================================================

const AvatarContext = createContext<AvatarContextValue>({
  size: 'md',
  shape: 'circle',
  variant: 'default',
})

const useAvatarContext = () => useContext(AvatarContext)

// ============================================================================
// SIZE CONFIG
// ============================================================================

const SIZE_CONFIG: Record<AvatarSize, { container: string; text: string; icon: string; badge: string; ring: number }> = {
  '2xs': { container: 'w-5 h-5', text: 'text-[8px]', icon: 'w-2.5 h-2.5', badge: 'w-2 h-2', ring: 1 },
  'xs': { container: 'w-6 h-6', text: 'text-[9px]', icon: 'w-3 h-3', badge: 'w-2.5 h-2.5', ring: 1.5 },
  'sm': { container: 'w-8 h-8', text: 'text-[10px]', icon: 'w-4 h-4', badge: 'w-3 h-3', ring: 2 },
  'md': { container: 'w-10 h-10', text: 'text-xs', icon: 'w-5 h-5', badge: 'w-3.5 h-3.5', ring: 2 },
  'lg': { container: 'w-12 h-12', text: 'text-sm', icon: 'w-6 h-6', badge: 'w-4 h-4', ring: 2.5 },
  'xl': { container: 'w-14 h-14', text: 'text-base', icon: 'w-7 h-7', badge: 'w-5 h-5', ring: 3 },
  '2xl': { container: 'w-16 h-16', text: 'text-lg', icon: 'w-8 h-8', badge: 'w-6 h-6', ring: 3 },
}

const SHAPE_CONFIG: Record<AvatarShape, Record<AvatarSize, string>> = {
  circle: { '2xs': 'rounded-full', 'xs': 'rounded-full', 'sm': 'rounded-full', 'md': 'rounded-full', 'lg': 'rounded-full', 'xl': 'rounded-full', '2xl': 'rounded-full' },
  rounded: { '2xs': 'rounded', 'xs': 'rounded', 'sm': 'rounded-md', 'md': 'rounded-lg', 'lg': 'rounded-xl', 'xl': 'rounded-2xl', '2xl': 'rounded-2xl' },
}

const VARIANT_CONFIG: Record<AvatarVariant, { bg: string; text: string }> = {
  default: { bg: 'bg-[#17191F] dark:bg-[#58A6FF]', text: 'text-white' },
  primary: { bg: 'bg-[#0066FF]', text: 'text-white' },
  secondary: { bg: 'bg-[#F5F7F9] dark:bg-[#21262D]', text: 'text-[#4E525A] dark:text-[#8B949E]' },
  success: { bg: 'bg-[#16A34A]', text: 'text-white' },
  warning: { bg: 'bg-[#E65100]', text: 'text-white' },
  error: { bg: 'bg-[#B42318]', text: 'text-white' },
}

// ============================================================================
// STATUS CONFIG (with CSS animations)
// ============================================================================

const STATUS_CONFIG: Record<StatusVariant, { color: string; animation?: string; icon?: 'pulse' | 'blink' | 'dots' | 'phone' }> = {
  'online': { color: 'bg-[#16A34A]', animation: 'animate-pulse-subtle', icon: 'pulse' },
  'busy': { color: 'bg-[#B42318]', icon: undefined },
  'away': { color: 'bg-[#E65100]', icon: undefined },
  'offline': { color: 'bg-[#9BA0A6] dark:bg-[#484F58]', icon: undefined },
  'do-not-disturb': { color: 'bg-[#B42318]', icon: undefined },
  'recording': { color: 'bg-[#B42318]', animation: 'animate-blink', icon: 'blink' },
  'typing': { color: 'bg-[#0066FF]', animation: 'animate-typing', icon: 'dots' },
  'in-call': { color: 'bg-[#16A34A]', animation: 'animate-pulse-subtle', icon: 'phone' },
}

// ============================================================================
// AVATAR ROOT
// ============================================================================

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize
  shape?: AvatarShape
  variant?: AvatarVariant
  stroke?: boolean
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({
  size = 'md',
  shape = 'circle',
  variant = 'default',
  stroke = true,
  className,
  children,
  ...props
}, ref) => {
  const sizeConfig = SIZE_CONFIG[size]
  const shapeClass = SHAPE_CONFIG[shape][size]
  const variantConfig = VARIANT_CONFIG[variant]

  return (
    <AvatarContext.Provider value={{ size, shape, variant }}>
      <div
        ref={ref}
        data-slot="avatar"
        data-size={size}
        data-shape={shape}
        className={cn(
          'relative inline-flex items-center justify-center flex-shrink-0',
          'transition-transform duration-200 ease-out',
          'hover:scale-105',
          sizeConfig.container,
          shapeClass,
          variantConfig.bg,
          stroke && 'ring-1 ring-white/20 dark:ring-white/10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  )
})
Avatar.displayName = 'Avatar'

// ============================================================================
// AVATAR IMAGE
// ============================================================================

interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(({
  className,
  alt = '',
  ...props
}, ref) => {
  const { shape, size } = useAvatarContext()
  const shapeClass = SHAPE_CONFIG[shape][size]

  return (
    <img
      ref={ref}
      data-slot="avatar-image"
      alt={alt}
      className={cn(
        'absolute inset-0 w-full h-full object-cover',
        shapeClass,
        className
      )}
      {...props}
    />
  )
})
AvatarImage.displayName = 'AvatarImage'

// ============================================================================
// AVATAR TEXT (Initials)
// ============================================================================

interface AvatarTextProps extends HTMLAttributes<HTMLSpanElement> {}

const AvatarText = forwardRef<HTMLSpanElement, AvatarTextProps>(({
  className,
  children,
  ...props
}, ref) => {
  const { size, variant } = useAvatarContext()
  const sizeConfig = SIZE_CONFIG[size]
  const variantConfig = VARIANT_CONFIG[variant]

  return (
    <span
      ref={ref}
      data-slot="avatar-text"
      className={cn(
        'font-semibold uppercase select-none',
        sizeConfig.text,
        variantConfig.text,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})
AvatarText.displayName = 'AvatarText'

// ============================================================================
// AVATAR ICON (Default person icon)
// ============================================================================

interface AvatarIconProps extends HTMLAttributes<HTMLSpanElement> {}

const AvatarIcon = forwardRef<HTMLSpanElement, AvatarIconProps>(({
  className,
  ...props
}, ref) => {
  const { size, variant } = useAvatarContext()
  const sizeConfig = SIZE_CONFIG[size]
  const variantConfig = VARIANT_CONFIG[variant]

  return (
    <span
      ref={ref}
      data-slot="avatar-icon"
      className={cn(sizeConfig.icon, variantConfig.text, className)}
      aria-hidden="true"
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </span>
  )
})
AvatarIcon.displayName = 'AvatarIcon'

// ============================================================================
// AVATAR BADGE (Positioner)
// ============================================================================

interface AvatarBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  position?: BadgePosition
}

const AvatarBadge = forwardRef<HTMLSpanElement, AvatarBadgeProps>(({
  position = 'bottom',
  className,
  children,
  ...props
}, ref) => {
  return (
    <span
      ref={ref}
      data-slot="avatar-badge"
      className={cn(
        'absolute z-10',
        position === 'top' ? '-top-0.5 -right-0.5' : '-bottom-0.5 -right-0.5',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})
AvatarBadge.displayName = 'AvatarBadge'

// ============================================================================
// AVATAR BADGE STATUS (Presence indicator with animations)
// ============================================================================

interface AvatarBadgeStatusProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusVariant
}

const AvatarBadgeStatus = forwardRef<HTMLSpanElement, AvatarBadgeStatusProps>(({
  status,
  className,
  ...props
}, ref) => {
  const { size } = useAvatarContext()
  const sizeConfig = SIZE_CONFIG[size]
  const statusConfig = STATUS_CONFIG[status]

  const renderInnerContent = () => {
    switch (statusConfig.icon) {
      case 'dots':
        return (
          <span className="flex items-center justify-center gap-0.5" aria-hidden="true">
            <span className="w-0.5 h-0.5 bg-white rounded-full animate-typing-dot-1" />
            <span className="w-0.5 h-0.5 bg-white rounded-full animate-typing-dot-2" />
            <span className="w-0.5 h-0.5 bg-white rounded-full animate-typing-dot-3" />
          </span>
        )
      case 'phone':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-1.5 h-1.5 text-white" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <span
      ref={ref}
      data-slot="avatar-badge-status"
      data-status={status}
      className={cn(
        'flex items-center justify-center rounded-full',
        'ring-2 ring-white dark:ring-[#161B22]',
        sizeConfig.badge,
        statusConfig.color,
        statusConfig.animation,
        className
      )}
      {...props}
    >
      {renderInnerContent()}
    </span>
  )
})
AvatarBadgeStatus.displayName = 'AvatarBadgeStatus'

// ============================================================================
// AVATAR RING (Progress/Loading indicator)
// ============================================================================

interface AvatarRingProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'full' | 'progress' | 'loading'
  value?: number
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

const RING_COLORS: Record<string, string> = {
  primary: 'stroke-[#0066FF]',
  success: 'stroke-[#16A34A]',
  warning: 'stroke-[#E65100]',
  error: 'stroke-[#B42318]',
  info: 'stroke-[#58A6FF]',
}

const AvatarRing = forwardRef<HTMLDivElement, AvatarRingProps>(({
  variant = 'full',
  value = 100,
  color = 'primary',
  className,
  ...props
}, ref) => {
  const { size } = useAvatarContext()
  const ringWidth = SIZE_CONFIG[size].ring

  const circumference = 2 * Math.PI * 45
  const progress = Math.min(100, Math.max(0, value))
  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      ref={ref}
      data-slot="avatar-ring"
      className={cn(
        'absolute inset-0 pointer-events-none',
        variant === 'loading' && 'animate-spin-slow',
        className
      )}
      {...props}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth={ringWidth}
          className="stroke-black/5 dark:stroke-white/10"
        />
        {/* Progress/Full ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth={ringWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={variant === 'progress' ? offset : 0}
          className={cn(
            RING_COLORS[color],
            'transition-[stroke-dashoffset] duration-300 ease-out'
          )}
        />
      </svg>
    </div>
  )
})
AvatarRing.displayName = 'AvatarRing'

// ============================================================================
// AVATAR GROUP
// ============================================================================

interface AvatarGroupContextValue {
  size: AvatarSize
  shape: AvatarShape
}

const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null)

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  size?: AvatarSize
  shape?: AvatarShape
  max?: number
  ring?: 'white' | 'black'
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(({
  size = 'md',
  shape = 'circle',
  max,
  ring = 'white',
  className,
  children,
  ...props
}, ref) => {
  const childArray = Array.isArray(children) ? children : [children]
  const visibleChildren = max ? childArray.slice(0, max) : childArray
  const overflowCount = max ? Math.max(0, childArray.length - max) : 0

  const overlapClass: Record<AvatarSize, string> = {
    '2xs': '-ml-1',
    'xs': '-ml-1.5',
    'sm': '-ml-2',
    'md': '-ml-2.5',
    'lg': '-ml-3',
    'xl': '-ml-3.5',
    '2xl': '-ml-4',
  }

  const ringClass = ring === 'white'
    ? 'ring-2 ring-white dark:ring-[#161B22]'
    : 'ring-2 ring-[#0D1117] dark:ring-white'

  return (
    <AvatarGroupContext.Provider value={{ size, shape }}>
      <div
        ref={ref}
        data-slot="avatar-group"
        className={cn('inline-flex items-center', className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className={cn(
              index > 0 && overlapClass[size],
              ringClass,
              'rounded-full'
            )}
          >
            {child}
          </div>
        ))}
        {overflowCount > 0 && (
          <AvatarGroupAction size={size} shape={shape} className={overlapClass[size]}>
            +{overflowCount}
          </AvatarGroupAction>
        )}
      </div>
    </AvatarGroupContext.Provider>
  )
})
AvatarGroup.displayName = 'AvatarGroup'

// ============================================================================
// AVATAR GROUP ACTION (+N overflow)
// ============================================================================

interface AvatarGroupActionProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize
  shape?: AvatarShape
}

const AvatarGroupAction = forwardRef<HTMLSpanElement, AvatarGroupActionProps>(({
  size: sizeProp,
  shape: shapeProp,
  className,
  children,
  ...props
}, ref) => {
  const groupContext = useContext(AvatarGroupContext)
  const size = sizeProp || groupContext?.size || 'md'
  const shape = shapeProp || groupContext?.shape || 'circle'

  const sizeConfig = SIZE_CONFIG[size]
  const shapeClass = SHAPE_CONFIG[shape][size]

  return (
    <span
      ref={ref}
      data-slot="avatar-group-action"
      className={cn(
        'inline-flex items-center justify-center flex-shrink-0',
        'bg-[#E8EAED] dark:bg-[#30363D] text-[#4E525A] dark:text-[#8B949E]',
        'ring-2 ring-white dark:ring-[#161B22]',
        'font-semibold',
        sizeConfig.container,
        sizeConfig.text,
        shapeClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})
AvatarGroupAction.displayName = 'AvatarGroupAction'

// ============================================================================
// EXPORTS
// ============================================================================

export {
  Avatar,
  AvatarImage,
  AvatarText,
  AvatarIcon,
  AvatarBadge,
  AvatarBadgeStatus,
  AvatarRing,
  AvatarGroup,
  AvatarGroupAction,
}

export type {
  AvatarSize,
  AvatarShape,
  AvatarVariant,
  StatusVariant,
  AvatarProps,
  AvatarImageProps,
  AvatarTextProps,
  AvatarIconProps,
  AvatarBadgeProps,
  AvatarBadgeStatusProps,
  AvatarRingProps,
  AvatarGroupProps,
  AvatarGroupActionProps,
}
