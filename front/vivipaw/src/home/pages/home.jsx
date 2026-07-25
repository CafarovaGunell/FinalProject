import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Heart, Search, CheckCircle2, 
  Calendar, Shield, Sparkles, Smile, Quote, ChevronLeft, ChevronRight 
} from 'lucide-react';
import API from '../../services/api'; 
import { useWishlist } from '../context/WishlistContext';
const Home = () => {
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState('All');

  const navigate = useNavigate();
  const petsScrollRef = useRef(null);

  // Wishlist kontekstindən funksiyaları alırıq
  const { isInWishlist, toggleWishlist: contextToggleWishlist } = useWishlist();

  const scrollPets = (direction) => {
    if (petsScrollRef.current) {
      const { scrollLeft, clientWidth } = petsScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      petsScrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getCategoryStyle = (name) => {
    switch (name?.toLowerCase()) {
      case 'itlər':
      case 'it':
        return { icon: "🐶", bg: "bg-blue-50 text-blue-600 border-blue-100" };
      case 'pişiklər':
      case 'pişik':
        return { icon: "🐱", bg: "bg-sky-50 text-sky-600 border-sky-100" };
      case 'quşlar':
      case 'quş':
        return { icon: "🦜", bg: "bg-emerald-50 text-emerald-600 border-emerald-100" };
      case 'gəmiricilər':
        return { icon: "🐹", bg: "bg-purple-50 text-purple-600 border-purple-100" };
      case 'sürünənlər':
        return { icon: "🐍", bg: "bg-amber-50 text-amber-600 border-amber-100" };
      case 'akvarium və balıqlar':
      case 'balıq':
        return { icon: "🐠", bg: "bg-teal-50 text-teal-600 border-teal-100" };
      default:
        return { icon: "🐾", bg: "bg-rose-50 text-rose-600 border-rose-100" };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, categoriesRes, testimonialsRes] = await Promise.all([
          API.get('/Animals').catch(() => ({ data: [] })),
          API.get('/Categories').catch(() => ({ data: [] })),
          API.get('/Testimonials').catch(() => ({ data: [] }))
        ]);

        const extractData = (res) => {
          const raw = res.data;
          if (Array.isArray(raw)) return raw;
          if (raw && Array.isArray(raw.$values)) return raw.$values;
          if (raw && Array.isArray(raw.items)) return raw.items;
          return [];
        };

        setPets(extractData(petsRes));
        setCategories(extractData(categoriesRes));
        setTestimonials(extractData(testimonialsRes));

      } catch (error) {
        console.error("Home səhifəsi məlumatları çəkilərkən xəta:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWishlistClick = async (e, pet) => {
    e.stopPropagation(); // Kartın kliklənməsini bloklayır
    const success = await contextToggleWishlist(pet);
    if (!success) {
      // Əgər istifadəçi daxil olmayıbsa loginə yönləndirə bilər
      // navigate('/login');
    }
  };

  const filteredPets = pets.filter(pet => {
    if (selectedCategory === 'All') return true;
    const petCatName = pet.categoryName;
    if (petCatName) {
      return petCatName.toLowerCase() === selectedCategory.toLowerCase();
    }
    return false;
  });

  return (
    <div className="bg-white text-slate-800 min-h-screen font-sans antialiased overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-sky-50/40 to-white pt-12 pb-16 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-200/50 px-4 py-2 rounded-full">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Həyat Paylaşdıqca Gözəldir</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                Sadiq bir dost <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                  həyatınızı dəyişər
                </span>
              </h1>
              
              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                viviPaw ilə sahibsiz heyvanlara yeni bir şans verin, onların qulluq və baytarlıq ehtiyaclarını tək platformadan idarə edin.
              </p>

              <div className="p-2 sm:p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-blue-900/5 flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 px-3 py-2 flex-1 border-b sm:border-b-0 sm:border-r border-slate-100">
                  <Search size={20} className="text-blue-500 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Pişik, it, cins və ya şəhər..." 
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400 font-medium"
                  />
                </div>
                <button 
                  onClick={() => navigate('/adopt')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-sm sm:text-base cursor-pointer"
                >
                  <span>Axtarışa Başla</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center mt-6 lg:mt-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] px-4 sm:px-0">
                <div className="border-[8px] sm:border-[12px] border-white bg-white shadow-2xl rounded-[32px] sm:rounded-[40px] overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800" 
                    alt="Ev heyvanı" 
                    className="w-full h-[350px] sm:h-[450px] object-cover rounded-[24px] sm:rounded-[28px]"
                  />
                </div>
                
                <div className="absolute -left-2 sm:-left-10 top-1/3 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                    <Smile size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Məsuliyyətli Seçim</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500">Tamamilə Pulsuz</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. KATEQORİYALAR */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Kateqoriyaya görə kəşf et</h2>
          <p className="text-slate-500 mt-2 text-sm">Axtardığınız dostu daha tez tapmaq üçün qruplardan birini seçin</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-8 text-sm">Kateqoriyalar yüklənir...</div>
        ) : categories.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm">Hələlik kateqoriya tapılmadı.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => {
              const style = getCategoryStyle(cat.name);
              return (
                <div 
                  key={cat.id} 
                  onClick={() => navigate(`/adopt?category=${cat.name}`)}
                  className={`border p-5 sm:p-6 rounded-2xl text-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1.5 duration-300 ${style.bg} flex flex-col justify-between`}
                >
                  <div>
                    <span className="text-3xl sm:text-4xl block mb-2 sm:mb-3">{style.icon}</span>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">{cat.name}</h3>
                    <p className="text-[11px] sm:text-xs mt-1 font-medium opacity-80 line-clamp-2">{cat.description}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-center gap-1 text-xs font-semibold opacity-90">
                    <span>Elanlara bax</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. İSTİ YUVA GÖZLƏYƏN CANLAR */}
      <section className="py-12 sm:py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">İsti yuva gözləyən canlar</h2>
              <p className="text-slate-500 mt-1 text-sm">Onların hekayəsində yeni bir səhifə açın</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={() => scrollPets('left')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scrollPets('right')}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <button 
                onClick={() => navigate('/adopt')}
                className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 cursor-pointer bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100"
              >
                <span>Hamısına bax</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                selectedCategory === 'All' 
                  ? 'bg-blue-600 text-white shadow-blue-600/20' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Bütün Elanlar
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              const style = getCategoryStyle(cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-blue-600/20' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{style.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {filteredPets.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 max-w-xl mx-auto shadow-sm">
              <p className="text-sm font-semibold mb-3">Bu kateqoriyada hələlik heç bir elan yoxdur.</p>
              <button 
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Bütün elanlara bax
              </button>
            </div>
          ) : (
            <div 
              ref={petsScrollRef}
              className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredPets.map((pet) => {
                // Hər bir pet üçün context-dən olub-olmadığını yoxlayırıq
                const isLiked = isInWishlist(pet.id);
                return (
                  <div 
                    key={pet.id} 
                    onClick={() => navigate(`/animals/${pet.id}`)}
                    className="min-w-[280px] sm:min-w-[310px] max-w-[310px] snap-start bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex-shrink-0 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <img 
                          src={pet.imageUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d"} 
                          alt={pet.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg text-white shadow-sm bg-blue-600">
                          {pet.gender || 'Heyvan'}
                        </span>
                        
                        <button 
                          onClick={(e) => handleWishlistClick(e, pet)}
                          className={`absolute top-3 right-3 p-2.5 rounded-xl shadow-md border transition-all z-10 cursor-pointer ${
                            isLiked 
                              ? 'bg-rose-50 text-rose-500 border-rose-200 scale-110' 
                              : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 border-slate-100'
                          }`}
                        >
                          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{pet.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{pet.breed}</p>
                          </div>
                          <span className="text-xs font-semibold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100">
                            {pet.ageText || 'Gənc'}
                          </span>
                        </div>

                        <div className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                          <span>📍 {pet.location || 'Bakı'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2.5 rounded-xl text-sm transition-all border border-blue-100 hover:border-blue-600 shadow-sm cursor-pointer">
                        Tanış Ol
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. LAYİHƏNİN ÜSTÜNLÜKLƏRİ */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">Niyə məhz viviPaw?</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Biz sadəcə elan saytı deyilik. Biz ev heyvanlarının övladlığa götürülməsindən başlayaraq, onların ömürlük tibbi və gündəlik qulluq ehtiyaclarını təmin edən tam bir ekosistemik platformayıq.
            </p>

            <div className="space-y-4 pt-2 text-left max-w-xl mx-auto lg:mx-0">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={22} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Yoxlanılmış Elanlar</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Hər bir elan və istifadəçi profili təhlükəsizlik üçün yoxlanılır.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={22} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Onlayn Baytar Təyinatı</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Növbə gözləmədən heyvanınız üçün həkim müayinəsi təyin edin.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 lg:mt-0">
            <div className="bg-blue-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-600/10 space-y-3">
              <Shield size={32} />
              <h3 className="text-lg sm:text-xl font-bold">100% Güvən</h3>
              <p className="text-blue-100 text-xs leading-relaxed">Övladlığə vermə prosesi tam qanuni müqavilə və sənədləşmə ilə həyata keçirilir.</p>
            </div>
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-3 lg:translate-y-6">
              <Calendar size={32} className="text-sky-400" />
              <h3 className="text-lg sm:text-xl font-bold">Asan İdarə</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Baxım və tibbi təqvimi tək paneldən izləmək imkanı.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. XOŞBƏXT AİLƏLƏRİMİZ */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-sky-50/30 to-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Xoşbəxt Ailələrimiz</h2>
            <p className="text-slate-500 mt-1 text-sm">viviPaw istifadəçilərinin bazadan gələn real rəyləri</p>
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">Hələlik rəy mövcud deyil.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm relative">
                  <Quote className="absolute right-6 top-6 text-slate-100 h-12 w-12 sm:h-16 sm:w-16 -z-0" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex gap-1 text-amber-400 text-sm">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p className="text-slate-600 italic text-xs sm:text-sm leading-relaxed">
                      "{t.comment}"
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                          {t.user?.fullName ? t.user.fullName.charAt(0) : "C"}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {t.user?.fullName || "Ceferova Gunel"}
                          </h4>
                          <p className="text-xs text-slate-400">Heyvansevər</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg border border-rose-100">
                        ❤ {t.likesCount || 0} bəyənmə
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;