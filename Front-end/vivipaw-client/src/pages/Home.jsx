// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { PawPrint, Heart, Stethoscope, ShoppingBag, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";

const features = [
  { icon: Heart, title: "Sahiblən", text: "Yuva axtaran dostlarla tanış ol.", to: "/pets", color: "bg-brand-100 text-brand-600" },
  { icon: Stethoscope, title: "Baytar", text: "Onlayn növbə yaz, vaxt itirmə.", to: "/vets", color: "bg-teal-100 text-teal-600" },
  { icon: ShoppingBag, title: "Mağaza", text: "Yem, oyuncaq və aksesuarlar.", to: "/shop", color: "bg-amber-100 text-amber-600" },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute top-40 -left-24 w-80 h-80 rounded-full bg-teal-100/40 blur-3xl" />

        <div className="container-app relative py-20 lg:py-28 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-sm font-semibold mb-6">
            <PawPrint size={15} /> Hər pəncəyə bir yuva
          </span>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-3xl mx-auto">
            Yeni dostunu <span className="text-brand-500">ViViPaw</span>-da tap
          </h1>

          <p className="mt-5 text-ink-light max-w-xl mx-auto">
            Sahiblənmə, baytar randevusu və ev heyvanı məhsulları — hamısı bir yerdə.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/pets"><Button size="lg" icon={PawPrint}>Heyvanlara bax</Button></Link>
            <Link to="/vets"><Button size="lg" variant="outline">Baytar tap</Button></Link>
          </div>
        </div>
      </section>

      <section className="container-app pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <Link key={f.to} to={f.to}
              className="card p-7 hover:shadow-card hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-2xl grid place-items-center ${f.color}`}>
                <f.icon size={26} />
              </div>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{f.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 group-hover:gap-2.5 transition-all">
                Keç <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}