import React, { useState, useEffect } from 'react';
import { Heart, Trash2, MapPin, ArrowRight, Loader2, Grid, List, Sparkles } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' və ya 'list' görünüşü üçün

  useEffect(() => {
    const fakeFetch = setTimeout(() => {
      setWishlistItems([
        { 
          id: 1, 
          name: "Badi", 
          breed: "Golden Retriever", 
          age: "3 aylıq", 
          city: "Bakı", 
          price: "Pulsuz",
          image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600" 
        },
        { 
          id: 2, 
          name: "Mila", 
          breed: "British Shorthair", 
          age: "1 yaş", 
          city: "Bakı", 
          price: "Pulsuz",
          image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600" 
        }
      ]);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(fakeFetch);
  }, []);

  const handleRemoveItem = (id) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase">Yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 pb-20 antialiased">
      
      {/* BAŞLIQ VE İDARƏETMƏ PANELSİ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center justify-center md:justify-start gap-2.5">
              <span>Bəyəndiklərim</span>
              <Heart size={24} className="fill-rose-500 text-rose-500 animate-pulse" />
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Yadda saxladığınız və izlədiyiniz tüklü dostlarınız.
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex items-center justify-center gap-3">
              {/* Görünüş Dəyişdirici Düymələr */}
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={16} />
                </button>
              </div>

              <button 
                onClick={() => setWishlistItems([])}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50/30 transition-colors"
              >
                Təmizlə
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SİYAHI BÖLMƏSİ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {wishlistItems.length > 0 ? (
          viewMode === 'grid' ? (
            
            /* MODERN GRID GÖRÜNÜŞÜ */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((pet) => (
                <div key={pet.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button 
                      onClick={() => handleRemoveItem(pet.id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-rose-50 p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 shadow-sm border border-slate-100 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{pet.name}</h3>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">{pet.breed}</p>
                      </div>
                      <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-xl">{pet.age}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 font-semibold text-slate-500">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{pet.city}</span>
                      </div>
                      <button className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 transition-colors group/btn">
                        <span>Detallar</span>
                        <ArrowRight size={14} className="transform group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            
            /* DİNAMİK LIST (CƏDVƏL) GÖRÜNÜŞÜ */
            <div className="space-y-4 max-w-4xl mx-auto">
              {wishlistItems.map((pet) => (
                <div key={pet.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full sm:w-auto">
                    <img src={pet.image} alt={pet.name} className="w-20 h-20 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h3 className="text-base font-bold text-slate-900">{pet.name}</h3>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">{pet.age}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{pet.breed}</p>
                      <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-slate-400 font-semibold mt-2">
                        <MapPin size={12} />
                        <span>{pet.city}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    <button 
                      onClick={() => handleRemoveItem(pet.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                      Məlumat Al
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          
          /* YENİLƏNMİŞ BOŞ EKRAN DİZAYNI */
          <div className="text-center py-20 max-w-md mx-auto space-y-5">
            <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
              <Heart size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Siyahınız hazırda boşdur</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Bəyəndiyiniz elanları bura əlavə edərək daha sonra asanlıqla baxa bilərsiniz.
              </p>
            </div>
            <div className="pt-2">
              <Link to={"/adopt"}
               className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-sm">
                Elanlara göz gəzir
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;