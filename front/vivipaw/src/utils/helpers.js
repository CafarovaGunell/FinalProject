import { PET_ICONS } from './constants';

export const formatPrice = (v) =>
  new Intl.NumberFormat('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(v ?? 0) + ' ₼';

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('az-AZ', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }) : '';

export const formatAge = (months) => {
  if (!months || months < 1) return 'Yeni doğulmuş';
  if (months < 12) return `${months} aylıq`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m === 0 ? `${y} yaş` : `${y} yaş ${m} ay`;
};

export const toDateInput = (d) => {
  const dt = d ? new Date(d) : new Date();
  return dt.toISOString().split('T')[0];
};

export const getPetIcon = (name) => {
  if (!name) return '🐾';
  const key = name.toLowerCase().trim();
  return PET_ICONS[key] || '🐾';
};

export const truncate = (t, n = 100) => (!t ? '' : t.length > n ? t.slice(0, n) + '…' : t);

export const cn = (...c) => c.filter(Boolean).join(' ');




