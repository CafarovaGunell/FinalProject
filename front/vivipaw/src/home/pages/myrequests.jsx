import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Inbox, CheckCircle2, XCircle, Ban, AlertCircle, Phone,
  Home, PawPrint, User, Store, X, HeartHandshake,
} from 'lucide-react';
import { adoptionApi, petApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import { REQUEST_STATUS_TEXT, REQUEST_STATUS_COLOR, PLACEHOLDER_PET } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

const getPetName   = (r) => r.petName || r.pet?.name || 'Heyvan';
const getPetImg    = (r) => r.petMainImageUrl || r.petImageUrl || r.mainImageUrl || r.pet?.mainImageUrl || PLACEHOLDER_PET;
const getPetId     = (r) => r.petId || r.pet?.id;
const getApplicant = (r) => r.applicantFullName || r.applicant?.fullName || r.fullName || 'Naməlum';
const getOwner     = (r) => r.ownerFullName || r.shopName || r.petOwnerName || '';

const STATUS_FILTERS = [
  { v: '', l: 'Hamısı' },
  { v: '1', l: 'Gözləmədə' },
  { v: '2', l: 'Təsdiqləndi' },
  { v: '3', l: 'Rədd edildi' },
  { v: '4', l: 'Ləğv edildi' },
];

/* ═══════════ TƏSDİQ / RƏDD MODALI ═══════════ */
const ReviewModal = ({ req, approve, onClose, onDone }) => {
  const [note, setNote] = useState(approve ? 'Təbriklər! Sizinlə tezliklə əlaqə saxlayacağıq.' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await adoptionApi.review(req.id, { approve, reviewNote: note.trim() || undefined });
      if (res?.success) onDone();
      else setError(res?.message || 'Əməliyyat uğursuz oldu.');
    } catch (err) {
      setError(getError(err, 'Əməliyyat uğursuz oldu.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><X size={18} /></button>

        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${approve ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
            {approve ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{approve ? 'Müraciəti təsdiqlə' : 'Müraciəti rədd et'}</h3>
            <p className="text-[11px] text-slate-400">{getApplicant(req)} • {getPetName(req)}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            placeholder={approve ? 'Qeyd (isteğe bağlı)' : 'Rədd səbəbi (namizədə göstəriləcək)'}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 resize-none" />
          <button type="submit" disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 ${
              approve ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}>
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <>{approve ? 'Təsdiqlə' : 'Rədd et'}</>}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ═══════════ SƏHİFƏ ═══════════ */
const MyRequests = () => {
  const { isShop } = useAuth();
  const [tab, setTab] = useState('mine');
  const [hasPets, setHasPets] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [review, setReview] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [acting, setActing] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const showReceived = isShop || hasPets;

  useEffect(() => {
    petApi.mine()
      .then((r) => {
        const mine = Array.isArray(r?.data) ? r.data : (r?.data?.items || []);
        if (mine.length) setHasPets(true);
      })
      .catch(() => {});
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = tab === 'received' ? await adoptionApi.received() : await adoptionApi.mine();
      let data = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      if (status) data = data.filter((r) => String(r.status) === status);
      setList([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.error('Müraciətlər yüklənmədi:', e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [tab, status]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const cancel = async (id) => {
    setActing(id);
    try {
      const res = await adoptionApi.cancel(id);
      if (res?.success) { showToast('Müraciət ləğv edildi'); fetchList(); }
      else showToast(res?.message || 'Ləğv edilmədi.');
    } catch (e) {
      showToast(getError(e, 'Ləğv edilmədi.'));
    } finally {
      setActing(null); setConfirmId(null);
    }
  };

  const InfoChip = ({ icon: Icon, label, value }) => (
    <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
      <Icon size={12} className="text-indigo-500" /> {label}: {value}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {review && (
        <ReviewModal req={review.req} approve={review.approve} onClose={() => setReview(null)}
          onDone={() => { setReview(null); showToast(review.approve ? '✅ Müraciət təsdiqləndi' : 'Müraciət rədd edildi'); fetchList(); }} />
      )}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        {/* BAŞLIQ */}
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100"><HeartHandshake className="w-7 h-7" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Sahiblənmə Müraciətləri</h1>
            <p className="text-sm text-slate-500 mt-0.5">Müraciətlərinizi və cavabları izləyin</p>
          </div>
        </div>

        {/* TABLAR */}
        {showReceived && (
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit">
            {[{ v: 'mine', l: 'Müraciətlərim', icon: FileText }, { v: 'received', l: 'Gələn müraciətlər', icon: Inbox }].map(({ v, l, icon: Icon }) => (
              <button key={v} onClick={() => { setTab(v); setStatus(''); }}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition ${
                  tab === v ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}>
                <Icon size={14} /> {l}
              </button>
            ))}
          </div>
        )}

        {/* STATUS FİLTRİ */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ v, l }) => (
            <button key={v} onClick={() => setStatus(v)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition ${
                status === v ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}>{l}</button>
          ))}
        </div>

        {/* SİYAHı */}
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100" />)}</div>
        ) : list.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-14 text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-full grid place-items-center mx-auto">
              {tab === 'received' ? <Inbox size={30} /> : <FileText size={30} />}
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {tab === 'received' ? 'Gələn müraciət yoxdur' : 'Müraciət tapılmadı'}
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {tab === 'received'
                ? 'Elanlarınız üçün hələ müraciət edilməyib.'
                : 'Hələ heç bir heyvan üçün müraciət etməmisiniz.'}
            </p>
            {tab === 'mine' && (
              <Link to="/adopt" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition">
                <PawPrint size={15} /> Elanlara Bax
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((r) => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-shadow space-y-4">
                {/* ÜST SƏTİR */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <Link to={getPetId(r) ? `/adopt/${getPetId(r)}` : '#'} className="shrink-0">
                      <img src={getPetImg(r)} alt={getPetName(r)} className="w-16 h-16 rounded-2xl object-cover bg-slate-100" />
                    </Link>
                    <div className="min-w-0">
                      <Link to={getPetId(r) ? `/adopt/${getPetId(r)}` : '#'}>
                        <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition truncate">{getPetName(r)}</h3>
                      </Link>
                      {tab === 'mine' ? (
                        getOwner(r) && <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5"><Store size={11} /> Elan sahibi: {getOwner(r)}</p>
                      ) : (
                        <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                          <User size={11} className="text-indigo-500" /> {getApplicant(r)}
                          {r.phone && <span className="text-slate-400 flex items-center gap-1">• <Phone size={10} /> {r.phone}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md border ${REQUEST_STATUS_COLOR[r.status]}`}>
                      {REQUEST_STATUS_TEXT[r.status]}
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold">{r.dateText || formatDateTime(r.createdAt)}</p>
                  </div>
                </div>

                {/* MƏLUMAT */}
                <div className="flex flex-wrap gap-2">
                  {r.housingType && <InfoChip icon={Home} label="Yaşayış" value={r.housingType} />}
                  {r.hasOtherPets !== undefined && r.hasOtherPets !== null && (
                    <InfoChip icon={PawPrint} label="Başqa heyvan" value={r.hasOtherPets ? 'Var' : 'Yoxdur'} />
                  )}
                </div>
                {r.reason && (
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3.5 py-2.5 leading-relaxed italic">“{r.reason}”</p>
                )}

                {/* CAVAB QEYDİ */}
                {r.reviewNote && (r.status === 2 || r.status === 3) && (
                  <div className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-start gap-2 ${
                    r.status === 2 ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-600'
                  }`}>
                    {r.status === 2 ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> : <XCircle size={15} className="shrink-0 mt-0.5" />}
                    <span><b>{r.status === 2 ? 'Elan sahibi:' : 'Rədd səbəbi:'}</b> {r.reviewNote}</span>
                  </div>
                )}

                {/* ƏMƏLİYYATLAR */}
                {r.status === 1 && (
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    {tab === 'received' ? (
                      <>
                        <button disabled={acting === r.id} onClick={() => setReview({ req: r, approve: true })}
                          className="flex-1 py-2.5 rounded-xl text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                          <CheckCircle2 size={14} /> Təsdiqlə
                        </button>
                        <button disabled={acting === r.id} onClick={() => setReview({ req: r, approve: false })}
                          className="flex-1 py-2.5 rounded-xl text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                          <XCircle size={14} /> Rədd et
                        </button>
                      </>
                    ) : (
                      confirmId === r.id ? (
                        <>
                          <button disabled={acting === r.id} onClick={() => cancel(r.id)}
                            className="flex-1 py-2.5 rounded-xl text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                            {acting === r.id ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" /> : <Ban size={13} />}
                            Bəli, ləğv et
                          </button>
                          <button onClick={() => setConfirmId(null)}
                            className="flex-1 py-2.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
                            Geri
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmId(r.id)}
                          className="flex-1 py-2.5 rounded-xl text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition flex items-center justify-center gap-1.5">
                          <Ban size={13} /> Müraciəti ləğv et
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;