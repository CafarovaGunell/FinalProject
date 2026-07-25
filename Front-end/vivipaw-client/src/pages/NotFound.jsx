
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto rounded-4xl bg-brand-50 grid place-items-center mb-6">
          <PawPrint size={44} className="text-brand-400" />
        </div>
        <h1 className="font-display text-6xl font-extrabold text-brand-500">404</h1>
        <p className="mt-3 text-ink-light">Bu səhifə tapılmadı 🐾</p>
        <Link to="/" className="inline-block mt-7"><Button>Ana səhifəyə qayıt</Button></Link>
      </div>
    </div>
  );
}