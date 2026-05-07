import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "./translations";

export type CartItem = {
  productId: string;
  nameEn: string;
  nameMn: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
};

type Store = {
  lang: Lang;
  setLang: (lang: Lang) => void;

  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      lang: "mn",
      setLang: (lang) => set({ lang }),

      cart: [],

      addToCart: (item) => {
        const existing = get().cart.find(
          (c) => c.productId === item.productId && c.size === item.size
        );
        if (existing) {
          set({
            cart: get().cart.map((c) =>
              c.productId === item.productId && c.size === item.size
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
          });
        } else {
          set({ cart: [...get().cart, item] });
        }
      },

      removeFromCart: (productId, size) => {
        set({
          cart: get().cart.filter(
            (c) => !(c.productId === productId && c.size === size)
          ),
        });
      },

      updateQty: (productId, size, qty) => {
        if (qty < 1) return;
        set({
          cart: get().cart.map((c) =>
            c.productId === productId && c.size === size
              ? { ...c, quantity: qty }
              : c
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      cartTotal: () =>
        get().cart.reduce((sum, c) => sum + c.price * c.quantity, 0),

      cartCount: () => get().cart.reduce((sum, c) => sum + c.quantity, 0),
    }),
    { name: "vast-store" }
  )
);
