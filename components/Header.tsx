"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Header() {
  const { cart } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex gap-6 items-center">
          <Link href="/" className="font-bold text-xl">
            {process.env.NEXT_PUBLIC_FEST_NAME || "FEST"}
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/events" className="text-sm font-medium hover:underline underline-offset-4">
              Events
            </Link>
            <Link href="/registration" className="text-sm font-medium hover:underline underline-offset-4">
              Registration
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-black dark:bg-white dark:text-black rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
