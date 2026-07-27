import { createBrowserRouter } from 'react-router-dom';
import Layout from '../home/layout/layout';
import ProtectedRoute from './ProtectedRoute';

import Home from '../home/pages/home';
import Adopt from '../home/pages/adopt';
import PetDetail from '../home/pages/detail';
import PetCare from '../home/pages/petcare';
import About from '../home/pages/about';
import Wishlist from '../home/pages/wishlist';
import Auth from '../home/pages/auth';
import Appointments from '../home/pages/appointments';
import UserProfile from '../home/pages/userprofile';
import Vets from '../home/pages/vets';
import Shop from '../home/pages/shop';
import ProductDetail from '../home/pages/productdetail';
import Basket from '../home/pages/basket';
import MyOrders from '../home/pages/myorders';
import MyRequests from '../home/pages/myrequests';
import Notifications from '../home/pages/notifications';
import Testimonials from '../home/pages/testimonials';

/* ── Admin panel ── */
import AdminLayout from '../home/pages/admin/AdminLayout';
import Dashboard from '../home/pages/admin/Dashboard';
import AdminUsers from '../home/pages/admin/AdminUsers';
// Növbəti mərhələdə bu import-ları aç:
// import AdminShops from '../home/pages/admin/AdminShops';
// import AdminVets from '../home/pages/admin/AdminVets';
// import AdminPets from '../home/pages/admin/AdminPets';
// import AdminTestimonials from '../home/pages/admin/AdminTestimonials';
// import AdminOrders from '../home/pages/admin/AdminOrders';

export const router = createBrowserRouter([
  /* ── ƏSAS SAYT (home layout) ── */
  {
    element: <Layout />,
    path: '/',
    children: [
      { element: <Home />, index: true },
      { element: <Adopt />, path: 'adopt' },
      { element: <PetDetail />, path: 'adopt/:id' },
      { element: <PetCare />, path: 'petcare' },
      { element: <About />, path: 'about' },
      { element: <Auth />, path: 'login' },
      { element: <Auth />, path: 'register' },
      { element: <Vets />, path: 'vets' },
      { element: <Shop />, path: 'shop' },
      { element: <ProductDetail />, path: 'product/:id' },
      { element: <Testimonials />, path: 'testimonials' },

      { element: <ProtectedRoute><Wishlist /></ProtectedRoute>, path: 'wishlist' },
      { element: <ProtectedRoute><Appointments /></ProtectedRoute>, path: 'appointments' },
      { element: <ProtectedRoute><UserProfile /></ProtectedRoute>, path: 'profile' },
      { element: <ProtectedRoute><Basket /></ProtectedRoute>, path: 'basket' },
      { element: <ProtectedRoute><MyOrders /></ProtectedRoute>, path: 'my-orders' },
      { element: <ProtectedRoute><MyRequests /></ProtectedRoute>, path: 'my-requests' },
      { element: <ProtectedRoute><Notifications /></ProtectedRoute>, path: 'notifications' },
    ],
  },

  /* ── ADMİN PANEL (ayrı layout, home navbar YOXDUR) ── */
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['Admin', 'SuperAdmin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'users', element: <AdminUsers /> },
      // Növbəti mərhələdə bunları aç:
      // { path: 'shops', element: <AdminShops /> },
      // { path: 'vets', element: <AdminVets /> },
      // { path: 'pets', element: <AdminPets /> },
      // { path: 'testimonials', element: <AdminTestimonials /> },
      // { path: 'orders', element: <AdminOrders /> },
    ],
  },
]);