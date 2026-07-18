import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Search, SlidersHorizontal, MapPin, Calendar, Grid, List, Check } from 'lucide-react';

const Adopt = () => {
  // API-dan gələcək heyvanların siyahısı
  const [allPets, setAllPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtrlər üçün state-lər
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Aktiv görünüş rejimi (Grid və ya List)
  const [viewMode, setViewMode] = useState('grid'); 
  
  // Sevimlilər siyahısı (Wishlist)
  const [wishlist, setWishlist] = useState([]);

  // API-dan dataların çəkilməsi
  useEffect(() => {
    axios.get('http://localhost:5123/Animals')
      .then(response => {
        setAllPets(response.data);
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

  // Filtrləmə məntiqi (API-dan gələn model adlarına uyğunlaşdırıldı)
  const filteredPets = allPets.filter(pet => {
    const nameMatch = pet.name ? pet.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const breedMatch = pet.breed ? pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const matchesSearch = nameMatch || breedMatch;
    
    // Əgər API-da "type" (İt/Pişik) birbaşa yoxdursa, breed və ya digər property-ə görə yoxlaya bilərsiniz.
    // Burada modelinizdə "type" sahəsinin olduğunu fərz edirik.
    const matchesType = selectedType === 'All' || pet.type === selectedType;
    const matchesCity = selectedCity === 'All' || pet.location === selectedCity;

    return matchesSearch && matchesType && matchesCity;
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

            {/* Heyvan Növü */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Heyvan Növü</label>
              <div className="flex flex-col gap-1.5">
                {['All', 'İt', 'Pişik'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedType === type ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <span>{type === 'All' ? 'Hamısı' : type}</span>
                    {selectedType === type && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Şəhər Filtri */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Şəhər</label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 text-slate-700"
              >
                <option value="All">Bütün Şəhərlər</option>
                <option value="Bakı">Bakı</option>
                <option value="Gəncə">Gəncə</option>
                <option value="Sumqayıt">Sumqayıt</option>
              </select>
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

              {/* Mobil Üçün Düymələr */}
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
            <div className={`lg:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-inner space-y-4 overflow-hidden transition-all duration-300 ${showMobileFilters ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none p-0 border-none'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Növ</label>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium">
                    <option value="All">Hamısı</option>
                    <option value="İt">İt</option>
                    <option value="Pişik">Pişik</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Şəhər</label>
                  <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-medium">
                    <option value="All">Hamısı</option>
                    <option value="Bakı">Bakı</option>
                    <option value="Gəncə">Gəncə</option>
                    <option value="Sumqayıt">Sumqayıt</option>
                  </select>
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
                          src={pet.imageUrl || pet.image} 
                          alt={pet.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Əgər backenddən isUrgent gəlirsə Təcili, gəlmirsə standart etiket yazılır */}
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
                            {pet.ageText || pet.age || (pet.ageInMonths ? `${pet.ageInMonths} aylıq` : '')}
                          </span>
                        </div>

                        {/* Şəhər və Tarix */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs font-medium">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-slate-400" />
                            <span>{pet.location || pet.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{pet.dateText || 'Bugün'}</span>
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