import React, { useEffect, useMemo, useState } from 'react';
import {
  LuSettings,
  LuShield,
  LuUser,
  LuMail,
  LuPhone,
  LuMapPin,
  LuGlobe,
  LuInstagram,
  LuFacebook,
  LuImage,
  LuSave,
  LuRotateCcw,
  LuBadgeInfo,
  LuWrench,
  LuCheck,
  LuX,
  LuPawPrint,
} from 'react-icons/lu';
import { CITIES } from '../../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Avatar } from '../../components/admin/ui';

const STORAGE_KEY = 'vivipaw_site_settings';

const DEFAULT_SETTINGS = {
  siteName: 'ViViPaw',
  panelTitle: 'Sistem Administratoru',
  slogan: 'Pet Adoption & Care Management Platform',
  contactEmail: 'support@vivipaw.com',
  supportPhone: '+994 50 000 00 00',
  city: 'Bakı',
  address: 'Bakı, Azərbaycan',
  website: 'https://vivipaw.com',
  instagram: '@vivipaw',
  facebook: 'vivipaw',
  logoUrl: '',
  footerText: 'ViViPaw — Heyvan sahiblənmə və qayğı platforması',
  maintenanceMode: false,
  allowRegistration: true,
};

const roleTone = (r) => {
  if (r === 'SuperAdmin') return 'bg-violet-50 text-violet-600 border-violet-200';
  if (r === 'Admin') return 'bg-sky-50 text-sky-600 border-sky-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const Input = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
}) => (
  <label className="block">
    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
      {label}
    </p>

    <div className="relative">
      <Icon
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  </label>
);

const Toggle = ({ label, description, checked, onChange, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`w-full text-left border rounded-2xl p-4 transition disabled:opacity-60 disabled:cursor-not-allowed ${
      checked
        ? 'bg-emerald-50 border-emerald-200'
        : 'bg-slate-50 border-slate-200'
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className={`text-sm font-black ${checked ? 'text-emerald-700' : 'text-slate-800'}`}>
          {label}
        </p>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          {description}
        </p>
      </div>

      <span
        className={`w-11 h-6 rounded-full p-1 transition ${
          checked ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white transition ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
    </div>
  </button>
);

const AdminSettings = () => {
  const auth = useAuth();
  const me = auth?.user;

  const roles = useMemo(() => {
    const raw = auth?.roles ?? me?.roles ?? me?.role ?? [];
    return Array.isArray(raw) ? raw : [raw];
  }, [auth, me]);

  const isSuperAdmin = roles.some((r) => String(r).toLowerCase() === 'superadmin');

  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(loadSettings());
  }, []);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));

    window.dispatchEvent(
      new CustomEvent('vivipaw:site-settings-updated', {
        detail: form,
      })
    );

    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const reset = () => {
    setForm(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));

    window.dispatchEvent(
      new CustomEvent('vivipaw:site-settings-updated', {
        detail: DEFAULT_SETTINGS,
      })
    );

    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const disabled = !isSuperAdmin;

  return (
    <div>
      <PageHeader
        title="Ayarlar"
        subtitle="Sayt və admin panel məlumatları"
      />

      {saved && (
        <div className="fixed top-20 right-6 z-[80] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          ✅ Ayarlar yadda saxlandı
        </div>
      )}

      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <Avatar
                name={me?.fullName || me?.email}
                src={me?.imageUrl}
              />

              <div>
                <p className="font-black text-slate-900">
                  {me?.fullName || me?.userName || 'Admin'}
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  {me?.email}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-2.5">
                <LuUser size={15} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Hesab
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    Sistem administratoru
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <LuMail size={15} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    E-poçt
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {me?.email || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <LuShield size={15} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Rollar
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {roles.length ? roles.map((r) => (
                      <span
                        key={r}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${roleTone(r)}`}
                      >
                        {r}
                      </span>
                    )) : (
                      <span className="text-xs font-semibold text-slate-400">
                        —
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-3xl p-5">
            <p className="text-sm font-black text-sky-900 flex items-center gap-2">
              <LuBadgeInfo size={16} />
              Ayar icazəsi
            </p>

            <p className="text-xs font-semibold text-sky-700 leading-relaxed mt-2">
              Sayt məlumatlarını yalnız SuperAdmin dəyişə bilər. Adminlər bu məlumatları yalnız görə bilər.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
            <p className="text-sm font-black text-amber-900 flex items-center gap-2">
              <LuWrench size={16} />
              Texniki qeyd
            </p>

            <p className="text-xs font-semibold text-amber-700 leading-relaxed mt-2">
              Bu ayarlar hazırda frontend localStorage-da saxlanır. Bütün saytda real olaraq görünməsi üçün Navbar/Footer kimi komponentlər bu ayarları oxumalıdır. DB-də saxlamaq istəsən, ayrıca SiteSettings endpoint əlavə edərik.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <LuSettings size={18} />
                  Sayt məlumatları
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Logo, ad, əlaqə və sosial məlumatlar
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={reset}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LuRotateCcw size={14} />
                  Sıfırla
                </button>

                <button
                  onClick={save}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LuSave size={14} />
                  Yadda saxla
                </button>
              </div>
            </div>

            {!isSuperAdmin && (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-700">
                <LuX size={14} className="inline mr-1" />
                Siz SuperAdmin deyilsiniz. Ayarları dəyişmək icazəniz yoxdur.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                icon={LuPawPrint}
                label="Sayt adı"
                value={form.siteName}
                onChange={(v) => update('siteName', v)}
                placeholder="ViViPaw"
                disabled={disabled}
              />

              <Input
                icon={LuShield}
                label="Admin panel başlığı"
                value={form.panelTitle}
                onChange={(v) => update('panelTitle', v)}
                placeholder="Sistem Administratoru"
                disabled={disabled}
              />

              <Input
                icon={LuBadgeInfo}
                label="Slogan"
                value={form.slogan}
                onChange={(v) => update('slogan', v)}
                placeholder="Pet Adoption & Care"
                disabled={disabled}
              />

              <Input
                icon={LuImage}
                label="Logo URL"
                value={form.logoUrl}
                onChange={(v) => update('logoUrl', v)}
                placeholder="https://..."
                disabled={disabled}
              />

              <Input
                icon={LuMail}
                label="Əlaqə e-poçtu"
                value={form.contactEmail}
                onChange={(v) => update('contactEmail', v)}
                placeholder="support@vivipaw.com"
                disabled={disabled}
              />

              <Input
                icon={LuPhone}
                label="Dəstək telefonu"
                value={form.supportPhone}
                onChange={(v) => update('supportPhone', v)}
                placeholder="+994..."
                disabled={disabled}
              />

              <label className="block">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Şəhər
                </p>

                <div className="relative">
                  <LuMapPin
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={form.city}
                    disabled={disabled}
                    onChange={(e) => update('city', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">Şəhər seç</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <Input
                icon={LuMapPin}
                label="Ünvan"
                value={form.address}
                onChange={(v) => update('address', v)}
                placeholder="Bakı, Azərbaycan"
                disabled={disabled}
              />

              <Input
                icon={LuGlobe}
                label="Website"
                value={form.website}
                onChange={(v) => update('website', v)}
                placeholder="https://vivipaw.com"
                disabled={disabled}
              />

              <Input
                icon={LuInstagram}
                label="Instagram"
                value={form.instagram}
                onChange={(v) => update('instagram', v)}
                placeholder="@vivipaw"
                disabled={disabled}
              />

              <Input
                icon={LuFacebook}
                label="Facebook"
                value={form.facebook}
                onChange={(v) => update('facebook', v)}
                placeholder="vivipaw"
                disabled={disabled}
              />
            </div>

            <label className="block mt-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Footer mətni
              </p>

              <textarea
                value={form.footerText}
                disabled={disabled}
                onChange={(e) => update('footerText', e.target.value)}
                rows={3}
                placeholder="Footer mətni..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </label>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
              <LuWrench size={18} />
              Texniki ayarlar
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <Toggle
                label="Qeydiyyata icazə"
                description="Yeni istifadəçilərin qeydiyyatdan keçməsinə icazə verilsin."
                checked={form.allowRegistration}
                onChange={(v) => update('allowRegistration', v)}
                disabled={disabled}
              />

              <Toggle
                label="Texniki rejim"
                description="Sayt texniki baxış rejimindədir kimi işarələnsin."
                checked={form.maintenanceMode}
                onChange={(v) => update('maintenanceMode', v)}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
              <LuCheck size={18} />
              Ön baxış
            </h3>

            <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50">
              <div className="flex items-center gap-3">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt={form.siteName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white grid place-items-center">
                    <LuPawPrint size={26} />
                  </div>
                )}

                <div>
                  <p className="text-xl font-black text-slate-900">
                    {form.siteName}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {form.slogan}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-5 text-sm font-semibold text-slate-600">
                <p>
                  <LuMail size={14} className="inline mr-1" />
                  {form.contactEmail}
                </p>
                <p>
                  <LuPhone size={14} className="inline mr-1" />
                  {form.supportPhone}
                </p>
                <p>
                  <LuMapPin size={14} className="inline mr-1" />
                  {form.city}, {form.address}
                </p>
                <p>
                  <LuGlobe size={14} className="inline mr-1" />
                  {form.website}
                </p>
              </div>

              <p className="text-xs font-semibold text-slate-400 mt-5">
                {form.footerText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;