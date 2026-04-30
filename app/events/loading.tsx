export default function EventsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full animate-pulse">
      <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-6"></div>
      <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-6"></div>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden h-[300px]">
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 w-full shrink-0"></div>
            <div className="p-4 flex flex-col gap-3">
              <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
              <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded-md mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
