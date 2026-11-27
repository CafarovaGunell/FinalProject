import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Stethoscope,
  Wrench,
  CalendarDays,
  CalendarCheck,
  Save,
  Camera,
  AlertCircle,
  UserCheck,
  Ban,
  CheckCircle2,
  Clock,
  PawPrint,
  Phone,
  FileText,
  KeyRound,
  MapPin,
  X,
} from 'lucide-react';
import {
  vetApi,
  appointmentApi,
  uploadApi,
  authApi,
} from '../../../services/endpoints';
import { getError } from '../../../services/api';
import {
  CITIES,
  APPOINTMENT_STATUS_TEXT,
  APPOINTMENT_STATUS_COLOR,
} from '../../../utils/constants';
import { formatPrice, formatDateTime } from '../../../utils/helpers';

import VetServices from './VetServices';
import VetSchedule from './VetSchedule';

import StartChatButton from '../../components/chat/StartChatButton';
import { CHAT_TYPE } from '../../../utils/chat';

const inputCls =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition';

const labelCls =
  'text-[11px] font-bold uppercase tracking-wider text-slate-400';

const getService = (a) =>
  a.serviceName ||
  a.vetServiceName ||
  a.vetService?.name ||
  'Xidmət';

const getCustomer = (a) =>
  a.customerFullName ||
  a.customer?.fullName ||
  a.clientName ||
  'Müştəri';

const getPet = (a) =>
  a.petName ||
  a.pet?.name ||
  a.petInfo ||
  '';

const getAppointmentCustomerUserId = (a) =>
  a.customerUserId ||
  a.userId ||
  a.customerId ||
  a.clientUserId ||
  a.applicantUserId ||
  a.customer?.id;

const fromProfile = (profile) => ({
  clinicName: profile?.clinicName || '',
  specialty: profile?.specialty || '',
  experienceYears: profile?.experienceYears ?? '',
  licenseNumber: profile?.licenseNumber || '',
  bio: profile?.bio || '',
  imageUrl: profile?.imageUrl || '',
  phone: profile?.phone || '',
  city: profile?.city || 'Bakı',
  address: profile?.address || '',
});

