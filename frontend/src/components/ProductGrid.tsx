import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error?: string | null;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 animate-pulse">
      <div className="aspect-square bg-stone-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-stone-100 rounded-full w-20" />
        <div className="h-5 bg-stone-100 rounded-full w-3/4" />
        <div className="h-3 bg-stone-100 rounded-full w-full" />
        <div className="h-3 bg-stone-100 rounded-full w-2/3" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-6 bg-stone-100 rounded-full w-24" />
          <div className="h-8 bg-stone-100 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  isLoading,
  error,
}: ProductGridProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg
          className="w-14 h-14 text-stone-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="font-serif text-lg text-bark-700 mb-1">
          Error al cargar productos
        </h3>
        <p className="font-sans text-sm text-stone-500">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        aria-label="Cargando productos"
        aria-busy="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg
          className="w-16 h-16 text-stone-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="font-serif text-xl text-bark-700 mb-2">
          No encontramos productos
        </h3>
        <p className="font-sans text-sm text-stone-500 max-w-xs">
          Probá con otros términos de búsqueda o explorá todas las categorías.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
