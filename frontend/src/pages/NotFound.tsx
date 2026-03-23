import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>Página no encontrada | Jengibre Cerámicas</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="min-h-[70vh] bg-cream-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 text-8xl">🏺</div>
        <p className="font-sans text-sm font-semibold text-clay-500 uppercase tracking-[0.2em] mb-3">Error 404</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-bark-800 mb-3">
          Esta pieza no existe
        </h1>
        <p className="font-sans text-base text-stone-400 max-w-sm mb-8">
          La página que buscás no está en nuestra colección. Quizás fue movida o el enlace es incorrecto.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-clay-500 hover:bg-clay-600 text-white font-sans text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Volver a la tienda
        </button>
      </main>
    </>
  );
}
