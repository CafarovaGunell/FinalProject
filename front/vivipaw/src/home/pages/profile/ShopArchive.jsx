import React, { useState, useEffect, useCallback } from 'react';
import {
  LuArchive, LuTrash2, LuCalendarDays, LuUser, LuSearch, LuX, LuPawPrint,
} from 'react-icons/lu';
import { petApi, adoptionApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { PLACEHOLDER_PET, GENDER_TEXT } from '../../../utils/constants';

/* dd.MM.yyyy və ISO — hər ikisini tutur */
const parseDate = (v) => {
  if (!v) return null;
  let d = new Date(v);
  if (!isNaN(d.getTime())) return d;
  const m = String(v).match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`);
  return null;
};

const ShopArchive = ({ showToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [acting, setActing] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const [pRes, rRes] = await Promise.all([
      petApi.mine().catch(() => null),
      adoptionApi.received().catch(() => null),
    ]);
    const pets = Array.isArray(pRes?.data) ? pRes.data : (pRes?.data?.items || []);
    const reqs = Array.isArray(rRes?.data) ? rRes.data : (rRes?.data?.items || []);

    const adopted = pets.filter((p) => p.adoptionStatus === 3).map((p) => {
      const req = reqs.find((r) => r.status === 2 && (r.petId ?? r.pet?.id) === p.id);
      return {
        ...p,
        adoptedTo: req ? (req.applicantFullName || req.fullName || '—') : '—',
        adoptedAt: req?.reviewedAt || req?.dateText || p.dateText || null,
      };
    });
    setItems(adopted);
    setLoading(false);
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  /* Tarix + ad filtri */
  const filtered = items.filter((p) => {
    const d = parseDate(p.adoptedAt);
    const okFrom = !from || (d && d >= new Date(from));
    const okTo = !to || (d && d <= new Date(to + 'T23:59:59'));
    const q = search.trim().toLowerCase();
    const okQ = !q || (p.name || '').toLowerCase().includes(q) || (p.breed || '').toLowerCase().includes(q);
    return okFrom && okTo && okQ;
  });

  const remove = async (p) => {
    setActing(p.id);
    const res = await petApi.remove(p.id).catch((e) => ({ success: false, message: getError(e) }));
    showToast(res?.success ? '🗑️ Arxivdən silindi' : (res?.message || 'Silinmədi'));
    if (res?.success) fetchList();
    setActing(null);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      {/* FİLTRLƏR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-end">
        <div className="relative flex-1">
          <LuSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ad və ya cins axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500" />
        </div>
        <div className="flex items-center gap-2">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Sahibləndi (dən)</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">(qədər)</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500" />
          </div>
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"><LuX size={15} /></button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 font-semibold px-1">
        <span className="text-sky-600 font-bold">{filtered.length}</span> sahibləndirilmiş heyvan
      </p>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <LuArchive className="mx-auto text-slate-300 mb-2" size={36} />
          <p className="text-sm text-slate-500 font-semibold">Arxivdə heyvan yoxdur.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-36 bg-slate-100">
                <img src={p.mainImageUrl || PLACEHOLDER_PET} alt={p.name} className="w-full h-full object-cover opacity-80" />
                <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-900/70 text-white flex items-center gap-1">
                  <LuArchive size={11} /> Arxiv
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div>
                  <p className="font-black text-slate-900">{p.name}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">{p.breed} • {GENDER_TEXT[p.gender]}</p>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                  <p className="flex items-center gap-1.5"><LuUser size={12} className="text-emerald-500" /> {p.adoptedTo}</p>
                  <p className="flex items-center gap-1.5"><LuCalendarDays size={12} className="text-sky-500" /> {p.adoptedAt || '—'}</p>
                </div>
                <div className="mt-auto pt-2">
                  {deleteId === p.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => remove(p)} disabled={acting === p.id}
                        className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-rose-600 text-white transition disabled:opacity-50">
                        {acting === p.id ? '...' : 'Bəli, sil'}
                      </button>
                      <button onClick={() => setDeleteId(null)}
                        className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 transition">Geri</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteId(p.id)}
                      className="w-full py-2 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 transition flex items-center justify-center gap-1">
                      <LuTrash2 size={12} /> Arxivdən sil
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopArchive;