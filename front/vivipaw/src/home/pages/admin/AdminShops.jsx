import React, { useState, useEffect, useCallback } from 'react';
import { LuStore, LuCheck, LuX, LuMapPin, LuHash, LuPackage, LuPawPrint, LuUser } from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { PageHeader, EmptyBox, Spinner, Badge, Modal, listFrom, approveBody } from '../../components/admin/ui';

const TABS = [
  { v: 1, l: 'Gözləyən' },
  { v: 2, l: 'Təsdiqlənmiş' },
  { v: 3, l: 'Rədd edilmiş' },
];

const AdminShops = () => {
  const [tab, setTab] = useState(1);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [reject, setReject] = useState(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.shops(tab).catch(() => null);
    setList(listFrom(res));
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const approve = async (id) => {
    setBusyId(id);
    const res = await adminApi.approveShop(id, approveBody(true))
      .catch((e) => ({ success: false, message: getError(e) }));
    showToast(res?.success ? '✅ Mağaza təsdiqləndi' : (res?.message || 'Əməliyyat alınmadı'));
    if (res?.success) fetchList();
    setBusyId(null);
  };

  const rejectNow = async () => {
    if (!reason.trim()) return showToast('Rədd səbəbi yazılmalıdır');
    setBusyId(reject.id);
    const res = await adminApi.approveShop(reject.id, approveBody(false, reason.trim()))
      .catch((e) => ({ success: false, message: getError(e) }));
    showToast(res?.success ? '🚫 Mağaza rədd edildi' : (res?.message || 'Əməliyyat alınmadı'));
    if (res?.success) fetchList();
    setReject(null); setReason(''); setBusyId(null);
  };

  const owner = (s) => s.ownerFullName || s.appUserFullName || s.userFullName || s.appUser?.fullName || s.ownerName || '';

  return (
    <div>
      <PageHeader title="Mağaza təsdiqləri" subtitle={`${list.length} müraciət`} />
      {toast && <div className="fixed top-20 right-6 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>}

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === t.v ? 'bg-sky-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>{t.l}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      ) : list.length === 0 ? (
        <EmptyBox text="Bu bölmədə müraciət yoxdur." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                {s.logoUrl
                  ? <img src={s.logoUrl} alt={s.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                  : <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 grid place-items-center"><LuStore size={22} /></div>}
                <div className="min-w-0 flex-1">
                  <p className="font-black text-slate-900 truncate">{s.name}</p>
                  <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5"><LuMapPin size={11} /> {s.city} • {s.address}</p>
                </div>
                {tab === 1 && <Badge className="bg-amber-50 text-amber-600 border-amber-200">Gözləyir</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><LuUser size={12} className="text-slate-400" /> {owner(s) || '—'}</span>
                <span className="flex items-center gap-1.5"><LuHash size={12} className="text-slate-400" /> {s.taxNumber || '—'}</span>
                <span className="flex items-center gap-1.5"><LuPackage size={12} className="text-slate-400" /> {s.productCount ?? 0} məhsul</span>
                <span className="flex items-center gap-1.5"><LuPawPrint size={12} className="text-slate-400" /> {s.petCount ?? 0} elan</span>
              </div>

              {s.description && <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>}
              {tab === 3 && s.rejectReason && (
                <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">Səbəb: {s.rejectReason}</p>
              )}

              {tab === 1 && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => approve(s.id)} disabled={busyId === s.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50">
                    {busyId === s.id ? <Spinner small /> : <LuCheck size={14} />} Təsdiq et
                  </button>
                  <button onClick={() => setReject({ id: s.id, name: s.name })} disabled={busyId === s.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2.5 rounded-xl transition">
                    <LuX size={14} /> Rədd et
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!reject} onClose={() => { setReject(null); setReason(''); }} title={`Rədd et: ${reject?.name || ''}`}>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Rədd səbəbini yazın..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-rose-500 resize-none" />
        <button onClick={rejectNow} disabled={busyId === reject?.id}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-3 rounded-xl transition disabled:opacity-50">
          {busyId === reject?.id ? <Spinner small /> : <LuX size={15} />} Rədd et
        </button>
      </Modal>
    </div>
  );
};

export default AdminShops;