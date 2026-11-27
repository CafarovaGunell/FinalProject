import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBasket,
  Minus,
  Plus,
  Store,
  MapPin,
  Star,
  ChevronLeft,
  Package,
  Tag,
  AlertCircle,
  Send,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react';

import { productApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { PLACEHOLDER_PRODUCT } from '../../utils/constants';
import { formatPrice, formatDate, getPetIcon } from '../../utils/helpers';
import StartChatButton from '../components/chat/StartChatButton';
import { CHAT_TYPE } from '../../utils/chat';

const getShop = (p) =>
  p.petShopName || p.shopName || p.petShop?.name || '';

const getCity = (p) =>
  p.city || p.shopCity || p.petShop?.city || '';

const getCat = (p) =>
  p.categoryName || p.category?.name || '';

const getAnimal = (p) =>
  p.targetAnimalName ||
  p.targetAnimalCategoryName ||
  p.targetCategoryName ||
  '';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [debug, setDebug] = useState('');

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const [authModal, setAuthModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');

  // Yeni rəy formu
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });

  const [sendingReview, setSendingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Redaktə formu
  const [editingReview, setEditingReview] = useState(null);

  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: '',
  });

  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Silinən rəyin id-si
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const currentUserId = user?.userId ?? user?.id;

  const showToast = (msg) => {
    setToast(msg);

    setTimeout(() => {
      setToast('');
    }, 3200);
  };

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
  }, [id]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setDebug('');

    try {
      let pRes = null;

      try {
        pRes = await productApi.byId(id);
      } catch (e) {
        const status = e?.response?.status || 'network';

        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.title ||
          e?.message ||
          '';

        setDebug(`HTTP ${status} — ${msg}`);
        pRes = null;
      }

      if (pRes?.success && pRes.data) {
        setProduct(pRes.data);
        setNotFound(false);
      } else {
        setDebug(pRes?.message || 'Backend success=false qaytardı');
        setNotFound(true);
      }

      const rRes = await productApi.reviews(id).catch(() => null);

      if (rRes?.success) {
        const list = Array.isArray(rRes.data)
          ? rRes.data
          : rRes.data?.items || [];

        // Backend artıq yalnız approved rəyləri göndərirsə,
        // bu filter əlavə təhlükəsizlik üçündür.
        setReviews(list.filter((r) => r.isApproved !== false));
      } else {
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAdd = async () => {
    if (!user) {
      setAuthModal(true);
      return;
    }

    if (!product || product.stockQuantity <= 0) return;

    setAdding(true);

    try {
      const res = await addToCart(product.id, qty);

      showToast(
        res?.success
          ? '✅ Səbətə əlavə olundu'
          : res?.message || 'Əlavə edilmədi.'
      );
    } catch (err) {
      showToast(getError(err, 'Səbətə əlavə edilmədi.'));
    } finally {
      setAdding(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      setAuthModal(true);
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewError('Rəy mətni boş ola bilməz.');
      return;
    }

    setReviewError('');
    setSendingReview(true);

    try {
      const res = await productApi.addReview({
        productId: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      if (res?.success) {
        showToast(
          '✅ Rəyiniz göndərildi. Admin təsdiqindən sonra dərc olunacaq.'
        );

        setReviewForm({
          rating: 5,
          comment: '',
        });

     
      } else {
        setReviewError(res?.message || 'Rəy göndərilmədi.');
      }
    } catch (err) {
      setReviewError(getError(err, 'Rəy göndərilmədi.'));
    } finally {
      setSendingReview(false);
    }
  };

  const openEditReview = (review) => {
    setEditError('');

    setEditingReview(review);

    setEditForm({
      rating: review.rating || 5,
      comment: review.comment || '',
    });
  };

  const closeEditReview = () => {
    if (savingEdit) return;

    setEditingReview(null);

    setEditForm({
      rating: 5,
      comment: '',
    });

    setEditError('');
  };

  const submitEditReview = async (e) => {
    e.preventDefault();

    if (!editingReview) return;

    if (!editForm.comment.trim()) {
      setEditError('Rəy mətni boş ola bilməz.');
      return;
    }

    setSavingEdit(true);
    setEditError('');

    try {
      const res = await productApi.updateReview(editingReview.id, {
        productId: product.id,
        rating: editForm.rating,
        comment: editForm.comment.trim(),
      });

      if (res?.success) {
        setEditingReview(null);

        showToast(
          '✅ Rəy yeniləndi. Admin təsdiqindən sonra yenidən dərc olunacaq.'
        );

        /*
          Backend edit ediləndə IsApproved = false edir.
          Ona görə rəy artıq məhsul səhifəsindən müvəqqəti itəcək.
        */
        setReviews((oldList) =>
          oldList.filter((review) => review.id !== editingReview.id)
        );

  
      } else {
        setEditError(res?.message || 'Rəy yenilənmədi.');
      }
    } catch (err) {
      setEditError(getError(err, 'Rəy yenilənmədi.'));
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteReview = async (review) => {
    const confirmed = window.confirm(
      'Bu rəyi silmək istədiyinizə əminsiniz?'
    );

    if (!confirmed) return;

    setDeletingReviewId(review.id);

    try {
      const res = await productApi.deleteReview(review.id);

      if (res?.success) {
        showToast('✅ Rəy silindi.');

        setReviews((oldList) =>
          oldList.filter((item) => item.id !== review.id)
        );
      } else {
        showToast(res?.message || 'Rəy silinə bilmədi.');
      }
    } catch (err) {
      showToast(getError(err, 'Rəy silinə bilmədi.'));
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          <div className="h-[420px] bg-white rounded-3xl animate-pulse" />

          <div className="space-y-4">
            <div className="h-8 w-1/3 bg-white rounded-2xl animate-pulse" />
            <div className="h-10 bg-white rounded-2xl animate-pulse" />
            <div className="h-24 bg-white rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full grid place-items-center mx-auto text-slate-400">
            <Package size={30} />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Məhsul tapılmadı
          </h2>

          <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <p className="text-[11px] text-slate-500 font-mono">
              ID: {id}
            </p>

            <p className="text-[11px] text-rose-600 font-mono break-all">
              {debug || 'Naməlum səbəb'}
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition"
          >
            <ChevronLeft size={16} />
            Mağazaya qayıt
          </Link>
        </div>
      </div>
    );
  }

  const p = product;

  const imgs = (p.images || p.imageUrls || [])
    .map((i) => i.imageUrl || i)
    .filter(Boolean);

  const mainImg =
    p.mainImageUrl ||
    p.imageUrl ||
    imgs[0] ||
    PLACEHOLDER_PRODUCT;

  const gallery = imgs.length
    ? [mainImg, ...imgs.filter((u) => u !== mainImg)]
    : [mainImg];

  const stock = p.stockQuantity ?? 0;
  const out = stock <= 0;

  const pct =
    p.discountPrice && p.price
      ? Math.round((1 - p.discountPrice / p.price) * 100)
      : 0;

  const finalPrice = p.discountPrice ?? p.price;

  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
      />

      {/* REDAKTƏ MODALI */}
      {editingReview && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={closeEditReview}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeEditReview}
              disabled={savingEdit}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
            >
              <X size={19} />
            </button>

            <div className="pr-10">
              <h3 className="text-lg font-black text-slate-900">
                Rəyi redaktə et
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Dəyişiklikdən sonra rəy yenidən admin təsdiqinə göndəriləcək.
              </p>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {editError}
              </div>
            )}

            <form onSubmit={submitEditReview} className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Qiymətləndirmə
                </p>

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() =>
                        setEditForm((old) => ({
                          ...old,
                          rating: star,
                        }))
                      }
                    >
                      <Star
                        size={27}
                        className={
                          star <= editForm.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 hover:text-amber-200'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Rəyiniz
                </p>

                <textarea
                  rows={5}
                  value={editForm.comment}
                  onChange={(e) =>
                    setEditForm((old) => ({
                      ...old,
                      comment: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white resize-none transition"
                  placeholder="Rəyinizi yazın..."
                />
              </div>

              <button
                type="submit"
                disabled={savingEdit}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingEdit ? (
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
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition mb-6"
        >
          <ChevronLeft size={16} />
          Mağazaya qayıt
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* QALEREYA */}
          <div className="space-y-3">
            <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src={gallery[activeImg] || PLACEHOLDER_PRODUCT}
                alt={p.name}
                className={`w-full h-[340px] sm:h-[440px] object-cover ${
                  out ? 'opacity-60 grayscale' : ''
                }`}
              />

              {pct > 0 && (
                <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow flex items-center gap-1">
                  <Tag size={13} />
                  -{pct}%
                </span>
              )}

              {out && (
                <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-sm font-bold text-center py-2">
                  Stokda yoxdur
                </span>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      i === activeImg
                        ? 'border-sky-600 ring-2 ring-sky-200'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MƏLUMAT */}
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600 mb-1">
                {p.brand}
              </p>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {p.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {getCat(p) && (
                  <span className="text-[11px] font-bold bg-sky-50 text-sky-600 border border-sky-100 px-2.5 py-1 rounded-lg">
                    {getCat(p)}
                  </span>
                )}

                {getAnimal(p) && (
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    {getPetIcon(getAnimal(p))}
                    {getAnimal(p)}
                  </span>
                )}

                {reviews.length > 0 && (
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                    <Star
                      size={12}
                      className="fill-amber-400 text-amber-400"
                    />
                    {avg.toFixed(1)} ({reviews.length} rəy)
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-end justify-between gap-4">
              <div>
                {pct > 0 && (
                  <p className="text-sm text-slate-400 line-through font-semibold">
                    {formatPrice(p.price)}
                  </p>
                )}

                <p className="text-3xl font-black text-slate-900">
                  {formatPrice(finalPrice)}
                </p>
              </div>

              <span
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg ${
                  out
                    ? 'bg-rose-50 text-rose-600'
                    : stock <= 5
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {out
                  ? 'Stokda yoxdur'
                  : stock <= 5
                  ? `Son ${stock} ədəd`
                  : 'Stokda var'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Store size={20} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {getShop(p) || 'Rəsmi mağaza'}
                </p>

                {getCity(p) && (
                  <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <MapPin size={11} />
                    {getCity(p)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shrink-0">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="px-4 py-3.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition"
                >
                  <Minus size={16} />
                </button>

                <span className="w-12 text-center text-sm font-black text-slate-900">
                  {qty}
                </span>

                <button
                  onClick={() =>
                    setQty((q) => Math.min(stock, q + 1))
                  }
                  disabled={qty >= stock}
                  className="px-4 py-3.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={out || adding}
                className={`flex-1 font-bold py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                  out
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                }`}
              >
                {adding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <ShoppingBasket size={18} />
                )}

                Səbətə əlavə et{' '}
                {finalPrice ? `• ${formatPrice(finalPrice * qty)}` : ''}
              </button>
            </div>

            <StartChatButton
              type={CHAT_TYPE.PRODUCT}
              productId={product.id}
              petShopId={product.petShopId || undefined}
              targetUserId={
                product.petShopUserId ||
                product.shopUserId ||
                product.petShopOwnerUserId ||
                product.shopOwnerUserId ||
                product.sellerUserId ||
                undefined
              }
              className="w-full py-4 rounded-2xl"
            >
              Mağazaya yaz
            </StartChatButton>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                Məhsul haqqında
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                {p.description}
              </p>
            </div>
          </div>
        </div>

        {/* RƏYLƏR */}
        <section className="mt-14 grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-black text-slate-900">
              Müştəri rəyləri ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-400">
                Hələ rəy yazılmayıb. İlk rəyi siz yazın!
              </div>
            ) : (
              reviews.map((r, i) => {
                const reviewUserId = r.appUserId ?? r.userId;

                const mine =
                  currentUserId &&
                  Number(reviewUserId) === Number(currentUserId);

                return (
                  <div
                    key={r.id || i}
                    className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-sky-100 text-sky-600 rounded-full grid place-items-center font-bold text-sm shrink-0">
                          {(r.userFullName || r.appUserFullName || 'U')
                            .charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {r.userFullName ||
                              r.appUserFullName ||
                              'İstifadəçi'}
                          </p>

                          <p className="text-[10px] text-slate-400 font-semibold">
                            {r.dateText || formatDate(r.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={
                              s <= r.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {r.comment}
                    </p>

                    {mine && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditReview(r)}
                          disabled={deletingReviewId === r.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 text-[11px] font-bold transition disabled:opacity-50"
                        >
                          <Pencil size={13} />
                          Redaktə et
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteReview(r)}
                          disabled={deletingReviewId === r.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold transition disabled:opacity-50"
                        >
                          {deletingReviewId === r.id ? (
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-rose-500 border-t-transparent" />
                          ) : (
                            <Trash2 size={13} />
                          )}

                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* RƏY FORMU */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900">
              Rəy yaz
            </h3>

            {reviewError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-semibold flex items-start gap-1.5">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                {reviewError}
              </div>
            )}

            <form onSubmit={submitReview} className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() =>
                      setReviewForm({
                        ...reviewForm,
                        rating: s,
                      })
                    }
                  >
                    <Star
                      size={24}
                      className={`transition ${
                        s <= reviewForm.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 hover:text-amber-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm({
                    ...reviewForm,
                    comment: e.target.value,
                  })
                }
                rows={4}
                placeholder="Təcrübənizi paylaşın..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white resize-none transition"
              />

              <button
                type="submit"
                disabled={sendingReview}
                className="w-full bg-slate-900 hover:bg-sky-600 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingReview ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send size={14} />
                    Göndər
                  </>
                )}
              </button>

              {!user && (
                <p className="text-[10px] text-slate-400 text-center">
                  Rəy yazmaq üçün daxil olmalısınız
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;