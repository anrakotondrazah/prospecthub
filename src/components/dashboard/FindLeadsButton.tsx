import Link from 'next/link'

export function FindLeadsButton() {
  return (
    <Link
      href="/base-entreprises"
      className="relative h-[42px] px-6 border-none rounded-[15px] z-[1] font-bold text-[17px] shadow-md transition-all duration-[250ms] ease-out overflow-hidden bg-green-100 dark:bg-green-900/20 text-green-600 hover:text-white before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:rounded-[15px] before:z-[-1] before:shadow-md before:transition-all before:duration-[250ms] before:ease-out before:bg-green-500 hover:before:w-full active:scale-95 inline-flex items-center justify-center"
    >
      <span className="flex items-center gap-2 relative z-10">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Trouver leads
      </span>
    </Link>
  )
}
