import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, Eye, Calendar, User, ArrowLeft, Sparkles, Stethoscope,
} from 'lucide-react';
import { articleApi, categoryApi } from '../../services/endpoints';
import { CATEGORY_TYPE } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

/* ═══════════ SADƏ MARKDOWN RENDER ═══════════ */
const inline = (s) =>
  s.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={j} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>
      : <React.Fragment key={j}>{part}</React.Fragment>
  );

const renderContent = (text) => {
  if (!text) return null;
  return text.split(/\n{2,}/).map((block, i) => {
    const t = block.trim();
    // Tamamilə **başlıq** olan blok → alt başlıq
    if (/^\*\*[^*]+\*\*$/.test(t)) {
      return <h3 key={i} className="text-base font-black text-slate-900 pt-3">{t.slice(2, -2)}</h3>;
    }
    // Nömrəli siyahı
    if (/^\d+\.\s/.test(t)) {
      const items = t.split('\n').filter(Boolean);
      return (
        <ol key={i} className="list-decimal list-inside space-y-1.5 text-sm text-slate-600 leading-relaxed">
          {items.map((it, j) => <li key={j}>{inline(it.replace(/^\d+\.\s/, ''))}</li>)}
        </ol>
      );
    }
    return <p key={i} className="text-sm text-slate-600 leading-relaxed">{inline(t)}</p>;
  });
};

const getAuthor  = (a) => a.authorName || a.veterinarianProfile?.userFullName || a.vetUserFullName || a.userFullName || 'viviPaw Redaksiya';
const getCatName = (a) => a.categoryName || a.category?.name || '';
const getDate    = (a) => a.dateText || formatDate(a.createdAt);

/* ═══════════ SƏHİFƏ ═══════════ */
const PetCare = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      articleApi.list({ pageSize: 50 }).catch(() => null),
      categoryApi.all(CATEGORY_TYPE.ARTICLE).catch(() => null),
    ]).then(([aRes, cRes]) => {
      if (aRes?.success) {
        const list = Array.isArray(aRes.data) ? aRes.data : (aRes.data?.items || []);
        setArticles(list.filter((a) => a.isPublished));
      }
      if (cRes?.success) setCategories(cRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => articles.filter((a) => {
    const q = search.trim().toLowerCase();
    const mq = !q || (a.title || '').toLowerCase().includes(q) || (a.shortDescription || '').toLowerCase().includes(q);
    const mc = !cat || String(a.categoryId) === cat;
    return mq && mc;
  }), [articles, search, cat]);

  const openArticle = async (slug) => {
    setDetailLoading(true);
    setSelected({}); // placeholder → skeleton
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await articleApi.bySlug(slug);
      setSelected(res?.success ? res.data : null);
    } catch {
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  /* ═══════════ DETAL GÖRÜNÜŞÜ ═══════════ */
  if (selected || detailLoading) {
    const related = selected?.slug
      ? articles.filter((x) => x.slug !== selected.slug && x.categoryId === selected.categoryId).slice(0, 3)
      : [];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
          <button onClick={() => { setSelected(null); window.scrollTo({ top: 0 }); }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition mb-6">
            <ArrowLeft size={16} /> Bütün məqalələr
          </button>

          {detailLoading || !selected?.slug ? (
            <div className="space-y-4">
              <div className="h-10 bg-white rounded-2xl animate-pulse" />
              <div className="h-72 bg-white rounded-3xl animate-pulse" />
              <div className="h-40 bg-white rounded-3xl animate-pulse" />
            </div>
          ) : (
            <article className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                {getCatName(selected) && (
                  <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg">{getCatName(selected)}</span>
                )}
                <span className="flex items-center gap-1 text-slate-400"><Calendar size={12} /> {getDate(selected)}</span>
                <span className="flex items-center gap-1 text-slate-400"><Eye size={12} /> {selected.viewCount || 0} baxış</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">{selected.title}</h1>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">{selected.shortDescription}</p>

              {selected.imageUrl && (
                <img src={selected.imageUrl} alt={selected.title}
                  className="w-full h-64 sm:h-96 object-cover rounded-3xl border border-slate-200 shadow-sm" />
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Stethoscope size={20} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{getAuthor(selected)}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">Baytar mütəxəssis • Təsdiqlənmiş məzmun</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-4 shadow-sm">
                {renderContent(selected.content)}
              </div>

              {related.length > 0 && (
                <div className="pt-6 space-y-4">
                  <h2 className="text-lg font-black text-slate-900">Əlaqəli məqalələr</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {related.map((r) => (
                      <button key={r.id} onClick={() => openArticle(r.slug)}
                        className="text-left bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition group">
                        <img src={r.imageUrl} alt="" className="w-full h-24 object-cover" />
                        <p className="p-3 text-xs font-bold text-slate-800 group-hover:text-amber-600 transition line-clamp-2">{r.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════ SİYAHı GÖRÜNÜŞÜ ═══════════ */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {/* HERO */}
      <div className="bg-gradient-to-b from-amber-900/5 via-slate-50 to-transparent py-12 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[11px] font-bold">
            <Sparkles size={13} /> Baytarlardan rəsmi tövsiyələr
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Pet Baxım Mərkəzi 📚</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            Qidalanma, sağlamlıq, təlim və gündəlik qulluq haqqında etibarlı məqalələr.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* FİLTRLƏR */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Məqalə axtar..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-amber-500 transition shadow-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setCat('')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                !cat ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}>Hamısı</button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setCat(String(c.id))}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  cat === String(c.id) ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}>{c.name}</button>
            ))}
          </div>
        </div>

        {/* SİYAHı */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
            <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm font-semibold text-slate-600">Axtarışa uyğun məqalə tapılmadı.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => (
              <article key={a.id} onClick={() => openArticle(a.slug)}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img src={a.imageUrl} alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {getCatName(a) && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow">
                      {getCatName(a)}
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col gap-2.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition line-clamp-2">{a.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{a.shortDescription}</p>
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1 truncate"><User size={12} className="text-amber-500 shrink-0" /> {getAuthor(a)}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1"><Eye size={12} /> {a.viewCount || 0}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {getDate(a)}</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetCare;