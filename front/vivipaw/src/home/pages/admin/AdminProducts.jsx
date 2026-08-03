import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuSearch,
  LuPackage,
  LuStore,
  LuTrash2,
  LuEye,
  LuBoxes,
  LuBadgePercent,
  LuX,
  LuImage,
  LuStar,
} from 'react-icons/lu';
import { productApi, categoryApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { CATEGORY_TYPE, PLACEHOLDER_PRODUCT } from '../../../utils/constants';
import { formatPrice, formatDate } from '../../../utils/helpers';
import { PageHeader, EmptyBox, Spinner, Badge, Modal, listFrom } from '../../components/admin/ui';

const WideModal = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-sm p-4 lg:p-8 flex items-center justify-center"
      onMouseDown={onClose}
    >
      <div
        className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[2rem] shadow-2xl border border-slate-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <h3 className="font-black text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-72px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon size={15} className="text-slate-400 shrink-0 mt-0.5" />
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 break-words">
        {value ?? '—'}
      </p>
    </div>
  </div>
);

const AdminProducts = () => {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockF, setStockF] = useState('');
  const [activeF, setActiveF] = useState('');

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [confirmDel, setConfirmDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const showToast = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  const fetchList = useCallback(async () => {
    setLoading(true);

    const [productsRes, catsRes] = await Promise.all([
      productApi.list({ page: 1, pageSize: 500 }).catch(() => null),
      categoryApi.all(CATEGORY_TYPE.PRODUCT).catch(() => null),
    ]);

    setList(listFrom(productsRes));
    setCategories(listFrom(catsRes));

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return list.filter((p) => {
      const hay = [
        p.name,
        p.brand,
        p.categoryName,
        p.targetAnimalName,
        p.petShopName,
      ].filter(Boolean).join(' ').toLowerCase();

      if (q && !hay.includes(q)) return false;
      if (categoryId && String(p.categoryId) !== String(categoryId)) return false;

      if (stockF === 'in' && !p.inStock) return false;
      if (stockF === 'out' && p.inStock) return false;

      if (activeF === 'active' && !p.isActive) return false;
      if (activeF === 'inactive' && p.isActive) return false;

      return true;
    });
  }, [list, search, categoryId, stockF, activeF]);

  const openDetail = async (p) => {
    setDetail(p);
    setDetailLoading(true);

    const res = await productApi.byId(p.id).catch(() => null);

    if (res?.success && res.data) {
      setDetail({ ...p, ...res.data });
    }

    setDetailLoading(false);
  };

  const doDelete = async () => {
    if (!confirmDel) return;

    setBusy(true);

    const res = await productApi.remove(confirmDel.id)
      .catch((e) => ({ success: false, message: getError(e) }));

    if (res?.success) {
      setList((l) => l.filter((x) => x.id !== confirmDel.id));
      if (detail?.id === confirmDel.id) setDetail(null);
      setConfirmDel(null);
      showToast('🗑️ Məhsul silindi');
    } else {
      showToast(res?.message || 'Məhsul silinmədi');
    }

    setBusy(false);
  };

  const imgs = detail
    ? (detail.images || detail.imageUrls || [])
        .map((i) => i?.imageUrl || i)
        .filter(Boolean)
    : [];

  const mainImg = detail?.mainImageUrl || detail?.imageUrl || imgs[0] || PLACEHOLDER_PRODUCT;

  return (
    <div>
      <PageHeader
        title="Məhsullar"
        subtitle={`${filtered.length} / ${list.length} məhsul`}
      />

      {toast && (
        <div className="fixed top-20 right-6 z-[80] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <LuSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Məhsul, marka, mağaza, kateqoriya axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="">Bütün kateqoriyalar</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={stockF}
          onChange={(e) => setStockF(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="">Stok: hamısı</option>
          <option value="in">Stokda var</option>
          <option value="out">Stok yoxdur</option>
        </select>

        <select
          value={activeF}
          onChange={(e) => setActiveF(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <option value="">Status: hamısı</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Passiv</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-2xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyBox text="Məhsul tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">Məhsul</th>
                  <th className="px-5 py-3.5 hidden lg:table-cell">Mağaza</th>
                  <th className="px-5 py-3.5">Qiymət</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Stok</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Reytinq</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                  <th className="px-5 py-3.5 text-right w-20">Əməl.</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => openDetail(p)}
                    className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 transition cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.mainImageUrl || PLACEHOLDER_PRODUCT}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-sky-600">
                            {p.name}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-400">
                            {p.brand || '—'} • {p.categoryName || '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <p className="font-bold text-slate-600 flex items-center gap-1.5">
                        <LuStore size={13} />
                        {p.petShopName || '—'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-black text-slate-900">
                        {formatPrice(p.finalPrice ?? p.discountPrice ?? p.price)}
                      </p>
                      {p.discountPrice != null && (
                        <p className="text-[11px] text-slate-400 line-through font-semibold">
                          {formatPrice(p.price)}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="font-bold text-slate-600">
                        {p.stockQuantity ?? 0}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="font-bold text-slate-600 flex items-center gap-1">
                        <LuStar size={13} className="text-amber-400" />
                        {p.averageRating ?? 0}
                        <span className="text-[11px] text-slate-400">
                          ({p.reviewCount ?? 0})
                        </span>
                      </p>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <Badge
                        className={
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }
                      >
                        {p.isActive ? 'Aktiv' : 'Passiv'}
                      </Badge>
                    </td>

                    <td
                      className="px-5 py-3.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetail(p)}
                          title="Ətraflı"
                          className="p-2 rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition"
                        >
                          <LuEye size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDel(p)}
                          title="Sil"
                          className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <LuTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <WideModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.name} — məhsul məlumatları` : ''}
      >
        {detailLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : detail ? (
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">
            <div className="space-y-3">
              <img
                src={mainImg}
                alt={detail.name}
                className="w-full aspect-square rounded-3xl object-cover border border-slate-200 bg-slate-50"
              />

              {imgs.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {[mainImg, ...imgs.filter((x) => x !== mainImg)].slice(0, 10).map((img, i) => (
                    <img
                      key={`${img}-${i}`}
                      src={img}
                      alt=""
                      className="aspect-square rounded-xl object-cover border border-slate-200"
                    />
                  ))}
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Qiymət
                </p>
                <p className="text-3xl font-black text-slate-900">
                  {formatPrice(detail.finalPrice ?? detail.discountPrice ?? detail.price)}
                </p>
                {detail.discountPrice != null && (
                  <p className="text-sm text-slate-400 line-through font-bold">
                    {formatPrice(detail.price)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{detail.name}</h2>
                <p className="text-sm font-semibold text-slate-500">
                  {detail.brand || 'Marka yoxdur'} • {detail.categoryName || 'Kateqoriya yoxdur'}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <LuPackage size={14} />
                    Məhsul
                  </p>
                  <Info icon={LuBoxes} label="Stok" value={detail.stockQuantity ?? 0} />
                  <Info icon={LuBadgePercent} label="Endirimli qiymət" value={detail.discountPrice != null ? formatPrice(detail.discountPrice) : 'Yoxdur'} />
                  <Info icon={LuPackage} label="Hədəf heyvan" value={detail.targetAnimalName} />
                  <Info icon={LuStar} label="Reytinq" value={`${detail.averageRating ?? 0} (${detail.reviewCount ?? 0} rəy)`} />
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <LuStore size={14} />
                    Mağaza
                  </p>
                  <Info icon={LuStore} label="Mağaza adı" value={detail.petShopName} />
                  <Info icon={LuPackage} label="Məhsul ID" value={detail.id} />
                  <Info icon={LuPackage} label="Mağaza ID" value={detail.petShopId} />
                  <Info icon={LuPackage} label="Yaradılıb" value={detail.createdAt ? formatDate(detail.createdAt) : '—'} />
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-black text-slate-900 mb-2">
                  Təsvir
                </p>
                <p className="text-sm font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {detail.description || 'Təsvir yoxdur.'}
                </p>
              </div>

              {imgs.length > 0 && (
                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1.5 mb-3">
                    <LuImage size={14} />
                    Şəkillər
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {[mainImg, ...imgs.filter((x) => x !== mainImg)].map((img, i) => (
                      <img
                        key={`${img}-${i}`}
                        src={img}
                        alt=""
                        className="aspect-square rounded-2xl object-cover border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setConfirmDel(detail)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                >
                  <LuTrash2 size={14} />
                  Məhsulu sil
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </WideModal>

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Məhsulu sil"
      >
        <p className="text-sm font-semibold text-slate-600">
          <span className="font-black text-slate-900">
            {confirmDel?.name}
          </span>{' '}
          silinəcək. Bu əməliyyat geri qaytarıla bilməz.
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

export default AdminProducts;