import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Store,
  PawPrint,
  HeartHandshake,
  Archive,
  Package,
  ShoppingBasket,
  Save,
  Camera,
  AlertCircle,
  MapPin,
  Phone,
  Truck,
  Ban,
  X,
  KeyRound,
} from 'lucide-react';
import {
  shopApi,
  orderApi,
  uploadApi,
  authApi,
} from '../../../services/endpoints';
import { getError } from '../../../services/api';
import {
  CITIES,
  ORDER_STATUS_TEXT,
  ORDER_STATUS_COLOR,
  PLACEHOLDER_PRODUCT,
} from '../../../utils/constants';
import { formatPrice, formatDateTime } from '../../../utils/helpers';

import ShopPets from './ShopPets';
import ShopProducts from './ShopProducts';
import ShopAdoptions from './ShopAdoptions';
import ShopArchive from './ShopArchive';

import StartChatButton from '../../components/chat/StartChatButton';
import { CHAT_TYPE } from '../../../utils/chat';

const inputCls =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition';

const labelCls =
  'text-[11px] font-bold uppercase tracking-wider text-slate-400';

const NEXT_STATUS = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
};

const NEXT_LABEL = {
  1: 'Təsdiqlə',
  2: 'Hazırlanır',
  3: 'Göndərildi',
  4: 'Çatdırıldı',
};

const getItems = (order) => order.items || order.orderItems || [];

const getOrderCustomerUserId = (order) =>
  order.customerUserId ||
  order.userId ||
  order.customerId ||
  order.buyerUserId ||
  order.applicantUserId ||
  order.ownerUserId;

