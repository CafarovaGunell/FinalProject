import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
};

const Layout = () => (
  <div className="flex flex-col min-h-screen bg-white">
    <ScrollToTop />
    <Navbar />
    <main className="flex-1"><Outlet /></main>
    <Footer />
  </div>
);

export default Layout;