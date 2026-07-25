
import { cn } from "../../utils/helpers";

export default function Badge({ children, className, size = "md" }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-semibold",
      size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
      className || "bg-slate-100 text-slate-700"
    )}>
      {children}
    </span>
  );
}