import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../../services/endpoints';
import { tokenStore, getError } from '../../services/api';
import { ROLES } from '../../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved && tokenStore.access) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        tokenStore.clear();
      }
    }
    setLoading(false);
  }, []);

  /** Backend AuthResponseDto → localStorage + state */
  const persist = (data) => {
    tokenStore.set(data.accessToken, data.refreshToken);
    const u = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      imageUrl: data.imageUrl,
      roles: data.roles || [],
      role: data.roles?.[0] || 'Customer',
      petShopId: data.petShopId,
      veterinarianProfileId: data.veterinarianProfileId,
      approvalStatus: data.approvalStatus,
    };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  /** Oxunaqlı xəta yaradır (auth.jsx onu birbaşa göstərir) */
  const makeError = (err, fallback) => {
    const e = new Error(getError(err, fallback));
    e.handled = true;
    e.fieldErrors = err?.response?.data?.errors;
    throw e;
  };

  const login = async (credentials) => {
    let res;
    try {
      res = await authApi.login(credentials);
    } catch (err) {
      makeError(err, 'Giriş uğursuz oldu.');
    }
    if (!res?.success) {
      const e = new Error(res?.message || 'Giriş uğursuz oldu.');
      e.handled = true;
      throw e;
    }
    return persist(res.data);
  };

  const register = async (payload) => {
    let res;
    try {
      res = await authApi.register(payload);
    } catch (err) {
      makeError(err, 'Qeydiyyat uğursuz oldu.');
    }
    if (!res?.success) {
      const e = new Error(res?.message || 'Qeydiyyat uğursuz oldu.');
      e.handled = true;
      throw e;
    }
    return persist(res.data);
  };

  const logout = async () => {
    try {
      if (tokenStore.refresh) await authApi.logout(tokenStore.refresh);
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    setUser(null);
  };

  const updateUser = (patch) => {
    const next = { ...user, ...patch };
    localStorage.setItem('user', JSON.stringify(next));
    setUser(next);
  };

  const hasRole = (...roles) => !!user && roles.some((r) => user.roles?.includes(r));

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        hasRole,
        isAuth: !!user,
        isAdmin: hasRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
        isShop: hasRole(ROLES.PET_SHOP),
        isVet: hasRole(ROLES.VET),
        isCustomer: hasRole(ROLES.CUSTOMER),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);