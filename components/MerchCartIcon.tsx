"use client";

import React from "react";
import Link from "next/link";
import { useMerchCart } from "@/components/MerchCartProvider";

export function MerchCartIcon() {
  const { merchCartCount } = useMerchCart();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/merch/cart"
      className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Merch Cart"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {mounted && merchCartCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/4 -translate-y-1/4">
          {merchCartCount}
        </span>
      )}
    </Link>
  );
}
