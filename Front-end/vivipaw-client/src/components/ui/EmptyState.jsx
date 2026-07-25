
import { PawPrint } from "lucide-react";

export default function EmptyState({ icon: Icon = PawPrint, title = "Məlumat yoxdur", text, action }) {
  return (
    <div className="py-16 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 flex items-center justify-center mb-4">
        <Icon size={34} className="text-brand-400" />
      </div>
      <h3 className="text-lg font-display font-bold text-ink">{title}</h3>
      {text && <p className="mt-1.5 text-sm text-ink-muted max-w-sm">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}