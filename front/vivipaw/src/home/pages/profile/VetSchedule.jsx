import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, Plus, Trash2, Clock, Coffee, Plane, AlertCircle,
} from 'lucide-react';
import { vetApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { DAY_NAMES } from '../../../utils/constants';

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const dayName = (d) => DAY_NAMES[d % 7];
const t5    = (t) => (t ? String(t).slice(0, 5) : '');
const tFull = (t) => (t && t.length === 5 ? t + ':00' : t || null);

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

const VetSchedule = ({ vetId, showToast }) => {
  const [schedules, setSchedules] = useState([]);
  const [timeOffs, setTimeOffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const [sForm, setSForm] = useState({
    dayOfWeek: 1, startTime: '09:00', endTime: '18:00',
    breakStart: '13:00', breakEnd: '14:00', hasBreak: true, slotDurationMinutes: 30,
  });
  const [sSaving, setSSaving] = useState(false);
  const [sErr, setSErr] = useState('');

  const [tForm, setTForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [tSaving, setTSaving] = useState(false);
  const [tErr, setTErr] = useState('');

  const fetchAll = useCallback(async () => {
    if (!vetId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([
        vetApi.schedules(vetId).catch(() => null),
        vetApi.timeOffs().catch(() => null),
      ]);
      if (sRes?.success) {
        const list = Array.isArray(sRes.data) ? sRes.data : (sRes.data?.items || []);
        setSchedules([...list].sort((a, b) => a.dayOfWeek - b.dayOfWeek));
      }
      if (tRes?.success) {
        const list = Array.isArray(tRes.data) ? tRes.data : (tRes.data?.items || []);
        setTimeOffs([...list].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
      }
    } finally {
      setLoading(false);
    }
  }, [vetId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── QRAFİK ── */
  const addSchedule = async (e) => {
    e.preventDefault();
    setSErr('');
    if (sForm.endTime <= sForm.startTime) return setSErr('Bağlanış saatı açılışdan sonra olmalıdır.');
    if (sForm.hasBreak && (sForm.breakEnd <= sForm.breakStart)) return setSErr('Fasilə saatları düzgün deyil.');
    setSSaving(true);
    try {
      const res = await vetApi.addSchedule({
        veterinarianProfileId: vetId,
        dayOfWeek: Number(sForm.dayOfWeek),
        startTime: tFull(sForm.startTime),
        endTime: tFull(sForm.endTime),
        breakStart: sForm.hasBreak ? tFull(sForm.breakStart) : null,
        breakEnd: sForm.hasBreak ? tFull(sForm.breakEnd) : null,
        slotDurationMinutes: Number(sForm.slotDurationMinutes),
        isActive: true,
      });
      if (res?.success) { showToast('✅ Qrafik əlavə olundu'); fetchAll(); }
      else setSErr(res?.message || 'Əlavə olunmadı.');
    } catch (err) { setSErr(getError(err, 'Əlavə olunmadı.')); }
    finally { setSSaving(false); }
  };

  const removeSchedule = async (id) => {
    setActing('s' + id);
    try {
      const res = await vetApi.removeSchedule(id);
      if (res?.success) { setSchedules((p) => p.filter((x) => x.id !== id)); showToast('Qrafik silindi'); }
      else showToast(res?.message || 'Silinmədi.');
    } catch (e) { showToast(getError(e, 'Silinmədi.')); }
    finally { setActing(null); }
  };

  /* ── MƏZUNİYYƏT ── */
  const addTimeOff = async (e) => {
    e.preventDefault();
    setTErr('');
    if (!tForm.startDate || !tForm.endDate) return setTErr('Hər iki tarix mütləqdir.');
    if (tForm.endDate < tForm.startDate) return setTErr('Bitiş tarixi başlanğıcdan əvvəl ola bilməz.');
    setTSaving(true);
    try {
      const res = await vetApi.addTimeOff({
        startDate: tForm.startDate,
        endDate: tForm.endDate,
        reason: tForm.reason.trim() || null,
      });
      if (res?.success) {
        showToast('✅ Məzuniyyət əlavə olundu');
        setTForm({ startDate: '', endDate: '', reason: '' });
        fetchAll();
      } else setTErr(res?.message || 'Əlavə olunmadı.');
    } catch (err) { setTErr(getError(err, 'Əlavə olunmadı.')); }
    finally { setTSaving(false); }
  };

  const removeTimeOff = async (id) => {
    setActing('t' + id);
    try {
      const res = await vetApi.removeTimeOff(id);
      if (res?.success) { setTimeOffs((p) => p.filter((x) => x.id !== id)); showToast('Məzuniyyət silindi'); }
      else showToast(res?.message || 'Silinmədi.');
    } catch (e) { showToast(getError(e, 'Silinmədi.')); }
    finally { setActing(null); }
  };

  if (!vetId) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl p-4 text-xs font-semibold">
        Əvvəlcə klinika profilini yaradın və admin təsdiqini gözləyin.
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      {/* ═══ İŞ QRAFİKİ ═══ */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays size={16} className="text-emerald-500" /> Həftəlik iş qrafiki
          </h3>

          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}</div>
          ) : schedules.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold bg-slate-50 rounded-xl p-4 text-center">
              Hələ qrafik əlavə etməmisiniz. Müştərilər sizi görə bilməsi üçün qrafik yaradın.
            </p>
          ) : (
            <div className="space-y-2">
              {schedules.map((s) => (
                <div key={s.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="w-24 shrink-0">
                    <p className="text-xs font-black text-slate-900">{dayName(s.dayOfWeek)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {s.slotDurationMinutes} dəq slot
                    </p>
                  </div>
                  <div className="flex-1 text-xs font-semibold text-slate-600">
                    <p>{t5(s.startTime)} – {t5(s.endTime)}</p>
                    {s.breakStart && (
                      <p className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                        <Coffee size={10} /> Fasilə: {t5(s.breakStart)} – {t5(s.breakEnd)}
                      </p>
                    )}
                  </div>
                  <button onClick={() => removeSchedule(s.id)} disabled={acting === 's' + s.id}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0">
                    {acting === 's' + s.id
                      ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-rose-400 border-t-transparent" />
                      : <Trash2 size={15} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QRAFİK ƏLAVƏ ET */}
        <form onSubmit={addSchedule} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2"><Plus size={14} className="text-emerald-500" /> Yeni iş günü</h4>
          {sErr && <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-semibold flex items-start gap-1.5"><AlertCircle size={13} className="shrink-0 mt-0.5" /> {sErr}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className={labelCls}>Gün</label>
              <select value={sForm.dayOfWeek} onChange={(e) => setSForm({ ...sForm, dayOfWeek: e.target.value })} className={inputCls + ' cursor-pointer'}>
                {DAYS.map((d) => <option key={d} value={d}>{dayName(d)}</option>)}
              </select></div>
            <div className="space-y-1"><label className={labelCls}>Slot müddəti</label>
              <select value={sForm.slotDurationMinutes} onChange={(e) => setSForm({ ...sForm, slotDurationMinutes: e.target.value })} className={inputCls + ' cursor-pointer'}>
                {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} dəq</option>)}
              </select></div>
            <div className="space-y-1"><label className={labelCls}>Açılış</label>
              <input type="time" value={sForm.startTime} onChange={(e) => setSForm({ ...sForm, startTime: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Bağlanış</label>
              <input type="time" value={sForm.endTime} onChange={(e) => setSForm({ ...sForm, endTime: e.target.value })} className={inputCls} /></div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={sForm.hasBreak} onChange={(e) => setSForm({ ...sForm, hasBreak: e.target.checked })} className="w-4 h-4 rounded accent-emerald-600" />
            <span className="text-xs font-semibold text-slate-600">Fasilə var</span>
          </label>

          {sForm.hasBreak && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className={labelCls}>Fasilə başlanğıcı</label>
                <input type="time" value={sForm.breakStart} onChange={(e) => setSForm({ ...sForm, breakStart: e.target.value })} className={inputCls} /></div>
              <div className="space-y-1"><label className={labelCls}>Fasilə sonu</label>
                <input type="time" value={sForm.breakEnd} onChange={(e) => setSForm({ ...sForm, breakEnd: e.target.value })} className={inputCls} /></div>
            </div>
          )}

          <button type="submit" disabled={sSaving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50">
            {sSaving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Plus size={14} /> Qrafik əlavə et</>}
          </button>
        </form>
      </div>

      {/* ═══ MƏZUNİYYƏT ═══ */}
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plane size={16} className="text-sky-500" /> Məzuniyyət / qeyri-iş günləri
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Bu tarixlərdə müştərilər sizə randevu yaza bilməyəcək.
          </p>

          {loading ? (
            <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}</div>
          ) : timeOffs.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold bg-slate-50 rounded-xl p-4 text-center">Planlaşdırılmış məzuniyyət yoxdur.</p>
          ) : (
            <div className="space-y-2">
              {timeOffs.map((t) => {
                const past = new Date(t.endDate) < new Date(new Date().toDateString());
                return (
                  <div key={t.id} className={`flex items-center gap-3 border rounded-xl p-3 ${past ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-sky-50/50 border-sky-200/70'}`}>
                    <div className="p-2.5 bg-white text-sky-500 rounded-lg border border-sky-100 shrink-0"><Plane size={15} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900">
                        {new Date(t.startDate).toLocaleDateString('az-AZ')} → {new Date(t.endDate).toLocaleDateString('az-AZ')}
                      </p>
                      {t.reason && <p className="text-[11px] text-slate-500 truncate mt-0.5">{t.reason}</p>}
                      {past && <span className="text-[9px] font-bold text-slate-400 uppercase">Keçmiş</span>}
                    </div>
                    <button onClick={() => removeTimeOff(t.id)} disabled={acting === 't' + t.id}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0">
                      {acting === 't' + t.id
                        ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-rose-400 border-t-transparent" />
                        : <Trash2 size={15} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MƏZUNİYYƏT ƏLAVƏ ET */}
        <form onSubmit={addTimeOff} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2"><Plus size={14} className="text-sky-500" /> Yeni məzuniyyət</h4>
          {tErr && <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-semibold flex items-start gap-1.5"><AlertCircle size={13} className="shrink-0 mt-0.5" /> {tErr}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className={labelCls}>Başlanğıc *</label>
              <input type="date" value={tForm.startDate} onChange={(e) => setTForm({ ...tForm, startDate: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Bitiş *</label>
              <input type="date" value={tForm.endDate} onChange={(e) => setTForm({ ...tForm, endDate: e.target.value })} className={inputCls} /></div>
          </div>
          <div className="space-y-1"><label className={labelCls}>Səbəb</label>
            <input value={tForm.reason} onChange={(e) => setTForm({ ...tForm, reason: e.target.value })} placeholder="Məs: İllik məzuniyyət" className={inputCls} /></div>

          <button type="submit" disabled={tSaving}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50">
            {tSaving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Plus size={14} /> Əlavə et</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VetSchedule;