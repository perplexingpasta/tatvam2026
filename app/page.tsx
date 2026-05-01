import Link from "next/link";
import { UserPlus, Calendar, ShoppingBag, ArrowRight } from "lucide-react";

export default function Home() {
  const festName = process.env.NEXT_PUBLIC_FEST_NAME || "Tatvam 2026";

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-zinc-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob "></div>
      <div className="absolute top-[10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 "></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 "></div>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-zinc-900 mb-6 font-heading">
            {festName}
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-600 font-medium max-w-2xl mx-auto">
            The Annual Cultural Fest of JSS Medical College
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
          <Link
            href="/registration"
            className="group relative flex flex-col p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-zinc-200 hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 ">
              <UserPlus size={24} />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2 font-heading">
              Delegate Registration
            </h3>
            <p className="text-zinc-600 mb-6 flex-1">
              Register as a delegate to participate in events and get your official fest ID.
            </p>
            <div className="flex items-center text-sm font-medium text-indigo-600 mt-auto group-hover:translate-x-1 transition-transform">
              Get Started <ArrowRight size={16} className="ml-1" />
            </div>
          </Link>

          <Link
            href="/events"
            className="group relative flex flex-col p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-zinc-200 hover:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 ">
              <Calendar size={24} />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2 font-heading">
              Explore Events
            </h3>
            <p className="text-zinc-600 mb-6 flex-1">
              Browse our exciting lineup of cultural, literary, and performing arts events.
            </p>
            <div className="flex items-center text-sm font-medium text-purple-600 mt-auto group-hover:translate-x-1 transition-transform">
              View Schedule <ArrowRight size={16} className="ml-1" />
            </div>
          </Link>

          <Link
            href="/merch"
            className="group relative flex flex-col p-8 bg-white/60 backdrop-blur-md rounded-2xl border border-zinc-200 hover:border-pink-500 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-pink-600 ">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2 font-heading">
              Merch Store
            </h3>
            <p className="text-zinc-600 mb-6 flex-1">
              Grab your official Tatvam 2026 merchandise, including t-shirts and hoodies.
            </p>
            <div className="flex items-center text-sm font-medium text-pink-600 mt-auto group-hover:translate-x-1 transition-transform">
              Shop Now <ArrowRight size={16} className="ml-1" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
