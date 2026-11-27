import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LuCheck,
  LuX,
  LuStar,
  LuTrash2,
  LuMessageSquare,
  LuPackage,
} from 'react-icons/lu';

import { adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';

import {
  PageHeader,
  EmptyBox,
  Spinner,
  Avatar,
  Modal,
  listFrom,
} from '../../components/admin/ui';

const TABS = [
  { v: 1, l: 'Gözləyən' },
  { v: 2, l: 'Dərc edilmiş' },
  { v: 3, l: 'Rədd edilmiş' },
];

const AdminTestimonials = () => {
  const [tab, setTab] = useState(1);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast('');
    }, 2500);
  };

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const response = await adminApi.testimonials(tab);
      setList(listFrom(response));
    } catch (error) {
      setList([]);
      showToast(getError(error, 'Rəylər yüklənmədi.'));
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const decide = async (id, approve) => {
    setBusyId(id);

    try {
      const response = await adminApi.approveTestimonial(id, approve);

      if (response?.success) {
        showToast(
          approve
            ? '✅ Rəy dərc olundu'
            : '🚫 Rəy rədd edildi'
        );

        fetchList();
      } else {
        showToast(response?.message || 'Əməliyyat alınmadı.');
      }
    } catch (error) {
      showToast(getError(error, 'Əməliyyat alınmadı.'));
    } finally {
      setBusyId(null);
    }
  };

  const deleteTestimonial = async () => {
    if (!deleteTarget) return;

    setDeleteBusy(true);

    try {
      const response = await adminApi.deleteTestimonial(deleteTarget.id);

      if (response?.success) {
        setList((prev) =>
          prev.filter((item) => item.id !== deleteTarget.id)
        );

        setDeleteTarget(null);
        showToast('🗑️ Rədd edilmiş rəy silindi');
      } else {
        showToast(response?.message || 'Rəy silinə bilmədi.');
      }
    } catch (error) {
      showToast(getError(error, 'Rəy silinə bilmədi.'));
    } finally {
      setDeleteBusy(false);
    }
  };

  const badgeData = () => {
    if (tab === 1) {
      return {
        label: 'Gözləyir',
        cls: 'bg-amber-50 text-amber-600 border-amber-200',
      };
    }

    if (tab === 2) {
      return {
        label: 'Dərc edilib',
        cls: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      };
    }

    return {
      label: 'Rədd edilib',
      cls: 'bg-rose-50 text-rose-600 border-rose-200',
    };
  };

  const badge = badgeData();

  return (
    <div>
      <PageHeader
        title="Rəy moderasiyası"
        subtitle={`${list.length} platforma rəyi`}
      />

      {toast && (
        <div className="fixed top-20 right-6 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      {/* Platforma/Məhsul keçid düymələri */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          to="/admin/testimonials"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md"
        >
          <LuMessageSquare size={15} />
          Platforma rəyləri
        </Link>

        <Link
          to="/admin/product-reviews"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
        >
          <LuPackage size={15} />
          Məhsul rəyləri
        </Link>
      </div>

      {/* Platforma rəy status tabları */}
      <div className="flex gap-2 mb-6">
        {TABS.map((item) => (
          <button
            key={item.v}
            onClick={() => setTab(item.v)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === item.v
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyBox text="Bu bölmədə rəy yoxdur." />
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-4"
            >
              {item.petImageUrl && (
                <img
                  src={item.petImageUrl}
                  alt=""
                  className={`w-full sm:w-32 h-32 object-cover rounded-xl border border-slate-100 shrink-0 ${
                    tab === 3 ? 'opacity-60 grayscale' : ''
                  }`}
                />
              )}

              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      name={item.userFullName}
                      src={item.userImageUrl}
                    />

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {item.userFullName || 'İstifadəçi'}
                      </p>

                      <p className="text-[10px] text-slate-400 font-semibold">
                        {item.dateText || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.cls}`}
                    >
                      {badge.label}
                    </span>

                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <LuStar
                          key={star}
                          size={13}
                          className={
                            star <= item.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.comment}
                </p>

                {tab === 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide(item.id, true)}
                      disabled={busyId === item.id}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
                    >
                      {busyId === item.id ? (
                        <Spinner small />
                      ) : (
                        <LuCheck size={14} />
                      )}

                      Dərc et
                    </button>

                    <button
                      onClick={() => decide(item.id, false)}
                      disabled={busyId === item.id}
                      className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
                    >
                      <LuX size={14} />
                      Rədd et
                    </button>
                  </div>
                )}

{(tab === 2 || tab === 3) && (
  <button
    onClick={() =>
      setDeleteTarget({
        id: item.id,
        name: item.userFullName || 'İstifadəçi rəyi',
      })
    }
    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold px-4 py-2.5 rounded-xl"
  >
    <LuTrash2 size={14} />
    Rəyi sil
  </button>
)}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => !deleteBusy && setDeleteTarget(null)}
        title="Rəyi sil"
      >
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs font-semibold text-rose-700">
            <b>{deleteTarget?.name}</b> tərəfindən yazılmış rəyi silmək
            istəyirsiniz?

            <p className="mt-1 text-rose-600">
              Bu əməliyyat geri qaytarıla bilməz.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleteBusy}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600"
            >
              İmtina
            </button>

            <button
              onClick={deleteTestimonial}
              disabled={deleteBusy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white disabled:opacity-50"
            >
              {deleteBusy ? <Spinner small /> : <LuTrash2 size={14} />}
              Bəli, sil
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTestimonials;