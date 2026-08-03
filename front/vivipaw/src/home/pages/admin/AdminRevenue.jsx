import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuSearch,
  LuCalendar,
  LuReceipt,
  LuWalletCards,
  LuTruck,
  LuUser,
  LuStore,
  LuMapPin,
  LuEye,
  LuX,
  LuPackage,
  LuStethoscope,
  LuClock,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import {
  ORDER_STATUS_TEXT,
  ORDER_STATUS_COLOR,
  APPOINTMENT_STATUS_TEXT,
  APPOINTMENT_STATUS_COLOR,
} from '../../../utils/constants';
import { formatPrice, formatDate, formatDateTime } from '../../../utils/helpers';
import { PageHeader, EmptyBox, Spinner, Badge, listFrom } from '../../components/admin/ui';

const ORDER_DELIVERED = 5;
const APPOINTMENT_COMPLETED = 3;

const orderDate = (o) => {
  const raw = o?.orderDate || o?.createdAt || o?.createdDate || o?.date;
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const m = String(o?.dateText || '').match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);

  return null;
};

const appointmentDate = (a) => {
  const raw = a?.startTime || a?.appointmentDate || a?.date || a?.createdAt;
  if (!raw) return null;

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isDeliveredOrder = (o) => {
  const text = String(o?.statusText || '').toLowerCase();
  return Number(o?.status) === ORDER_DELIVERED ||
    text.includes('delivered') ||
    text.includes('çatdır') ||
    text.includes('təhvil');
};

const isCompletedAppointment = (a) => {
  const text = String(a?.statusText || '').toLowerCase();
  return Number(a?.status) === APPOINTMENT_COMPLETED ||
    text.includes('completed') ||
    text.includes('tamam');
};

const amountOfAppointment = (a) => Number(a?.priceSnapshot || a?.servicePrice || a?.price || 0);
const amountOfOrder = (o) => Number(o?.totalAmount || 0);

const WideModal = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm p-4 lg:p-8 flex items-center justify-center"
      onMouseDown={onClose}
    >
      <div
        className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[2rem] shadow-2xl border border-slate-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h3 className="font-black text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-72px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, title, value, tone = 'sky' }) => {
  const tones = {
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl grid place-items-center ${tones[tone] || tones.sky}`}>
        <Icon size={21} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <p className="text-2xl font-black text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon size={15} className="text-slate-400 shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 break-words">
        {value || '—'}
      </p>
    </div>
  </div>
);

const AdminRevenue = () => {
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeF, setTypeF] = useState('');
  const [statusF, setStatusF] = useState('');
  const [revenueOnly, setRevenueOnly] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [detail, setDetail] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);

    const [ordersRes, apptsRes] = await Promise.all([
      adminApi.orders().catch(() => null),
      adminApi.appointments?.().catch(() => null),
    ]);

    setOrders(listFrom(ordersRes));
    setAppointments(listFrom(apptsRes));

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const rows = useMemo(() => {
    const orderRows = orders.map((o) => ({
      key: `order-${o.id}`,
      type: 'shop',
      raw: o,
      ref: o.orderNumber || `#${o.id}`,
      title: o.customerFullName || o.shippingFullName || '—',
      subtitle: o.petShopName || 'Mağaza satışı',
      provider: o.petShopName || '—',
      city: o.shippingCity,
      date: orderDate(o),
      dateText: o.dateText,
      amount: amountOfOrder(o),
      status: o.status,
      statusText: o.statusText || ORDER_STATUS_TEXT[o.status],
      isRevenue: isDeliveredOrder(o),
    }));

    const vetRows = appointments.map((a) => ({
      key: `vet-${a.id}`,
      type: 'vet',
      raw: a,
      ref: `Randevu #${a.id}`,
      title: a.customerFullName || '—',
      subtitle: a.serviceName || a.clinicName || 'Baytar xidməti',
      provider: a.veterinarianFullName || a.clinicName || '—',
      city: a.clinicCity,
      date: appointmentDate(a),
      dateText: a.startTime ? formatDateTime(a.startTime) : '',
      amount: amountOfAppointment(a),
      status: a.status,
      statusText: a.statusText || APPOINTMENT_STATUS_TEXT[a.status],
      isRevenue: isCompletedAppointment(a),
    }));

    return [...orderRows, ...vetRows].sort((a, b) => {
      const da = a.date ? a.date.getTime() : 0;
      const db = b.date ? b.date.getTime() : 0;
      return db - da;
    });
  }, [orders, appointments]);

  const shopRevenue = useMemo(() => {
    return orders.filter(isDeliveredOrder).reduce((sum, o) => sum + amountOfOrder(o), 0);
  }, [orders]);

  const vetRevenue = useMemo(() => {
    return appointments.filter(isCompletedAppointment).reduce((sum, a) => sum + amountOfAppointment(a), 0);
  }, [appointments]);

  const platformRevenue = shopRevenue + vetRevenue;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const f = from ? new Date(new Date(from).setHours(0, 0, 0, 0)) : null;
    const t = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : null;

    return rows.filter((r) => {
      const hay = [
        r.ref,
        r.title,
        r.subtitle,
        r.provider,
        r.city,
        r.statusText,
        r.type === 'shop' ? 'mağaza satış sifariş order' : 'baytar vet randevu appointment xidmət',
      ].filter(Boolean).join(' ').toLowerCase();

      if (q && !hay.includes(q)) return false;
      if (typeF && r.type !== typeF) return false;

      if (statusF) {
        const [kind, value] = statusF.split(':');
        if (kind !== r.type) return false;
        if (String(r.status) !== String(value)) return false;
      }

      if (revenueOnly && !r.isRevenue) return false;

      if (f || t) {
        if (!r.date) return false;
        if (f && r.date < f) return false;
        if (t && r.date > t) return false;
      }

      return true;
    });
  }, [rows, search, typeF, statusF, revenueOnly, from, to]);

  const filteredRevenue = useMemo(() => {
    return filtered
      .filter((r) => r.isRevenue)
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [filtered]);

  const orderItems = detail?.type === 'shop'
    ? (detail.raw.items || detail.raw.orderItems || detail.raw.orderDetails || [])
    : [];

  return (
    <div>
      <PageHeader
        title="Gəlir / Platforma həcmi"
        subtitle="Mağaza satışları və baytar xidmətləri üzrə hesabat"
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <SummaryCard
          icon={LuWalletCards}
          title="Ümumi platforma həcmi"
          value={formatPrice(platformRevenue)}
          tone="emerald"
        />
        <SummaryCard
          icon={LuStore}
          title="Mağaza satış həcmi"
          value={formatPrice(shopRevenue)}
          tone="sky"
        />
        <SummaryCard
          icon={LuStethoscope}
          title="Baytar xidmət həcmi"
          value={formatPrice(vetRevenue)}
          tone="violet"
        />
        <SummaryCard
          icon={LuReceipt}
          title="Qeydlər"
          value={rows.length}
          tone="amber"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 space-y-3">
        <div className="flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1">
            <LuSearch
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sifariş, randevu, müştəri, mağaza, baytar, xidmət..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={typeF}
            onChange={(e) => {
              setTypeF(e.target.value);
              setStatusF('');
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="">Bütün tiplər</option>
            <option value="shop">Mağaza satışları</option>
            <option value="vet">Baytar xidmətləri</option>
          </select>

          <select
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="">Bütün statuslar</option>

            {(typeF === '' || typeF === 'shop') && (
              <optgroup label="Sifariş statusları">
                {Object.entries(ORDER_STATUS_TEXT).map(([v, l]) => (
                  <option key={`shop-${v}`} value={`shop:${v}`}>{l}</option>
                ))}
              </optgroup>
            )}

            {(typeF === '' || typeF === 'vet') && (
              <optgroup label="Randevu statusları">
                {Object.entries(APPOINTMENT_STATUS_TEXT).map(([v, l]) => (
                  <option key={`vet-${v}`} value={`vet:${v}`}>{l}</option>
                ))}
              </optgroup>
            )}
          </select>

          <div className="flex items-center gap-2">
            <LuCalendar size={15} className="text-slate-400 shrink-0" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500"
            />
            <span className="text-slate-300 font-black">—</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={revenueOnly}
              onChange={(e) => setRevenueOnly(e.target.checked)}
              className="accent-sky-600"
            />
            Yalnız gəlirə daxil olanlar — Delivered / Completed
          </label>

          <div className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            Filtr üzrə həcm: {formatPrice(filteredRevenue)}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyBox text="Hesabata uyğun qeyd tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">Qeyd</th>
                  <th className="px-5 py-3.5">Müştəri</th>
                  <th className="px-5 py-3.5 hidden lg:table-cell">Mənbə</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Tarix</th>
                  <th className="px-5 py-3.5">Məbləğ</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                  <th className="px-5 py-3.5 text-right w-12" />
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.key}
                    onClick={() => setDetail(r)}
                    className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 transition cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-sky-600">
                        {r.type === 'shop' ? <LuStore size={14} /> : <LuStethoscope size={14} />}
                        {r.ref}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {r.type === 'shop' ? 'Mağaza satışı' : 'Baytar xidməti'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <LuUser size={12} className="text-slate-400 shrink-0" />
                        {r.title || '—'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="font-semibold text-slate-500">
                        {r.provider || '—'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {r.subtitle || '—'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell text-slate-500 font-semibold text-xs">
                      {r.date ? formatDate(r.date) : (r.dateText || '—')}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-black text-slate-900">
                        {formatPrice(r.amount)}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {r.type === 'shop' ? (
                        <Badge className={ORDER_STATUS_COLOR[r.status] || 'bg-slate-100 text-slate-600 border-slate-200'}>
                          {r.statusText || '—'}
                        </Badge>
                      ) : (
                        <Badge className={APPOINTMENT_STATUS_COLOR[r.status] || 'bg-slate-100 text-slate-600 border-slate-200'}>
                          {r.statusText || '—'}
                        </Badge>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <LuEye size={15} className="text-slate-300 group-hover:text-sky-500 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <WideModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.type === 'shop' ? 'Sifariş' : 'Randevu'} — ${detail.ref}` : ''}
      >
        {detail && detail.type === 'shop' && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-4 gap-4">
              <SummaryCard icon={LuWalletCards} title="Məbləğ" value={formatPrice(detail.amount)} tone="emerald" />
              <SummaryCard icon={LuReceipt} title="Status" value={detail.statusText || '—'} tone="sky" />
              <SummaryCard icon={LuCalendar} title="Tarix" value={detail.date ? formatDate(detail.date) : '—'} tone="violet" />
              <SummaryCard icon={LuStore} title="Tip" value="Mağaza satışı" tone="amber" />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <LuUser size={14} />
                  Müştəri
                </p>
                <Info icon={LuUser} label="Ad Soyad" value={detail.raw.customerFullName || detail.raw.shippingFullName} />
                <Info icon={LuMapPin} label="Şəhər" value={detail.raw.shippingCity} />
                <Info icon={LuMapPin} label="Ünvan" value={detail.raw.shippingAddress} />
                <Info icon={LuReceipt} label="Telefon" value={detail.raw.shippingPhone || detail.raw.customerPhone} />
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <LuStore size={14} />
                  Mağaza / satış
                </p>
                <Info icon={LuStore} label="Mağaza" value={detail.raw.petShopName} />
                <Info icon={LuWalletCards} label="Gəlirə daxildir?" value={detail.isRevenue ? 'Bəli' : 'Xeyr'} />
                <Info icon={LuTruck} label="Çatdırılma" value={detail.raw.shippingCost != null ? formatPrice(detail.raw.shippingCost) : '—'} />
                <Info icon={LuCalendar} label="Tarix" value={detail.date ? formatDateTime(detail.date) : detail.dateText} />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <p className="text-xs font-black text-slate-900 flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <LuPackage size={14} />
                Məhsullar ({orderItems.length})
              </p>

              {orderItems.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs font-semibold text-slate-400">
                  Məhsul məlumatı yoxdur.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orderItems.map((it, i) => (
                    <div key={it.id || i} className="flex items-center gap-3 px-4 py-3">
                      {(it.productImageUrl || it.mainImageUrl) && (
                        <img
                          src={it.productImageUrl || it.mainImageUrl}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {it.productName || it.name || '—'}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {it.quantity} × {formatPrice(it.unitPrice ?? it.price)}
                        </p>
                      </div>

                      <p className="text-sm font-black text-slate-900">
                        {formatPrice(it.totalPrice ?? ((it.quantity || 0) * (it.unitPrice ?? it.price ?? 0)))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {detail && detail.type === 'vet' && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-4 gap-4">
              <SummaryCard icon={LuWalletCards} title="Məbləğ" value={formatPrice(detail.amount)} tone="emerald" />
              <SummaryCard icon={LuClock} title="Status" value={detail.statusText || '—'} tone="sky" />
              <SummaryCard icon={LuCalendar} title="Tarix" value={detail.date ? formatDate(detail.date) : '—'} tone="violet" />
              <SummaryCard icon={LuStethoscope} title="Tip" value="Baytar xidməti" tone="amber" />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <LuUser size={14} />
                  Müştəri
                </p>
                <Info icon={LuUser} label="Ad Soyad" value={detail.raw.customerFullName} />
                <Info icon={LuReceipt} label="Telefon" value={detail.raw.customerPhone} />
                <Info icon={LuPackage} label="Heyvan" value={detail.raw.petName} />
                <Info icon={LuPackage} label="Cins" value={detail.raw.petBreed} />
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <LuStethoscope size={14} />
                  Baytar / klinika
                </p>
                <Info icon={LuUser} label="Baytar" value={detail.raw.veterinarianFullName} />
                <Info icon={LuStethoscope} label="Klinika" value={detail.raw.clinicName} />
                <Info icon={LuMapPin} label="Şəhər" value={detail.raw.clinicCity} />
                <Info icon={LuMapPin} label="Ünvan" value={detail.raw.clinicAddress} />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 grid md:grid-cols-2 gap-4">
              <Info icon={LuStethoscope} label="Xidmət" value={detail.raw.serviceName} />
              <Info icon={LuWalletCards} label="Qiymət" value={formatPrice(detail.amount)} />
              <Info icon={LuCalendar} label="Başlama" value={detail.raw.startTime ? formatDateTime(detail.raw.startTime) : '—'} />
              <Info icon={LuClock} label="Bitmə" value={detail.raw.endTime} />
            </div>

            <p className="text-[11px] font-bold text-slate-400 text-center">
              Baytar gəliri yalnız Completed statuslu randevulardan hesablanır.
            </p>
          </div>
        )}
      </WideModal>
    </div>
  );
};

export default AdminRevenue;