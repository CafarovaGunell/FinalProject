import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Stethoscope, Wrench, CalendarDays, CalendarCheck, Save, Camera,
  AlertCircle, UserCheck, Ban, CheckCircle2, Clock, PawPrint, Phone, FileText,
} from 'lucide-react';
import { vetApi, appointmentApi, uploadApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CITIES, APPOINTMENT_STATUS_TEXT, APPOINTMENT_STATUS_COLOR } from '../../../utils/constants';
import { formatPrice, formatDateTime } from '../../../utils/helpers';
import VetServices from './VetServices';
import VetSchedule from './VetSchedule';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

const getService  = (a) => a.serviceName || a.vetServiceName || a.vetService?.name || 'Xidmət';
const getCustomer = (a) => a.customerFullName || a.customer?.fullName || a.clientName || 'Müştəri';
const getPet      = (a) => a.petName || a.pet?.name || a.petInfo || '';

/* ═══════════ KLİNİKA MƏLUMATLARI ═══════════ */
const VetInfo = ({ profile, onSaved, showToast }) => {
  const [form, setForm] = useState({
    clinicName: '', specialty: '', experienceYears: '', licenseNumber: '',
    bio: '', imageUrl: '', phone: '', city: 'Bakı', address: '',
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (profile) setForm({
      clinicName: profile.clinicName || '', specialty: profile.specialty || '',
      experienceYears: profile.experienceYears ?? '', licenseNumber: profile.licenseNumber || '',
      bio: profile.bio || '', imageUrl: profile.imageUrl || '', phone: profile.phone || '',
      city: profile.city || 'Bakı', address: profile.address || '',
    });
    setLoaded(true);
  }, [profile]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.single(file, 'vets');
      const url = typeof res?.data === 'string' ? res.data : (res?.data?.url || res?.data?.imageUrl);
      if (url) setForm((f) => ({ ...f, imageUrl: url }));
    } catch (e2) { showToast(getError(e2, 'Şəkil yüklənmədi.')); }
    finally { setUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.clinicName.trim() || !form.specialty.trim()) return setErr('Klinika adı və ixtisas mütləqdir.');
    setSaving(true);
    const payload = { ...form, experienceYears: Number(form.experienceYears) || 0 };
    try {
      const res = profile
        ? await vetApi.update({ ...profile, ...payload })
        : await vetApi.create(payload);
      if (res?.success) { showToast('✅ Profil yeniləndi'); onSaved(res.data); }
      else setErr(res?.message || 'Yadda saxlanmadı.');
    } catch (e2) { setErr(getError(e2, 'Yadda saxlanmadı.')); }
    finally { setSaving(false); }
  };

  if (!loaded) return <div className="h-64 bg-white rounded-2xl animate-pulse" />;

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 max-w-3xl">
      {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" /> {err}</div>}

      <div className="flex items-center gap-4">
        <div className="relative">
          {form.imageUrl
            ? <img src={form.imageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
            : <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-500 grid place-items-center"><Stethoscope size={30} /></div>}
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-2 rounded-xl shadow-md hover:bg-emerald-700 transition">
            {uploading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> : <Camera size={14} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Klinika / həkim şəkli</p>
          <p className="text-[11px] text-slate-400">Siyahıda bu şəkil görünəcək</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1"><label className={labelCls}>Klinika adı *</label>
          <input value={form.clinicName} onChange={(e) => setForm({ ...form, clinicName: e.target.value })} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>İxtisas *</label>
          <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Məs: Cərrahiyyə" className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Təcrübə (il)</label>
          <input type="number" min="0" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Lisenziya №</label>
          <input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Telefon</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></div>
        <div className="space-y-1"><label className={labelCls}>Şəhər</label>
          <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls + ' cursor-pointer'}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select></div>
      </div>
      <div className="space-y-1"><label className={labelCls}>Ünvan</label>
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} /></div>
      <div className="space-y-1"><label className={labelCls}>Bio / haqqında</label>
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className={inputCls + ' resize-none'} /></div>

      <button type="submit" disabled={saving}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition flex items-center gap-2 disabled:opacity-50">
        {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Save size={15} /> Yadda saxla</>}
      </button>
    </form>
  );
};

/* ═══════════ GƏLƏN RANDEVULAR ═══════════ */
const STATUS_FILTERS = [
  { v: '', l: 'Hamısı' }, { v: '1', l: 'Gözləmədə' }, { v: '2', l: 'Təsdiqlənib' },
  { v: '3', l: 'Tamamlandı' }, { v: '4', l: 'Ləğv' }, { v: '5', l: 'Gəlmədi' },
];

