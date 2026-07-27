import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../../utils/constants';
import {
  PawPrint, ArrowRight, AlertCircle, Sparkles, Heart, ShieldCheck,
  UserCheck, Eye, EyeOff, Store, Stethoscope, User as UserIcon,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'Customer',     label: 'Müştəri', icon: UserIcon,    desc: 'Sahiblən, alış-veriş et' },
  { value: 'PetShop',      label: 'Mağaza',  icon: Store,       desc: 'Məhsul və elan yerləşdir' },
  { value: 'Veterinarian', label: 'Baytar',  icon: Stethoscope, desc: 'Randevu qəbul et' },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: 'Bakı',
    role: 'Customer',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((p) => ({ ...p, [e.target.name]: '' }));
    setGeneralError('');
  };

  const switchTab = (loginMode) => {
    setIsLogin(loginMode);
    setFieldErrors({});
    setGeneralError('');
    setForm({ fullName: '', email: '', password: '', phoneNumber: '', city: 'Bakı', role: 'Customer' });
  };

  const validate = () => {
    const e = {};
    if (!isLogin && !form.fullName.trim()) e.fullName = 'Ad və soyad daxil edilməlidir.';

    if (!form.email.trim()) e.email = 'E-poçt boş ola bilməz.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Düzgün e-poçt formatı daxil edin.';

    if (!form.password) e.password = 'Parol boş ola bilməz.';
    else if (form.password.length < 6) e.password = 'Parol ən azı 6 simvol olmalıdır.';
    else if (!isLogin) {
      if (!/[A-Z]/.test(form.password)) e.password = 'Parolda ən azı 1 böyük hərf olmalıdır.';
      else if (!/[a-z]/.test(form.password)) e.password = 'Parolda ən azı 1 kiçik hərf olmalıdır.';
      else if (!/[0-9]/.test(form.password)) e.password = 'Parolda ən azı 1 rəqəm olmalıdır.';
    }

    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setGeneralError('');
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
        navigate(from, { replace: true });
      } else {
        const u = await register({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber || null,
          city: form.city,
          role: form.role,
        });
        if (u.role === 'PetShop' || u.role === 'Veterinarian') navigate('/profile');
        else navigate('/');
      }
    } catch (err) {
      // Field-level xətalar (ASP.NET ModelState)
      const be = err?.fieldErrors;
      if (be && !Array.isArray(be) && typeof be === 'object') {
        const mapped = {};
        Object.keys(be).forEach((k) => {
          const f = k.charAt(0).toLowerCase() + k.slice(1);
          mapped[f] = Array.isArray(be[k]) ? be[k][0] : be[k];
        });
        setFieldErrors(mapped);
      }
      setGeneralError(err?.message || 'Əməliyyat uğursuz oldu.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (err) =>
    `w-full bg-slate-950/60 border ${
      err ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-sky-500'
    } rounded-2xl px-4 py-3 text-xs font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all`;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-10 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl w-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* ══ BANNER ══ */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sky-900/40 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-5 relative">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="bg-gradient-to-tr from-sky-500 to-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition">
                <PawPrint className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                vivi<span className="text-slate-100">Paw</span>
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-bold">
              <Sparkles size={12} /> Sevgi Dolu İcma
            </span>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
              {isLogin ? 'Yenidən Xoş Gəldiniz!' : 'Dostlarımıza Ümid Olun!'}
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed hidden sm:block">
              {isLogin
                ? 'Bəyəndiyiniz heyvanları izləyin, randevu yazın və sifarişlərinizi idarə edin.'
                : 'Qeydiyyatdan keçərək minlərlə heyvana isti yuva tapmaq missiyamıza qoşulun.'}
            </p>
          </div>

          <div className="hidden md:flex flex-col gap-3 pt-6 mt-6 border-t border-slate-800/80">
            {[
              { icon: Heart, text: '100% Doğrulanmış Mağazalar' },
              { icon: ShieldCheck, text: 'Təhlükəsiz & Sürətli Sahiblənmə' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                <div className="p-2 rounded-xl bg-slate-800/80 text-sky-400">
                  <Icon size={16} />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FORM ══ */}
        <div className="lg:col-span-7 p-5 sm:p-8 bg-slate-900/30 max-h-[85vh] overflow-y-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/60">
            <div>
              <h3 className="text-lg font-bold text-white">{isLogin ? 'Giriş Paneli' : 'Yeni Hesab'}</h3>
              <p className="text-[11px] text-slate-400">Məlumatlarınızı daxil edin</p>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              {[{ l: 'Daxil Ol', v: true }, { l: 'Qeydiyyat', v: false }].map(({ l, v }) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => switchTab(v)}
                  className={`flex-1 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    isLogin === v
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {generalError && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {!isLogin && (
              <>
                {/* Rol seçimi */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Hesab növü
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLE_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm({ ...form, role: value })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          form.role === value
                            ? 'bg-sky-500/15 border-sky-500/50 ring-1 ring-sky-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Icon size={16} className={form.role === value ? 'text-sky-400' : 'text-slate-500'} />
                        <p className={`mt-1.5 text-[11px] font-bold ${form.role === value ? 'text-white' : 'text-slate-300'}`}>
                          {label}
                        </p>
                        <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>

                  {form.role !== 'Customer' && (
                    <p className="text-[10px] text-amber-400/90 flex items-start gap-1.5">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      Qeydiyyatdan sonra profil məlumatlarını doldurmalı və admin təsdiqini gözləməlisiniz.
                    </p>
                  )}
                </div>

                {/* Ad Soyad */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Ad və Soyad
                  </label>
                  <div className="relative">
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Məs: Cəfərova Günel"
                      className={inputCls(fieldErrors.fullName)}
                    />
                    <UserCheck size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-[10px] font-bold text-rose-400">{fieldErrors.fullName}</p>
                  )}
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">E-poçt</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="adiniz@example.com"
                className={inputCls(fieldErrors.email)}
              />
              {fieldErrors.email && <p className="text-[10px] font-bold text-rose-400">{fieldErrors.email}</p>}
            </div>

            {/* Parol */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Parol</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputCls(fieldErrors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-[10px] font-bold text-rose-400">{fieldErrors.password}</p>}
              {!isLogin && !fieldErrors.password && (
                <p className="text-[10px] text-slate-500">
                  Ən azı 6 simvol, 1 böyük hərf, 1 kiçik hərf, 1 rəqəm
                </p>
              )}
            </div>

            {/* Telefon + Şəhər */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Telefon</label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="0501234567"
                    className={inputCls()}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Şəhər</label>
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={inputCls() + ' cursor-pointer'}
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:opacity-95 active:scale-[0.99] text-white font-bold py-4 rounded-2xl text-xs transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>{isLogin ? 'Hesaba Daxil Ol' : 'Qeydiyyatı Tamamla'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400 font-medium">
            {isLogin ? 'Hesabınız yoxdur?' : 'Artıq hesabınız var?'}
            <button
              onClick={() => switchTab(!isLogin)}
              className="ml-1.5 font-bold text-sky-400 hover:text-sky-300 hover:underline"
            >
              {isLogin ? 'İndi qeydiyyatdan keçin' : 'Daxil olun'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;