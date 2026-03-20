import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartProvider, useCart } from '../context/CartContext';
import { Product } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockProduct1: Product = {
  id: 1,
  name: 'Taza Espresso',
  price: 2800,
  category: 'tazas',
  description: 'Una taza de espresso artesanal',
  image: '/images/taza.jpg',
  stock: 10,
  active: true,
};

const mockProduct2: Product = {
  id: 2,
  name: 'Bowl Ensalada',
  price: 4800,
  category: 'bowls',
  description: 'Un bowl para ensalada',
  image: '/images/bowl.jpg',
  stock: 5,
  active: true,
};

// Helper component to expose cart context
let cartValue: ReturnType<typeof useCart>;

function CartTestConsumer() {
  cartValue = useCart();
  return null;
}

function renderWithCart() {
  return render(
    <CartProvider>
      <CartTestConsumer />
    </CartProvider>
  );
}

beforeEach(() => {
  localStorageMock.clear();
});

describe('CartContext', () => {
  describe('addToCart', () => {
    it('should add a new item to the cart', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1);
      });

      expect(cartValue.items).toHaveLength(1);
      expect(cartValue.items[0].id).toBe(1);
      expect(cartValue.items[0].quantity).toBe(1);
    });

    it('should increment quantity when adding the same item twice', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1);
      });

      act(() => {
        cartValue.addToCart(mockProduct1);
      });

      expect(cartValue.items).toHaveLength(1);
      expect(cartValue.items[0].quantity).toBe(2);
    });

    it('should add multiple different items', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1);
        cartValue.addToCart(mockProduct2);
      });

      expect(cartValue.items).toHaveLength(2);
    });
  });

  describe('removeFromCart', () => {
    it('should remove an item from the cart', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1);
        cartValue.addToCart(mockProduct2);
      });

      expect(cartValue.items).toHaveLength(2);

      act(() => {
        cartValue.removeFromCart(1);
      });

      expect(cartValue.items).toHaveLength(1);
      expect(cartValue.items[0].id).toBe(2);
    });

    it('should handle removing non-existent item gracefully', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1);
      });

      act(() => {
        cartValue.removeFromCart(999);
      });

      expect(cartValue.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update the quantity of an item', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1);
      });

      act(() => {
        cartValue.updateQuantity(1, 5);
      });

      expect(cartValue.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is set to 0', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1);
      });

      act(() => {
        cartValue.updateQuantity(1, 0);
      });

      expect(cartValue.items).toHaveLength(0);
    });

    it('should remove item when quantity is set to negative', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1);
      });

      act(() => {
        cartValue.updateQuantity(1, -1);
      });

      expect(cartValue.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from the cart', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1);
        cartValue.addToCart(mockProduct2);
      });

      expect(cartValue.items).toHaveLength(2);

      act(() => {
        cartValue.clearCart();
      });

      expect(cartValue.items).toHaveLength(0);
    });
  });

  describe('totalItems', () => {
    it('should calculate total items correctly', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1); // qty 1
        cartValue.addToCart(mockProduct1); // qty 2
        cartValue.addToCart(mockProduct2); // qty 1
      });

      // totalItems should be 2 + 1 = 3
      expect(cartValue.totalItems).toBe(3);
    });

    it('should be 0 for empty cart', () => {
      renderWithCart();
      expect(cartValue.totalItems).toBe(0);
    });
  });

  describe('totalPrice', () => {
    it('should calculate total price correctly', () => {
      renderWithCart();

      act(() => {
        cartValue.addToCart(mockProduct1); // 2800 x1
        cartValue.addToCart(mockProduct1); // 2800 x2
        cartValue.addToCart(mockProduct2); // 4800 x1
      });

      // 2800 * 2 + 4800 * 1 = 5600 + 4800 = 10400
      expect(cartValue.totalPrice).toBe(10400);
    });

    it('should be 0 for empty cart', () => {
      renderWithCart();
      expect(cartValue.totalPrice).toBe(0);
    });
  });
});
