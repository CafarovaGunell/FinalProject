import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMail, FiPhone, FiMapPin, FiArrowUp, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import { FaPaw } from 'react-icons/fa';

const PAGES = [
  { to: '/', l: 'Ana Səhifə' },
  { to: '/adopt', l: 'Övladlığa Götür' },
  { to: '/shop', l: 'Mağaza' },
  { to: '/vets', l: 'Baytarlar' },
  { to: '/petcare', l: 'Pet Baxımı' },
  { to: '/about', l: 'Haqqımızda' },
];

const SERVICES = [
  { to: '/appointments', l: 'Randevularım' },
  { to: '/my-requests', l: 'Müraciətlərim' },
  { to: '/my-orders', l: 'Sifarişlərim' },
  { to: '/wishlist', l: 'Bəyəndiklərim' },
  { to: '/testimonials', l: 'Rəylər' },
];

const Footer = () => (
  <footer className="bg-slate-950 text-slate-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* BRAND */}
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="bg-gradient-to-tr from-sky-500 to-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-sky-500/20">
              <FaPaw size={22} />
            </div>
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
              vivi<span className="text-slate-100">Paw</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sahibsiz heyvanlara yuva, ev heyvanlarına isə tam qulluq ekosistemi.
            Sevgi dolu icmamıza qoşulun.
          </p>
          <div className="flex gap-2">
            {[
              { icon: FiInstagram, href: '#' },
              { icon: FiFacebook, href: '#' },
              { icon: FiTwitter, href: '#' },
            ].map(({ icon: Icon, href }, i) => (
              <a key={i} href={href} className="p-2.5 bg-slate-800/80 hover:bg-sky-600 rounded-xl transition text-slate-300 hover:text-white">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* SƏHİFƏLƏR */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Səhifələr</h4>
          <ul className="space-y-2.5">
            {PAGES.map(({ to, l }) => (
              <li key={to}>
                <Link to={to} className="text-xs font-semibold text-slate-400 hover:text-sky-400 transition">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* HESABIM */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Hesabım</h4>
          <ul className="space-y-2.5">
            {SERVICES.map(({ to, l }) => (
              <li key={to}>
                <Link to={to} className="text-xs font-semibold text-slate-400 hover:text-sky-400 transition">{l}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ƏLAQƏ */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Əlaqə</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-400">
              <FiMail size={14} className="text-sky-500 shrink-0" /> salam@vivipaw.az
            </li>
            <li className="flex items-center gap-2.5 text-xs font-semibold text-slate-400">
              <FiPhone size={14} className="text-sky-500 shrink-0" /> +994 12 555 44 33
            </li>
            <li className="flex items-start gap-2.5 text-xs font-semibold text-slate-400">
              <FiMapPin size={14} className="text-sky-500 shrink-0 mt-0.5" /> Bakı, Nizami küç. 12
            </li>
          </ul>
        </div>
      </div>
    </div>

    {/* ALT SƏTİR */}
    <div className="border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500 font-semibold">
          © {new Date().getFullYear()} viviPaw. Bütün hüquqlar qorunur.
        </p>
        <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
          <FiHeart size={11} className="text-rose-500 fill-rose-500" /> Heyvanlar üçün sevgi ilə hazırlanıb
        </p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-2.5 bg-slate-800/80 hover:bg-sky-600 rounded-xl transition text-slate-300 hover:text-white" title="Yuxarı qalx">
          <FiArrowUp size={15} />
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;