import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, MapPin, Phone, X, AlertCircle, Ban, CheckCircle2, Truck, Clock,
  Store, ChevronDown, ChevronUp, ShoppingBasket, FileText, Trash2,
} from 'lucide-react';
import { orderApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { ORDER_STATUS_TEXT, ORDER_STATUS_COLOR, PLACEHOLDER_PRODUCT } from '../../utils/constants';
import { formatPrice, formatDateTime } from '../../utils/helpers';

import StartChatButton from '../components/chat/StartChatButton';
import { CHAT_TYPE } from '../../utils/chat';

const getNumber = (o) => o.orderNumber || `Sifariş #${o.id}`;
const getItems  = (o) => o.items || o.orderItems || [];
const iName     = (it) => it.productName || it.name || 'Məhsul';
const iImg      = (it) => it.productImageUrl || it.imageUrl || PLACEHOLDER_PRODUCT;
const iPrice    = (it) => it.unitPrice ?? it.price ?? 0;
const iShop     = (it) => it.shopName || it.petShopName || '';

const getOrderShopUserId = (o) =>
  o.petShopUserId || o.shopUserId || o.petShopOwnerUserId || o.shopOwnerUserId || o.sellerUserId || o.ownerUserId;

const STEPS = [
  { s: 1, label: 'Gözləmədə',  icon: Clock },
  { s: 2, label: 'Təsdiqləndi', icon: CheckCircle2 },
  { s: 3, label: 'Hazırlanır', icon: Package },
  { s: 4, label: 'Göndərildi', icon: Truck },
  { s: 5, label: 'Çatdırıldı', icon: CheckCircle2 },
];

/* ═══════════ TƏSDİQ MODALI (silmə + ləğv üçün) ═══════════ */
const ConfirmModal = ({ title, description, confirmText, confirmColor, icon: Icon, onClose, onConfirm, loading, children }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl">
        <X size={18} />
      </button>
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${confirmColor === 'rose' ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'}`}>
          <Icon size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-400">{description}</p>
        </div>
      </div>
      {children}
      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition">
          Xeyr, geri
        </button>
        <button onClick={onConfirm} disabled={loading}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 disabled:opacity-50 ${
            confirmColor === 'rose' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-700 hover:bg-slate-800'
          }`}>
          {loading
            ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            : <Icon size={14} />}
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════ STATUS TIMELINE ═══════════ */
const Timeline = ({ status }) => {
  if (status === 6) {
    return (
      <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-xs font-bold">
        <Ban size={15} /> Sifariş ləğv edildi
      </div>
    );
  }
  return (
    <div className="flex items-center">
      {STEPS.map(({ s, label, icon: Icon }, i) => {
        const done = status >= s;
        const current = status === s;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div className={`w-8 h-8 rounded-full grid place-items-center border-2 transition ${
                done ? 'bg-emerald-500 border-emerald-500 text-white'
                     : current ? 'border-amber-400 text-amber-500 bg-amber-50'
                     : 'border-slate-200 text-slate-300 bg-white'
              }`}>
                <Icon size={14} />
              </div>
              <span className={`text-[9px] font-bold text-center leading-tight ${done ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 rounded ${status > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ═══════════ SƏHİFƏ ═══════════ */
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.mine();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      setOrders([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.error('Sifarişlər yüklənmədi:', e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const res = await orderApi.cancel(cancelTarget.id, cancelReason.trim() || undefined);
      if (res?.success) { showToast('Sifariş ləğv edildi'); fetchList(); }
      else showToast(res?.message || 'Ləğv edilmədi.');
    } catch (err) {
      showToast(getError(err, 'Ləğv edilmədi.'));
    } finally {
      setCancelLoading(false);
      setCancelTarget(null);
      setCancelReason('');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (typeof orderApi.remove === 'function') {
        const res = await orderApi.remove(deleteTarget.id);
        if (res?.success) { showToast('🗑️ Sifariş silindi'); fetchList(); setDeleteLoading(false); setDeleteTarget(null); return; }
      }
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      showToast('🗑️ Siyahıdan silindi');
    } catch (e) {
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      showToast('🗑️ Siyahıdan silindi');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const canCancel = (o) => o.status === 1;
  const canDelete = (o) => o.status === 5 || o.status === 6;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {/* LƏĞV MODALI */}
      {cancelTarget && (
        <ConfirmModal
          title="Sifarişi ləğv et"
          description={getNumber(cancelTarget)}
          confirmText="Ləğv et"
          confirmColor="rose"
          icon={Ban}
          onClose={() => { setCancelTarget(null); setCancelReason(''); }}
          onConfirm={handleCancel}
          loading={cancelLoading}
        >
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Səbəb (isteğe bağlı)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-rose-400 resize-none"
          />
        </ConfirmModal>
      )}

      {/* SİLMƏ MODALI */}
      {deleteTarget && (
        <ConfirmModal
          title="Sifarişi siyahıdan sil"
          description={`${getNumber(deleteTarget)} silinəcək. Bu əməliyyat geri qaytarıla bilməz.`}
          confirmText="Sil"
          confirmColor="rose"
          icon={Trash2}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100"><Package className="w-7 h-7" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Sifarişlərim</h1>
            <p className="text-sm text-slate-500 mt-0.5">Bütün alış-veriş tarixçəniz</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100" />)}</div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-14 text-center space-y-4">
            <div className="w-16 h-16 bg-sky-50 text-sky-400 rounded-full grid place-items-center mx-auto"><ShoppingBasket size={30} /></div>
            <h2 className="text-lg font-bold text-slate-900">Hələ sifarişiniz yoxdur</h2>
            <p className="text-sm text-slate-500">Mağazaya keçib ilk sifarişinizi yaradın.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition">
              Mağazaya Keçid
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((o) => {
              const items = getItems(o);
              const open = expanded === o.id;
              return (
                <div key={o.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
                  {/* SİLMƏ X BUTTONU — sağ yuxarı künc */}
                  {canDelete(o) && (
                    <button
                      onClick={() => setDeleteTarget(o)}
                      className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-200 hover:border-rose-200 transition"
                      title="Siyahıdan sil"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {/* BAŞLIQ */}
                  <div className="p-5 pr-12 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl"><FileText size={18} /></div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{getNumber(o)}</p>
                        <p className="text-[11px] text-slate-400 font-semibold">{o.dateText || formatDateTime(o.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border ${ORDER_STATUS_COLOR[o.status]}`}>
                        {ORDER_STATUS_TEXT[o.status]}
                      </span>
                      <span className="text-base font-black text-slate-900">{formatPrice(o.totalAmount)}</span>
                    </div>
                  </div>

                  {/* MƏHSUL ÖNBAXIŞI */}
                  <div className="px-5 py-4 flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {items.slice(0, 4).map((it, i) => (
                        <img key={i} src={iImg(it)} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-white bg-slate-100" />
                      ))}
                      {items.length > 4 && (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-white grid place-items-center text-[11px] font-black text-slate-500">
                          +{items.length - 4}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold flex-1 truncate">
                      {items.map((it) => iName(it)).join(', ')}
                    </p>
                    <button onClick={() => setExpanded(open ? null : o.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 shrink-0">
                      {open ? 'Gizlət' : 'Detallar'} {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* AÇILAN HİSSƏ */}
                  {open && (
                    <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                      <Timeline status={o.status} />

                      <div className="space-y-2">
                        {items.map((it, i) => (
                          <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                            <Link to={`/product/${it.productId}`}>
                              <img src={iImg(it)} alt="" className="w-14 h-14 rounded-lg object-cover bg-white" />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${it.productId}`}>
                                <p className="text-xs font-bold text-slate-800 truncate hover:text-sky-600 transition">{iName(it)}</p>
                              </Link>
                              {iShop(it) && <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5"><Store size={10} /> {iShop(it)}</p>}
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold shrink-0">× {it.quantity}</p>
                            <p className="text-xs font-black text-slate-900 shrink-0 w-20 text-right">{formatPrice(iPrice(it) * (it.quantity || 1))}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5">
                          <p className="font-black text-slate-900 flex items-center gap-1.5"><MapPin size={13} className="text-sky-500" /> Çatdırılma</p>
                          <p className="text-slate-600 font-semibold">{o.shippingFullName}</p>
                          {o.shippingPhone && <p className="text-slate-500 flex items-center gap-1"><Phone size={11} /> {o.shippingPhone}</p>}
                          <p className="text-slate-500">{o.shippingCity}, {o.shippingAddress}</p>
                          {o.note && <p className="text-slate-400 italic">"{o.note}"</p>}
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5 font-semibold text-slate-600">
                          <div className="flex justify-between"><span>Ara cəm</span><span>{formatPrice(o.subTotal)}</span></div>
                          <div className="flex justify-between"><span>Çatdırılma</span><span>{(o.shippingFee ?? 0) === 0 ? 'Pulsuz' : formatPrice(o.shippingFee)}</span></div>
                          <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200"><span>Cəmi</span><span>{formatPrice(o.totalAmount)}</span></div>
                          {o.cancelReason && <p className="text-rose-500 text-[11px] flex items-center gap-1 pt-1"><AlertCircle size={12} /> {o.cancelReason}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ƏMƏLİYYAT */}
                  <div className="px-5 pb-4 flex flex-col sm:flex-row gap-2">
                    <StartChatButton
                      type={CHAT_TYPE.ORDER}
                      orderId={o.id}
                      targetUserId={getOrderShopUserId(o) || undefined}
                      className="flex-1 py-2.5 rounded-xl"
                    >
                      Mağazaya yaz
                    </StartChatButton>

                    {canCancel(o) && (
                      <button
                        onClick={() => setCancelTarget(o)}
                        className="flex-1 py-2.5 rounded-xl text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Ban size={13} />
                        Sifarişi ləğv et
                      </button>
                    )}
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

export default MyOrders;