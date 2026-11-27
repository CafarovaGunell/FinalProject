import React, { useState, useEffect, useCallback } from 'react';
import {
  Quote,
  Heart,
  Star,
  X,
  Send,
  ImagePlus,
  Trash2,
  Clock,
  Sparkles,
  MessageSquareHeart,
  Pencil,
  Save,
} from 'lucide-react';

import { testimonialApi, uploadApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { formatDate } from '../../utils/helpers';

/*
  Backend-dən gələn user id:
  bəzən userId,
  bəzən appUserId kimi gələ bilər.
*/
const getUid = (testimonial) =>
  testimonial.userId ?? testimonial.appUserId ?? null;

const getDate = (testimonial) =>
  testimonial.dateText || formatDate(testimonial.createdAt);

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

    setUploading(true);
    setError('');

    try {
      const res = await uploadApi.single(file, 'testimonials');

      const url =
        res?.data?.url ||
        res?.data?.imageUrl ||
        res?.data?.fileUrl ||
        res?.data;

      if (typeof url === 'string' && url) {
        setImageUrl(url);
      } else {
        setError('Şəkil yüklənmədi.');
      }
    } catch (err) {
      setError(getError(err, 'Şəkil yüklənmədi.'));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    setError('');

    if (!comment.trim()) {
      setError('Rəy mətni boş ola bilməz.');
      return;
    }

    setSending(true);

    try {
      const res = await testimonialApi.create({
        rating,
        comment: comment.trim(),
        petImageUrl: imageUrl || undefined,
      });

      if (res?.success) {
        onDone();
      } else {
        setError(res?.message || 'Rəy göndərilmədi.');
      }
    } catch (err) {
      setError(getError(err, 'Rəy göndərilmədi.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={sending || uploading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
            <MessageSquareHeart size={22} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Rəy yaz
            </h3>

            <p className="text-[11px] text-slate-400">
              Təcrübənizi icma ilə paylaşın
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Qiymətləndirmə
            </p>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={28}
                    className={`transition ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Rəyiniz *
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Platformadan istifadə təcrübəniz, sahiblənmə hekayəniz..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-rose-400 focus:bg-white resize-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Heyvan şəkli (istəyə bağlı)
            </p>

            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-40 object-cover"
                />

                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg text-slate-500 hover:text-rose-500"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-xl py-5 cursor-pointer text-xs font-bold text-slate-400 hover:text-rose-500 transition">
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-rose-400 border-t-transparent" />
                ) : (
                  <ImagePlus size={18} />
                )}

                {uploading ? 'Yüklənir...' : 'Şəkil əlavə et'}

                <input
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={sending || uploading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-500/20"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send size={16} />
                Göndər
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <Clock size={11} />
            Rəyiniz admin təsdiqindən sonra dərc olunacaq
          </p>
        </form>
      </div>
    </div>
  );
};

/* ═══════════ RƏY REDAKTƏ MODALI ═══════════ */
const EditModal = ({ testimonial, onClose, onDone }) => {
  const [rating, setRating] = useState(testimonial.rating || 5);
  const [comment, setComment] = useState(testimonial.comment || '');
  const [imageUrl, setImageUrl] = useState(
    testimonial.petImageUrl || ''
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const res = await uploadApi.single(file, 'testimonials');

      const url =
        res?.data?.url ||
        res?.data?.imageUrl ||
        res?.data?.fileUrl ||
        res?.data;

      if (typeof url === 'string' && url) {
        setImageUrl(url);
      } else {
        setError('Şəkil yüklənmədi.');
      }
    } catch (err) {
      setError(getError(err, 'Şəkil yüklənmədi.'));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError('Rəy mətni boş ola bilməz.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await testimonialApi.update(testimonial.id, {
        rating,
        comment: comment.trim(),
        petImageUrl: imageUrl || undefined,
      });

      if (res?.success) {
        onDone();
      } else {
        setError(res?.message || 'Rəy yenilənmədi.');
      }
    } catch (err) {
      setError(getError(err, 'Rəy yenilənmədi.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving || uploading}
          className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 p-2 rounded-xl transition disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 pr-10">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <Pencil size={21} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Rəyi redaktə et
            </h3>

            <p className="text-[11px] text-slate-400">
              Dəyişiklikdən sonra rəy yenidən təsdiqə göndəriləcək
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Qiymətləndirmə
            </p>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={28}
                    className={
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 hover:text-amber-200'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Rəyiniz *
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="Rəyinizi yazın..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-rose-400 focus:bg-white resize-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Heyvan şəkli
            </p>

            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-40 object-cover"
                />

                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg text-slate-500 hover:text-rose-500"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-xl py-5 cursor-pointer text-xs font-bold text-slate-400 hover:text-rose-500 transition">
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-rose-400 border-t-transparent" />
                ) : (
                  <ImagePlus size={18} />
                )}

                {uploading ? 'Yüklənir...' : 'Şəkil əlavə et'}

                <input
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save size={16} />
                Dəyişiklikləri yadda saxla
              </>
            )}
          </button>
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
  const [editing, setEditing] = useState(null);

  const [authModal, setAuthModal] = useState(false);
  const [actingId, setActingId] = useState(null);

  const [toast, setToast] = useState('');

  /*
    Burada həm user.userId,
    həm user.id yoxlanılır.
  */
 const currentUserId =
  user?.userId ??
  user?.id ??
  user?.appUserId ??
  null;

  const showToast = (msg) => {
    setToast(msg);

    setTimeout(() => {
      setToast('');
    }, 5000);
  };

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const res = await testimonialApi.list();

      const data = Array.isArray(res?.data)
        ? res.data
        : res?.data?.items || [];

      setList(
        [...data].sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      console.error('Rəylər yüklənmədi:', error);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const like = async (testimonial) => {
    if (!user) {
      setAuthModal(true);
      return;
    }

    setActingId(testimonial.id);

    try {
      await testimonialApi.like(testimonial.id);

      setList((previous) =>
        previous.map((item) =>
          item.id === testimonial.id
            ? {
                ...item,
                isLikedByCurrentUser:
                  !item.isLikedByCurrentUser,
                likesCount:
                  (item.likesCount || 0) +
                  (item.isLikedByCurrentUser ? -1 : 1),
              }
            : item
        )
      );
    } catch (error) {
      showToast(getError(error, 'Bəyənilmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const remove = async (testimonial) => {
    setActingId(testimonial.id);

    try {
      const res = await testimonialApi.remove(testimonial.id);

      if (res?.success) {
        setList((previous) =>
          previous.filter(
            (item) => item.id !== testimonial.id
          )
        );

        showToast('🗑️ Rəy silindi.');
      } else {
        showToast(res?.message || 'Rəy silinə bilmədi.');
      }
    } catch (error) {
      showToast(getError(error, 'Rəy silinə bilmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const openWrite = () => {
    if (!user) {
      setAuthModal(true);
      return;
    }

    setWriteOpen(true);
  };

  const avg = list.length
    ? list.reduce(
        (sum, testimonial) =>
          sum + (testimonial.rating || 0),
        0
      ) / list.length
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
      />

      {writeOpen && (
        <WriteModal
          onClose={() => setWriteOpen(false)}
          onDone={() => {
            setWriteOpen(false);

            showToast(
              '💌 Rəyiniz göndərildi! Təsdiqdən sonra dərc olunacaq.'
            );
          }}
        />
      )}

      {editing && (
        <EditModal
          testimonial={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            /*
              Redaktədən sonra backend rəyə Pending statusu verir.
              Ona görə public siyahıdan çıxarırıq.
            */
            setList((previous) =>
              previous.filter(
                (item) => item.id !== editing.id
              )
            );

            setEditing(null);

            showToast(
              '✅ Rəy yeniləndi. Admin təsdiqindən sonra yenidən dərc olunacaq.'
            );
          }}
        />
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl text-center max-w-[90vw]">
          {toast}
        </div>
      )}

      {/* HERO */}
      <div className="bg-gradient-to-b from-rose-900/5 via-slate-50 to-transparent py-12 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-[11px] font-bold">
            <Sparkles size={13} />
            İcmamızın səsi
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Xoşbəxt Ailələrimiz 💌
          </h1>

          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            viviPaw istifadəçilərinin real hekayələri və təcrübələri.
          </p>

          {list.length > 0 && (
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900 flex items-center justify-center gap-1">
                  {avg.toFixed(1)}
                  <Star
                    size={18}
                    className="text-amber-400 fill-amber-400"
                  />
                </p>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Orta reytinq
                </p>
              </div>

              <div className="w-px h-10 bg-slate-200" />

              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">
                  {list.length}
                </p>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Dərc olunmuş rəy
                </p>
              </div>
            </div>
          )}

          <button
            onClick={openWrite}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-rose-500/20"
          >
            <Send size={15} />
            Rəy Yaz
          </button>
        </div>
      </div>

      {/* RƏYLƏR */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-52 bg-white rounded-2xl animate-pulse border border-slate-100"
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-14 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full grid place-items-center mx-auto">
              <Quote size={30} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Hələ rəy yoxdur
            </h2>

            <p className="text-sm text-slate-500">
              İlk rəyi siz yazın — hekayəniz başqalarına ilham verə bilər!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {list.map((testimonial) => {
              const reviewUserId = getUid(testimonial);

              /*
                Əsas düzəliş budur.
                Number ilə müqayisə edilir, çünki
                biri string, biri number olsa da işləyəcək.
              */
              const mine =
                currentUserId !== null &&
                reviewUserId !== null &&
                Number(reviewUserId) === Number(currentUserId);

              return (
                <div
                  key={testimonial.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  <Quote className="absolute right-5 top-5 text-slate-100 h-14 w-14" />

                  <div className="relative z-10 space-y-4 flex-1 flex flex-col">
                    <div className="flex gap-0.5 text-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={
                            star <= testimonial.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>

                    <p className="text-slate-600 italic text-sm leading-relaxed flex-1">
                      “{testimonial.comment}”
                    </p>

                    {testimonial.petImageUrl && (
                      <img
                        src={testimonial.petImageUrl}
                        alt=""
                        className="w-full h-44 object-cover rounded-xl border border-slate-100"
                      />
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        {testimonial.userImageUrl ? (
                          <img
                            src={testimonial.userImageUrl}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full grid place-items-center font-bold text-sm shrink-0">
                            {(testimonial.userFullName || 'U')
                              .charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {testimonial.userFullName || 'İstifadəçi'}
                          </p>

                          <p className="text-[11px] text-slate-400 font-semibold">
                            {getDate(testimonial)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => like(testimonial)}
                          disabled={actingId === testimonial.id}
                          className={`text-xs font-bold px-3 py-2 rounded-lg border transition flex items-center gap-1.5 disabled:opacity-50 ${
                            testimonial.isLikedByCurrentUser
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                          }`}
                        >
                          <Heart
                            size={13}
                            fill={
                              testimonial.isLikedByCurrentUser
                                ? 'currentColor'
                                : 'none'
                            }
                          />

                          {testimonial.likesCount || 0}
                        </button>

                        {/* ÖZ RƏYİNƏ AİD DÜYMƏLƏR */}
                        {mine && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setEditing(testimonial)
                              }
                              disabled={
                                actingId === testimonial.id
                              }
                              className="p-2 text-slate-300 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition disabled:opacity-50"
                              title="Redaktə et"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                remove(testimonial)
                              }
                              disabled={
                                actingId === testimonial.id
                              }
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                              title="Sil"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
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