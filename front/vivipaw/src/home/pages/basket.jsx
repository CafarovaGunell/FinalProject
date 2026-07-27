import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBasket, Trash2, Minus, Plus, X, AlertCircle, CheckCircle2,
  Truck, MapPin, ArrowRight, Package, Store,
} from 'lucide-react';
import { orderApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CITIES, PLACEHOLDER_PRODUCT } from '../../utils/constants';
import { formatPrice } from '../../utils/helpers';

const FREE_SHIPPING_LIMIT = 50;
const SHIPPING_FEE = 5;

const getName  = (it) => it.productName || it.name || 'Məhsul';
const getImg   = (it) => it.productImageUrl || it.imageUrl || PLACEHOLDER_PRODUCT;
const getPrice = (it) => it.unitPrice ?? it.price ?? 0;
const getShop  = (it) => it.shopName || it.petShopName || '';

/* ═══════════ CHECKOUT MODALI ═══════════ */
const CheckoutModal = ({ subTotal, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    shippingFullName: user?.fullName || '',
    shippingPhone: '',
    shippingCity: 'Bakı',
    shippingAddress: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fee = subTotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.shippingFullName.trim() || !form.shippingPhone.trim() || !form.shippingAddress.trim()) {
      return setError('Ad, telefon və ünvan mütləq doldurulmalıdır.');
    }
    setLoading(true);
    try {
      const res = await orderApi.checkout(form);
      if (res?.success) onSuccess(res.data);
      else setError(res?.message || 'Sifariş yaradılmadı.');
    } catch (err) {
      setError(getError(err, 'Sifariş yaradılmadı.'));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition';
  const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-10">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl"><Truck size={22} /></div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Çatdırılma məlumatları</h3>
            <p className="text-[11px] text-slate-400">Sifarişiniz bu ünvana göndəriləcək</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelCls}>Ad Soyad *</label>
              <input value={form.shippingFullName} onChange={(e) => setForm({ ...form, shippingFullName: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Telefon *</label>
              <input value={form.shippingPhone} onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })} placeholder="0501234567" className={inputCls} />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Şəhər</label>
            <select value={form.shippingCity} onChange={(e) => setForm({ ...form, shippingCity: e.target.value })} className={inputCls + ' cursor-pointer'}>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Ünvan *</label>
            <input value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
              placeholder="Küçə, bina, mənzil" className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Qeyd (isteğe bağlı)</label>
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2}
              placeholder="Kuryer üçün qeyd..." className={inputCls + ' resize-none'} />
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5 text-xs font-semibold text-slate-600">
            <div className="flex justify-between"><span>Ara cəm</span><span>{formatPrice(subTotal)}</span></div>
            <div className="flex justify-between">
              <span>Çatdırılma</span>
              <span className={fee === 0 ? 'text-emerald-600 font-bold' : ''}>{fee === 0 ? 'Pulsuz' : formatPrice(fee)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Cəmi</span><span>{formatPrice(subTotal + fee)}</span>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-600/20">
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><CheckCircle2 size={16} /> Sifarişi Təsdiqlə</>}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ═══════════ SƏHİFƏ ═══════════ */
const Basket = () => {
  const { cart, loading, refresh, updateItem, removeItem, clearCart } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [order, setOrder] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const items = cart?.items || [];
  const subTotal = cart?.subTotal ?? items.reduce((s, it) => s + getPrice(it) * (it.quantity || 1), 0);
  const fee = subTotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;

  const changeQty = async (it, delta) => {
    const next = (it.quantity || 1) + delta;
    if (next < 1) return;
    setActingId(it.id);
    try { await updateItem(it.id, next); }
    catch (e) { showToast(getError(e, 'Yenilənmədi.')); }
    finally { setActingId(null); }
  };

  const remove = async (it) => {
    setActingId(it.id);
    try { await removeItem(it.id); showToast('Məhsul silindi'); }
    catch (e) { showToast(getError(e, 'Silinmədi.')); }
    finally { setActingId(null); }
  };

  const handleClear = async () => {
    try { await clearCart(); showToast('Səbət təmizləndi'); }
    catch { showToast('Təmizlənmədi.'); }
  };

  const onOrderSuccess = async (data) => {
    setOrder(data);
    setCheckout(false);
    await refresh();
  };

  if (order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-md w-full space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full grid place-items-center mx-auto">
            <CheckCircle2 size={42} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Sifarişiniz qəbul olundu! 🎉</h2>
          <p className="text-sm text-slate-500">
            Sifariş nömrəniz: <span className="font-black text-slate-900">{order?.orderNumber || order?.id || '—'}</span>
          </p>
          <p className="text-xs text-slate-400">Mağaza sifarişi təsdiqlədikdən sonra statusunu izləyə bilərsiniz.</p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link to="/my-orders" className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
              <Package size={15} /> Sifarişlərim
            </Link>
            <Link to="/shop" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
              Alış-verişə davam et
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}</div>
          <div className="h-64 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md space-y-4">
          <div className="w-20 h-20 bg-sky-50 text-sky-400 rounded-full grid place-items-center mx-auto">
            <ShoppingBasket size={38} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Səbətiniz boşdur</h2>
          <p className="text-sm text-slate-500">Mağazaya keçib sevimli dostunuz üçün nəsə seçin!</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-sky-600/20">
            Mağazaya Keçid <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {checkout && <CheckoutModal subTotal={subTotal} onClose={() => setCheckout(false)} onSuccess={onOrderSuccess} />}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100"><ShoppingBasket className="w-7 h-7" /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Səbətim</h1>
              <p className="text-sm text-slate-500 mt-0.5"><span className="font-bold text-sky-600">{items.length}</span> məhsul</p>
            </div>
          </div>
          <button onClick={handleClear} className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 px-4 py-2.5 rounded-xl transition">
            <Trash2 size={15} /> Təmizlə
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* MƏHSULLAR */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((it) => (
              <div key={it.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow">
                <Link to={`/product/${it.productId}`} className="shrink-0">
                  <img src={getImg(it)} alt={getName(it)} className="w-24 h-24 rounded-xl object-cover bg-slate-100" />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/product/${it.productId}`}>
                        <h3 className="text-sm font-bold text-slate-900 truncate hover:text-sky-600 transition">{getName(it)}</h3>
                      </Link>
                      {getShop(it) && (
                        <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Store size={11} className="text-sky-500" /> {getShop(it)}
                        </p>
                      )}
                    </div>
                    <button onClick={() => remove(it)} disabled={actingId === it.id}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      <button onClick={() => changeQty(it, -1)} disabled={actingId === it.id || it.quantity <= 1}
                        className="px-3 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition"><Minus size={14} /></button>
                      <span className="w-9 text-center text-xs font-black text-slate-900">{it.quantity}</span>
                      <button onClick={() => changeQty(it, 1)} disabled={actingId === it.id}
                        className="px-3 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition"><Plus size={14} /></button>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 font-semibold">{formatPrice(getPrice(it))} / ədəd</p>
                      <p className="text-sm font-black text-slate-900">{formatPrice(getPrice(it) * (it.quantity || 1))}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* XÜLASƏ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 sticky top-24 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Sifariş xülasəsi</h3>

            {subTotal < FREE_SHIPPING_LIMIT && (
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-[11px] font-semibold text-sky-700">
                 {formatPrice(FREE_SHIPPING_LIMIT - subTotal)} əlavə etsəniz, çatdırılma <b>pulsuz</b> olacaq!
              </div>
            )}

            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between"><span>Ara cəm</span><span>{formatPrice(subTotal)}</span></div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1"><Truck size={13} /> Çatdırılma</span>
                <span className={fee === 0 ? 'text-emerald-600 font-bold' : ''}>{fee === 0 ? 'Pulsuz' : formatPrice(fee)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-900">Cəmi</span>
              <span className="text-xl font-black text-slate-900">{formatPrice(subTotal + fee)}</span>
            </div>

            <button onClick={() => setCheckout(true)}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20">
              Sifarişi Tamamla <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basket;