"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { Event } from "@/types";
import { CartItem, AddToCartResult } from "./CartProvider";
import { toast } from "sonner";

const SPORTS_CART_STORAGE_KEY = "sportsCart";

interface SportsCartContextType {
  sportsCart: CartItem[];
  addToSportsCart: (event: Event) => AddToCartResult;
  removeFromSportsCart: (eventId: string) => void;
  isInSportsCart: (eventId: string) => boolean;
  clearSportsCart: () => void;
  sportsCartCount: number;
}

const SportsCartContext = createContext<SportsCartContextType | undefined>(undefined);

export function SportsCartProvider({ children }: { children: ReactNode }) {
  const [sportsCart, setSportsCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SPORTS_CART_STORAGE_KEY);

      // Update state asynchronously to avoid synchronous cascading renders
      Promise.resolve().then(() => {
        if (saved) {
          try {
            setSportsCart(JSON.parse(saved));
          } catch {
            toast.error("Failed to load sports cart. Check your browser settings.");
          }
        }
        setIsInitialized(true);
      });
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem(SPORTS_CART_STORAGE_KEY, JSON.stringify(sportsCart));
      } catch {
        toast.error("Failed to save sports cart. Check your browser settings.");
      }
    }
  }, [sportsCart, isInitialized]);

  const addToSportsCart = useCallback((event: Event): AddToCartResult => {
    if (sportsCart.find((i) => i.eventId === event.eventId)) {
      return { added: false, reason: "already_in_cart" };
    }
    
    const newItem: CartItem = {
      eventId: event.eventId,
      name: event.indianName,
      indianName: event.indianName,
      englishName: event.englishName,
      type: event.type,
      pricingType: event.pricingType,
      fee: event.fee,
      minTeamSize: event.minTeamSize,
      maxTeamSize: event.maxTeamSize,
      category: event.category,
    };
    
    setSportsCart((prev) => {
      // Double check in case of race condition
      if (prev.find((i) => i.eventId === event.eventId)) {
        return prev;
      }
      return [...prev, newItem];
    });

    return { added: true };
  }, [sportsCart]);

  const removeFromSportsCart = useCallback((eventId: string) => {
    setSportsCart((prev) => prev.filter((item) => item.eventId !== eventId));
  }, []);

  const clearSportsCart = useCallback(() => {
    setSportsCart([]);
  }, []);

  const isInSportsCart = useCallback((eventId: string) => {
    return sportsCart.some((item) => item.eventId === eventId);
  }, [sportsCart]);

  const sportsCartTotal = useMemo(() => sportsCart.reduce((total, item) => total + item.fee, 0), [sportsCart]);
  const sportsCartCount = useMemo(() => sportsCart.length, [sportsCart]);

  const value = useMemo(() => ({
    sportsCart, 
    addToSportsCart, 
    removeFromSportsCart,
    isInSportsCart,
    clearSportsCart,
    sportsCartTotal,
    sportsCartCount
  }), [sportsCart, addToSportsCart, removeFromSportsCart, isInSportsCart, clearSportsCart, sportsCartTotal, sportsCartCount]);

  return (
    <SportsCartContext.Provider value={value}>
      {children}
    </SportsCartContext.Provider>
  );
}

export function useSportsCart() {
  const context = useContext(SportsCartContext);
  if (context === undefined) {
    throw new Error("useSportsCart must be used within a SportsCartProvider");
  }
  return context;
}
