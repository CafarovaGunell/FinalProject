import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartApi } from '../../services/endpoints';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setCart(null); return; }
    setLoading(true);
    try {
      const res = await cartApi.get();
      if (res.success) setCart(res.data);
    } catch (e) {
      console.error('Səbət yüklənmədi:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await cartApi.add({ productId, quantity });
    if (res.success) setCart(res.data);
    return res;
  };

  const updateItem = async (itemId, quantity) => {
    const res = await cartApi.updateItem(itemId, quantity);
    if (res.success) setCart(res.data);
    return res;
  };

  const removeItem = async (itemId) => {
    const res = await cartApi.removeItem(itemId);
    if (res.success) setCart(res.data);
    return res;
  };

  const clearCart = async () => {
    await cartApi.clear();
    await refresh();
  };

  return (
    <CartContext.Provider value={{
      cart, loading,
      count: cart?.totalItems || 0,
      subTotal: cart?.subTotal || 0,
      refresh, addToCart, updateItem, removeItem, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);