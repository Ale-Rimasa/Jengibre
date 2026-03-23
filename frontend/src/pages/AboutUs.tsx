import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function AboutUs() {
  return (
    <main className="flex-1">
      <Helmet>
        <title>Nosotros | Jengibre Cerámicas</title>
        <meta name="description" content="Conocé la historia detrás de Jengibre Cerámicas. Piezas artesanales hechas a mano con arcilla local y amor en Buenos Aires." />
        <meta property="og:title" content="Nosotros | Jengibre Cerámicas" />
        <meta property="og:url" content="https://jengibreaqua.com/nosotros" />
      </Helmet>
      {/* Hero */}
      <section className="bg-warm-gradient py-16 px-4 text-center border-b border-stone-100">
        <p className="font-sans text-xs font-semibold tracking-[0.2em] text-clay-500 uppercase mb-3">
          Nuestra historia
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-bark-800 mb-4">
          Sobre Nosotros
        </h1>
        <p className="font-sans text-stone-500 text-base max-w-xl mx-auto leading-relaxed">
          Cada pieza cuenta una historia de tierra, fuego y manos que crean con amor.
        </p>
      </section>

      {/* Historia */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-bark-800 mb-4">
              Nació de la pasión por la arcilla
            </h2>
            <p className="font-sans text-stone-600 leading-relaxed mb-4">
              Jengibre Cerámicas nació en Buenos Aires con una idea simple: crear objetos hermosos y funcionales que traigan calidez al hogar. Lo que empezó como un hobby en un pequeño taller se convirtió en un oficio de vida.
            </p>
            <p className="font-sans text-stone-600 leading-relaxed">
              Cada pieza pasa por nuestras manos desde el primer trozo de arcilla hasta el esmalte final. No hay dos iguales, y eso es exactamente lo que las hace especiales.
            </p>
          </div>
          <div className="bg-cream-100 rounded-2xl aspect-square flex items-center justify-center">
            <svg className="w-24 h-24 text-clay-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <h2 className="font-serif text-3xl font-semibold text-bark-800 text-center mb-10">
            Lo que nos define
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-clay-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                title: 'Hecho a mano',
                desc: 'Cada pieza es trabajada manualmente, sin moldes industriales. La imperfección es parte de la belleza.',
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-clay-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Materiales locales',
                desc: 'Usamos arcilla argentina y esmaltes de producción nacional. Apoyar lo local es parte de nuestra filosofía.',
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-clay-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: 'Con amor',
                desc: 'Cada objeto que sale de nuestro taller lleva la intención de durar y embellecer espacios cotidianos.',
              },
            ].map((v) => (
              <div key={v.title} className="text-center p-6 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <div className="flex justify-center mb-4">{v.icon}</div>
                <h3 className="font-serif text-lg font-semibold text-bark-800 mb-2">{v.title}</h3>
                <p className="font-sans text-sm text-stone-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Proceso */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 mb-16">
          <h2 className="font-serif text-3xl font-semibold text-bark-800 text-center mb-8">
            El proceso creativo
          </h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'La arcilla', desc: 'Seleccionamos y preparamos la arcilla a mano.' },
              { step: '02', title: 'El modelado', desc: 'Cada pieza se forma en el torno o a mano alzada.' },
              { step: '03', title: 'El horno', desc: 'Primera cocción a 980°C para consolidar la forma.' },
              { step: '04', title: 'El esmalte', desc: 'Aplicación manual y segunda cocción a 1220°C.' },
            ].map((p) => (
              <div key={p.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-clay-50 border border-clay-200 flex items-center justify-center mx-auto mb-3">
                  <span className="font-serif text-sm font-bold text-clay-600">{p.step}</span>
                </div>
                <h4 className="font-serif text-base font-semibold text-bark-800 mb-1">{p.title}</h4>
                <p className="font-sans text-xs text-stone-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-warm-gradient rounded-2xl border border-stone-100 p-10">
          <h2 className="font-serif text-2xl font-semibold text-bark-800 mb-3">
            ¿Querés conocer más?
          </h2>
          <p className="font-sans text-stone-500 mb-6 max-w-md mx-auto">
            Escribinos por WhatsApp, con gusto te contamos sobre encargos personalizados, pedidos al por mayor o simplemente para charlar sobre cerámica. 🌿
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-clay-500 hover:bg-clay-600 text-white font-sans font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Ver la tienda
            </a>
            <a
              href={`https://wa.me/${(import.meta as unknown as { env: Record<string, string> }).env.VITE_WHATSAPP_NUMBER || '5491132565412'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-sans font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Escribinos
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
