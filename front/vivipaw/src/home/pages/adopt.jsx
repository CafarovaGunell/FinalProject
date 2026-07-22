import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { useWishlist } from '../context/WishlistContext';
import AuthModal from '../components/AuthModal'; 
import { 
  Heart, 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Grid, 
  List, 
  Check, 
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';

const Adopt = () => {
  const { toggleWishlist, isInWishlist, user } = useWishlist();

  const [allPets, setAllPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); 

  useEffect(() => {
    const fetchPets = axios.get('http://localhost:5123/api/Animals');
    const fetchCategories = axios.get('http://localhost:5123/api/Categories').catch(() => null);

    Promise.all([fetchPets, fetchCategories])
      .then(([petsRes, categoriesRes]) => {
        setAllPets(petsRes.data);

        if (categoriesRes && categoriesRes.data) {
          setCategories(categoriesRes.data.map(c => c.name));
        } else {
          setCategories(['İt', 'Pişik', 'Quş', 'Akvarium', 'Gəmirici', 'Digər']);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("Məlumat çəkilərkən xəta baş verdi:", err);
        setError("Məlumatları yükləmək mümkün olmadı.");
        setLoading(false);
      });
  }, []);

  const handleWishlistToggle = (pet, e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    toggleWishlist(pet);
  };

  // Backend xüsusiyyətlərinə tam uyğun filtrasiya (Şəhər axtarışı daxil olmaqla)
  const filteredPets = allPets.filter(pet => {
    const searchLower = searchQuery.toLowerCase().trim();
    const cityLower = citySearchQuery.toLowerCase().trim();

    const nameMatch = pet.name ? pet.name.toLowerCase().includes(searchLower) : false;
    const breedMatch = pet.breed ? pet.breed.toLowerCase().includes(searchLower) : false;
    const matchesSearch = searchLower === '' || nameMatch || breedMatch;
    
    // Şəhər/Məkan axtarışı (Location)
    const matchesCity = cityLower === '' || (pet.location && pet.location.toLowerCase().includes(cityLower));

    const matchesCategory = selectedCategory === 'All' || 
      (pet.categoryName && pet.categoryName.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCity && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center text-slate-500">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          <Sparkles className="absolute text-indigo-600 animate-pulse" size={18} />
        </div>
        <p className="mt-4 text-sm font-semibold tracking-wide text-slate-600">Heyvan dostlarımız yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 font-sans antialiased pb-16 relative">
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Hero / Başlıq */}
      <div className="bg-gradient-to-b from-indigo-900/5 via-slate-50/50 to-transparent py-10 border-b border-slate-200/50 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Yeni bir dost xilas edin 🐾
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base font-normal">
            Sizin kiçik bir addımınız onların bütün həyatını dəyişə bilər. Siyahıdan uyğun heyvanı seçib ona isti bir yuva bəxş edin.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Sol Filtr Paneli (Səliqəli və Kompakt) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <SlidersHorizontal size={16} className="text-indigo-600" />
                <span>Süzgəclər</span>
              </div>
              {(selectedCategory !== 'All' || citySearchQuery !== '') && (
                <button 
                  onClick={() => { setSelectedCategory('All'); setCitySearchQuery(''); }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Sıfırla
                </button>
              )}
            </div>

            {/* Heyvan Növü / Kateqoriyalar */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Heyvan Növü</label>
              <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                {['All', ...categories].map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all relative overflow-hidden ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{cat === 'All' ? 'Hamısı' : cat}</span>
                      {isActive && <Check size={14} className="stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Şəhər Məkanı Axtarışı */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Şəhər Məkanı</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text"
                  placeholder="Bakı, Sumqayıt..." 
                  value={citySearchQuery} 
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>
          </aside>

          {/* Əsas Kontent və Axtarış Paneli */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Üst Axtarış Paneli */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Ada və ya cinsə görə axtar..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <div className="flex w-full sm:w-auto gap-2 justify-end items-center">
                <button 
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  <span>Filtrlər</span>
                </button>
                
                <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobil Filtr Bölməsi (Açılıb-bağlanan) */}
            {showMobileFilters && (
              <div className="lg:hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-bold text-sm text-slate-900">Süzgəclər</span>
                  <button onClick={() => setShowMobileFilters(false)} className="text-xs text-slate-400 font-bold">Bağla</button>
                </div>
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Şəhər Məkanı</label>
                  <input 
                    type="text"
                    placeholder="Bakı, Sumqayıt..." 
                    value={citySearchQuery} 
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Heyvan Kartları Siyahısı (Düzgün ölçülər və bütün xüsusiyyətlər yerində) */}
            {filteredPets.length > 0 ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                {filteredPets.map((pet) => {
                  const isFavorite = user ? isInWishlist(pet.id) : false;

                  return (
                    <div 
                      key={pet.id} 
                      className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Şəkil Hissəsi (Ölçüsü optimallaşdırılıb: h-48 / aspect) */}
                      <div className="relative bg-slate-100 overflow-hidden h-48 w-full">
                        <Link to={`/adopt/${pet.id}`} className="block w-full h-full cursor-pointer">
                          <img 
                            src={pet.imageUrl || '/placeholder.jpg'} 
                            alt={pet.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        </Link>
                        
                        {/* Təcili (Urgent) Etiketi */}
                        {pet.isUrgent && (
                          <span className="absolute top-3 left-3 bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                            <AlertCircle size={12} />
                            Təcili
                          </span>
                        )}

                        {/* Sevimlilərə əlavə et (Ürək) */}
                        <button 
                          onClick={(e) => handleWishlistToggle(pet, e)}
                          className={`absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-md p-2 rounded-xl transition-all shadow-md ${
                            isFavorite ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-rose-500'
                          }`}
                        >
                          <Heart 
                            size={18} 
                            className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} 
                          />
                        </button>
                      </div>

                      {/* Məlumatlar (Ad, Cins, Yaş, Məkan və Tarix) */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Link to={`/adopt/${pet.id}`} className="block group-hover:text-indigo-600 transition-colors">
                              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                                {pet.name}
                              </h3>
                            </Link>
                            {pet.gender && (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                {pet.gender}
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-slate-400">
                            {pet.breed} {pet.ageText && `• ${pet.ageText}`}
                          </p>

                          {/* Məkan və Tarix (Backend-dən gələn dəyərlər) */}
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                            {pet.location && (
                              <div className="flex items-center gap-1">
                                <MapPin size={13} className="text-indigo-500" />
                                <span className="font-medium">{pet.location}</span>
                              </div>
                            )}
                            {pet.dateText && (
                              <div className="flex items-center gap-1 text-slate-400">
                                <Calendar size={13} />
                                <span>{pet.dateText}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sahiblənmək istəyirəm düyməsi */}
                        <Link 
                          to={`/adopt/${pet.id}`}
                          className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <span>Sahiblənmək istəyirəm</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500">
                <p className="text-sm font-semibold">Axtarışınıza uyğun heç bir elan tapılmadı.</p>
              </div>
            )}

          </main>

        </div>
      </div>
    </div>
  );
};

export default Adopt;