import React, { useState, useEffect, useCallback } from 'react';
import {
  LuStethoscope,
  LuCheck,
  LuX,
  LuMapPin,
  LuAward,
  LuBriefcase,
  LuUser,
  LuTrash2,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import {
  PageHeader,
  EmptyBox,
  Spinner,
  Badge,
  Modal,
  Avatar,
  listFrom,
  approveBody,
} from '../../components/admin/ui';

const TABS = [
  { v: 1, l: 'Gözləyən' },
  { v: 2, l: 'Təsdiqlənmiş' },
  { v: 3, l: 'Rədd edilmiş' },
];

const AdminVets = () => {
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
      const res = await adminApi.vets(tab);
      setList(listFrom(res));
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
      const res = await adminApi.approveVet(
        id,
        approveBody(true)
      );

      if (res?.success) {
        showToast('✅ Baytar təsdiqləndi');
        fetchList();
      } else {
        showToast(res?.message || 'Əməliyyat alınmadı.');
      }
    } catch (e) {
      showToast(getError(e, 'Əməliyyat alınmadı.'));
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
      const res = await adminApi.approveVet(
        reject.id,
        approveBody(false, reason.trim())
      );

      if (res?.success) {
        showToast('🚫 Baytar rədd edildi');
        setReject(null);
        setReason('');
        fetchList();
      } else {
        showToast(res?.message || 'Əməliyyat alınmadı.');
      }
    } catch (e) {
      showToast(getError(e, 'Əməliyyat alınmadı.'));
    } finally {
      setBusyId(null);
    }
  };

  const deleteVet = async () => {
    if (!deleteTarget) return;

    setDeleteBusy(true);

    try {
      const res = await adminApi.deleteVet(deleteTarget.id);

      if (res?.success) {
        setList((prev) =>
          prev.filter((item) => item.id !== deleteTarget.id)
        );

        showToast('🗑️ Rədd edilmiş baytar silindi');
        setDeleteTarget(null);
      } else {
        showToast(res?.message || 'Baytar silinə bilmədi.');
      }
    } catch (e) {
      showToast(getError(e, 'Baytar silinə bilmədi.'));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Baytar təsdiqləri"
        subtitle={`${list.length} müraciət`}
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
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyBox text="Bu bölmədə müraciət yoxdur." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((vet) => (
            <div
              key={vet.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-start gap-3">
                <Avatar
                  name={vet.veterinarianFullName || vet.clinicName}
                  src={vet.imageUrl}
                  size="h-12 w-12 text-base"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-black text-slate-900 truncate">
                    {vet.clinicName}
                  </p>

                  <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                    <LuUser size={11} />
                    {vet.veterinarianFullName || '—'}
                  </p>
                </div>

                {tab === 1 && (
                  <Badge className="bg-amber-50 text-amber-600 border-amber-200">
                    Gözləyir
                  </Badge>
                )}

                {tab === 2 && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">
                    Təsdiqlənib
                  </Badge>
                )}

                {tab === 3 && (
                  <Badge className="bg-rose-50 text-rose-600 border-rose-200">
                    Rədd edilib
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <LuStethoscope size={12} className="text-slate-400" />
                  {vet.specialty || '—'}
                </span>

                <span className="flex items-center gap-1.5">
                  <LuBriefcase size={12} className="text-slate-400" />
                  {vet.experienceYears ?? 0} il təcrübə
                </span>

                <span className="flex items-center gap-1.5">
                  <LuAward size={12} className="text-slate-400" />
                  {vet.licenseNumber || '—'}
                </span>

                <span className="flex items-center gap-1.5">
                  <LuMapPin size={12} className="text-slate-400" />
                  {vet.city || '—'}
                </span>
              </div>

              {vet.bio && (
                <p className="text-xs text-slate-500 line-clamp-2">
                  {vet.bio}
                </p>
              )}

              {tab === 3 && vet.rejectReason && (
                <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  Səbəb: {vet.rejectReason}
                </p>
              )}

              {tab === 1 && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => approve(vet.id)}
                    disabled={busyId === vet.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    {busyId === vet.id ? (
                      <Spinner small />
                    ) : (
                      <LuCheck size={14} />
                    )}
                    Təsdiq et
                  </button>

                  <button
                    onClick={() =>
                      setReject({
                        id: vet.id,
                        name: vet.clinicName,
                      })
                    }
                    disabled={busyId === vet.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    <LuX size={14} />
                    Rədd et
                  </button>
                </div>
              )}

              {tab === 3 && (
                <button
                  onClick={() =>
                    setDeleteTarget({
                      id: vet.id,
                      name: vet.clinicName,
                    })
                  }
                  className="w-full flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold py-2.5 rounded-xl transition"
                >
                  <LuTrash2 size={14} />
                  Rədd edilmiş baytarı sil
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RƏDD MODALI */}
      <Modal
        open={!!reject}
        onClose={() => {
          if (busyId !== reject?.id) {
            setReject(null);
            setReason('');
          }
        }}
        title={`Rədd et: ${reject?.name || ''}`}
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Rədd səbəbini yazın..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-rose-500 resize-none"
        />

        <button
          onClick={rejectNow}
          disabled={busyId === reject?.id}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-3 rounded-xl transition disabled:opacity-50"
        >
          {busyId === reject?.id ? <Spinner small /> : <LuX size={15} />}
          Rədd et
        </button>
      </Modal>

      {/* SİLMƏ TƏSDİQ MODALI */}
      <Modal
        open={!!deleteTarget}
        onClose={() => {
          if (!deleteBusy) setDeleteTarget(null);
        }}
        title="Baytar profilini sil"
      >
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs font-semibold text-rose-700">
            <p>
              <span className="font-black">{deleteTarget?.name}</span>
              {' '}baytar/klinika profilini database-dən silmək istəyirsiniz?
            </p>

            <p className="mt-1 text-rose-600">
              Bu əməliyyat geri qaytarıla bilməz.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleteBusy}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition disabled:opacity-50"
            >
              İmtina
            </button>

            <button
              onClick={deleteVet}
              disabled={deleteBusy}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
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

export default AdminVets;