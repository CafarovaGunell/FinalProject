import React, { useState, useEffect, useCallback } from 'react';
import {
  FiInbox, FiX, FiPhone, FiMapPin, FiHome, FiHeart,
  FiCheck, FiUser, FiCalendar, FiMessageSquare, FiTrash2,
} from 'react-icons/fi';
import { adoptionApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { PLACEHOLDER_PET } from '../../../utils/constants';

import StartChatButton from '../../components/chat/StartChatButton';
import { CHAT_TYPE } from '../../../utils/chat';

const statusCls = (s) =>
  s === 1 ? 'bg-amber-50 text-amber-600 border-amber-200'
    : s === 2 ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
      : s === 3 ? 'bg-rose-50 text-rose-600 border-rose-200'
        : 'bg-slate-100 text-slate-500 border-slate-200';

const statusTxt = (s) =>
  ({ 1: 'Gözləyir', 2: 'Təsdiqlənib', 3: 'Rədd edildi', 4: 'Ləğv edildi' }[s] || '—');

const getName = (r) => r.applicantFullName || r.fullName || 'Naməlum';
const getPhone = (r) => r.phone || '—';
const getAddr = (r) => r.address || '—';
const getHouse = (r) => r.housingType || '—';
const getReason = (r) => r.reason || '—';
const getPet = (r) => r.petName || r.pet?.name || 'Heyvan';
const getPetImg = (r) => r.petImageUrl || r.pet?.mainImageUrl || PLACEHOLDER_PET;

const getPetId = (r) => r.petId || r.pet?.id;

const getApplicantUserId = (r) =>
  r.applicantUserId ||
  r.userId ||
  r.customerUserId ||
  r.requesterUserId ||
  r.adopterUserId ||
  r.applicant?.id;

const ShopAdoptions = ({ showToast }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [acting, setActing] = useState(null);

  const [hiddenIds, setHiddenIds] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('hiddenShopAdoptionRequestIds') || '[]'
      );
    } catch {
      return [];
    }
  });

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const res = await adoptionApi.received();
      const data = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.items || []);

      let hidden = [];

      try {
        hidden = JSON.parse(
          localStorage.getItem('hiddenShopAdoptionRequestIds') || '[]'
        );
      } catch {
        hidden = [];
      }

      setList(data.filter((item) => !hidden.includes(String(item.id))));
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const confirmDelete = (request) => {
    const id = String(request.id);

    setActing(request.id);

    try {
      setHiddenIds((prev) => {
        const next = [...new Set([...prev, id])];

        localStorage.setItem(
          'hiddenShopAdoptionRequestIds',
          JSON.stringify(next)
        );

        return next;
      });

      setList((prev) =>
        prev.filter((item) => String(item.id) !== id)
      );

      if (selected?.id === request.id) {
        setSelected(null);
      }

      showToast('🗑️ Müraciət siyahıdan silindi');
    } finally {
      setActing(null);
      setDeleteId(null);
    }
  };

  const review = async (request, status) => {
    setBusy(true);

    try {
      const res = await adoptionApi.review(request.id, {
        status,
        reviewNote: '',
        note: '',
      });

      if (res?.success) {
        showToast(
          status === 2
            ? '✅ Müraciət təsdiqləndi — heyvan sahibləndirildi'
            : '🚫 Müraciət rədd edildi'
        );

        setSelected(null);
        fetchList();
      } else {
        showToast(res?.message || 'Əməliyyat alınmadı');
      }
    } catch (e) {
      showToast(getError(e, 'Əməliyyat alınmadı'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <FiInbox className="mx-auto text-slate-300 mb-2" size={36} />
          <p className="text-sm text-slate-500 font-semibold">
            Hələ sahiblənmə müraciəti yoxdur.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition"
            >
              <img
                src={getPetImg(r)}
                alt={getPet(r)}
                className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-slate-900">
                    {getName(r)}
                  </p>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusCls(r.status)}`}>
                    {statusTxt(r.status)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                  <FiHeart size={12} className="text-sky-500" />
                  {getPet(r)}
                  <span className="text-slate-300">•</span>
                  <FiCalendar size={12} />
                  {r.dateText || ''}
                </p>
              </div>

              {deleteId === r.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-rose-600 hidden sm:block">
                    Silinsin?
                  </span>

                  <button
                    onClick={() => confirmDelete(r)}
                    disabled={acting === r.id}
                    className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition disabled:opacity-50"
                  >
                    {acting === r.id ? '...' : 'Bəli, sil'}
                  </button>

                  <button
                    onClick={() => setDeleteId(null)}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition"
                  >
                    Geri
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 shrink-0">
                  <StartChatButton
                    type={CHAT_TYPE.PET_ADOPTION}
                    petId={getPetId(r)}
                    adoptionRequestId={r.id}
                    targetUserId={getApplicantUserId(r) || undefined}
                    className="px-4 py-2.5 rounded-xl"
                  >
                    Yaz
                  </StartChatButton>

                  <button
                    onClick={() => setSelected(r)}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    Ətraflı bax
                  </button>

                  <button
                    onClick={() => setDeleteId(r.id)}
                    title="Müraciəti siyahıdan sil"
                    className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MÜRACİƏT ƏTRAFLI MODALI */}
      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => !busy && setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"
            >
              <FiX size={16} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <img
                src={getPetImg(selected)}
                alt={getPet(selected)}
                className="w-14 h-14 rounded-xl object-cover border border-slate-100"
              />

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {getPet(selected)} üçün müraciət
                </h3>

                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusCls(selected.status)}`}>
                  {statusTxt(selected.status)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl">
                  <FiUser size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {getName(selected)}
                  </p>

                  <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <FiPhone size={11} />
                    {getPhone(selected)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FiMapPin size={11} />
                    Ünvan
                  </p>
                  <p className="font-semibold text-slate-700 mt-1">
                    {getAddr(selected)}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FiHome size={11} />
                    Yaşayış
                  </p>
                  <p className="font-semibold text-slate-700 mt-1">
                    {getHouse(selected)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Başqa heyvanı var?
                </p>
                <p className="font-semibold text-slate-700 mt-1">
                  {selected.hasOtherPets ? 'Bəli ✅' : 'Xeyr'}
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-sky-500 flex items-center gap-1">
                  <FiMessageSquare size={11} />
                  Müraciət səbəbi
                </p>
                <p className="text-slate-700 font-medium mt-1 leading-relaxed">
                  {getReason(selected)}
                </p>
              </div>
            </div>

            {/* BURADA r YOX, selected İSTİFADƏ OLUNUR */}
            <div className="mt-5">
              <StartChatButton
                type={CHAT_TYPE.PET_ADOPTION}
                petId={getPetId(selected)}
                adoptionRequestId={selected.id}
                targetUserId={getApplicantUserId(selected) || undefined}
                className="w-full py-3 rounded-xl"
              >
                Müraciət edənə yaz
              </StartChatButton>
            </div>

            {selected.status === 1 && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => review(selected, 2)}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {busy ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <FiCheck size={16} />
                  )}
                  Təsdiq et
                </button>

                <button
                  onClick={() => review(selected, 3)}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                  <FiX size={16} />
                  Rədd et
                </button>
              </div>
            )}

            {selected.status === 1 && (
              <p className="text-[10px] text-amber-600 text-center font-semibold mt-2">
                Təsdiqləsəniz, heyvan sahibləndirilmiş statusuna keçəcək və digər müraciətlər avtomatik rədd olunacaq.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopAdoptions;