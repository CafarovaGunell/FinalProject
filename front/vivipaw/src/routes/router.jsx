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
import MyPets from '../home/pages/mypets';
import Messages from '../home/pages/Messages';

/* ── Admin panel ── */
import AdminLayout from '../home/pages/admin/AdminLayout';
import Dashboard from '../home/pages/admin/Dashboard';
import AdminUsers from '../home/pages/admin/AdminUsers';

import AdminShops from '../home/pages/admin/AdminShops';
import AdminVets from '../home/pages/admin/AdminVets';
import AdminPets from '../home/pages/admin/AdminPets';
import AdminTestimonials from '../home/pages/admin/AdminTestimonials';
import AdminOrders from '../home/pages/admin/AdminOrders';
import AdminAdoptedPets from '../home/pages/admin/AdminAdoptedPets';
import AdminProducts from '../home/pages/admin/AdminProducts';
import AdminRevenue from '../home/pages/admin/AdminRevenue';
import AdminArticles from '../home/pages/admin/AdminArticles';
import AdminAllPets from '../home/pages/admin/AdminAllPets';
import AdminAdoptionRequests from '../home/pages/admin/AdminAdoptionRequests';
import AdminAppointments from '../home/pages/admin/AdminAppointments';


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
      { element: <ProtectedRoute><MyPets /></ProtectedRoute>, path: 'my-pets' },
      { element: <ProtectedRoute><Messages /></ProtectedRoute>, path: '/messages' },
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
     
      { path: 'shops', element: <AdminShops /> },
      { path: 'vets', element: <AdminVets /> },
      { path: 'pets', element: <AdminPets /> },
      { path: 'testimonials', element: <AdminTestimonials /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'adminadoptedpets', element: <AdminAdoptedPets /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'revenue', element: <AdminRevenue /> },
      { path: 'all-pets', element: <AdminAllPets /> },
      { path: 'articles', element: <AdminArticles /> },
      { path: 'adoption-requests', element: <AdminAdoptionRequests /> },
      { path: 'appointments', element: <AdminAppointments /> },
    
    ],
  },
]);