import React, { useState, useEffect, useCallback } from 'react';
import { LuMapPin, LuUser } from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { ORDER_STATUS_TEXT, ORDER_STATUS_COLOR } from '../../../utils/constants';
import { formatPrice } from '../../../utils/helpers';
import { PageHeader, EmptyBox, Badge, listFrom } from '../../components/admin/ui';

const STATUS_FILTER = [
  { v: '', l: 'Hamısı' },
  ...Object.entries(ORDER_STATUS_TEXT).map(([v, l]) => ({ v: Number(v), l })),
];

const AdminOrders = () => {
  const [status, setStatus] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.orders(status === '' ? undefined : status).catch(() => null);
    setList(listFrom(res));
    setLoading(false);
  }, [status]);

  useEffect(() => { fetchList(); }, [fetchList]);

  return (
    <div>
      <PageHeader title="Sifarişlər" subtitle={`${list.length} sifariş • status mağaza tərəfindən idarə olunur`}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer">
          {STATUS_FILTER.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      </PageHeader>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      ) : list.length === 0 ? (
        <EmptyBox text="Sifariş tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">Sifariş №</th>
                  <th className="px-5 py-3.5">Müştəri</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Şəhər</th>
                  <th className="px-5 py-3.5">Məbləğ</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Tarix</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 font-mono text-xs">{o.orderNumber}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <LuUser size={12} className="text-slate-400 shrink-0" />
                        {o.customerFullName || o.shippingFullName || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-semibold hidden md:table-cell">
                      <span className="flex items-center gap-1"><LuMapPin size={12} /> {o.shippingCity || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900">{formatPrice(o.totalAmount)}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-semibold text-xs hidden sm:table-cell">{o.dateText}</td>
                    <td className="px-5 py-3.5 text-right">
                      {/* ✅ Yalnız oxunur badge — admin dəyişə bilmir */}
                      <Badge className={ORDER_STATUS_COLOR[o.status] || 'bg-slate-100 text-slate-600 border-slate-200'}>
                        {o.statusText || ORDER_STATUS_TEXT[o.status] || '—'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;