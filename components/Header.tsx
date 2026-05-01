"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { useSportsCart } from "./SportsCartProvider";
import { useMerchCart } from "./MerchCartProvider";
import { Menu, X, ShoppingCart, Music, Trophy, Shirt } from "lucide-react";

export function Header() {
  const { cart } = useCart();
  const { sportsCart, sportsCartCount } = useSportsCart();
  const { merchCart, merchCartCount } = useMerchCart();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cart.length + sportsCartCount + merchCartCount;

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
  }, [pathname]);

  // Handle click outside and Escape key for cart dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCartOpen(false);
      }
    }

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCartOpen]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Events", path: "/events" },
    { label: "Sports", path: "/sports" },
    { label: "Registration", path: "/registration" },
    { label: "Check Status", path: "/registration-status" },
    { label: "Merch", path: "/merch" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Schedule", path: "/schedule" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-zinc-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex gap-6 items-center">
          <Link href="/" className="font-bold text-xl">
            {process.env.NEXT_PUBLIC_FEST_NAME || "FEST"}
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 rounded-md hover:bg-zinc-100 transition-colors"
              aria-label="Cart"
              aria-expanded={isCartOpen}
            >
              <ShoppingCart size={24} />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-black rounded-full">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Cart Dropdown Panel */}
            {isCartOpen && (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] md:w-80 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                
                {/* SECTION 1: Cultural Events */}
                <div className="p-4 border-b border-zinc-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                      <Music size={16} />
                      <span>Cultural Events</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 bg-zinc-100 rounded-full">
                      {cart.length} event{cart.length !== 1 && "s"}
                    </span>
                  </div>
                  {cart.length === 0 ? (
                    <p className="text-sm text-zinc-500 mb-3">No events in cart</p>
                  ) : (
                    <ul className="text-sm text-zinc-600 mb-3 space-y-1">
                      {cart.slice(0, 2).map((item, i) => (
                        <li key={i} className="truncate">{item.indianName}</li>
                      ))}
                      {cart.length > 2 && <li>+ {cart.length - 2} more</li>}
                    </ul>
                  )}
                  <Link
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full text-center text-sm font-medium bg-black text-white py-2 rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    View Cart
                  </Link>
                </div>

                {/* SECTION 2: Sports Events */}
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                      <Trophy size={16} />
                      <span>Sports Events</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 bg-zinc-200 rounded-full">
                      {sportsCartCount} event{sportsCartCount !== 1 && "s"}
                    </span>
                  </div>
                  {sportsCartCount === 0 ? (
                    <p className="text-sm text-zinc-500 mb-3">No sports in cart</p>
                  ) : (
                    <ul className="text-sm text-zinc-600 mb-3 space-y-1">
                      {sportsCart.slice(0, 2).map((item, i) => (
                        <li key={i} className="truncate">{item.indianName}</li>
                      ))}
                      {sportsCartCount > 2 && <li>+ {sportsCartCount - 2} more</li>}
                    </ul>
                  )}
                  <Link
                    href="/sports/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full text-center text-sm font-medium bg-black text-white py-2 rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    View Cart
                  </Link>
                </div>

                {/* SECTION 3: Merch */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                      <Shirt size={16} />
                      <span>Merch</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 bg-zinc-100 rounded-full">
                      {merchCartCount} item{merchCartCount !== 1 && "s"}
                    </span>
                  </div>
                  {merchCartCount === 0 ? (
                    <p className="text-sm text-zinc-500 mb-3">No items in cart</p>
                  ) : (
                    <ul className="text-sm text-zinc-600 mb-3 space-y-1">
                      {merchCart.slice(0, 2).map((item, i) => (
                        <li key={i} className="truncate">{item.itemName}</li>
                      ))}
                      {merchCartCount > 2 && <li>+ {merchCartCount - 2} more</li>}
                    </ul>
                  )}
                  <Link
                    href="/merch/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full text-center text-sm font-medium bg-black text-white py-2 rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    View Cart
                  </Link>
                </div>

              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md hover:bg-zinc-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-background absolute w-full shadow-lg">
          <nav className="flex flex-col p-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
