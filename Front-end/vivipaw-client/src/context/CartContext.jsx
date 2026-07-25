
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/endpoints";
import { tokenStore, getError } from "../api/axios";
import { ROLES } from "../utils/constants";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { isAuth } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuth) return setCart(null);
    try {
      setLoading(true);
      const res = await cartApi.get();
      if (res.success) setCart(res.data);
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  useEffect(() => { refresh(); }, [refresh]);

  const count = cart?.totalItems || 0;

  return (
    <CartContext.Provider value={{ cart, count, loading, refresh, setCart }}>
      {children}
    </CartContext.Provider>
  );
}