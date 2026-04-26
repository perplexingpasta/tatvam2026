"use client";

import { useCart } from "@/components/CartProvider";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12 border rounded-xl border-dashed">
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">Your cart is empty.</p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center h-10 px-6 font-medium tracking-wide text-white transition duration-200 bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:shadow-outline focus:outline-none"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {cart.map((event) => (
                <li key={event.eventId} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{event.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-sm text-zinc-500 uppercase tracking-wider font-medium">{event.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-medium text-lg">₹{event.fee}</span>
                    <button
                      onClick={() => removeFromCart(event.eventId)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-bold">
                ₹{cart.reduce((total, event) => total + event.fee, 0)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={clearCart}
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white font-medium px-4 py-2"
            >
              Clear Cart
            </button>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center h-12 px-8 font-medium tracking-wide text-white transition duration-200 bg-black dark:bg-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:shadow-outline focus:outline-none"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
