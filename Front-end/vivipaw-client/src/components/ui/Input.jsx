import { cn } from "../../utils/helpers";

export function Input({ label, error, icon: Icon, className, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        )}
        <input
          className={cn("input-base", Icon && "pl-11", error && "border-rose-400 focus:ring-rose-200", className)}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, rows = 4, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>}
      <textarea rows={rows}
        className={cn("input-base resize-none", error && "border-rose-400", className)} {...props} />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>}
      <select className={cn("input-base cursor-pointer", error && "border-rose-400", className)} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}