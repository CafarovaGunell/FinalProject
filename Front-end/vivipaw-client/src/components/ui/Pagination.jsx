
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/helpers";

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  const btn = "w-10 h-10 rounded-xl text-sm font-semibold transition flex items-center justify-center";

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        className={cn(btn, "border border-slate-200 hover:bg-slate-50 disabled:opacity-40")}>
        <ChevronLeft size={16} />
      </button>

      {start > 1 && <span className="text-ink-muted px-1">…</span>}

      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={cn(btn, p === page
            ? "bg-brand-500 text-white shadow-soft"
            : "border border-slate-200 hover:bg-slate-50")}>
          {p}
        </button>
      ))}

      {end < totalPages && <span className="text-ink-muted px-1">…</span>}

      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
        className={cn(btn, "border border-slate-200 hover:bg-slate-50 disabled:opacity-40")}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}