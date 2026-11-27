import React, { useState, useEffect, useCallback } from 'react';
import {
  LuArchive,
  LuTrash2,
  LuCalendarDays,
  LuUser,
  LuSearch,
  LuX,
  LuPawPrint,
  LuEyeOff,
} from 'react-icons/lu';
import { petApi, adoptionApi } from '../../../services/endpoints';
import { PLACEHOLDER_PET, GENDER_TEXT } from '../../../utils/constants';

const parseDate = (value) => {
  if (!value) return null;

  const direct = new Date(value);

  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const match = String(value).match(/(\d{2})\.(\d{2})\.(\d{4})/);

  if (match) {
    return new Date(`${match[3]}-${match[2]}-${match[1]}`);
  }

  return null;
};

const formatArchiveDate = (value) => {
  const date = parseDate(value);

  if (!date) return '—';

  return date.toLocaleDateString('az-AZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const getPetId = (request) => request.petId || request.pet?.id;

const getApplicantName = (request) =>
  request.applicantFullName ||
  request.applicant?.fullName ||
  request.fullName ||
  '—';

const ShopArchive = ({ showToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [hideTarget, setHideTarget] = useState(null);

  const [hiddenIds, setHiddenIds] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('hiddenShopArchivePetIds') || '[]'
      );
    } catch {
      return [];
    }
  });

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const [petsResponse, requestsResponse] = await Promise.all([
        petApi.mine().catch(() => null),
        adoptionApi.received().catch(() => null),
      ]);

      const pets = Array.isArray(petsResponse?.data)
        ? petsResponse.data
        : (petsResponse?.data?.items || []);

      const requests = Array.isArray(requestsResponse?.data)
        ? requestsResponse.data
        : (requestsResponse?.data?.items || []);

      let hidden = [];

      try {
        hidden = JSON.parse(
          localStorage.getItem('hiddenShopArchivePetIds') || '[]'
        );
      } catch {
        hidden = [];
      }

      const archivedPets = pets
        .filter((pet) => Number(pet.adoptionStatus) === 3)
        .filter((pet) => !hidden.includes(String(pet.id)))
        .map((pet) => {
          const approvedRequest = requests.find(
            (request) =>
              Number(request.status) === 2 &&
              String(getPetId(request)) === String(pet.id)
          );

          return {
            ...pet,
            adoptedTo: approvedRequest
              ? getApplicantName(approvedRequest)
              : '—',
            adoptedAt:
              approvedRequest?.reviewedAt ||
              approvedRequest?.dateText ||
              pet.updatedAt ||
              pet.dateText ||
              pet.createdAt ||
              null,
          };
        });

      setItems(archivedPets);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = items.filter((pet) => {
    const query = search.trim().toLowerCase();

    const date = parseDate(pet.adoptedAt);

    const matchFrom = !from || (date && date >= new Date(from));
    const matchTo = !to || (date && date <= new Date(`${to}T23:59:59`));

    const searchableText = [
      pet.name,
      pet.breed,
      pet.adoptedTo,
      pet.city,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchSearch = !query || searchableText.includes(query);

    return matchFrom && matchTo && matchSearch;
  });

  const hideFromArchive = (pet) => {
    const id = String(pet.id);

    setHiddenIds((previous) => {
      const next = [...new Set([...previous, id])];

      localStorage.setItem(
        'hiddenShopArchivePetIds',
        JSON.stringify(next)
      );

      return next;
    });

    setItems((previous) =>
      previous.filter((item) => String(item.id) !== id)
    );

    setHideTarget(null);

    showToast('🗂️ Heyvan arxiv siyahısından gizlədildi');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="relative flex-1">
          <LuSearch
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, cins və ya sahiblənən şəxs axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex gap-2 items-end">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Tarixdən
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Tarixədək
            </label>

            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>

          {(from || to || search) && (
            <button
              onClick={() => {
                setFrom('');
                setTo('');
                setSearch('');
              }}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              title="Filtrləri təmizlə"
            >
              <LuX size={15} />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 font-semibold px-1">
        <span className="text-sky-600 font-bold">{filtered.length}</span>
        {' '}sahibləndirilmiş heyvan
      </p>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-56 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <LuArchive className="mx-auto text-slate-300 mb-3" size={38} />
          <p className="text-sm text-slate-500 font-semibold">
            Arxivdə uyğun heyvan tapılmadı.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pet) => (
            <div
              key={pet.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="relative h-40 bg-slate-100">
                <img
                  src={pet.mainImageUrl || PLACEHOLDER_PET}
                  alt={pet.name}
                  className="w-full h-full object-cover opacity-80 grayscale-[20%]"
                />

                <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-900/75 text-white flex items-center gap-1">
                  <LuArchive size={11} />
                  Sahibləndirilib
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-2">
                <div>
                  <p className="font-black text-slate-900">
                    {pet.name}
                  </p>

                  <p className="text-[11px] text-slate-400 font-semibold">
                    {pet.breed} • {GENDER_TEXT[pet.gender] || '—'}
                  </p>
                </div>

                <div className="text-[11px] font-semibold text-slate-500 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <LuUser size={12} className="text-emerald-500" />
                    Yeni sahibi: {pet.adoptedTo}
                  </p>

                  <p className="flex items-center gap-1.5">
                    <LuCalendarDays size={12} className="text-sky-500" />
                    {formatArchiveDate(pet.adoptedAt)}
                  </p>
                </div>

                <div className="mt-auto pt-2">
                  {hideTarget === pet.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => hideFromArchive(pet)}
                        className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition"
                      >
                        Bəli, sil
                      </button>

                      <button
                        onClick={() => setHideTarget(null)}
                        className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      >
                        Geri
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setHideTarget(pet.id)}
                      className="w-full py-2 rounded-lg text-[11px] font-bold bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition flex items-center justify-center gap-1.5"
                    >
                      <LuEyeOff size={13} />
                      Sil
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopArchive;