import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LuShoppingBasket, LuHeart, LuMenu, LuX, LuPawPrint, LuUser, LuLogOut,
  LuBell, LuLayoutDashboard, LuStore, LuStethoscope, LuChevronDown, LuPackage, LuFileText,
} from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { notificationApi } from '../../services/endpoints';
import AuthModal from '../components/AuthModal';

const navLinks = [
  { path: '/', label: 'Ana Səhifə' },
  { path: '/adopt', label: 'Övladlığa Götür' },
  { path: '/shop', label: 'Mağaza' },
  { path: '/vets', label: 'Baytarlar' },
  { path: '/petcare', label: 'Pet Baxımı' },
  { path: '/about', label: 'Haqqımızda' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);

  const { user, logout, isAdmin, isShop, isVet } = useAuth();
  const { ids } = useWishlist();
  const { count } = useCart();
  const navigate = useNavigate();

  const wishlistCount = user ? ids.length : 0;

  useEffect(() => {
    if (!user) return setUnread(0);
    notificationApi.unreadCount()
      .then((r) => r.success && setUnread(r.data))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const refresh = () => notificationApi.unreadCount()
      .then((r) => r.success && setUnread(r.data)).catch(() => {});
    window.addEventListener('vivipaw:notifications', refresh);
    return () => window.removeEventListener('vivipaw:notifications', refresh);
  }, [user]);

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const panel = isAdmin
    ? { to: '/admin', label: 'Admin paneli', icon: LuLayoutDashboard }
    : isShop
    ? { to: '/profile', label: 'Mağaza paneli', icon: LuStore }
    : isVet
    ? { to: '/profile', label: 'Baytar paneli', icon: LuStethoscope }
    : null;

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) setAuthModal(true);
    else navigate('/wishlist');
  };

  const handleCart = (e) => {
    e.preventDefault();
    if (!user) setAuthModal(true);
    else navigate('/basket');
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setIsOpen(false);
    navigate('/');
  };

  return (
    <>
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} />

      <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center gap-4">

            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="bg-sky-600 p-2 rounded-xl text-white group-hover:bg-sky-500 transition-colors">
                <LuPawPrint size={24} />
              </div>
              <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                vivi<span className="text-slate-100">Paw</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-5 xl:gap-7 font-medium">
              {navLinks.map((l) => (
                <NavLink key={l.path} to={l.path} end={l.path === '/'}
                  className={({ isActive }) =>
                    `pb-1 px-0.5 text-sm transition-all border-b-2 ${
                      isActive ? 'text-sky-400 border-sky-400'
                               : 'text-slate-300 border-transparent hover:text-sky-400 hover:border-sky-400/50'
                    }`}>
                  {l.label}
                </NavLink>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <button onClick={handleWishlist}
                className="relative p-2.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition">
                <LuHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center font-bold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </button>

              {user && (
                <Link to="/notifications"
                  className="relative p-2.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition">
                  <LuBell size={20} />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center font-bold">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>
              )}

              <button onClick={handleCart}
                className="relative p-2.5 text-slate-300 hover:text-sky-400 hover:bg-slate-800 rounded-xl transition">
                <LuShoppingBasket size={20} />
                {count > 0 && (
                  <span className="absolute top-1 right-1 bg-sky-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center font-bold">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative ml-1" ref={menuRef}>
                  <button onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2.5 bg-slate-800/80 pl-2.5 pr-3 py-2 rounded-xl border border-slate-700/60 hover:border-slate-600 transition">
                    {user.imageUrl
                      ? <img src={user.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      : <div className="w-7 h-7 rounded-lg bg-sky-600/20 border border-sky-500/30 text-sky-400 grid place-items-center font-bold text-xs">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>}
                    <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate">
                      {user.fullName?.split(' ')[0]}
                    </span>
                    <LuChevronDown size={14} className={`text-slate-400 transition ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-800">
                        <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 text-[10px] font-bold uppercase tracking-wider">
                          {user.roles?.[0]}
                        </span>
                      </div>

                      {[
                        panel,
                        { to: '/profile', label: 'Profilim', icon: LuUser },
                        { to: '/my-orders', label: 'Sifarişlərim', icon: LuPackage },
                        { to: '/my-requests', label: 'Müraciətlərim', icon: LuFileText },
                        { to: '/appointments', label: 'Randevularım', icon: LuStethoscope },
                      ].filter(Boolean).map(({ to, label, icon: Icon }) => (
                        <Link key={to + label} to={to} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-sky-600/15 hover:text-sky-400 transition">
                          <Icon size={15} /> {label}
                        </Link>
                      ))}

                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition">
                          <LuLogOut size={15} /> Çıxış
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login"
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl transition font-semibold text-sm ml-1">
                  <LuUser size={17} /> <span>Giriş</span>
                </Link>
              )}
            </div>

            <button onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition">
              {isOpen ? <LuX size={26} /> : <LuMenu size={26} />}
            </button>
          </div>
        </div>

        {/* MOBİL */}
        <div className={`lg:hidden bg-slate-900 border-t border-slate-800 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((l) => (
              <NavLink key={l.path} to={l.path} end={l.path === '/'} onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm transition ${
                    isActive ? 'bg-slate-800 text-sky-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}>
                {l.label}
              </NavLink>
            ))}

            <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-2">
              <button onClick={(e) => { setIsOpen(false); handleWishlist(e); }}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-slate-800/50 text-slate-300">
                <div className="relative"><LuHeart size={19} />
                  {wishlistCount > 0 && <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full grid place-items-center font-bold">{wishlistCount}</span>}
                </div>
                <span className="text-[10px] font-semibold">İstəklər</span>
              </button>

              <Link to="/notifications" onClick={() => setIsOpen(false)}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-slate-800/50 text-slate-300">
                <div className="relative"><LuBell size={19} />
                  {unread > 0 && <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] w-4 h-4 rounded-full grid place-items-center font-bold">{unread}</span>}
                </div>
                <span className="text-[10px] font-semibold">Bildiriş</span>
              </Link>

              <button onClick={(e) => { setIsOpen(false); handleCart(e); }}
                className="flex flex-col items-center gap-1 py-3 rounded-xl bg-slate-800/50 text-slate-300">
                <div className="relative"><LuShoppingBasket size={19} />
                  {count > 0 && <span className="absolute -top-1.5 -right-2 bg-sky-500 text-white text-[9px] w-4 h-4 rounded-full grid place-items-center font-bold">{count}</span>}
                </div>
                <span className="text-[10px] font-semibold">Səbət</span>
              </button>
            </div>

            {user ? (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <Link to="/profile" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2 py-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-400 grid place-items-center font-bold text-sm">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{user.fullName}</p>
                    <p className="text-[10px] text-sky-400 font-bold uppercase">{user.roles?.[0]}</p>
                  </div>
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 py-3 rounded-xl text-xs font-bold">
                  <LuLogOut size={16} /> Çıxış
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-600/20">
                <LuUser size={18} /> Giriş et
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;