"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Event } from "@/types";
import { CartItem, AddToCartResult } from "./CartProvider";

const SPORTS_CART_STORAGE_KEY = "sportsCart";

interface SportsCartContextType {
  sportsCart: CartItem[];
  addToSportsCart: (event: Event) => AddToCartResult;
  removeFromSportsCart: (eventId: string) => void;
  clearSportsCart: () => void;
  sportsCartTotal: number;
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
            // Ignore parse errors
          }
        }
        setIsInitialized(true);
      });
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem(SPORTS_CART_STORAGE_KEY, JSON.stringify(sportsCart));
    }
  }, [sportsCart, isInitialized]);

  const addToSportsCart = (event: Event): AddToCartResult => {
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
  };

  const removeFromSportsCart = (eventId: string) => {
    setSportsCart((prev) => prev.filter((item) => item.eventId !== eventId));
  };

  const clearSportsCart = () => {
    setSportsCart([]);
  };

  const sportsCartTotal = sportsCart.reduce((total, item) => total + item.fee, 0);
  const sportsCartCount = sportsCart.length;

  return (
    <SportsCartContext.Provider 
      value={{ 
        sportsCart, 
        addToSportsCart, 
        removeFromSportsCart, 
        clearSportsCart,
        sportsCartTotal,
        sportsCartCount
      }}
    >
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
