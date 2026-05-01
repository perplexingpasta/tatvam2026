export default function MerchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full animate-pulse">
      <div className="h-10 w-48 bg-zinc-200 rounded-md mb-8"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col bg-zinc-100 rounded-xl overflow-hidden h-[450px]">
            <div className="aspect-square bg-zinc-200 w-full shrink-0"></div>
            <div className="p-4 flex flex-col gap-3">
              <div className="h-6 w-3/4 bg-zinc-200 rounded-md"></div>
              <div className="h-5 w-1/4 bg-zinc-200 rounded-md"></div>
              <div className="h-4 w-full bg-zinc-200 rounded-md"></div>
              <div className="h-4 w-2/3 bg-zinc-200 rounded-md"></div>
              <div className="h-10 w-full bg-zinc-200 rounded-md mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