/* ═══════════ KLİNİKA MƏLUMATLARI ═══════════ */
const VetInfo = ({ profile, onSaved, showToast }) => {
  const [form, setForm] = useState(fromProfile(profile));
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setForm(fromProfile(profile));
    }

    setLoaded(true);
  }, [profile]);

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const res = await uploadApi.single(file, 'vets');

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

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.clinicName.trim()) {
      return setError('Klinika adı mütləqdir.');
    }

    if (!form.specialty.trim()) {
      return setError('İxtisas mütləqdir.');
    }

    if (form.phone && form.phone.length !== 10) {
      return setError(
        'Telefon nömrəsi 10 rəqəm olmalıdır. Məsələn: 0553334455'
      );
    }

    if (!form.address.trim()) {
      return setError('Klinika ünvanı mütləqdir.');
    }

    setSaving(true);

    const payload = {
      ...form,
      clinicName: form.clinicName.trim(),
      specialty: form.specialty.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      experienceYears: Number(form.experienceYears) || 0,
    };

    try {
      const res = profile
        ? await vetApi.update({
          ...profile,
          ...payload,
        })
        : await vetApi.create(payload);

      if (!res?.success) {
        setError(res?.message || 'Klinika məlumatları yadda saxlanmadı.');
        return;
      }

      const savedProfile = {
        ...(res.data || profile),
        ...payload,
      };

      onSaved(savedProfile);
      showToast('✅ Klinika məlumatları yeniləndi');
    } catch (err) {
      setError(getError(err, 'Klinika məlumatları yadda saxlanmadı.'));
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return <div className="h-64 bg-white rounded-2xl animate-pulse" />;
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5 max-w-4xl"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl grid place-items-center">
          <Stethoscope size={22} />
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900">
            Klinika məlumatları
          </h2>
          <p className="text-xs text-slate-500">
            Müştərilərə görünəcək klinika və əlaqə məlumatları.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative">
          {form.imageUrl ? (
            <img
              src={form.imageUrl}
              alt={form.clinicName}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <Stethoscope size={30} />
            </div>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-2 rounded-xl shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
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
            onChange={uploadImage}
            className="hidden"
          />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-900">
            Klinika şəkli / loqosu
          </p>
          <p className="text-[11px] text-slate-400">
            Baytar siyahısında və klinika kartında görünəcək.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelCls}>Klinika adı *</label>
          <input
            value={form.clinicName}
            onChange={(e) => setForm({
              ...form,
              clinicName: e.target.value,
            })}
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>İxtisas *</label>
          <input
            value={form.specialty}
            onChange={(e) => setForm({
              ...form,
              specialty: e.target.value,
            })}
            placeholder="Məsələn: Cərrahiyyə"
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Təcrübə (il)</label>
          <input
            type="number"
            min="0"
            value={form.experienceYears}
            onChange={(e) => setForm({
              ...form,
              experienceYears: e.target.value,
            })}
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Lisenziya nömrəsi</label>
          <input
            value={form.licenseNumber}
            onChange={(e) => setForm({
              ...form,
              licenseNumber: e.target.value,
            })}
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Klinika telefonu *</label>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => {
              const phone = e.target.value
                .replace(/\D/g, '')
                .slice(0, 10);

              setForm({
                ...form,
                phone,
              });
            }}
            maxLength={10}
            placeholder="0553334455"
            className={inputCls}
          />

          <p className={`text-[10px] font-semibold ${
            form.phone.length === 10
              ? 'text-emerald-600'
              : 'text-slate-400'
          }`}>
            {form.phone.length}/10 rəqəm
          </p>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Şəhər *</label>
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
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Klinika ünvanı *</label>
        <input
          value={form.address}
          onChange={(e) => setForm({
            ...form,
            address: e.target.value,
          })}
          placeholder="Küçə, bina, mərtəbə"
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Klinika haqqında</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({
            ...form,
            bio: e.target.value,
          })}
          rows={4}
          className={inputCls + ' resize-none'}
        />
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition flex items-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Save size={15} />
            Klinika məlumatlarını yadda saxla
          </>
        )}
      </button>
    </form>
  );
};

/* ═══════════ HESAB TƏHLÜKƏSİZLİYİ ═══════════ */
const VetSecurity = ({ showToast }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.currentPassword) {
      return setError('Cari parolu daxil edin.');
    }

    if (form.newPassword.length < 6) {
      return setError('Yeni parol ən azı 6 simvol olmalıdır.');
    }

    if (form.newPassword !== form.confirmPassword) {
      return setError('Yeni parollar uyğun gəlmir.');
    }

    setSaving(true);

    try {
      const res = await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.newPassword,
      });

      if (!res?.success) {
        setError(res?.message || 'Parol dəyişdirilmədi.');
        return;
      }

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showToast('✅ Parol uğurla dəyişdirildi');
    } catch (err) {
      setError(getError(err, 'Parol dəyişdirilmədi.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-xl bg-white border border-slate-200 rounded-3xl p-6 space-y-4"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center">
          <KeyRound size={20} />
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900">
            Hesab təhlükəsizliyi
          </h2>
          <p className="text-xs text-slate-500">
            Klinika hesabının parolunu dəyişin.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className={labelCls}>Cari parol</label>
        <input
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm({
            ...form,
            currentPassword: e.target.value,
          })}
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Yeni parol</label>
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({
            ...form,
            newPassword: e.target.value,
          })}
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls}>Yeni parol (təkrar)</label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({
            ...form,
            confirmPassword: e.target.value,
          })}
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <KeyRound size={15} />
            Parolu dəyiş
          </>
        )}
      </button>
    </form>
  );
};

