import React, { useEffect, useState, useCallback } from 'react';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import { adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { ROLES } from '../../../utils/constants';
import { PageHeader, EmptyBox, Spinner, Avatar, listFrom } from '../../components/admin/ui';

const ROLE_OPTIONS = [
  { v: '', l: 'Bütün rollar' },
  { v: ROLES.SUPER_ADMIN, l: 'SuperAdmin' },
  { v: ROLES.ADMIN, l: 'Admin' },
  { v: ROLES.CUSTOMER, l: 'Customer' },
  { v: ROLES.PET_SHOP, l: 'PetShop' },
  { v: ROLES.VET, l: 'Veterinarian' },
];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.users(role || undefined, search.trim() || undefined).catch(() => null);
    setUsers(listFrom(res));
    setLoading(false);
  }, [role, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 350);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const toggleActive = async (u) => {
    setBusyId(u.id);
    const res = await adminApi.setUserActive(u.id, !u.isActive)
      .catch((e) => ({ success: false, message: getError(e) }));
    showToast(res?.success
      ? (u.isActive ? '🚫 İstifadəçi deaktiv edildi' : '✅ İstifadəçi aktiv edildi')
      : (res?.message || 'Əməliyyat alınmadı'));
    if (res?.success) setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, isActive: !x.isActive } : x)));
    setBusyId(null);
  };

  const roleOf = (u) => (Array.isArray(u.roles) ? u.roles.join(', ') : (u.role || u.roles || '—'));

  return (
    <div>
      <PageHeader title="İstifadəçilər" subtitle={`${users.length} istifadəçi`} />

      {toast && <div className="fixed top-20 right-6 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ad, e-poçt axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer">
          {ROLE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
      ) : users.length === 0 ? (
        <EmptyBox text="İstifadəçi tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">İstifadəçi</th>
                  <th className="px-5 py-3.5">Rol</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Şəhər</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullName || u.email} src={u.imageUrl} />
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName || u.userName}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-1 w-fit">
                        <Shield size={10} /> {roleOf(u)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-semibold hidden md:table-cell">{u.city || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => toggleActive(u)} disabled={busyId === u.id}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600'
                            : 'bg-rose-50 text-rose-600 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}>
                        {busyId === u.id ? <Spinner small /> : u.isActive ? <><UserCheck size={13} /> Aktiv</> : <><UserX size={13} /> Deaktiv</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;