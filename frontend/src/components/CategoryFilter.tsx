import React, { useState, useEffect } from 'react';
import { CategoryOption } from '../types';
import { apiService } from '../services/api';

interface CategoryFilterProps {
  selected: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  selected,
  onCategoryChange,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    apiService
      .getCategories(true)
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  const allOptions = [{ slug: 'todas', label: 'Todas' }, ...categories.map((c) => ({ slug: c.slug, label: c.label }))];

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filtrar por categoría"
    >
      {allOptions.map((cat) => {
        const isActive = selected === cat.slug;
        return (
          <button
            key={cat.slug}
            onClick={() => onCategoryChange(cat.slug)}
            aria-pressed={isActive}
            className={`px-4 py-1.5 rounded-full font-sans text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-clay-300 focus:ring-offset-1
              ${
                isActive
                  ? 'bg-clay-500 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-clay-300 hover:text-clay-600'
              }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
