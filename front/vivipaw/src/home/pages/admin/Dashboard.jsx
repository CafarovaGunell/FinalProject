import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuStore,
  LuStethoscope,
  LuPawPrint,
  LuMessageSquare,
  LuUsers,
  LuWalletCards,
  LuHeart,
  LuClipboardList,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { formatPrice } from '../../../utils/helpers';
import { PageHeader, StatCard, listFrom } from '../../components/admin/ui';

const ORDER_DELIVERED = 5;
const APPOINTMENT_COMPLETED = 3;

const num = (value) => Number(value ?? 0) || 0;

const pick = (data, keys, fallback = 0) => {
  for (const key of keys) {
    if (data?.[key] !== undefined && data?.[key] !== null) {
      return data[key];
    }
  }

  return fallback;
};

const orderAmount = (order) =>
  num(
    order?.totalAmount ??
    order?.total ??
    order?.amount ??
    order?.price
  );

const appointmentAmount = (appointment) =>
  num(
    appointment?.priceSnapshot ??
    appointment?.servicePrice ??
    appointment?.price ??
    appointment?.totalPrice
  );

const isDeliveredOrder = (order) => {
  const text = String(order?.statusText || '').toLowerCase();

  return (
    Number(order?.status) === ORDER_DELIVERED ||
    text.includes('delivered') ||
    text.includes('çatdırıldı') ||
    text.includes('çatdır')
  );
};

const isCompletedAppointment = (appointment) => {
  const text = String(appointment?.statusText || '').toLowerCase();

  return (
    Number(appointment?.status) === APPOINTMENT_COMPLETED ||
    text.includes('completed') ||
    text.includes('tamamlandı') ||
    text.includes('tamam')
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [dashboardStats, setDashboardStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [adoptedPets, setAdoptedPets] = useState([]);

  const [pending, setPending] = useState({
    shops: 0,
    vets: 0,
    pets: 0,
    testimonials: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      try {
        const [
          dashboardResponse,
          pendingShopsResponse,
          pendingVetsResponse,
          pendingPetsResponse,
          pendingTestimonialsResponse,
          ordersResponse,
          appointmentsResponse,
          adoptionRequestsResponse,
          usersResponse,
          adoptedPetsResponse,
        ] = await Promise.all([
          adminApi.dashboard().catch(() => null),

          /* Pending status = 1 */
          adminApi.shops(1).catch(() => null),
          adminApi.vets(1).catch(() => null),
          adminApi.pendingPets(1, 100).catch(() => null),
          adminApi.pendingTestimonials().catch(() => null),

          /* Gəlir və ümumi statistikalar */
          adminApi.orders().catch(() => null),
          adminApi.appointments?.().catch(() => null),
          adminApi.adoptionRequests?.().catch(() => null),
          adminApi.users?.().catch(() => null),
          adminApi.adoptedPets?.().catch(() => null),
        ]);

        setDashboardStats(
          dashboardResponse?.success
            ? dashboardResponse.data || {}
            : {}
        );

        setPending({
          shops: listFrom(pendingShopsResponse).length,
          vets: listFrom(pendingVetsResponse).length,
          pets: listFrom(pendingPetsResponse).length,
          testimonials: listFrom(pendingTestimonialsResponse).length,
        });

        setOrders(listFrom(ordersResponse));
        setAppointments(listFrom(appointmentsResponse));
        setAdoptionRequests(listFrom(adoptionRequestsResponse));
        setUsers(listFrom(usersResponse));
        setAdoptedPets(listFrom(adoptedPetsResponse));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* Yalnız çatdırılan sifarişlərin cəmi */
  const shopRevenue = useMemo(() => {
    return orders
      .filter(isDeliveredOrder)
      .reduce((sum, order) => sum + orderAmount(order), 0);
  }, [orders]);

  /* Yalnız tamamlanan randevuların cəmi */
  const vetRevenue = useMemo(() => {
    return appointments
      .filter(isCompletedAppointment)
      .reduce(
        (sum, appointment) => sum + appointmentAmount(appointment),
        0
      );
  }, [appointments]);

  const platformRevenue = shopRevenue + vetRevenue;

  /*
    Endpoint işləyirsə adoptionRequests.length real saydır.
    Endpoint boş/dəstəksizdirsə dashboard stat fallback olur.
  */
  const totalAdoptionRequests = Math.max(
    adoptionRequests.length,
    num(
      pick(
        dashboardStats,
        [
          'totalAdoptionRequests',
          'TotalAdoptionRequests',
          'adoptionRequests',
        ],
        0
      )
    )
  );

  /*
    adoptedPets endpoint işləyirsə onun sayını göstərir.
    Əks halda dashboard API-dan adoptedPets götürülür.
  */
  const totalAdoptedPets = Math.max(
    adoptedPets.length,
    num(
      pick(
        dashboardStats,
        ['adoptedPets', 'AdoptedPets', 'totalAdoptedPets'],
        0
      )
    )
  );

  /*
    adminApi.users() nəticəsi yoxdursa dashboard API fallback olur.
  */
  const totalUsers = Math.max(
    users.length,
    num(
      pick(
        dashboardStats,
        ['totalUsers', 'TotalUsers', 'userCount', 'users'],
        0
      )
    )
  );

  if (loading) {
    return (
      <div className="space-y-7">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Platformanın ümumi vəziyyəti"
      />

      {/* TƏSDİQ GÖZLƏYƏNLƏR */}
      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Təsdiq gözləyən
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={LuStore}
          label="Mağaza ərizəsi"
          value={pending.shops}
          tone={pending.shops > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/admin/shops')}
        />

        <StatCard
          icon={LuStethoscope}
          label="Baytar ərizəsi"
          value={pending.vets}
          tone={pending.vets > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/admin/vets')}
        />

        <StatCard
          icon={LuPawPrint}
          label="Heyvan elanı"
          value={pending.pets}
          tone={pending.pets > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/admin/pets')}
        />

        <StatCard
          icon={LuMessageSquare}
          label="Rəy"
          value={pending.testimonials}
          tone={pending.testimonials > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/admin/testimonials')}
        />
      </div>

      {/* PLATFORM STATİSTİKASI */}
      <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
        Platforma statistikası
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={LuWalletCards}
          label="Ümumi platforma həcmi"
          value={formatPrice(platformRevenue)}
          tone="emerald"
          onClick={() => navigate('/admin/revenue')}
        />

        <StatCard
          icon={LuHeart}
          label="Sahiblənilən"
          value={totalAdoptedPets}
          tone="emerald"
          onClick={() => navigate('/admin/all-pets')}
        />

        <StatCard
          icon={LuClipboardList}
          label="Sahiblənmə müraciətləri"
          value={totalAdoptionRequests}
          tone="violet"
          onClick={() => navigate('/admin/adoption-requests')}
        />

        <StatCard
          icon={LuUsers}
          label="Ümumi istifadəçilər"
          value={totalUsers}
          tone="sky"
          onClick={() => navigate('/admin/users')}
        />
      </div>
    </div>
  );
};

export default Dashboard;