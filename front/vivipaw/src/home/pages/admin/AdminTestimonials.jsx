import React, { useState, useEffect, useCallback } from 'react';
import { LuCheck, LuX, LuStar, LuMessageSquare } from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { PageHeader, EmptyBox, Spinner, Avatar, listFrom } from '../../components/admin/ui';

const AdminTestimonials = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.pendingTestimonials().catch(() => null);
    setList(listFrom(res));
    setLoading(false);
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const decide = async (id, approve) => {
    setBusyId(id);
    const res = await adminApi.approveTestimonial(id, approve)
      .catch((e) => ({ success: false, message: getError(e) }));
    showToast(res?.success ? (approve ? '✅ Rəy dərc olundu' : '🚫 Rəy rədd edildi') : (res?.message || 'Əməliyyat alınmadı'));
    if (res?.success) fetchList();
    setBusyId(null);
  };

  return (
    <div>
      <PageHeader title="Rəy moderasiyası" subtitle={`${list.length} rəy təsdiq gözləyir`} />
      {toast && <div className="fixed top-20 right-6 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      ) : list.length === 0 ? (
        <EmptyBox text="Təsdiq gözləyən rəy yoxdur. 🎉" />
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-4">
              {t.petImageUrl && <img src={t.petImageUrl} alt="" className="w-full sm:w-32 h-32 object-cover rounded-xl border border-slate-100 shrink-0" />}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={t.userFullName} src={t.userImageUrl} />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.userFullName || 'İstifadəçi'}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{t.dateText}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <LuStar key={s} size={13} className={s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{t.comment}</p>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => decide(t.id, true)} disabled={busyId === t.id}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition disabled:opacity-50">
                    {busyId === t.id ? <Spinner small /> : <LuCheck size={14} />} Dərc et
                  </button>
                  <button onClick={() => decide(t.id, false)} disabled={busyId === t.id}
                    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-2 rounded-xl transition">
                    <LuX size={14} /> Rədd et
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;