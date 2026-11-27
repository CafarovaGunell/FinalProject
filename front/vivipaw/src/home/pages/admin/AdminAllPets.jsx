import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuSearch,
  LuPawPrint,
  LuUser,
  LuStore,
  LuMapPin,
  LuCalendar,
  LuEye,
  LuTrash2,
  LuX,
  LuShieldCheck,
  LuHeart,
  LuPhone,
} from 'react-icons/lu';
import { petApi, adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { PLACEHOLDER_PET } from '../../../utils/constants';
import { formatDate } from '../../../utils/helpers';
import { PageHeader, EmptyBox, Spinner, Badge, Modal, listFrom } from '../../components/admin/ui';

const STATUS_TEXT = {
  1: 'Mövcuddur',
  2: 'Gözləmədə',
  3: 'Sahiblənilib',
  4: 'Deaktiv',
};

const statusTone = (s) => {
  const n = Number(s);

  if (n === 1) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (n === 2) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (n === 3) return 'bg-sky-50 text-sky-700 border-sky-200';
  if (n === 4) return 'bg-slate-100 text-slate-500 border-slate-200';

  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const WideModal = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm p-4 lg:p-8 flex items-center justify-center"
      onMouseDown={onClose}
    >
      <div
        className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[2rem] shadow-2xl border border-slate-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h3 className="font-black text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-72px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon size={15} className="text-slate-400 shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 break-words">
        {value ?? '—'}
      </p>
    </div>
  </div>
);

const norm = (p, source) => ({
  ...p,
  id: p.id ?? p.petId,
  petId: p.petId ?? p.id,
  _source: source,
});

const AdminAllPets = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [approval, setApproval] = useState('');

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [confirmDel, setConfirmDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const fetchList = useCallback(async () => {
  setLoading(true);

  try {
    /*
      adoptedPets endpoint-i çağırılmır.
      Sadəcə public və pending elanlar götürülür.
    */
    const [publicRes, pendingRes] = await Promise.all([
      petApi.list({ page: 1, pageSize: 500 }).catch(() => null),
      adminApi.pendingPets(1, 500).catch(() => null),
    ]);

    const all = [
      ...listFrom(publicRes).map((x) => norm(x, 'public')),
      ...listFrom(pendingRes).map((x) => norm(x, 'pending')),
    ];

    const map = new Map();

    all.forEach((pet) => {
      const id = pet.id ?? pet.petId;
      if (!id) return;

      const adoptionStatus = Number(
        pet.adoptionStatus ?? pet.status
      );

      /*
        3 = Sahiblənilib.
        Sahiblənilmiş heyvanlar tam siyahıya əlavə edilmir.
      */
      if (adoptionStatus === 3) return;

      const old = map.get(id);

      /*
        Pending məlumatları varsa public məlumatın üstünə yazır,
        çünki pending-də admin üçün daha aktual məlumat ola bilər.
      */
      if (!old || pet._source === 'pending') {
        map.set(id, pet);
      }
    });

    setList([...map.values()]);
  } catch (error) {
    console.error('Heyvanlar yüklənmədi:', error);
    setList([]);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const cities = useMemo(() => {
    return [...new Set(list.map((p) => p.city).filter(Boolean))].sort();
  }, [list]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return list.filter((p) => {
      const hay = [
        p.name,
        p.breed,
        p.categoryName,
        p.city,
        p.ownerFullName,
        p.previousOwnerFullName,
        p.petShopName,
        p.contactPhone,
      ].filter(Boolean).join(' ').toLowerCase();

      if (q && !hay.includes(q)) return false;
      if (city && p.city !== city) return false;

      const st = p.adoptionStatus ?? p.status;
      if (status && String(st) !== String(status)) return false;

      if (approval === 'approved' && p.isApproved === false) return false;
      if (approval === 'pending' && p.isApproved !== false) return false;

      return true;
    });
  }, [list, search, city, status, approval]);

  const openDetail = async (p) => {
    setDetail(p);

    if (p._source === 'adopted') return;

    setDetailLoading(true);

    const res = await petApi.byId(p.id).catch(() => null);

    if (res?.success && res.data) {
      setDetail({ ...p, ...res.data });
    }

    setDetailLoading(false);
  };

  const doDelete = async () => {
    if (!confirmDel) return;

    setBusy(true);

    const res = await petApi.remove(confirmDel.id)
      .catch((e) => ({ success: false, message: getError(e) }));

    if (res?.success) {
      setList((l) => l.filter((x) => x.id !== confirmDel.id));
      if (detail?.id === confirmDel.id) setDetail(null);
      setConfirmDel(null);
      showToast('🗑️ Heyvan elanı silindi');
    } else {
      showToast(res?.message || 'Heyvan silinmədi');
    }

    setBusy(false);
  };

  const imgs = detail
    ? (detail.images || detail.imageUrls || [])
        .map((i) => i?.imageUrl || i)
        .filter(Boolean)
    : [];

  const mainImg = detail?.mainImageUrl || detail?.imageUrl || imgs[0] || PLACEHOLDER_PET;

  return (
    <div>
      <PageHeader
        title="Bütün heyvanlar"
        subtitle={`${filtered.length} / ${list.length} heyvan`}
      />

      {toast && (
        <div className="fixed top-20 right-6 z-[80] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Heyvan adı, cins, sahib, mağaza, şəhər..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="">Bütün şəhərlər</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="">Bütün statuslar</option>
          <option value="1">Mövcuddur</option>
          <option value="2">Gözləmədə</option>
          <option value="3">Sahiblənilib</option>
          <option value="4">Deaktiv</option>
        </select>

        <select
          value={approval}
          onChange={(e) => setApproval(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="">Təsdiq: hamısı</option>
          <option value="approved">Təsdiqlənmiş</option>
          <option value="pending">Təsdiq gözləyən</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyBox text="Heyvan tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">Heyvan</th>
                  <th className="px-5 py-3.5 hidden lg:table-cell">Sahib / mağaza</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Şəhər</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Tarix</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                  <th className="px-5 py-3.5 text-right">Təsdiq</th>
                  <th className="px-5 py-3.5 text-right w-20">Əməl.</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => {
                  const st = p.adoptionStatus ?? p.status;
                  const img = p.mainImageUrl || p.imageUrl || p.imageUrls?.[0] || PLACEHOLDER_PET;
                  const owner = p.petShopName || p.ownerFullName || p.previousOwnerFullName || p.ownerName;

                

                  return (
                    <tr
                      key={p.id}
                      onClick={() => openDetail(p)}
                      className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 transition cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 group-hover:text-sky-600 truncate">
                              {p.name || 'Adsız'}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400 truncate">
                              {p.categoryName || '—'} • {p.breed || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <p className="font-bold text-slate-600 flex items-center gap-1.5">
                          {p.petShopName ? <LuStore size={13} /> : <LuUser size={13} />}
                          {owner || '—'}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 hidden md:table-cell text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <LuMapPin size={12} />
                          {p.city || '—'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 hidden sm:table-cell text-slate-500 font-semibold text-xs">
                        {p.createdAt ? formatDate(p.createdAt) : (p.dateText || '—')}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Badge className={statusTone(st)}>
                          {p.adoptionStatusText || STATUS_TEXT[Number(st)] || '—'}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Badge
                          className={
                            p.isApproved === false
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }
                        >
                          {p.isApproved === false ? 'Gözləyir' : 'Təsdiqli'}
                        </Badge>
                      </td>

                      <td
                        className="px-5 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(p)}
                            title="Ətraflı"
                            className="p-2 rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition"
                          >
                            <LuEye size={15} />
                          </button>

<button
  onClick={() => setConfirmDel(p)}
  title="Sil"
  className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
>
  <LuTrash2 size={15} />
</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <WideModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.name || 'Heyvan'} — məlumatlar` : ''}
      >
        {detailLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : detail ? (
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">
            <div className="space-y-3">
              <img
                src={mainImg}
                alt={detail.name}
                className="w-full aspect-square rounded-3xl object-cover border border-slate-200 bg-slate-50"
              />

              {imgs.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {[mainImg, ...imgs.filter((x) => x !== mainImg)].slice(0, 10).map((img, i) => (
                    <img
                      key={`${img}-${i}`}
                      src={img}
                      alt=""
                      className="aspect-square rounded-xl object-cover border border-slate-200"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={statusTone(detail.adoptionStatus)}>
                    {detail.adoptionStatusText || STATUS_TEXT[Number(detail.adoptionStatus)] || '—'}
                  </Badge>
                  <Badge
                    className={
                      detail.isApproved === false
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }
                  >
                    {detail.isApproved === false ? 'Təsdiq gözləyir' : 'Təsdiqlənib'}
                  </Badge>
                </div>

                <h2 className="text-3xl font-black text-slate-900">
                  {detail.name || 'Adsız'}
                </h2>

                <p className="text-sm font-semibold text-slate-500 mt-1">
                  {detail.categoryName || '—'} • {detail.breed || '—'} • {detail.ageText || `${detail.ageInMonths ?? '—'} ay`}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <LuPawPrint size={14} />
                    Heyvan
                  </p>
                  <Info icon={LuPawPrint} label="Cinsiyyət" value={detail.genderText} />
                  <Info icon={LuPawPrint} label="Ölçü" value={detail.sizeText} />
                  <Info icon={LuPawPrint} label="Rəng" value={detail.color} />
                  <Info icon={LuShieldCheck} label="Peyvənd" value={detail.isVaccinated ? 'Bəli' : 'Xeyr'} />
                  <Info icon={LuShieldCheck} label="Sterilizasiya" value={detail.isNeutered ? 'Bəli' : 'Xeyr'} />
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <LuUser size={14} />
                    Sahib / əlaqə
                  </p>
                  <Info icon={detail.petShopName ? LuStore : LuUser} label="Sahib" value={detail.petShopName || detail.ownerFullName || detail.previousOwnerFullName} />
                  <Info icon={LuPhone} label="Telefon" value={detail.contactPhone || detail.petShopPhone || detail.previousOwnerPhone} />
                  <Info icon={LuMapPin} label="Şəhər" value={detail.city} />
                  <Info icon={LuMapPin} label="Ünvan" value={detail.address || detail.petShopAddress} />
                </div>
              </div>

              {detail.adopterFullName && (
                <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-4 grid md:grid-cols-2 gap-4">
                  <p className="md:col-span-2 text-xs font-black text-emerald-800 flex items-center gap-1.5">
                    <LuHeart size={14} />
                    Sahiblənən şəxs
                  </p>
                  <Info icon={LuUser} label="Ad Soyad" value={detail.adopterFullName} />
                  <Info icon={LuPhone} label="Telefon" value={detail.adopterPhone} />
                  <Info icon={LuMapPin} label="Ünvan" value={detail.adopterAddress} />
                  <Info icon={LuCalendar} label="Sahiblənmə tarixi" value={detail.adoptedAt ? formatDate(detail.adoptedAt) : '—'} />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-slate-900 mb-2">
                    Təsvir
                  </p>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {detail.description || 'Təsvir yoxdur.'}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-slate-900 mb-2">
                    Sağlamlıq / səbəb
                  </p>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {detail.healthNotes || detail.reasonToGiveAway || 'Qeyd yoxdur.'}
                  </p>
                </div>
              </div>

 <div className="flex justify-end">
  <button
    onClick={() => setConfirmDel(detail)}
    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
  >
    <LuTrash2 size={14} />
    Elanı sil
  </button>
</div>
            </div>
          </div>
        ) : null}
      </WideModal>

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Heyvan elanını sil"
      >
        <p className="text-sm font-semibold text-slate-600">
          <span className="font-black text-slate-900">
            {confirmDel?.name}
          </span>{' '}
          silinəcək.
        </p>

        <p className="mt-3 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Sahiblənilmiş heyvanlarda silmə bloklanıb. Digər elanlar admin tərəfindən silinə bilər.
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => setConfirmDel(null)}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            İmtina
          </button>

          <button
            onClick={doDelete}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50"
          >
            {busy ? <Spinner small /> : <LuTrash2 size={14} />}
            Bəli, sil
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAllPets;