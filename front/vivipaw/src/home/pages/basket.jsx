import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBasket,
  Trash2,
  Minus,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Truck,
  ArrowRight,
  Package,
  Store,
  CreditCard,
  Banknote,
} from 'lucide-react';

import { orderApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CITIES, PLACEHOLDER_PRODUCT } from '../../utils/constants';
import { formatPrice } from '../../utils/helpers';

const FREE_SHIPPING_LIMIT = 50;
const SHIPPING_FEE = 5;

const getName = (it) => it.productName || it.name || 'Məhsul';

const getImg = (it) =>
  it.productImageUrl || it.imageUrl || PLACEHOLDER_PRODUCT;

const getPrice = (it) => it.unitPrice ?? it.price ?? 0;

const getShop = (it) => it.shopName || it.petShopName || '';

/* ═══════════ CHECKOUT MODALI ═══════════ */
// const CheckoutModal = ({ subTotal, onClose, onSuccess }) => {
//   const { user } = useAuth();

//   const [form, setForm] = useState({
//     shippingFullName: user?.fullName || '',
//     shippingPhone: '',
//     shippingCity: 'Bakı',
//     shippingAddress: '',
//     note: '',
//   });




const CheckoutModal = ({ subTotal, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    shippingFullName: user?.fullName || '',
    shippingPhone: '',
    shippingCity: 'Bakı',
    shippingAddress: '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [card, setCard] = useState({
    holderName: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fee = subTotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
  const total = subTotal + fee;

  const inputCls = (hasError) =>
    `w-full bg-slate-50 border rounded-xl px-3.5 py-3 text-sm font-medium outline-none transition ${
      hasError
        ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
        : 'border-slate-200 focus:border-sky-500 focus:bg-white'
    }`;

  const labelCls =
    'text-[11px] font-bold uppercase tracking-wider text-slate-400';

  const ErrorText = ({ text }) =>
    text ? (
      <p className="text-[10px] font-semibold text-rose-500 mt-1 flex items-center gap-1">
        <AlertCircle size={11} />
        {text}
      </p>
    ) : null;

  const validate = () => {
    const nextErrors = {};

    if (!form.shippingFullName.trim()) {
      nextErrors.shippingFullName = 'Ad və soyad daxil edilməlidir.';
    }

    if (!form.shippingPhone.trim()) {
      nextErrors.shippingPhone = 'Telefon nömrəsi daxil edilməlidir.';
    } else if (form.shippingPhone.length !== 10) {
      nextErrors.shippingPhone = 'Telefon nömrəsi 10 rəqəm olmalıdır.';
    }

    if (!form.shippingAddress.trim()) {
      nextErrors.shippingAddress = 'Çatdırılma ünvanını daxil edin.';
    }

    if (paymentMethod === 'card') {
      const cardNumber = card.number.replace(/\s/g, '');

      if (!card.holderName.trim()) {
        nextErrors.holderName = 'Kart sahibinin adını yazın.';
      }

      if (!cardNumber) {
        nextErrors.number = 'Kart nömrəsini daxil edin.';
      } else if (cardNumber.length !== 16) {
        nextErrors.number = 'Kart nömrəsi 16 rəqəmdən ibarət olmalıdır.';
      }

      if (!card.expiry) {
        nextErrors.expiry = 'Son istifadə tarixini daxil edin.';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
        nextErrors.expiry = 'Format düzgün deyil. Məsələn: 08/28';
      }

      if (!card.cvv) {
        nextErrors.cvv = 'CVV kodunu daxil edin.';
      } else if (card.cvv.length !== 3) {
        nextErrors.cvv = 'CVV 3 rəqəmdən ibarət olmalıdır.';
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        shippingFullName: form.shippingFullName.trim(),
        shippingPhone: form.shippingPhone.trim(),
        shippingCity: form.shippingCity,
        shippingAddress: form.shippingAddress.trim(),
        note: form.note.trim(),

        // Backend enum:
        // 1 = CashOnDelivery
        // 2 = Card
        paymentMethod: paymentMethod === 'card' ? 2 : 1,
      };

      const res = await orderApi.checkout(payload);

      if (res?.success) {
        onSuccess(res.data);
      } else {
        setErrors({
          general: res?.message || 'Sifariş yaradılmadı.',
        });
      }
    } catch (err) {
      setErrors({
        general: getError(err, 'Sifariş yaradılmadı.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const setFormField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
      general: '',
    }));
  };

  const setCardField = (field, value) => {
    setCard((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
      general: '',
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
      onClick={!loading ? onClose : undefined}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlıq */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
              <Truck size={22} />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Sifarişi tamamla
              </h3>

              <p className="text-[11px] text-slate-400">
                Çatdırılma və ödəniş məlumatları
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          {errors.general && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {errors.general}
            </div>
          )}

          {/* Çatdırılma məlumatları */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-sky-100 text-sky-600 rounded-lg grid place-items-center text-[11px] font-black">
                1
              </div>

              <h4 className="text-sm font-black text-slate-900">
                Çatdırılma məlumatları
              </h4>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Ad Soyad *</label>

                <input
                  value={form.shippingFullName}
                  onChange={(e) =>
                    setFormField('shippingFullName', e.target.value)
                  }
                  placeholder="Ad Soyad"
                  className={inputCls(errors.shippingFullName)}
                />

                <ErrorText text={errors.shippingFullName} />
              </div>

              <div>
                <label className={labelCls}>Telefon *</label>

                <input
                  value={form.shippingPhone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10);

                    setFormField('shippingPhone', value);
                  }}
                  inputMode="numeric"
                  placeholder="0501234567"
                  maxLength={10}
                  className={inputCls(errors.shippingPhone)}
                />

                {!errors.shippingPhone && form.shippingPhone && (
                  <p
                    className={`text-[10px] font-semibold mt-1 ${
                      form.shippingPhone.length === 10
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {form.shippingPhone.length}/10 rəqəm
                  </p>
                )}

                <ErrorText text={errors.shippingPhone} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Şəhər *</label>

              <select
                value={form.shippingCity}
                onChange={(e) =>
                  setFormField('shippingCity', e.target.value)
                }
                className={inputCls(false) + ' cursor-pointer'}
              >
                {CITIES.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Ünvan *</label>

              <input
                value={form.shippingAddress}
                onChange={(e) =>
                  setFormField('shippingAddress', e.target.value)
                }
                placeholder="Küçə, bina, mənzil"
                className={inputCls(errors.shippingAddress)}
              />

              <ErrorText text={errors.shippingAddress} />
            </div>

            <div>
              <label className={labelCls}>Qeyd (istəyə bağlı)</label>

              <textarea
                value={form.note}
                onChange={(e) => setFormField('note', e.target.value)}
                rows={2}
                placeholder="Kuryer üçün əlavə qeyd..."
                className={inputCls(false) + ' resize-none'}
              />
            </div>
          </section>

          {/* Ödəniş üsulu */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-sky-100 text-sky-600 rounded-lg grid place-items-center text-[11px] font-black">
                2
              </div>

              <h4 className="text-sm font-black text-slate-900">
                Ödəniş üsulu
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash');
                  setErrors((prev) => ({
                    ...prev,
                    holderName: '',
                    number: '',
                    expiry: '',
                    cvv: '',
                  }));
                }}
                className={`relative p-4 rounded-2xl border text-left transition ${
                  paymentMethod === 'cash'
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {paymentMethod === 'cash' && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-sky-600 text-white rounded-full grid place-items-center">
                    <CheckCircle2 size={13} />
                  </div>
                )}

                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${
                    paymentMethod === 'cash'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Banknote size={21} />
                </div>

                <p className="text-xs font-black text-slate-900">
                  Qapıda nağd
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  Çatdırılma zamanı ödəyin
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('card');
                  setErrors((prev) => ({
                    ...prev,
                    general: '',
                  }));
                }}
                className={`relative p-4 rounded-2xl border text-left transition ${
                  paymentMethod === 'card'
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-100'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {paymentMethod === 'card' && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-sky-600 text-white rounded-full grid place-items-center">
                    <CheckCircle2 size={13} />
                  </div>
                )}

                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${
                    paymentMethod === 'card'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <CreditCard size={21} />
                </div>

                <p className="text-xs font-black text-slate-900">
                  Kartla ödəniş
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  Demo ödəniş formu
                </p>
              </button>
            </div>
          </section>

          {/* Kart bölməsi */}
          {paymentMethod === 'card' && (
            <section className="space-y-4">
              {/* Kartın görünüşü */}
              <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white shadow-lg shadow-sky-600/25">
                <div className="absolute -top-10 -right-8 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-16 -left-8 w-40 h-40 bg-white/10 rounded-full" />

                <div className="relative flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest">
                    VIVIPAW
                  </span>

                  <CreditCard size={26} className="opacity-90" />
                </div>

                <div className="relative mt-7">
                  <p className="text-lg sm:text-xl tracking-[0.18em] font-mono font-semibold">
                    {card.number || '•••• •••• •••• ••••'}
                  </p>
                </div>

                <div className="relative flex items-end justify-between mt-6">
                  <div>
                    <p className="text-[8px] uppercase opacity-70">
                      Kart sahibi
                    </p>

                    <p className="text-xs font-bold uppercase tracking-wide mt-1">
                      {card.holderName || 'AD SOYAD'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase opacity-70">
                      Son istifadə
                    </p>

                    <p className="text-xs font-bold mt-1">
                      {card.expiry || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>



              <div>
                <label className={labelCls}>Kart sahibinin adı *</label>

                <input
                  value={card.holderName}
                  onChange={(e) =>
                    setCardField(
                      'holderName',
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="AD SOYAD"
                  autoComplete="off"
                  className={inputCls(errors.holderName)}
                />

                <ErrorText text={errors.holderName} />
              </div>

              <div>
                <label className={labelCls}>Kart nömrəsi *</label>

                <input
                  value={card.number}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 16);

                    const formatted = digits
                      .replace(/(\d{4})(?=\d)/g, '$1 ')
                      .trim();

                    setCardField('number', formatted);
                  }}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="4169 0000 0000 0000"
                  maxLength={19}
                  className={inputCls(errors.number)}
                />

                <ErrorText text={errors.number} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Son istifadə *</label>

                  <input
                    value={card.expiry}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 4);

                      const formatted =
                        digits.length > 2
                          ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                          : digits;

                      setCardField('expiry', formatted);
                    }}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="08/28"
                    maxLength={5}
                    className={inputCls(errors.expiry)}
                  />

                  <ErrorText text={errors.expiry} />
                </div>

                <div>
                  <label className={labelCls}>CVV *</label>

                  <input
                    type="password"
                    value={card.cvv}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 3);

                      setCardField('cvv', value);
                    }}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="•••"
                    maxLength={3}
                    className={inputCls(errors.cvv)}
                  />

                  <ErrorText text={errors.cvv} />
                </div>
              </div>
            </section>
          )}

          {/* Sifariş xülasəsi */}
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Ara cəm</span>
              <span>{formatPrice(subTotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Çatdırılma</span>

              <span className={fee === 0 ? 'text-emerald-600 font-bold' : ''}>
                {fee === 0 ? 'Pulsuz' : formatPrice(fee)}
              </span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 pt-3 mt-2 border-t border-slate-200">
              <span>Cəmi</span>
              <span>{formatPrice(total)}</span>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-600/20"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : paymentMethod === 'card' ? (
              <>
                <CreditCard size={17} />
                Demo ödənişi tamamla · {formatPrice(total)}
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Sifarişi təsdiqlə · {formatPrice(total)}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};






/* ═══════════ SƏBƏT SƏHİFƏSİ ═══════════ */
const Basket = () => {
  const {
    cart,
    loading,
    refresh,
    updateItem,
    removeItem,
    clearCart,
  } = useCart();

  const [checkout, setCheckout] = useState(false);
  const [order, setOrder] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const items = cart?.items || [];

  const subTotal =
    cart?.subTotal ??
    items.reduce(
      (sum, item) => sum + getPrice(item) * (item.quantity || 1),
      0
    );

  const fee = subTotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;

  const changeQty = async (item, delta) => {
    const next = (item.quantity || 1) + delta;

    if (next < 1) return;

    setActingId(item.id);

    try {
      await updateItem(item.id, next);
    } catch (err) {
      showToast(getError(err, 'Yenilənmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const remove = async (item) => {
    setActingId(item.id);

    try {
      await removeItem(item.id);
      showToast('Məhsul silindi');
    } catch (err) {
      showToast(getError(err, 'Silinmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      showToast('Səbət təmizləndi');
    } catch {
      showToast('Səbət təmizlənmədi.');
    }
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

          <h2 className="text-2xl font-black text-slate-900">
            Sifarişiniz qəbul olundu! 🎉
          </h2>

          <p className="text-sm text-slate-500">
            Sifariş nömrəniz:{' '}
            <span className="font-black text-slate-900">
              {order?.orderNumber || order?.id || '—'}
            </span>
          </p>

          <p className="text-xs text-slate-400">
            Mağaza sifarişi təsdiqlədikdən sonra statusunu izləyə bilərsiniz.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              to="/my-orders"
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Package size={15} />
              Sifarişlərim
            </Link>

            <Link
              to="/shop"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
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
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-28 bg-white rounded-2xl animate-pulse"
              />
            ))}
          </div>

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

          <h2 className="text-xl font-bold text-slate-900">
            Səbətiniz boşdur
          </h2>

          <p className="text-sm text-slate-500">
            Mağazaya keçib sevimli dostunuz üçün nəsə seçin!
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-sky-600/20"
          >
            Mağazaya Keçid
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {checkout && (
        <CheckoutModal
          subTotal={subTotal}
          onClose={() => setCheckout(false)}
          onSuccess={onOrderSuccess}
        />
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
              <ShoppingBasket className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Səbətim
              </h1>

              <p className="text-sm text-slate-500 mt-0.5">
                <span className="font-bold text-sky-600">
                  {items.length}
                </span>{' '}
                məhsul
              </p>
            </div>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 px-4 py-2.5 rounded-xl transition"
          >
            <Trash2 size={15} />
            Təmizlə
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* MƏHSULLAR */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow"
              >
                <Link
                  to={`/product/${item.productId}`}
                  className="shrink-0"
                >
                  <img
                    src={getImg(item)}
                    alt={getName(item)}
                    className="w-24 h-24 rounded-xl object-cover bg-slate-100"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/product/${item.productId}`}>
                        <h3 className="text-sm font-bold text-slate-900 truncate hover:text-sky-600 transition">
                          {getName(item)}
                        </h3>
                      </Link>

                      {getShop(item) && (
                        <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Store size={11} className="text-sky-500" />
                          {getShop(item)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => remove(item)}
                      disabled={actingId === item.id}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => changeQty(item, -1)}
                        disabled={
                          actingId === item.id || item.quantity <= 1
                        }
                        className="px-3 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="w-9 text-center text-xs font-black text-slate-900">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => changeQty(item, 1)}
                        disabled={actingId === item.id}
                        className="px-3 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {formatPrice(getPrice(item))} / ədəd
                      </p>

                      <p className="text-sm font-black text-slate-900">
                        {formatPrice(
                          getPrice(item) * (item.quantity || 1)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* XÜLASƏ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 sticky top-24 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">
              Sifariş xülasəsi
            </h3>

            {subTotal < FREE_SHIPPING_LIMIT && (
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-[11px] font-semibold text-sky-700">
                {formatPrice(FREE_SHIPPING_LIMIT - subTotal)} əlavə etsəniz,
                çatdırılma <b>pulsuz</b> olacaq!
              </div>
            )}

            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Ara cəm</span>
                <span>{formatPrice(subTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Truck size={13} />
                  Çatdırılma
                </span>

                <span
                  className={fee === 0 ? 'text-emerald-600 font-bold' : ''}
                >
                  {fee === 0 ? 'Pulsuz' : formatPrice(fee)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-900">Cəmi</span>

              <span className="text-xl font-black text-slate-900">
                {formatPrice(subTotal + fee)}
              </span>
            </div>

            <button
              onClick={() => setCheckout(true)}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
            >
              Sifarişi Tamamla
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Basket;




