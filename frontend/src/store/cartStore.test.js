import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

describe('cartStore Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
  });

  it('starts with an empty cart and 0 total price', () => {
    const { items, getTotalPrice } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(getTotalPrice()).toBe(0);
  });

  it('adds items and calculates total price accurately', () => {
    const burger = { id: 'm1', name: 'Burger', price: 9.99 };
    const fries = { id: 'm2', name: 'Fries', price: 3.50 };

    useCartStore.getState().addItem(burger);
    useCartStore.getState().addItem(fries);

    let state = useCartStore.getState();
    expect(state.items.length).toBe(2);
    expect(state.getTotalPrice()).toBeCloseTo(13.49);

    // Increment burger quantity
    useCartStore.getState().addItem(burger);
    state = useCartStore.getState();
    expect(state.items.length).toBe(2);
    expect(state.items.find(i => i.menu_item_id === 'm1').quantity).toBe(2);
    expect(state.getTotalPrice()).toBeCloseTo(23.48);
  });

  it('updates quantity and removes item when quantity is 0 or less', () => {
    const pizza = { id: 'm3', name: 'Pizza', price: 15.00 };
    useCartStore.getState().addItem(pizza);

    useCartStore.getState().updateQuantity('m3', 3);
    expect(useCartStore.getState().items[0].quantity).toBe(3);

    useCartStore.getState().updateQuantity('m3', 0);
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('removes item explicitly with removeItem', () => {
    useCartStore.getState().addItem({ id: 'm1', name: 'Item 1', price: 5.00 });
    useCartStore.getState().addItem({ id: 'm2', name: 'Item 2', price: 10.00 });

    useCartStore.getState().removeItem('m1');
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].menu_item_id).toBe('m2');
  });

  it('updates special instructions/notes for an item', () => {
    useCartStore.getState().addItem({ id: 'm1', name: 'Pasta', price: 12.00 });
    useCartStore.getState().updateNote('m1', 'Extra parmesan, please');

    expect(useCartStore.getState().items[0].note).toBe('Extra parmesan, please');
  });
});
