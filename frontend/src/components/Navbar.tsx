import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onCartOpen: () => void;
}

export default function Navbar({ onCartOpen }: NavbarProps) {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-cream-50 border-b border-stone-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="Jengibre Cerámicas - Inicio"
          >
            <span className="text-2xl" role="img" aria-hidden="true">
              🫚
            </span>
            <span className="font-serif text-2xl font-semibold text-bark-700 group-hover:text-clay-600 transition-colors">
              Jengibre
            </span>
            <span className="hidden sm:inline text-xs text-stone-400 font-sans tracking-widest uppercase mt-1">
              Cerámicas
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="font-sans text-sm text-stone-600 hover:text-clay-600 transition-colors"
            >
              Tienda
            </Link>
            <Link
              to="/"
              className="font-sans text-sm text-stone-600 hover:text-clay-600 transition-colors"
            >
              Nosotros
            </Link>
          </div>

          {/* Cart button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCartOpen}
              className="relative p-2 rounded-full hover:bg-cream-200 transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400"
              aria-label={`Carrito de compras${totalItems > 0 ? `, ${totalItems} artículos` : ''}`}
            >
              <svg
                className="w-6 h-6 text-bark-700"
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
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-clay-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-cream-200 transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400"
              aria-label="Menú de navegación"
              aria-expanded={menuOpen}
            >
              <svg
                className="w-5 h-5 text-bark-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-cream-50 border-t border-stone-200 px-4 py-3 space-y-2">
          <Link
            to="/"
            className="block py-2 font-sans text-sm text-stone-600 hover:text-clay-600 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Tienda
          </Link>
          <Link
            to="/"
            className="block py-2 font-sans text-sm text-stone-600 hover:text-clay-600 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Nosotros
          </Link>
        </div>
      )}
    </nav>
  );
}
