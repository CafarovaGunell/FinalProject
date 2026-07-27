import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart, MapPin, Calendar, Syringe, Scissors, Palette, Ruler, Phone,
  Store, User as UserIcon, AlertCircle, CheckCircle2, X, Send,
  ChevronLeft, PawPrint, Mars, Venus, Home,
} from 'lucide-react';
import { petApi, adoptionApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import AuthModal from '../components/AuthModal';
import {
  ADOPTION_STATUS_TEXT, ADOPTION_STATUS_COLOR,
  PET_SIZE_TEXT, PLACEHOLDER_PET,
} from '../../utils/constants';

const HOUSING_TYPES = ['Mənzil', 'Həyət evi', 'Ev'];

const PetDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [authModal, setAuthModal] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', address: '',
    housingType: 'Mənzil', hasOtherPets: false, reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchPet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await petApi.byId(id);
      if (res?.success && res.data) setPet(res.data);
      else setNotFound(true);
    } catch (e) {
      e?.response?.status === 404 ? setNotFound(true) : console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPet(); }, [fetchPet]);

  /* Heyvan dəyişəndə şəkli sıfırla */
  useEffect(() => { setActiveImg(0); }, [id]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, fullName: f.fullName || user.fullName || '' }));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          <div className="h-[420px] bg-white rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 bg-white rounded-2xl animate-pulse" />
            <div className="h-6 w-1/2 bg-white rounded-2xl animate-pulse" />
            <div className="h-40 bg-white rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !pet) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full grid place-items-center mx-auto text-slate-400">
            <PawPrint size={30} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Elan tapılmadı</h2>
          <p className="text-sm text-slate-500">Bu elan silinmiş və ya mövcud deyil.</p>
          <Link to="/adopt" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition">
            <ChevronLeft size={16} /> Elanlara qayıt
          </Link>
        </div>
      </div>
    );
  }

  /* ✅ DÜZƏLİŞ: həm images (object), həm imageUrls (string) tutur */
  const imgs = (pet.images || pet.imageUrls || []).map((i) => i.imageUrl || i).filter(Boolean);
  const mainImg = pet.mainImageUrl || pet.imageUrl || imgs[0] || PLACEHOLDER_PET;
  const gallery = imgs.length ? [mainImg, ...imgs.filter((u) => u !== mainImg)] : [mainImg];

  const liked = isInWishlist(pet.id);
  const available = pet.adoptionStatus === 1;

  const handleWishlist = async () => {
    if (!user) return setAuthModal(true);
    await toggleWishlist(pet.id);
  };

  const openForm = () => {
    if (!user) return setAuthModal(true);
    setSuccess(false); setFormError(''); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.fullName.trim() || !form.phone.trim() || !form.reason.trim()) {
      return setFormError('Ad, telefon və müraciət səbəbi mütləq doldurulmalıdır.');
    }
    setSubmitting(true);
    try {
      const res = await adoptionApi.create({ petId: pet.id, ...form });
      if (res?.success) {
        setSuccess(true);
        setShowForm(false);
        fetchPet();
      } else setFormError(res?.message || 'Müraciət göndərilmədi.');
    } catch (err) {
      setFormError(getError(err, 'Müraciət göndərilmədi.'));
    } finally {
      setSubmitting(false);
    }
  };

  const chips = [
    { icon: Calendar, label: 'Yaş', value: pet.ageText },
    { icon: pet.gender === 2 ? Venus : Mars, label: 'Cinsiyyət', value: pet.genderText },
    { icon: Ruler, label: 'Ölçü', value: PET_SIZE_TEXT[pet.size] || pet.sizeText || '-' },
    { icon: Palette, label: 'Rəng', value: pet.color || '-' },
    { icon: Syringe, label: 'Peyvənd', value: pet.isVaccinated ? 'Vurulub ✅' : 'Yoxdur' },
    { icon: Scissors, label: 'Sterilizasiya', value: pet.isNeutered ? 'Olunub ✅' : 'Yoxdur' },
  ];

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/adopt" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition mb-6">
          <ChevronLeft size={16} /> Elanlara qayıt
        </Link>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-semibold flex items-center gap-3">
            <CheckCircle2 size={20} className="shrink-0" />
            <span>Müraciətiniz göndərildi! Nəticəni <Link to="/my-requests" className="underline font-bold">Müraciətlərim</Link> bölməsindən izləyə bilərsiniz.</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* QALEREYA */}
          <div className="space-y-3">
            <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              <img src={gallery[activeImg] || PLACEHOLDER_PET} alt={pet.name}
                className="w-full h-[340px] sm:h-[440px] object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border ${ADOPTION_STATUS_COLOR[pet.adoptionStatus]}`}>
                  {ADOPTION_STATUS_TEXT[pet.adoptionStatus]}
                </span>
                {pet.isUrgent && (
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-rose-500 text-white flex items-center gap-1">
                    <AlertCircle size={12} /> Təcili
                  </span>
                )}
              </div>
              <button onClick={handleWishlist}
                className={`absolute top-4 right-4 p-3 rounded-xl shadow-md border transition ${
                  liked ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-white/90 text-slate-400 hover:text-rose-500 border-slate-100'
                }`}>
                <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
              </button>
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      i === activeImg ? 'border-blue-600 ring-2 ring-blue-200' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MƏLUMAT */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900">{pet.name}</h1>
                  <p className="text-sm text-slate-500 font-semibold mt-1">{pet.breed} • {pet.categoryName}</p>
                </div>
                <span className="text-3xl">{pet.gender === 2 ? '🐾' : '🐾'}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-blue-500" /> {pet.city}</span>
                {pet.dateText && <span className="flex items-center gap-1"><Calendar size={14} /> {pet.dateText}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {chips.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-2xl p-3">
                  <Icon size={16} className="text-blue-500 mb-1.5" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Haqqında</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{pet.description}</p>
              {pet.healthNotes && (
                <p className="text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
                   {pet.healthNotes}
                </p>
              )}
              {pet.reasonToGiveAway && (
                <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                  <span className="font-bold">Səbəb:</span> {pet.reasonToGiveAway}
                </p>
              )}
            </div>

            {/* SAHİB */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  {pet.ownerType === 1 ? <Store size={20} /> : <UserIcon size={20} />}
                </div>
                <div>
                  {/* ✅ petShopName əlavə olundu (DTO-dakı real ad) */}
                  <p className="text-sm font-bold text-slate-900">
                    {pet.petShopName || pet.shopName || pet.ownerFullName || (pet.ownerType === 1 ? 'Mağaza' : 'Şəxsi elan')}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Phone size={11} /> {pet.contactPhone}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
                {pet.ownerType === 1 ? '🏪 Mağaza' : '👤 Şəxsi'}
              </span>
            </div>

            {/* MÜRACİƏT */}
            {available ? (
              <button onClick={openForm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                <Send size={17} /> Sahiblənmək üçün müraciət et
              </button>
            ) : (
              <div className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl text-sm text-center">
                {ADOPTION_STATUS_TEXT[pet.adoptionStatus]} — müraciət bağlanıb
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MÜRACİƏT MODALI */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl">
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Home size={22} /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{pet.name} üçün müraciət</h3>
                <p className="text-[11px] text-slate-400">Elan sahibi sizinlə əlaqə saxlayacaq</p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ad Soyad *</label>
                  <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Telefon *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0501234567" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ünvan</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yaşayış növü</label>
                  <select value={form.housingType} onChange={(e) => setForm({ ...form, housingType: e.target.value })} className={inputCls + ' cursor-pointer'}>
                    {HOUSING_TYPES.map((h) => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 pb-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.hasOtherPets}
                    onChange={(e) => setForm({ ...form, hasOtherPets: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <span className="text-xs font-semibold text-slate-600">Başqa heyvanım var</span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Niyə sahiblənmək istəyirsiz? *</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3} className={inputCls + ' resize-none'} placeholder="Şəraitiniz, təcrübəniz haqqında qısa yazın..." />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Send size={16} /> Göndər</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDetail;