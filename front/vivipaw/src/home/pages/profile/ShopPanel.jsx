import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Store, PawPrint, Package, ShoppingBasket, Save, Camera, AlertCircle,
  CheckCircle2, MapPin, Phone, Truck, Ban, ChevronRight,
} from 'lucide-react';
import { shopApi, orderApi, uploadApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CITIES, ORDER_STATUS_TEXT, ORDER_STATUS_COLOR, PLACEHOLDER_PRODUCT } from '../../../utils/constants';
import { formatPrice, formatDateTime } from '../../../utils/helpers';
import ShopPets from './ShopPets';
import ShopProducts from './ShopProducts';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

const NEXT_STATUS = { 1: 2, 2: 3, 3: 4, 4: 5 };
const NEXT_LABEL  = { 1: 'Təsdiqlə', 2: 'Hazırlanır', 3: 'Göndərildi', 4: 'Çatdırıldı' };

const getItems = (o) => o.items || o.orderItems || [];

/* ═══════════ MAĞAZA MƏLUMATLARI ═══════════ */
const ShopInfo = ({ shop, onSaved, showToast }) => {
  const [form, setForm] = useState({
    name: '', description: '', logoUrl: '', phone: '', email: '',
    instagram: '', websiteUrl: '', address: '', city: 'Bakı', taxNumber: '',
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || '', description: shop.description || '', logoUrl: shop.logoUrl || '',
        phone: shop.phone || '', email: shop.email || '', instagram: shop.instagram || '',
        websiteUrl: shop.websiteUrl || '', address: shop.address || '', city: shop.city || 'Bakı',
        taxNumber: shop.taxNumber || '',
      });
    }
    setLoaded(true);
  }, [shop]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.single(file, 'shops');
      const url = typeof res?.data === 'string' ? res.data : (res?.data?.url || res?.data?.logoUrl);
      if (url) setForm((f) => ({ ...f, logoUrl: url }));
    } catch (e2) { showToast(getError(e2, 'Loqo yüklənmədi.')); }
    finally { setUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) return setErr('Mağaza adı mütləqdir.');
    setSaving(true);
    try {
      const res = shop
        ? await shopApi.update({ ...shop, ...form })
        : await shopApi.create(form);
      if (res?.success) { showToast('✅ Mağaza məlumatları yeniləndi'); onSaved(res.data); }
      else setErr(res?.message || 'Yadda saxlanmadı.');
    } catch (e2) { setErr(getError(e2, 'Yadda saxlanmadı.')); }
    finally { setSaving(false); }
  };

  if (!loaded) return <div className="h-64 bg-white rounded-2xl animate-pulse" />;

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-3xl">
      {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" /> {err}</div>}

      <div className="flex items-center gap-4">
        <div className="relative">
          {form.logoUrl
            ? <img src={form.logoUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
            : <div className="w-20 h-20 rounded-2xl bg-sky-50 text-sky-500 grid place-items-center"><Store size={30} /></div>}
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="absolute -bottom-1.5 -right-1.5 bg-sky-600 text-white p-2 rounded-xl shadow-md hover:bg-sky-700 transition">
            {uploading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> : <Camera size={14} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Mağaza loqosu</p>
          <p className="text-[11px] text-slate-400">Kvadrat şəkil tövsiyə olunur</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1"><label className={labelCls}>Mağaza adı *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>VÖEN</label>
          <input value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Telefon</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>E-poçt</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Instagram</label>
          <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@shop" className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Şəhər</label>
          <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls + ' cursor-pointer'}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select></div>
      </div>
      <div className="space-y-1"><label className={labelCls}>Ünvan</label>
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} /></div>
      <div className="space-y-1"><label className={labelCls}>Website</label>
        <input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://..." className={inputCls} /></div>
      <div className="space-y-1"><label className={labelCls}>Təsvir</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls + ' resize-none'} /></div>

      <button type="submit" disabled={saving}
        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition flex items-center gap-2 disabled:opacity-50">
        {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Save size={15} /> Yadda saxla</>}
      </button>
    </form>
  );
};

/* ═══════════ GƏLƏN SİFARİŞLƏR ═══════════ */
const ShopOrders = ({ showToast }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.shopOrders();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      setOrders([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const setStatus = async (id, status) => {
    setActing(id);
    try {
      const res = await orderApi.setStatus(id, { status });
      if (res?.success) { showToast('✅ Status yeniləndi'); fetchList(); }
      else showToast(res?.message || 'Xəta.');
    } catch (e) { showToast(getError(e, 'Xəta.')); }
    finally { setActing(null); }
  };

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}</div>;
  if (orders.length === 0) return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-400 font-semibold">
      Hələ gələn sifariş yoxdur.
    </div>
  );

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const items = getItems(o);
        const next = NEXT_STATUS[o.status];
        return (
          <div key={o.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-900">{o.orderNumber || `#${o.id}`}</p>
                <p className="text-[11px] text-slate-400 font-semibold">{o.dateText || formatDateTime(o.createdAt)} • {o.shippingFullName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${ORDER_STATUS_COLOR[o.status]}`}>{ORDER_STATUS_TEXT[o.status]}</span>
                <span className="text-sm font-black text-slate-900">{formatPrice(o.totalAmount)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg"><MapPin size={11} /> {o.shippingCity}, {o.shippingAddress}</span>
              {o.shippingPhone && <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg"><Phone size={11} /> {o.shippingPhone}</span>}
            </div>

            <div className="space-y-1.5">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5">
                  <img src={it.productImageUrl || PLACEHOLDER_PRODUCT} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <p className="text-xs font-bold text-slate-700 flex-1 truncate">{it.productName}</p>
                  <p className="text-[11px] text-slate-400 font-bold">× {it.quantity}</p>
                </div>
              ))}
            </div>

            {(next || (o.status >= 1 && o.status <= 4)) && (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                {next && (
                  <button disabled={acting === o.id} onClick={() => setStatus(o.id, next)}
                    className="flex-1 py-2.5 rounded-xl text-[11px] font-bold bg-sky-600 hover:bg-sky-700 text-white transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                    <Truck size={13} /> {NEXT_LABEL[o.status]}
                  </button>
                )}
                {o.status <= 4 && (
                  <button disabled={acting === o.id} onClick={() => setStatus(o.id, 6)}
                    className="px-4 py-2.5 rounded-xl text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                    <Ban size={13} /> Ləğv
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════ PANEL QABIĞI ═══════════ */
const ShopPanel = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    shopApi.mine()
      .then((r) => { if (r?.success) setShop(r.data); })
      .catch(() => {})
      .finally(() => setLoadingShop(false));
  }, []);

  const tabs = [
    { v: 'info', l: 'Mağaza məlumatları', icon: Store },
    { v: 'pets', l: 'Heyvan elanlarım', icon: PawPrint },
    { v: 'products', l: 'Məhsullarım', icon: Package },
    { v: 'orders', l: 'Gələn sifarişlər', icon: ShoppingBasket },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}

      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit flex-wrap">
        {tabs.map(({ v, l, icon: Icon }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              tab === v ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}>
            <Icon size={14} /> {l}
          </button>
        ))}
      </div>

      {tab === 'info' && !loadingShop && (
        <ShopInfo shop={shop} showToast={showToast}
          onSaved={(d) => { setShop(d || shop); if (d?.approvalStatus) updateUser({ approvalStatus: d.approvalStatus }); }} />
      )}
      {tab === 'pets' && <ShopPets showToast={showToast} />}
      {tab === 'products' && <ShopProducts showToast={showToast} />}
      {tab === 'orders' && <ShopOrders showToast={showToast} />}
    </div>
  );
};

export default ShopPanel;