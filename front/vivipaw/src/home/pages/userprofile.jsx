import React, { useEffect, useRef, useState } from 'react';
import {
  User, Camera, KeyRound, Save, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { userApi, authApi, uploadApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../../utils/constants';

import ShopPanel from './profile/ShopPanel';
import VetPanel from './profile/VetPanel';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

/* ═══════════ CUSTOMER ŞƏXSİ PROFİLİ ═══════════ */
const CustomerProfile = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || 'Bakı',
    imageUrl: user?.imageUrl || '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setForm({
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      city: user?.city || 'Bakı',
      imageUrl: user?.imageUrl || '',
    });
  }, [user]);

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const res = await uploadApi.single(file, 'avatars');

      const imageUrl = typeof res?.data === 'string'
        ? res.data
        : (res?.data?.url || res?.data?.imageUrl);

      if (!imageUrl) {
        setError('Şəkil yüklənmədi.');
        return;
      }

      setForm((prev) => ({
        ...prev,
        imageUrl,
      }));
    } catch (err) {
      setError(getError(err, 'Şəkil yüklənmədi.'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!form.fullName.trim()) {
      return setError('Ad və soyad boş ola bilməz.');
    }

    if (form.phoneNumber && form.phoneNumber.length !== 10) {
      return setError(
        'Telefon nömrəsi 10 rəqəm olmalıdır. Məsələn: 0501234567'
      );
    }

    setSaving(true);

    try {
      const res = await userApi.update({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        city: form.city,
        imageUrl: form.imageUrl || null,
      });

      if (!res?.success) {
        setError(res?.message || 'Profil yenilənmədi.');
        return;
      }

      updateUser({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        city: form.city,
        imageUrl: form.imageUrl,
      });

      setMessage('Profil məlumatları yeniləndi.');
    } catch (err) {
      setError(getError(err, 'Profil yenilənmədi.'));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();

    setPasswordError('');
    setPasswordMessage('');

    if (!passwordForm.currentPassword) {
      return setPasswordError('Cari parolu daxil edin.');
    }

    if (passwordForm.newPassword.length < 6) {
      return setPasswordError('Yeni parol ən azı 6 simvol olmalıdır.');
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError('Yeni parollar uyğun gəlmir.');
    }

    setPasswordSaving(true);

    try {
      const res = await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.newPassword,
      });

      if (!res?.success) {
        setPasswordError(res?.message || 'Parol dəyişdirilmədi.');
        return;
      }

      setPasswordMessage('Parol uğurla dəyişdirildi.');

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(getError(err, 'Parol dəyişdirilmədi.'));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-7">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 grid place-items-center">
            <User size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Profilim
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Şəxsi məlumatlarınızı idarə edin.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-7">
          <form
            onSubmit={saveProfile}
            className="border border-slate-200 rounded-2xl p-5 space-y-4"
          >
            <h2 className="text-sm font-bold text-slate-900">
              Şəxsi məlumatlar
            </h2>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex gap-2">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                {message}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="relative">
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt={form.fullName}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-sky-100 text-sky-600 grid place-items-center text-2xl font-black">
                    {(form.fullName || 'U').charAt(0)}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1.5 -right-1.5 bg-sky-600 text-white p-2 rounded-xl shadow-md hover:bg-sky-700 transition disabled:opacity-60"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadAvatar}
                />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {user?.email}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  Şəkli dəyişmək üçün kamera ikonuna basın.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Ad və soyad</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({
                  ...form,
                  fullName: e.target.value,
                })}
                className={inputCls}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Telefon</label>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={form.phoneNumber}
                onChange={(e) => {
                  const phone = e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 10);

                  setForm({
                    ...form,
                    phoneNumber: phone,
                  });
                }}
                placeholder="0501234567"
                maxLength={10}
                className={inputCls}
              />

              <p className={`text-[10px] font-semibold ${
                form.phoneNumber.length === 10
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}>
                {form.phoneNumber.length}/10 rəqəm
              </p>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Şəhər</label>
              <select
                value={form.city}
                onChange={(e) => setForm({
                  ...form,
                  city: e.target.value,
                })}
                className={inputCls + ' cursor-pointer'}
              >
                {CITIES.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save size={15} />
                  Yadda saxla
                </>
              )}
            </button>
          </form>

          <form
            onSubmit={savePassword}
            className="border border-slate-200 rounded-2xl p-5 space-y-4"
          >
            <h2 className="text-sm font-bold text-slate-900">
              Parolu dəyiş
            </h2>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex gap-2">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                {passwordMessage}
              </div>
            )}

            <div className="space-y-1">
              <label className={labelCls}>Cari parol</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })}
                className={inputCls}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Yeni parol</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })}
                className={inputCls}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Yeni parol (təkrar)</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {passwordSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <KeyRound size={15} />
                  Parolu dəyiş
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ═══════════ ƏSAS USER PROFILE ROUTE ═══════════ */
const UserProfile = () => {
  const { isShop, isVet } = useAuth();

  /*
    Mağaza və baytar üçün generic user profili YOXDUR.
    Onlar birbaşa biznes / klinika panelini görür.
  */
  if (isShop) {
    return <ShopPanel />;
  }

  if (isVet) {
    return <VetPanel />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16 pt-10 px-4 sm:px-6 lg:px-8">
      <CustomerProfile />
    </div>
  );
};

export default UserProfile;