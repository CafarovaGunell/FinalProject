import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Store, Plus, Sparkles, PackageX, Tag, PawPrint,
} from 'lucide-react';
import { productApi, categoryApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { CATEGORY_TYPE, PLACEHOLDER_PRODUCT } from '../../utils/constants';
import { formatPrice, getPetIcon } from '../../utils/helpers';

const SORT_OPTIONS = [
  { v: 'newest',    l: 'Ən yeni' },
  { v: 'price_asc', l: 'Qiymət ↑' },
  { v: 'price_desc',l: 'Qiymət ↓' },
];

/* DTO helper-lər */
const getImg      = (p) => p.mainImageUrl || p.imageUrl || p.images?.[0]?.imageUrl || PLACEHOLDER_PRODUCT;
const getShop     = (p) => p.shopName || p.petShopName || p.petShop?.name || '';
const getCity     = (p) => p.city || p.shopCity || p.petShop?.city || '';
const getCat      = (p) => p.categoryName || p.category?.name || '';
const getAnimal   = (p) => p.targetAnimalCategoryName || p.targetAnimalName || p.targetCategoryName || p.targetAnimalCategory?.name || '';
const getAnimalId = (p) => p.targetAnimalCategoryId ?? p.targetAnimalCategory?.id ?? null;

/* Çip stili */
const chipCls = (active) =>
  `flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
    active
      ? 'bg-sky-600 text-white shadow-md'
      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
  }`;

const Shop = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [prodCats, setProdCats] = useState([]);
  const [animals, setAnimals]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('');
  const [animal, setAnimal] = useState('');   // ✅ heyvan kateqoriyası filtri
  const [sort, setSort]     = useState('newest');

  const [authModal, setAuthModal] = useState(false);
  const [addingId, setAddingId]   = useState(null);
  const [toast, setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  /* Həm məhsul, həm heyvan kateqoriyalarını yüklə */
  useEffect(() => {
    Promise.all([
      categoryApi.all(CATEGORY_TYPE.PRODUCT).catch(() => null),
      categoryApi.all(CATEGORY_TYPE.PET).catch(() => null),
    ]).then(([pRes, aRes]) => {
      if (pRes?.success) setProdCats(pRes.data || []);
      if (aRes?.success) setAnimals(aRes.data || []);
    });
  }, []);

  /* Məhsulları yüklə */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { pageSize: 100, sortBy: sort };
      if (search) params.search = search;
      if (cat)    params.categoryId = cat;
      if (animal) params.targetAnimalCategoryId = animal; // ✅ server dəstəkləyirsə orada filtrlənir

      const res = await productApi.list(params);
      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        setProducts(list.filter((p) => p.isActive !== false));
      }
    } catch (e) {
      console.error('Məhsullar yüklənmədi:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, cat, sort, animal]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ✅ Client-side backup filtr (server dəstəkləməsə belə işləyir) */
  const filtered = useMemo(() => products.filter((p) => {
    if (!animal) return true;
    const sel = animals.find((a) => String(a.id) === animal);
    return String(getAnimalId(p)) === animal || (sel && getAnimal(p) === sel.name);
  }), [products, animal, animals]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); };

  const handleAdd = async (e, p) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return setAuthModal(true);
    if ((p.stockQuantity ?? 0) <= 0) return;
    setAddingId(p.id);
    try {
      const res = await addToCart(p.id, 1);
      showToast(res?.success ? '✅ Səbətə əlavə olundu' : (res?.message || 'Əlavə edilmədi.'));
    } catch (err) {
      showToast(getError(err, 'Səbətə əlavə edilmədi.'));
    } finally {
      setAddingId(null);
    }
  };

  const discountPct = (p) =>
    p.discountPrice && p.price ? Math.round((1 - p.discountPrice / p.price) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} />

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">
          {toast}
        </div>
      )}

      {/* HERO */}
      <div className="bg-gradient-to-b from-sky-900/5 via-slate-50 to-transparent py-12 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-700 px-3 py-1.5 rounded-full text-[11px] font-bold">
            <Sparkles size={13} /> Təsdiqlənmiş mağazalardan rəsmi məhsullar
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Pet Mağaza 🛍️</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            Yem, aksesuar, oyuncaq və baxım vasitələri — hamısı bir yerdə.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* FİLTRLƏR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Məhsul, brend axtar..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-20 py-2.5 text-sm font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition" />
              <button type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-sky-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-sky-700 transition">
                Axtar
              </button>
            </form>

            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer">
              {SORT_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>

          {/* Məhsul kateqoriyası çipləri */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setCat('')} className={chipCls(!cat)}>Hamısı</button>
            {prodCats.map((c) => (
              <button key={c.id} onClick={() => setCat(String(c.id))} className={chipCls(cat === String(c.id))}>
                {c.name}
              </button>
            ))}
          </div>

          {/* ✅ HEYVAN KATEQORİYASI ÇİPLƏRİ (icon-lu) */}
          {animals.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1 pr-1">
                <PawPrint size={13} /> Heyvan:
              </span>
              <button onClick={() => setAnimal('')} className={chipCls(!animal)}>
                Hamısı
              </button>
              {animals.map((a) => (
                <button key={a.id} onClick={() => setAnimal(String(a.id))} className={chipCls(animal === String(a.id))}>
                  <span className="text-sm leading-none">{getPetIcon(a.name)}</span>
                  {a.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {!loading && (
          <p className="text-xs text-slate-500 font-semibold px-1">
            <span className="text-sky-600 font-bold">{filtered.length}</span> məhsul tapıldı
          </p>
        )}

        {/* SİYAHı */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="h-80 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
            <PackageX className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm font-semibold text-slate-600">Axtarışa uyğun məhsul tapılmadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((p) => {
              const pct = discountPct(p);
              const out = (p.stockQuantity ?? 0) <= 0;
              return (
                <div key={p.id}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <Link to={`/product/${p.id}`} className="relative block h-44 sm:h-52 bg-slate-100 overflow-hidden">
                    <img src={getImg(p)} alt={p.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${out ? 'opacity-50 grayscale' : ''}`} />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                      {pct > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow flex items-center gap-1">
                          <Tag size={10} /> -{pct}%
                        </span>
                      )}
                      {getCat(p) && (
                        <span className="bg-white/90 backdrop-blur text-sky-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200/60 shadow-sm">
                          {getCat(p)}
                        </span>
                      )}
                    </div>
                    {getAnimal(p) && (
                      <span className="absolute top-2.5 right-2.5 bg-slate-900/70 backdrop-blur text-white text-sm w-8 h-8 rounded-lg grid place-items-center">
                        {getPetIcon(getAnimal(p))}
                      </span>
                    )}
                    {out && (
                      <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-[11px] font-bold text-center py-1.5">
                        Stokda yoxdur
                      </span>
                    )}
                  </Link>

                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{p.brand}</p>
                    <Link to={`/product/${p.id}`}>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-sky-600 transition min-h-[2.5rem]">
                        {p.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1 truncate"><Store size={11} className="text-sky-500 shrink-0" /> {getShop(p)}</span>
                      {getCity(p) && <span className="flex items-center gap-0.5 shrink-0"><MapPin size={11} /> {getCity(p)}</span>}
                    </div>

                    <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                      <div>
                        {pct > 0 && (
                          <p className="text-[11px] text-slate-400 line-through font-semibold">{formatPrice(p.price)}</p>
                        )}
                        <p className="text-base font-black text-slate-900">{formatPrice(p.discountPrice ?? p.price)}</p>
                      </div>
                      <button onClick={(e) => handleAdd(e, p)} disabled={out || addingId === p.id}
                        className={`p-2.5 rounded-xl transition shadow-md ${
                          out ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 active:scale-95'
                        }`} title="Səbətə əlavə et">
                        {addingId === p.id
                          ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          : <Plus size={18} className="stroke-[2.5]" />}
                      </button>
                    </div>
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

export default Shop;