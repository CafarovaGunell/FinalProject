import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { petApi, categoryApi } from '../../services/endpoints';
import {
  CATEGORY_TYPE, CITIES, PLACEHOLDER_PET,
  ADOPTION_STATUS_COLOR, ADOPTION_STATUS_TEXT,
} from '../../utils/constants';
import { getPetIcon } from '../../utils/helpers';
import {
  Heart, Search, SlidersHorizontal, MapPin, Grid, List, Check,
  ArrowRight, Sparkles, Calendar, AlertCircle, ChevronLeft, ChevronRight, X,
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Ən yeni' },
  { value: 'oldest', label: 'Ən köhnə' },
  { value: 'age_asc', label: 'Yaş ↑' },
  { value: 'age_desc', label: 'Yaş ↓' },
];

/* ── Debounce hook ── */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const Adopt = () => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // filtrlər
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    city: searchParams.get('city') || '',
    gender: searchParams.get('gender') || '',
    size: searchParams.get('size') || '',
    isVaccinated: searchParams.get('isVaccinated') || '',
    isUrgent: searchParams.get('isUrgent') || '',
    ownerType: searchParams.get('ownerType') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  /* ── YALNIZ ŞƏHƏR ƏLAVƏLƏRİ ── */
  const [cityInput, setCityInput] = useState(searchParams.get('city') || '');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityWrapperRef = useRef(null);

  const filteredCities = CITIES.filter((c) =>
    c.toLowerCase().includes(cityInput.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityWrapperRef.current && !cityWrapperRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ── YALNIZ AXTARIŞ ƏLAVƏSİ: debounce filters.search-ə yazır ── */
  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    categoryApi.all(CATEGORY_TYPE.PET)
      .then((r) => r.success && setCategories(r.data))
      .catch(() => {});
  }, []);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { pageSize: 12 };
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) params[k] = v;
      });

      const res = await petApi.list(params);
      if (res.success) {
        setPets(res.data.items || []);
        setPaging({
          page: res.data.page,
          totalPages: res.data.totalPages,
          totalCount: res.data.totalCount,
        });
      }
    } catch (e) {
      console.error('Pet siyahısı xətası:', e);
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  // URL sinxronizasiyası
  useEffect(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && !(k === 'page' && v === 1) && !(k === 'sortBy' && v === 'newest')) {
        p.set(k, v);
      }
    });
    setSearchParams(p, { replace: true });
  }, [filters, setSearchParams]);

  const setFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value, page: key === 'page' ? value : 1 }));

  const resetFilters = () => {
    setSearchInput('');
    setCityInput('');
    setFilters({
      search: '', categoryId: '', city: '', gender: '', size: '',
      isVaccinated: '', isUrgent: '', ownerType: '', sortBy: 'newest', page: 1,
    });
  };

  const handleWishlist = async (e, petId) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return setAuthModal(true);
    await toggleWishlist(petId);
  };

  const activeFilterCount = ['categoryId', 'city', 'gender', 'size', 'isVaccinated', 'isUrgent', 'ownerType']
    .filter((k) => filters[k] !== '').length;

  /* ---------- Filtr paneli ---------- */
  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Kateqoriya */}
      <div className="space-y-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Heyvan növü</label>
        <div className="flex flex-col gap-1">
          <button onClick={() => setFilter('categoryId', '')}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              !filters.categoryId ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}>
            <span>Hamısı</span>{!filters.categoryId && <Check size={14} className="stroke-[3]" />}
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setFilter('categoryId', String(c.id))}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                filters.categoryId === String(c.id) ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              <span className="flex items-center gap-2">{getPetIcon(c.name)} {c.name}</span>
              {filters.categoryId === String(c.id) && <Check size={14} className="stroke-[3]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Şəhər — YALNIZ BU HİSSƏ DƏYİŞDi */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Şəhər</label>
        <div className="relative" ref={cityWrapperRef}>
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              setShowCityDropdown(true);
              if (e.target.value === '') setFilter('city', '');
            }}
            onFocus={() => setShowCityDropdown(true)}
            placeholder="Şəhər axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
          />
          {cityInput && (
            <button onClick={() => { setCityInput(''); setFilter('city', ''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
          {showCityDropdown && (
            <div className="absolute z-30 top-full mt-1 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              <button onClick={() => { setCityInput(''); setFilter('city', ''); setShowCityDropdown(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 ${
                  !filters.city ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'
                }`}>
                Bütün şəhərlər
              </button>
              {filteredCities.map((c) => (
                <button key={c} onClick={() => { setCityInput(c); setFilter('city', c); setShowCityDropdown(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 ${
                    filters.city === c ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'
                  }`}>
                  {c}
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="px-3 py-2.5 text-xs text-slate-400 font-semibold">Şəhər tapılmadı</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cins */}
      <div className="space-y-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Cinsiyyət</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[{ v: '', l: 'Hamısı' }, { v: '1', l: 'Erkək' }, { v: '2', l: 'Dişi' }].map(({ v, l }) => (
            <button key={l} onClick={() => setFilter('gender', v)}
              className={`px-2 py-2 rounded-xl text-[11px] font-bold transition ${
                filters.gender === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Ölçü */}
      <div className="space-y-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Ölçü</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[{ v: '', l: 'Hamı' }, { v: '1', l: 'Kiçik' }, { v: '2', l: 'Orta' }, { v: '3', l: 'Böyük' }].map(({ v, l }) => (
            <button key={l} onClick={() => setFilter('size', v)}
              className={`px-1.5 py-2 rounded-xl text-[10px] font-bold transition ${
                filters.size === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Digər */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Digər</label>
        {[
          { key: 'isVaccinated', label: 'Peyvəndlənmiş' },
          { key: 'isUrgent', label: 'Təcili' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 cursor-pointer py-1">
            <input type="checkbox" checked={filters[key] === 'true'}
              onChange={(e) => setFilter(key, e.target.checked ? 'true' : '')}
              className="w-4 h-4 rounded accent-indigo-600" />
            <span className="text-xs font-semibold text-slate-600">{label}</span>
          </label>
        ))}
      </div>

      {/* Elan sahibi */}
      <div className="space-y-2">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Elan sahibi</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[{ v: '', l: 'Hamı' }, { v: '1', l: 'Mağaza' }, { v: '2', l: 'Şəxsi' }].map(({ v, l }) => (
            <button key={l} onClick={() => setFilter('ownerType', v)}
              className={`px-2 py-2 rounded-xl text-[11px] font-bold transition ${
                filters.ownerType === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 antialiased pb-16">
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} />

      <div className="bg-gradient-to-b from-indigo-900/5 via-slate-50/50 to-transparent py-10 border-b border-slate-200/50 mb-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Yeni bir dost xilas edin 🐾</h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
            Sizin kiçik bir addımınız onların bütün həyatını dəyişə bilər.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* SOL FİLTR */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <SlidersHorizontal size={16} className="text-indigo-600" /> Süzgəclər
                {activeFilterCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-md">{activeFilterCount}</span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-xs font-semibold text-rose-500 hover:text-rose-600">Sıfırla</button>
              )}
            </div>
            <FilterPanel />
          </aside>

          <main className="lg:col-span-9 space-y-6">

            {/* AXTARIŞ PANELİ — YALNIZ BU HİSSƏ DƏYİŞDi */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ad, cins və ya şəhərə görə axtar..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex w-full sm:w-auto gap-2 items-center">
                <select value={filters.sortBy} onChange={(e) => setFilter('sortBy', e.target.value)}
                  className="flex-1 sm:flex-initial bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                <button onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden relative flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition">
                  <SlidersHorizontal size={16} /> Filtr
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full grid place-items-center font-bold">{activeFilterCount}</span>
                  )}
                </button>

                <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                  {[{ m: 'grid', I: Grid }, { m: 'list', I: List }].map(({ m, I }) => (
                    <button key={m} onClick={() => setViewMode(m)}
                      className={`p-2 rounded-lg transition ${viewMode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      <I size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!loading && (
              <p className="text-xs text-slate-500 font-semibold px-1">
                <span className="text-indigo-600 font-bold">{paging.totalCount}</span> elan tapıldı
              </p>
            )}

            {/* NƏTİCƏLƏR */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <div key={i} className="h-80 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
              </div>
            ) : pets.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center">
                <Sparkles className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-sm font-semibold text-slate-600">Axtarışınıza uyğun elan tapılmadı.</p>
                <button onClick={resetFilters} className="mt-4 text-xs font-bold text-indigo-600 hover:underline">Filtrləri sıfırla</button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'}>
                  {pets.map((pet) => {
                    const fav = isInWishlist(pet.id);
                    const isList = viewMode === 'list';
                    return (
                      <div key={pet.id}
                        className={`group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                          isList ? 'flex flex-col sm:flex-row' : 'flex flex-col'
                        }`}>
                        <div className={`relative bg-slate-100 overflow-hidden ${isList ? 'sm:w-56 h-48 sm:h-auto shrink-0' : 'h-48'}`}>
                          <Link to={`/adopt/${pet.id}`} className="block w-full h-full">
                            <img src={pet.mainImageUrl || PLACEHOLDER_PET} alt={pet.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </Link>

                          {pet.isUrgent && (
                            <span className="absolute top-3 left-3 bg-rose-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                              <AlertCircle size={11} /> Təcili
                            </span>
                          )}

                          <button onClick={(e) => handleWishlist(e, pet.id)}
                            className={`absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-md p-2 rounded-xl shadow-md transition ${
                              fav ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-rose-500'
                            }`}>
                            <Heart size={17} fill={fav ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <Link to={`/adopt/${pet.id}`} className="group-hover:text-indigo-600 transition min-w-0">
                                <h3 className="text-base font-bold text-slate-900 truncate">{pet.name}</h3>
                              </Link>
                              <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
                                {pet.genderText}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-slate-400 truncate">
                              {pet.breed} • {pet.ageText}
                            </p>

                            <div className="flex flex-wrap gap-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ADOPTION_STATUS_COLOR[pet.adoptionStatus]}`}>
                                {ADOPTION_STATUS_TEXT[pet.adoptionStatus]}
                              </span>
                              {pet.isVaccinated && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-600 border border-teal-200">
                                  💉 Peyvəndli
                                </span>
                              )}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200">
                                {pet.ownerType === 1 ? '🏪 Mağaza' : '👤 Şəxsi'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                              <span className="flex items-center gap-1"><MapPin size={13} className="text-indigo-500" />{pet.city}</span>
                              <span className="flex items-center gap-1 text-slate-400"><Calendar size={13} />{pet.dateText}</span>
                            </div>
                          </div>

                          <Link to={`/adopt/${pet.id}`}
                            className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2">
                            <span>Sahiblənmək istəyirəm</span><ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SƏHİFƏLƏMƏ */}
                {paging.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button onClick={() => setFilter('page', paging.page - 1)} disabled={paging.page <= 1}
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white grid place-items-center hover:bg-slate-50 disabled:opacity-40 transition">
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.min(5, paging.totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(paging.page - 2, paging.totalPages - 4));
                      return start + i;
                    }).filter((p) => p <= paging.totalPages).map((p) => (
                      <button key={p} onClick={() => setFilter('page', p)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                          p === paging.page ? 'bg-indigo-600 text-white shadow-md' : 'border border-slate-200 bg-white hover:bg-slate-50'
                        }`}>{p}</button>
                    ))}
                    <button onClick={() => setFilter('page', paging.page + 1)} disabled={paging.page >= paging.totalPages}
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white grid place-items-center hover:bg-slate-50 disabled:opacity-40 transition">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* MOBİL FİLTR DRAWER */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="relative ml-auto w-[85%] max-w-sm bg-white h-full overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="font-bold text-slate-900">Süzgəclər</span>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-xs font-bold text-rose-500">Sıfırla</button>
                )}
                <button onClick={() => setShowMobileFilters(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>
            </div>
            <FilterPanel />
            <button onClick={() => setShowMobileFilters(false)}
              className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">
              Nəticələri göstər ({paging.totalCount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adopt;