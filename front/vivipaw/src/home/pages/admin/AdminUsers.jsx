import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuSearch,
  LuUserCheck,
  LuUserX,
  LuShield,
  LuTrash2,
  LuUserPlus,
  LuCheck,
  LuLock,
  LuRefreshCw,
} from 'react-icons/lu';
import { adminApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, EmptyBox, Spinner, Avatar, Modal, listFrom } from '../../components/admin/ui';

const ROLE_OPTIONS = [
  { v: '', l: 'Bütün rollar' },
  { v: 'SuperAdmin', l: 'SuperAdmin' },
  { v: 'Admin', l: 'Admin' },
  { v: 'Customer', l: 'Customer' },
  { v: 'PetShop', l: 'PetShop' },
  { v: 'Veterinarian', l: 'Veterinarian' },
];

const ASSIGNABLE = ROLE_OPTIONS.filter((o) => o.v);

const ACTIVE_OPTIONS = [
  { v: '', l: 'Aktiv + Deaktiv' },
  { v: 'active', l: 'Yalnız aktiv' },
  { v: 'inactive', l: 'Yalnız deaktiv' },
];

const roleTone = (r) => {
  if (r === 'SuperAdmin') return 'bg-violet-50 text-violet-600';
  if (r === 'Admin') return 'bg-sky-50 text-sky-600';
  if (r === 'PetShop') return 'bg-emerald-50 text-emerald-600';
  if (r === 'Veterinarian') return 'bg-teal-50 text-teal-600';
  return 'bg-slate-100 text-slate-600';
};

