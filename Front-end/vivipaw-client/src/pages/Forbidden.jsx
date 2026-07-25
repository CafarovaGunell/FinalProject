
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import Button from "../components/ui/Button";

export default function Forbidden() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto rounded-4xl bg-rose-50 grid place-items-center mb-6">
          <ShieldAlert size={44} className="text-rose-400" />
        </div>
        <h1 className="font-display text-3xl font-extrabold">İcazə yoxdur</h1>
        <p className="mt-3 text-ink-light">Bu səhifəyə giriş hüququnuz yoxdur.</p>
        <Link to="/" className="inline-block mt-7"><Button>Ana səhifə</Button></Link>
      </div>
    </div>
  );
}