/* ═══════════ LƏĞV MODALI ═══════════ */
const CancelAppointmentModal = ({ data, onClose, onConfirm, saving }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      return setError('Ləğv səbəbini yazın.');
    }

    if (reason.trim().length < 5) {
      return setError('Səbəb ən azı 5 simvol olmalıdır.');
    }

    onConfirm(reason.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center">
            <Ban size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Randevunu ləğv et
            </h3>
            <p className="text-xs text-slate-500">
              {data?.customerName} adlı müştərinin randevusu
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelCls}>Ləğv səbəbi *</label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows={4}
              maxLength={300}
              placeholder="Məsələn: Baytar xəstədir, başqa vaxt təklif edin..."
              className={inputCls + ' resize-none'}
            />
            <p className="text-[10px] text-slate-400 text-right">
              {reason.length}/300
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
            >
              Geri
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Ban size={14} />
                  Ləğv et
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ═══════════ GƏLƏN RANDEVULAR ═══════════ */
const STATUS_FILTERS = [
  { v: '', l: 'Hamısı' },
  { v: '1', l: 'Gözləmədə' },
  { v: '2', l: 'Təsdiqlənib' },
  { v: '3', l: 'Tamamlandı' },
  { v: '4', l: 'Ləğv edildi' },
  { v: '5', l: 'Gəlmədi' },
];

