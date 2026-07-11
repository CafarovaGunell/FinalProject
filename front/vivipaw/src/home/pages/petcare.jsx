import React, { useState, useEffect } from 'react';
import { Scissors, ShieldCheck, HeartPulse, Apple, Search, ArrowUpRight, Sparkles, Star, Loader2 } from 'lucide-react';

// İkonları dinamik render etmək üçün map (API-dan string olaraq gələcək ikon adlarını tutmaq üçün)
const iconMap = {
  apple: <Apple size={24} />,
  scissors: <Scissors size={24} />,
  pulse: <HeartPulse size={24} />,
  shield: <ShieldCheck size={24} />
};

const PetCare = () => {
  // --- BACKEND İNTEQRASİYASI ÜÇÜN STATE-LƏR ---
  const [careData, setCareData] = useState([]); // API-dan gələn əsas siyahı
  const [categories, setCategories] = useState([]); // API-dan gələn kateqoriyalar
  const [dailyTip, setDailyTip] = useState(null); // Günün qızıl qaydası
  const [isLoading, setIsLoading] = useState(true); // Yüklənmə state-i

  // --- FİLTR VƏ AXTARIŞ STATE-LƏRİ ---
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'rating', 'readTime'

  // --- MOCK DATA (API hazır olana qədər dərhal işləməsi üçün) ---
  useEffect(() => {
    // Bura gələcəkdə sənin API sorğundur: fetch('https://api.luna.com/petcare').then(...)
    const fakeFetchFromBackend = setTimeout(() => {
      
      setCategories([
        { id: 'all', label: 'Hamısı' },
        { id: 'nutrition', label: 'Qidalanma' },
        { id: 'grooming', label: 'Tük & Gigiyena' },
        { id: 'health', label: 'Sağlamlıq & Baytarlıq' },
      ]);

      setCareData([
        {
          id: 1,
          title: "Düzgün Qidalanma və Pəhriz",
          category: "nutrition",
          description: "Dostunuzun yaşına və cinsinə uyğun olaraq gündəlik kalori ehtiyacının hesablanması və premium qida seçimləri.",
          iconName: "apple",
          iconStyles: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/30",
          readTime: 4, // dəqiqə (rəqəm olaraq saxlayırıq ki, sıralama rahat olsun)
          rating: 4.9
        },
        {
          id: 2,
          title: "Grooming & Professional Baxım",
          category: "grooming",
          description: "Tüklərin düzgün daranması, dırnaq kəsimi və yay aylarında dəri sağlamlığını qorumağın qızıl qaydaları.",
          iconName: "scissors",
          iconStyles: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:border-amber-500/30",
          readTime: 6,
          rating: 5.0
        },
        {
          id: 3,
          title: "Peyvənd və Sağlamlıq Təqvimi",
          category: "health",
          description: "Parazit müalicələri, illik peyvəndlər və daxili xəstəliklərin ilkin simptomlarını necə müəyyən etməli?",
          iconName: "pulse",
          iconStyles: "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:border-rose-500/30",
          readTime: 8,
          rating: 4.9
        },
        {
          id: 4,
          title: "İlk Yardım və Təhlükəsizlik",
          category: "health",
          description: "Ev şəraitində yarana biləcək zədələnmələr və zəhərlənmə hallarında baytara çatana qədər edilməli olan təcili müdaxilələr.",
          iconName: "shield",
          iconStyles: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:border-purple-500/30",
          readTime: 5,
          rating: 4.8
        }
      ]);

      setDailyTip({
        title: "Pişik və İtlərdə Dehidrasiyaya Diqqət!",
        text: "Xüsusilə isti aylarda ev heyvanlarının su qablarına gündə ən azı iki dəfə təzə və sərin su əlavə edilməlidir. Su çatışmazlığı böyrək xəstəliklərinə birbaşa yol açır."
      });

      setIsLoading(false);
    }, 800); // 0.8 saniyəlik yüklənmə simulyasiyası

    return () => clearTimeout(fakeFetchFromBackend);
  }, []);

  // --- FUNKSİONAL MƏNTİQ (Axtarış, Filtr, Sıralama) ---
  const processedServices = careData
    // 1. Kateqoriya Filtri
    .filter(item => activeCategory === 'all' || item.category === activeCategory)
    // 2. Axtarış Filtri
    .filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // 3. Sıralama (Sort) Məntiqi
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating; // Reytinqə görə azalan
      if (sortBy === 'readTime') return a.readTime - b.readTime; // Oxu müddətinə görə artan
      return 0; // Default (olduğu kimi)
    });

  // Yüklənmə zamanı göstəriləcək ekran (Skeleton və ya Spinner)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium text-sm">Məlumatlar yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased pb-16">
      
      {/* HERO BANNER */}
      <div className="relative overflow-hidden bg-slate-950 text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Peşəkar Məsləhətlər</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Tükbaxımlı Dostunuz Üçün <br />
            <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">A-dan Z-yə</span> Qayğı Bələdçisi
          </h1>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base font-medium">
            Onların xoşbəxt və sağlam yaşaması sirr deyil. Baytarlar tərəfindən təsdiqlənmiş ən doğru qulluq və qidalanma məlumatları.
          </p>
        </div>
      </div>

      {/* İDARƏETMƏ PANELİ (Axtarış, Filtr, Sıralama) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 space-y-6">
        
        {/* Axtarış və Sıralama (Yan-yana və ya alt-alta) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Axtarış inputu */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Mövzu və ya açar söz yazın..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-700 font-medium"
            />
          </div>

          {/* Sıralama Select-i */}
          <div className="w-full md:w-auto flex items-center gap-2 justify-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="default">Varsayılan</option>
              <option value="rating">Yüksək Reytinq</option>
              <option value="readTime">Qısa Oxu Müddəti</option>
            </select>
          </div>
        </div>

        {/* Kateqoriyalar (Üfüqi sürüşdürmə dəstəkli) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCategory === cat.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* DİNAMİK KARTLAR (GRID) */}
        {processedServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processedServices.map((service) => (
              <div 
                key={service.id} 
                className={`bg-white border border-slate-200/70 p-6 rounded-3xl shadow-sm transition-all duration-300 flex flex-col justify-between group border-b-4 ${service.iconStyles}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-5">
                    {/* İkon map-dən dinamik çəkilir */}
                    <div className="p-3 rounded-2xl border bg-white shadow-sm">
                      {iconMap[service.iconName] || <Sparkles size={24} />}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-100/70">
                        <Star size={12} className="fill-amber-600" />
                        {service.rating.toFixed(1)}
                      </span>
                      <span>{service.readTime} dəq oxu</span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mt-2">
                    {service.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Məqaləni Oxu</span>
                  <div className="w-9 h-9 bg-slate-50 text-slate-700 group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1">
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Nəticə Tapılmayanda */
          <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
            <span className="text-3xl">🍃</span>
            <h3 className="text-base font-bold text-slate-900 mt-2">Axtarışa uyğun məsləhət tapılmadı</h3>
            <p className="text-slate-400 text-xs mt-1">Başqa açar sözlərlə axtarmağı yoxlayın.</p>
          </div>
        )}

        {/* GÜNÜN QIZIL QAYDASI BANNERİ */}
        {dailyTip && (
          <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-500/10">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
            <div className="max-w-3xl space-y-3 relative z-10">
              <span className="bg-white/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Günün Məsləhəti</span>
              <h2 className="text-xl sm:text-2xl font-black">{dailyTip.title}</h2>
              <p className="text-blue-50 text-xs sm:text-sm leading-relaxed">{dailyTip.text}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PetCare;