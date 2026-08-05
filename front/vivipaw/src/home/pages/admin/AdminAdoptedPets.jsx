import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuSearch,
  LuPawPrint,
  LuUser,
  LuMapPin,
  LuCalendar,
  LuPhone,
  LuMail,
  LuStore,
  LuX,
  LuHeartHandshake,
  LuShieldCheck,
  LuTrash2,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { PLACEHOLDER_PET } from '../../../utils/constants';
import { formatDate } from '../../../utils/helpers';
import { PageHeader, EmptyBox, Badge, listFrom } from '../../components/admin/ui';

const dateOf = (x) => {
  const raw = x?.adoptedAt || x?.requestCreatedAt || x?.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon size={15} className="text-slate-400 shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-800 break-words">{value || '—'}</p>
    </div>
  </div>
);

const WideModal = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm p-4 flex items-center justify-center"
      onMouseDown={onClose}
    >
      <div
        className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl shadow-2xl border border-slate-200"
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

const AdminAdoptedPets = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [detail, setDetail] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.adoptedPets().catch(() => null);
    const hidden = JSON.parse(localStorage.getItem('hiddenAdoptedPetIds') || '[]');
setList(listFrom(res).filter((x) => !hidden.includes(String(x.petId || x.id))));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);


  const removeItem = (x) => {
  const id = String(x.petId || x.id);
  const prev = JSON.parse(localStorage.getItem('hiddenAdoptedPetIds') || '[]');
  localStorage.setItem('hiddenAdoptedPetIds', JSON.stringify([...new Set([...prev, id])]));
  setList((p) => p.filter((item) => String(item.petId || item.id) !== id));
  setDeleteId(null);
  setDetail(null);
};

  const cities = useMemo(() => {
    return [...new Set(list.map((x) => x.city).filter(Boolean))];
  }, [list]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const f = from ? new Date(new Date(from).setHours(0, 0, 0, 0)) : null;
    const t = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : null;

    return list.filter((x) => {
      const hay = [
        x.name,
        x.breed,
        x.categoryName,
        x.city,
        x.adopterFullName,
        x.adopterEmail,
        x.adopterPhone,
        x.previousOwnerFullName,
        x.petShopName,
      ].filter(Boolean).join(' ').toLowerCase();

      if (q && !hay.includes(q)) return false;
      if (city && x.city !== city) return false;

      if (f || t) {
        const d = dateOf(x);
        if (!d) return false;
        if (f && d < f) return false;
        if (t && d > t) return false;
      }

      return true;
    });
  }, [list, search, city, from, to]);

  const imgs = detail
    ? (detail.imageUrls || detail.images || [])
        .map((i) => i?.imageUrl || i)
        .filter(Boolean)
    : [];

  const mainImg = detail?.mainImageUrl || imgs[0] || PLACEHOLDER_PET;

  return (
    <div>
      <PageHeader
        title="Sahiblənilən heyvanlar"
        subtitle={`${filtered.length} / ${list.length} sahibləndirilmiş heyvan`}
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Heyvan, sahiblənən, şəhər, əvvəlki sahib..."
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

        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyBox text="Sahiblənilmiş heyvan tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">Heyvan</th>
                  <th className="px-5 py-3.5">Sahiblənən</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Əvvəlki sahib</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Şəhər</th>
                  <th className="px-5 py-3.5">Tarix</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((x) => (
                  <tr
                    key={`${x.requestId}-${x.petId}`}
                    onClick={() => setDetail(x)}
                    className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 cursor-pointer transition group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={x.mainImageUrl || PLACEHOLDER_PET}
                          alt={x.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-sky-600">
                            {x.name}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-400">
                            {x.categoryName || '—'} • {x.breed || '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-700 flex items-center gap-1.5">
                        <LuUser size={13} className="text-slate-400" />
                        {x.adopterFullName || x.adopterEmail || '—'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {x.adopterPhone || x.adopterEmail || '—'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell text-slate-500 font-semibold">
                      {x.petShopName || x.previousOwnerFullName || '—'}
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <LuMapPin size={12} />
                        {x.city || '—'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 font-semibold text-xs">
                      {formatDate(x.adoptedAt || x.requestCreatedAt)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200">
                        Sahiblənilib
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <WideModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.name} — sahiblənmə məlumatları` : ''}
      >
        {detail && (
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">
            <div className="space-y-3">
              <img
                src={mainImg}
                alt={detail.name}
                className="w-full aspect-[4/3] object-cover rounded-3xl border border-slate-200 bg-slate-50"
              />

              {imgs.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {imgs.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="aspect-square object-cover rounded-xl border border-slate-200"
                    />
                  ))}
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <p className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                  <LuHeartHandshake size={15} />
                  Sahiblənmə tamamlanıb
                </p>
                <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                  Tarix: {formatDate(detail.adoptedAt || detail.requestCreatedAt)}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-2xl font-black text-slate-900">{detail.name}</h2>
                  <Badge className="bg-sky-50 text-sky-600 border-sky-200">
                    {detail.categoryName || 'Heyvan'}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  {detail.breed || 'Cins qeyd edilməyib'} • {detail.genderText || '—'} • {detail.ageInMonths ?? '—'} ay
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <LuUser size={14} />
                    Sahiblənən şəxs
                  </p>
                  <Info icon={LuUser} label="Ad Soyad" value={detail.adopterFullName} />
                  <Info icon={LuMail} label="E-poçt" value={detail.adopterEmail} />
                  <Info icon={LuPhone} label="Telefon" value={detail.adopterPhone} />
                  <Info icon={LuMapPin} label="Şəhər" value={detail.adopterCity} />
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <LuStore size={14} />
                    Əvvəlki sahib / mağaza
                  </p>
                  <Info icon={LuUser} label="Sahib" value={detail.previousOwnerFullName} />
                  <Info icon={LuMail} label="Sahib e-poçtu" value={detail.previousOwnerEmail} />
                  <Info icon={LuPhone} label="Sahib telefonu" value={detail.previousOwnerPhone} />
                  <Info icon={LuStore} label="Mağaza" value={detail.petShopName} />
                  <Info icon={LuPhone} label="Mağaza telefonu" value={detail.petShopPhone} />
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 grid md:grid-cols-2 gap-4">
                <p className="md:col-span-2 text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <LuPawPrint size={14} />
                  Heyvan məlumatları
                </p>

                <Info icon={LuShieldCheck} label="Vaksinasiya" value={detail.isVaccinated ? 'Bəli' : 'Xeyr'} />
                <Info icon={LuShieldCheck} label="Sterilizasiya" value={detail.isNeutered ? 'Bəli' : 'Xeyr'} />
                <Info icon={LuMapPin} label="Şəhər" value={detail.city} />
                <Info icon={LuMapPin} label="Ünvan" value={detail.address} />
                <Info icon={LuPhone} label="Əlaqə telefonu" value={detail.contactPhone} />
                <Info icon={LuCalendar} label="Müraciət tarixi" value={formatDate(detail.requestCreatedAt)} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-slate-900 mb-2">Təsvir</p>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                    {detail.description || 'Təsvir yoxdur.'}
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-slate-900 mb-2">Sağlamlıq qeydləri / səbəb</p>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                    {detail.healthNotes || detail.reasonToGiveAway || 'Qeyd yoxdur.'}
                  </p>                 
                </div>
                              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                {deleteId === (detail.petId || detail.id) ? (
                  <div className="flex gap-2">
                    <button onClick={() => removeItem(detail)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition">
                      Bəli, sil
                    </button>
                    <button onClick={() => setDeleteId(null)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                      Geri
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(detail.petId || detail.id)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition">
                    <LuTrash2 size={13} /> Siyahıdan sil
                  </button>
                )}
              </div>
              </div>
            </div>
            
          </div>
        )}
      </WideModal>
    </div>
  );
};

export default AdminAdoptedPets;