import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PawPrint, ArrowRight, AlertCircle, Sparkles, Heart, ShieldCheck, UserCheck } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Input dəyişikliyi
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Dəyər yazıldıqda həmin xananın xətasını silirik
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setGeneralError('');
  };

  // Switch tab (Daxil ol / Qeydiyyat)
  const handleTabSwitch = (status) => {
    setIsLogin(status);
    setFieldErrors({});
    setGeneralError('');
    setFormData({ fullName: '', email: '', password: '' });
  };

  // CLIENT-SIDE PRE-VALIDATION (Sürətli yoxlama)
  const validateForm = () => {
    const errors = {};

    if (!isLogin && !formData.fullName.trim()) {
      errors.fullName = 'Ad və Soyad daxil edilməlidir.';
    }

    if (!formData.email.trim()) {
      errors.email = 'E-poçt ünvanı boş ola bilməz.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Düzgün e-poçt formatı daxil edin.';
    }

    if (!formData.password) {
      errors.password = 'Parol boş ola bilməz.';
    } else if (formData.password.length < 6) {
      errors.password = 'Parol ən azı 6 simvol olmalıdır.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Göndərilməsi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setLoading(true);

    const endpoint = isLogin 
      ? 'http://localhost:5123/api/Auth/login' 
      : 'http://localhost:5123/api/Auth/register';

    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { fullName: formData.fullName, email: formData.email, password: formData.password };

    try {
      const response = await axios.post(endpoint, payload);
      
      // Backend-dən gələn AuthResponseDto: { token, fullName, role }
      login(response.data);
      navigate('/');
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 400 && data.errors) {
          // ASP.NET Core Validation Errors [Required], [EmailAddress] və s.
          const backendFieldErrors = {};
          Object.keys(data.errors).forEach((key) => {
            const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
            backendFieldErrors[fieldName] = data.errors[key][0];
          });
          setFieldErrors(backendFieldErrors);
        } else if (typeof data === 'string') {
          // BadRequest("Bu e-poçt...") və ya Unauthorized("E-poçt və ya parol...")
          setGeneralError(data);
        } else {
          setGeneralError('Giriş məlumatları yanlışdır və ya xəta baş verdi.');
        }
      } else {
        setGeneralError('Serverlə əlaqə saxlanıla bilmədi. Backend-in işlədiyindən emin olun.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-sky-500/15 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-blue-600/15 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl w-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* BANNER AREA */}
        <div className="lg:col-span-5 bg-gradient-to-br from-sky-900/40 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 sm:space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="bg-gradient-to-tr from-sky-500 to-blue-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-all">
                <PawPrint className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                vivi<span className="text-slate-100">Paw</span>
              </span>
            </Link>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] sm:text-[11px] font-bold">
                <Sparkles size={12} />
                <span>Sevgi Dolu İcma</span>
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                {isLogin ? "Yenidən Xoş Gəldiniz!" : "Dostlarımıza Ümid Olun!"}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed hidden sm:block">
                {isLogin 
                  ? "Tətbiqə daxil olaraq bəyəndiyiniz ev heyvanlarını izləyin və sahiblənmə müraciətlərinizi idarə edin."
                  : "Qeydiyyatdan keçərək minlərlə tərk edilmiş heyvana isti yuva tapmaq missiyamıza qoşulun."}
              </p>
            </div>
          </div>

          <div className="hidden md:flex flex-col space-y-3 pt-6 mt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
              <div className="p-2 rounded-xl bg-slate-800/80 text-sky-400 shrink-0">
                <Heart size={16} />
              </div>
              <span>100% Doğrulanmış Sığınacaqlar</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
              <div className="p-2 rounded-xl bg-slate-800/80 text-sky-400 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <span>Təhlükəsiz & Tez Sahiblənmə</span>
            </div>
          </div>

        </div>

        {/* FORM AREA */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-center bg-slate-900/30">
          
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-slate-800/60">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isLogin ? "Giriş Paneli" : "Yeni Hesab"}
              </h3>
              <p className="text-[11px] text-slate-400">Məlumatlarınızı daxil edin</p>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl sm:rounded-2xl border border-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleTabSwitch(true)}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg sm:rounded-xl transition-all duration-300 ${
                  isLogin 
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daxil Ol
              </button>
              <button
                type="button"
                onClick={() => handleTabSwitch(false)}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg sm:rounded-xl transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Qeydiyyat
              </button>
            </div>
          </div>

          {/* General Server Error (e.g., Email exists / Invalid credentials) */}
          {generalError && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl sm:rounded-2xl text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-rose-400" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">
            
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ad və Soyad
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    name="fullName"
                    placeholder="Məs: Cəfərova Günel"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full bg-slate-950/60 border ${
                      fieldErrors.fullName ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-sky-500'
                    } rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-3 text-xs font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all`}
                  />
                  <UserCheck size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-[10px] font-bold text-rose-400 mt-1">{fieldErrors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                E-poçt Ünvanı
              </label>
              <input 
                type="email"
                name="email"
                placeholder="adiniz@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-slate-950/60 border ${
                  fieldErrors.email ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-sky-500'
                } rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-3 text-xs font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all`}
              />
              {fieldErrors.email && (
                <p className="text-[10px] font-bold text-rose-400 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Parol
                </label>
                {isLogin && (
                  <button type="button" className="text-[10px] sm:text-[11px] font-semibold text-sky-400 hover:underline">
                    Parolu unutmusunuz?
                  </button>
                )}
              </div>
              <input 
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-slate-950/60 border ${
                  fieldErrors.password ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-sky-500'
                } rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-3 text-xs font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all`}
              />
              {fieldErrors.password && (
                <p className="text-[10px] font-bold text-rose-400 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 sm:mt-5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:opacity-95 active:scale-[0.99] text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

          <p className="mt-6 sm:mt-8 text-center text-xs text-slate-400 font-medium">
            {isLogin ? "Hesabınız yoxdur?" : "Artıq hesabınız var?"}
            <button
              onClick={() => handleTabSwitch(!isLogin)}
              className="ml-1.5 font-bold text-sky-400 hover:text-sky-300 hover:underline transition-colors"
            >
              {isLogin ? "İndi qeydiyyatdan keçin" : "Daxil olun"}
            </button>
          </p>

        </div>

      </div>
    </div>
  );
};

export default Auth;