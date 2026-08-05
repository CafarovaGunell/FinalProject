import React, { useState, useEffect, useCallback } from 'react';
import {
  LuCheck, LuX, LuMapPin, LuStore, LuUser, LuTrash2,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { PLACEHOLDER_PET } from '../../../utils/constants';
import {
  PageHeader, EmptyBox, Spinner, Badge, Modal, listFrom,
} from '../../components/admin/ui';

const TABS = [
  { v: 1, l: 'Gözləyən' },
  { v: 2, l: 'Təsdiqlənmiş' },
  { v: 3, l: 'Rədd edilmiş' },
];

const AdminPets = () => {
  const [tab, setTab] = useState(1);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [reject, setReject] = useState(null);
  const [reason, setReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const response = await adminApi.pets(tab);
      setList(listFrom(response));
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const approve = async (id) => {
    setBusyId(id);

    try {
      const response = await adminApi.approvePet(id, true, '');

      if (response?.success) {
        showToast('✅ Elan təsdiqləndi');
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

  const rejectNow = async () => {
    if (!reason.trim()) {
      return showToast('Rədd səbəbi yazılmalıdır.');
    }

    setBusyId(reject.id);

    try {
      const response = await adminApi.approvePet(
        reject.id,
        false,
        reason.trim()
      );

      if (response?.success) {
        showToast('🚫 Elan rədd edildi');
        setReject(null);
        setReason('');
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

  const deletePet = async () => {
    if (!deleteTarget) return;

    setDeleteBusy(true);

    try {
      const response = await adminApi.deletePet(deleteTarget.id);

      if (response?.success) {
        setList((prev) =>
          prev.filter((pet) => pet.id !== deleteTarget.id)
        );
        setDeleteTarget(null);
        showToast('🗑️ Rədd edilmiş elan silindi');
      } else {
        showToast(response?.message || 'Elan silinə bilmədi.');
      }
    } catch (error) {
      showToast(getError(error, 'Elan silinə bilmədi.'));
    } finally {
      setDeleteBusy(false);
    }
  };

  const statusBadge = () => {
    if (tab === 1) {
      return (
        <Badge className="bg-amber-50 text-amber-600 border-amber-200">
          Gözləyir
        </Badge>
      );
    }

    if (tab === 2) {
      return (
        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">
          Təsdiqlənib
        </Badge>
      );
    }

    return (
      <Badge className="bg-rose-50 text-rose-600 border-rose-200">
        Rədd edilib
      </Badge>
    );
  };

  return (
    <div>
      <PageHeader
        title="Elan moderasiyası"
        subtitle={`${list.length} elan`}
      />

      {toast && (
        <div className="fixed top-20 right-6 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyBox text="Bu bölmədə elan yoxdur." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((pet) => (
            <div key={pet.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-40 bg-slate-100">
                <img
                  src={pet.mainImageUrl || PLACEHOLDER_PET}
                  alt={pet.name}
                  className={`w-full h-full object-cover ${tab === 3 ? 'opacity-60 grayscale' : ''}`}
                />
                <span className="absolute top-2.5 left-2.5">
                  {statusBadge()}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-2">
                <div>
                  <p className="font-black text-slate-900">{pet.name}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {pet.breed} • {pet.categoryName}
                  </p>
                </div>

                <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <LuMapPin size={12} /> {pet.city || '—'}
                  </p>
                  <p className="flex items-center gap-1.5">
                    {pet.ownerType === 1
                      ? <LuStore size={12} />
                      : <LuUser size={12} />}
                    {pet.petShopName || pet.ownerFullName || '—'}
                  </p>
                </div>

                {pet.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {pet.description}
                  </p>
                )}

                {tab === 3 && pet.rejectReason && (
                  <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                    Səbəb: {pet.rejectReason}
                  </p>
                )}

                {tab === 1 && (
                  <div className="mt-auto flex gap-2 pt-2">
                    <button
                      onClick={() => approve(pet.id)}
                      disabled={busyId === pet.id}
                      className="flex-1 flex justify-center items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-50"
                    >
                      {busyId === pet.id ? <Spinner small /> : <LuCheck size={14} />}
                      Təsdiq et
                    </button>

                    <button
                      onClick={() => setReject({ id: pet.id, name: pet.name })}
                      disabled={busyId === pet.id}
                      className="flex-1 flex justify-center items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2.5 rounded-xl"
                    >
                      <LuX size={14} />
                      Rədd et
                    </button>
                  </div>
                )}

                {tab === 3 && (
                  <button
                    onClick={() => setDeleteTarget({ id: pet.id, name: pet.name })}
                    className="mt-auto w-full flex justify-center items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold py-2.5 rounded-xl"
                  >
                    <LuTrash2 size={14} />
                    Rədd edilmiş elanı sil
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!reject}
        onClose={() => {
          if (busyId !== reject?.id) {
            setReject(null);
            setReason('');
          }
        }}
        title={`Elanı rədd et: ${reject?.name || ''}`}
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Rədd səbəbini yazın..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-rose-500 resize-none"
        />

        <button
          onClick={rejectNow}
          disabled={busyId === reject?.id}
          className="w-full mt-3 flex justify-center items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {busyId === reject?.id ? <Spinner small /> : <LuX size={15} />}
          Rədd et
        </button>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => !deleteBusy && setDeleteTarget(null)}
        title="Elanı sil"
      >
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs font-semibold text-rose-700">
            <b>{deleteTarget?.name}</b> elanını silmək istəyirsiniz?
            <p className="mt-1 text-rose-600">Bu əməliyyat geri qaytarıla bilməz.</p>
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
              onClick={deletePet}
              disabled={deleteBusy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white"
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

export default AdminPets;