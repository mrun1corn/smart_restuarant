import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (menuItem) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.menu_item_id === menuItem.id);
        
        if (existingItem) {
          set({
            items: currentItems.map(item => 
              item.menu_item_id === menuItem.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({ items: [...currentItems, { menu_item_id: menuItem.id, quantity: 1, name: menuItem.name, price: menuItem.price, note: '' }] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter(item => item.menu_item_id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map(item => 
            item.menu_item_id === id ? { ...item, quantity } : item
          )
        });
      },
      updateNote: (id, note) => {
        set({
          items: get().items.map(item => 
            item.menu_item_id === id ? { ...item, note } : item
          )
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
      }
    }),
    {
      name: 'smart-restaurant-cart',
    }
  )
);
