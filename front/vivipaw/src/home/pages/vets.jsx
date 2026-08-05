import React, { useState, useEffect, useMemo } from 'react';
import {
  FiActivity, FiMapPin, FiPhone, FiClock, FiAward, FiSearch, FiX,
  FiCheckCircle, FiAlertCircle, FiStar, FiCalendar, FiUser,
} from 'react-icons/fi';
import { vetApi, appointmentApi, categoryApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { DAY_NAMES, CATEGORY_TYPE } from '../../utils/constants';
import { formatPrice, toDateInput } from '../../utils/helpers';

import StartChatButton from '../components/chat/StartChatButton';
import { CHAT_TYPE } from '../../utils/chat';

/* ═══════════ RANDEVU MODALI ═══════════ */
const BookingModal = ({ vet, onClose }) => {
  const [services, setServices] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [service, setService] = useState(null);
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState(null);
  const [petType, setPetType] = useState('');
  const [petInfo, setPetInfo] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    vetApi.services(vet.id)
      .then((r) => r?.success && setServices(r.data || []))
      .catch(() => {});

    categoryApi.all(CATEGORY_TYPE.PET)
      .then((r) => r?.success && setPetTypes(r.data || []))
      .catch(() => {});
  }, [vet.id]);

  const dates = useMemo(() => {
    const arr = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }

    return arr;
  }, []);

  useEffect(() => {
    if (!service || !date) {
      setSlots([]);
      setSlot(null);
      return;
    }

    let alive = true;
    setSlotsLoading(true);

    appointmentApi.slots(vet.id, toDateInput(date), service.id)
      .then((r) => {
        if (!alive) return;

        const raw = Array.isArray(r?.data)
          ? r.data
          : (r?.data?.slots || []);

        setSlots(
          raw
            .map((s) => (
              typeof s === 'string'
                ? s
                : (s.startTime || s.start || s.time)
            ))
            .filter(Boolean)
        );

        setSlot(null);
      })
      .catch(() => alive && setSlots([]))
      .finally(() => alive && setSlotsLoading(false));

    return () => {
      alive = false;
    };
  }, [service, date, vet.id]);

  const onPhone = (e) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
  };

  const fmtTime = (iso) => {
    const d = new Date(iso);

    return isNaN(d)
      ? iso
      : d.toLocaleTimeString('az-AZ', {
        hour: '2-digit',
        minute: '2-digit',
      });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!service || !slot) {
      return setError('Xidmət və saat seçilməlidir.');
    }

    if (phone.length !== 10) {
      return setError('Telefon nömrəsi 10 rəqəm olmalıdır (məs: 0501234567).');
    }

    if (!petType) {
      return setError('Heyvan növü seçilməlidir.');
    }

    setSubmitting(true);

    try {
      const res = await appointmentApi.create({
        veterinarianProfileId: vet.id,
        vetServiceId: service.id,
        startTime: slot,
        clientPhone: phone,
        petId: null,
        petInfo: [petType, petInfo.trim()].filter(Boolean).join(', '),
        notes: notes.trim() || undefined,
      });

      if (res?.success) {
        setDone(true);
      } else {
        setError(res?.message || 'Randevu yaradılmadı.');
      }
    } catch (err) {
      setError(getError(err, 'Randevu yaradılmadı.'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition';
  const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

  if (done) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl max-w-sm w-full p-8 text-center space-y-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full grid place-items-center mx-auto">
            <FiCheckCircle size={34} />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Randevu yaradıldı!
          </h3>

          <p className="text-sm text-slate-500">
            {vet.clinicName} • {service?.name}
            <br />
            <span className="font-bold text-slate-700">
              {date?.toLocaleDateString('az-AZ')} {fmtTime(slot)}
            </span>
          </p>

          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition"
          >
            Bağla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl z-10"
        >
          <FiX size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-10">
          {vet.imageUrl ? (
            <img
              src={vet.imageUrl}
              alt=""
              className="w-12 h-12 rounded-2xl object-contain bg-emerald-50"
            />
          ) : (
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl grid place-items-center">
              <FiActivity size={22} />
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {vet.clinicName}
            </h3>

            <p className="text-[11px] text-slate-400 font-semibold">
              {vet.veterinarianFullName || vet.userFullName || vet.doctorName}
              {' • '}
              {vet.specialty}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2">
            <FiAlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <p className={labelCls}>1. Xidmət seçin</p>

            {services.length === 0 ? (
              <p className="text-xs text-slate-400">
                Xidmətlər yüklənir...
              </p>
            ) : (
              <div className="grid gap-2">
                {services.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      setService(s);
                      setSlot(null);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
                      service?.id === s.id
                        ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {s.name}
                      </p>

                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <FiClock size={11} />
                        {s.durationMinutes} dəq
                      </p>
                    </div>

                    <span className="text-sm font-black text-emerald-600">
                      {formatPrice(s.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {service && (
            <div className="space-y-2">
              <p className={labelCls}>2. Tarix seçin</p>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {dates.map((d) => {
                  const key = toDateInput(d);
                  const active = date && toDateInput(date) === key;

                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setDate(d)}
                      className={`shrink-0 w-16 py-2.5 rounded-xl border text-center transition ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <p className={`text-[10px] font-bold ${active ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {DAY_NAMES[d.getDay()]}
                      </p>

                      <p className="text-sm font-black">{d.getDate()}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {service && date && (
            <div className="space-y-2">
              <p className={labelCls}>3. Saat seçin</p>

              {slotsLoading ? (
                <div className="flex gap-2 flex-wrap">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-9 bg-slate-100 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
                  Bu tarixdə boş saat yoxdur. Başqa gün seçin.
                </p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {slots.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSlot(s)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition ${
                        slot === s
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                      }`}
                    >
                      {fmtTime(s)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {slot && (
            <div className="space-y-3">
              <p className={labelCls}>4. Əlaqə məlumatları</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelCls}>Telefon *</label>

                  <input
                    value={phone}
                    onChange={onPhone}
                    inputMode="numeric"
                    placeholder="0501234567"
                    className={inputCls}
                  />

                  <p className={`text-[10px] font-semibold ${
                    phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {phone.length}/10 rəqəm
                  </p>
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Heyvan növü *</label>

                  <select
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                    className={inputCls + ' cursor-pointer'}
                  >
                    <option value="">Seçin...</option>
                    {petTypes.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>
                  Heyvanın adı, yaşı (ixtiyari)
                </label>

                <input
                  value={petInfo}
                  onChange={(e) => setPetInfo(e.target.value)}
                  placeholder="Məs: Rex, 3 yaş"
                  className={inputCls}
                />
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Şikayət və ya qeyd (ixtiyari)"
                className={inputCls + ' resize-none'}
              />
            </div>
          )}

          {slot && (
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-600/20"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <FiCalendar size={16} />
                  Randevunu Təsdiqlə
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

/* ═══════════ SƏHİFƏ ═══════════ */
const Vets = () => {
  const { user } = useAuth();

  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bookingVet, setBookingVet] = useState(null);
  const [authModal, setAuthModal] = useState(false);

  useEffect(() => {
    vetApi.list({ pageSize: 50 })
      .then((r) => {
        if (r?.success) {
          const list = Array.isArray(r.data)
            ? r.data
            : (r.data?.items || []);

          setVets(list.filter((v) => !v.approvalStatus || v.approvalStatus === 2));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Klinika, həkim, ixtisas, şəhər, telefon və bio üzrə anlıq axtarış */
  const filtered = vets.filter((v) => {
    const q = search.trim().toLowerCase();

    if (!q) return true;

    return [
      v.clinicName,
      v.veterinarianFullName,
      v.userFullName,
      v.doctorName,
      v.specialty,
      v.city,
      v.phone,
      v.bio,
    ].some((value) => (value || '').toLowerCase().includes(q));
  });

  const openBooking = (vet) => {
    if (!user) {
      setAuthModal(true);
      return;
    }

    setBookingVet(vet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50 text-slate-800 antialiased pb-16">
      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
      />

      {bookingVet && (
        <BookingModal
          vet={bookingVet}
          onClose={() => setBookingVet(null)}
        />
      )}

      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 py-14 sm:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-200 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold">
            <FiStar size={13} />
            Peşəkar və təsdiqli baytarlar
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Baytar Randevusu 🩺
          </h1>

          <p className="text-emerald-100/85 max-w-xl mx-auto text-sm sm:text-base">
            Kliniki seçin, boş saatı görün və bir kliklə randevu yazın.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 space-y-7">
        {/* AXTARIŞ */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50">
          <div className="relative">
            <FiSearch
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Klinika, həkim, ixtisas və ya şəhər axtar..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-3 text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />

            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                title="Axtarışı təmizlə"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {!loading && (
          <p className="text-xs text-slate-500 font-semibold px-1">
            <span className="text-emerald-600 font-bold">
              {filtered.length}
            </span>
            {' '}baytar tapıldı
          </p>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[430px] bg-white rounded-2xl animate-pulse border border-slate-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* BOŞ NƏTİCƏ */
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
            <FiActivity className="mx-auto text-slate-300 mb-3" size={40} />

            <p className="text-sm font-semibold text-slate-600">
              Axtarışa uyğun baytar tapılmadı.
            </p>

            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
              >
                Axtarışı təmizlə
              </button>
            )}
          </div>
        ) : (
          /* KARTLAR */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v) => (
              <div
                key={v.id}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* ŞƏKİL: object-contain həkimin şəklini tam göstərir */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-100 via-teal-50 to-slate-100 overflow-hidden">
                  <img
                    src={
                      v.imageUrl ||
                      `https://placehold.co/600x400/d1fae5/059669?text=${encodeURIComponent(v.clinicName || 'Vet')}`
                    }
                    alt={v.clinicName || 'Baytar'}
                    className="w-full h-full object-contain p-1 group-hover:scale-[1.03] transition-transform duration-500"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/25 to-transparent pointer-events-none" />

                  {v.specialty && (
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md">
                      {v.specialty}
                    </span>
                  )}

                  {v.experienceYears !== null && v.experienceYears !== undefined && (
                    <span className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                      <FiAward size={11} />
                      {v.experienceYears} il təcrübə
                    </span>
                  )}
                </div>

                {/* MƏLUMATLAR */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                      {v.clinicName}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full grid place-items-center shrink-0">
                        <FiUser size={11} />
                      </div>

                      <p className="text-xs text-slate-500 font-semibold truncate">
                        {v.veterinarianFullName || v.userFullName || v.doctorName || 'Baytar həkim'}
                      </p>
                    </div>
                  </div>

                  {v.bio && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {v.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {v.city && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                        <FiMapPin size={11} />
                        {v.city}
                      </span>
                    )}

                    {v.phone && (
                      <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                        <FiPhone size={11} />
                        {v.phone}
                      </span>
                    )}
                  </div>

                  {/* DÜYMƏLƏR YAN-YANA */}
                  <div className="mt-auto pt-1 grid grid-cols-2 gap-2">
                    <StartChatButton
                      type={CHAT_TYPE.DIRECT}
                      vetProfileId={v.id}
                      targetUserId={
                        v.userId ||
                        v.appUserId ||
                        v.veterinarianUserId ||
                        v.vetUserId ||
                        undefined
                      }
                      className="w-full !py-2.5 !px-2 rounded-xl text-xs whitespace-nowrap"
                    >
                      Baytara yaz
                    </StartChatButton>

                    <button
                      onClick={() => openBooking(v)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md shadow-emerald-600/20"
                    >
                      <FiCalendar size={14} />
                      Randevu yaz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vets;