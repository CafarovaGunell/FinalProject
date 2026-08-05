import React, { useState, useEffect, useCallback } from 'react';
import {
  LuPlus, LuPencil, LuTrash2, LuMapPin, LuCheck, LuX,
  LuClock, LuImage, LuInbox, LuMessageSquare, LuPhone,
} from 'react-icons/lu';
import { petApi, categoryApi, adoptionApi, uploadApi } from '../../services/endpoints';
import { getError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import {
  CATEGORY_TYPE, CITIES, GENDER_TEXT,
  ADOPTION_STATUS_TEXT, ADOPTION_STATUS_COLOR, PLACEHOLDER_PET,
} from '../../utils/constants';

const emptyForm = {
  name: '', breed: '', categoryId: '', gender: 1, ageInMonths: 6, size: 2,
  color: '', description: '', isVaccinated: false, isNeutered: false, isUrgent: false,
  city: 'Bakı', address: '', contactPhone: '', reasonToGiveAway: '', healthNotes: '',
};

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition';

const MyPets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [reqPet, setReqPet] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [busyReq, setBusyReq] = useState(null);

  const [toast, setToast] = useState('');
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const fetchPets = useCallback(async () => {
    setLoading(true);
    const res = await petApi.mine().catch(() => null);
    const d = res?.data;
    setPets(Array.isArray(d) ? d : (d?.items || []));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return setAuthModal(true);
    fetchPets();
    categoryApi.all(CATEGORY_TYPE.PET)
      .then((r) => r?.success && setCats(r.data || []))
      .catch(() => {});
  }, [user, fetchPets]);

  /* ── Şəkil upload ── */
  const onFiles = async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    setUploading(true);
    try {
      const res = await uploadApi.multiple(files, 'pets');
      const urls = (Array.isArray(res?.data) ? res.data : [])
        .map((u) => (typeof u === 'string' ? u : u?.url || u?.imageUrl))
        .filter(Boolean);
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      showToast(getError(err, 'Şəkil yüklənmədi'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setImages([]);
    setFormError('');
    setFormOpen(true);
  };

  /* ✅ REDAKTƏ: əvvəl siyahıdan tez doldur, sonra detail-dən TAM məlumatı çək */
  const openEdit = async (p) => {
    setEditId(p.id);
    setFormError('');
    setFormOpen(true);
    setFormLoading(true);

    setForm({
      name: p.name || '', breed: p.breed || '',
      categoryId: p.categoryId ? String(p.categoryId) : '',
      gender: p.gender || 1, ageInMonths: p.ageInMonths ?? 6, size: p.size || 2,
      color: p.color || '', description: p.description || '',
      isVaccinated: !!p.isVaccinated, isNeutered: !!p.isNeutered, isUrgent: !!p.isUrgent,
      city: p.city || 'Bakı', address: p.address || '', contactPhone: p.contactPhone || '',
      reasonToGiveAway: p.reasonToGiveAway || '', healthNotes: p.healthNotes || '',
    });
    setImages(p.imageUrls || (p.mainImageUrl ? [p.mainImageUrl] : []));

    const res = await petApi.byId(p.id).catch(() => null);
    const d = res?.success ? res.data : null;
    setFormLoading(false);
    if (!d) return;

    const catId = d.categoryId ?? p.categoryId ??
      cats.find((c) => c.name === (d.categoryName || p.categoryName))?.id ?? '';

    setForm({
      name: d.name ?? '',
      breed: d.breed ?? '',
      categoryId: catId ? String(catId) : '',
      gender: d.gender ?? 1,
      ageInMonths: d.ageInMonths ?? 0,
      size: d.size ?? 2,
      color: d.color ?? '',
      description: d.description ?? '',
      isVaccinated: !!d.isVaccinated,
      isNeutered: !!d.isNeutered,
      isUrgent: !!d.isUrgent,
      city: d.city || 'Bakı',
      address: d.address ?? '',
      contactPhone: d.contactPhone ?? '',
      reasonToGiveAway: d.reasonToGiveAway ?? '',
      healthNotes: d.healthNotes ?? '',
    });
    setImages(d.imageUrls || (d.mainImageUrl ? [d.mainImageUrl] : []));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.breed.trim() || !form.categoryId || !form.description.trim())
      return setFormError('Ad, cins, kateqoriya və təsvir mütləqdir.');
    setSaving(true);
    setFormError('');
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      ageInMonths: Number(form.ageInMonths) || 0,
      imageUrls: images,
    };
    try {
      const res = editId ? await petApi.update(editId, payload) : await petApi.create(payload);
      if (res?.success) {
        showToast(editId ? '✅ Elan yeniləndi' : '✅ Elan yaradıldı');
        setFormOpen(false);
        fetchPets();
      } else setFormError(res?.message || 'Yadda saxlanılmadı');
    } catch (err) {
      setFormError(getError(err, 'Yadda saxlanılmadı'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`"${p.name}" elanı silinsin?`)) return;
    const res = await petApi.remove(p.id).catch((e) => ({ success: false, message: getError(e) }));
    showToast(res?.success ? '🗑️ Elan silindi' : (res?.message || 'Silinmədi'));
    if (res?.success) fetchPets();
  };

  /* ── Müraciətlər ── */
  const openRequests = async (p) => {
    setReqPet(p);
    setReqLoading(true);
    const res = await adoptionApi.byPet(p.id).catch(() => null);
    const d = res?.data;
    setRequests(Array.isArray(d) ? d : (d?.items || []));
    setReqLoading(false);
  };

  const reviewReq = async (r, status) => {
    setBusyReq(r.id);
    const res = await adoptionApi.review(r.id, { status, reviewNote: '', note: '' })
      .catch((e) => ({ success: false, message: getError(e) }));
    showToast(res?.success ? (status === 2 ? '✅ Müraciət təsdiqləndi' : '🚫 Müraciət rədd edildi') : (res?.message || 'Əməliyyat alınmadı'));
    if (res?.success) openRequests(reqPet);
    setBusyReq(null);
  };

  const statusBadge = (p) => {
    if (!p.isApproved) return <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1 w-fit"><LuClock size={11} /> Admin təsdiqi gözləyir</span>;
    return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 w-fit ${ADOPTION_STATUS_COLOR[p.adoptionStatus]}`}>{ADOPTION_STATUS_TEXT[p.adoptionStatus]}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} />
      {toast && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl">{toast}</div>}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Elanlarım 🐾</h1>
            <p className="text-sm text-slate-500 mt-0.5">Heyvan elanlarını idarə et, müraciətlərə bax</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-600/20">
            <LuPlus size={16} /> Yeni elan
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-72 bg-white rounded-2xl animate-pulse border border-slate-200" />)}</div>
        ) : pets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
            <LuInbox className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm font-semibold text-slate-600 mb-4">Hələ elanın yoxdur.</p>
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-5 py-3 rounded-xl transition">
              <LuPlus size={16} /> İlk elanını ver
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
                <div className="relative h-44 bg-slate-100">
                  <img src={p.mainImageUrl || PLACEHOLDER_PET} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5">{statusBadge(p)}</div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div>
                    <p className="font-black text-slate-900">{p.name}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">{p.breed} • {p.categoryName} • {GENDER_TEXT[p.gender]}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1"><LuMapPin size={11} /> {p.city}</p>
                  <div className="mt-auto flex gap-2 pt-2">
                    <button onClick={() => openRequests(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-bold py-2 rounded-xl transition">
                      <LuMessageSquare size={13} /> Müraciətlər
                    </button>
                    <button onClick={() => openEdit(p)} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 transition"><LuPencil size={14} /></button>
                    <button onClick={() => remove(p)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition"><LuTrash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── YARAT / REDAKTƏ MODALI ── */}
      {formOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => !formLoading && setFormOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setFormOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><LuX size={16} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editId ? 'Elanı redaktə et' : 'Yeni elan'}
              {formLoading && <span className="ml-2 text-xs text-sky-500 font-semibold">məlumatlar yüklənir...</span>}
            </h3>

            {formError && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">{formError}</div>}

            <form onSubmit={submit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ad *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cins *</label>
                  <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} className={inputCls} /></div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kateqoriya *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls + ' cursor-pointer'}>
                    <option value="">Seçin</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cinsiyyət</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })} className={inputCls + ' cursor-pointer'}>
                    <option value={1}>Erkək</option><option value={2}>Dişi</option>
                  </select></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ölçü</label>
                  <select value={form.size} onChange={(e) => setForm({ ...form, size: Number(e.target.value) })} className={inputCls + ' cursor-pointer'}>
                    <option value={1}>Kiçik</option><option value={2}>Orta</option><option value={3}>Böyük</option>
                  </select></div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yaş (ay)</label>
                  <input type="number" min="0" value={form.ageInMonths} onChange={(e) => setForm({ ...form, ageInMonths: e.target.value })} className={inputCls} /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rəng</label>
                  <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls} /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Şəhər</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls + ' cursor-pointer'}>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select></div>
              </div>

              <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Təsvir *</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls + ' resize-none'} /></div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ünvan</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Əlaqə telefonu</label>
  <input
    value={form.contactPhone}
    onChange={(e) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, contactPhone: val });
    }}
    inputMode="numeric"
    maxLength={10}
    placeholder="0501234567"
    className={inputCls}
  />
  <p className={`text-[10px] font-semibold mt-0.5 ${form.contactPhone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
    {form.contactPhone.length}/10 rəqəm
  </p>
</div>
              </div>

              <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sağlamlıq qeydi</label>
                <input value={form.healthNotes} onChange={(e) => setForm({ ...form, healthNotes: e.target.value })} className={inputCls} /></div>

              <div><label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Səbəb (şəxsi elanlar üçün)</label>
                <input value={form.reasonToGiveAway} onChange={(e) => setForm({ ...form, reasonToGiveAway: e.target.value })} className={inputCls} /></div>

              <div className="flex flex-wrap gap-4 py-1">
                {[
                  { k: 'isVaccinated', l: 'Peyvənd vurulub' },
                  { k: 'isNeutered', l: 'Sterilizasiya olunub' },
                  { k: 'isUrgent', l: 'Təcili' },
                ].map((c) => (
                  <label key={c.k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[c.k]} onChange={(e) => setForm({ ...form, [c.k]: e.target.checked })} className="w-4 h-4 rounded accent-sky-600" />
                    <span className="text-xs font-semibold text-slate-600">{c.l}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><LuImage size={12} /> Şəkillər</label>
                <input type="file" accept="image/*" multiple onChange={onFiles} disabled={uploading}
                  className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100 file:cursor-pointer cursor-pointer" />
                {uploading && <p className="text-[11px] text-sky-600 font-semibold mt-1">Yüklənir...</p>}
                {images.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {images.map((url, i) => (
                      <div key={i} className="relative shrink-0">
                        <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                        <button type="button" onClick={() => setImages(images.filter((_, x) => x !== i))}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"><LuX size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={saving || formLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <LuCheck size={16} />}
                {editId ? 'Yadda saxla' : 'Elanı dərc et'}
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                {user?.roles?.includes('PetShop') ? 'Mağaza elanları avtomatik təsdiqlənir.' : 'Şəxsi elanlar admin təsdiqindən sonra dərc olunur.'}
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ── MÜRACİƏTLƏR MODALI ── */}
      {reqPet && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setReqPet(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setReqPet(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><LuX size={16} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">"{reqPet.name}" üçün müraciətlər</h3>
            <p className="text-[11px] text-slate-400 mb-4">Təsdiqləsən, heyvan sahibləndirilmiş sayılır</p>

            {reqLoading ? (
              <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />)}</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10">
                <LuInbox className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-sm text-slate-500 font-semibold">Hələ müraciət yoxdur.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">{r.applicantFullName || r.fullName}</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                        r.status === 1 ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : r.status === 2 ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                        {r.status === 1 ? 'Gözləyir' : r.status === 2 ? 'Təsdiqlənib' : 'Rədd'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1"><LuPhone size={11} /> {r.phone}</p>
                    <p className="text-xs text-slate-600">{r.reason}</p>
                    {r.status === 1 && (
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => reviewReq(r, 2)} disabled={busyReq === r.id}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition disabled:opacity-50">
                          <LuCheck size={13} /> Təsdiq et
                        </button>
                        <button onClick={() => reviewReq(r, 3)} disabled={busyReq === r.id}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2 rounded-xl transition">
                          <LuX size={13} /> Rədd et
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPets;


