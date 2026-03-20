import React, { useState } from 'react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex gap-3 py-4 border-b border-stone-100 last:border-0">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-cream-100 overflow-hidden flex-shrink-0">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-serif text-sm font-medium text-bark-800 truncate">
          {item.name}
        </h4>
        <p className="font-sans text-xs text-stone-500 mt-0.5">
          {formatPrice(item.price)} c/u
        </p>
        {item.preorder && (
          <span className="inline-flex items-center gap-1 mt-1 font-sans text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            ⏳ Encargo · ~25 días
          </span>
        )}

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:border-clay-400 hover:text-clay-600 transition-colors focus:outline-none focus:ring-1 focus:ring-clay-400"
            aria-label={`Reducir cantidad de ${item.name}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="font-sans text-sm font-medium text-stone-700 w-5 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:border-clay-400 hover:text-clay-600 transition-colors focus:outline-none focus:ring-1 focus:ring-clay-400"
            aria-label={`Aumentar cantidad de ${item.name}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right side: line total + remove */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-stone-300 hover:text-clay-500 transition-colors focus:outline-none"
          aria-label={`Eliminar ${item.name} del carrito`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <span className="font-serif text-sm font-semibold text-clay-600">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>
    </div>
  );
}
