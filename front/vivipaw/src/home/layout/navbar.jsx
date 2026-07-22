import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShoppingBasket, Heart, Menu, X, PawPrint, User, LogOut } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import AuthModal from "../components/AuthModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // 2. Modalın açıq/bağlı state-i
  
  const { user, logout } = useAuth(); 
  const { wishlist } = useWishlist(); 
  const navigate = useNavigate();

  const basketCount = 2; 
  const wishlistCount = user ? wishlist.length : 0; // Əgər istifadəçi yoxdursa say 0 görsөнsün

  const navLinks = [
    { path: '/', label: 'Ana Səhifə' },
    { path: '/adopt', label: 'Övladlığa Götür' },
    { path: '/petcare', label: 'Pet Baxımı' },
    { path: '/about', label: 'Haqqımızda' },
  ];

  // 3. Wishlist ikonuna basıldıqda yoxlama edən funksiya
  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true); // Hesab yoxdursa popap açılır
    } else {
      navigate('/wishlist'); // Hesab varsa səhifəyə keçir
    }
  };

  return (
    <>
      {/* Hesab Xəbərdarlıq Modalı (Popup) */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo Hissəsi */}
            <Link to="/" className="flex items-center gap-2 cursor-pointer group flex-shrink-0">
              <div className="bg-sky-600 p-2 rounded-xl text-white group-hover:bg-sky-500 transition-colors">
                <PawPrint size={24} />
              </div>
              <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                vivi<span className="text-slate-100">Paw</span>
              </span>
            </Link>

            {/* Naviqasiya Linkləri (Desktop) */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 font-medium">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `pb-1 px-1 transition-all border-b-2 ${
                      isActive
                        ? 'text-sky-400 border-sky-400'
                        : 'text-slate-300 border-transparent hover:text-sky-400 hover:border-sky-400/50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Sağ tərəf: İkonlar və Profil (Desktop) */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              
              {/* İstək Listi (Wishlist) - DÜZƏLİŞ BURADA OLDU */}
              <button 
                onClick={handleWishlistClick}
                className="relative p-2 text-slate-300 hover:text-rose-400 transition-colors focus:outline-none cursor-pointer"
              >
                <Heart size={22} />
                {user && wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Mağaza / Səbət (Basket) */}
              <Link to="/basket" className="relative p-2 text-slate-300 hover:text-sky-400 transition-colors focus:outline-none">
                <ShoppingBasket size={22} />
                {basketCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-sky-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {basketCount}
                  </span>
                )}
              </Link>

              {/* Profil Giriş və ya İstifadəçi Məlumatı */}
              {user ? (
                <div className="flex items-center gap-3 bg-slate-800/80 pl-3 pr-2 py-1.5 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-600/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-xs">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                      {user.fullName}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Çıxış et"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-sky-400 px-4 py-2 rounded-xl border border-blue-500/30 transition-all font-medium whitespace-nowrap">
                  <User size={18} />
                  <span>Giriş</span>
                </Link>
              )}

            </div>

            {/* Mobil Menyu Düyməsi */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="text-slate-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobil Menyu */}
        <div className={`md:hidden bg-slate-900 border-t border-slate-800 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[450px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pt-3 pb-6 space-y-2.5 shadow-inner">
            
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 font-medium'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            
            {/* Mobil İstəklər və Səbət Bölməsi */}
            <div className="pt-4 pb-2 border-t border-slate-800 flex items-center justify-around">
              <button 
                onClick={(e) => {
                  setIsOpen(false);
                  handleWishlistClick(e);
                }} 
                className="flex items-center gap-2 text-slate-300 hover:text-rose-400 py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors w-full justify-center cursor-pointer"
              >
                <div className="relative">
                  <Heart size={20} />
                  {user && wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">İstəklər</span>
              </button>
              
              <div className="h-6 w-px bg-slate-800"></div>

              <Link to="/basket" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-slate-300 hover:text-sky-400 py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors w-full justify-center">
                <div className="relative">
                  <ShoppingBasket size={20} />
                  {basketCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {basketCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">Səbət</span>
              </Link>
            </div>

            {/* Mobil Giriş / İstifadəçi Bölməsi */}
            {user ? (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold text-sm">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {user.fullName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold bg-rose-500/10 px-3 py-2 rounded-xl"
                >
                  <LogOut size={16} />
                  <span>Çıxış</span>
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full mt-2 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-600/20 transition-colors">
                <User size={18} />
                <span>Giriş et</span>
              </Link>
            )}

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;