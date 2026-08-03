import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuStore,
  LuStethoscope,
  LuPawPrint,
  LuMessageSquare,
  LuUsers,
  LuPackage,
  LuWalletCards,
  LuTrendingUp,
  LuHeart,
  LuClipboardList,
  LuCalendarCheck,
  LuNewspaper,
  LuShoppingCart,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { formatPrice } from '../../../utils/helpers';
import { PageHeader, StatCard, listFrom } from '../../components/admin/ui';

const pick = (d, keys, fallback = 0) => {
  for (const k of keys) {
    if (d?.[k] !== undefined && d?.[k] !== null) return d[k];
  }
  return fallback;
};

const num = (v) => Number(v ?? 0) || 0;

const APPOINTMENT_COMPLETED = 3;

const appointmentAmount = (a) =>
  num(a?.priceSnapshot ?? a?.servicePrice ?? a?.price ?? a?.totalPrice);

const isCompletedAppointment = (a) => {
  const text = String(a?.statusText || '').toLowerCase();
  return Number(a?.status) === APPOINTMENT_COMPLETED ||
    text.includes('completed') ||
    text.includes('tamam');
};

const Dashboard = () => {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [pending, setPending] = useState({
    shops: 0,
    vets: 0,
    pets: 0,
    testimonials: 0,
  });

  const [appointments, setAppointments] = useState([]);
  const [adoptedList, setAdoptedList] = useState([]);

  useEffect(() => {
    (async () => {
      const [d, s, v, p, t, appts, adopted] = await Promise.all([
        adminApi.dashboard().catch(() => null),
        adminApi.shops(1).catch(() => null),
        adminApi.vets(1).catch(() => null),
        adminApi.pendingPets(1, 60).catch(() => null),
        adminApi.pendingTestimonials().catch(() => null),
        adminApi.appointments?.().catch(() => null),
        adminApi.adoptedPets?.().catch(() => null),
      ]);

      setStats(d?.success ? d.data : null);

      setPending({
        shops: listFrom(s).length,
        vets: listFrom(v).length,
        pets: listFrom(p).length,
        testimonials: listFrom(t).length,
      });

      setAppointments(listFrom(appts));
      setAdoptedList(listFrom(adopted));

      setLoading(false);
    })();
  }, []);

  const d = stats || {};

  const totalUsers = pick(d, ['totalUsers', 'TotalUsers', 'userCount', 'users']);
  const totalOrders = pick(d, ['totalOrders', 'TotalOrders', 'orderCount', 'orders']);
  const totalProducts = pick(d, ['totalProducts', 'TotalProducts', 'productCount', 'products']);

  // Backend-də bu yalnız Delivered order-lərdən hesablanır.
  const shopRevenue = num(pick(d, ['totalRevenue', 'TotalRevenue', 'revenue', 'totalSales'], 0));

  const vetRevenue = useMemo(() => {
    return appointments
      .filter(isCompletedAppointment)
      .reduce((sum, a) => sum + appointmentAmount(a), 0);
  }, [appointments]);

  const platformRevenue = shopRevenue + vetRevenue;

  const totalPets = pick(d, ['totalPets', 'TotalPets', 'petCount', 'pets']);
  const availablePets = pick(d, ['availablePets', 'AvailablePets']);
  const adoptedPetsFromDashboard = pick(d, ['adoptedPets', 'AdoptedPets'], 0);
  const adoptedPets = Math.max(num(adoptedPetsFromDashboard), adoptedList.length);

  const totalAdoptionRequests = pick(d, [
    'totalAdoptionRequests',
    'TotalAdoptionRequests',
    'adoptionRequests',
  ]);

  const totalAppointments = Math.max(
    num(pick(d, ['totalAppointments', 'TotalAppointments'], 0)),
    appointments.length
  );

  const upcomingAppointments = pick(d, [
    'upcomingAppointments',
    'UpcomingAppointments',
  ]);

  const totalArticles = pick(d, [
    'totalArticles',
    'TotalArticles',
    'articleCount',
    'articles',
  ]);

  const totalCustomers = pick(d, ['totalCustomers', 'TotalCustomers']);
  const totalPetShops = pick(d, ['totalPetShops', 'TotalPetShops']);
  const totalVets = pick(d, ['totalVets', 'TotalVets']);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platformanın ümumi vəziyyəti" />

      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Təsdiq gözləyən
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={LuStore}
          label="Mağaza ərizəsi"
          value={pending.shops}
          tone={pending.shops ? 'amber' : 'emerald'}
          onClick={() => nav('/admin/shops')}
        />

        <StatCard
          icon={LuStethoscope}
          label="Baytar ərizəsi"
          value={pending.vets}
          tone={pending.vets ? 'amber' : 'emerald'}
          onClick={() => nav('/admin/vets')}
        />

        <StatCard
          icon={LuPawPrint}
          label="Heyvan elanı"
          value={pending.pets}
          tone={pending.pets ? 'amber' : 'emerald'}
          onClick={() => nav('/admin/pets')}
        />

        <StatCard
          icon={LuMessageSquare}
          label="Rəy"
          value={pending.testimonials}
          tone={pending.testimonials ? 'amber' : 'emerald'}
          onClick={() => nav('/admin/testimonials')}
        />
      </div>

      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Ticarət və gəlir
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={LuShoppingCart}
          label="Sifariş"
          value={totalOrders}
          tone="violet"
          onClick={() => nav('/admin/orders')}
        />

        <StatCard
          icon={LuPackage}
          label="Məhsul"
          value={totalProducts}
          tone="slate"
          onClick={() => nav('/admin/products')}
        />

        <StatCard
          icon={LuStore}
          label="Mağaza satış həcmi"
          value={formatPrice(shopRevenue)}
          tone="sky"
          onClick={() => nav('/admin/revenue')}
        />

        <StatCard
          icon={LuWalletCards}
          label="Ümumi platforma həcmi"
          value={formatPrice(platformRevenue)}
          tone="emerald"
          onClick={() => nav('/admin/revenue')}
        />
      </div>

      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Heyvan və sahiblənmə
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={LuPawPrint}
          label="Ümumi heyvan"
          value={totalPets}
          tone="sky"
          onClick={() => nav('/admin/all-pets')}
        />

        <StatCard
          icon={LuHeart}
          label="Sahiblənilən"
          value={adoptedPets}
          tone="emerald"
          onClick={() => nav('/admin/adopted-pets')}
        />

        <StatCard
          icon={LuClipboardList}
          label="Sahiblənmə müraciəti"
          value={totalAdoptionRequests}
          tone="violet"
          onClick={() => nav('/admin/adoption-requests')}
        />

        <StatCard
          icon={LuPawPrint}
          label="Mövcud heyvan"
          value={availablePets}
          tone="amber"
          onClick={() => nav('/admin/all-pets')}
        />
      </div>

      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Baytar və məzmun
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={LuCalendarCheck}
          label="Randevu"
          value={totalAppointments}
          tone="sky"
          onClick={() => nav('/admin/appointments')}
        />

        <StatCard
          icon={LuCalendarCheck}
          label="Yaxınlaşan randevu"
          value={upcomingAppointments}
          tone="amber"
          onClick={() => nav('/admin/appointments')}
        />

        <StatCard
          icon={LuStethoscope}
          label="Baytar xidmət həcmi"
          value={formatPrice(vetRevenue)}
          tone="violet"
          onClick={() => nav('/admin/revenue')}
        />

        <StatCard
          icon={LuNewspaper}
          label="Məqalə"
          value={totalArticles}
          tone="slate"
          onClick={() => nav('/admin/articles')}
        />
      </div>

      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        İstifadəçilər
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={LuUsers}
          label="Ümumi istifadəçi"
          value={totalUsers}
          tone="sky"
          onClick={() => nav('/admin/users')}
        />

        <StatCard
          icon={LuUsers}
          label="Customer"
          value={totalCustomers}
          tone="slate"
          onClick={() => nav('/admin/users')}
        />

        <StatCard
          icon={LuStore}
          label="PetShop"
          value={totalPetShops}
          tone="slate"
          onClick={() => nav('/admin/users')}
        />

        <StatCard
          icon={LuStethoscope}
          label="Vet"
          value={totalVets}
          tone="slate"
          onClick={() => nav('/admin/users')}
        />
      </div>
    </div>
  );
};

export default Dashboard;