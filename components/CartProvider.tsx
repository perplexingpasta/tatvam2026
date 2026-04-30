"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Event, EventCategory } from "@/types";

const CART_STORAGE_KEY = "eventCart";

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
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (event: Event): AddToCartResult => {
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
  };

  const removeFromCart = (eventId: string) => {
    setCart((prev) => prev.filter((item) => item.eventId !== eventId));
  };

  const isInCart = (eventId: string) => {
    return cart.some((item) => item.eventId === eventId);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isInCart, clearCart }}>
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
