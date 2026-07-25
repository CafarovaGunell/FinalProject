// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import { PawPrint, Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 bg-white border-t border-slate-100">
      <div className="container-app py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center">
                <PawPrint size={20} className="text-white" />
              </div>
              <span className="font-display font-extrabold text-xl">
                ViVi<span className="text-brand-500">Paw</span>
              </span>
            </Link>
            <p className="text-sm text-ink-muted leading-relaxed">
              Hər pəncəyə isti bir yuva. Sahiblənmə, baytar xidməti və ev heyvanı
              məhsulları — hamısı bir platformada.
            </p>
            <div className="flex gap-2 mt-5">
              {[Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-brand-50 grid place-items-center text-brand-500 hover:bg-brand-100 transition">
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Kəşf et</h4>
            <ul className="space-y-2.5 text-sm text-ink-muted">
              <li><Link to="/pets" className="hover:text-brand-500 transition">Heyvanlar</Link></li>
              <li><Link to="/shop" className="hover:text-brand-500 transition">Mağaza</Link></li>
              <li><Link to="/vets" className="hover:text-brand-500 transition">Baytarlar</Link></li>
              <li><Link to="/blog" className="hover:text-brand-500 transition">Bloq</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Hesab</h4>
            <ul className="space-y-2.5 text-sm text-ink-muted">
              <li><Link to="/login" className="hover:text-brand-500 transition">Giriş</Link></li>
              <li><Link to="/register" className="hover:text-brand-500 transition">Qeydiyyat</Link></li>
              <li><Link to="/pets/new" className="hover:text-brand-500 transition">Elan yerləşdir</Link></li>
              <li><Link to="/testimonials" className="hover:text-brand-500 transition">Rəylər</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Əlaqə</h4>
            <ul className="space-y-3 text-sm text-ink-muted">
              <li className="flex items-center gap-2.5"><Mail size={15} className="text-brand-400" /> info@vivipaw.az</li>
              <li className="flex items-center gap-2.5"><Phone size={15} className="text-brand-400" /> +994 12 555 44 33</li>
              <li className="flex items-center gap-2.5"><MapPin size={15} className="text-brand-400" /> Bakı, Azərbaycan</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">© {new Date().getFullYear()} ViViPaw. Bütün hüquqlar qorunur.</p>
          <p className="text-xs text-ink-muted">Sevgi ilə hazırlanıb 🐾</p>
        </div>
      </div>
    </footer>
  );
}