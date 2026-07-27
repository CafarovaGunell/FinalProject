import React, { useState, useEffect, useCallback } from 'react';
import {
  Quote, Heart, Star, X, Send, ImagePlus, Trash2, Clock, Sparkles, MessageSquareHeart,
} from 'lucide-react';
import { testimonialApi, uploadApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { formatDate } from '../../utils/helpers';

const getUid  = (t) => t.userId ?? t.appUserId;
const getDate = (t) => t.dateText || formatDate(t.createdAt);

/* ═══════════ RƏY YAZMA MODALI ═══════════ */
const WriteModal = ({ onClose, onDone }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const res = await uploadApi.single(file, 'testimonials');
      const url = res?.data?.url || res?.data || res?.data?.imageUrl;
      if (url) setImageUrl(typeof url === 'string' ? url : '');
      else setError('Şəkil yüklənmədi.');
    } catch (err) {
      setError(getError(err, 'Şəkil yüklənmədi.'));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!comment.trim()) return setError('Rəy mətni boş ola bilməz.');
    setSending(true);
    try {
      const res = await testimonialApi.create({
        rating,
        comment: comment.trim(),
        petImageUrl: imageUrl || undefined,
      });
      if (res?.success) onDone();
      else setError(res?.message || 'Rəy göndərilmədi.');
    } catch (err) {
      setError(getError(err, 'Rəy göndərilmədi.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><X size={18} /></button>

        <div className="flex items-center gap-3 pr-10">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl"><MessageSquareHeart size={22} /></div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Rəy yaz</h3>
            <p className="text-[11px] text-slate-400">Təcrübənizi icma ilə paylaşın</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Qiymətləndirmə</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <button type="button" key={s} onClick={() => setRating(s)}>
                  <Star size={28} className={`transition ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 hover:text-amber-200'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rəyiniz *</p>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
              placeholder="Platformadan istifadə təcrübəniz, sahiblənmə hekayəniz..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-rose-400 focus:bg-white resize-none transition" />
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Heyvan şəkli (isteğe bağlı)</p>
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img src={imageUrl} alt="" className="w-full h-40 object-cover" />
                <button type="button" onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg text-slate-500 hover:text-rose-500"><X size={15} /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-xl py-5 cursor-pointer text-xs font-bold text-slate-400 hover:text-rose-500 transition">
                {uploading
                  ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-rose-400 border-t-transparent" />
                  : <ImagePlus size={18} />}
                {uploading ? 'Yüklənir...' : 'Şəkil əlavə et'}
                <input type="file" accept="image/*" onChange={onFile} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          <button type="submit" disabled={sending || uploading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-500/20">
            {sending ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Send size={16} /> Göndər</>}
          </button>
          <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <Clock size={11} /> Rəyiniz admin təsdiqindən sonra dərc olunacaq
          </p>
        </form>
      </div>
    </div>
  );
};

/* ═══════════ SƏHİFƏ ═══════════ */
const Testimonials = () => {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [writeOpen, setWriteOpen] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await testimonialApi.list();
      const data = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      setList([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.error('Rəylər yüklənmədi:', e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const like = async (t) => {
    if (!user) return setAuthModal(true);
    setActingId(t.id);
    try {
      await testimonialApi.like(t.id);
      setList((p) => p.map((x) => x.id === t.id ? {
        ...x,
        isLikedByCurrentUser: !x.isLikedByCurrentUser,
        likesCount: (x.likesCount || 0) + (x.isLikedByCurrentUser ? -1 : 1),
      } : x));
    } catch (e) {
      showToast(getError(e, 'Bəyənilmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const remove = async (t) => {
    setActingId(t.id);
    try {
      const res = await testimonialApi.remove(t.id);
      if (res?.success) { setList((p) => p.filter((x) => x.id !== t.id)); showToast('Rəy silindi'); }
      else showToast(res?.message || 'Silinmədi.');
    } catch (e) {
      showToast(getError(e, 'Silinmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const openWrite = () => {
    if (!user) return setAuthModal(true);
    setWriteOpen(true);
  };

  const avg = list.length ? list.reduce((s, t) => s + (t.rating || 0), 0) / list.length : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} />
      {writeOpen && (
        <WriteModal onClose={() => setWriteOpen(false)}
          onDone={() => { setWriteOpen(false); showToast('💌 Rəyiniz göndərildi! Təsdiqdən sonra dərc olunacaq.'); }} />
      )}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}

      {/* HERO */}
      <div className="bg-gradient-to-b from-rose-900/5 via-slate-50 to-transparent py-12 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-[11px] font-bold">
            <Sparkles size={13} /> İcmamızın səsi
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Xoşbəxt Ailələrimiz 💌</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            viviPaw istifadəçilərinin real hekayələri və təcrübələri.
          </p>

          {list.length > 0 && (
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 flex items-center justify-center gap-1">
                  {avg.toFixed(1)} <Star size={18} className="text-amber-400 fill-amber-400" />
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orta reytinq</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{list.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dərc olunmuş rəy</p>
              </div>
            </div>
          )}

          <button onClick={openWrite}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-rose-500/20">
            <Send size={15} /> Rəy Yaz
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-52 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-14 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full grid place-items-center mx-auto">
              <Quote size={30} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Hələ rəy yoxdur</h2>
            <p className="text-sm text-slate-500">İlk rəyi siz yazın — hekayəniz başqalarına ilham verə bilər!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {list.map((t) => {
              const mine = user && getUid(t) === user.userId;
              return (
                <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  <Quote className="absolute right-5 top-5 text-slate-100 h-14 w-14" />

                  <div className="relative z-10 space-y-4 flex-1 flex flex-col">
                    <div className="flex gap-0.5 text-sm">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={15} className={s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                      ))}
                    </div>

                    <p className="text-slate-600 italic text-sm leading-relaxed flex-1">“{t.comment}”</p>

                    {t.petImageUrl && (
                      <img src={t.petImageUrl} alt="" className="w-full h-44 object-cover rounded-xl border border-slate-100" />
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        {t.userImageUrl
                          ? <img src={t.userImageUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                          : <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full grid place-items-center font-bold text-sm shrink-0">
                              {(t.userFullName || 'U').charAt(0)}
                            </div>}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{t.userFullName}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{getDate(t)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => like(t)} disabled={actingId === t.id}
                          className={`text-xs font-bold px-3 py-2 rounded-lg border transition flex items-center gap-1.5 ${
                            t.isLikedByCurrentUser
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                          }`}>
                          <Heart size={13} fill={t.isLikedByCurrentUser ? 'currentColor' : 'none'} /> {t.likesCount || 0}
                        </button>
                        {mine && (
                          <button onClick={() => remove(t)} disabled={actingId === t.id}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition" title="Sil">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;