import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const CATEGORY_COLORS: Record<string, string> = {
  tazas: 'bg-amber-100 text-amber-800',
  platos: 'bg-stone-100 text-stone-700',
  decoracion: 'bg-clay-100 text-clay-700',
  bowls: 'bg-cream-200 text-bark-700',
  jarrones: 'bg-bark-100 text-bark-800',
  set_vajilla: 'bg-amber-50 text-amber-900',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatCategoryLabel(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock === 0;
  const isLowStock = !isOutOfStock && product.stock <= 3;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handlePreorder = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const categoryColor =
    CATEGORY_COLORS[product.category] ?? 'bg-stone-100 text-stone-600';
  const categoryLabel = formatCategoryLabel(product.category);

  return (
    <article
      onClick={() => navigate(`/producto/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 flex flex-col cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-square bg-cream-100 overflow-hidden">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
            <svg
              className="w-16 h-16 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-sans">Sin imagen</span>
          </div>
        )}

        {/* Badges */}
        {isOutOfStock && (
          <span className="absolute top-2 left-2 bg-amber-600 text-white text-xs font-sans font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Por encargo
          </span>
        )}
        {isLowStock && (
          <span className="absolute top-2 right-2 bg-clay-500 text-white text-xs font-sans font-medium px-2 py-0.5 rounded-full shadow-sm">
            ¡Últimas {product.stock}!
          </span>
        )}

        {/* Hover: "Ver detalle" pill */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="bg-white/90 backdrop-blur-sm text-bark-700 text-xs font-sans font-semibold px-4 py-1.5 rounded-full shadow-sm border border-stone-100">
            Ver detalle →
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span
          className={`self-start text-xs font-sans font-medium px-2.5 py-0.5 rounded-full mb-2 ${categoryColor}`}
        >
          {categoryLabel}
        </span>

        <h3 className="font-serif text-base font-semibold text-bark-800 mb-1 leading-snug">
          {product.name}
        </h3>

        <p className="font-sans text-xs text-stone-500 mb-3 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="font-serif text-lg font-semibold text-clay-600">
              {formatPrice(product.price)}
            </span>
            {isOutOfStock && (
              <p className="font-sans text-xs text-amber-600 mt-0.5">~25 días hábiles</p>
            )}
          </div>

          {!isOutOfStock ? (
            <button
              onClick={handleAddToCart}
              className={`font-sans text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-1
                ${added ? 'bg-green-500 text-white scale-95' : 'bg-clay-500 hover:bg-clay-600 text-white active:scale-95'}`}
              aria-label={`Agregar ${product.name} al carrito`}
            >
              {added ? '✓ Agregado' : 'Agregar'}
            </button>
          ) : (
            <button
              onClick={handlePreorder}
              className={`font-sans text-sm font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1
                ${added ? 'bg-amber-500 text-white border-amber-500 scale-95' : 'border-amber-600 text-amber-700 hover:bg-amber-50 active:scale-95'}`}
              aria-label={`Encargar ${product.name}`}
            >
              {added ? '✓ Agregado' : 'Encargar'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
