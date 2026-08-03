import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LuSearch,
  LuNewspaper,
  LuUser,
  LuCalendar,
  LuTag,
  LuEye,
  LuTrash2,
  LuX,
  LuImage,
} from 'react-icons/lu';
import { articleApi, categoryApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { CATEGORY_TYPE } from '../../../utils/constants';
import { formatDate } from '../../../utils/helpers';
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
        {value || '—'}
      </p>
    </div>
  </div>
);

const textOf = (a, ...keys) => {
  for (const k of keys) {
    if (a?.[k]) return a[k];
  }
  return '';
};

const AdminArticles = () => {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');

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

    const [articlesRes, catsRes] = await Promise.all([
      articleApi.list({ page: 1, pageSize: 500 }).catch(() => null),
      categoryApi.all(CATEGORY_TYPE.ARTICLE).catch(() => null),
    ]);

    setList(listFrom(articlesRes));
    setCategories(listFrom(catsRes));

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return list.filter((a) => {
      const hay = [
        a.title,
        a.slug,
        a.summary,
        a.description,
        a.categoryName,
        a.authorName,
        a.veterinarianFullName,
        a.createdByName,
      ].filter(Boolean).join(' ').toLowerCase();

      if (q && !hay.includes(q)) return false;
      if (categoryId && String(a.categoryId) !== String(categoryId)) return false;

      return true;
    });
  }, [list, search, categoryId]);

  const openDetail = async (a) => {
    setDetail(a);

    const slug = a.slug || a.slugUrl;
    if (!slug) return;

    setDetailLoading(true);

    const res = await articleApi.bySlug(slug).catch(() => null);

    if (res?.success && res.data) {
      setDetail({ ...a, ...res.data });
    }

    setDetailLoading(false);
  };

  const doDelete = async () => {
    if (!confirmDel) return;

    setBusy(true);

    const res = await articleApi.remove(confirmDel.id)
      .catch((e) => ({ success: false, message: getError(e) }));

    if (res?.success) {
      setList((l) => l.filter((x) => x.id !== confirmDel.id));
      if (detail?.id === confirmDel.id) setDetail(null);
      setConfirmDel(null);
      showToast('🗑️ Məqalə silindi');
    } else {
      showToast(res?.message || 'Məqalə silinmədi');
    }

    setBusy(false);
  };

  const detailImg = detail
    ? textOf(detail, 'coverImageUrl', 'mainImageUrl', 'imageUrl', 'thumbnailUrl')
    : '';

  const detailBody = detail
    ? textOf(detail, 'content', 'body', 'description', 'summary')
    : '';

  return (
    <div>
      <PageHeader
        title="Məqalələr"
        subtitle={`${filtered.length} / ${list.length} məqalə`}
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
            placeholder="Məqalə adı, müəllif, kateqoriya axtar..."
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
        <EmptyBox text="Məqalə tapılmadı." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3.5">Məqalə</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Müəllif</th>
                  <th className="px-5 py-3.5 hidden lg:table-cell">Kateqoriya</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Tarix</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                  <th className="px-5 py-3.5 text-right w-20">Əməl.</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((a) => {
                  const img = textOf(a, 'coverImageUrl', 'mainImageUrl', 'imageUrl', 'thumbnailUrl');
                  const author = textOf(a, 'authorName', 'veterinarianFullName', 'createdByName', 'userFullName');

                  return (
                    <tr
                      key={a.id}
                      onClick={() => openDetail(a)}
                      className="border-b border-slate-50 last:border-0 hover:bg-sky-50/50 transition cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img
                              src={img}
                              alt={a.title}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 grid place-items-center border border-sky-100 shrink-0">
                              <LuNewspaper size={18} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-black text-slate-900 group-hover:text-sky-600 truncate">
                              {a.title || 'Adsız məqalə'}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400 truncate">
                              {a.summary || a.slug || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <p className="font-bold text-slate-600 flex items-center gap-1.5">
                          <LuUser size={13} />
                          {author || '—'}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <p className="font-bold text-slate-600 flex items-center gap-1.5">
                          <LuTag size={13} />
                          {a.categoryName || '—'}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 hidden sm:table-cell text-slate-500 font-semibold text-xs">
                        {a.createdAt ? formatDate(a.createdAt) : (a.dateText || '—')}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Badge
                          className={
                            a.isPublished === false
                              ? 'bg-slate-100 text-slate-500 border-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }
                        >
                          {a.isPublished === false ? 'Qaralama' : 'Yayımda'}
                        </Badge>
                      </td>

                      <td
                        className="px-5 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(a)}
                            title="Ətraflı"
                            className="p-2 rounded-lg text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition"
                          >
                            <LuEye size={15} />
                          </button>

                          <button
                            onClick={() => setConfirmDel(a)}
                            title="Sil"
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <LuTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <WideModal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.title || 'Məqalə'} — məlumatlar` : ''}
      >
        {detailLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : detail ? (
          <div className="space-y-6">
            {detailImg ? (
              <img
                src={detailImg}
                alt={detail.title}
                className="w-full max-h-[360px] object-cover rounded-3xl border border-slate-200 bg-slate-50"
              />
            ) : (
              <div className="w-full h-52 rounded-3xl bg-sky-50 text-sky-600 grid place-items-center border border-sky-100">
                <LuImage size={42} />
              </div>
            )}

            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className="bg-sky-50 text-sky-600 border-sky-200">
                  {detail.categoryName || 'Məqalə'}
                </Badge>
                <Badge
                  className={
                    detail.isPublished === false
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }
                >
                  {detail.isPublished === false ? 'Qaralama' : 'Yayımda'}
                </Badge>
              </div>

              <h2 className="text-3xl font-black text-slate-900">
                {detail.title || 'Adsız məqalə'}
              </h2>

              <p className="text-sm font-semibold text-slate-500 mt-2">
                {detail.summary || detail.description || ''}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-2xl p-4">
                <Info
                  icon={LuUser}
                  label="Müəllif"
                  value={textOf(detail, 'authorName', 'veterinarianFullName', 'createdByName', 'userFullName')}
                />
              </div>

              <div className="border border-slate-200 rounded-2xl p-4">
                <Info
                  icon={LuTag}
                  label="Kateqoriya"
                  value={detail.categoryName}
                />
              </div>

              <div className="border border-slate-200 rounded-2xl p-4">
                <Info
                  icon={LuCalendar}
                  label="Yaradılıb"
                  value={detail.createdAt ? formatDate(detail.createdAt) : detail.dateText}
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5">
              <p className="text-xs font-black text-slate-900 mb-3">
                Məqalə mətni
              </p>
              <div className="text-sm font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
                {detailBody || 'Məqalə mətni yoxdur.'}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setConfirmDel(detail)}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
              >
                <LuTrash2 size={14} />
                Məqaləni sil
              </button>
            </div>
          </div>
        ) : null}
      </WideModal>

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Məqaləni sil"
      >
        <p className="text-sm font-semibold text-slate-600">
          <span className="font-black text-slate-900">
            {confirmDel?.title}
          </span>{' '}
          silinəcək.
        </p>

        <p className="mt-3 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Bu məqalə baytar tərəfindən yazılmış ola bilər. Silmə admin moderasiyası kimi tətbiq olunur.
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

export default AdminArticles;