import { Loader } from '@/components/ui/Loader'

export default function CompaniesLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-sm text-[#4E525A] dark:text-[#8B949E]">Chargement des entreprises...</p>
      </div>
    </div>
  )
}
