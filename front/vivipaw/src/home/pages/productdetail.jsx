import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBasket, Minus, Plus, Store, MapPin, Star, ChevronLeft,
  Package, Tag, AlertCircle, Send,
} from 'lucide-react';
import { productApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { PLACEHOLDER_PRODUCT } from '../../utils/constants';
import { formatPrice, formatDate, getPetIcon } from '../../utils/helpers';

const getShop   = (p) => p.petShopName || p.shopName || p.petShop?.name || '';
const getCity   = (p) => p.city || p.shopCity || p.petShop?.city || '';
const getCat    = (p) => p.categoryName || p.category?.name || '';
const getAnimal = (p) => p.targetAnimalName || p.targetAnimalCategoryName || p.targetCategoryName || '';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [debug, setDebug] = useState('');          // 🔍 real xəta səbəbi
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [authModal, setAuthModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [sendingReview, setSendingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  useEffect(() => { setActiveImg(0); setQty(1); }, [id]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setDebug('');
    try {
      /* 🔍 Məhsul sorğusu — xətanı udmuruq, qeydə alırıq */
      let pRes = null;
      try {
        pRes = await productApi.byId(id);
      } catch (e) {
        const status = e?.response?.status || 'network';
        const msg = e?.response?.data?.message || e?.response?.data?.title || e?.message || '';
        setDebug(`HTTP ${status} — ${msg}`);
        console.error('🔴 Product byId xətası:', status, e?.response?.data || e?.message);
        pRes = null;
      }

      if (pRes?.success && pRes.data) {
        setProduct(pRes.data);
      } else {
        setDebug(pRes?.message || 'Backend success=false qaytardı');
        setNotFound(true);
      }

      /* Rəylər (problem deyil, sadəcə yüklə) */
      const rRes = await productApi.reviews(id).catch(() => null);
      if (rRes?.success) {
        const list = Array.isArray(rRes.data) ? rRes.data : (rRes.data?.items || []);
        setReviews(list.filter((r) => r.isApproved !== false));
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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
          <div className="w-16 h-16 bg-slate-100 rounded-full grid place-items-center mx-auto text-slate-400"><Package size={30} /></div>
          <h2 className="text-xl font-bold text-slate-900">Məhsul tapılmadı</h2>
          {/* 🔍 Debug məlumatı — səbəbi buradan görəcəyik */}
          <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <p className="text-[11px] text-slate-500 font-mono">ID: {id}</p>
            <p className="text-[11px] text-rose-600 font-mono break-all">{debug || 'Naməlum səbəb'}</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition">
            <ChevronLeft size={16} /> Mağazaya qayıt
          </Link>
        </div>
      </div>
    );
  }

  const p = product;
  const imgs = (p.images || p.imageUrls || []).map((i) => i.imageUrl || i).filter(Boolean);
  const mainImg = p.mainImageUrl || p.imageUrl || imgs[0] || PLACEHOLDER_PRODUCT;
  const gallery = imgs.length ? [mainImg, ...imgs.filter((u) => u !== mainImg)] : [mainImg];

  const stock = p.stockQuantity ?? 0;
  const out = stock <= 0;
  const pct = p.discountPrice && p.price ? Math.round((1 - p.discountPrice / p.price) * 100) : 0;
  const finalPrice = p.discountPrice ?? p.price;

  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : 0;

  const handleAdd = async () => {
    if (!user) return setAuthModal(true);
    if (out) return;
    setAdding(true);
    try {
      const res = await addToCart(p.id, qty);
      showToast(res?.success ? '✅ Səbətə əlavə olundu' : (res?.message || 'Əlavə edilmədi.'));
    } catch (err) {
      showToast(getError(err, 'Səbətə əlavə edilmədi.'));
    } finally {
      setAdding(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return setAuthModal(true);
    if (!reviewForm.comment.trim()) return setReviewError('Rəy mətni boş ola bilməz.');
    setReviewError('');
    setSendingReview(true);
    try {
      const res = await productApi.addReview({ productId: p.id, ...reviewForm });
      if (res?.success) {
        showToast('✅ Rəyiniz göndərildi');
        setReviewForm({ rating: 5, comment: '' });
        fetchAll();
      } else setReviewError(res?.message || 'Rəy göndərilmədi.');
    } catch (err) {
      setReviewError(getError(err, 'Rəy göndərilmədi.'));
    } finally {
      setSendingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} />
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition mb-6">
          <ChevronLeft size={16} /> Mağazaya qayıt
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* QALEREYA */}
          <div className="space-y-3">
            <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={gallery[activeImg] || PLACEHOLDER_PRODUCT} alt={p.name}
                className={`w-full h-[340px] sm:h-[440px] object-cover ${out ? 'opacity-60 grayscale' : ''}`} />
              {pct > 0 && (
                <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow flex items-center gap-1">
                  <Tag size={13} /> -{pct}%
                </span>
              )}
              {out && (
                <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-sm font-bold text-center py-2">Stokda yoxdur</span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      i === activeImg ? 'border-sky-600 ring-2 ring-sky-200' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MƏLUMAT */}
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600 mb-1">{p.brand}</p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{p.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {getCat(p) && <span className="text-[11px] font-bold bg-sky-50 text-sky-600 border border-sky-100 px-2.5 py-1 rounded-lg">{getCat(p)}</span>}
                {getAnimal(p) && (
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    {getPetIcon(getAnimal(p))} {getAnimal(p)}
                  </span>
                )}
                {reviews.length > 0 && (
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" /> {avg.toFixed(1)} ({reviews.length} rəy)
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-end justify-between gap-4">
              <div>
                {pct > 0 && <p className="text-sm text-slate-400 line-through font-semibold">{formatPrice(p.price)}</p>}
                <p className="text-3xl font-black text-slate-900">{formatPrice(finalPrice)}</p>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg ${
                out ? 'bg-rose-50 text-rose-600' : stock <= 5 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {out ? 'Stokda yoxdur' : stock <= 5 ? `Son ${stock} ədəd` : 'Stokda var'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><Store size={20} /></div>
              <div>
                <p className="text-sm font-bold text-slate-900">{getShop(p) || 'Rəsmi mağaza'}</p>
                {getCity(p) && <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1"><MapPin size={11} /> {getCity(p)}</p>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}
                  className="px-4 py-3.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition"><Minus size={16} /></button>
                <span className="w-12 text-center text-sm font-black text-slate-900">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(stock, q + 1))} disabled={qty >= stock}
                  className="px-4 py-3.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition"><Plus size={16} /></button>
              </div>
              <button onClick={handleAdd} disabled={out || adding}
                className={`flex-1 font-bold py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                  out ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                }`}>
                {adding ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <ShoppingBasket size={18} />}
                Səbətə əlavə et {finalPrice ? `• ${formatPrice(finalPrice * qty)}` : ''}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Məhsul haqqında</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{p.description}</p>
            </div>
          </div>
        </div>

        {/* RƏYLƏR */}
        <section className="mt-14 grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-black text-slate-900">Müştəri rəyləri ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-400">
                Hələ rəy yazılmayıb. İlk rəyi siz yazın!
              </div>
            ) : (
              reviews.map((r, i) => (
                <div key={r.id || i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-sky-100 text-sky-600 rounded-full grid place-items-center font-bold text-sm">
                        {(r.userFullName || r.appUserFullName || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{r.userFullName || r.appUserFullName || 'İstifadəçi'}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{r.dateText || formatDate(r.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={14} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900">Rəy yaz</h3>
            {reviewError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-semibold flex items-start gap-1.5">
                <AlertCircle size={13} className="shrink-0 mt-0.5" /> {reviewError}
              </div>
            )}
            <form onSubmit={submitReview} className="space-y-3">
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button type="button" key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                    <Star size={24} className={`transition ${s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 hover:text-amber-200'}`} />
                  </button>
                ))}
              </div>
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={4} placeholder="Təcrübənizi paylaşın..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white resize-none transition" />
              <button type="submit" disabled={sendingReview}
                className="w-full bg-slate-900 hover:bg-sky-600 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50">
                {sendingReview ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Send size={14} /> Göndər</>}
              </button>
              {!user && <p className="text-[10px] text-slate-400 text-center">Rəy yazmaq üçün daxil olmalısınız</p>}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;