import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBasket, ArrowLeft, PawPrint, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 font-sans antialiased py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Başlıq Hissəsi */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 shadow-sm">
              <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Bəyəndiklərim 🐾</h1>
              <p className="text-sm text-slate-500 mt-1">
                Sevimli siyahınıza əlavə etdiyiniz dostlarımız <span className="font-bold text-indigo-600">({wishlist.length})</span>
              </p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 px-4 py-3 rounded-xl transition-all shadow-sm self-start md:self-auto duration-200"
            >
              <Trash2 size={16} />
              <span>Hamısını Təmizlə</span>
            </button>
          )}
        </div>

        {/* Boş Siyahı Vəziyyəti */}
        {wishlist.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
            <div className="w-20 h-20 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Heart size={40} className="fill-rose-100" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Sevimli siyahınız boşdur</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Hələ heç bir heyvanı bəyənməmisiniz. Siyahınıza əlavə etmək üçün elanlara göz gəzdirin!
            </p>
            <Link
              to="/adopt"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm"
            >
              <PawPrint size={18} />
              <span>Elanlara Keçid Et</span>
            </Link>
          </div>
        ) : (
          /* Wishlist Grid Siyahısı (Daha Rəngarəng və Canlı Kartlar) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Şəkil Konteyneri (Link ilə əhatə olundu ki, şəkilə basanda detaile getsin) */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <Link to={`/adopt/${item.id}`} className="block w-full h-full cursor-pointer">
                      <img
                        src={item.imageUrl || item.image || '/placeholder-pet.jpg'}
                        alt={item.name || item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    </Link>

                    {/* Silmə (Zibil qutusu) Düyməsi */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2.5 bg-white/90 hover:bg-rose-500 hover:text-white text-slate-600 rounded-xl backdrop-blur-md transition-all shadow-md group/btn"
                      title="Siyahıdan çıxart"
                    >
                      <Trash2 size={16} className="transition-transform group-hover/btn:scale-110" />
                    </button>

                    {/* Yaş və ya Kateqoriya Etiketi */}
                    {item.breed && (
                      <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-indigo-600 font-bold text-xs px-3 py-1 rounded-lg border border-slate-200/60 shadow-sm">
                        {item.breed}
                      </span>
                    )}
                  </div>

                  {/* Detal Hissəsi */}
                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <Link to={`/adopt/${item.id}`} className="block group-hover:text-indigo-600 transition-colors">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                          {item.name || item.title}
                        </h3>
                      </Link>
                      {item.price && (
                        <span className="text-emerald-600 font-extrabold text-sm bg-emerald-50 px-2.5 py-1 rounded-lg">
                          {item.price} ₼
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {item.description || 'Sizi gözləyən sevimli və qayğıya ehtiyacı olan dostumuz.'}
                    </p>
                  </div>
                </div>

                {/* Düymələr Hissəsi */}
                <div className="p-5 pt-0 mt-auto flex gap-2">
                  <Link
                    to={`/adopt/${item.id}`}
                    className="flex-1 text-center bg-slate-900 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Ətraflı Bax</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Geri Dönüş Linki */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white px-5 py-2.5 rounded-xl border border-slate-200/80 shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Ana səhifəyə qayıt</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Wishlist;