import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bark-800 text-cream-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl" role="img" aria-hidden="true">🫚</span>
              <span className="font-serif text-xl font-semibold text-cream-100">
                Jengibre
              </span>
            </div>
            <p className="font-sans text-sm text-cream-300 leading-relaxed">
              Cerámica artesanal hecha a mano en Argentina.
              Cada pieza es única, creada con amor y arcilla local.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-cream-400 mb-4">
              Navegación
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="font-sans text-sm text-cream-300 hover:text-cream-100 transition-colors"
                >
                  Tienda
                </Link>
              </li>
              <li>
                <Link
                  to="/nosotros"
                  className="font-sans text-sm text-cream-300 hover:text-cream-100 transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-widest uppercase text-cream-400 mb-4">
              Contacto
            </h3>
            <p className="font-sans text-sm text-cream-300">
              ceramicas@jengibre.com
            </p>
            <p className="font-sans text-sm text-cream-300 mt-1">
              Buenos Aires, Argentina
            </p>
          </div>
        </div>

        <div className="border-t border-bark-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-sans text-xs text-cream-400">
            &copy; {year} Jengibre Cerámicas. Todos los derechos reservados.
          </p>
          {/* Subtle admin link */}
          <Link
            to="/admin"
            className="font-sans text-xs text-bark-600 hover:text-cream-400 transition-colors"
            aria-label="Acceso administrador"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
