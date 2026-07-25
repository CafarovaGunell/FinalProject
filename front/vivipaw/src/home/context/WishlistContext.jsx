import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API from '../../services/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Siyahını çəkən funksiyanı kənara çıxarırıq ki, istədiyimiz zaman yenidən çağırabilək
  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const response = await API.get('/Wishlist');
      const raw = response.data;
      
      let items = [];
      if (Array.isArray(raw)) {
        items = raw;
      } else if (raw && Array.isArray(raw.$values)) {
        items = raw.$values;
      } else if (raw && Array.isArray(raw.items)) {
        items = raw.items;
      }

      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const petId = item.petId || item.animalId || item.id;
          if (item.pet || (item.name && item.imageUrl)) {
            return item;
          }

          try {
            const petRes = await API.get(`/Animals/${petId}`);
            return {
              ...item,
              pet: petRes.data
            };
          } catch (err) {
            return item;
          }
        })
      );

      setWishlist(enrichedItems);
    } catch (error) {
      console.error("Wishlist məlumatları yüklənərkən xəta:", error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (item) => {
    if (!user) return false;

    const petId = item.id || item.petId;
    try {
      await API.post('/Wishlist', { petId: petId, PetId: petId });
      
      // Əməliyyat bitən kimi siyahını avtomatik yenidən çəkirik
      await fetchWishlist();
      return true;
    } catch (error) {
      console.error("Wishlist yenilənərkən xəta:", error);
      return false;
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await API.delete(`/Wishlist/${id}`).catch(() => {
        return API.post('/Wishlist', { petId: id, PetId: id });
      });

      // Siyahıdan dərhal silirik və ya yenidən çəkirik
      setWishlist((prevWishlist) => prevWishlist.filter((item) => {
        const itemId = item.petId || item.animalId || (item.pet && item.pet.id) || item.id;
        return itemId !== id;
      }));
    } catch (error) {
      console.error("Məhsul silinərkən xəta:", error);
    }
  };

  const clearWishlist = async () => {
    try {
      await API.delete('/Wishlist').catch(async () => {
        for (const item of wishlist) {
          const id = item.petId || item.animalId || (item.pet && item.pet.id) || item.id;
          await API.delete(`/Wishlist/${id}`).catch(() => {});
        }
      });
      setWishlist([]);
    } catch (error) {
      console.error("Wishlist təmizlənərkən xəta:", error);
    }
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => {
      const itemId = item.petId || item.animalId || (item.pet && item.pet.id) || item.id;
      return itemId === id;
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        loading,
        user
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);