/* ═══════════ MAĞAZA MƏLUMATLARI ═══════════ */
const ShopInfo = ({ shop, onSaved, showToast }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    logoUrl: '',
    phone: '',
    email: '',
    instagram: '',
    websiteUrl: '',
    address: '',
    city: 'Bakı',
    taxNumber: '',
  });

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || '',
        description: shop.description || '',
        logoUrl: shop.logoUrl || '',
        phone: shop.phone || '',
        email: shop.email || '',
        instagram: shop.instagram || '',
        websiteUrl: shop.websiteUrl || '',
        address: shop.address || '',
        city: shop.city || 'Bakı',
        taxNumber: shop.taxNumber || '',
      });
    }

    setLoaded(true);
  }, [shop]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const res = await uploadApi.single(file, 'shops');

      const url =
        typeof res?.data === 'string'
          ? res.data
          : (res?.data?.url || res?.data?.logoUrl || res?.data?.imageUrl);

      if (!url) {
        setError('Loqo yüklənmədi.');
        return;
      }

      setForm((prev) => ({
        ...prev,
        logoUrl: url,
      }));
    } catch (err) {
      setError(getError(err, 'Loqo yüklənmədi.'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      return setError('Mağaza adı mütləqdir.');
    }

    if (!form.email.trim()) {
      return setError('Mağaza e-poçtu mütləqdir.');
    }

    if (!form.phone || form.phone.length !== 10) {
      return setError(
        'Telefon nömrəsi 10 rəqəm olmalıdır. Məsələn: 0501112233'
      );
    }

    if (!form.address.trim()) {
      return setError('Mağaza ünvanı mütləqdir.');
    }

    setSaving(true);

    try {
      const payload = {
        ...(shop || {}),
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        instagram: form.instagram.trim(),
        websiteUrl: form.websiteUrl.trim(),
        taxNumber: form.taxNumber.trim(),
      };

      /*
        ƏSAS DÜZƏLİŞ:
        shop yoxdursa yeni PetShop profili yaradılır.
        shop varsa mövcud profil yenilənir.
      */
      const res = shop
        ? await shopApi.update(payload)
        : await shopApi.create(payload);

      if (!res?.success) {
        setError(
          res?.message ||
          (shop
            ? 'Mağaza məlumatları yenilənmədi.'
            : 'Mağaza profili yaradıla bilmədi.')
        );
        return;
      }

      const savedShop = {
        ...(res.data || {}),
        ...payload,
      };

      onSaved(savedShop);

      showToast(
        shop
          ? '✅ Mağaza məlumatları yeniləndi'
          : '✅ Mağaza profili yaradıldı. Admin təsdiqini gözləyin.'
      );
    } catch (err) {
      setError(
        getError(
          err,
          shop
            ? 'Mağaza məlumatları yenilənmədi.'
            : 'Mağaza profili yaradıla bilmədi.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return <div className="h-64 bg-white rounded-2xl animate-pulse" />;
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 max-w-4xl"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 grid place-items-center">
          <Store size={22} />
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900">
            Mağaza məlumatları
          </h2>

          <p className="text-xs text-slate-500">
            Müştərilərin görəcəyi biznes məlumatları.
          </p>
        </div>
      </div>

      {!shop && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          Mağaza profilinizi doldurun. Yadda saxladıqdan sonra admin təsdiqinə göndəriləcək.
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative">
          {form.logoUrl ? (
            <img
              src={form.logoUrl}
              alt={form.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-sky-50 text-sky-600 grid place-items-center">
              <Store size={30} />
            </div>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1.5 -right-1.5 bg-sky-600 text-white p-2 rounded-xl shadow-md hover:bg-sky-700 transition disabled:opacity-50"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            ) : (
              <Camera size={14} />
            )}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-900">Mağaza loqosu</p>
          <p className="text-[11px] text-slate-400">
            Məhsullarda və mağaza səhifəsində görünəcək.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelCls}>Mağaza adı *</label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            placeholder="Məsələn: Happy Paws"
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>VÖEN</label>
          <input
            value={form.taxNumber}
            onChange={(e) =>
              setForm({
                ...form,
                taxNumber: e.target.value,
              })
            }
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Mağaza telefonu *</label>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => {
              const phone = e.target.value
                .replace(/\D/g, '')
                .slice(0, 10);

              setForm({
                ...form,
                phone,
              });
            }}
            placeholder="0501112233"
            maxLength={10}
            className={inputCls}
          />

          <p
            className={`text-[10px] font-semibold ${
              form.phone.length === 10
                ? 'text-emerald-600'
                : 'text-slate-400'
            }`}
          >
            {form.phone.length}/10 rəqəm
          </p>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Mağaza e-poçtu *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            placeholder="magaza@example.com"
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Instagram</label>
          <input
            value={form.instagram}
            onChange={(e) =>
              setForm({
                ...form,
                instagram: e.target.value,
              })
            }
            placeholder="@magaza"
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Şəhər *</label>
          <select
            value={form.city}
            onChange={(e) =>
              setForm({
                ...form,
                city: e.target.value,
              })
            }
            className={inputCls + ' cursor-pointer'}
          >
            {CITIES.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Mağaza ünvanı *</label>
        <input
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
          placeholder="Küçə, bina, mərtəbə"
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Website</label>
        <input
          value={form.websiteUrl}
          onChange={(e) =>
            setForm({
              ...form,
              websiteUrl: e.target.value,
            })
          }
          placeholder="https://..."
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Mağaza haqqında</label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          rows={4}
          className={inputCls + ' resize-none'}
        />
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Save size={15} />
            {shop
              ? 'Mağaza məlumatlarını yadda saxla'
              : 'Mağaza profilini yarat'}
          </>
        )}
      </button>
    </form>
  );
};

/* ═══════════ HESAB TƏHLÜKƏSİZLİYİ ═══════════ */
const ShopSecurity = ({ showToast }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.currentPassword) {
      return setError('Cari parolu daxil edin.');
    }

    if (form.newPassword.length < 6) {
      return setError('Yeni parol ən azı 6 simvol olmalıdır.');
    }

    if (form.newPassword !== form.confirmPassword) {
      return setError('Yeni parollar uyğun gəlmir.');
    }

    setSaving(true);

    try {
      const res = await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.newPassword,
      });

      if (!res?.success) {
        setError(res?.message || 'Parol dəyişdirilmədi.');
        return;
      }

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showToast('✅ Parol uğurla dəyişdirildi');
    } catch (err) {
      setError(getError(err, 'Parol dəyişdirilmədi.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-xl bg-white border border-slate-200 rounded-3xl p-6 space-y-4"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center">
          <KeyRound size={20} />
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900">
            Hesab təhlükəsizliyi
          </h2>

          <p className="text-xs text-slate-500">
            Mağaza hesabınızın parolunu dəyişin.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className={labelCls}>Cari parol</label>
        <input
          type="password"
          value={form.currentPassword}
          onChange={(e) =>
            setForm({
              ...form,
              currentPassword: e.target.value,
            })
          }
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Yeni parol</label>
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) =>
            setForm({
              ...form,
              newPassword: e.target.value,
            })
          }
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Yeni parol (təkrar)</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({
              ...form,
              confirmPassword: e.target.value,
            })
          }
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <KeyRound size={15} />
            Parolu dəyiş
          </>
        )}
      </button>
    </form>
  );
};

