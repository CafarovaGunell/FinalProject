import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, X, ImagePlus, AlertCircle, Save,
} from 'lucide-react';
import { petApi, categoryApi, uploadApi } from '../../../services/endpoints';
import { getError } from '../../../services/api';
import { CATEGORY_TYPE, CITIES, PET_SIZE_TEXT, PLACEHOLDER_PET } from '../../../utils/constants';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

const EMPTY = {
  name: '', breed: '', gender: 1, ageInMonths: '', size: 2, color: '',
  description: '', isVaccinated: false, isNeutered: false, healthNotes: '',
  categoryId: '', city: 'Bakı', address: '', contactPhone: '',
  reasonToGiveAway: '', isUrgent: false, imageUrls: [],
};

/* Siyahı obyektindən sürətli ilkin doldurma */
const fromList = (p, categories) => ({
  ...EMPTY,
  name: p.name || '', breed: p.breed || '', gender: p.gender || 1,
  ageInMonths: p.ageInMonths ?? '', size: p.size || 2, color: p.color || '',
  description: p.description || '', isVaccinated: !!p.isVaccinated,
  isNeutered: !!p.isNeutered, healthNotes: p.healthNotes || '',
  categoryId: p.categoryId ? String(p.categoryId)
    : (categories.find((c) => c.name === p.categoryName)?.id ? String(categories.find((c) => c.name === p.categoryName).id) : ''),
  city: p.city || 'Bakı', address: p.address || '',
  contactPhone: p.contactPhone || '', reasonToGiveAway: p.reasonToGiveAway || '',
  isUrgent: !!p.isUrgent,
  imageUrls: p.imageUrls || (p.mainImageUrl ? [p.mainImageUrl] : []),
});

/* ═══════════ FORM MODALI ═══════════ */
const PetModal = ({ pet, categories, onClose, onDone, showToast }) => {
  const [form, setForm] = useState(pet ? fromList(pet, categories) : EMPTY);
  const [loadingDetail, setLoadingDetail] = useState(!!pet);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  /* ✅ REDAKTƏ: detail-dən TAM məlumatı çək, bütün sahələri doldur */
  useEffect(() => {
    if (!pet) return;
    let alive = true;
    setLoadingDetail(true);
    petApi.byId(pet.id)
      .then((res) => {
        if (!alive || !res?.success || !res.data) return;
        const d = res.data;
        const catId = d.categoryId
          ? String(d.categoryId)
          : (categories.find((c) => c.name === (d.categoryName || pet.categoryName))?.id
            ? String(categories.find((c) => c.name === (d.categoryName || pet.categoryName)).id)
            : '');
        setForm({
          name: d.name ?? '',
          breed: d.breed ?? '',
          gender: d.gender ?? 1,
          ageInMonths: d.ageInMonths ?? '',
          size: d.size ?? 2,
          color: d.color ?? '',
          description: d.description ?? '',
          isVaccinated: !!d.isVaccinated,
          isNeutered: !!d.isNeutered,
          healthNotes: d.healthNotes ?? '',
          categoryId: catId,
          city: d.city || 'Bakı',
          address: d.address ?? '',
          contactPhone: d.contactPhone ?? '',
          reasonToGiveAway: d.reasonToGiveAway ?? '',
          isUrgent: !!d.isUrgent,
          imageUrls: d.imageUrls || (d.mainImageUrl ? [d.mainImageUrl] : []),
        });
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoadingDetail(false); });
    return () => { alive = false; };
  }, [pet?.id, categories]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const res = await uploadApi.multiple(files, 'pets');
      const raw = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
      const urls = raw.map((d) => (typeof d === 'string' ? d : d.url)).filter(Boolean);
      setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }));
    } catch (e2) { showToast(getError(e2, 'Şəkillər yüklənmədi.')); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim() || !form.breed.trim() || !form.categoryId) return setErr('Ad, cins və kateqoriya mütləqdir.');
    if (!form.ageInMonths && form.ageInMonths !== 0) return setErr('Yaş (ayla) daxil edin.');
    setSaving(true);
    const payload = {
      ...form,
      ageInMonths: Number(form.ageInMonths),
      gender: Number(form.gender),
      size: Number(form.size),
      categoryId: Number(form.categoryId),
    };
    try {
      const res = pet ? await petApi.update(pet.id, payload) : await petApi.create(payload);
      if (res?.success) onDone();
      else setErr(res?.message || 'Yadda saxlanmadı.');
    } catch (e2) { setErr(getError(e2, 'Yadda saxlanmadı.')); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"><X size={18} /></button>
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          {pet ? 'Elanı redaktə et' : 'Yeni heyvan elanı'}
          {loadingDetail && <span className="ml-2 text-xs text-sky-500 font-semibold">məlumatlar yüklənir...</span>}
        </h3>

        {err && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2"><AlertCircle size={15} className="shrink-0 mt-0.5" /> {err}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1"><label className={labelCls}>Ad *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Cins *</label>
              <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Kateqoriya *</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls + ' cursor-pointer'}>
                <option value="">Seçin...</option>
                {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select></div>
            <div className="space-y-1"><label className={labelCls}>Yaş (ay) *</label>
              <input type="number" min="0" value={form.ageInMonths} onChange={(e) => setForm({ ...form, ageInMonths: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Cinsiyyət</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputCls + ' cursor-pointer'}>
                <option value={1}>Erkək</option><option value={2}>Dişi</option>
              </select></div>
            <div className="space-y-1"><label className={labelCls}>Ölçü</label>
              <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className={inputCls + ' cursor-pointer'}>
                {[1,2,3].map((s) => <option key={s} value={s}>{PET_SIZE_TEXT[s]}</option>)}
              </select></div>
            <div className="space-y-1"><label className={labelCls}>Rəng</label>
              <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Şəhər</label>
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls + ' cursor-pointer'}>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div className="space-y-1"><label className={labelCls}>Ünvan</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} /></div>
            <div className="space-y-1"><label className={labelCls}>Əlaqə telefonu</label>
              <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputCls} /></div>
          </div>

          <div className="space-y-1"><label className={labelCls}>Təsvir</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls + ' resize-none'} /></div>
          <div className="space-y-1"><label className={labelCls}>Sağlamlıq qeydi</label>
            <input value={form.healthNotes} onChange={(e) => setForm({ ...form, healthNotes: e.target.value })} className={inputCls} /></div>
          <div className="space-y-1"><label className={labelCls}>Sahibləndirmə səbəbi</label>
            <input value={form.reasonToGiveAway} onChange={(e) => setForm({ ...form, reasonToGiveAway: e.target.value })} className={inputCls} /></div>

          <div className="flex flex-wrap gap-4">
            {[
              { k: 'isVaccinated', l: 'Peyvəndlənib' },
              { k: 'isNeutered', l: 'Sterilizasiya olunub' },
              { k: 'isUrgent', l: 'Təcili' },
            ].map(({ k, l }) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="w-4 h-4 rounded accent-sky-600" />
                <span className="text-xs font-semibold text-slate-600">{l}</span>
              </label>
            ))}
          </div>

          {/* ŞƏKİLLƏR */}
          <div className="space-y-2">
            <p className={labelCls}>Şəkillər</p>
            <div className="flex flex-wrap gap-2">
              {form.imageUrls.map((u, i) => (
                <div key={i} className="relative">
                  <img src={u} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, j) => j !== i) }))}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-1 rounded-full shadow"><X size={11} /></button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 hover:border-sky-400 grid place-items-center cursor-pointer text-slate-400 hover:text-sky-500 transition">
                {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-400 border-t-transparent" /> : <ImagePlus size={18} />}
                <input type="file" accept="image/*" multiple onChange={onFiles} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <button type="submit" disabled={saving || uploading || loadingDetail}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Save size={16} /> {pet ? 'Yenilə' : 'Elan yarat'}</>}
          </button>
          {!pet && <p className="text-[10px] text-amber-600 text-center font-semibold">Yeni elanlar admin təsdiqindən sonra dərc olunur.</p>}
        </form>
      </div>
    </div>
  );
};

