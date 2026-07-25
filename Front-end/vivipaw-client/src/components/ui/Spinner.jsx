
export default function Spinner({ full = false, label = "Yüklənir..." }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
        <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>
      {label && <p className="text-sm text-ink-muted">{label}</p>}
    </div>
  );
  return full ? (
    <div className="min-h-[60vh] flex items-center justify-center">{spinner}</div>
  ) : (
    <div className="py-16 flex justify-center">{spinner}</div>
  );
}