
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/helpers";

const variants = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-soft hover:shadow-hover",
  secondary: "bg-teal-500 text-white hover:bg-teal-600 shadow-soft",
  outline: "border-2 border-brand-500 text-brand-600 hover:bg-brand-50",
  ghost: "text-ink-light hover:bg-slate-100",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
  soft: "bg-brand-100 text-brand-700 hover:bg-brand-200",
};

const sizes = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  children, variant = "primary", size = "md",
  loading = false, disabled, className, icon: Icon, ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
        "transition-all duration-200 active:scale-[.97]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}