import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, X, ImagePlus, AlertCircle, Save, Tag,
} from 'lucide-react';
import { productApi, categoryApi, uploadApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { CATEGORY_TYPE, PLACEHOLDER_PRODUCT } from '../../../utils/constants';
import { formatPrice } from '../../../utils/helpers';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

const EMPTY = {
  name: '', description: '', price: '', discountPrice: '', stockQuantity: '',
  brand: '', categoryId: '', targetAnimalCategoryId: '', isActive: true, imageUrls: [],
};

const fromList = (p, prodCats, animalCats) => ({
  name: p.name || '', description: p.description || '',
  price: p.price ?? '', discountPrice: p.discountPrice ?? '',
  stockQuantity: p.stockQuantity ?? '', brand: p.brand || '',
  categoryId: p.categoryId ? String(p.categoryId)
    : (prodCats.find((c) => c.name === p.categoryName)?.id ? String(prodCats.find((c) => c.name === p.categoryName).id) : ''),
  targetAnimalCategoryId: p.targetAnimalCategoryId ? String(p.targetAnimalCategoryId)
    : (animalCats.find((c) => c.name === (p.targetAnimalName || p.targetAnimalCategoryName))?.id
      ? String(animalCats.find((c) => c.name === (p.targetAnimalName || p.targetAnimalCategoryName)).id) : ''),
  isActive: p.isActive !== false,
  imageUrls: p.imageUrls || (p.mainImageUrl ? [p.mainImageUrl] : []),
});

/* ═══════════ FORM MODALI ═══════════ */
const ProductModal = ({ product, prodCats, animalCats, onClose, onDone, showToast }) => {
  const [form, setForm] = useState(product ? fromList(product, prodCats, animalCats) : EMPTY);
  const [loadingDetail, setLoadingDetail] = useState(!!product);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!product) return;
    let alive = true;
    setLoadingDetail(true);
    productApi.byId(product.id)
      .then((res) => {
        if (!alive || !res?.success || !res.data) return;
        const d = res.data;
        setForm({
          name: d.name ?? '',
          description: d.description ?? '',
          price: d.price ?? '',
          discountPrice: d.discountPrice ?? '',
          stockQuantity: d.stockQuantity ?? '',
          brand: d.brand || '',
          categoryId: d.categoryId ? String(d.categoryId)
            : (prodCats.find((c) => c.name === d.categoryName)?.id ? String(prodCats.find((c) => c.name === d.categoryName).id) : ''),
          targetAnimalCategoryId: d.targetAnimalCategoryId ? String(d.targetAnimalCategoryId)
            : (animalCats.find((c) => c.name === (d.targetAnimalName || d.targetAnimalCategoryName))?.id
              ? String(animalCats.find((c) => c.name === (d.targetAnimalName || d.targetAnimalCategoryName)).id) : ''),
          isActive: d.isActive !== false,
          imageUrls: d.imageUrls || (d.mainImageUrl ? [d.mainImageUrl] : []),
        });
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoadingDetail(false); });
    return () => { alive = false; };
  }, [product?.id, prodCats, animalCats]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const res = await uploadApi.multiple(files, 'products');
      const raw = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
      const urls = raw.map((d) => (typeof d === 'string' ? d : d.url)).filter(Boolean);
      setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }));
    } catch (e2) { showToast(getError(e2, 'Şəkillər yüklənmədi.')); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim() || !form.categoryId) return setErr('Ad və kateqoriya mütləqdir.');
    const price = Number(form.price);
    if (!price || price <= 0) return setErr('Qiymət düzgün daxil edilməlidir.');
    const discount = form.discountPrice !== '' && form.discountPrice !== null ? Number(form.discountPrice) : null;
    if (discount !== null && (isNaN(discount) || discount <= 0)) return setErr('Endirim qiyməti düzgün deyil.');
    if (discount !== null && discount >= price) return setErr('Endirim qiyməti əsas qiymətdən aşağı olmalıdır.');

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      discountPrice: discount,
      stockQuantity: Number(form.stockQuantity) || 0,
      brand: form.brand.trim() || null,
      categoryId: Number(form.categoryId),
      targetAnimalCategoryId: form.targetAnimalCategoryId ? Number(form.targetAnimalCategoryId) : null,
      isActive: form.isActive,
      imageUrls: form.imageUrls,
    };
    try {
      const res = product ? await productApi.update(product.id, payload) : await productApi.create(payload);
      if (res?.success) onDone(payload.isActive, product?.id);
      else setErr(res?.message || 'Yadda saxlanmadı.');
    } catch (e2) { setErr(getError(e2, 'Yadda saxlanmadı.')); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><X size={18} /></button>
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          {product ? 'Məhsulu redaktə et' : 'Yeni məhsul'}
          {loadingDetail && <span className="ml-2 text-xs text-sky-500 font-semibold">məlumatlar yüklənir...</span>}
        </h3>

        {err && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" /> {err}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1"><label className={labelCls}>Məhsul adı *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1"><label className={labelCls}>Kateqoriya *</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls + ' cursor-pointer'}>
                <option value="">Seçin...</option>
                {prodCats.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select></div>
            <div className="space-y-1"><label className={labelCls}>Hansı heyvan üçün</label>
              <select value={form.targetAnimalCategoryId} onChange={(e) => setForm({ ...form, targetAnimalCategoryId: e.target.value })} className={inputCls + ' cursor-pointer'}>
                <option value="">Ümumi</option>
                {animalCats.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select></div>
            <div className="space-y-1"><label className={labelCls}>Qiymət (₼) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Endirim qiyməti (₼)</label>
              <input type="number" min="0" step="0.01" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Stok sayı</label>
              <input type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Brend</label>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputCls} /></div>
          </div>

          {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <Tag size={12} /> Endirim: -{Math.round((1 - Number(form.discountPrice) / Number(form.price)) * 100)}%
            </p>
          )}

          <div className="space-y-1"><label className={labelCls}>Təsvir</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls + ' resize-none'} /></div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded accent-sky-600" />
            <span className="text-xs font-semibold text-slate-600">Satışda aktiv olsun</span>
          </label>

          <div className="space-y-2">
            <p className={labelCls}>Şəkillər</p>
            <div className="flex flex-wrap gap-2">
              {form.imageUrls.map((u, i) => (
                <div key={i} className="relative">
                  <img src={u} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, j) => j !== i) }))}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-1 rounded-full shadow"><X size={11} /></button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 hover:border-sky-400 grid place-items-center cursor-pointer text-slate-400 hover:text-sky-500 transition">
                {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-400 border-t-transparent" /> : <ImagePlus size={18} />}
                <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <button type="submit" disabled={saving || uploading || loadingDetail}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Save size={16} /> {product ? 'Yenilə' : 'Məhsul yarat'}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ═══════════ SİYAHı ═══════════ */
const ShopProducts = ({ showToast }) => {
  const [products, setProducts] = useState([]);
  const [prodCats, setProdCats] = useState([]);
  const [animalCats, setAnimalCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [acting, setActing] = useState(null);

  /* Hər məhsulun isActive dəyərini detail-dən yükləyib əlavə edirik */
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.mine();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);

      /* Hər məhsul üçün detail-dən isActive-i öyrən */
      const enriched = await Promise.all(
        list.map(async (p) => {
          /* Əgər siyahıda isActive artıq varsa, istifadə et */
          if (typeof p.isActive === 'boolean') return p;
          try {
            const detail = await productApi.byId(p.id);
            if (detail?.success && detail.data) {
              return { ...p, isActive: detail.data.isActive !== false };
            }
          } catch {}
          return { ...p, isActive: true }; /* fallback */
        })
      );

      setProducts(enriched);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchList();
    categoryApi.all(CATEGORY_TYPE.PRODUCT).then((r) => r?.success && setProdCats(r.data || [])).catch(() => {});
    categoryApi.all(CATEGORY_TYPE.PET).then((r) => r?.success && setAnimalCats(r.data || [])).catch(() => {});
  }, [fetchList]);

  const remove = async (id) => {
    setActing(id);
    try {
      const res = await productApi.remove(id);
      if (res?.success) { setProducts((p) => p.filter((x) => x.id !== id)); showToast('Məhsul silindi'); }
      else showToast(res?.message || 'Silinmədi.');
    } catch (e) { showToast(getError(e, 'Silinmədi.')); }
    finally { setActing(null); setDeleteId(null); }
  };

  const stockBadge = (p) => {
    const s = p.stockQuantity ?? 0;
    if (s <= 0) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600">Stokda yoxdur</span>;
    if (s <= 5) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600">Son {s} ədəd</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">Stok: {s}</span>;
  };

  const handleDone = (isActive, productId) => {
    /* Redaktə edildikdə lokal state-i dərhal yenilə */
    if (productId) {
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, isActive } : p));
    }
    setModal(null);
    showToast(productId ? '✅ Məhsul yeniləndi' : '✅ Məhsul yaradıldı');
    fetchList();
  };

  return (
    <div className="space-y-4">
      {modal && (
        <ProductModal product={modal.product} prodCats={prodCats} animalCats={animalCats}
          onClose={() => setModal(null)} showToast={showToast}
          onDone={handleDone} />
      )}

      <div className="flex justify-end">
        <button onClick={() => setModal({ product: null })}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-md">
          <Plus size={16} /> Yeni məhsul
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-400 font-semibold">
          Hələ məhsulunuz yoxdur.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition">
              <div className="relative">
                <img src={p.mainImageUrl || PLACEHOLDER_PRODUCT} alt={p.name} className="w-full h-50 object-cover bg-slate-100" />
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm ${
                  p.isActive
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-900/80 text-white'
                }`}>
                  {p.isActive ? 'Aktiv' : 'Deaktiv'}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{p.name}</h4>
                  {stockBadge(p)}
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">{p.brand || 'Brendsiz'} • {p.categoryName || ''}</p>
                <div className="flex items-center gap-2">
                  {p.discountPrice ? (
                    <>
                      <span className="text-sm font-black text-slate-900">{formatPrice(p.discountPrice)}</span>
                      <span className="text-[11px] text-slate-400 line-through font-semibold">{formatPrice(p.price)}</span>
                    </>
                  ) : (
                    <span className="text-sm font-black text-slate-900">{formatPrice(p.price)}</span>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setModal({ product: p })}
                    className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1">
                    <Pencil size={12} /> Redaktə
                  </button>
                  {deleteId === p.id ? (
                    <button onClick={() => remove(p.id)} disabled={acting === p.id}
                      className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-rose-600 text-white transition disabled:opacity-50">
                      {acting === p.id ? '...' : 'Təsdiqlə'}
                    </button>
                  ) : (
                    <button onClick={() => setDeleteId(p.id)}
                      className="px-3 py-2 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                {deleteId === p.id && (
                  <button onClick={() => setDeleteId(null)} className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-600">Geri</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopProducts;