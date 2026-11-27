import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Heart, Search, CheckCircle2, Calendar, Shield,
  Sparkles, Smile, Quote, ChevronLeft, ChevronRight, MapPin, AlertCircle,
} from 'lucide-react';
import { petApi, categoryApi, testimonialApi } from '../../services/endpoints';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { CATEGORY_TYPE, PLACEHOLDER_PET, ADOPTION_STATUS_COLOR, ADOPTION_STATUS_TEXT } from '../../utils/constants';
import { getPetIcon } from '../../utils/helpers';

const CATEGORY_STYLE = {
  'it':        'bg-blue-50 text-blue-600 border-blue-100',
  'pişik':     'bg-sky-50 text-sky-600 border-sky-100',
  'quş':       'bg-emerald-50 text-emerald-600 border-emerald-100',
  'gəmirici':  'bg-purple-50 text-purple-600 border-purple-100',
  'balıq':     'bg-teal-50 text-teal-600 border-teal-100',
  'digər':     'bg-rose-50 text-rose-600 border-rose-100',
};

const Home = () => {
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);   // null = hamısı
  const [searchText, setSearchText] = useState('');
  const [authModal, setAuthModal] = useState(false);

  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    (async () => {
      try {
        const [petsRes, catRes, testRes] = await Promise.all([
          petApi.list({ page: 1, pageSize: 12, sortBy: 'newest' }).catch(() => null),
          categoryApi.all(CATEGORY_TYPE.PET).catch(() => null),
          testimonialApi.list().catch(() => null),
        ]);

        if (petsRes?.success) setPets(petsRes.data.items || []);
        if (catRes?.success) setCategories(catRes.data || []);
        if (testRes?.success) setTestimonials((testRes.data || []).slice(0, 4));
      } catch (e) {
        console.error('Home yüklənmə xətası:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scrollPets = (dir) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: dir === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  const handleWishlist = async (e, petId) => {
    e.stopPropagation();
    if (!user) return setAuthModal(true);
    await toggleWishlist(petId);
  };

  const handleLike = async (e, id) => {
    e.stopPropagation();
    if (!user) return setAuthModal(true);
    try {
      await testimonialApi.like(id);
      const res = await testimonialApi.list();
      if (res.success) setTestimonials(res.data.slice(0, 4));
    } catch { /* ignore */ }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/adopt${searchText.trim() ? `?search=${encodeURIComponent(searchText.trim())}` : ''}`);
  };

  const filteredPets = selectedCategory
    ? pets.filter((p) => p.categoryName === selectedCategory)
    : pets;

  return (
    <div className="bg-white text-slate-800 min-h-screen antialiased overflow-x-hidden">
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} />

      {/* 1. HERO */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-sky-50/40 to-white pt-12 pb-16 lg:pt-20 lg:pb-28 overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-200/50 px-4 py-2 rounded-full">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Həyat paylaşdıqca gözəldir</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                Sadiq bir dost <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                  həyatınızı dəyişər
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                viviPaw ilə sahibsiz heyvanlara yeni bir şans verin, onların qulluq və baytarlıq
                ehtiyaclarını tək platformadan idarə edin.
              </p>

              <form onSubmit={handleSearch}
                className="p-2 sm:p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-blue-900/5 flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2 px-3 py-2 flex-1 border-b sm:border-b-0 sm:border-r border-slate-100">
                  <Search size={20} className="text-blue-500 shrink-0" />
                  <input value={searchText} onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Pişik, it, cins və ya şəhər..."
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400 font-medium" />
                </div>
                <button type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-sm">
                  <span>Axtarışa Başla</span><ArrowRight size={18} />
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 relative flex justify-center mt-6 lg:mt-0">
              <div className="relative w-full max-w-[400px]">
                <div className="border-[10px] border-white bg-white shadow-2xl rounded-[40px] overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800"
                    alt="Ev heyvanı" className="w-full h-[400px] sm:h-[450px] object-cover rounded-[28px]" />
                </div>
                <div className="absolute -left-4 sm:-left-10 top-1/3 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Smile size={22} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Məsuliyyətli Seçim</h4>
                    <p className="text-xs text-slate-500">Tamamilə Pulsuz</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KATEQORİYALAR */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Kateqoriyaya görə kəşf et</h2>
          <p className="text-slate-500 mt-2 text-sm">Axtardığınız dostu daha tez tapmaq üçün qruplardan birini seçin</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const style = CATEGORY_STYLE[cat.name?.toLowerCase()] || CATEGORY_STYLE['digər'];
              return (
                <button key={cat.id} onClick={() => navigate(`/adopt?categoryId=${cat.id}`)}
                  className={`border p-5 rounded-2xl text-center transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ${style}`}>
                  <span className="text-4xl block mb-2">{getPetIcon(cat.name)}</span>
                  <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. HEYVANLAR */}
      <section className="py-14 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">İsti yuva gözləyən canlar</h2>
              <p className="text-slate-500 mt-1 text-sm">Onların hekayəsində yeni bir səhifə açın</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex gap-2">
                {[{ icon: ChevronLeft, dir: 'left' }, { icon: ChevronRight, dir: 'right' }].map(({ icon: Icon, dir }) => (
                  <button key={dir} onClick={() => scrollPets(dir)}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-sm">
                    <Icon size={20} />
                  </button>
                ))}
              </div>
              <Link to="/adopt"
                className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
                <span>Hamısına bax</span><ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* filtr çipləri */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <button onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-sm ${
                !selectedCategory ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}>Bütün Elanlar</button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shadow-sm ${
                  selectedCategory === cat.name ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}>
                <span>{getPetIcon(cat.name)}</span><span>{cat.name}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex gap-6 overflow-hidden">
              {[...Array(4)].map((_, i) => <div key={i} className="min-w-[300px] h-80 bg-white rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredPets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 max-w-xl mx-auto">
              <p className="text-sm font-semibold mb-3">Bu kateqoriyada hələlik elan yoxdur.</p>
              <button onClick={() => setSelectedCategory(null)} className="text-xs font-bold text-blue-600 hover:underline">
                Bütün elanlara bax
              </button>
            </div>
          ) : (
            <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x scroll-smooth"
              style={{ scrollbarWidth: 'none' }}>
              {filteredPets.map((pet) => {
                const liked = isInWishlist(pet.id);
                return (
                  <div key={pet.id} onClick={() => navigate(`/adopt/${pet.id}`)}
                    className="min-w-[290px] max-w-[290px] snap-start bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img src={pet.mainImageUrl || PLACEHOLDER_PET} alt={pet.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white bg-blue-600 shadow-sm">
                          {pet.genderText}
                        </span>
                        {pet.isUrgent && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white bg-rose-500 shadow-sm flex items-center gap-1">
                            <AlertCircle size={11} /> Təcili
                          </span>
                        )}
                      </div>

                      <button onClick={(e) => handleWishlist(e, pet.id)}
                        className={`absolute top-3 right-3 p-2.5 rounded-xl shadow-md border transition-all z-10 ${
                          liked ? 'bg-rose-50 text-rose-500 border-rose-200 scale-110'
                                : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 border-slate-100'
                        }`}>
                        <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 truncate">{pet.name}</h3>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{pet.breed}</p>
                        </div>
                        <span className="text-[11px] font-semibold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100 shrink-0">
                          {pet.ageText}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin size={13} className="text-blue-500" /> {pet.city}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${ADOPTION_STATUS_COLOR[pet.adoptionStatus]}`}>
                          {ADOPTION_STATUS_TEXT[pet.adoptionStatus]}
                        </span>
                      </div>

                      <button className="mt-4 w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-2.5 rounded-xl text-sm transition border border-blue-100 hover:border-blue-600">
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

      {/* 4. ÜSTÜNLÜKLƏR */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">Niyə məhz viviPaw?</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Biz sadəcə elan saytı deyilik. Sahiblənmədən başlayaraq tibbi və gündəlik qulluq
              ehtiyaclarını təmin edən tam ekosistemik platformayıq.
            </p>
            <div className="space-y-4 text-left max-w-xl mx-auto lg:mx-0">
              {[
                { t: 'Yoxlanılmış Elanlar', d: 'Hər elan və mağaza profili admin tərəfindən təsdiqlənir.' },
                { t: 'Onlayn Baytar Randevusu', d: 'Boş saatları görüb bir kliklə randevu yazın.' },
                { t: 'Etibarlı Mağaza', d: 'Yem, aksesuar və oyuncaqları rəsmi mağazalardan alın.' },
              ].map(({ t, d }) => (
                <div key={t} className="flex items-start gap-3">
                  <CheckCircle2 size={22} className="text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t}</h4>
                    <p className="text-xs sm:text-sm text-slate-500">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-600/10 space-y-3">
              <Shield size={32} />
              <h3 className="text-xl font-bold">100% Güvən</h3>
              <p className="text-blue-100 text-xs leading-relaxed">Sahiblənmə prosesi müraciət və təsdiq sistemi ilə şəffaf şəkildə aparılır.</p>
            </div>
            <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-3 lg:translate-y-6">
              <Calendar size={32} className="text-sky-400" />
              <h3 className="text-xl font-bold">Asan İdarə</h3>
              <p className="text-slate-400 text-xs leading-relaxed">Randevu, sifariş və müraciətləri tək paneldən izləyin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RƏYLƏR (əvvəlki "mesajlaşma" bölməsi) */}
      <section className="py-14 bg-gradient-to-b from-white via-sky-50/30 to-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Xoşbəxt Ailələrimiz</h2>
            <p className="text-slate-500 mt-1 text-sm">viviPaw istifadəçilərinin real rəyləri</p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />)}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">Hələlik rəy mövcud deyil.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white border border-slate-100 p-7 rounded-2xl shadow-sm relative overflow-hidden">
                  <Quote className="absolute right-5 top-5 text-slate-100 h-16 w-16" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex gap-0.5 text-amber-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < t.rating ? '' : 'text-slate-200'}>★</span>
                      ))}
                    </div>

                    <p className="text-slate-600 italic text-sm leading-relaxed">"{t.comment}"</p>

                    {t.petImageUrl && (
                      <img src={t.petImageUrl} alt="" className="w-full h-40 object-cover rounded-xl" />
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-3">
                        {t.userImageUrl
                          ? <img src={t.userImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                          : <div className="w-10 h-10 bg-blue-600 rounded-full grid place-items-center font-bold text-white text-sm">
                              {t.userFullName?.charAt(0) || 'U'}
                            </div>}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{t.userFullName}</h4>
                          <p className="text-xs text-slate-400">{t.dateText}</p>
                        </div>
                      </div>

                      <button onClick={(e) => handleLike(e, t.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                          t.isLikedByCurrentUser
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                        }`}>
                        ❤ {t.likesCount}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/testimonials"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition">
              Bütün rəylərə bax <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;