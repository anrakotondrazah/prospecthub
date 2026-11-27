import { Loader } from '@/components/ui/Loader'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-sm text-[#4E525A] dark:text-[#8B949E]">Chargement...</p>
      </div>
    </div>
  )
}
