import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, BellOff, CheckCheck, Trash2, HeartHandshake, CalendarCheck,
  Package, ShieldCheck, Info,
} from 'lucide-react';
import { notificationApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';

/* Type: 1=AdoptionReq 2=AdoptionAns 3=ApptCreated 4=ApptStatus 5=OrderStatus 6=AccountApproved 7=System */
const TYPE_META = {
  1: { icon: HeartHandshake, cls: 'bg-indigo-50 text-indigo-600' },
  2: { icon: HeartHandshake, cls: 'bg-emerald-50 text-emerald-600' },
  3: { icon: CalendarCheck,  cls: 'bg-emerald-50 text-emerald-600' },
  4: { icon: CalendarCheck,  cls: 'bg-sky-50 text-sky-600' },
  5: { icon: Package,        cls: 'bg-sky-50 text-sky-600' },
  6: { icon: ShieldCheck,    cls: 'bg-emerald-50 text-emerald-600' },
  7: { icon: Info,           cls: 'bg-slate-100 text-slate-500' },
};

const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'İndicə';
  if (m < 60) return `${m} dəq əvvəl`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat əvvəl`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} gün əvvəl`;
  return new Date(d).toLocaleDateString('az-AZ');
};

const Notifications = () => {
  const navigate = useNavigate();
  const { isShop, isVet } = useAuth();   // ✅ rol əsaslı yönləndirmə üçün
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actingId, setActingId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };
  const ping = () => window.dispatchEvent(new Event('vivipaw:notifications'));

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.list(filter === 'unread');
      const data = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      setList([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.error('Bildirişlər yüklənmədi:', e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  /* ✅ Backend-in redirectUrl-inə güvənmirik — tip+rol əsaslı təhlükəsiz ünvan */
  const targetUrl = (n) => {
    switch (n.type) {
      case 1: return isShop ? '/profile?panel=shop&tab=adoptions' : '/my-pets';   // yeni müraciət → sahiblənmə müraciətləri
      case 2: return '/my-requests';                                               // müraciət cavabı
      case 3: return '/profile?panel=vet&tab=appts';                               // yeni randevu → baytar paneli
      case 4: return '/appointments';                                              // randevu statusu
      case 5: return isShop ? '/profile?panel=shop&tab=orders' : '/my-orders';     // sifariş
      case 6: return '/profile';                                                   // hesab təsdiqi
      case 7: {
        const u = n.redirectUrl || '';
        if (u.startsWith('/pets/')) return '/adopt/' + u.replace('/pets/', '');    // köhnə /pets/id → /adopt/id
        const safe = ['/testimonials', '/my-orders', '/my-requests', '/appointments', '/my-pets', '/profile', '/shop', '/adopt', '/vets'];
        return safe.includes(u) ? u : null;                                        // naməlum → heç yerə getmə
      }
      default: return null;
    }
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      setList((p) => p.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      try { await notificationApi.read(n.id); ping(); } catch { /* ignore */ }
    }
    const url = targetUrl(n);
    if (url) navigate(url);   // ✅ url yoxdursa sadəcə oxunmuş olur, error vermir
  };

  const readAll = async () => {
    try {
      const res = await notificationApi.readAll();
      if (res?.success) {
        setList((p) => p.map((x) => ({ ...x, isRead: true })));
        showToast('✅ Hamısı oxunmuş edildi');
        ping();
      }
    } catch (e) {
      showToast(getError(e, 'Xəta baş verdi.'));
    }
  };

  const remove = async (e, n) => {
    e.stopPropagation();
    setActingId(n.id);
    try {
      const res = await notificationApi.remove(n.id);
      if (res?.success) {
        setList((p) => p.filter((x) => x.id !== n.id));
        showToast('Bildiriş silindi');
        ping();
      }
    } catch (err) {
      showToast(getError(err, 'Silinmədi.'));
    } finally {
      setActingId(null);
    }
  };

  const unreadCount = list.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 space-y-6">
        {/* BAŞLIQ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 relative">
              <Bell className="w-7 h-7" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] min-w-[20px] h-5 px-1 rounded-full grid place-items-center font-black shadow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Bildirişlər</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} oxunmamış bildiriş` : 'Hamısı oxunub'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button onClick={readAll}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-3 rounded-xl transition shadow-sm">
              <CheckCheck size={16} className="text-emerald-600" /> Hamısını oxunmuş et
            </button>
          )}
        </div>

        {/* FİLTR */}
        <div className="flex gap-2">
          {[{ v: 'all', l: 'Hamısı' }, { v: 'unread', l: 'Oxunmamış' }].map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold transition ${
                filter === v ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}>{l}</button>
          ))}
        </div>

        {/* SİYAHı */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />)}</div>
        ) : list.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-14 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full grid place-items-center mx-auto">
              <BellOff size={30} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {filter === 'unread' ? 'Oxunmamış bildiriş yoxdur' : 'Bildiriş yoxdur'}
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Yeni hadisələr baş verəndə — müraciət cavabı, sifariş statusu, randevu — buradan xəbərdar olacaqsınız.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META[7];
              const Icon = meta.icon;
              return (
                <div key={n.id} onClick={() => handleClick(n)}
                  className={`group cursor-pointer rounded-2xl border p-4 flex gap-4 transition hover:shadow-md ${
                    n.isRead ? 'bg-white border-slate-200' : 'bg-amber-50/50 border-amber-200/70'
                  }`}>
                  <div className={`p-3 rounded-xl shrink-0 h-fit ${meta.cls}`}>
                    <Icon size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm truncate ${n.isRead ? 'font-semibold text-slate-700' : 'font-black text-slate-900'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        {timeAgo(n.createdAt) || n.dateText}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${n.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0">
                    {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-300" />}
                    <button onClick={(e) => remove(e, n)} disabled={actingId === n.id}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100">
                      {actingId === n.id
                        ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-rose-400 border-t-transparent" />
                        : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;