const AdminUsers = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const me = auth?.user;

  const isSuperAdmin = useMemo(() => {
    const raw = auth?.roles ?? me?.roles ?? me?.role ?? [];
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.some((r) => String(r).toLowerCase() === 'superadmin');
  }, [auth, me]);

  const myId = me?.id ?? me?.userId ?? me?.Id;

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [activeF, setActiveF] = useState('');

  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState('');

  const [roleModal, setRoleModal] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 3000);
  };

  const rolesOf = (u) => (
    Array.isArray(u.roles) && u.roles.length
      ? u.roles
      : (u.role ? [u.role] : [])
  );

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    let res = await adminApi.users().catch(() => null);
    let list = listFrom(res);

    const hasRoles = list.some((u) => (
      (Array.isArray(u.roles) && u.roles.length) || u.role
    ));

    if (list.length === 0 || !hasRoles) {
      const roleNames = ASSIGNABLE.map((o) => o.v);
      const results = await Promise.all(
        roleNames.map((r) => adminApi.users(r).catch(() => null))
      );

      const map = new Map();

      results.forEach((r, i) => {
        listFrom(r).forEach((u) => {
          const ex = map.get(u.id) || {
            ...u,
            roles: Array.isArray(u.roles) && u.roles.length ? [...u.roles] : [],
          };

          if (!ex.roles.includes(roleNames[i])) {
            ex.roles.push(roleNames[i]);
          }

          map.set(u.id, ex);
        });
      });

      if (map.size > 0) list = [...map.values()];
    }

    // ✅ arxivlənmiş/silinmiş istifadəçilər admin siyahısında görünməsin
    list = list.filter((x) => !String(x.email || '').startsWith('deleted_'));

    setAll(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return all.filter((u) => {
      const matchQ = !q ||
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.userName || '').toLowerCase().includes(q) ||
        (u.phoneNumber || '').toLowerCase().includes(q);

      const matchR = !role || rolesOf(u).includes(role);

      const matchA = !activeF ||
        (activeF === 'active' ? !!u.isActive : !u.isActive);

      return matchQ && matchR && matchA;
    });
  }, [all, search, role, activeF]);

  const toggleActive = async (u) => {
    setBusyId(u.id);

    const res = await adminApi.setUserActive(u.id, !u.isActive)
      .catch((e) => ({ success: false, message: getError(e) }));

    showToast(
      res?.success
        ? (u.isActive ? '🚫 İstifadəçi deaktiv edildi' : '✅ İstifadəçi aktiv edildi')
        : (res?.message || 'Əməliyyat alınmadı')
    );

    if (res?.success) {
      setAll((l) => l.map((x) => (
        x.id === u.id ? { ...x, isActive: !x.isActive } : x
      )));
    }

    setBusyId(null);
  };

  const saveRole = async () => {
    if (!roleModal?.newRole) return;

    setBusy(true);

    try {
      const res = await adminApi.setUserRole(roleModal.user.id, roleModal.newRole);

      if (res?.success) {
        setAll((l) => l.map((x) => (
          x.id === roleModal.user.id
            ? { ...x, roles: [roleModal.newRole], role: roleModal.newRole }
            : x
        )));

        showToast(`✅ Rol dəyişdirildi: ${roleModal.newRole}`);
        setRoleModal(null);
      } else {
        showToast(res?.message || 'Rol dəyişdirilmədi');
      }
    } catch (e) {
      console.error('SET ROLE ERROR:', e?.response?.status, e?.response?.data);

      showToast(
        e?.response?.data?.message ||
        (e?.response?.status === 403 ? '⛔ Yalnız SuperAdmin rol dəyişə bilər' : '') ||
        getError(e) ||
        'Rol dəyişdirilmədi'
      );
    }

    setBusy(false);
  };

  const doDelete = async () => {
    if (!confirmDel) return;

    setBusy(true);

    try {
      const res = await adminApi.deleteUser(confirmDel.id);

      if (res?.success) {
        setAll((l) => l.filter((x) => x.id !== confirmDel.id));
        showToast('🗑️ İstifadəçi silindi');
        setConfirmDel(null);
      } else {
        showToast(res?.message || 'Silinmədi');
      }
    } catch (e) {
      console.error('DELETE USER ERROR:', e?.response?.status, e?.response?.data);

      showToast(
        e?.response?.data?.message ||
        e?.response?.data?.errors?.[0] ||
        getError(e) ||
        'Silinmədi'
      );
    }

    setBusy(false);
  };

  return (
    <div>
      <PageHeader title="İstifadəçilər" subtitle={`${filtered.length} / ${all.length} istifadəçi`}>
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition"
        >
          <LuUserPlus size={14} />
          İstifadəçi əlavə et
        </button>
      </PageHeader>

      {toast && (
        <div className="fixed top-20 right-6 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      {!isSuperAdmin && (
        <div className="mb-4 flex items-center gap-2 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <LuLock size={14} />
          Rol dəyişmək icazəsi yalnız SuperAdmin-dədir. Siz rolları yalnız görə bilərsiniz.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, e-poçt, telefon axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.v} value={o.v}>{o.l}</option>
          ))}
        </select>

        <select
          value={activeF}
          onChange={(e) => setActiveF(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          {ACTIVE_OPTIONS.map((o) => (
            <option key={o.v} value={o.v}>{o.l}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyBox text="Axtarışa uyğun istifadəçi tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">İstifadəçi</th>
                  <th className="px-5 py-3.5">Cari rol</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Şəhər</th>
                  <th className="px-5 py-3.5 text-center">Rolu dəyiş</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                  <th className="px-5 py-3.5 text-right w-16">Sil</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => {
                  const rs = rolesOf(u);
                  const isMe = myId != null && String(myId) === String(u.id);
                  const canChange = isSuperAdmin && !isMe;

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.fullName || u.email} src={u.imageUrl} />
                          <div>
                            <p className="font-bold text-slate-900">
                              {u.fullName || u.userName || '—'}
                              {isMe && (
                                <span className="ml-2 text-[10px] font-black text-sky-600">
                                  (siz)
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 font-semibold">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {rs.length ? rs.map((r) => (
                            <span
                              key={r}
                              className={`text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit ${roleTone(r)}`}
                            >
                              <LuShield size={10} />
                              {r}
                            </span>
                          )) : (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-500 font-semibold hidden md:table-cell">
                        {u.city || '—'}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => canChange && setRoleModal({
                            user: u,
                            newRole: rs[0] || '',
                          })}
                          disabled={!canChange}
                          title={
                            !isSuperAdmin
                              ? 'Yalnız SuperAdmin dəyişə bilər'
                              : isMe
                                ? 'Öz rolunuzu dəyişə bilməzsiniz'
                                : 'Rolu dəyiş'
                          }
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition ${
                            canChange
                              ? 'border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100'
                              : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          {canChange ? <LuRefreshCw size={12} /> : <LuLock size={12} />}
                          Dəyiş
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={busyId === u.id || isMe}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600'
                              : 'bg-rose-50 text-rose-600 hover:bg-emerald-50 hover:text-emerald-600'
                          }`}
                        >
                          {busyId === u.id ? (
                            <Spinner small />
                          ) : u.isActive ? (
                            <>
                              <LuUserCheck size={13} />
                              Aktiv
                            </>
                          ) : (
                            <>
                              <LuUserX size={13} />
                              Deaktiv
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {!u.isActive && !isMe ? (
                          <button
                            onClick={() => setConfirmDel(u)}
                            title="Sil"
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <LuTrash2 size={15} />
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title="Rolu dəyiş">
        {roleModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
              <Avatar
                name={roleModal.user.fullName || roleModal.user.email}
                src={roleModal.user.imageUrl}
              />
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {roleModal.user.fullName || roleModal.user.userName || '—'}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {roleModal.user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ASSIGNABLE.map((o) => {
                const selected = roleModal.newRole === o.v;

                return (
                  <button
                    key={o.v}
                    onClick={() => setRoleModal({ ...roleModal, newRole: o.v })}
                    className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                      selected
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <LuShield size={12} />
                      {o.l}
                    </span>
                    {selected && <LuCheck size={14} />}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Mövcud rollar silinib yeni rol təyin olunacaq.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRoleModal(null)}
                className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                İmtina
              </button>
              <button
                onClick={saveRole}
                disabled={busy || !roleModal.newRole}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition disabled:opacity-50"
              >
                {busy ? <Spinner small /> : <LuCheck size={14} />}
                Yadda saxla
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="İstifadəçini sil">
        <p className="text-sm font-semibold text-slate-600">
          <span className="font-black text-slate-900">
            {confirmDel?.fullName || confirmDel?.email}
          </span>{' '}
          silinəcək.
        </p>

       

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => setConfirmDel(null)}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            İmtina
          </button>
          <button
            onClick={doDelete}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50"
          >
            {busy ? <Spinner small /> : <LuTrash2 size={14} />}
            Bəli, sil
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;