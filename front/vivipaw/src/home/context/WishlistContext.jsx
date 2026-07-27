import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistApi } from '../../services/endpoints';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);   // WishListPetDto[]
  const [ids, setIds] = useState([]);             // sürətli yoxlama üçün
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); setIds([]); return; }
    setLoading(true);
    try {
      const [listRes, idsRes] = await Promise.all([
        wishlistApi.list(),
        wishlistApi.ids(),
      ]);
      if (listRes.success) setWishlist(listRes.data || []);
      if (idsRes.success) setIds(idsRes.data || []);
    } catch (e) {
      console.error('Wishlist yüklənmədi:', e);
      setWishlist([]); setIds([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  /** Varsa silir, yoxdursa əlavə edir */
  const toggleWishlist = async (petOrId) => {
    if (!user) return false;
    const petId = typeof petOrId === 'object' ? (petOrId.id ?? petOrId.petId) : petOrId;
    if (!petId) return false;

    // optimistik
    setIds((prev) => prev.includes(petId) ? prev.filter(x => x !== petId) : [...prev, petId]);

    try {
      await wishlistApi.toggle(petId);
      await fetchWishlist();
      return true;
    } catch (e) {
      console.error('Wishlist toggle xətası:', e);
      await fetchWishlist();
      return false;
    }
  };

  const removeFromWishlist = async (petId) => {
    if (!ids.includes(petId)) return;
    await toggleWishlist(petId);
  };

  const clearWishlist = async () => {
    for (const id of [...ids]) {
      try { await wishlistApi.toggle(id); } catch { /* ignore */ }
    }
    await fetchWishlist();
  };

  const isInWishlist = (petId) => ids.includes(petId);

  return (
    <WishlistContext.Provider value={{
      wishlist, ids, loading, user,
      toggleWishlist, removeFromWishlist, clearWishlist, isInWishlist, fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);