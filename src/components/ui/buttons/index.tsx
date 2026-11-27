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
      className="group flex items-center justify-start w-10 h-10 border-none rounded-full cursor-pointer relative overflow-hidden transition-all duration-300 shadow-md bg-red-500 hover:w-[120px] hover:rounded-[40px] active:translate-x-0.5 active:translate-y-0.5"
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
      className="group font-inherit text-lg bg-foreground dark:bg-[#212121] text-background dark:text-white fill-muted-foreground h-[42px] px-4 pl-3.5 flex items-center cursor-pointer border-none rounded-[15px] font-bold hover:bg-foreground/90 dark:hover:bg-black active:scale-95 transition-all duration-200"
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
// BOUTON DOWNLOAD - Fill effect like FillButton
// ============================================
export const DownloadButton = forwardRef<HTMLButtonElement, {
  onClick?: () => void
  tooltip?: string
  disabled?: boolean
}>(
  ({ onClick, tooltip = 'Download', disabled = false }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`group w-10 h-10 border-none rounded-full bg-muted dark:bg-[#21262D] flex flex-col items-center justify-center cursor-pointer relative transition-all duration-[250ms] ease-out shadow-md active:scale-95 overflow-hidden z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-full before:bg-[#58A6FF] before:z-[-1] before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full ${disabled ? 'opacity-50 cursor-not-allowed hover:before:w-0' : ''}`}
    >
      <svg
        className="w-3.5 h-3.5 fill-[#58A6FF] transition-all duration-[250ms] ease-out group-hover:fill-white group-hover:-translate-y-0.5 relative z-[2]"
        viewBox="0 0 384 512"
      >
        <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
      </svg>
      <div className="w-[18px] h-[5px] border-b-2 border-l-2 border-r-2 border-[#58A6FF] transition-all duration-[250ms] ease-out group-hover:border-white relative z-[2]" />
      <span className="absolute left-full ml-3 opacity-0 bg-foreground dark:bg-[#161B22] text-background dark:text-white py-1.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-[250ms] ease-out pointer-events-none tracking-wide group-hover:opacity-100 shadow-lg whitespace-nowrap z-[10]">
        {tooltip}
      </span>
    </button>
  )
)
DownloadButton.displayName = 'DownloadButton'

// ============================================
// BOUTON UPLOAD - Fill effect like FillButton
// ============================================
export const UploadButton = forwardRef<HTMLButtonElement, {
  onClick?: () => void
  tooltip?: string
  disabled?: boolean
}>(
  ({ onClick, tooltip = 'Upload', disabled = false }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`group w-10 h-10 border-none rounded-full bg-muted dark:bg-[#21262D] flex flex-col items-center justify-center cursor-pointer relative transition-all duration-[250ms] ease-out shadow-md active:scale-95 overflow-hidden z-[1] before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-full before:bg-[#22c55e] before:z-[-1] before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full ${disabled ? 'opacity-50 cursor-not-allowed hover:before:w-0' : ''}`}
    >
      <div className="w-[18px] h-[5px] border-t-2 border-l-2 border-r-2 border-[#22c55e] transition-all duration-[250ms] ease-out group-hover:border-white relative z-[2]" />
      <svg
        className="w-3.5 h-3.5 fill-[#22c55e] transition-all duration-[250ms] ease-out group-hover:fill-white group-hover:translate-y-0.5 relative z-[2]"
        viewBox="0 0 384 512"
      >
        <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2l105.4 105.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
      </svg>
      <span className="absolute left-full ml-3 opacity-0 bg-foreground dark:bg-[#161B22] text-background dark:text-white py-1.5 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-[250ms] ease-out pointer-events-none tracking-wide group-hover:opacity-100 shadow-lg whitespace-nowrap z-[10]">
        {tooltip}
      </span>
    </button>
  )
)
UploadButton.displayName = 'UploadButton'

// ============================================
// BOUTON PAY - Icons rotation (wallet, card, payment, dollar, check)
// ============================================
export const PayButton = forwardRef<HTMLButtonElement, {
  onClick?: () => void
  children?: React.ReactNode
}>(
  ({ onClick, children = 'Pay Now' }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className="pay-btn group h-[42px]"
    >
      <div className="icon-container">
        {/* Wallet - default */}
        <svg className="icon default-icon wallet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
        {/* Card */}
        <svg className="icon card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
        {/* Payment */}
        <svg className="icon payment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        {/* Dollar */}
        <svg className="icon dollar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v12M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" />
        </svg>
        {/* Check */}
        <svg className="icon check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <span className="btn-text">{children}</span>
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
  disabled?: boolean
  className?: string
  title?: string
}>(
  ({ onClick, children = 'Click me', variant = 'default', disabled = false, className = '', title }, ref) => {
    const variantClasses = {
      default: 'bg-muted text-foreground before:bg-foreground hover:text-background',
      danger: 'bg-red-100 dark:bg-red-900/20 text-red-600 before:bg-red-500 hover:text-white',
      success: 'bg-green-100 dark:bg-green-900/20 text-green-600 before:bg-green-500 hover:text-white',
    }

    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`relative h-[42px] px-6 border-none rounded-[15px] z-[1] font-bold text-[17px] shadow-md transition-all duration-[250ms] ease-out overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[15px] before:z-[-1] before:shadow-md before:transition-all before:duration-[250ms] before:ease-out hover:before:w-full active:scale-95 ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed hover:before:w-0 active:scale-100' : ''} ${className}`}
      >
        {children}
      </button>
    )
  }
)
FillButton.displayName = 'FillButton'

// ============================================
// CHECKBOX ANIMEE - SVG stroke animation
// ============================================
export const AnimatedCheckbox = forwardRef<HTMLInputElement, {
  checked?: boolean
  onChange?: (checked: boolean) => void
  id?: string
  label?: string
}>(
  ({ checked = false, onChange, id = 'cbx', label }, ref) => (
    <div className="inline-flex items-center gap-3">
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
        className="check cursor-pointer relative w-[18px] h-[18px] flex-shrink-0"
      >
        <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]">
          <path
            className="check-path"
            d="M1 9a8 8 0 1 0 16 0A8 8 0 0 0 1 9z"
          />
          <polyline
            className="check-mark"
            points="5 9 8 12 13 6"
          />
        </svg>
      </label>
      {label && (
        <span className="text-foreground cursor-pointer select-none" onClick={() => onChange?.(!checked)}>
          {label}
        </span>
      )}
    </div>
  )
)
AnimatedCheckbox.displayName = 'AnimatedCheckbox'

// ============================================
// CHECKBOX FILL - Animation remplissage diagonal
// ============================================
export const FillCheckbox = forwardRef<HTMLInputElement, {
  checked?: boolean
  onChange?: (checked: boolean) => void
  id?: string
}>(
  ({ checked = false, onChange, id = 'fill-cbx' }, ref) => (
    <label className="checkBox block cursor-pointer w-[30px] h-[30px] rounded-[10px] relative overflow-hidden shadow-[0_0_0_2px_var(--foreground)]">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="absolute left-[50px] invisible peer"
      />
      <div className="w-[60px] h-[60px] bg-foreground absolute -top-[52px] -left-[52px] rotate-45 z-[100] transition-all duration-300 ease-out peer-checked:left-[-10px] peer-checked:top-[-10px]" />
    </label>
  )
)
FillCheckbox.displayName = 'FillCheckbox'
