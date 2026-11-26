'use client'

import { forwardRef } from 'react'

// ============================================
// BOUTON LOGOUT - Expand on hover
// ============================================
export const LogoutButton = forwardRef<HTMLButtonElement, { onClick?: () => void }>(
  ({ onClick }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="group flex items-center justify-start w-[45px] h-[45px] border-none rounded-full cursor-pointer relative overflow-hidden transition-all duration-300 shadow-md bg-red-500 hover:w-[125px] hover:rounded-[40px] active:translate-x-0.5 active:translate-y-0.5"
    >
      <span className="w-full flex items-center justify-center transition-all duration-300 group-hover:w-[30%] group-hover:pl-5">
        <svg viewBox="0 0 512 512" className="w-[17px] fill-white">
          <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
        </svg>
      </span>
      <span className="absolute right-0 w-0 opacity-0 text-white text-[1.2em] font-semibold transition-all duration-300 group-hover:opacity-100 group-hover:w-[70%] group-hover:pr-2.5">
        Logout
      </span>
    </button>
  )
)
LogoutButton.displayName = 'LogoutButton'

// ============================================
// BOUTON SAVE - Animation fleche
// ============================================
export const SaveButton = forwardRef<HTMLButtonElement, {
  onClick?: () => void
  children?: React.ReactNode
}>(
  ({ onClick, children = 'Save' }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="group font-inherit text-lg bg-foreground dark:bg-[#212121] text-background dark:text-white fill-muted-foreground py-3 px-4 pl-3.5 flex items-center cursor-pointer border-none rounded-[15px] font-bold hover:bg-foreground/90 dark:hover:bg-black active:scale-95 transition-all duration-200"
    >
      <div className="flex items-center justify-center transition-transform duration-300 group-hover:translate-x-5 group-hover:scale-110">
        <svg
          className="w-6 h-6 transition-all duration-300 group-hover:fill-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
        </svg>
      </div>
      <span className="block ml-1.5 transition-all duration-300 group-hover:opacity-0">
        {children}
      </span>
    </button>
  )
)
SaveButton.displayName = 'SaveButton'

// ============================================
// BOUTON DOWNLOAD - Rond avec tooltip
// ============================================
export const DownloadButton = forwardRef<HTMLButtonElement, {
  onClick?: () => void
  tooltip?: string
}>(
  ({ onClick, tooltip = 'Download' }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="group w-[50px] h-[50px] border-none rounded-full bg-foreground dark:bg-[#1b1b1b] flex flex-col items-center justify-center cursor-pointer relative transition-all duration-300 shadow-md hover:bg-[#965EFF] active:scale-95"
    >
      <svg
        className="w-4 h-4 fill-[#d6b2ff] transition-all duration-300 group-hover:fill-white group-hover:animate-slide-down"
        viewBox="0 0 384 512"
      >
        <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
      </svg>
      <div className="w-[18px] h-[5px] border-b-2 border-l-2 border-r-2 border-[#b68fff] transition-colors duration-300 group-hover:border-white" />
      <span className="absolute right-[-105px] opacity-0 bg-foreground dark:bg-[#0c0c0c] text-background dark:text-white py-1.5 px-2.5 rounded-[5px] flex items-center justify-center transition-opacity duration-200 pointer-events-none tracking-wide group-hover:opacity-100 before:absolute before:content-[''] before:w-2.5 before:h-2.5 before:bg-foreground dark:before:bg-[#0c0c0c] before:rotate-45 before:-left-1">
        {tooltip}
      </span>
    </button>
  )
)
DownloadButton.displayName = 'DownloadButton'

