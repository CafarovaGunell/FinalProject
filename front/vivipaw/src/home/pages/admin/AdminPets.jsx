import React, { useState, useEffect, useCallback } from 'react';
import { LuCheck, LuX, LuMapPin, LuPawPrint, LuStore, LuUser } from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { PLACEHOLDER_PET } from '../../../utils/constants';
import { PageHeader, EmptyBox, Spinner, Badge, Modal, listFrom } from '../../components/admin/ui';

const AdminPets = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [reject, setReject] = useState(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.pendingPets(1, 60).catch(() => null);
    setList(listFrom(res));
    setLoading(false);
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const approve = async (id) => {
    setBusyId(id);
    const res = await adminApi.approvePet(id, true, '')
      .catch((e) => ({ success: false, message: getError(e) }));
    showToast(res?.success ? '✅ Elan təsdiqləndi' : (res?.message || 'Əməliyyat alınmadı'));
    if (res?.success) fetchList();
    setBusyId(null);
  };

  const rejectNow = async () => {
    if (!reason.trim()) return showToast('Rədd səbəbi yazılmalıdır');
    setBusyId(reject.id);
    const res = await adminApi.approvePet(reject.id, false, reason.trim())
      .catch((e) => ({ success: false, message: getError(e) }));
    showToast(res?.success ? '🚫 Elan rədd edildi' : (res?.message || 'Əməliyyat alınmadı'));
    if (res?.success) fetchList();
    setReject(null); setReason(''); setBusyId(null);
  };

  return (
    <div>
      <PageHeader title="Elan moderasiyası" subtitle={`${list.length} elan təsdiq gözləyir`} />
      {toast && <div className="fixed top-20 right-6 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      ) : list.length === 0 ? (
        <EmptyBox text="Təsdiq gözləyən elan yoxdur. 🎉" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-40 bg-slate-100">
                <img src={p.mainImageUrl || PLACEHOLDER_PET} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5"><Badge className="bg-amber-50 text-amber-600 border-amber-200">Təsdiq gözləyir</Badge></span>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div>
                  <p className="font-black text-slate-900">{p.name}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">{p.breed} • {p.categoryName}</p>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                  <p className="flex items-center gap-1.5"><LuMapPin size={12} className="text-slate-400" /> {p.city}</p>
                  <p className="flex items-center gap-1.5">
                    {p.ownerType === 1 ? <LuStore size={12} className="text-slate-400" /> : <LuUser size={12} className="text-slate-400" />}
                    {p.petShopName || p.ownerFullName || (p.ownerType === 1 ? 'Mağaza' : 'Şəxsi')}
                  </p>
                </div>
                {p.description && <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>}
                <div className="mt-auto flex gap-2 pt-2">
                  <button onClick={() => approve(p.id)} disabled={busyId === p.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50">
                    {busyId === p.id ? <Spinner small /> : <LuCheck size={14} />} Təsdiq
                  </button>
                  <button onClick={() => setReject({ id: p.id, name: p.name })} disabled={busyId === p.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2.5 rounded-xl transition">
                    <LuX size={14} /> Rədd
                  </button>
                </div>
              </div>
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

export default AdminPets;