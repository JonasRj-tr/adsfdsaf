import { create } from 'zustand';
import { Addon, Product } from '../data/menu';

export interface CartItem {
  id: string; // Unique ID for the cart item (since same product can be added with different addons)
  product: Product;
  quantity: number;
  addons: Addon[];
  pizzaDetails?: {
    size: string;
    flavors: string[];
    price: number;
  };
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,
  addItem: (item) => {
    set((state) => {
      // Check if identical item exists (same product, same addons, same pizza details)
      const existingItemIndex = state.items.findIndex((i) => {
        if (i.product.id !== item.product.id) return false;
        
        // Check pizza details
        if (i.pizzaDetails && item.pizzaDetails) {
          if (i.pizzaDetails.size !== item.pizzaDetails.size) return false;
          if (i.pizzaDetails.flavors.join(',') !== item.pizzaDetails.flavors.join(',')) return false;
        } else if (i.pizzaDetails || item.pizzaDetails) {
          return false; // One is pizza, one is not
        }

        // Check addons
        if (i.addons.length !== item.addons.length) return false;
        const addonIds1 = i.addons.map(a => a.id).sort().join(',');
        const addonIds2 = item.addons.map(a => a.id).sort().join(',');
        return addonIds1 === addonIds2;
      });

      if (existingItemIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += item.quantity;
        return { items: newItems };
      }

      return {
        items: [...state.items, { ...item, id: Math.random().toString(36).substr(2, 9) }],
      };
    });
  },
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),
  clearCart: () => set({ items: [] }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  getTotal: () => {
    return get().items.reduce((total, item) => {
      let itemTotal = item.product.price;
      
      if (item.pizzaDetails) {
        itemTotal = item.pizzaDetails.price;
      } else {
        itemTotal += item.addons.reduce((sum, addon) => sum + addon.price, 0);
      }
      
      return total + itemTotal * item.quantity;
    }, 0);
  },
}));
