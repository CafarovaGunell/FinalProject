import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, Plus, Pencil, Trash2, X, AlertCircle, Save, Clock } from 'lucide-react';
import { vetApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { formatPrice } from '../../../utils/helpers';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

const ServiceModal = ({ service, onClose, onDone, showToast }) => {
  const [form, setForm] = useState(service ? {
    name: service.name || '', description: service.description || '',
    price: service.price ?? '', durationMinutes: service.durationMinutes ?? 30,
    isActive: service.isActive !== false,
  } : { name: '', description: '', price: '', durationMinutes: 30, isActive: true });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) return setErr('Xidmət adı mütləqdir.');
    const price = Number(form.price);
    if (!price || price <= 0) return setErr('Qiymət düzgün daxil edilməlidir.');
    setSaving(true);
    const payload = {
      name: form.name.trim(), description: form.description.trim() || null,
      price, durationMinutes: Number(form.durationMinutes) || 30, isActive: form.isActive,
    };
    try {
      const res = service
        ? await vetApi.updateService(service.id, payload)
        : await vetApi.addService(payload);
      if (res?.success) onDone();
      else setErr(res?.message || 'Yadda saxlanmadı.');
    } catch (e2) { setErr(getError(e2, 'Yadda saxlanmadı.')); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><X size={18} /></button>
        <h3 className="text-lg font-bold text-slate-900">{service ? 'Xidməti redaktə et' : 'Yeni xidmət'}</h3>

        {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" /> {err}</div>}

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1"><label className={labelCls}>Xidmət adı *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
          <div className="space-y-1"><label className={labelCls}>Təsvir</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls + ' resize-none'} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className={labelCls}>Qiymət (₼) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Müddət (dəq)</label>
              <input type="number" min="5" step="5" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className={inputCls} /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded accent-emerald-600" />
            <span className="text-xs font-semibold text-slate-600">Aktiv (müştərilərə görünsün)</span>
          </label>
          <button type="submit" disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Save size={16} /> Yadda saxla</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const VetServices = ({ vetId, showToast }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [acting, setActing] = useState(null);

  const fetchList = useCallback(async () => {
    if (!vetId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await vetApi.services(vetId);
      setServices(Array.isArray(res?.data) ? res.data : (res?.data?.items || []));
    } catch { setServices([]); }
    finally { setLoading(false); }
  }, [vetId]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const remove = async (id) => {
    setActing(id);
    try {
      const res = await vetApi.removeService(id);
      if (res?.success) { setServices((p) => p.filter((x) => x.id !== id)); showToast('Xidmət silindi'); }
      else showToast(res?.message || 'Silinmədi.');
    } catch (e) { showToast(getError(e, 'Silinmədi.')); }
    finally { setActing(null); setDeleteId(null); }
  };

  if (!vetId) {
    return <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl p-4 text-xs font-semibold">
      Əvvəlcə klinika profilini yaradın və admin təsdiqini gözləyin.
    </div>;
  }

  return (
    <div className="space-y-4">
      {modal && (
        <ServiceModal service={modal.service} onClose={() => setModal(null)} showToast={showToast}
          onDone={() => { setModal(null); showToast(modal.service ? '✅ Xidmət yeniləndi' : '✅ Xidmət əlavə olundu'); fetchList(); }} />
      )}

      <div className="flex justify-end">
        <button onClick={() => setModal({ service: null })}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-md">
          <Plus size={16} /> Yeni xidmət
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-400 font-semibold">
          Hələ xidmət əlavə etməmisiniz.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className={`bg-white border rounded-2xl p-5 space-y-2 transition ${s.isActive === false ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:shadow-md'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><Wrench size={16} /></div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{s.name}</h4>
                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5"><Clock size={11} /> {s.durationMinutes} dəq</p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-600 shrink-0">{formatPrice(s.price)}</span>
              </div>
              {s.description && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{s.description}</p>}
              {!s.isActive && <span className="inline-block text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">Deaktiv</span>}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => setModal({ service: s })}
                  className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1">
                  <Pencil size={12} /> Redaktə
                </button>
                {deleteId === s.id ? (
                  <button onClick={() => remove(s.id)} disabled={acting === s.id}
                    className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-rose-600 text-white transition disabled:opacity-50">
                    {acting === s.id ? '...' : 'Təsdiqlə'}
                  </button>
                ) : (
                  <button onClick={() => setDeleteId(s.id)}
                    className="px-3 py-2 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              {deleteId === s.id && (
                <button onClick={() => setDeleteId(null)} className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-600">Geri</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VetServices;