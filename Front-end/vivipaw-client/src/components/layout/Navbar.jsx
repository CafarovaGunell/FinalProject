// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  PawPrint, Heart, ShoppingBag, Bell, Menu, X,
  User, LogOut, LayoutDashboard, Store, Stethoscope, ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { notificationApi } from "../../api/endpoints";
import { ROLES, PLACEHOLDER_AVATAR } from "../../utils/constants";
import { cn } from "../../utils/helpers";
import Button from "../ui/Button";

const navLinks = [
  { to: "/pets", label: "Heyvanlar" },
  { to: "/shop", label: "Mağaza" },
  { to: "/vets", label: "Baytarlar" },
  { to: "/blog", label: "Bloq" },
  { to: "/testimonials", label: "Rəylər" },
];

export default function Navbar() {
  const { user, isAuth, logout, isAdmin, isShop, isVet } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isAuth) return;
    notificationApi.unreadCount()
      .then((r) => r.success && setUnread(r.data))
      .catch(() => {});
  }, [isAuth]);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const panel = isAdmin
    ? { to: "/admin", label: "Admin paneli", icon: LayoutDashboard }
    : isShop
    ? { to: "/shop-panel", label: "Mağaza paneli", icon: Store }
    : isVet
    ? { to: "/vet-panel", label: "Baytar paneli", icon: Stethoscope }
    : null;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      isActive ? "text-brand-600 bg-brand-50" : "text-ink-light hover:text-brand-500 hover:bg-brand-50/60");

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-slate-100">
      <div className="container-app">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center shadow-soft">
              <PawPrint size={20} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight">
              ViVi<span className="text-brand-500">Paw</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            {isAuth && (
              <>
                <Link to="/wishlist" className="p-2.5 rounded-xl hover:bg-brand-50 transition" title="Sevimlilər">
                  <Heart size={19} className="text-ink-light" />
                </Link>

                <Link to="/notifications" className="relative p-2.5 rounded-xl hover:bg-brand-50 transition" title="Bildirişlər">
                  <Bell size={19} className="text-ink-light" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold grid place-items-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>

                <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-brand-50 transition" title="Səbət">
                  <ShoppingBag size={19} className="text-ink-light" />
                  {count > 0 && (
                    <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-teal-500 text-white text-[10px] font-bold grid place-items-center">
                      {count}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuth ? (
              <div className="relative ml-1" ref={menuRef}>
                <button onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-50 transition">
                  <img src={user.imageUrl || PLACEHOLDER_AVATAR} alt=""
                    className="w-8 h-8 rounded-lg object-cover bg-brand-50" />
                  <span className="hidden md:block text-sm font-medium max-w-[110px] truncate">
                    {user.fullName?.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className="text-ink-muted" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-card border border-slate-100 py-2 animate-scaleIn">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-semibold truncate">{user.fullName}</p>
                      <p className="text-xs text-ink-muted truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 text-[11px] font-semibold">
                        {user.roles?.[0]}
                      </span>
                    </div>

                    <div className="py-1">
                      {panel && (
                        <Link to={panel.to} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50 transition">
                          <panel.icon size={16} className="text-brand-500" />
                          {panel.label}
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50 transition">
                        <User size={16} className="text-ink-muted" /> Profilim
                      </Link>
                      <Link to="/my-orders" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50 transition">
                        <ShoppingBag size={16} className="text-ink-muted" /> Sifarişlərim
                      </Link>
                      <Link to="/my-requests" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-50 transition">
                        <PawPrint size={16} className="text-ink-muted" /> Müraciətlərim
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition">
                        <LogOut size={16} /> Çıxış
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Giriş</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Qeydiyyat</Button>
                </Link>
              </div>
            )}

            <button onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl hover:bg-slate-100 transition">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white animate-fadeIn">
          <div className="container-app py-3 space-y-1">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn("block px-3 py-2.5 rounded-xl text-sm font-medium",
                  isActive ? "bg-brand-50 text-brand-600" : "text-ink-light hover:bg-slate-50")}>
                {l.label}
              </NavLink>
            ))}
            {!isAuth && (
              <div className="flex gap-2 pt-3 border-t border-slate-100 mt-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Giriş</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Qeydiyyat</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}