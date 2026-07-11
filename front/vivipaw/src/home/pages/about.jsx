import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Heart, Award, Sparkles, Loader2 } from 'lucide-react';
import { FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { BsEnvelopeFill } from 'react-icons/bs';
// İkonları dinamik render etmək üçün map
const iconMap = {
  shield: <ShieldCheck size={28} className="text-blue-600" />,
  users: <Users size={28} className="text-emerald-600" />,
  heart: <Heart size={28} className="text-rose-600" />,
  award: <Award size={28} className="text-amber-600" />
};

const About = () => {
  // --- BACKEND İNTEQRASİYASI ÜÇÜN STATE-LƏR ---
  const [stats, setStats] = useState([]); // Statistika sayğacları
  const [values, setValues] = useState([]); // Dəyərlərimiz (Missiya/Vizyon)
  const [team, setTeam] = useState([]); // Komanda üzvləri
  const [isLoading, setIsLoading] = useState(true);

  // --- MOCK DATA (API hazır olana qədər dərhal işləməsi üçün) ---
  useEffect(() => {
    const fakeFetchAboutData = setTimeout(() => {
      
      // 1. Statistikalar (Məsələn: Yuva tapanlar, Aktiv könüllülər)
      setStats([
        { id: 1, value: "1,200+", label: "Sığınacaq tapmış heyvan" },
        { id: 2, value: "450+", label: "Aktiv Könüllü" },
        { id: 3, value: "15+", label: "Tərəfdaş Baytarlıq" },
        { id: 4, value: "98%", label: "Məmnuniyyət dərəcəsi" }
      ]);

      // 2. Dəyərlərimiz və Missiyamız
      setValues([
        {
          id: 1,
          title: "Güvənli Sahibləndirmə",
          description: "Hər bir ev heyvanının gələcək sahibini diqqətlə araşdırır və onların doğru yuvaya getdiyindən əmin oluruq.",
          iconName: "shield",
          bgClass: "bg-blue-50 border-blue-100/70"
        },
        {
          id: 2,
          title: "Böyük İcmamız",
          description: "Biz sadəcə bir sayt deyilik, minlərlə heyvansevəri bir araya gətirən və birlikdə hərəkət edən böyük bir ailəyik.",
          iconName: "users",
          bgClass: "bg-emerald-50 border-emerald-100/70"
        },
        {
          id: 3,
          title: "Sonsuz Sevgi və Qayğı",
          description: "Küçədə qalan, zədələnmiş və ya atılmış heyvanların müalicəsindən tutmuş baxımına qədər hər bir prosesi sevgi ilə idarə edirik.",
          iconName: "heart",
          bgClass: "bg-rose-50 border-rose-100/70"
        },
        {
          id: 4,
          title: "Peşəkar Standartlar",
          description: "Səhifəmizdə paylaşılan bütün pet baxımı məlumatları peşəkar baytarlar tərəfindən yoxlanılır və təsdiqlənir.",
          iconName: "award",
          bgClass: "bg-amber-50 border-amber-100/70"
        }
      ]);

      // 3. Komandamız (Team Members)
      setTeam([
        {
          id: 1,
          name: "Elnur Məmmədov",
          role: "Təsisçi & Direktor",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400", // Gələcəkdə backend-dən gələn şəkil url-i
          github: "#",
          linkedin: "#"
        },
        {
          id: 2,
          name: "Aysel Kərimova",
          role: "Baş Baytar",
          image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
          github: "#",
          linkedin: "#"
        },
        {
          id: 3,
          name: "Rəşad Əliyev",
          role: "İcma Meneceri",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
          github: "#",
          linkedin: "#"
        }
      ]);

      setIsLoading(false);
    }, 600);

    return () => clearTimeout(fakeFetchAboutData);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium text-sm">Məlumatlar yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased pb-20">
      
      {/* HERO BANNER - Giriş və Başlıq */}
      <div className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-sky-400 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Biz Kimik?</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Biz Heyvanların Səssiz <br />
            Dünyasının <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Səsiyik</span>
          </h1>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base font-medium leading-relaxed">
            viviPaw olaraq əsas məqsədimiz kimsəsiz və yuva axtaran heyvanları sevgi dolu ailələrlə görüşdürmək, onlara düzgün pet baxımı vərdişlərini aşılamaqdır.
          </p>
        </div>
      </div>

      {/* STATİSTİKALAR (GRID formatında bannerin dərhal altında) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.id} className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-blue-600 tracking-tight">{stat.value}</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DƏYƏRLƏRİMİZ (MISSION & VISION) BÖLMƏSİ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Əsas Prinsiplərimiz</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">Biz bu yolda hər zaman müəyyən etdiyimiz ədalətli və humanist prinsiplərlə addımlayırıq.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((val) => (
            <div key={val.id} className={`bg-white border p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-4 items-start transition-all hover:shadow-md ${val.bgClass}`}>
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
                {iconMap[val.iconName]}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">{val.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{val.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KOMANDAMIZ (TEAM SECTION) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Arxadakı Komanda</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">Kiçik bir addımla başlayıb heyvanların həyatını dəyişdirən komandamızla tanış olun.</p>
        </div>

        {/* Komanda Grid-i */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group text-center p-6">
              
              {/* Profil Şəkli */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-blue-500/20 transition-colors duration-300">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Ad və Rol */}
              <div className="mt-4 space-y-0.5">
                <h3 className="text-lg font-black text-slate-900">{member.name}</h3>
                <p className="text-sm font-semibold text-blue-600">{member.role}</p>
              </div>

              {/* Sosial Linklər */}
              <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-slate-100">
                <a href={member.linkedin} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <FaLinkedinIn size={18} />
                </a>
                <a href={member.github} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                  <FaGithub size={18} />
                </a>
                <a href="#" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                  <BsEnvelopeFill size={18} />
                </a>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default About;