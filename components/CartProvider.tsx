"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Event } from "@/types";

interface CartContextType {
  cart: Event[];
  addToCart: (event: Event) => void;
  removeFromCart: (eventId: string) => void;
  isInCart: (eventId: string) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Event[]>([]);

  const addToCart = (event: Event) => {
    setCart((prev) => {
      if (prev.find((item) => item.eventId === event.eventId)) return prev;
      return [...prev, event];
    });
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
