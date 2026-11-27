import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Eye,
  Calendar,
  User,
  ArrowLeft,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react';

import { articleApi, categoryApi } from '../../services/endpoints';
import { CATEGORY_TYPE } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

/* ═══════════ SADƏ MARKDOWN RENDER ═══════════ */
const inline = (text) =>
  String(text || '')
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index} className="text-slate-900 font-bold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );

const renderContent = (text) => {
  if (!text) return null;

  return String(text)
    .split(/\n{2,}/)
    .map((block, index) => {
      const value = block.trim();

      if (!value) return null;

      /* Tam **başlıq** olan blok */
      if (/^\*\*[^*]+\*\*$/.test(value)) {
        return (
          <h3
            key={index}
            className="text-base font-black text-slate-900 pt-3"
          >
            {value.slice(2, -2)}
          </h3>
        );
      }

      /* Nömrəli siyahı */
      if (/^\d+\.\s/.test(value)) {
        const items = value.split('\n').filter(Boolean);

        return (
          <ol
            key={index}
            className="list-decimal list-inside space-y-1.5 text-sm text-slate-600 leading-relaxed"
          >
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>
                {inline(item.replace(/^\d+\.\s/, ''))}
              </li>
            ))}
          </ol>
        );
      }

      /* Sadə paraqraf */
      return (
        <p
          key={index}
          className="text-sm text-slate-600 leading-relaxed"
        >
          {inline(value)}
        </p>
      );
    });
};

/* ═══════════ DTO HELPER-LƏR ═══════════ */
const getAuthor = (article) =>
  article.authorName ||
  article.veterinarianProfile?.userFullName ||
  article.vetUserFullName ||
  article.userFullName ||
  'viviPaw Redaksiya';

const getCatName = (article) =>
  article.categoryName ||
  article.articleCategoryName ||
  article.category?.name ||
  '';

/*
  Backend-dən categoryId fərqli adlarla gələ bilər.
  Hamısını yoxlayırıq.
*/
const getCatId = (article) =>
  article.categoryId ??
  article.articleCategoryId ??
  article.category?.id ??
  null;

const getDate = (article) =>
  article.dateText || formatDate(article.createdAt);

const getImage = (article) =>
  article.imageUrl ||
  article.mainImageUrl ||
  article.coverImageUrl ||
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=1000&auto=format&fit=crop';

