import React, { useState, useRef } from 'react';
import {
  User, Store, Stethoscope, Camera, KeyRound, Save, AlertCircle,
  CheckCircle2, ShieldAlert, Clock,
} from 'lucide-react';
import { userApi, authApi, uploadApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import { CITIES, APPROVAL_STATUS_TEXT } from '../../utils/constants';
import ShopPanel from './profile/ShopPanel';
import VetPanel from './profile/VetPanel';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

/* ═══════════ PROFİL REDAKTƏ + PAROL ═══════════ */
const ProfileTab = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || 'Bakı',
    imageUrl: user?.imageUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  const [pass, setPass] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr('');
    try {
      const res = await uploadApi.single(file, 'avatars');
      const url = typeof res?.data === 'string' ? res.data : (res?.data?.url || res?.data?.imageUrl);
      if (url) setForm((f) => ({ ...f, imageUrl: url }));
      else setErr('Şəkil yüklənmədi.');
    } catch (e2) { setErr(getError(e2, 'Şəkil yüklənmədi.')); }
    finally { setUploading(false); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (!form.fullName.trim()) return setErr('Ad boş ola bilməz.');
    setSaving(true);
    try {
      const res = await userApi.update({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        city: form.city,
        imageUrl: form.imageUrl || null,
      });
      if (res?.success) {
        updateUser({ ...form, fullName: form.fullName.trim() });
        setMsg('Profil yeniləndi');
      } else setErr(res?.message || 'Yenilənmədi.');
    } catch (e2) { setErr(getError(e2, 'Yenilənmədi.')); }
    finally { setSaving(false); }
  };

  const savePass = async (e) => {
    e.preventDefault();
    setPassErr(''); setPassMsg('');
    if (pass.newPassword.length < 6) return setPassErr('Yeni parol ən azı 6 simvol olmalıdır.');
    if (pass.newPassword !== pass.confirm) return setPassErr('Yeni parollar uyğun gəlmir.');
    setPassSaving(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: pass.currentPassword,
        newPassword: pass.newPassword,
      });
      if (res?.success) {
        setPassMsg('Parol dəyişdirildi');
        setPass({ currentPassword: '', newPassword: '', confirm: '' });
      } else setPassErr(res?.message || 'Parol dəyişmədi.');
    } catch (e2) { setPassErr(getError(e2, 'Parol dəyişmədi.')); }
    finally { setPassSaving(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      {/* ŞƏXSİ MƏLUMAT */}
      <form onSubmit={saveProfile} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><User size={16} className="text-sky-500" /> Şəxsi məlumatlar</h3>
        {err && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" /> {err}</div>}
        {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-start gap-2"><CheckCircle2 size={15} className="shrink-0 mt-0.5" /> {msg}</div>}

        <div className="flex items-center gap-4">
          <div className="relative">
            {form.imageUrl
              ? <img src={form.imageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
              : <div className="w-20 h-20 rounded-2xl bg-sky-100 text-sky-600 grid place-items-center text-2xl font-black">{(form.fullName || 'U').charAt(0)}</div>}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="absolute -bottom-1.5 -right-1.5 bg-sky-600 text-white p-2 rounded-xl shadow-md hover:bg-sky-700 transition">
              {uploading ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> : <Camera size={14} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{user?.email}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Şəkli dəyişmək üçün kameraya klikləyin</p>
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Ad və Soyad</label>
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelCls}>Telefon</label>
            <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="0501234567" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Şəhər</label>
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls + ' cursor-pointer'}>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Save size={15} /> Yadda saxla</>}
        </button>
      </form>

      {/* PAROL */}
      <form onSubmit={savePass} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><KeyRound size={16} className="text-amber-500" /> Parolu dəyiş</h3>
        {passErr && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" /> {passErr}</div>}
        {passMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-start gap-2"><CheckCircle2 size={15} className="shrink-0 mt-0.5" /> {passMsg}</div>}
        <div className="space-y-1">
          <label className={labelCls}>Cari parol</label>
          <input type="password" value={pass.currentPassword} onChange={(e) => setPass({ ...pass, currentPassword: e.target.value })} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Yeni parol</label>
          <input type="password" value={pass.newPassword} onChange={(e) => setPass({ ...pass, newPassword: e.target.value })} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Yeni parol (təkrar)</label>
          <input type="password" value={pass.confirm} onChange={(e) => setPass({ ...pass, confirm: e.target.value })} className={inputCls} />
        </div>
        <button type="submit" disabled={passSaving}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50">
          {passSaving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><KeyRound size={15} /> Parolu Dəyiş</>}
        </button>
      </form>
    </div>
  );
};

/* ═══════════ SƏHİFƏ ═══════════ */
const UserProfile = () => {
  const { user, isShop, isVet, isAdmin } = useAuth();
  const [tab, setTab] = useState(isShop ? 'shop' : isVet ? 'vet' : 'profile');

  const tabs = [
    { v: 'profile', l: 'Profilim', icon: User, show: true },
    { v: 'shop', l: 'Mağaza paneli', icon: Store, show: isShop },
    { v: 'vet', l: 'Baytar paneli', icon: Stethoscope, show: isVet },
  ].filter((t) => t.show);

  const approval = user?.approvalStatus;
  const needsApproval = (isShop || isVet) && approval && approval !== 2;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        {/* BAŞLIQ */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {user?.imageUrl
            ? <img src={user.imageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
            : <div className="w-20 h-20 rounded-2xl bg-sky-100 text-sky-600 grid place-items-center text-3xl font-black">{(user?.fullName || 'U').charAt(0)}</div>}
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900">{user?.fullName}</h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {(user?.roles || []).map((r) => (
                <span key={r} className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-100 px-2.5 py-1 rounded-lg">{r}</span>
              ))}
              {isAdmin && <span className="text-[10px] font-black uppercase bg-violet-50 text-violet-600 border border-violet-100 px-2.5 py-1 rounded-lg">Admin</span>}
            </div>
          </div>
        </div>

        {/* TƏSDİQ BANNERİ */}
        {needsApproval && (
          <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
            approval === 3 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            {approval === 3 ? <ShieldAlert size={20} className="shrink-0 mt-0.5" /> : <Clock size={20} className="shrink-0 mt-0.5" />}
            <div className="text-xs font-semibold leading-relaxed">
              <p className="font-black text-sm">{APPROVAL_STATUS_TEXT[approval]}</p>
              <p className="mt-0.5 opacity-80">
                {approval === 3
                  ? 'Profiliniz admin tərəfindən rədd edildi. Məlumatları yeniləyin və dəstək ilə əlaqə saxlayın.'
                  : 'Profiliniz admin tərəfindən yoxlanılır. Təsdiqlənənə qədər bəzi funksiyalar məhdud ola bilər.'}
              </p>
            </div>
          </div>
        )}

        {/* TABLAR */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit flex-wrap">
          {tabs.map(({ v, l, icon: Icon }) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition ${
                tab === v ? 'bg-sky-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}>
              <Icon size={14} /> {l}
            </button>
          ))}
        </div>

        {/* MƏZMUN */}
        {tab === 'profile' && <ProfileTab />}
        {tab === 'shop' && isShop && <ShopPanel />}
        {tab === 'vet' && isVet && <VetPanel />}
      </div>
    </div>
  );
};

export default UserProfile;