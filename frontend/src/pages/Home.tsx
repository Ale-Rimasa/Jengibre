import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(
    async (searchQuery: string, cat: Category, page: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getProducts(
          searchQuery || undefined,
          cat !== 'todas' ? cat : undefined,
          page
        );
        setProducts(data.products);
        setTotalPages(data.totalPages ?? 1);
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
    fetchProducts(search, category, currentPage);
  }, [search, category, currentPage, fetchProducts]);

  const handleSearch = useCallback((query: string) => {
    setCurrentPage(1);
    setSearch(query);
  }, []);

  const handleCategoryChange = useCallback((cat: Category) => {
    setCurrentPage(1);
    setCategory(cat);
  }, []);

  return (
    <main>
      <Helmet>
        <title>Jengibre Cerámicas | Cerámica Artesanal</title>
        <meta name="description" content="Cerámica artesanal hecha a mano en Buenos Aires. Tazas, bowls, jarrones, platos y piezas únicas. Cada pieza cuenta una historia." />
        <meta property="og:title" content="Jengibre Cerámicas | Cerámica Artesanal" />
        <meta property="og:description" content="Cerámica artesanal hecha a mano en Buenos Aires. Tazas, bowls, jarrones y más — únicos, como quien los recibe." />
        <meta property="og:url" content="https://jengibreaqua.com" />
      </Helmet>

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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 font-sans text-sm border border-stone-200 rounded-lg text-stone-600 hover:border-clay-300 hover:text-clay-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 font-sans text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-clay-500 text-white'
                    : 'border border-stone-200 text-stone-600 hover:border-clay-300 hover:text-clay-600'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 font-sans text-sm border border-stone-200 rounded-lg text-stone-600 hover:border-clay-300 hover:text-clay-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
