import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import CartItemComponent from './CartItem';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CheckoutForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const EMPTY_FORM: CheckoutForm = { name: '', phone: '', email: '', address: '', notes: '' };
type Step = 'cart' | 'checkout' | 'success';

const WHATSAPP_NUMBER = (import.meta as unknown as { env: Record<string, string> }).env.VITE_WHATSAPP_NUMBER || '5491132565412';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}

function buildWhatsAppMessage(items: Array<{ name: string; quantity: number; price: number }>, total: number, form: CheckoutForm): string {
  const lines = [
    '🌿 *Hola! Quisiera hacer un pedido en Jengibre Cerámicas*', '',
    '🛍️ *Productos:*',
    ...items.map(i => `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`),
    '', `💰 *Total: ${formatPrice(total)}*`, '',
    '👤 *Mis datos:*',
    `Nombre: ${form.name}`,
    `Teléfono: ${form.phone}`,
    ...(form.email ? [`Email: ${form.email}`] : []),
    ...(form.address ? [`Dirección: ${form.address}`] : []),
    ...(form.notes ? [`Notas: ${form.notes}`] : []),
    '', '¡Muchas gracias! 🏺',
  ];
  return lines.join('\n');
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>('cart');
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => { setStep('cart'); setForm(EMPTY_FORM); setErrors({}); }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) step === 'checkout' ? setStep('cart') : onClose();
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, step, onClose]);

  const validate = (): boolean => {
    const errs: Partial<CheckoutForm> = {};
    if (!form.name.trim()) errs.name = 'El nombre es requerido';
    if (!form.phone.trim()) errs.phone = 'El teléfono es requerido';
    else if (!/^[\d\s+\-()]{6,20}$/.test(form.phone.trim())) errs.phone = 'Teléfono inválido';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Open WhatsApp
    const msg = buildWhatsAppMessage(items, totalPrice, form);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');

    // Save order to database (non-blocking)
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email || undefined,
          customerAddress: form.address || undefined,
          notes: form.notes || undefined,
          total: totalPrice,
          items: items.map(item => ({
            productId: item.id,
            productName: item.name,
            productImg: item.image,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        }),
      });
    } catch {
      // Silently fail - WhatsApp already opened
    }

    setStep('success');
  };

  const WhatsAppIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  return (
    <>
      <div className={`fixed inset-0 bg-stone-900/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => step === 'checkout' ? setStep('cart') : onClose()} aria-hidden="true" />

      <div role="dialog" aria-modal="true" aria-label="Carrito de compras" className={`fixed right-0 top-0 h-full w-full max-w-sm bg-cream-50 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            {step === 'checkout' && (
              <button onClick={() => setStep('cart')} className="p-1 rounded-lg text-stone-400 hover:text-stone-600 transition-colors mr-1" aria-label="Volver">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {step === 'cart' && <svg className="w-5 h-5 text-bark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
            <h2 className="font-serif text-lg font-semibold text-bark-800">
              {step === 'cart' ? 'Carrito' : step === 'checkout' ? 'Tu pedido' : '¡Pedido enviado!'}
            </h2>
            {step === 'cart' && totalItems > 0 && <span className="bg-clay-500 text-white text-xs font-sans font-bold rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors" aria-label="Cerrar carrito">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* ── CARRITO ── */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <svg className="w-16 h-16 text-stone-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  <p className="font-serif text-lg text-stone-400 mb-1">Tu carrito está vacío</p>
                  <p className="font-sans text-sm text-stone-400">Agregá productos para comenzar</p>
                </div>
              ) : (
                <div>{items.map(item => <CartItemComponent key={item.id} item={item} />)}</div>
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-stone-200 px-5 py-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-stone-500">Subtotal</span>
                  <span className="font-serif text-base font-medium text-bark-800">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm font-semibold text-bark-800">Total</span>
                  <span className="font-serif text-xl font-bold text-clay-600">{formatPrice(totalPrice)}</span>
                </div>
                <button onClick={() => setStep('checkout')} className="w-full bg-clay-500 hover:bg-clay-600 text-white font-sans font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Finalizar pedido
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <button onClick={clearCart} className="w-full border border-stone-300 text-stone-500 hover:border-clay-400 hover:text-clay-600 font-sans text-sm py-2.5 rounded-xl transition-colors">Vaciar carrito</button>
              </div>
            )}
          </>
        )}

        {/* ── FORMULARIO ── */}
        {step === 'checkout' && (
          <>
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
              <p className="font-sans text-xs text-stone-500 mb-0.5">{totalItems} producto{totalItems !== 1 ? 's' : ''}</p>
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-stone-600 truncate pr-2">{items.slice(0, 2).map(i => i.name).join(', ')}{items.length > 2 ? ` +${items.length - 2} más` : ''}</span>
                <span className="font-serif text-sm font-bold text-clay-600 flex-shrink-0">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Nombre completo *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="María García" className={`w-full px-3 py-2.5 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 bg-white ${errors.name ? 'border-red-300' : 'border-stone-200'}`} />
                {errors.name && <p className="font-sans text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Teléfono / WhatsApp *</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+54 9 11 1234-5678" className={`w-full px-3 py-2.5 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 bg-white ${errors.phone ? 'border-red-300' : 'border-stone-200'}`} />
                {errors.phone && <p className="font-sans text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Email <span className="text-stone-400 normal-case font-normal">(opcional)</span></label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="maria@email.com" className={`w-full px-3 py-2.5 border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 bg-white ${errors.email ? 'border-red-300' : 'border-stone-200'}`} />
                {errors.email && <p className="font-sans text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Dirección <span className="text-stone-400 normal-case font-normal">(opcional)</span></label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Av. Corrientes 1234, CABA" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 bg-white" />
              </div>
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Notas <span className="text-stone-400 normal-case font-normal">(opcional)</span></label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Envío a domicilio, regalo, color preferido..." rows={2} className="w-full px-3 py-2.5 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 bg-white resize-none" />
              </div>
              <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                <WhatsAppIcon />
                <p className="font-sans text-xs text-green-700">Al confirmar se abrirá WhatsApp con el resumen de tu pedido listo para enviar.</p>
              </div>
            </form>

            <div className="border-t border-stone-200 px-5 py-4 space-y-2">
              <button type="button" onClick={handleCheckout} className="w-full bg-green-500 hover:bg-green-600 text-white font-sans font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <WhatsAppIcon /> Enviar pedido por WhatsApp
              </button>
              <button type="button" onClick={() => setStep('cart')} className="w-full border border-stone-300 text-stone-500 hover:border-clay-400 hover:text-clay-600 font-sans text-sm py-2.5 rounded-xl transition-colors">Volver al carrito</button>
            </div>
          </>
        )}

        {/* ── ÉXITO ── */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="font-serif text-xl font-semibold text-bark-800 mb-2">¡Pedido enviado!</h3>
            <p className="font-sans text-sm text-stone-500 mb-1">Se abrió WhatsApp con el resumen de tu pedido.</p>
            <p className="font-sans text-sm text-stone-500 mb-8">Pronto nos pondremos en contacto con vos. 🌿</p>
            <button onClick={() => { clearCart(); onClose(); }} className="w-full bg-clay-500 hover:bg-clay-600 text-white font-sans font-semibold text-sm py-3 rounded-xl transition-colors">Volver a la tienda</button>
          </div>
        )}
      </div>
    </>
  );
}
