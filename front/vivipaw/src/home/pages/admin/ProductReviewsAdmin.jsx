import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Star,
  RefreshCw,
  Package,
  User,
  MessageSquare,
} from 'lucide-react';

import { adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { formatDate } from '../../../utils/helpers';

const TABS = [
  {
    value: 1,
    label: 'Gözləyən',
    activeClass: 'bg-amber-500 text-white',
  },
  {
    value: 2,
    label: 'Dərc edilmiş',
    activeClass: 'bg-emerald-500 text-white',
  },
  {
    value: 3,
    label: 'Rədd edilmiş',
    activeClass: 'bg-rose-500 text-white',
  },
];

const ProductReviewsAdmin = () => {
  const [status, setStatus] = useState(1);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast('');
    }, 2500);
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);

    try {
      const response = await adminApi.productReviews(status);

      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items || [];

      setList(data);
    } catch (error) {
      setList([]);
      showToast(getError(error, 'Məhsul rəyləri yüklənmədi.'));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const approve = async (id) => {
    setActingId(id);

    try {
      const response = await adminApi.approveProductReview(id);

      if (response?.success) {
        showToast('✅ Rəy təsdiqləndi və dərc edildi.');

        setList((previous) =>
          previous.filter((review) => review.id !== id)
        );
      } else {
        showToast(response?.message || 'Rəy təsdiqlənmədi.');
      }
    } catch (error) {
      showToast(getError(error, 'Rəy təsdiqlənmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const reject = async (id) => {
    const confirmed = window.confirm(
      'Bu rəyi rədd etmək istədiyinizə əminsiniz?'
    );

    if (!confirmed) return;

    setActingId(id);

    try {
      const response = await adminApi.rejectProductReview(id);

      if (response?.success) {
        showToast('🚫 Rəy rədd edildi.');

        setList((previous) =>
          previous.filter((review) => review.id !== id)
        );
      } else {
        showToast(response?.message || 'Rəy rədd edilmədi.');
      }
    } catch (error) {
      showToast(getError(error, 'Rəy rədd edilmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const remove = async (id) => {
    const confirmed = window.confirm(
      'Bu rəyi silmək istədiyinizə əminsiniz?'
    );

    if (!confirmed) return;

    setActingId(id);

    try {
      const response = await adminApi.deleteProductReview(id);

      if (response?.success) {
        showToast('🗑️ Rəy silindi.');

        setList((previous) =>
          previous.filter((review) => review.id !== id)
        );
      } else {
        showToast(response?.message || 'Rəy silinə bilmədi.');
      }
    } catch (error) {
      showToast(getError(error, 'Rəy silinə bilmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const getStatusBadge = () => {
    if (status === 1) {
      return {
        text: 'Gözləyir',
        className: 'bg-amber-50 text-amber-600 border-amber-200',
      };
    }

    if (status === 2) {
      return {
        text: 'Dərc edilib',
        className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      };
    }

    return {
      text: 'Rədd edilib',
      className: 'bg-rose-50 text-rose-600 border-rose-200',
    };
  };

  const badge = getStatusBadge();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      {toast && (
        <div className="fixed top-20 right-6 z-[100] bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600">
              Rəy moderasiyası
            </p>

            <h1 className="text-2xl font-black text-slate-900">
              Məhsul rəyləri
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              {list.length} rəy
            </p>
          </div>

          <button
            onClick={fetchReviews}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            Yenilə
          </button>
        </div>

        {/* Platforma/Məhsul keçid düymələri */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/testimonials"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
          >
            <MessageSquare size={15} />
            Platforma rəyləri
          </Link>

          <Link
            to="/admin/product-reviews"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md"
          >
            <Package size={15} />
            Məhsul rəyləri
          </Link>
        </div>

        {/* Məhsul rəylərinin status tabları */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                status === tab.value
                  ? tab.activeClass
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-48 bg-white rounded-2xl animate-pulse border border-slate-100"
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            Bu bölmədə rəy yoxdur.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {list.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate flex items-center gap-1.5">
                      <Package size={15} className="text-sky-600" />
                      {review.productName || 'Məhsul'}
                    </p>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <User size={13} />
                      {review.userFullName || 'İstifadəçi'}
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1">
                      {review.dateText || formatDate(review.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border ${badge.className}`}
                    >
                      {badge.text}
                    </span>

                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={
                            star <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {review.comment}
                </p>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                  {/* Pending: Təsdiqlə və Rədd et */}
                  {status === 1 && (
                    <>
                      <button
                        disabled={actingId === review.id}
                        onClick={() => approve(review.id)}
                        className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-[11px] font-bold"
                      >
                        <CheckCircle2 size={14} />
                        Təsdiqlə
                      </button>

                      <button
                        disabled={actingId === review.id}
                        onClick={() => reject(review.id)}
                        className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-[11px] font-bold"
                      >
                        <XCircle size={14} />
                        Rədd et
                      </button>
                    </>
                  )}

                  {/* Approved və Rejected: Sil */}
                  {(status === 2 || status === 3) && (
                    <button
                      disabled={actingId === review.id}
                      onClick={() => remove(review.id)}
                      className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-600 px-3 py-2 rounded-lg text-[11px] font-bold"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewsAdmin;