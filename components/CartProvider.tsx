"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { Event, EventCategory } from "@/types";
import { toast } from "sonner";

const CART_STORAGE_KEY = "eventsCart";

export interface CartItem {
  eventId: string;
  name: string; // backward compatibility for /cart page
  indianName: string;
  englishName: string;
  type: "solo" | "group";
  pricingType: "per_person" | "flat_total" | "free";
  fee: number;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  category: EventCategory;
}

export interface AddToCartResult {
  added: boolean;
  reason?: "already_in_cart";
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (event: Event) => AddToCartResult;
  removeFromCart: (eventId: string) => void;
  isInCart: (eventId: string) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      
      // Update state asynchronously to avoid synchronous cascading renders
      Promise.resolve().then(() => {
        if (saved) {
          try {
            setCart(JSON.parse(saved));
          } catch {
            toast.error("Failed to load cart. Check your browser settings.");
          }
        }
        setIsInitialized(true);
      });
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch {
        toast.error("Failed to save cart. Check your browser settings.");
      }
    }
  }, [cart, isInitialized]);

  const addToCart = useCallback((event: Event): AddToCartResult => {
    if (cart.find((item) => item.eventId === event.eventId)) {
      return { added: false, reason: "already_in_cart" };
    }
    
    const newItem: CartItem = {
      eventId: event.eventId,
      name: event.indianName, // For backward compatibility
      indianName: event.indianName,
      englishName: event.englishName,
      type: event.type,
      pricingType: event.pricingType,
      fee: event.fee,
      minTeamSize: event.minTeamSize,
      maxTeamSize: event.maxTeamSize,
      category: event.category,
    };
    
    setCart((prev) => {
      // Double check in case of race condition
      if (prev.find((item) => item.eventId === event.eventId)) {
        return prev;
      }
      return [...prev, newItem];
    });

    return { added: true };
  }, [cart]);

  const removeFromCart = useCallback((eventId: string) => {
    setCart((prev) => prev.filter((item) => item.eventId !== eventId));
  }, []);

  const isInCart = useCallback((eventId: string) => {
    return cart.some((item) => item.eventId === eventId);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  const value = useMemo(() => ({ cart, addToCart, removeFromCart, isInCart, clearCart }), [cart, addToCart, removeFromCart, isInCart, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
