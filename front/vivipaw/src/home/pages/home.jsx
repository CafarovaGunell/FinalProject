import React from 'react';
import { 
  ArrowRight, Heart, Search, CheckCircle2, 
  Calendar, Shield, Sparkles, Smile, 
  ChevronLeft, ChevronRight, Quote 
} from 'lucide-react';

const Home = () => {
  // Swiper və Redux Toolkit üçün zənginləşdirilmiş məlumatlar
  const pets = [
    { id: 1, name: "Badi", type: "İt", breed: "Golden Retriever", age: "3 aylıq", tag: "Təcili", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600" },
    { id: 2, name: "Mila", type: "Pişik", breed: "British Shorthair", age: "1 yaş", tag: "Yeni", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600" },
    { id: 3, name: "Şans", type: "İt", breed: "Cek Rassel", age: "5 aylıq", tag: "Təcili", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600" },
    { id: 4, name: "Duman", type: "Pişik", breed: "Siam pişiyi", age: "2 aylıq", tag: "Yeni", image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600" }
  ];

  const categories = [
    { id: 1, name: "İtlər", count: "120+ elan", icon: "🐶", bg: "bg-blue-50 text-blue-600 border-blue-100" },
    { id: 2, name: "Pişiklər", count: "85+ elan", icon: "🐱", bg: "bg-sky-50 text-sky-600 border-sky-100" },
    { id: 3, name: "Quşlar", count: "24+ elan", icon: "🦜", bg: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { id: 4, name: "Digər", count: "12+ elan", icon: "🐹", bg: "bg-purple-50 text-purple-600 border-purple-100" }
  ];

  return (
    <div className="bg-white text-slate-800 min-h-screen font-sans antialiased overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-sky-50/40 to-white pt-12 pb-16 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Dekorativ Arka Fon Elementləri */}
        <div className="absolute top-20 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Sol tərəf: Mətnlər */}
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
                viviPaw ilə sahibsiz heyvanlara yeni bir şans verin, onların qulluq və müayinə ehtiyaclarını tək bir platformadan asanlıqla idarə edin.
              </p>

              {/* Təkmilləşdirilmiş İnteraktiv Axtarış Bölməsi */}
              <div className="p-2 sm:p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-blue-900/5 flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 px-3 py-2 flex-1 border-b sm:border-b-0 sm:border-r border-slate-100">
                  <Search size={20} className="text-blue-500 flex-shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Pişik, it, cins və ya şəhər..." 
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400 font-medium"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-sm sm:text-base">
                  <span>Axtarışa Başla</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Sağ tərəf: Canlı Şəkil və Kartlar */}
            <div className="lg:col-span-5 relative flex justify-center mt-6 lg:mt-0">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] px-4 sm:px-0">
                {/* Şəkil çərçivəsi */}
                <div className="border-[8px] sm:border-[12px] border-white bg-white shadow-2xl rounded-[32px] sm:rounded-[40px] overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800" 
                    alt="Dost canlısı ev heyvanı" 
                    className="w-full h-[350px] sm:h-[450px] object-cover rounded-[24px] sm:rounded-[28px]"
                  />
                </div>
                
                {/* Üzən Kart 1 */}
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className={`border p-5 sm:p-6 rounded-2xl text-center cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 duration-300 ${cat.bg}`}>
              <span className="text-3xl sm:text-4xl block mb-2 sm:mb-3">{cat.icon}</span>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">{cat.name}</h3>
              <p className="text-[11px] sm:text-xs mt-1 font-medium opacity-80">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ÖVLADLIĞA GÖTÜRMƏ */}
      <section className="py-12 sm:py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">İsti yuva gözləyən canlar</h2>
              <p className="text-slate-500 mt-1 text-sm">Onların hekayəsində yeni bir səhifə açın</p>
            </div>
            
            {/* Naviqasiya düymələri */}
            <div className="flex gap-2 self-end sm:self-auto">
              <button className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <button className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Siyahı: Mobil cihazlarda tək sütun, planşetdə 2, kompyuterdə 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group mx-auto w-full max-w-[340px] sm:max-w-none">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img 
                    src={pet.image} 
                    alt={pet.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg text-white shadow-sm ${pet.tag === 'Təcili' ? 'bg-rose-500' : 'bg-blue-600'}`}>
                    {pet.tag}
                  </span>
                  
                  <button className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-xl text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 transition-colors">
                    <Heart size={18} />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{pet.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{pet.breed}</p>
                    </div>
                    <span className="text-xs font-semibold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100">
                      {pet.age}
                    </span>
                  </div>

                  <button className="w-full mt-5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2.5 rounded-xl text-sm transition-all border border-blue-100 hover:border-blue-600 shadow-sm">
                    Tanış Ol
                  </button>
                </div>
              </div>
            ))}
          </div>
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
              <div className="flex items-start gap-3">
                <CheckCircle2 size={22} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Ağıllı Xatırlatıcılar</h4>
                  <p className="text-xs sm:text-sm text-slate-500">Peyvənd, dərman və qulluq günlərini unutmamağınız üçün bildirişlər.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 lg:mt-0">
            <div className="bg-blue-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-600/10 space-y-3">
              <Shield size={32} />
              <h3 className="text-lg sm:text-xl font-bold">100% Güvən</h3>
              <p className="text-blue-100 text-xs leading-relaxed">Övladlığa vermə prosesi tam qanuni müqavilə və sənədləşmə ilə həyata keçirilir.</p>
            </div>
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-3 lg:translate-y-6">
              <Calendar size={32} className="text-sky-400" />
              <h3 className="text-lg sm:text-xl font-bold">Kolay İdarə</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Baxım və tibbi təqvimi tək paneldən izləmək imkanı.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. İSTİFADƏÇİ REYLƏRİ */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-sky-50/30 to-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Xoşbəxt Ailələrimiz</h2>
            <p className="text-slate-500 mt-1 text-sm">viviPaw vasitəsilə öz dostunu tapanların real hekayələri</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm relative">
              <Quote className="absolute right-6 top-6 text-slate-100 h-12 w-12 sm:h-16 sm:w-16 -z-0" />
              <div className="relative z-10 space-y-4">
                <p className="text-slate-600 italic text-xs sm:text-sm leading-relaxed">
                  "viviPaw sayəsində Milamızı tapdıq. Övladlığa götürmə prosesi çox şəffaf və sürətli keçdi. İndi evimizin ən sevimli və dəcəl üzvüdür!"
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">AŞ</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Aydan Şərifova</h4>
                    <p className="text-xs text-slate-400">Dizayner</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm relative">
              <Quote className="absolute right-6 top-6 text-slate-100 h-12 w-12 sm:h-16 sm:w-16 -z-0" />
              <div className="relative z-10 space-y-4">
                <p className="text-slate-600 italic text-xs sm:text-sm leading-relaxed">
                  "Yalnız övladlığa götürmə hissəsi yox, həm də pet-care bölməsindən baytar təyinatı funksiyası möhtəşəmdir. Hər şey bir yerdə çox rahatdır."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center font-bold text-white text-sm">EM</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Elnur Məmmədov</h4>
                    <p className="text-xs text-slate-400">Proqramçı</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA / CALL TO ACTION */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-12">
        <div className="bg-blue-400 rounded-[24px] sm:rounded-[32px] p-6 sm:p-12 lg:p-16 text-white text-center relative overflow-hidden shadow-xl shadow-blue-600/20">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-10 -translate-y-10"></div>
          
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black">Siz də bir can xilas etmək istəyirsiniz?</h2>
            <p className="text-gray-100 text-xs sm:text-sm sm:text-base opacity-90">
              Yeniliklərdən, təcili yuva axtaran heyvanlardan və faydalı pet-care məsləhətlərindən dərhal xəbərdar olmaq üçün bültenimizə abunə olun.
            </p>
            
            <div className="p-1.5 bg-white rounded-2xl flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="E-poçt ünvanınız" 
                className="bg-transparent text-slate-800 px-4 py-3 text-sm focus:outline-none flex-1 placeholder-slate-400 font-medium rounded-xl"
              />
              <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                Abunə Ol
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;