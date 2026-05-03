"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { useSportsCart } from "./SportsCartProvider";
import { useMerchCart } from "./MerchCartProvider";
import {
  Menu,
  X,
  ShoppingCart,
  Music,
  Trophy,
  Shirt,
  Home,
  Calendar,
  UserPlus,
  Search,
  ShoppingBag,
  Info,
  MessageCircle,
  Clock,
} from "lucide-react";

export function Header() {
  const { cart } = useCart();
  const { sportsCart, sportsCartCount } = useSportsCart();
  const { merchCart, merchCartCount } = useMerchCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cart.length + sportsCartCount + merchCartCount;

  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
  }

  // Handle click outside and Escape key for cart dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    { label: "Home", path: "/", icon: Home },
    { label: "Events", path: "/events", icon: Calendar },
    { label: "Sports", path: "/sports", icon: Trophy },
    { label: "Registration", path: "/registration", icon: UserPlus },
    { label: "Check Status", path: "/registration-status", icon: Search },
    { label: "Merch", path: "/merch", icon: ShoppingBag },
    { label: "About", path: "/about", icon: Info },
    { label: "Contact", path: "/contact", icon: MessageCircle },
    { label: "Schedule", path: "/schedule", icon: Clock },
  ];

  return (
    <>
      <header className="fixed top-5 left-4 right-4 md:top-4 md:left-4 md:right-4 z-120 rounded-2xl border border-zinc-200/60 bg-white/30 backdrop-blur-lg shadow-sm transition-all duration-300">
        <div className="container mx-auto px-3 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex gap-4 md:gap-6 items-center">
            <Link
              href="/"
              className="font-bold text-lg md:text-xl truncate max-w-30 sm:max-w-none"
            >
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

          <div className="flex items-center gap-1.5 md:gap-4">
            {/* Mobile Register Button */}
            <Link
              href="/registration"
              className="md:hidden text-xs font-semibold bg-black text-white px-4 py-1.5 rounded-full hover:bg-zinc-800 transition-colors"
            >
              Register
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setIsCartOpen(!isCartOpen);
                  setIsMobileMenuOpen(false);
                }}
                className="relative p-1.5 md:p-2 rounded-md hover:bg-zinc-100 transition-colors"
                aria-label="Open header menu"
                aria-expanded={isCartOpen}
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {totalCartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 md:w-5 md:h-5 text-[10px] md:text-xs font-bold text-white bg-black rounded-full">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Cart Dropdown Panel */}
              {isCartOpen && (
                <div className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-xs md:w-80 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
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
                      <p className="text-sm text-zinc-500 mb-3">
                        No events in cart
                      </p>
                    ) : (
                      <ul className="text-sm text-zinc-600 mb-3 space-y-1">
                        {cart.slice(0, 2).map((item, i) => (
                          <li key={i} className="truncate">
                            {item.indianName}
                          </li>
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
                      <p className="text-sm text-zinc-500 mb-3">
                        No sports in cart
                      </p>
                    ) : (
                      <ul className="text-sm text-zinc-600 mb-3 space-y-1">
                        {sportsCart.slice(0, 2).map((item, i) => (
                          <li key={i} className="truncate">
                            {item.indianName}
                          </li>
                        ))}
                        {sportsCartCount > 2 && (
                          <li>+ {sportsCartCount - 2} more</li>
                        )}
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
                      <p className="text-sm text-zinc-500 mb-3">
                        No items in cart
                      </p>
                    ) : (
                      <ul className="text-sm text-zinc-600 mb-3 space-y-1">
                        {merchCart.slice(0, 2).map((item, i) => (
                          <li key={i} className="truncate">
                            {item.itemName}
                          </li>
                        ))}
                        {merchCartCount > 2 && (
                          <li>+ {merchCartCount - 2} more</li>
                        )}
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
              className="md:hidden p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from hiding under the fixed header */}
      <div className="h-17 md:h-22" aria-hidden="true" />

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-100 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        role="navigation"
        aria-label="Mobile drawer"
        className={`md:hidden fixed inset-y-0 left-0 z-110 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <span className="font-bold text-xl">
            {process.env.NEXT_PUBLIC_FEST_NAME || "FEST"}
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-zinc-100 transition-colors"
            aria-label="Close mobile menu"
          >
            <X size={24} />
          </button>
        </div>
        <nav
          role="navigation"
          aria-label="Mobile menu"
          className="flex flex-col p-4 space-y-2 overflow-y-auto"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-zinc-100 text-lg font-semibold text-zinc-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={24} className="text-zinc-500" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
