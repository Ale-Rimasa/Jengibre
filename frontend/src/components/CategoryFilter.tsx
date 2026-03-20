import React from 'react';
import { Category } from '../types';

interface CategoryOption {
  value: Category;
  label: string;
}

const CATEGORIES: CategoryOption[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'tazas', label: 'Tazas' },
  { value: 'platos', label: 'Platos' },
  { value: 'decoracion', label: 'Decoración' },
  { value: 'bowls', label: 'Bowls' },
  { value: 'jarrones', label: 'Jarrones' },
  { value: 'set_vajilla', label: 'Sets' },
];

interface CategoryFilterProps {
  selected: Category;
  onCategoryChange: (category: Category) => void;
}

export default function CategoryFilter({
  selected,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filtrar por categoría"
    >
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
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
