"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/catalog";

type CartItem = {
  slug: string;
  name: string;
  fabric: string;
  size: "King" | "Queen";
  color: string;
  price: number;
  quantity: number;
};

type AddCartPayload = {
  product: Product;
  size: "King" | "Queen";
  color: string;
  price?: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (payload: AddCartPayload) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "aurare-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const persisted = window.localStorage.getItem(STORAGE_KEY);
      return persisted ? (JSON.parse(persisted) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(({ product, size, color, price }: AddCartPayload) => {
    setItems((previous) => {
      const unitPrice = price ?? product.startingPrice;
      const existingIndex = previous.findIndex(
        (item) =>
          item.slug === product.slug && item.size === size && item.color === color,
      );

      if (existingIndex >= 0) {
        const clone = [...previous];
        clone[existingIndex] = {
          ...clone[existingIndex],
          quantity: clone[existingIndex].quantity + 1,
        };
        return clone;
      }

      return [
        ...previous,
        {
          slug: product.slug,
          name: product.name,
          fabric: product.fabric,
          size,
          color,
          price: unitPrice,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