/* ═══════════ GƏLƏN SİFARİŞLƏR ═══════════ */
const ShopOrders = ({ showToast }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      const res = await orderApi.shopOrders();

      const allOrders = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.items || []);

      const hiddenIds = JSON.parse(
        localStorage.getItem('hiddenShopOrderIds') || '[]'
      );

      const visibleOrders = allOrders.filter(
        (order) => !hiddenIds.includes(String(order.id))
      );

      setOrders(
        [...visibleOrders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    setActingId(orderId);

    try {
      const res = await orderApi.setStatus(orderId, { status });

      if (!res?.success) {
        showToast(res?.message || 'Status yenilənmədi.');
        return;
      }

      showToast('✅ Sifariş statusu yeniləndi');
      fetchOrders();
    } catch (err) {
      showToast(getError(err, 'Status yenilənmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const hideOrder = (order) => {
    const id = String(order.id);

    const previous = JSON.parse(
      localStorage.getItem('hiddenShopOrderIds') || '[]'
    );

    localStorage.setItem(
      'hiddenShopOrderIds',
      JSON.stringify([...new Set([...previous, id])])
    );

    setOrders((prev) =>
      prev.filter((item) => String(item.id) !== id)
    );

    setDeleteId(null);
    showToast('🗂️ Sifariş siyahıdan gizlədildi');
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-36 bg-white border border-slate-200 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center">
        <ShoppingBasket className="mx-auto text-slate-300 mb-3" size={36} />
        <p className="text-sm font-semibold text-slate-500">
          Hələ gələn sifariş yoxdur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const items = getItems(order);
        const nextStatus = NEXT_STATUS[order.status];
        const canHide = [4, 5, 6].includes(Number(order.status));

        return (
          <div
            key={order.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-900">
                  {order.orderNumber || `#${order.id}`}
                </p>

                <p className="text-[11px] text-slate-400 font-semibold">
                  {order.dateText || formatDateTime(order.createdAt)}
                  {' • '}
                  {order.shippingFullName}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${ORDER_STATUS_COLOR[order.status]}`}>
                  {ORDER_STATUS_TEXT[order.status]}
                </span>

                <span className="text-sm font-black text-slate-900">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                <MapPin size={11} />
                {order.shippingCity}, {order.shippingAddress}
              </span>

              {order.shippingPhone && (
                <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                  <Phone size={11} />
                  {order.shippingPhone}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5"
                >
                  <img
                    src={item.productImageUrl || PLACEHOLDER_PRODUCT}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />

                  <p className="flex-1 text-xs font-bold text-slate-700 truncate">
                    {item.productName}
                  </p>

                  <p className="text-[11px] font-bold text-slate-400">
                    × {item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
              <StartChatButton
                type={CHAT_TYPE.ORDER}
                orderId={order.id}
                targetUserId={getOrderCustomerUserId(order) || undefined}
                className="flex-1 min-w-[150px] py-2.5 rounded-xl"
              >
                Müştəriyə yaz
              </StartChatButton>

              {nextStatus && (
                <button
                  disabled={actingId === order.id}
                  onClick={() => updateStatus(order.id, nextStatus)}
                  className="flex-1 min-w-[145px] py-2.5 rounded-xl text-[11px] font-bold bg-sky-600 hover:bg-sky-700 text-white transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Truck size={13} />
                  {NEXT_LABEL[order.status]}
                </button>
              )}

              {[1, 2, 3, 4].includes(Number(order.status)) && (
                <button
                  disabled={actingId === order.id}
                  onClick={() => updateStatus(order.id, 6)}
                  className="px-4 py-2.5 rounded-xl text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Ban size={13} />
                  Ləğv et
                </button>
              )}

              {canHide && (
                deleteId === order.id ? (
                  <>
                    <button
                      onClick={() => hideOrder(order)}
                      className="px-4 py-2.5 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-900 text-white transition"
                    >
                      Bəli, gizlət
                    </button>

                    <button
                      onClick={() => setDeleteId(null)}
                      className="px-4 py-2.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    >
                      Geri
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDeleteId(order.id)}
                    className="px-4 py-2.5 rounded-xl text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <X size={13} />
                    Siyahıdan sil
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════ PANEL QABIĞI ═══════════ */
const ShopPanel = ({ initialTab }) => {
  const [tab, setTab] = useState(initialTab || 'info');
  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    shopApi.mine()
      .then((res) => {
        if (res?.success) {
          setShop(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingShop(false));
  }, []);

  const tabs = [
    { value: 'info', label: 'Mağaza məlumatları', icon: Store },
    { value: 'pets', label: 'Heyvan elanlarım', icon: PawPrint },
    { value: 'products', label: 'Məhsullarım', icon: Package },
    { value: 'orders', label: 'Gələn sifarişlər', icon: ShoppingBasket },
    { value: 'adoptions', label: 'Sahiblənmə müraciətləri', icon: HeartHandshake },
    { value: 'archive', label: 'Arxiv', icon: Archive },
    { value: 'security', label: 'Hesab təhlükəsizliyi', icon: KeyRound },
  ];

  if (loadingShop) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 pt-10">
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="h-36 bg-white rounded-3xl animate-pulse" />
          <div className="h-16 bg-white rounded-2xl animate-pulse" />
          <div className="h-80 bg-white rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          {shop?.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt={shop.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-sky-50 text-sky-600 grid place-items-center">
              <Store size={34} />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {shop?.name || 'Yeni mağaza'}
            </h1>

            {shop ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-semibold text-slate-500">
                {shop.email && <span>{shop.email}</span>}

                {shop.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-sky-500" />
                    {shop.phone}
                  </span>
                )}

                {shop.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-sky-500" />
                    {shop.city}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-amber-600 mt-2 font-semibold">
                Mağaza profilinizi dolduraraq admin təsdiqinə göndərin.
              </p>
            )}

            <p className="text-sm text-slate-500 mt-2">
              Məhsulları, heyvan elanlarını, sifarişləri və müraciətləri idarə edin.
            </p>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 flex-wrap">
          {tabs.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                tab === value
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <ShopInfo
            shop={shop}
            showToast={showToast}
            onSaved={(savedShop) => setShop(savedShop)}
          />
        )}

        {shop && tab === 'pets' && (
          <ShopPets
            shop={shop}
            showToast={showToast}
          />
        )}

        {shop && tab === 'products' && (
          <ShopProducts showToast={showToast} />
        )}

        {shop && tab === 'orders' && (
          <ShopOrders showToast={showToast} />
        )}

        {shop && tab === 'adoptions' && (
          <ShopAdoptions showToast={showToast} />
        )}

        {shop && tab === 'archive' && (
          <ShopArchive showToast={showToast} />
        )}

        {tab === 'security' && (
          <ShopSecurity showToast={showToast} />
        )}

        {!shop &&
          ['pets', 'products', 'orders', 'adoptions', 'archive'].includes(tab) && (
            <div className="bg-white border border-amber-200 rounded-2xl p-12 text-center">
              <Store className="mx-auto text-amber-400 mb-3" size={38} />
              <p className="text-sm font-bold text-slate-700">
                Əvvəl mağaza profilinizi yaradın.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                “Mağaza məlumatları” bölməsini doldurub yadda saxlayın.
              </p>
              <button
                onClick={() => setTab('info')}
                className="mt-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition"
              >
                Mağaza məlumatlarına keç
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default ShopPanel;