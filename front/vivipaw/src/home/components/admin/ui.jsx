import React from 'react';
import { LuX, LuInbox } from 'react-icons/lu';

/* Backend cavabını array-ə çevirir (list və ya paged) */
export const listFrom = (res) => {
  if (!res?.success) return [];
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};

/* Təsdiq gövdəsi — DTO variantlarından asılı olmayaraq işləyir
   (artıq sahələr ASP.NET tərəfindən ignore olunur) */
export const approveBody = (approve, reason = '') => ({
  approve,
  isApproved: approve,
  status: approve ? 2 : 3,
  reason,
  rejectReason: reason,
});

export const Spinner = ({ small }) => (
  <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${small ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
);

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl font-black text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export const StatCard = ({ icon: Icon, label, value, tone = 'sky', onClick }) => {
  const tones = {
    sky: 'bg-sky-50 text-sky-600', amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600', slate: 'bg-slate-100 text-slate-600',
  };
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-left w-full ${onClick ? 'hover:shadow-md hover:-translate-y-0.5 transition' : ''}`}>
      <div className={`p-3 rounded-xl shrink-0 ${tones[tone]}`}><Icon size={20} /></div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-slate-900 leading-none truncate">{value ?? '—'}</p>
        <p className="text-[11px] font-bold text-slate-400 mt-1 truncate">{label}</p>
      </div>
    </Comp>
  );
};

export const Badge = ({ className = '', children }) => (
  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap ${className}`}>{children}</span>
);

export const EmptyBox = ({ text = 'Məlumat tapılmadı.' }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
    <Inbox className="mx-auto text-slate-300 mb-2" size={36} />
    <p className="text-sm text-slate-500 font-semibold">{text}</p>
  </div>
);

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><X size={16} /></button>
        <h3 className="text-lg font-bold text-slate-900 mb-4 pr-8">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export const Avatar = ({ name = '?', src, size = 'h-9 w-9 text-sm' }) => (
  src
    ? <img src={src} alt={name} className={`${size} rounded-full object-cover shrink-0`} />
    : <div className={`${size} bg-sky-100 text-sky-700 rounded-full grid place-items-center font-bold shrink-0`}>{(name || '?').charAt(0)}</div>
);