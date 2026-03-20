import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import CartItemComponent from './CartItem';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, totalItems, totalPrice, clearCart } = useCart();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-stone-900/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-cream-50 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-bark-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="font-serif text-lg font-semibold text-bark-800">
              Carrito
            </h2>
            {totalItems > 0 && (
              <span className="bg-clay-500 text-white text-xs font-sans font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-clay-300"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <svg
                className="w-16 h-16 text-stone-200 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="font-serif text-lg text-stone-400 mb-1">
                Tu carrito está vacío
              </p>
              <p className="font-sans text-sm text-stone-400">
                Agregá productos para comenzar
              </p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItemComponent key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 px-5 py-5 space-y-4">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="font-sans text-sm text-stone-500">Subtotal</span>
              <span className="font-serif text-base font-medium text-bark-800">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-sm font-semibold text-bark-800">Total</span>
              <span className="font-serif text-xl font-bold text-clay-600">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Actions */}
            <button
              className="w-full bg-clay-500 hover:bg-clay-600 text-white font-sans font-semibold text-sm py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2"
              onClick={() => alert('Checkout próximamente')}
            >
              Finalizar compra
            </button>
            <button
              onClick={clearCart}
              className="w-full border border-stone-300 text-stone-500 hover:border-clay-400 hover:text-clay-600 font-sans text-sm py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-clay-300"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
