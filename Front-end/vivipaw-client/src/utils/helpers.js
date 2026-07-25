// src/utils/helpers.js
export const formatPrice = (v) =>
  new Intl.NumberFormat("az-AZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(v ?? 0) + " ₼";

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString("az-AZ", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

export const formatAge = (months) => {
  if (!months || months < 1) return "Yeni doğulmuş";
  if (months < 12) return `${months} aylıq`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m === 0 ? `${y} yaş` : `${y} yaş ${m} ay`;
};

/** input[type=date] üçün: 2026-08-03 */
export const toDateInput = (d) => {
  const dt = d ? new Date(d) : new Date();
  return dt.toISOString().split("T")[0];
};

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const truncate = (text, n = 100) =>
  !text ? "" : text.length > n ? text.slice(0, n) + "…" : text;