import React from "react";
import { merchCatalogue } from "@/lib/merchCatalogue";
import { MerchItemCard } from "@/components/MerchItemCard";
import { MerchCartIcon } from "@/components/MerchCartIcon";

// export const metadata = {
//   title: `${process.env.NEXT_PUBLIC_FEST_NAME || "Fest"} Merch Store`,
//   description: "Get your official fest merchandise here.",
// };

export const metadata = {
  title: "Merch",
};

export default function MerchPage() {
  // Sort items: available first, then unavailable
  const sortedItems = [...merchCatalogue].sort((a, b) => {
    if (a.isAvailable === b.isAvailable) return 0;
    return a.isAvailable ? -1 : 1;
  });

  const allUnavailable = merchCatalogue.every(item => !item.isAvailable);
  const festName = process.env.NEXT_PUBLIC_FEST_NAME || "Fest";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {festName} Merch Store
        </h1>
        <MerchCartIcon />
      </div>

      {allUnavailable ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Merch orders are not open yet</h2>
          <p className="text-gray-500">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item) => (
            <MerchItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
