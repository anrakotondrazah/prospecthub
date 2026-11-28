export default function SequenceDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-[#E2E4E6] dark:bg-[#21262D] rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-[#F5F7F9] dark:bg-[#0D1117]" />
              <div className="flex-1">
                <div className="h-7 w-64 bg-[#E2E4E6] dark:bg-[#21262D] rounded mb-2" />
                <div className="h-4 w-48 bg-[#E2E4E6] dark:bg-[#21262D] rounded" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-[10px]" />
              ))}
            </div>
          </div>

          {/* Timeline card */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <div className="h-5 w-40 bg-[#E2E4E6] dark:bg-[#21262D] rounded mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F5F7F9] dark:bg-[#0D1117]" />
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-[#E2E4E6] dark:bg-[#21262D] rounded mb-2" />
                    <div className="h-4 w-full bg-[#E2E4E6] dark:bg-[#21262D] rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <div className="h-5 w-32 bg-[#E2E4E6] dark:bg-[#21262D] rounded mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-20 bg-[#E2E4E6] dark:bg-[#21262D] rounded mb-1" />
                  <div className="h-4 w-full bg-[#E2E4E6] dark:bg-[#21262D] rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
