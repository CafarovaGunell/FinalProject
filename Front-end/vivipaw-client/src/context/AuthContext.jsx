
import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/endpoints";
import { tokenStore, getError } from "../api/axios";
import { ROLES } from "../utils/constants";
import toast from "react-hot-toast";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved && tokenStore.access) {
      try { setUser(JSON.parse(saved)); } catch { tokenStore.clear(); }
    }
    setLoading(false);
  }, []);

  const persist = (data) => {
    tokenStore.set(data.accessToken, data.refreshToken);
    const u = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      imageUrl: data.imageUrl,
      roles: data.roles || [],
      petShopId: data.petShopId,
      veterinarianProfileId: data.veterinarianProfileId,
      approvalStatus: data.approvalStatus,
    };
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (!res.success) throw new Error(res.message);
    return persist(res.data);
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (!res.success) throw new Error(res.message);
    return persist(res.data);
  };

  const logout = async () => {
    try { await authApi.logout(tokenStore.refresh); } catch { /* ignore */ }
    tokenStore.clear();
    setUser(null);
    toast.success("Çıxış edildi");
  };

  const updateUser = (patch) => {
    const next = { ...user, ...patch };
    localStorage.setItem("user", JSON.stringify(next));
    setUser(next);
  };

  const hasRole = (...roles) => !!user && roles.some((r) => user.roles?.includes(r));

  const value = {
    user, loading, login, register, logout, updateUser, hasRole,
    isAuth: !!user,
    isAdmin: hasRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
    isShop: hasRole(ROLES.PET_SHOP),
    isVet: hasRole(ROLES.VET),
    isCustomer: hasRole(ROLES.CUSTOMER),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { getError };