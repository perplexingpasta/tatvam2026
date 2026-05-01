export default function RegistrationLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full animate-pulse">
      <div className="h-10 w-64 bg-zinc-200 rounded-md mb-8 mx-auto"></div>

      <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto">
        <div className="flex-1 bg-zinc-100 rounded-2xl h-48 border-2 border-transparent"></div>
        <div className="flex-1 bg-zinc-100 rounded-2xl h-48 border-2 border-transparent"></div>
      </div>
    </div>
  );
}