/* ═══════════ SƏHİFƏ ═══════════ */
const PetCare = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* Məqalələri və məqalə kateqoriyalarını yüklə */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [articleResponse, categoryResponse] = await Promise.all([
          articleApi.list({ pageSize: 50 }).catch(() => null),
          categoryApi.all(CATEGORY_TYPE.ARTICLE).catch(() => null),
        ]);

        if (articleResponse?.success) {
          const data = Array.isArray(articleResponse.data)
            ? articleResponse.data
            : articleResponse.data?.items || [];

          setArticles(
            data.filter(
              (article) =>
                article.isPublished !== false
            )
          );
        } else {
          setArticles([]);
        }

        if (categoryResponse?.success) {
          setCategories(categoryResponse.data || []);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Məqalələr yüklənmədi:', error);
        setArticles([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /*
    Search + Category filter.
    categoryId yoxdursa kateqoriya adı ilə yoxlayır.
  */
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const selectedCategory = categories.find(
      (category) => String(category.id) === String(cat)
    );

    return articles.filter((article) => {
      const searchableText = [
        article.title,
        article.shortDescription,
        article.content,
        getAuthor(article),
        getCatName(article),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const articleCategoryId = getCatId(article);

      const matchesCategoryById =
        !cat ||
        String(articleCategoryId) === String(cat);

      const matchesCategoryByName =
        selectedCategory &&
        getCatName(article)
          .trim()
          .toLowerCase() ===
          String(selectedCategory.name || '')
            .trim()
            .toLowerCase();

      const matchesCategory =
        !cat ||
        matchesCategoryById ||
        matchesCategoryByName;

      return matchesSearch && matchesCategory;
    });
  }, [articles, categories, search, cat]);

  const openArticle = async (slug) => {
    if (!slug) return;

    setDetailLoading(true);
    setSelected({});

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    try {
      const response = await articleApi.bySlug(slug);

      if (response?.success && response.data) {
        setSelected(response.data);
      } else {
        setSelected(null);
      }
    } catch (error) {
      console.error('Məqalə yüklənmədi:', error);
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeArticle = () => {
    setSelected(null);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* ═══════════ DETAL GÖRÜNÜŞÜ ═══════════ */
  if (selected || detailLoading) {
    const related =
      selected?.slug
        ? articles
            .filter((article) => {
              const isNotCurrent =
                article.slug !== selected.slug;

              const sameCategoryId =
                String(getCatId(article)) ===
                String(getCatId(selected));

              const sameCategoryName =
                getCatName(article)
                  .trim()
                  .toLowerCase() ===
                getCatName(selected)
                  .trim()
                  .toLowerCase();

              return (
                isNotCurrent &&
                (sameCategoryId || sameCategoryName)
              );
            })
            .slice(0, 3)
        : [];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
          <button
            type="button"
            onClick={closeArticle}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition mb-6"
          >
            <ArrowLeft size={16} />
            Bütün məqalələr
          </button>

          {detailLoading || !selected?.slug ? (
            <div className="space-y-4">
              <div className="h-8 w-2/3 bg-white rounded-2xl animate-pulse" />
              <div className="h-12 bg-white rounded-2xl animate-pulse" />
              <div className="h-72 bg-white rounded-3xl animate-pulse" />
              <div className="h-40 bg-white rounded-3xl animate-pulse" />
            </div>
          ) : (
            <article className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                {getCatName(selected) && (
                  <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg">
                    {getCatName(selected)}
                  </span>
                )}

                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar size={12} />
                  {getDate(selected)}
                </span>

                <span className="flex items-center gap-1 text-slate-400">
                  <Eye size={12} />
                  {selected.viewCount || 0} baxış
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                {selected.title}
              </h1>

              {selected.shortDescription && (
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                  {selected.shortDescription}
                </p>
              )}

              <img
                src={getImage(selected)}
                alt={selected.title || ''}
                className="w-full h-64 sm:h-96 object-cover rounded-3xl border border-slate-200 shadow-sm"
              />

              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Stethoscope size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {getAuthor(selected)}
                  </p>

                  <p className="text-[11px] text-slate-400 font-semibold">
                    Baytar mütəxəssis • Təsdiqlənmiş məzmun
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-4 shadow-sm">
                {renderContent(selected.content)}
              </div>

              {related.length > 0 && (
                <div className="pt-6 space-y-4">
                  <h2 className="text-lg font-black text-slate-900">
                    Əlaqəli məqalələr
                  </h2>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {related.map((article) => (
                      <button
                        type="button"
                        key={article.id}
                        onClick={() => openArticle(article.slug)}
                        className="text-left bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition group"
                      >
                        <img
                          src={getImage(article)}
                          alt=""
                          className="w-full h-24 object-cover"
                        />

                        <p className="p-3 text-xs font-bold text-slate-800 group-hover:text-amber-600 transition line-clamp-2">
                          {article.title}
                        </p>
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

  /* ═══════════ SİYAHI GÖRÜNÜŞÜ ═══════════ */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {/* HERO */}
      <div className="bg-gradient-to-b from-amber-900/5 via-slate-50 to-transparent py-12 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[11px] font-bold">
            <Sparkles size={13} />
            Baytarlardan rəsmi tövsiyələr
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Pet Baxım Mərkəzi 📚
          </h1>

          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            Qidalanma, sağlamlıq, təlim və gündəlik qulluq haqqında
            etibarlı məqalələr.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* FİLTRLƏR */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Məqalə axtar..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCat('')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                !cat
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Hamısı
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setCat(String(category.id))}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  cat === String(category.id)
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {!loading && (
          <p className="text-xs text-slate-500 font-semibold px-1">
            <span className="text-amber-600 font-bold">
              {filtered.length}
            </span>{' '}
            məqalə tapıldı
            {search.trim() && (
              <span className="text-slate-400">
                {' '}
                · “{search.trim()}”
              </span>
            )}
          </p>
        )}

        {/* SİYAHI */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-80 bg-white rounded-2xl animate-pulse border border-slate-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
            <BookOpen
              className="mx-auto text-slate-300 mb-3"
              size={40}
            />

            <p className="text-sm font-semibold text-slate-600">
              Axtarışa uyğun məqalə tapılmadı.
            </p>

            {(search || cat) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCat('');
                }}
                className="mt-4 text-xs font-bold text-amber-600 hover:underline"
              >
                Filtrləri təmizlə
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <article
                key={article.id}
                onClick={() => openArticle(article.slug)}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={getImage(article)}
                    alt={article.title || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {getCatName(article) && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow">
                      {getCatName(article)}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col gap-2.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {article.shortDescription}
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1 truncate">
                      <User
                        size={12}
                        className="text-amber-500 shrink-0"
                      />
                      {getAuthor(article)}
                    </span>

                    <span className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {article.viewCount || 0}
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {getDate(article)}
                      </span>
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