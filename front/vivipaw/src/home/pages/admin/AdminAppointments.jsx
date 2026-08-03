import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuSearch, LuCalendar, LuClock, LuUser, LuStethoscope, LuPawPrint,
  LuMapPin, LuPhone, LuWalletCards, LuEye, LuX, LuFileText,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { APPOINTMENT_STATUS_TEXT, APPOINTMENT_STATUS_COLOR } from '../../../utils/constants';
import { formatDate, formatDateTime, formatPrice } from '../../../utils/helpers';
import { PageHeader, EmptyBox, Spinner, Badge, listFrom } from '../../components/admin/ui';

const COMPLETED = 3;

const WideModal = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm p-4 lg:p-8 flex items-center justify-center" onMouseDown={onClose}>
      <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[2rem] shadow-2xl border border-slate-200" onMouseDown={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
            <LuX size={18} />
          </button>
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

const SummaryCard = ({ icon: Icon, title, value }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 grid place-items-center">
      <Icon size={21} />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

const AdminAppointments = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [detail, setDetail] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.appointments(status || undefined, date || undefined).catch(() => null);
    setList(listFrom(res));
    setLoading(false);
  }, [status, date]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return list.filter((a) => {
      const hay = [
        a.customerFullName,
        a.customerEmail,
        a.customerPhone,
        a.veterinarianFullName,
        a.clinicName,
        a.serviceName,
        a.petName,
        a.clinicCity,
      ].filter(Boolean).join(' ').toLowerCase();

      return !q || hay.includes(q);
    });
  }, [list, search]);

  const completed = useMemo(() => filtered.filter((a) => Number(a.status) === COMPLETED), [filtered]);

  const vetRevenue = useMemo(() => {
    return completed.reduce((sum, a) => sum + Number(a.priceSnapshot || a.servicePrice || 0), 0);
  }, [completed]);

  return (
    <div>
      <PageHeader
        title="Randevular"
        subtitle={`${filtered.length} / ${list.length} baytar görüşü • admin yalnız baxır`}
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <SummaryCard icon={LuCalendar} title="Bütün randevular" value={filtered.length} />
        <SummaryCard icon={LuClock} title="Tamamlanan" value={completed.length} />
        <SummaryCard icon={LuWalletCards} title="Baytar xidmət həcmi" value={formatPrice(vetRevenue)} />
        <SummaryCard icon={LuStethoscope} title="Aktiv filtr" value={status ? (APPOINTMENT_STATUS_TEXT[status] || status) : 'Hamısı'} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Müştəri, baytar, klinika, xidmət, heyvan..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="">Bütün statuslar</option>
          {Object.entries(APPOINTMENT_STATUS_TEXT).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
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
                  <th className="px-5 py-3.5 text-right w-12" />
                </tr>
              </thead>

              <tbody>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setDetail(a)}
                    className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-700 flex items-center gap-1.5">
                        <LuUser size={13} /> {a.customerFullName || '—'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold">{a.customerPhone || a.customerEmail || '—'}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-700 flex items-center gap-1.5">
                        <LuStethoscope size={13} /> {a.veterinarianFullName || '—'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold">{a.clinicName || '—'}</p>
                    </td>

                    <td className="px-5 py-3.5 hidden lg:table-cell font-semibold text-slate-500">
                      {a.serviceName || '—'}
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell text-xs font-semibold text-slate-500">
                      {a.startTime ? formatDateTime(a.startTime) : '—'}
                    </td>

                    <td className="px-5 py-3.5 font-black text-slate-900">
                      {formatPrice(a.priceSnapshot || a.servicePrice || 0)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Badge className={APPOINTMENT_STATUS_COLOR[a.status] || 'bg-slate-100 text-slate-600 border-slate-200'}>
                        {a.statusText || APPOINTMENT_STATUS_TEXT[a.status] || '—'}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <LuEye size={15} className="inline text-slate-300 group-hover:text-sky-500" />
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
        title={detail ? `Randevu #${detail.id}` : ''}
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              <SummaryCard icon={LuWalletCards} title="Qiymət" value={formatPrice(detail.priceSnapshot || detail.servicePrice || 0)} />
              <SummaryCard icon={LuCalendar} title="Tarix" value={detail.startTime ? formatDate(detail.startTime) : '—'} />
              <SummaryCard icon={LuClock} title="Status" value={detail.statusText || APPOINTMENT_STATUS_TEXT[detail.status] || '—'} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <LuUser size={14} /> Müştəri
                </p>
                <Info icon={LuUser} label="Ad Soyad" value={detail.customerFullName} />
                <Info icon={LuPhone} label="Telefon" value={detail.customerPhone} />
                <Info icon={LuPawPrint} label="Heyvan" value={detail.petName} />
                <Info icon={LuPawPrint} label="Cins" value={detail.petBreed} />
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <LuStethoscope size={14} /> Baytar
                </p>
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
              <Info icon={LuClock} label="Bitmə" value={detail.endTime} />
            </div>

            <div className="border border-slate-200 rounded-2xl p-4">
              <p className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
                <LuFileText size={14} /> Qeyd / səbəb
              </p>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
                {detail.reason || '—'}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 font-bold text-center">
              Admin bu səhifədə randevu statusuna müdaxilə etmir. Statusu baytar/müştəri axını idarə edir.
            </p>
          </div>
        )}
      </WideModal>
    </div>
  );
};

export default AdminAppointments;