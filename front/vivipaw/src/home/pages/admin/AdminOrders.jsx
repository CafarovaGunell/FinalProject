import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LuMapPin, LuUser, LuSearch, LuStore, LuPhone, LuMail, LuCalendar,
  LuPackage, LuCreditCard, LuTruck, LuFileText, LuEye, LuLock, LuTrash2,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { ORDER_STATUS_TEXT, ORDER_STATUS_COLOR } from '../../../utils/constants';
import { formatPrice } from '../../../utils/helpers';
import { PageHeader, EmptyBox, Badge, Modal, listFrom } from '../../components/admin/ui';

const STATUS_FILTER = [
  { v: '', l: 'Hamısı' },
  ...Object.entries(ORDER_STATUS_TEXT).map(([v, l]) => ({ v: Number(v), l })),
];

const orderDate = (o) => {
  const raw = o?.orderDate || o?.createdAt || o?.createdDate || o?.date;
  if (raw) { const d = new Date(raw); if (!isNaN(d)) return d; }
  const m = String(o?.dateText || '').match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
};

const toInput = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon size={14} className="text-slate-400 shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-800 break-words">{value || '—'}</p>
    </div>
  </div>
);

const AdminOrders = () => {
  const [status, setStatus] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [detail, setDetail] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.orders(status === '' ? undefined : status).catch(() => null);
    const hidden = JSON.parse(localStorage.getItem('hiddenAdminOrderIds') || '[]');
    setList(listFrom(res).filter((o) => !hidden.includes(String(o.id))));
    setLoading(false);
  }, [status]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const f = from ? new Date(new Date(from).setHours(0, 0, 0, 0)) : null;
    const t = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : null;

    return list.filter((o) => {
      const hay = [o.orderNumber, o.customerFullName, o.shippingFullName,
        o.shippingPhone, o.shippingCity, o.petShopName, o.customerEmail]
        .filter(Boolean).join(' ').toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (!f && !t) return true;
      const d = orderDate(o);
      if (!d) return false;
      if (f && d < f) return false;
      if (t && d > t) return false;
      return true;
    });
  }, [list, search, from, to]);

  const quickRange = (days) => {
    const n = new Date();
    setTo(toInput(n));
    setFrom(toInput(new Date(n.getFullYear(), n.getMonth(), n.getDate() - days)));
  };

  const clearAll = () => {
    setSearch(''); setFrom(''); setTo(''); setStatus('');
    localStorage.removeItem('hiddenAdminOrderIds');
    fetchList();
  };

  const removeOrder = (o) => {
    const id = String(o.id);
    const prev = JSON.parse(localStorage.getItem('hiddenAdminOrderIds') || '[]');
    localStorage.setItem('hiddenAdminOrderIds', JSON.stringify([...new Set([...prev, id])]));
    setList((p) => p.filter((x) => String(x.id) !== id));
    setDeleteId(null);
    setDetail(null);
  };

  const items = detail ? (detail.items || detail.orderItems || detail.orderDetails || []) : [];
  const shops = [...new Set([detail?.petShopName, ...items.map((i) => i.petShopName || i.shopName)].filter(Boolean))];

  return (
    <div>
      <PageHeader
        title="Sifarişlər"
        subtitle={`${filtered.length} / ${list.length} sifariş`}
      >
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer">
          {STATUS_FILTER.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      </PageHeader>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Sifariş №, müştəri, telefon, şəhər, mağaza..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500" />
          </div>
          <div className="flex items-center gap-2">
            <LuCalendar size={15} className="text-slate-400 shrink-0" />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500" />
            <span className="text-slate-300 font-black">—</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[['Bu gün', 0], ['Son 7 gün', 7], ['Son 30 gün', 30], ['Son 90 gün', 90]].map(([l, d]) => (
            <button key={l} onClick={() => quickRange(d)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition">{l}</button>
          ))}
          <button onClick={clearAll}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition">Sıfırla</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyBox text="Sifariş tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">Sifariş №</th>
                  <th className="px-5 py-3.5">Müştəri</th>
                  <th className="px-5 py-3.5 hidden lg:table-cell">Mağaza</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Şəhər</th>
                  <th className="px-5 py-3.5">Məbləğ</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Tarix</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                  <th className="px-5 py-3.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} onClick={() => setDetail(o)}
                    className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 transition cursor-pointer group">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 font-mono text-xs group-hover:text-sky-600">{o.orderNumber}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <LuUser size={12} className="text-slate-400 shrink-0" />
                        {o.customerFullName || o.shippingFullName || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-semibold hidden lg:table-cell">
                      <span className="flex items-center gap-1"><LuStore size={12} /> {o.petShopName || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-semibold hidden md:table-cell">
                      <span className="flex items-center gap-1"><LuMapPin size={12} /> {o.shippingCity || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900">{formatPrice(o.totalAmount)}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-semibold text-xs hidden sm:table-cell">{o.dateText}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Badge className={ORDER_STATUS_COLOR[o.status] || 'bg-slate-100 text-slate-600 border-slate-200'}>
                        {o.statusText || ORDER_STATUS_TEXT[o.status] || '—'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <LuEye size={15} className="text-slate-300 group-hover:text-sky-500 transition inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!detail} onClose={() => { setDetail(null); setDeleteId(null); }} title={`Sifariş ${detail?.orderNumber || ''}`}>
        {detail && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ümumi məbləğ</p>
                <p className="text-2xl font-black text-slate-900">{formatPrice(detail.totalAmount)}</p>
              </div>
              <Badge className={ORDER_STATUS_COLOR[detail.status] || 'bg-slate-100 text-slate-600 border-slate-200'}>
                {detail.statusText || ORDER_STATUS_TEXT[detail.status] || '—'}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5"><LuUser size={13} /> Kim alıb</p>
                <Info icon={LuUser} label="Ad Soyad" value={detail.customerFullName || detail.shippingFullName} />
                <Info icon={LuMail} label="E-poçt" value={detail.customerEmail || detail.shippingEmail} />
                <Info icon={LuPhone} label="Telefon" value={detail.shippingPhone || detail.customerPhone} />
              </div>
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5"><LuStore size={13} /> Hansı mağazadan</p>
                <Info icon={LuStore} label="Mağaza" value={shops.join(', ')} />
                <Info icon={LuPhone} label="Mağaza telefonu" value={detail.petShopPhone} />
                <Info icon={LuCalendar} label="Sifariş tarixi" value={detail.dateText} />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 grid sm:grid-cols-2 gap-3">
              <p className="sm:col-span-2 text-xs font-black text-slate-900 flex items-center gap-1.5"><LuTruck size={13} /> Çatdırılma</p>
              <Info icon={LuUser} label="Alıcı" value={detail.shippingFullName} />
              <Info icon={LuMapPin} label="Şəhər" value={detail.shippingCity} />
              <Info icon={LuMapPin} label="Ünvan" value={detail.shippingAddress} />
              <Info icon={LuCreditCard} label="Ödəniş" value={detail.paymentMethodText || detail.paymentMethod} />
              <Info icon={LuFileText} label="Qeyd" value={detail.note || detail.notes} />
            </div>

            {items.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <LuPackage size={13} /> Məhsullar ({items.length})
                </p>
                <div className="divide-y divide-slate-100">
                  {items.map((it, i) => (
                    <div key={it.id || i} className="flex items-center gap-3 px-4 py-3">
                      {(it.productImageUrl || it.mainImageUrl) && (
                        <img src={it.productImageUrl || it.mainImageUrl} alt=""
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{it.productName || it.name}</p>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {it.quantity} × {formatPrice(it.unitPrice ?? it.price)}
                          {(it.petShopName || it.shopName) && ` • ${it.petShopName || it.shopName}`}
                        </p>
                      </div>
                      <p className="text-sm font-black text-slate-900 shrink-0">
                        {formatPrice(it.totalPrice ?? (it.quantity * (it.unitPrice ?? it.price ?? 0)))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(detail.subTotal != null || detail.shippingCost != null) && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-sm font-semibold text-slate-600">
                {detail.subTotal != null && <div className="flex justify-between"><span>Ara cəm</span><span>{formatPrice(detail.subTotal)}</span></div>}
                {detail.shippingCost != null && (
                  <div className="flex justify-between">
                    <span>Çatdırılma</span>
                    <span>{detail.shippingCost > 0 ? formatPrice(detail.shippingCost) : 'Pulsuz'}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Yekun</span><span>{formatPrice(detail.totalAmount)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <LuLock size={12} /> Sifariş yalnız mağaza tərəfindən idarə olunur
              </p>
              {deleteId === detail.id ? (
                <div className="flex gap-2">
                  <button onClick={() => removeOrder(detail)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition">
                    Bəli, sil
                  </button>
                  <button onClick={() => setDeleteId(null)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                    Geri
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeleteId(detail.id)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition">
                  <LuTrash2 size={13} /> Siyahıdan sil
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;