// ============================================
// BOUTON UPLOAD - Rond avec tooltip (compatible download)
// ============================================
export const UploadButton = forwardRef<HTMLButtonElement, {
  onClick?: () => void
  tooltip?: string
}>(
  ({ onClick, tooltip = 'Upload' }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="group w-[50px] h-[50px] border-none rounded-full bg-foreground dark:bg-[#1b1b1b] flex flex-col items-center justify-center cursor-pointer relative transition-all duration-300 shadow-md hover:bg-[#22c55e] active:scale-95"
    >
      <div className="w-[18px] h-[5px] border-t-2 border-l-2 border-r-2 border-[#86efac] transition-colors duration-300 group-hover:border-white" />
      <svg
        className="w-4 h-4 fill-[#86efac] transition-all duration-300 group-hover:fill-white group-hover:animate-slide-up"
        viewBox="0 0 384 512"
      >
        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2l105.4 105.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
      </svg>
      <span className="absolute right-[-90px] opacity-0 bg-foreground dark:bg-[#0c0c0c] text-background dark:text-white py-1.5 px-2.5 rounded-[5px] flex items-center justify-center transition-opacity duration-200 pointer-events-none tracking-wide group-hover:opacity-100 before:absolute before:content-[''] before:w-2.5 before:h-2.5 before:bg-foreground dark:before:bg-[#0c0c0c] before:rotate-45 before:-left-1">
        {tooltip}
      </span>
    </button>
  )
)
UploadButton.displayName = 'UploadButton'

// ============================================
// BOUTON PAY - Icons rotation
// ============================================
export const PayButton = forwardRef<HTMLButtonElement, {
  onClick?: () => void
  children?: React.ReactNode
}>(
  ({ onClick, children = 'Pay Now' }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="group relative py-3 px-6 text-base bg-foreground dark:bg-[#1a1a1a] text-background dark:text-white border-none rounded-lg cursor-pointer flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
    >
      <div className="relative w-6 h-6">
        <svg className="absolute inset-0 w-6 h-6 text-[#22c55e] opacity-100 group-hover:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <svg className="absolute inset-0 w-6 h-6 text-[#22c55e] opacity-0 group-hover:animate-icon-rotate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <span className="font-semibold">{children}</span>
    </button>
  )
)
PayButton.displayName = 'PayButton'

// ============================================
// BOUTON FILL - Effet remplissage on hover
// ============================================
export const FillButton = forwardRef<HTMLButtonElement, {
  onClick?: () => void
  children?: React.ReactNode
  variant?: 'default' | 'danger' | 'success'
}>(
  ({ onClick, children = 'Click me', variant = 'default' }, ref) => {
    const variantClasses = {
      default: 'bg-muted text-foreground before:bg-foreground hover:text-background',
      danger: 'bg-red-100 dark:bg-red-900/20 text-red-600 before:bg-red-500 hover:text-white',
      success: 'bg-green-100 dark:bg-green-900/20 text-green-600 before:bg-green-500 hover:text-white',
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`relative py-3.5 px-6 border-none rounded-[15px] z-[1] font-bold text-[17px] shadow-md transition-all duration-250 overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[15px] before:z-[-1] before:shadow-md before:transition-all before:duration-250 hover:before:w-full active:scale-95 ${variantClasses[variant]}`}
      >
        {children}
      </button>
    )
  }
)
FillButton.displayName = 'FillButton'

// ============================================
// CHECKBOX ANIMEE
// ============================================
export const AnimatedCheckbox = forwardRef<HTMLInputElement, {
  checked?: boolean
  onChange?: (checked: boolean) => void
  id?: string
}>(
  ({ checked, onChange, id = 'cbx' }, ref) => (
    <div className="inline-flex items-center">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only peer"
      />
      <label
        htmlFor={id}
        className="cursor-pointer relative w-[18px] h-[18px] before:content-[''] before:absolute before:-top-[15px] before:-left-[15px] before:w-12 before:h-12 before:rounded-full before:bg-foreground/5 before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100"
      >
        <svg className="relative z-[1] w-[18px] h-[18px] fill-none stroke-muted-foreground stroke-[1.5] transition-all duration-200 peer-checked:stroke-blue-500 hover:stroke-blue-500" viewBox="0 0 18 18">
          <path
            className="stroke-dasharray-[60] stroke-dashoffset-0 peer-checked:stroke-dashoffset-[60] transition-all duration-300"
            d="M1 9a8 8 0 1 0 16 0A8 8 0 0 0 1 9z"
          />
          <polyline
            className="stroke-dasharray-[22] stroke-dashoffset-[66] peer-checked:stroke-dashoffset-[42] transition-all duration-200 delay-150"
            points="5 9 8 12 13 6"
          />
        </svg>
      </label>
    </div>
  )
)
AnimatedCheckbox.displayName = 'AnimatedCheckbox'
