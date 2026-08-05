import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuSearch, LuHeart, LuUser, LuPawPrint, LuPhone, LuMapPin,
  LuCalendar, LuEye, LuX, LuFileText, LuTrash2,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { REQUEST_STATUS_TEXT, REQUEST_STATUS_COLOR, PLACEHOLDER_PET } from '../../../utils/constants';
import { formatDate, formatDateTime } from '../../../utils/helpers';
import { PageHeader, EmptyBox, Badge, listFrom } from '../../components/admin/ui';

/* Status mətnini həmişə Azərbaycanca göstər */
const statusLabel = (s) => REQUEST_STATUS_TEXT[s] || '—';
const statusColor = (s) => REQUEST_STATUS_COLOR[s] || 'bg-slate-100 text-slate-600 border-slate-200';

const WideModal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm p-4 lg:p-8 flex items-center justify-center" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[2rem] shadow-2xl border border-slate-200" onMouseDown={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"><LuX size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(92vh-72px)]">{children}</div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon size={15} className="text-slate-400 shrink-0 mt-0.5" />
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-800 break-words">{value || '—'}</p>
    </div>
  </div>
);

const AdminAdoptionRequests = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.adoptionRequests().catch(() => null);
    const hidden = JSON.parse(localStorage.getItem('hiddenAdminAdoptionIds') || '[]');
    setList(listFrom(res).filter((r) => !hidden.includes(String(r.id))));
    setLoading(false);
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((r) => {
      const hay = [r.petName, r.petBreed, r.petCategoryName, r.applicantFullName,
        r.applicantEmail, r.applicantPhone, r.ownerFullName, r.reason, r.petCity,
      ].filter(Boolean).join(' ').toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (status && String(r.status) !== String(status)) return false;
      return true;
    });
  }, [list, search, status]);

  const removeItem = (r) => {
    const id = String(r.id);
    const prev = JSON.parse(localStorage.getItem('hiddenAdminAdoptionIds') || '[]');
    localStorage.setItem('hiddenAdminAdoptionIds', JSON.stringify([...new Set([...prev, id])]));
    setList((p) => p.filter((x) => String(x.id) !== id));
    setDeleteId(null);
    setDetail(null);
  };

  return (
    <div>
      <PageHeader title="Sahiblənmə müraciətləri" subtitle={`${filtered.length} / ${list.length} müraciət • yalnız baxış`} />

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Heyvan, müraciət edən, sahib, telefon, şəhər..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer">
          <option value="">Bütün statuslar</option>
          {Object.entries(REQUEST_STATUS_TEXT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(7)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyBox text="Müraciət tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">Heyvan</th>
                  <th className="px-5 py-3.5">Müraciət edən</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Sahib</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Tarix</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                  <th className="px-5 py-3.5 text-right w-24">Əməl.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 cursor-pointer group">
                    <td className="px-5 py-3.5" onClick={() => setDetail(r)}>
                      <div className="flex items-center gap-3">
                        <img src={r.petImageUrl || PLACEHOLDER_PET} alt={r.petName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200" />
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-sky-600">{r.petName || '—'}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{r.petCategoryName || '—'} • {r.petBreed || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5" onClick={() => setDetail(r)}>
                      <p className="font-bold text-slate-700 flex items-center gap-1.5"><LuUser size={13} /> {r.applicantFullName || '—'}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{r.applicantPhone || r.applicantEmail || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell font-semibold text-slate-500" onClick={() => setDetail(r)}>
                      {r.ownerFullName || '—'}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-xs font-semibold text-slate-500" onClick={() => setDetail(r)}>
                      {r.createdAt ? formatDate(r.createdAt) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={() => setDetail(r)}>
                      <Badge className={statusColor(r.status)}>{statusLabel(r.status)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetail(r)} title="Ətraflı"
                          className="p-2 rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition"><LuEye size={15} /></button>
                        {deleteId === r.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => removeItem(r)}
                              className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition">Bəli</button>
                            <button onClick={() => setDeleteId(null)}
                              className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Xeyr</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(r.id)} title="Siyahıdan sil"
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"><LuTrash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <WideModal open={!!detail} onClose={() => { setDetail(null); setDeleteId(null); }}
        title={detail ? `${detail.petName || 'Heyvan'} — müraciət məlumatları` : ''}>
        {detail && (
          <div className="grid lg:grid-cols-[340px_1fr] gap-6">
            <div className="space-y-4">
              <img src={detail.petImageUrl || PLACEHOLDER_PET} alt={detail.petName}
                className="w-full aspect-square rounded-3xl object-cover border border-slate-200" />
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <Badge className={statusColor(detail.status)}>{statusLabel(detail.status)}</Badge>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5"><LuUser size={14} /> Müraciət edən</p>
                  <Info icon={LuUser} label="Ad Soyad" value={detail.applicantFullName} />
                  <Info icon={LuPhone} label="Telefon" value={detail.applicantPhone} />
                  <Info icon={LuMapPin} label="Ünvan" value={detail.applicantAddress} />
                  <Info icon={LuFileText} label="Yaşayış tipi" value={detail.housingType} />
                  <Info icon={LuHeart} label="Başqa heyvan var?" value={
                    detail.hasOtherPets === true || detail.hasOtherPets === 'True' || detail.hasOtherPets === 'true'
                      ? 'Bəli' : detail.hasOtherPets === false || detail.hasOtherPets === 'False' || detail.hasOtherPets === 'false'
                      ? 'Xeyr' : detail.hasOtherPets || '—'
                  } />
                </div>
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5"><LuPawPrint size={14} /> Heyvan / sahib</p>
                  <Info icon={LuPawPrint} label="Heyvan" value={detail.petName} />
                  <Info icon={LuPawPrint} label="Cins" value={detail.petBreed} />
                  <Info icon={LuMapPin} label="Şəhər" value={detail.petCity} />
                  <Info icon={LuUser} label="Elan sahibi" value={detail.ownerFullName} />
                  <Info icon={LuPhone} label="Sahib telefonu" value={detail.ownerPhone} />
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-black text-slate-900 mb-2">Müraciət səbəbi</p>
                <p className="text-sm font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">{detail.reason || '—'}</p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 grid md:grid-cols-2 gap-4">
                <Info icon={LuCalendar} label="Müraciət tarixi" value={detail.createdAt ? formatDateTime(detail.createdAt) : '—'} />
                <Info icon={LuCalendar} label="Baxılma tarixi" value={detail.reviewedAt ? formatDateTime(detail.reviewedAt) : '—'} />
                <Info icon={LuUser} label="Baxan admin/sahib" value={detail.reviewedByFullName} />
                <Info icon={LuFileText} label="Qeyd" value={detail.reviewNote} />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-bold">Statusu elan sahibi/mağaza idarə edir.</p>
                {deleteId === detail.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => removeItem(detail)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition">Bəli, sil</button>
                    <button onClick={() => setDeleteId(null)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Geri</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(detail.id)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition">
                    <LuTrash2 size={13} /> Siyahıdan sil
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </WideModal>
    </div>
  );
};

export default AdminAdoptionRequests;