const VetAppointments = ({ showToast }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [acting, setActing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const res = await appointmentApi.vetList(
        status || undefined,
        date || undefined
      );

      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.items || []);

      const hiddenIds = JSON.parse(
        localStorage.getItem('hiddenVetAppointmentIds') || '[]'
      );

      setList(
        data
          .filter((item) => !hiddenIds.includes(String(item.id)))
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      );
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [status, date]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const act = async (id, newStatus, cancelReason = null) => {
    setActing(id);

    try {
      const res = await appointmentApi.setStatus(id, newStatus, cancelReason);

      if (!res?.success) {
        showToast(res?.message || 'Status yenilənmədi.');
        return;
      }

      showToast('✅ Randevu statusu yeniləndi');
      fetchList();
    } catch (err) {
      showToast(getError(err, 'Status yenilənmədi.'));
    } finally {
      setActing(null);
      setCancelModal(null);
    }
  };

  const hideAppointment = (appointment) => {
    const id = String(appointment.id);

    const current = JSON.parse(
      localStorage.getItem('hiddenVetAppointmentIds') || '[]'
    );

    localStorage.setItem(
      'hiddenVetAppointmentIds',
      JSON.stringify([...new Set([...current, id])])
    );

    setList((prev) =>
      prev.filter((item) => String(item.id) !== id)
    );

    setDeleteId(null);
    showToast('🗂️ Randevu siyahıdan silindi');
  };

  const actionButton =
    'flex-1 py-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-50';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setStatus(v)}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition ${
              status === v
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {l}
          </button>
        ))}

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="ml-auto bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-400 font-semibold">
          Bu filtrə uyğun randevu yoxdur.
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((appointment) => {
            const isFinished = [3, 4, 5].includes(
              Number(appointment.status)
            );

            return (
              <div
                key={appointment.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">
                        {getCustomer(appointment)}
                      </h4>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${APPOINTMENT_STATUS_COLOR[appointment.status]}`}>
                        {APPOINTMENT_STATUS_TEXT[appointment.status]}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <FileText size={13} />
                      {getService(appointment)}
                    </p>

                    {getPet(appointment) && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <PawPrint size={13} className="text-emerald-500" />
                        {getPet(appointment)}
                      </p>
                    )}

                    {appointment.clientPhone && (
                      <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                        <Phone size={11} />
                        {appointment.clientPhone}
                      </p>
                    )}

                    {appointment.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        “{appointment.notes}”
                      </p>
                    )}

                    {appointment.cancelReason && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} />
                        {appointment.cancelReason}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm font-black text-slate-900 flex items-center gap-1.5 justify-end">
                      <Clock size={14} className="text-emerald-500" />
                      {formatDateTime(appointment.startTime)}
                    </p>

                    <p className="text-sm font-black text-emerald-600">
                      {formatPrice(
                        appointment.priceSnapshot ?? appointment.price
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <StartChatButton
                    type={CHAT_TYPE.APPOINTMENT}
                    appointmentId={appointment.id}
                    targetUserId={
                      getAppointmentCustomerUserId(appointment) || undefined
                    }
                    className="flex-1 min-w-[150px] py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  >
                    Müştəriyə yaz
                  </StartChatButton>

                  {appointment.status === 1 && (
                    <button
                      disabled={acting === appointment.id}
                      onClick={() => act(appointment.id, 2)}
                      className={actionButton + ' bg-emerald-600 hover:bg-emerald-700 text-white'}
                    >
                      <UserCheck size={13} />
                      Təsdiqlə
                    </button>
                  )}

                  {appointment.status === 2 && (
                    <>
                      <button
                        disabled={acting === appointment.id}
                        onClick={() => act(appointment.id, 3)}
                        className={actionButton + ' bg-sky-600 hover:bg-sky-700 text-white'}
                      >
                        <CheckCircle2 size={13} />
                        Tamamlandı
                      </button>

                      <button
                        disabled={acting === appointment.id}
                        onClick={() => act(appointment.id, 5)}
                        className={actionButton + ' bg-slate-200 hover:bg-slate-300 text-slate-700'}
                      >
                        Gəlmədi
                      </button>
                    </>
                  )}

                  {[1, 2].includes(Number(appointment.status)) && (
                    <button
                      disabled={acting === appointment.id}
                      onClick={() => setCancelModal({
                        id: appointment.id,
                        customerName: getCustomer(appointment),
                      })}
                      className={actionButton + ' bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'}
                    >
                      <Ban size={13} />
                      Ləğv
                    </button>
                  )}

                  {isFinished && (
                    deleteId === appointment.id ? (
                      <>
                        <button
                          onClick={() => hideAppointment(appointment)}
                          className="px-4 py-2 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-900 text-white transition"
                        >
                          Bəli, sil
                        </button>

                        <button
                          onClick={() => setDeleteId(null)}
                          className="px-4 py-2 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        >
                          Geri
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteId(appointment.id)}
                        className="px-4 py-2 rounded-lg text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 transition flex items-center gap-1"
                      >
                        <X size={13} />
                        Siyahıdan sil
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelModal && (
        <CancelAppointmentModal
          data={cancelModal}
          onClose={() => setCancelModal(null)}
          onConfirm={(reason) => act(cancelModal.id, 4, reason)}
          saving={acting === cancelModal.id}
        />
      )}
    </div>
  );
};

/* ═══════════ BAYTAR PANELİ ═══════════ */
const VetPanel = ({ initialTab }) => {
  const [tab, setTab] = useState(initialTab || 'info');
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    vetApi.me()
      .then((res) => {
        if (res?.success) {
          setProfile(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const tabs = [
    { v: 'info', l: 'Klinika məlumatları', icon: Stethoscope },
    { v: 'services', l: 'Xidmətlər', icon: Wrench },
    { v: 'schedule', l: 'Qrafik & Məzuniyyət', icon: CalendarDays },
    { v: 'appts', l: 'Gələn randevular', icon: CalendarCheck },
    { v: 'security', l: 'Hesab təhlükəsizliyi', icon: KeyRound },
  ];

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 pt-10">
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="h-36 bg-white rounded-3xl animate-pulse" />
          <div className="h-16 bg-white rounded-2xl animate-pulse" />
          <div className="h-80 bg-white rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          {profile?.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt={profile.clinicName}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <Stethoscope size={34} />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {profile?.clinicName || 'Baytar paneli'}
            </h1>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-semibold text-slate-500">
              {profile?.specialty && (
                <span className="text-emerald-600">
                  {profile.specialty}
                </span>
              )}

              {profile?.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-emerald-500" />
                  {profile.phone}
                </span>
              )}

              {profile?.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-emerald-500" />
                  {profile.city}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 mt-2">
              Xidmətləri, iş qrafikini və gələn randevuları idarə edin.
            </p>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 flex-wrap">
          {tabs.map(({ v, l, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                tab === v
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              {l}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <VetInfo
            profile={profile}
            showToast={showToast}
            onSaved={(savedProfile) => setProfile(savedProfile)}
          />
        )}

        {tab === 'services' && (
          <VetServices
            vetId={profile?.id}
            showToast={showToast}
          />
        )}

        {tab === 'schedule' && (
          <VetSchedule
            vetId={profile?.id}
            showToast={showToast}
          />
        )}

        {tab === 'appts' && (
          <VetAppointments showToast={showToast} />
        )}

        {tab === 'security' && (
          <VetSecurity showToast={showToast} />
        )}
      </div>
    </div>
  );
};

export default VetPanel;