/* ═══════════ SİYAHı ═══════════ */
const ShopPets = ({ showToast }) => {
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [acting, setActing] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await petApi.mine();
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      setPets(list);
    } catch { setPets([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchList();
    categoryApi.all(CATEGORY_TYPE.PET).then((r) => r?.success && setCategories(r.data || [])).catch(() => {});
  }, [fetchList]);

  const remove = async (id) => {
    setActing(id);
    try {
      const res = await petApi.remove(id);
      if (res?.success) { setPets((p) => p.filter((x) => x.id !== id)); showToast('Elan silindi'); }
      else showToast(res?.message || 'Silinmədi.');
    } catch (e) { showToast(getError(e, 'Silinmədi.')); }
    finally { setActing(null); setDeleteId(null); }
  };

  return (
    <div className="space-y-4">
      {modal && (
        <PetModal pet={modal.pet} categories={categories} onClose={() => setModal(null)}
          showToast={showToast}
          onDone={() => { setModal(null); showToast(modal.pet ? '✅ Elan yeniləndi' : '✅ Elan yaradıldı'); fetchList(); }} />
      )}

      <div className="flex justify-end">
        <button onClick={() => setModal({ pet: null })}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-md">
          <Plus size={16} /> Yeni elan
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : pets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-sm text-slate-400 font-semibold">
          Hələ heyvan elanınız yoxdur.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition">
              <img src={p.mainImageUrl || PLACEHOLDER_PET} alt={p.name} className="w-full h-36 object-cover bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{p.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    p.isApproved === false ? 'bg-amber-50 text-amber-600' : p.adoptionStatus === 3 ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {p.isApproved === false ? 'Təsdiq gözləyir' : p.adoptionStatus === 3 ? 'Sahibləndirilib' : 'Aktiv'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold truncate">{p.breed} • {p.ageText || `${p.ageInMonths} ay`}</p>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setModal({ pet: p })}
                    className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1">
                    <Pencil size={12} /> Redaktə
                  </button>
                  {deleteId === p.id ? (
                    <button onClick={() => remove(p.id)} disabled={acting === p.id}
                      className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-rose-600 text-white transition disabled:opacity-50">
                      {acting === p.id ? '...' : 'Təsdiqlə'}
                    </button>
                  ) : (
                    <button onClick={() => setDeleteId(p.id)}
                      className="px-3 py-2 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 transition">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                {deleteId === p.id && (
                  <button onClick={() => setDeleteId(null)} className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-600">Geri</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPets;