import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowLeft, PawPrint, MapPin } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { PLACEHOLDER_PET, ADOPTION_STATUS_COLOR, ADOPTION_STATUS_TEXT } from '../../utils/constants';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist, loading } = useWishlist();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-200 border-t-rose-500" />
        <p className="text-slate-500 text-sm font-medium">Bəyəndikləriniz yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 antialiased py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 shadow-sm">
              <Heart className="w-7 h-7 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Bəyəndiklərim 🐾</h1>
              <p className="text-sm text-slate-500 mt-1">
                Sevimli siyahınız <span className="font-bold text-rose-600">({wishlist.length})</span>
              </p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <button onClick={clearWishlist}
              className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 px-4 py-3 rounded-xl transition self-start md:self-auto">
              <Trash2 size={16} /> Hamısını Təmizlə
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
            <div className="w-20 h-20 bg-rose-50 text-rose-400 rounded-full grid place-items-center mx-auto">
              <Heart size={40} className="fill-rose-100" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Sevimli siyahınız boşdur</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Hələ heç bir heyvanı bəyənməmisiniz. Siyahınıza əlavə etmək üçün elanlara göz gəzdirin!
            </p>
            <Link to="/adopt"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/20 text-sm">
              <PawPrint size={18} /> Elanlara Keçid Et
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div key={item.wishListId}
                className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <Link to={`/adopt/${item.petId}`}>
                    <img src={item.mainImageUrl || PLACEHOLDER_PET} alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>

                  <button onClick={() => removeFromWishlist(item.petId)}
                    className="absolute top-3 right-3 p-2.5 bg-white/90 hover:bg-rose-500 hover:text-white text-slate-600 rounded-xl backdrop-blur-md transition shadow-md"
                    title="Siyahıdan çıxart">
                    <Trash2 size={16} />
                  </button>

                  {item.categoryName && (
                    <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-blue-600 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm">
                      {item.categoryName}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/adopt/${item.petId}`} className="group-hover:text-blue-600 transition min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{item.name}</h3>
                    </Link>
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
                      {item.genderText}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-semibold truncate">{item.breed} • {item.ageText}</p>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin size={13} className="text-blue-500" /> {item.city}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ADOPTION_STATUS_COLOR[item.adoptionStatus]}`}>
                      {ADOPTION_STATUS_TEXT[item.adoptionStatus]}
                    </span>
                  </div>

                  <Link to={`/adopt/${item.petId}`}
                    className="mt-auto pt-4 w-full text-center bg-slate-900 hover:bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold transition">
                    Ətraflı Bax
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition bg-white px-5 py-2.5 rounded-xl border border-slate-200/80 shadow-sm">
            <ArrowLeft size={16} /> Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;