import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Buscar productos...',
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="relative w-full max-w-md" role="search">
      {/* Search icon */}
      <div
        className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
        aria-hidden="true"
      >
        <svg
          className="w-4 h-4 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar productos"
        className="w-full pl-9 pr-9 py-2.5 bg-white border border-stone-200 rounded-xl font-sans text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-clay-300 focus:border-clay-300 transition-colors"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
          aria-label="Limpiar búsqueda"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
