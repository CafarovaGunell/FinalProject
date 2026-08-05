import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuSearch, LuCalendar, LuClock, LuUser, LuStethoscope, LuPawPrint,
  LuMapPin, LuPhone, LuWalletCards, LuEye, LuX, LuFileText, LuTrash2,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { APPOINTMENT_STATUS_TEXT, APPOINTMENT_STATUS_COLOR } from '../../../utils/constants';
import { formatDate, formatDateTime, formatPrice } from '../../../utils/helpers';
import { PageHeader, EmptyBox, Badge, listFrom } from '../../components/admin/ui';

const COMPLETED = 3;

const statusLabel = (s) => APPOINTMENT_STATUS_TEXT[s] || '—';
const statusColor = (s) => APPOINTMENT_STATUS_COLOR[s] || 'bg-slate-100 text-slate-600 border-slate-200';

const isWithinDays = (dateStr, days) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
};

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

const SummaryCard = ({ icon: Icon, title, value, tone = 'sky' }) => {
  const tones = {
    sky: 'bg-sky-50 text-sky-600', emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600', amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 ${tones[tone] || tones.sky}`}><Icon size={21} /></div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
};

const AdminAppointments = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [detail, setDetail] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.appointments(status || undefined, date || undefined).catch(() => null);
    const hidden = JSON.parse(localStorage.getItem('hiddenAdminAppointmentIds') || '[]');
    setList(listFrom(res).filter((a) => !hidden.includes(String(a.id))));
    setLoading(false);
  }, [status, date]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((a) => {
      const hay = [a.customerFullName, a.customerEmail, a.customerPhone,
        a.veterinarianFullName, a.clinicName, a.serviceName, a.petName, a.clinicCity,
      ].filter(Boolean).join(' ').toLowerCase();
      return !q || hay.includes(q);
    });
  }, [list, search]);

  // Son 1 ay statistikaları
  const monthAppointments = useMemo(() => filtered.filter((a) => isWithinDays(a.startTime || a.createdAt, 30)), [filtered]);
  const monthCompleted = useMemo(() => monthAppointments.filter((a) => Number(a.status) === COMPLETED), [monthAppointments]);
  const monthRevenue = useMemo(() => monthCompleted.reduce((sum, a) => sum + Number(a.priceSnapshot || a.servicePrice || 0), 0), [monthCompleted]);

  const removeItem = (a) => {
    const id = String(a.id);
    const prev = JSON.parse(localStorage.getItem('hiddenAdminAppointmentIds') || '[]');
    localStorage.setItem('hiddenAdminAppointmentIds', JSON.stringify([...new Set([...prev, id])]));
    setList((p) => p.filter((x) => String(x.id) !== id));
    setDeleteId(null);
    setDetail(null);
  };

  return (
    <div>
      <PageHeader title="Randevular" subtitle={`${filtered.length} / ${list.length} baytar görüşü • yalnız baxış`} />

      {/* Son 1 ay statistikaları */}
      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Son 1 ay</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <SummaryCard icon={LuCalendar} title="Son 1 aydakı randevular" value={monthAppointments.length} tone="sky" />
        <SummaryCard icon={LuClock} title="Tamamlanan (1 ay)" value={monthCompleted.length} tone="emerald" />
        <SummaryCard icon={LuWalletCards} title="Xidmət həcmi (1 ay)" value={formatPrice(monthRevenue)} tone="violet" />
      </div>

      {/* FİLTRLƏR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Müştəri, baytar, klinika, xidmət, heyvan..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer">
          <option value="">Bütün statuslar</option>
          {Object.entries(APPOINTMENT_STATUS_TEXT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500" />
      </div>

      {/* CƏDVƏL */}
      {loading ? (
        <div className="space-y-3">{[...Array(7)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyBox text="Randevu tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">Müştəri</th>
                  <th className="px-5 py-3.5">Baytar / klinika</th>
                  <th className="px-5 py-3.5 hidden lg:table-cell">Xidmət</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Tarix</th>
                  <th className="px-5 py-3.5">Qiymət</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                  <th className="px-5 py-3.5 text-right w-24">Əməl.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 cursor-pointer group">
                    <td className="px-5 py-3.5" onClick={() => setDetail(a)}>
                      <p className="font-bold text-slate-700 flex items-center gap-1.5"><LuUser size={13} /> {a.customerFullName || '—'}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{a.customerPhone || a.customerEmail || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5" onClick={() => setDetail(a)}>
                      <p className="font-bold text-slate-700 flex items-center gap-1.5"><LuStethoscope size={13} /> {a.veterinarianFullName || '—'}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{a.clinicName || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell font-semibold text-slate-500" onClick={() => setDetail(a)}>{a.serviceName || '—'}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-xs font-semibold text-slate-500" onClick={() => setDetail(a)}>{a.startTime ? formatDateTime(a.startTime) : '—'}</td>
                    <td className="px-5 py-3.5 font-black text-slate-900" onClick={() => setDetail(a)}>{formatPrice(a.priceSnapshot || a.servicePrice || 0)}</td>
                    <td className="px-5 py-3.5 text-right" onClick={() => setDetail(a)}>
                      <Badge className={statusColor(a.status)}>{statusLabel(a.status)}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetail(a)} title="Ətraflı"
                          className="p-2 rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition"><LuEye size={15} /></button>
                        {deleteId === a.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => removeItem(a)}
                              className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition">Bəli</button>
                            <button onClick={() => setDeleteId(null)}
                              className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Xeyr</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(a.id)} title="Siyahıdan sil"
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

      {/* DETAL MODALI */}
      <WideModal open={!!detail} onClose={() => { setDetail(null); setDeleteId(null); }}
        title={detail ? `Randevu #${detail.id}` : ''}>
        {detail && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              <SummaryCard icon={LuWalletCards} title="Qiymət" value={formatPrice(detail.priceSnapshot || detail.servicePrice || 0)} tone="emerald" />
              <SummaryCard icon={LuCalendar} title="Tarix" value={detail.startTime ? formatDate(detail.startTime) : '—'} tone="sky" />
              <SummaryCard icon={LuClock} title="Status" value={statusLabel(detail.status)} tone="violet" />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5"><LuUser size={14} /> Müştəri</p>
                <Info icon={LuUser} label="Ad Soyad" value={detail.customerFullName} />
                <Info icon={LuPhone} label="Telefon" value={detail.customerPhone} />
                <Info icon={LuPawPrint} label="Heyvan" value={detail.petName} />
                <Info icon={LuPawPrint} label="Cins" value={detail.petBreed} />
              </div>
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5"><LuStethoscope size={14} /> Baytar</p>
                <Info icon={LuUser} label="Baytar" value={detail.veterinarianFullName} />
                <Info icon={LuStethoscope} label="Klinika" value={detail.clinicName} />
                <Info icon={LuPhone} label="Klinika telefonu" value={detail.clinicPhone} />
                <Info icon={LuMapPin} label="Ünvan" value={detail.clinicAddress || detail.clinicCity} />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 grid md:grid-cols-2 gap-4">
              <Info icon={LuStethoscope} label="Xidmət" value={detail.serviceName} />
              <Info icon={LuWalletCards} label="Xidmət qiyməti" value={formatPrice(detail.priceSnapshot || detail.servicePrice || 0)} />
              <Info icon={LuCalendar} label="Başlama" value={detail.startTime ? formatDateTime(detail.startTime) : '—'} />
              <Info icon={LuClock} label="Bitmə" value={detail.endTime ? formatDateTime(detail.endTime) : '—'} />
            </div>

            <div className="border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5"><LuFileText size={14} /> Qeyd</p>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">{detail.reason || '—'}</p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 font-bold">Statusu baytar/müştəri idarə edir.</p>
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
        )}
      </WideModal>
    </div>
  );
};

export default AdminAppointments;