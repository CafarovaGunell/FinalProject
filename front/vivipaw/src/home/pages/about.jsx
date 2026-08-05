import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, ShieldCheck, Users, PawPrint, Sparkles, HandHeart,
  Search, FileText, Home, ArrowRight, Stethoscope, Store,
} from 'lucide-react';

import StartChatButton from '../components/chat/StartChatButton';
import { CHAT_TYPE } from '../../utils/chat';

const STATS = [
  { value: '500+', label: 'Tapılan yuva', icon: Home },
  { value: '40+', label: 'Təsdiqli mağaza', icon: Store },
  { value: '25+', label: 'Peşəkar baytar', icon: Stethoscope },
  { value: '10K+', label: 'İstifadəçi', icon: Users },
];

const VALUES = [
  { icon: Heart, title: 'Şəfqət', desc: 'Hər heyvanın sevgi və təhlükəsizlik haqqı olduğuna inanırıq.', cls: 'bg-rose-50 text-rose-500' },
  { icon: ShieldCheck, title: 'Etibar', desc: 'Bütün mağaza və baytar profilləri admin tərəfindən yoxlanılır.', cls: 'bg-sky-50 text-sky-600' },
  { icon: HandHeart, title: 'Məsuliyyət', desc: 'Bizim üçün sahiblənmə deyil, ömürlük dostluq önəmlidir.', cls: 'bg-emerald-50 text-emerald-600' },
  { icon: Sparkles, title: 'Şəffaflıq', desc: 'Müraciət və təsdiq prosesi tam açıq şəkildə aparılır.', cls: 'bg-amber-50 text-amber-600' },
];

const STEPS = [
  { icon: Search, n: '01', title: 'Axtar və kəşf et', desc: 'Şəhər, növ, yaş filtrləri ilə sizə uyğun dostu tapın.' },
  { icon: FileText, n: '02', title: 'Müraciət et', desc: 'Qısa formanı doldurun — elan sahibi sizinlə əlaqə saxlasın.' },
  { icon: Home, n: '03', title: 'Yuva ol', desc: 'Təsdiqdən sonra yeni ailə üzvünüzü qarşılayın 🐾' },
];

const About = () => (
  <div className="bg-white text-slate-800 antialiased overflow-x-hidden">
    {/* HERO */}
    <section className="relative bg-gradient-to-b from-blue-50/70 via-sky-50/40 to-white py-20 overflow-hidden">
      <div className="absolute top-10 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl" />
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
        <span className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-200/50 px-4 py-2 rounded-full">
          <PawPrint size={15} className="text-blue-600" />
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Bizim hekayəmiz</span>
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          Hər patinin bir <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">yuvası</span> olmalıdır
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          viviPaw 2024-cü ildə sadə bir ideyadan yarandı: sahibsiz heyvanlarla onlara yuva olmaq
          istəyən insanları təhlükəsiz, şəffaf və rahat bir platformada birləşdirmək. Bu gün biz
          Azərbaycanda ev heyvanları üçün tam ekosistemik xidmətik.
        </p>
      </div>
    </section>

    {/* STATLAR */}
    <section className="max-w-6xl mx-auto px-4 -mt-6 relative z-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ value, label, icon: Icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-lg shadow-blue-900/5 hover:-translate-y-1 transition">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl grid place-items-center mx-auto mb-3"><Icon size={22} /></div>
            <p className="text-3xl font-black text-slate-900">{value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>

    {/* DƏYƏRLƏR */}
    <section className="py-20 max-w-6xl mx-auto px-4">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-3xl font-black text-slate-900">Dəyərlərimiz</h2>
        <p className="text-slate-500 mt-2 text-sm">Platformanı qurarkən bizi yönləndirən prinsiplər</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {VALUES.map(({ icon: Icon, title, desc, cls }) => (
          <div key={title} className="bg-slate-50 border border-slate-100 rounded-3xl p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl grid place-items-center mb-4 ${cls}`}><Icon size={26} /></div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* NECƏ İŞLƏYİR */}
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-3xl font-black">Necə işləyir?</h2>
          <p className="text-slate-400 mt-2 text-sm">Üç sadə addımla yeni dostunuza qovuşun</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(({ icon: Icon, n, title, desc }) => (
            <div key={n} className="relative bg-slate-800/60 border border-slate-700 rounded-3xl p-8 hover:border-sky-500/50 transition group">
              <span className="absolute top-6 right-7 text-5xl font-black text-slate-700/60 group-hover:text-sky-500/20 transition">{n}</span>
              <div className="w-14 h-14 bg-sky-500/15 text-sky-400 rounded-2xl grid place-items-center mb-5"><Icon size={26} /></div>
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 max-w-5xl mx-auto px-4">
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-[2.5rem] p-10 sm:p-14 text-center text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <h2 className="text-3xl sm:text-4xl font-black mb-4 relative">Bir həyat dəyişdirməyə hazırsınız?</h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-8 text-sm sm:text-base relative">
          Minlərlə səbirli gözlər sizə baxır. Bu gün ilk addımı atın.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
          <Link to="/adopt" className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl text-sm hover:bg-blue-50 transition flex items-center justify-center gap-2 shadow-lg">
            Elanlara Bax <ArrowRight size={17} />
          </Link>
          <Link to="/register" className="bg-blue-700/40 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl text-sm hover:bg-blue-700/60 transition backdrop-blur">
            Qeydiyyatdan Keç
          </Link>
          <StartChatButton
  type={CHAT_TYPE.SUPPORT}
  initialMessage="Salam, dəstək lazımdır."
  className="bg-white/20 border border-white/30 text-white backdrop-blur px-8 py-4 rounded-2xl text-sm hover:bg-white/30"
>
  Dəstəyə yaz
</StartChatButton>
        </div>
      </div>
    </section>
  </div>
);

export default About;




