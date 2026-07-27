import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Stethoscope, PawPrint, MessageSquare, Users, Package, Wallet, TrendingUp } from 'lucide-react';
import { adminApi } from '../../../services/endpoints';
import { PageHeader, StatCard, listFrom } from '../../components/admin/ui';

const pick = (d, keys) => {
  for (const k of keys) if (d?.[k] != null) return d[k];
  return null;
};

const Dashboard = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState({ shops: 0, vets: 0, pets: 0, testimonials: 0 });

  useEffect(() => {
    (async () => {
      const [d, s, v, p, t] = await Promise.all([
        adminApi.dashboard().catch(() => null),
        adminApi.shops(1).catch(() => null),
        adminApi.vets(1).catch(() => null),
        adminApi.pendingPets(1, 60).catch(() => null),
        adminApi.pendingTestimonials().catch(() => null),
      ]);
      setStats(d?.success ? d.data : null);
      setPending({
        shops: listFrom(s).length,
        vets: listFrom(v).length,
        pets: listFrom(p).length,
        testimonials: listFrom(t).length,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      </div>
    );
  }

  const d = stats || {};
  const totalUsers = pick(d, ['totalUsers', 'userCount', 'users']);
  const totalOrders = pick(d, ['totalOrders', 'orderCount', 'orders']);
  const totalRevenue = pick(d, ['totalRevenue', 'revenue', 'totalSales']);
  const totalProducts = pick(d, ['totalProducts', 'productCount', 'products']);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platformanın ümumi vəziyyəti" />

      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Təsdiq gözləyən</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Store} label="Mağaza ərizəsi" value={pending.shops} tone={pending.shops ? 'amber' : 'emerald'} onClick={() => nav('/admin/shops')} />
        <StatCard icon={Stethoscope} label="Baytar ərizəsi" value={pending.vets} tone={pending.vets ? 'amber' : 'emerald'} onClick={() => nav('/admin/vets')} />
        <StatCard icon={PawPrint} label="Heyvan elanı" value={pending.pets} tone={pending.pets ? 'amber' : 'emerald'} onClick={() => nav('/admin/pets')} />
        <StatCard icon={MessageSquare} label="Rəy" value={pending.testimonials} tone={pending.testimonials ? 'amber' : 'emerald'} onClick={() => nav('/admin/testimonials')} />
      </div>

      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Ümumi statistika</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="İstifadəçi" value={totalUsers} tone="sky" onClick={() => nav('/admin/users')} />
        <StatCard icon={Package} label="Sifariş" value={totalOrders} tone="violet" onClick={() => nav('/admin/orders')} />
        <StatCard icon={TrendingUp} label="Məhsul" value={totalProducts} tone="slate" />
        <StatCard icon={Wallet} label="Gəlir (₼)" value={totalRevenue != null ? Number(totalRevenue).toFixed(2) : null} tone="emerald" />
      </div>
    </div>
  );
};

export default Dashboard;