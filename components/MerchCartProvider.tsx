"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { MerchCartUnit } from "@/types/merch";

interface MerchCartContextType {
  merchCart: MerchCartUnit[];
  addMerchUnit: (unit: MerchCartUnit) => void;
  removeMerchUnit: (unitId: string) => void;
  updateMerchUnit: (unitId: string, updatedAttributes: Record<string, string>) => void;
  clearMerchCart: () => void;
  merchCartTotal: number;
  merchCartCount: number;
}

const MerchCartContext = createContext<MerchCartContextType | undefined>(undefined);

export function MerchCartProvider({ children }: { children: ReactNode }) {
  const [merchCart, setMerchCart] = useState<MerchCartUnit[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    try {
      const stored = localStorage.getItem("merchCart");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTimeout(() => setMerchCart(parsed), 0);
      }
    } catch (error) {
      console.error("Failed to parse merch cart from localStorage", error);
      toast.error("Failed to load cart. Check your browser settings.");
      setTimeout(() => setMerchCart([]), 0);
    }
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("merchCart", JSON.stringify(merchCart));
    } catch (error) {
      console.error("Failed to save merch cart to localStorage", error);
    }
  }, [merchCart, isMounted]);

  const addMerchUnit = (unit: MerchCartUnit) => {
    setMerchCart((prev) => [...prev, unit]);
  };

  const removeMerchUnit = (unitId: string) => {
    setMerchCart((prev) => prev.filter((item) => item.unitId !== unitId));
  };

  const updateMerchUnit = (unitId: string, updatedAttributes: Record<string, string>) => {
    setMerchCart((prev) =>
      prev.map((item) =>
        item.unitId === unitId ? { ...item, attributes: updatedAttributes } : item
      )
    );
  };

  const clearMerchCart = () => {
    setMerchCart([]);
    try {
      localStorage.removeItem("merchCart");
    } catch (error) {
      console.error("Failed to remove merch cart from localStorage", error);
    }
  };

  const merchCartTotal = merchCart.reduce((total, item) => total + item.price, 0);
  const merchCartCount = merchCart.length;

  return (
    <MerchCartContext.Provider
      value={{
        merchCart,
        addMerchUnit,
        removeMerchUnit,
        updateMerchUnit,
        clearMerchCart,
        merchCartTotal,
        merchCartCount,
      }}
    >
      {children}
    </MerchCartContext.Provider>
  );
}

export function useMerchCart() {
  const context = useContext(MerchCartContext);
  if (context === undefined) {
    throw new Error("useMerchCart must be used within a MerchCartProvider");
  }
  return context;
}
