import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Product, CategoryOption, Order } from '../types';
import { apiService, CreateProductData } from '../services/api';

type ToastType = 'success' | 'error';
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim();
}

const EMPTY_FORM: CreateProductData = {
  name: '',
  price: 0,
  category: '',
  description: '',
  image: '',
  stock: 0,
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function Admin() {
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const navigate = useNavigate();

  // ── General ──────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories'>('products');

  // ── Products ──────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<CreateProductData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [isUploadingExtra, setIsUploadingExtra] = useState(false);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  // ── Orders ────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);

  // ── Categories ────────────────────────────────────────────
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryOption | null>(null);
  const [catForm, setCatForm] = useState({ slug: '', label: '', order: 0 });
  const [catFormErrors, setCatFormErrors] = useState<{ slug?: string; label?: string }>({});
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // ── Auth redirect ─────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ── Initial loads ─────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
      loadOrders();
      loadCategories();
    }
  }, [isAuthenticated]);

  // ── Auto-slug from label (create only) ───────────────────
  useEffect(() => {
    if (!editingCategory && !slugManuallyEdited) {
      setCatForm((prev) => ({ ...prev, slug: slugify(prev.label) }));
    }
  }, [catForm.label, editingCategory, slugManuallyEdited]);

  // ── Loaders ───────────────────────────────────────────────
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getProducts();
      setProducts(data.products);
    } catch {
      showToast('Error al cargar productos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await apiService.getOrders();
      setOrders(data.orders);
    } catch {
      // Silently fail
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategoryOptions(data.categories);
    } catch {
      // Silently fail
    }
  };

  // ── Toast ─────────────────────────────────────────────────
  const showToast = (message: string, type: ToastType) => {
    const id = toastCounter + 1;
    setToastCounter(id);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // ── Product modal ─────────────────────────────────────────
  const openCreateModal = () => {
    setEditingProduct(null);
    const defaultCat = categoryOptions.find((c) => c.active)?.slug || '';
    setFormData({ ...EMPTY_FORM, category: defaultCat });
    setFormErrors({});
    setImagePreview('');
    setImageError('');
    setExtraImages([]);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
      stock: product.stock,
    });
    setImagePreview(product.image || '');
    setImageError('');
    setFormErrors({});
    setExtraImages(product.images || []);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setImagePreview('');
    setImageError('');
    setExtraImages([]);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploadingImage(true);
    setImageError('');
    try {
      const data = new FormData();
      data.append('image', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al subir imagen');
      setFormData((prev) => ({ ...prev, image: result.url }));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Error al subir imagen');
      setImagePreview('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleExtraImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (extraImages.length >= 5) return;
    setIsUploadingExtra(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al subir imagen');
      setExtraImages((prev) => [...prev, result.url]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al subir imagen', 'error');
    } finally {
      setIsUploadingExtra(false);
      if (extraFileInputRef.current) extraFileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateProductData, string>> = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (formData.price <= 0) errors.price = 'El precio debe ser mayor a 0' as unknown as never;
    if (!formData.description.trim()) errors.description = 'La descripción es requerida';
    if (!formData.image.trim()) errors.image = 'La imagen es requerida';
    if (formData.stock < 0) errors.stock = 'El stock no puede ser negativo' as unknown as never;
    setFormErrors(errors as Partial<CreateProductData>);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, { ...formData, images: extraImages });
        showToast('Producto actualizado correctamente', 'success');
      } else {
        await apiService.createProduct({ ...formData, images: extraImages });
        showToast('Producto creado correctamente', 'success');
      }
      closeModal();
      loadProducts();
    } catch {
      showToast(
        editingProduct ? 'Error al actualizar producto' : 'Error al crear producto',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteProduct(id);
      showToast('Producto desactivado', 'success');
      setDeleteId(null);
      loadProducts();
    } catch {
      showToast('Error al eliminar producto', 'error');
    }
  };

  // ── Category modal ────────────────────────────────────────
  const openCreateCatModal = () => {
    setEditingCategory(null);
    setCatForm({ slug: '', label: '', order: categoryOptions.length });
    setCatFormErrors({});
    setSlugManuallyEdited(false);
    setCatModalOpen(true);
  };

  const openEditCatModal = (cat: CategoryOption) => {
    setEditingCategory(cat);
    setCatForm({ slug: cat.slug, label: cat.label, order: cat.order });
    setCatFormErrors({});
    setSlugManuallyEdited(true);
    setCatModalOpen(true);
  };

  const closeCatModal = () => {
    setCatModalOpen(false);
    setEditingCategory(null);
    setCatForm({ slug: '', label: '', order: 0 });
    setCatFormErrors({});
    setSlugManuallyEdited(false);
  };

  const validateCatForm = (): boolean => {
    const errors: { slug?: string; label?: string } = {};
    if (!catForm.label.trim()) errors.label = 'El nombre es requerido';
    if (!catForm.slug.trim()) errors.slug = 'El slug es requerido';
    if (!/^[a-z0-9_]+$/.test(catForm.slug))
      errors.slug = 'Solo letras minúsculas, números y guiones bajos';
    setCatFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateCatForm()) return;
    setIsSavingCat(true);
    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, {
          label: catForm.label,
          order: catForm.order,
        });
        showToast('Categoría actualizada', 'success');
      } else {
        await apiService.createCategory({
          slug: catForm.slug,
          label: catForm.label,
          order: catForm.order,
        });
        showToast('Categoría creada', 'success');
      }
      closeCatModal();
      loadCategories();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      showToast(msg || (editingCategory ? 'Error al actualizar' : 'Error al crear categoría'), 'error');
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleToggleCatActive = async (cat: CategoryOption) => {
    try {
      await apiService.updateCategory(cat.id, { active: !cat.active });
      showToast(cat.active ? 'Categoría desactivada' : 'Categoría activada', 'success');
      loadCategories();
    } catch {
      showToast('Error al actualizar categoría', 'error');
    }
  };

  const handleDeleteCat = async (id: number) => {
    try {
      await apiService.deleteCategory(id);
      showToast('Categoría eliminada', 'success');
      setDeleteCatId(null);
      loadCategories();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      showToast(msg || 'Error al eliminar categoría', 'error');
      setDeleteCatId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-clay-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-sans text-sm text-stone-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-sans text-sm font-medium animate-fade-in ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-semibold text-bark-800">Panel Admin</h1>
            <p className="font-sans text-xs text-stone-400">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="font-sans text-sm text-stone-500 hover:text-clay-600 transition-colors"
            >
              ← Ver tienda
            </a>
            <button
              onClick={handleLogout}
              className="font-sans text-sm text-stone-500 hover:text-clay-600 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Page title + action button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-bark-800">
            {activeTab === 'products' ? 'Productos' : activeTab === 'orders' ? 'Órdenes' : 'Categorías'}
          </h2>
          {activeTab === 'products' && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-clay-500 hover:bg-clay-600 text-white font-sans text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo producto
            </button>
          )}
          {activeTab === 'categories' && (
            <button
              onClick={openCreateCatModal}
              className="flex items-center gap-2 bg-clay-500 hover:bg-clay-600 text-white font-sans text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva categoría
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`font-sans text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'products' ? 'bg-white text-bark-800 shadow-sm' : 'text-stone-500 hover:text-bark-700'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`font-sans text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-white text-bark-800 shadow-sm' : 'text-stone-500 hover:text-bark-700'
            }`}
          >
            Órdenes
            {orders.filter((o) => o.status === 'pending').length > 0 && (
              <span className="ml-1.5 bg-clay-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                {orders.filter((o) => o.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`font-sans text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'categories' ? 'bg-white text-bark-800 shadow-sm' : 'text-stone-500 hover:text-bark-700'
            }`}
          >
            Categorías
          </button>
        </div>

        {/* ── Products tab ── */}
        {activeTab === 'products' && (
          isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-clay-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-serif text-lg text-stone-400">No hay productos. Creá uno nuevo.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-100 bg-cream-50">
                        <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3">Producto</th>
                        <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Categoría</th>
                        <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3">Precio</th>
                        <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Stock</th>
                        <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Estado</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-stone-50 hover:bg-cream-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-cream-100 overflow-hidden flex-shrink-0">
                                <img
                                  src={product.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                              <div>
                                <p className="font-sans text-sm font-medium text-bark-800 line-clamp-1">{product.name}</p>
                                <p className="font-sans text-xs text-stone-400 line-clamp-1 hidden sm:block">
                                  {product.description.substring(0, 50)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">
                            <span className="font-sans text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                              {categoryOptions.find((c) => c.slug === product.category)?.label ?? product.category}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-serif text-sm font-medium text-clay-600">{formatPrice(product.price)}</span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className={`font-sans text-sm ${product.stock === 0 ? 'text-red-500' : product.stock <= 3 ? 'text-amber-600' : 'text-stone-600'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className={`inline-flex items-center gap-1 font-sans text-xs px-2 py-0.5 rounded-full ${product.active ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${product.active ? 'bg-green-500' : 'bg-stone-400'}`} />
                              {product.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button onClick={() => openEditModal(product)} className="text-stone-400 hover:text-clay-600 transition-colors focus:outline-none" aria-label={`Editar ${product.name}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button onClick={() => setDeleteId(product.id)} className="text-stone-400 hover:text-red-500 transition-colors focus:outline-none" aria-label={`Eliminar ${product.name}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        )}

        {/* ── Orders tab ── */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-serif text-lg text-stone-400">No hay órdenes aún.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100 bg-cream-50">
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3">#</th>
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3">Cliente</th>
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Productos</th>
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3">Total</th>
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3">Estado</th>
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-stone-50 hover:bg-cream-50 transition-colors">
                        <td className="px-5 py-4 font-sans text-sm text-stone-500">#{order.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-sans text-sm font-medium text-bark-800">{order.customerName}</p>
                          <p className="font-sans text-xs text-stone-400">{order.customerPhone}</p>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <p className="font-sans text-xs text-stone-600">
                            {order.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-serif text-sm font-semibold text-clay-600">{formatPrice(order.total)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={async (e) => {
                              try {
                                await apiService.updateOrderStatus(order.id, e.target.value);
                                setOrders((prev) =>
                                  prev.map((o) =>
                                    o.id === order.id ? { ...o, status: e.target.value as import('../types').OrderStatus } : o
                                  )
                                );
                                showToast('Estado actualizado', 'success');
                              } catch {
                                showToast('Error al actualizar estado', 'error');
                              }
                            }}
                            className={`font-sans text-xs px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-clay-300 cursor-pointer ${
                              order.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              order.status === 'confirmed' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                              order.status === 'shipped' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                              order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                              'bg-stone-50 border-stone-200 text-stone-600'
                            }`}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell font-sans text-xs text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit', month: '2-digit', year: '2-digit',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Categories tab ── */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            {categoryOptions.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-serif text-lg text-stone-400">No hay categorías. Creá una nueva.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100 bg-cream-50">
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3">Nombre</th>
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Slug</th>
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Orden</th>
                      <th className="text-left font-sans text-xs font-semibold text-stone-500 uppercase tracking-wider px-5 py-3">Estado</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...categoryOptions].sort((a, b) => a.order - b.order).map((cat) => (
                      <tr key={cat.id} className="border-b border-stone-50 hover:bg-cream-50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-sans text-sm font-medium text-bark-800">{cat.label}</span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="font-mono text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{cat.slug}</span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="font-sans text-sm text-stone-500">{cat.order}</span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleCatActive(cat)}
                            className={`inline-flex items-center gap-1 font-sans text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                              cat.active
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                            title={cat.active ? 'Clic para desactivar' : 'Clic para activar'}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.active ? 'bg-green-500' : 'bg-stone-400'}`} />
                            {cat.active ? 'Activa' : 'Inactiva'}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => openEditCatModal(cat)}
                              className="text-stone-400 hover:text-clay-600 transition-colors focus:outline-none"
                              aria-label={`Editar ${cat.label}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteCatId(cat.id)}
                              className="text-stone-400 hover:text-red-500 transition-colors focus:outline-none"
                              aria-label={`Eliminar ${cat.label}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Product modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50" onClick={closeModal} aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-bark-800">
                {editingProduct ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <button onClick={closeModal} className="text-stone-400 hover:text-stone-600 transition-colors focus:outline-none" aria-label="Cerrar modal">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Taza Espresso Terracota"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 focus:border-clay-300"
                />
                {formErrors.name && <p className="font-sans text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Precio (ARS) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="3500"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300"
                  />
                  {formErrors.price && <p className="font-sans text-xs text-red-500 mt-1">{String(formErrors.price)}</p>}
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300"
                  />
                  {formErrors.stock && <p className="font-sans text-xs text-red-500 mt-1">{String(formErrors.stock)}</p>}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 bg-white"
                >
                  {categoryOptions.filter((c) => c.active).map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto..."
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 resize-none"
                />
                {formErrors.description && <p className="font-sans text-xs text-red-500 mt-1">{formErrors.description}</p>}
              </div>

              {/* Image */}
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Imagen *</label>
                {imagePreview && (
                  <div className="mb-2 w-full h-40 rounded-lg overflow-hidden bg-cream-100 border border-stone-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-lg px-4 py-5 text-center cursor-pointer transition-colors ${
                    isUploadingImage ? 'border-clay-300 bg-clay-50' : 'border-stone-200 hover:border-clay-300 hover:bg-cream-50'
                  }`}
                >
                  {isUploadingImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-clay-500 border-t-transparent rounded-full animate-spin" />
                      <span className="font-sans text-sm text-clay-600">Subiendo imagen...</span>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-6 h-6 text-stone-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="font-sans text-sm text-stone-500">{imagePreview ? 'Cambiar imagen' : 'Subir imagen'}</p>
                      <p className="font-sans text-xs text-stone-400 mt-0.5">JPG, PNG o WEBP · máx 5 MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {(imageError || formErrors.image) && (
                  <p className="font-sans text-xs text-red-500 mt-1">{imageError || formErrors.image}</p>
                )}
              </div>

              {/* Additional Images */}
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                  Imágenes adicionales
                  <span className="font-normal normal-case text-stone-400 ml-1">(hasta 5)</span>
                </label>

                {extraImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {extraImages.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-stone-200 group/thumb">
                        <img src={url} alt={`Extra ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setExtraImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-stone-900/50 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-lg font-bold"
                          aria-label="Eliminar imagen"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {extraImages.length < 5 && (
                  <div
                    onClick={() => extraFileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-lg px-4 py-3 text-center cursor-pointer transition-colors ${
                      isUploadingExtra
                        ? 'border-clay-300 bg-clay-50'
                        : 'border-stone-200 hover:border-clay-300 hover:bg-cream-50'
                    }`}
                  >
                    {isUploadingExtra ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-clay-500 border-t-transparent rounded-full animate-spin" />
                        <span className="font-sans text-sm text-clay-600">Subiendo...</span>
                      </div>
                    ) : (
                      <p className="font-sans text-sm text-stone-500">+ Agregar imagen ({extraImages.length}/5)</p>
                    )}
                  </div>
                )}
                <input
                  ref={extraFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleExtraImageChange}
                  className="hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-stone-300 text-stone-600 hover:border-stone-400 font-sans text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-clay-500 hover:bg-clay-600 disabled:bg-stone-300 text-white font-sans text-sm font-semibold py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400"
                >
                  {isSubmitting ? 'Guardando...' : editingProduct ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Product delete confirm ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50" onClick={() => setDeleteId(null)} aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-serif text-lg font-semibold text-bark-800 mb-2">¿Desactivar producto?</h3>
            <p className="font-sans text-sm text-stone-500 mb-5">
              El producto se desactivará y no será visible en la tienda. Podés reactivarlo editándolo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-stone-300 text-stone-600 font-sans text-sm font-medium py-2.5 rounded-xl transition-colors hover:border-stone-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-sans text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Category modal ── */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50" onClick={closeCatModal} aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-bark-800">
                {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <button onClick={closeCatModal} className="text-stone-400 hover:text-stone-600 transition-colors focus:outline-none" aria-label="Cerrar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCatSubmit} className="px-6 py-5 space-y-4">
              {/* Label */}
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={catForm.label}
                  onChange={(e) => setCatForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="Ej: Tazas"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300"
                />
                {catFormErrors.label && <p className="font-sans text-xs text-red-500 mt-1">{catFormErrors.label}</p>}
              </div>

              {/* Slug (read-only when editing) */}
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                  Slug *{!editingCategory && <span className="font-normal normal-case text-stone-400 ml-1">(se genera automáticamente)</span>}
                </label>
                <input
                  type="text"
                  value={catForm.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setCatForm((prev) => ({ ...prev, slug: e.target.value }));
                  }}
                  placeholder="ej: set_vajilla"
                  readOnly={!!editingCategory}
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-clay-300 ${
                    editingCategory ? 'bg-stone-50 border-stone-100 text-stone-400 cursor-not-allowed' : 'border-stone-200'
                  }`}
                />
                {catFormErrors.slug && <p className="font-sans text-xs text-red-500 mt-1">{catFormErrors.slug}</p>}
                {editingCategory && (
                  <p className="font-sans text-xs text-stone-400 mt-1">El slug no se puede modificar para no romper productos existentes.</p>
                )}
              </div>

              {/* Order */}
              <div>
                <label className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">Orden de visualización</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={catForm.order}
                  onChange={(e) => setCatForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-clay-300"
                />
                <p className="font-sans text-xs text-stone-400 mt-1">Número menor aparece primero en la tienda.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCatModal}
                  className="flex-1 border border-stone-300 text-stone-600 hover:border-stone-400 font-sans text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCat}
                  className="flex-1 bg-clay-500 hover:bg-clay-600 disabled:bg-stone-300 text-white font-sans text-sm font-semibold py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400"
                >
                  {isSavingCat ? 'Guardando...' : editingCategory ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Category delete confirm ── */}
      {deleteCatId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50" onClick={() => setDeleteCatId(null)} aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-serif text-lg font-semibold text-bark-800 mb-2">¿Eliminar categoría?</h3>
            <p className="font-sans text-sm text-stone-500 mb-5">
              Solo se puede eliminar si ningún producto la está usando. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteCatId(null)}
                className="flex-1 border border-stone-300 text-stone-600 font-sans text-sm font-medium py-2.5 rounded-xl transition-colors hover:border-stone-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCat(deleteCatId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-sans text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
