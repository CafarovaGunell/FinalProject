import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Search, SlidersHorizontal, MapPin, Calendar, Grid, List, Check, X } from 'lucide-react';

const Adopt = () => {
  // API-dan gələcək datalar üçün state-lər
  const [allPets, setAllPets] = useState([]);
  const [categories, setCategories] = useState([]); // Bazadan dinamik gələcək kateqoriyalar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtrlər üçün state-lər
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // Kateqoriyaya görə filtr
  const [citySearchQuery, setCitySearchQuery] = useState('');     // Şəhər üzrə yazaraq axtarış
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Aktiv görünüş rejimi (Grid və ya List)
  const [viewMode, setViewMode] = useState('grid'); 
  
  // Sevimlilər siyahısı (Wishlist)
  const [wishlist, setWishlist] = useState([]);

  // API-dan dataların və kateqoriyaların parallel çəkilməsi
  useEffect(() => {
    const fetchPets = axios.get('http://localhost:5123/api/Animals');
    // Əgər Kateqoriyalar üçün xüsusi controlleriniz varsa (məsələn: CategoriesController), oradan da dinamik çəkə bilərsiniz:
    const fetchCategories = axios.get('http://localhost:5123/api/Categories').catch(() => null);

    Promise.all([fetchPets, fetchCategories])
      .then(([petsRes, categoriesRes]) => {
        setAllPets(petsRes.data);

        // Əgər Categories controlleriniz varsa dinamik gəlsin, yoxdursa bazadakı siyahıya əsasən fallback set edirik
        if (categoriesRes && categoriesRes.data) {
          setCategories(categoriesRes.data.map(c => c.name));
        } else {
          // SQL bazasındakı dəqiq adlar:
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

  // Wishlist funksiyası
  const toggleWishlist = (petId) => {
    if (wishlist.includes(petId)) {
      setWishlist(wishlist.filter(id => id !== petId));
    } else {
      setWishlist([...wishlist, petId]);
    }
  };

  // TAM DƏQİQ FİLTRLƏMƏ MƏNTİQİ
  const filteredPets = allPets.filter(pet => {
    const searchLower = searchQuery.toLowerCase().trim();
    const cityLower = citySearchQuery.toLowerCase().trim();

    // 1. Ad və ya cinsə görə axtarış
    const nameMatch = pet.name ? pet.name.toLowerCase().includes(searchLower) : false;
    const breedMatch = pet.breed ? pet.breed.toLowerCase().includes(searchLower) : false;
    const matchesSearch = searchLower === '' || nameMatch || breedMatch;
    
    // 2. Şəhərə görə YAZDIQCA axtarış
    const matchesCity = cityLower === '' || (pet.location && pet.location.toLowerCase().includes(cityLower));

    // 3. KATEQORİYAYA GÖRƏ FİLTR (Backend-dən gələn categoryName ilə)
    const matchesCategory = selectedCategory === 'All' || 
      (pet.categoryName && pet.categoryName.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCity && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-3"></div>
        Yüklənir...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-rose-500 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 font-sans antialiased">
      
      {/* ÜST BAŞLIQ BÖLMƏSİ */}
      <div className="max-w-7xl mx-auto mt-[30px] px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-slate-500 mt-2 text-lg sm:text-xl flex items-center justify-center gap-2">
          <span>Yeni bir dost xilas edin və ona isti bir yuva bəxş edin.</span>
          <span className="text-2xl">🐾</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* FİLTRLƏR PANELİ (DESKTOP) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-4">
              <SlidersHorizontal size={18} className="text-blue-600" />
              <span>Süzgəclər</span>
            </div>

            {/* Bütün Kateqoriyalar Siyahısı */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Heyvan Növü</label>
              <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                {['All', ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedCategory === cat ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat === 'All' ? 'Hamısı' : cat}</span>
                    {selectedCategory === cat && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* YAZDIQCA AXTARAN ŞƏHƏR FİLTRİ */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Şəhər Axtar</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Bakı, Gəncə..." 
                  value={citySearchQuery} 
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-sm font-medium focus:outline-none focus:border-blue-500 text-slate-700"
                />
                {citySearchQuery && (
                  <button 
                    onClick={() => setCitySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* ƏSAS MƏZMUN (AXTARIŞ VƏ KARTLAR) */}
          <main className="lg:col-span-9 space-y-6">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Axtarış Inputu */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Ada və ya cinsə görə axtar..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-700 font-medium"
                />
              </div>

              {/* Mobil Düymələr Və View Mode */}
              <div className="flex w-full sm:w-auto gap-2 justify-end items-center">
                <button 
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <SlidersHorizontal size={18} />
                  <span>Filtrlər</span>
                </button>
                
                <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* MOBİL FİLTR PANELİ */}
            <div className={`lg:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-inner space-y-4 overflow-hidden transition-all duration-300 ${
              showMobileFilters ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none p-0 border-none'
            }`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Növ</label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium"
                  >
                    <option value="All">Hamısı</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Şəhər Axtar</label>
                  <input 
                    type="text" 
                    placeholder="Şəhər yazın..."
                    value={citySearchQuery} 
                    onChange={(e) => setCitySearchQuery(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* KARTLARIN SİYAHISI */}
            {filteredPets.length > 0 ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                {filteredPets.map((pet) => {
                  const isFavorite = wishlist.includes(pet.id);

                  return (
                    <div 
                      key={pet.id} 
                      className={`bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ${
                        viewMode === 'list' ? 'flex flex-col sm:flex-row h-auto sm:h-[220px]' : ''
                      }`}
                    >
                      {/* Şəkil və Tag */}
                      <div className={`relative bg-slate-100 overflow-hidden shrink-0 ${
                        viewMode === 'list' ? 'w-full sm:w-[260px] h-[180px] sm:h-full' : 'aspect-[4/3]'
                      }`}>
                        <img 
                          src={pet.imageUrl || '/placeholder.jpg'} 
                          alt={pet.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg text-white ${pet.isUrgent ? 'bg-rose-500' : 'bg-blue-600'}`}>
                          {pet.isUrgent ? 'Təcili' : 'Yeni'}
                        </span>
                        
                        <button 
                          onClick={() => toggleWishlist(pet.id)}
                          className={`absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-xl transition-all shadow-sm ${isFavorite ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-500'}`}
                        >
                          <Heart size={18} className={isFavorite ? 'fill-rose-500' : ''} />
                        </button>
                      </div>

                      {/* Məlumat Hissəsi */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{pet.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{pet.breed} • {pet.gender}</p>
                          </div>
                          <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100/50">
                            {pet.ageText}
                          </span>
                        </div>

                        {/* Şəhər və Tarix */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs font-medium">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-slate-400" />
                            <span>{pet.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{pet.dateText}</span>
                          </div>
                        </div>

                        <button className="w-full bg-blue-900 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-600/10">
                          Sahiblənmək İstəyirəm
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-slate-900">Heç bir nəticə tapılmadı</h3>
                <p className="text-slate-500 text-sm mt-1">Filtrləri dəyişərək yenidən yoxlayın.</p>
              </div>
            )}

          </main>

        </div>
      </div>
    </div>
  );
};

export default Adopt;