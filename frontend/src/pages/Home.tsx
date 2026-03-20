import React, { useState, useCallback, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import { Category, Product } from '../types';
import { apiService } from '../services/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('todas');

  const fetchProducts = useCallback(
    async (searchQuery: string, cat: Category) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getProducts(
          searchQuery || undefined,
          cat !== 'todas' ? cat : undefined
        );
        setProducts(data.products);
      } catch (err) {
        setError('No pudimos cargar los productos. Por favor, intentá de nuevo más tarde.');
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts(search, category);
  }, [search, category, fetchProducts]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const handleCategoryChange = useCallback((cat: Category) => {
    setCategory(cat);
  }, []);

  return (
    <main>
      {/* Hero banner */}
      <section className="bg-warm-gradient py-14 px-4 text-center border-b border-stone-100">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-bark-800 mb-3">
          Cerámica Artesanal
        </h1>
        <p className="font-sans text-base text-stone-500 max-w-md mx-auto">
          Cada pieza está hecha a mano con arcilla local y amor.
          Única, como quién la recibe.
        </p>
      </section>

      {/* Filters section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <SearchBar onSearch={handleSearch} />
          <p className="font-sans text-sm text-stone-400">
            {!isLoading && `${products.length} producto${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="mb-8">
          <CategoryFilter
            selected={category}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        <ProductGrid products={products} isLoading={isLoading} error={error} />
      </section>
    </main>
  );
}
