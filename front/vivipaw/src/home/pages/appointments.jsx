import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, Stethoscope, PawPrint, X, CheckCircle2,
  XCircle, AlertCircle, Ban, UserCheck, CalendarCheck, FileText,
  Trash2,
} from 'lucide-react';
import { appointmentApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import {
  APPOINTMENT_STATUS_TEXT,
  APPOINTMENT_STATUS_COLOR,
} from '../../utils/constants';
import { formatDateTime, formatPrice } from '../../utils/helpers';

import StartChatButton from '../components/chat/StartChatButton';
import { CHAT_TYPE } from '../../utils/chat';

const STATUS_FILTERS = [
  { v: '', l: 'Hamısı' },
  { v: '1', l: 'Gözləmədə' },
  { v: '2', l: 'Təsdiqlənib' },
  { v: '3', l: 'Tamamlandı' },
  { v: '4', l: 'Ləğv edildi' },
  { v: '5', l: 'Gəlmədi' },
];

/* Müxtəlif DTO variantlarına qarşı müdafiəli oxuma */
const getClinic = (a) =>
  a.clinicName ||
  a.vetProfile?.clinicName ||
  a.veterinarianProfile?.clinicName ||
  'Klinika';

const getDoctor = (a) =>
  a.doctorName ||
  a.vetUserFullName ||
  a.vetProfile?.userFullName ||
  '';

const getService = (a) =>
  a.serviceName ||
  a.vetServiceName ||
  a.vetService?.name ||
  'Xidmət';

const getCustomer = (a) =>
  a.customerFullName ||
  a.customer?.fullName ||
  a.clientName ||
  '';

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

const getAppointmentVetUserId = (a) =>
  a.vetUserId ||
  a.veterinarianUserId ||
  a.veterinarianUser?.id ||
  a.vetProfile?.userId ||
  a.veterinarianProfile?.userId ||
  a.vetProfileUserId;

const getAppointmentVetProfileId = (a) =>
  a.vetProfileId ||
  a.veterinarianProfileId ||
  a.vetProfile?.id ||
  a.veterinarianProfile?.id;

/* ═══════════ LƏĞV MODALI ═══════════ */
const CancelModal = ({ appt, onClose, onDone }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await appointmentApi.cancel(
        appt.id,
        reason.trim() || undefined,
      );

      if (res?.success) {
        onDone();
      } else {
        setError(res?.message || 'Ləğv edilmədi.');
      }
    } catch (err) {
      setError(getError(err, 'Ləğv edilmədi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
            <XCircle size={22} />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Randevunu ləğv et
            </h3>
            <p className="text-[11px] text-slate-400">
              {getClinic(appt)} • {formatDateTime(appt.startTime)}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Səbəb (isteğe bağlı)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-rose-400 resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Ban size={16} />
                Ləğvi Təsdiqlə
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ═══════════ SƏHİFƏ ═══════════ */
const Appointments = () => {
  const { isVet } = useAuth();

  const [tab, setTab] = useState('customer');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [vetDate, setVetDate] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [acting, setActing] = useState(null);
  const [toast, setToast] = useState('');

  const [hiddenIds, setHiddenIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hiddenAppointmentIds') || '[]');
    } catch {
      return [];
    }
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const res = tab === 'vet'
        ? await appointmentApi.vetList(status || undefined, vetDate || undefined)
        : await appointmentApi.mine(status || undefined);

      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.items || []);

      let hidden = [];

      try {
        hidden = JSON.parse(
          localStorage.getItem('hiddenAppointmentIds') || '[]',
        );
      } catch {
        hidden = [];
      }

      setList(
        data.filter((item) => !hidden.includes(String(item.id))),
      );
    } catch (e) {
      console.error('Randevular yüklənmədi:', e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [tab, status, vetDate]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const act = async (id, newStatus, reason) => {
    setActing(id);

    try {
      const res = await appointmentApi.setStatus(id, newStatus, reason);

      if (res?.success) {
        showToast('✅ Status yeniləndi');
        fetchList();
      } else {
        showToast(res?.message || 'Xəta baş verdi.');
      }
    } catch (e) {
      showToast(getError(e, 'Xəta baş verdi.'));
    } finally {
      setActing(null);
    }
  };

  /*
    Backend-də appointmentApi.remove olmadığı üçün randevu silinmir.
    Sadəcə istifadəçinin ekranındakı siyahıdan gizlədilir.
  */
  const removeAppointment = (a) => {
    const confirmed = window.confirm(
      'Bu randevunu siyahınızdan silmək istəyirsiniz? Sonradan bu bölmədə görünməyəcək.',
    );

    if (!confirmed) return;

    const id = String(a.id);

    setHiddenIds((prev) => {
      const next = [...new Set([...prev, id])];
      localStorage.setItem('hiddenAppointmentIds', JSON.stringify(next));
      return next;
    });

    setList((prev) =>
      prev.filter((item) => String(item.id) !== id),
    );

    showToast('🗑️ Randevu siyahıdan silindi');
  };

  const VetActions = ({ a }) => {
    const busy = acting === a.id;

    const btn =
      'flex-1 py-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-50';

    return (
      <div className="flex flex-wrap gap-2">
        {a.status === 1 && (
          <button
            disabled={busy}
            onClick={() => act(a.id, 2)}
            className={btn + ' bg-emerald-600 hover:bg-emerald-700 text-white'}
          >
            <UserCheck size={13} />
            Təsdiqlə
          </button>
        )}

        {a.status === 2 && (
          <>
            <button
              disabled={busy}
              onClick={() => act(a.id, 3)}
              className={btn + ' bg-sky-600 hover:bg-sky-700 text-white'}
            >
              <CheckCircle2 size={13} />
              Tamamlandı
            </button>

            <button
              disabled={busy}
              onClick={() => act(a.id, 5)}
              className={btn + ' bg-slate-200 hover:bg-slate-300 text-slate-700'}
            >
              Gəlmədi
            </button>
          </>
        )}

        {(a.status === 1 || a.status === 2) && (
          <button
            disabled={busy}
            onClick={() => setCancelTarget(a)}
            className={btn + ' bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'}
          >
            <Ban size={13} />
            Ləğv
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {cancelTarget && (
        <CancelModal
          appt={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onDone={() => {
            setCancelTarget(null);
            showToast('Randevu ləğv edildi');
            fetchList();
          }}
        />
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        {/* BAŞLIQ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <CalendarCheck className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Randevularım
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Bütün görüşləriniz bir yerdə
              </p>
            </div>
          </div>

          <Link
            to="/vets"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-md shadow-emerald-600/15"
          >
            <Stethoscope size={15} />
            Yeni Randevu
          </Link>
        </div>

        {/* BAYTAR ÜÇÜN TAB */}
        {isVet && (
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit">
            {[
              { v: 'customer', l: 'Müştəri kimi' },
              { v: 'vet', l: 'Klinika tərəfi' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => {
                  setTab(v);
                  setStatus('');
                }}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition ${
                  tab === v
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {/* FİLTRLƏR */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setStatus(v)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition ${
                status === v
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {l}
            </button>
          ))}

          {tab === 'vet' && (
            <input
              type="date"
              value={vetDate}
              onChange={(e) => setVetDate(e.target.value)}
              className="ml-auto bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          )}
        </div>

        {/* SİYAHI */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-36 bg-white rounded-2xl animate-pulse border border-slate-100"
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-14 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-400 rounded-full grid place-items-center mx-auto">
              <Calendar size={30} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Randevu tapılmadı
            </h2>

            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {tab === 'vet'
                ? 'Bu filtrə uyğun görüş yoxdur.'
                : 'Hələ heç bir randevunuz yoxdur. Baytar seçib ilk görüşünüzü yaradın.'}
            </p>

            {tab === 'customer' && (
              <Link
                to="/vets"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition"
              >
                Baytarlara Bax
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                      <Stethoscope size={22} />
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {getClinic(a)}
                        </h3>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${APPOINTMENT_STATUS_COLOR[a.status]}`}>
                          {APPOINTMENT_STATUS_TEXT[a.status]}
                        </span>
                      </div>

                      {tab === 'vet' && getCustomer(a) && (
                        <p className="text-xs font-semibold text-slate-600">
                          👤 {getCustomer(a)}
                          {a.clientPhone && (
                            <span className="text-slate-400">
                              {' '}• {a.clientPhone}
                            </span>
                          )}
                        </p>
                      )}

                      {getDoctor(a) && tab === 'customer' && (
                        <p className="text-xs text-slate-400 font-semibold">
                          {getDoctor(a)}
                        </p>
                      )}

                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                        <FileText size={13} className="text-emerald-500" />
                        {getService(a)}
                      </p>

                      {getPet(a) && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <PawPrint size={13} className="text-emerald-500" />
                          {getPet(a)}
                        </p>
                      )}

                      {a.notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          “{a.notes}”
                        </p>
                      )}

                      {a.cancelReason && (
                        <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                          <AlertCircle size={12} />
                          {a.cancelReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 shrink-0">
                    <p className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Calendar size={14} className="text-emerald-500" />
                      {formatDateTime(a.startTime)}
                    </p>

                    <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock size={12} />
                      {a.endTime
                        ? new Date(a.endTime).toLocaleTimeString('az-AZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : ''}
                    </p>

                    <p className="text-sm font-black text-emerald-600">
                      {formatPrice(a.priceSnapshot ?? a.price)}
                    </p>
                  </div>
                </div>

                {/* ƏMƏLİYYATLAR */}
                <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <StartChatButton
                      type={CHAT_TYPE.APPOINTMENT}
                      appointmentId={a.id}
                      vetProfileId={
                        tab === 'customer'
                          ? getAppointmentVetProfileId(a) || undefined
                          : undefined
                      }
                      targetUserId={
                        tab === 'vet'
                          ? getAppointmentCustomerUserId(a) || undefined
                          : getAppointmentVetUserId(a) || undefined
                      }
                      className="flex-1 min-w-[150px] py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                    >
                      {tab === 'vet' ? 'Müştəriyə yaz' : 'Baytara yaz'}
                    </StartChatButton>

                    {tab === 'customer' && (a.status === 1 || a.status === 2) && (
                      <button
                        onClick={() => setCancelTarget(a)}
                        className="flex-1 min-w-[150px] py-2 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition flex items-center justify-center gap-1"
                      >
                        <Ban size={13} />
                        Ləğv et
                      </button>
                    )}

                    {/* Bitmiş randevular üçün yalnız siyahıdan gizlət */}
                    {tab === 'customer' && (a.status === 3 || a.status === 4 || a.status === 5) && (
                      <button
                        onClick={() => removeAppointment(a)}
                        className="flex-1 min-w-[150px] py-2 rounded-lg text-[11px] font-bold bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition flex items-center justify-center gap-1"
                      >
                        <Trash2 size={13} />
                        Siyahıdan sil
                      </button>
                    )}
                  </div>

                  {tab === 'vet' && <VetActions a={a} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;