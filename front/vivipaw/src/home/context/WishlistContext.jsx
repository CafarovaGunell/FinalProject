// src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth(); // AuthContext-dən birbaşa user-i alırıq

  const [wishlist, setWishlist] = useState(() => {
    const savedUserStr = localStorage.getItem('user');
    if (savedUserStr) {
      try {
        const parsedUser = JSON.parse(savedUserStr);
        const key = parsedUser.id || parsedUser.email || 'default_user';
        const savedWishlist = localStorage.getItem(`viviPaw_wishlist_${key}`);
        return savedWishlist ? JSON.parse(savedWishlist) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (!user) {
      setWishlist([]);
    } else {
      const key = user.id || user.email || 'default_user';
      const saved = localStorage.getItem(`viviPaw_wishlist_${key}`);
      setWishlist(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const key = user.id || user.email || 'default_user';
      localStorage.setItem(`viviPaw_wishlist_${key}`, JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const toggleWishlist = (item) => {
    if (!user) return false;

    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((i) => i.id === item.id);
      if (exists) {
        return prevWishlist.filter((i) => i.id !== item.id);
      } else {
        return [...prevWishlist, item];
      }
    });
    return true;
  };

  // Siyahıdan tək-tək silmək üçün funksiya
  const removeFromWishlist = (id) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== id));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist, // <-- BUDUR! Mütləq value içərisində olmalıdır ki, Wishlist səhifəsi onu oxuya bilsin.
        clearWishlist,
        isInWishlist,
        user
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);