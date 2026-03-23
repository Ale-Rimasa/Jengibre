import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Product } from '../types';
import { apiService } from '../services/api';
import { useCart } from '../context/CartContext';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

function formatCategoryLabel(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function ProductDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-4 animate-shimmer rounded-full w-28 mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="aspect-square animate-shimmer rounded-2xl" />
        <div className="flex flex-col gap-4 pt-2">
          <div className="h-3 animate-shimmer rounded-full w-20" />
          <div className="h-9 animate-shimmer rounded-full w-3/4" />
          <div className="h-9 animate-shimmer rounded-full w-2/5" />
          <div className="h-px bg-stone-100 my-2" />
          <div className="space-y-2.5">
            <div className="h-3.5 animate-shimmer rounded-full w-full" />
            <div className="h-3.5 animate-shimmer rounded-full w-5/6" />
            <div className="h-3.5 animate-shimmer rounded-full w-4/5" />
            <div className="h-3.5 animate-shimmer rounded-full w-3/4" />
          </div>
          <div className="h-4 animate-shimmer rounded-full w-40 mt-4" />
          <div className="h-14 animate-shimmer rounded-2xl w-full mt-2" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (selectedIdx !== undefined) setImgError(false);
  }, [selectedIdx]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setNotFound(false);
    apiService
      .getProduct(Number(id))
      .then((data) => {
        setProduct(data.product);
        setSelectedIdx(0);
      })
      .catch((err: unknown) => {
        const status =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;
        if (status === 404) setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product) return;
    apiService.getRelatedProducts(product.category, product.id, 4)
      .then(data => setRelated(data.products.filter(p => p.id !== product.id).slice(0, 4)))
      .catch(() => {});
  }, [product?.id, product?.category]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleShare = async () => {
    const url = `https://jengibreaqua.com/producto/${product!.id}`;
    const title = product!.name;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch { /* cancelled */ }
    }
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  if (isLoading) return <ProductDetailSkeleton />;

  if (notFound || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-24 text-center">
        <p className="font-serif text-3xl text-stone-300 mb-4">404</p>
        <p className="font-serif text-xl text-stone-500 mb-6">Producto no encontrado</p>
        <button
          onClick={() => navigate('/')}
          className="font-sans text-sm text-clay-600 hover:text-clay-700 transition-colors underline underline-offset-2"
        >
          ← Volver a la tienda
        </button>
      </div>
    );
  }

  const stockStatus =
    product.stock === 0 ? 'out' : product.stock <= 3 ? 'low' : 'ok';

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <>
      {product && (
        <Helmet>
          <title>{product.name} | Jengibre Cerámicas</title>
          <meta name="description" content={product.description.substring(0, 155)} />
          <meta property="og:title" content={`${product.name} | Jengibre Cerámicas`} />
          <meta property="og:description" content={product.description.substring(0, 155)} />
          <meta property="og:image" content={product.image} />
          <meta property="og:url" content={`https://jengibreaqua.com/producto/${product.id}`} />
          <meta property="og:type" content="product" />
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.image,
            "brand": { "@type": "Brand", "name": "Jengibre Cerámicas" },
            "offers": {
              "@type": "Offer",
              "priceCurrency": "ARS",
              "price": product.price,
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder"
            }
          })}</script>
        </Helmet>
      )}

      <main>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 font-sans text-sm text-stone-500 hover:text-clay-600 transition-colors mb-10 group"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la tienda
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* ── Image Gallery ── */}
            <div className="flex gap-3">
              {/* Thumbnails (only show if more than 1 image) */}
              {allImages.length > 1 && (
                <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
                  {allImages.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                        selectedIdx === idx
                          ? 'border-clay-500 shadow-sm'
                          : 'border-transparent hover:border-stone-300'
                      }`}
                      aria-label={`Ver imagen ${idx + 1}`}
                    >
                      <img
                        src={url}
                        alt={`Vista ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className={`relative aspect-square rounded-2xl overflow-hidden bg-cream-100 border border-stone-100 shadow-sm ${allImages.length > 1 ? 'flex-1' : 'w-full'}`}>
                {!imgError ? (
                  <img
                    key={selectedIdx}
                    src={allImages[selectedIdx] || product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 animate-fade-in ${
                      stockStatus === 'out' ? 'grayscale opacity-60' : ''
                    }`}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                    <svg className="w-20 h-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-sans text-sm">Sin imagen</span>
                  </div>
                )}

                {/* Out of stock overlay */}
                {stockStatus === 'out' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white/90 backdrop-blur-sm text-stone-600 text-sm font-sans font-semibold px-5 py-2.5 rounded-full border border-stone-200 shadow-sm">
                      Sin stock
                    </span>
                  </div>
                )}

                {/* Low stock badge */}
                {stockStatus === 'low' && (
                  <span className="absolute top-3 right-3 bg-clay-500 text-white text-xs font-sans font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    ¡Últimas {product.stock}!
                  </span>
                )}
              </div>
            </div>

            {/* ── Info ── */}
            <div className="flex flex-col justify-center">
              {/* Category */}
              <span className="self-start font-sans text-xs font-semibold uppercase tracking-widest text-clay-400 mb-3">
                {formatCategoryLabel(product.category)}
              </span>

              {/* Name */}
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-bark-800 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <p className="font-serif text-3xl font-semibold text-clay-600 mb-6">
                {formatPrice(product.price)}
              </p>

              {/* Divider */}
              <div className="border-t border-stone-100 mb-6" />

              {/* Description */}
              <p className="font-sans text-sm text-stone-600 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Stock indicator */}
              <div className="flex items-center gap-2 mb-7">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    stockStatus === 'out'
                      ? 'bg-stone-300'
                      : stockStatus === 'low'
                      ? 'bg-amber-400'
                      : 'bg-green-400'
                  }`}
                />
                <span
                  className={`font-sans text-sm ${
                    stockStatus === 'out'
                      ? 'text-stone-400'
                      : stockStatus === 'low'
                      ? 'text-amber-600 font-medium'
                      : 'text-stone-500'
                  }`}
                >
                  {stockStatus === 'out'
                    ? 'Sin stock disponible'
                    : stockStatus === 'low'
                    ? `¡Solo quedan ${product.stock} unidades!`
                    : `Disponible · ${product.stock} unidades`}
                </span>
              </div>

              {/* CTA */}
              {stockStatus !== 'out' ? (
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-2xl font-sans text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2 ${
                    added
                      ? 'bg-green-500 text-white scale-[0.98]'
                      : 'bg-clay-500 hover:bg-clay-600 text-white active:scale-[0.98] shadow-sm hover:shadow-md'
                  }`}
                >
                  {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
                </button>
              ) : (
                <div className="w-full py-4 rounded-2xl bg-stone-100 text-stone-400 font-sans text-base font-semibold text-center cursor-not-allowed">
                  Sin stock
                </div>
              )}

              {/* Share button */}
              <div className="flex items-center justify-between mt-5">
                <p className="font-sans text-xs text-stone-400 leading-relaxed">
                  ✦&nbsp; Pieza artesanal hecha a mano — cada una es única
                </p>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-stone-500 hover:text-clay-600 font-sans text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {shareCopied ? '✓ Link copiado' : 'Compartir'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-stone-100">
            <h2 className="font-serif text-2xl font-semibold text-bark-800 mb-6">Te puede interesar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/producto/${p.id}`)}
                  className="group text-left bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-clay-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="aspect-square bg-cream-100 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-sans text-sm font-medium text-bark-800 line-clamp-1">{p.name}</p>
                    <p className="font-serif text-sm font-semibold text-clay-600 mt-0.5">{formatPrice(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
