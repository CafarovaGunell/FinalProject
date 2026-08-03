import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Store, Stethoscope, PawPrint, MessageSquare,
  Package, Users, ExternalLink, Menu, X, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LuPackage, LuWalletCards, LuNewspaper, LuPawPrint, LuHeart, LuCalendarCheck, LuSettings  } from 'react-icons/lu';



const NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/shops', icon: Store, label: 'Mağaza təsdiqləri' },
  { to: '/admin/vets', icon: Stethoscope, label: 'Baytar təsdiqləri' },
  { to: '/admin/pets', icon: PawPrint, label: 'Elan moderasiyası' },
  { to: '/admin/testimonials', icon: MessageSquare, label: 'Rəy moderasiyası' },
  { to: '/admin/orders', icon: Package, label: 'Sifarişlər' },
  { to: '/admin/users', icon: Users, label: 'İstifadəçilər' },
  { to: '/admin/adminadoptedpets', icon: Users, label: 'Sahiblənilənlər' },
  { to: '/admin/products', icon: LuPackage, label: 'Məhsullar' },
  { to: '/admin/revenue', icon: LuWalletCards, label: 'Gəlir' },
  { to: '/admin/all-pets', icon: LuPawPrint, label: 'Bütün heyvanlar' },
  { to: '/admin/articles', icon: LuNewspaper, label: 'Məqalələr' },
  { to: '/admin/adoption-requests', icon: LuHeart, label: 'Müraciətlər' },
  { to: '/admin/appointments', icon: LuCalendarCheck, label: 'Randevular' },
  { to: '/admin/settings', icon: LuSettings, label: 'Ayarlar' },
];

const AdminLayout = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const roles = user?.roles || (user?.role ? [user.role] : []);
  const isAdmin = roles.includes('Admin') || roles.includes('SuperAdmin');

  if (!isAdmin) return <Navigate to="/" replace />;

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
      isActive ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800">
        <div className="p-2 bg-sky-600 rounded-xl text-white"><ShieldCheck size={20} /></div>
        <div>
          <p className="text-white font-black leading-none">ViViPaw</p>
          <p className="text-[10px] text-slate-500 font-bold mt-0.5">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={linkCls} onClick={() => setOpen(false)}>
            <n.icon size={17} /> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition">
          <ExternalLink size={17} /> Sayta qayıt
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-slate-900 flex-col z-40">{Sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900 flex flex-col">{Sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <button className="lg:hidden p-2 text-slate-600" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p className="text-sm font-bold text-slate-600">{user?.fullName || 'Admin'}</p>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            {roles.includes('SuperAdmin') ? 'SUPER ADMIN' : 'ADMIN'}
          </span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;