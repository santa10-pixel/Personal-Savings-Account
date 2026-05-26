import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './mock-data';

export interface CartItem {
  id: string; // combination of productId and size
  product: Product;
  quantity: number;
  size: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product, size: string) => {
        set((state) => {
          const itemId = `${product.id}-${size}`;
          const existingItem = state.items.find((item) => item.id === itemId);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { id: itemId, product, quantity: 1, size }],
          };
        });
      },
      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
            };
          }
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      cartTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'premium-ecommerce-cart', // key in local storage
    }
  )
);
