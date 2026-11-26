'use client'

import { useTheme } from '@/components/providers/ThemeProvider'

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()

  const options: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: string }> = [
    {
      value: 'light',
      label: 'Clair',
      icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      value: 'dark',
      label: 'Sombre',
      icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
    },
    {
      value: 'system',
      label: 'Systeme',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
  ]

  return (
    <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
      <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Apparence</h2>
      <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
        Choisissez le theme de l'interface
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-[10px] border-2 transition-all duration-200 ${
              theme === option.value
                ? 'border-[#0066FF] bg-[#0066FF]/5 dark:bg-[#58A6FF]/10'
                : 'border-[#E2E4E6] dark:border-[#30363D] hover:border-[#0066FF]/30 dark:hover:border-[#58A6FF]/30'
            }`}
            aria-label={`Basculer en mode ${option.label}`}
            aria-pressed={theme === option.value}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={theme === option.value ? 'text-[#0066FF] dark:text-[#58A6FF]' : 'text-[#4E525A] dark:text-[#8B949E]'}
              aria-hidden="true"
            >
              <path d={option.icon} />
            </svg>
            <span
              className={`text-sm font-medium ${
                theme === option.value ? 'text-[#0066FF] dark:text-[#58A6FF]' : 'text-[#0D0F14] dark:text-[#E6EDF3]'
              }`}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
