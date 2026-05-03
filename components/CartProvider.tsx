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
            // Ignore parse errors
          }
        }
        setIsInitialized(true);
      });
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

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
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
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
w Error("useCart must be used within a CartProvider");
  }
  return context;
}
art must be used within a CartProvider");
  }
  return context;
}
w Error("useCart must be used within a CartProvider");
  }
  return context;
}