const VetAppointments = ({ showToast }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [acting, setActing] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentApi.vetList(status || undefined, date || undefined);
      const data = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      setList([...data].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
    } catch { setList([]); }
    finally { setLoading(false); }
  }, [status, date]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const act = async (id, s) => {
    setActing(id);
    try {
      const res = await appointmentApi.setStatus(id, s);
      if (res?.success) { showToast('✅ Status yeniləndi'); fetchList(); }
      else showToast(res?.message || 'Xəta.');
    } catch (e) { showToast(getError(e, 'Xəta.')); }
    finally { setActing(null); }
  };

  const btn = 'flex-1 py-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-50';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map(({ v, l }) => (
          <button key={v} onClick={() => setStatus(v)}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition ${
              status === v ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}>{l}</button>
        ))}
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="ml-auto bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-500" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-400 font-semibold">Bu filtrə uyğun randevu yoxdur.</div>
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">{getCustomer(a)}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${APPOINTMENT_STATUS_COLOR[a.status]}`}>
                      {APPOINTMENT_STATUS_TEXT[a.status]}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5"><FileText size={13} /> {getService(a)}</p>
                  {getPet(a) && <p className="text-xs text-slate-500 flex items-center gap-1.5"><PawPrint size={13} className="text-emerald-500" /> {getPet(a)}</p>}
                  {a.clientPhone && <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1"><Phone size={11} /> {a.clientPhone}</p>}
                  {a.notes && <p className="text-[11px] text-slate-400 italic">“{a.notes}”</p>}
                  {a.cancelReason && <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1"><AlertCircle size={12} /> {a.cancelReason}</p>}
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="text-sm font-black text-slate-900 flex items-center gap-1.5 justify-end"><Clock size={14} className="text-emerald-500" /> {formatDateTime(a.startTime)}</p>
                  <p className="text-sm font-black text-emerald-600">{formatPrice(a.priceSnapshot ?? a.price)}</p>
                </div>
              </div>

              {(a.status === 1 || a.status === 2) && (
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  {a.status === 1 && (
                    <button disabled={acting === a.id} onClick={() => act(a.id, 2)}
                      className={btn + ' bg-emerald-600 hover:bg-emerald-700 text-white'}>
                      <UserCheck size={13} /> Təsdiqlə
                    </button>
                  )}
                  {a.status === 2 && (
                    <>
                      <button disabled={acting === a.id} onClick={() => act(a.id, 3)}
                        className={btn + ' bg-sky-600 hover:bg-sky-700 text-white'}>
                        <CheckCircle2 size={13} /> Tamamlandı
                      </button>
                      <button disabled={acting === a.id} onClick={() => act(a.id, 5)}
                        className={btn + ' bg-slate-200 hover:bg-slate-300 text-slate-700'}>
                        Gəlmədi
                      </button>
                    </>
                  )}
                  <button disabled={acting === a.id} onClick={() => act(a.id, 4)}
                    className={btn + ' bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'}>
                    <Ban size={13} /> Ləğv
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════ PANEL QABIĞI ═══════════ */
const VetPanel = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  useEffect(() => {
    vetApi.me()
      .then((r) => { if (r?.success) setProfile(r.data); })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const tabs = [
    { v: 'info', l: 'Klinika məlumatları', icon: Stethoscope },
    { v: 'services', l: 'Xidmətlər', icon: Wrench },
    { v: 'schedule', l: 'Qrafik & Məzuniyyət', icon: CalendarDays },
    { v: 'appts', l: 'Gələn randevular', icon: CalendarCheck },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}

      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit flex-wrap">
        {tabs.map(({ v, l, icon: Icon }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              tab === v ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
            }`}>
            <Icon size={14} /> {l}
          </button>
        ))}
      </div>

      {tab === 'info' && !loadingProfile && (
        <VetInfo profile={profile} showToast={showToast}
          onSaved={(d) => { setProfile(d || profile); if (d?.approvalStatus) updateUser({ approvalStatus: d.approvalStatus }); }} />
      )}
      {tab === 'services' && <VetServices vetId={profile?.id} showToast={showToast} />}
      {tab === 'schedule' && <VetSchedule vetId={profile?.id} showToast={showToast} />}
      {tab === 'appts' && <VetAppointments showToast={showToast} />}
    </div>
  );
};

export default VetPanel;