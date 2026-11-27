import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, X, ImagePlus, AlertCircle, Save,
} from 'lucide-react';
import {
  petApi, categoryApi, uploadApi, shopApi,
} from '../../../services/endpoints';
import { getError } from '../../../services/api';
import {
  CATEGORY_TYPE, CITIES, PET_SIZE_TEXT, PLACEHOLDER_PET,
} from '../../../utils/constants';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition';
const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-400';

const EMPTY = {
  name: '',
  breed: '',
  gender: 1,
  ageInMonths: '',
  size: 2,
  color: '',
  description: '',
  isVaccinated: false,
  isNeutered: false,
  healthNotes: '',
  categoryId: '',
  city: 'Bakı',
  address: '',
  contactPhone: '',
  reasonToGiveAway: '',
  isUrgent: false,
  imageUrls: [],
};

const fromList = (p, categories) => ({
  ...EMPTY,
  name: p.name || '',
  breed: p.breed || '',
  gender: p.gender || 1,
  ageInMonths: p.ageInMonths ?? '',
  size: p.size || 2,
  color: p.color || '',
  description: p.description || '',
  isVaccinated: !!p.isVaccinated,
  isNeutered: !!p.isNeutered,
  healthNotes: p.healthNotes || '',
  categoryId: p.categoryId
    ? String(p.categoryId)
    : (
      categories.find((c) => c.name === p.categoryName)?.id
        ? String(categories.find((c) => c.name === p.categoryName).id)
        : ''
    ),
  city: p.city || 'Bakı',
  address: p.address || '',
  contactPhone: p.contactPhone || '',
  reasonToGiveAway: p.reasonToGiveAway || '',
  isUrgent: !!p.isUrgent,
  imageUrls: p.imageUrls || (p.mainImageUrl ? [p.mainImageUrl] : []),
});

const PetModal = ({
  pet,
  categories,
  shop,
  onClose,
  onDone,
  showToast,
}) => {
  const [form, setForm] = useState(() => {
    if (pet) return fromList(pet, categories);

    return {
      ...EMPTY,
      city: shop?.city || 'Bakı',
      address: shop?.address || '',
      contactPhone: shop?.phone || '',
    };
  });

  const [loadingDetail, setLoadingDetail] = useState(!!pet);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!pet) {
      setForm((prev) => ({
        ...prev,
        city: shop?.city || prev.city || 'Bakı',
        address: shop?.address || '',
        contactPhone: shop?.phone || '',
      }));
      return;
    }

    let alive = true;
    setLoadingDetail(true);

    petApi.byId(pet.id)
      .then((res) => {
        if (!alive || !res?.success || !res.data) return;

        const d = res.data;

        const catId = d.categoryId
          ? String(d.categoryId)
          : (
            categories.find((c) => c.name === (d.categoryName || pet.categoryName))?.id
              ? String(
                categories.find((c) => c.name === (d.categoryName || pet.categoryName)).id
              )
              : ''
          );

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
          city: d.city || shop?.city || 'Bakı',
          address: d.address ?? shop?.address ?? '',
          contactPhone: d.contactPhone ?? shop?.phone ?? '',
          reasonToGiveAway: d.reasonToGiveAway ?? '',
          isUrgent: !!d.isUrgent,
          imageUrls: d.imageUrls || (d.mainImageUrl ? [d.mainImageUrl] : []),
        });
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoadingDetail(false);
      });

    return () => {
      alive = false;
    };
  }, [pet?.id, categories, shop]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setUploading(true);

    try {
      const res = await uploadApi.multiple(files, 'pets');

      const raw = Array.isArray(res?.data)
        ? res.data
        : (res?.data ? [res.data] : []);

      const urls = raw
        .map((d) => (typeof d === 'string' ? d : (d?.url || d?.imageUrl)))
        .filter(Boolean);

      setForm((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...urls],
      }));
    } catch (e2) {
      showToast(getError(e2, 'Şəkillər yüklənmədi.'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!form.name.trim() || !form.breed.trim() || !form.categoryId) {
      return setErr('Ad, cins və kateqoriya mütləqdir.');
    }

    if (form.ageInMonths === '' || form.ageInMonths === null) {
      return setErr('Yaş (ayla) daxil edin.');
    }

    if (form.contactPhone && form.contactPhone.length !== 10) {
      return setErr('Telefon nömrəsi 10 rəqəm olmalıdır. Məsələn: 0501234567');
    }

    setSaving(true);

    const payload = {
      ...form,
      ageInMonths: Number(form.ageInMonths),
      gender: Number(form.gender),
      size: Number(form.size),
      categoryId: Number(form.categoryId),

      // Yeni elanda mağaza məlumatlarını mütləq avtomatik istifadə edir
      city: pet ? form.city : (shop?.city || form.city),
      address: pet ? form.address : (shop?.address || form.address),
      contactPhone: pet ? form.contactPhone : (shop?.phone || form.contactPhone),
    };

    try {
      const res = pet
        ? await petApi.update(pet.id, payload)
        : await petApi.create(payload);

      if (res?.success) {
        onDone();
      } else {
        setErr(res?.message || 'Yadda saxlanmadı.');
      }
    } catch (e2) {
      setErr(getError(e2, 'Yadda saxlanmadı.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-4">
          {pet ? 'Elanı redaktə et' : 'Yeni heyvan elanı'}
          {loadingDetail && (
            <span className="ml-2 text-xs text-sky-500 font-semibold">
              məlumatlar yüklənir...
            </span>
          )}
        </h3>

        {err && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelCls}>Ad *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Cins *</label>
              <input
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Kateqoriya *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({
                  ...form,
                  categoryId: e.target.value,
                })}
                className={inputCls + ' cursor-pointer'}
              >
                <option value="">Seçin...</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Yaş (ay) *</label>
              <input
                type="number"
                min="0"
                value={form.ageInMonths}
                onChange={(e) => setForm({
                  ...form,
                  ageInMonths: e.target.value,
                })}
                className={inputCls}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Cinsiyyət</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({
                  ...form,
                  gender: e.target.value,
                })}
                className={inputCls + ' cursor-pointer'}
              >
                <option value={1}>Erkək</option>
                <option value={2}>Dişi</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Ölçü</label>
              <select
                value={form.size}
                onChange={(e) => setForm({
                  ...form,
                  size: e.target.value,
                })}
                className={inputCls + ' cursor-pointer'}
              >
                {[1, 2, 3].map((s) => (
                  <option key={s} value={s}>
                    {PET_SIZE_TEXT[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Rəng</label>
              <input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Şəhər</label>
              <select
                value={form.city}
                disabled={!pet}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={`${inputCls} cursor-pointer ${!pet ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Telefon və ünvan yalnız redaktədə görünür */}
            {pet && (
              <>
                <div className="space-y-1">
                  <label className={labelCls}>Ünvan</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({
                      ...form,
                      address: e.target.value,
                    })}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelCls}>Əlaqə telefonu</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={form.contactPhone}
                    onChange={(e) => {
                      const phone = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10);

                      setForm({
                        ...form,
                        contactPhone: phone,
                      });
                    }}
                    placeholder="0501234567"
                    maxLength={10}
                    className={inputCls}
                  />
                </div>
              </>
            )}
          </div>

          {!pet && (
            <p className="text-[11px] bg-sky-50 border border-sky-100 text-sky-700 rounded-xl px-3 py-2 font-semibold">
              Əlaqə telefonu, ünvan və şəhər mağaza profilinizdən avtomatik istifadə olunacaq.
            </p>
          )}

          <div className="space-y-1">
            <label className={labelCls}>Təsvir</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({
                ...form,
                description: e.target.value,
              })}
              rows={3}
              className={inputCls + ' resize-none'}
            />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Sağlamlıq qeydi</label>
            <input
              value={form.healthNotes}
              onChange={(e) => setForm({
                ...form,
                healthNotes: e.target.value,
              })}
              className={inputCls}
            />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Sahibləndirmə səbəbi</label>
            <input
              value={form.reasonToGiveAway}
              onChange={(e) => setForm({
                ...form,
                reasonToGiveAway: e.target.value,
              })}
              className={inputCls}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { k: 'isVaccinated', l: 'Peyvəndlənib' },
              { k: 'isNeutered', l: 'Sterilizasiya olunub' },
              { k: 'isUrgent', l: 'Təcili' },
            ].map(({ k, l }) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[k]}
                  onChange={(e) => setForm({
                    ...form,
                    [k]: e.target.checked,
                  })}
                  className="w-4 h-4 rounded accent-sky-600"
                />
                <span className="text-xs font-semibold text-slate-600">
                  {l}
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <p className={labelCls}>Şəkillər</p>

            <div className="flex flex-wrap gap-2">
              {form.imageUrls.map((url, i) => (
                <div key={i} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      imageUrls: prev.imageUrls.filter((_, index) => index !== i),
                    }))}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-1 rounded-full shadow"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}

              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 hover:border-sky-400 grid place-items-center cursor-pointer text-slate-400 hover:text-sky-500 transition">
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-400 border-t-transparent" />
                ) : (
                  <ImagePlus size={18} />
                )}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFiles}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading || loadingDetail}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save size={16} />
                {pet ? 'Yenilə' : 'Elan yarat'}
              </>
            )}
          </button>

          {!pet && (
            <p className="text-[10px] text-amber-600 text-center font-semibold">
              Yeni elanlar admin təsdiqindən sonra dərc olunur.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

const ShopPets = ({ showToast }) => {
  const [pets, setPets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [acting, setActing] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);

    try {
      const res = await petApi.mine();

      const list = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.items || []);

      /*
        AdoptionStatus:
        1 = Available
        2 = Pending
        3 = Adopted
        4 = Inactive

        Sahibləndirilmiş (3) heyvanlar mağaza elanlarında görünmür.
      */
      const visiblePets = list.filter((pet) => {
        const adoptionStatus = Number(
          pet.adoptionStatus ?? pet.status
        );

        return adoptionStatus !== 3;
      });

      setPets(visiblePets);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();

    categoryApi
      .all(CATEGORY_TYPE.PET)
      .then((res) => {
        if (res?.success) {
          setCategories(res.data || []);
        }
      })
      .catch(() => {});

    shopApi
      .mine()
      .then((res) => {
        if (res?.success) {
          setShop(res.data || null);
        }
      })
      .catch(() => {});
  }, [fetchList]);

  const remove = async (id) => {
    setActing(id);

    try {
      const res = await petApi.remove(id);

      if (res?.success) {
        setPets((previous) =>
          previous.filter((item) => item.id !== id)
        );

        showToast('🗑️ Elan silindi.');
      } else {
        showToast(res?.message || 'Elan silinə bilmədi.');
      }
    } catch (error) {
      showToast(getError(error, 'Elan silinə bilmədi.'));
    } finally {
      setActing(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {modal && (
        <PetModal
          pet={modal.pet}
          categories={categories}
          shop={shop}
          onClose={() => setModal(null)}
          showToast={showToast}
          onDone={() => {
            const isEdit = !!modal.pet;

            setModal(null);

            showToast(
              isEdit
                ? '✅ Elan yeniləndi.'
                : '✅ Elan yaradıldı. Admin təsdiqindən sonra dərc olunacaq.'
            );

            fetchList();
          }}
        />
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModal({ pet: null })}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition shadow-md shadow-sky-600/20"
        >
          <Plus size={16} />
          Yeni elan
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-48 bg-white rounded-2xl animate-pulse border border-slate-100"
            />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 text-sky-400 grid place-items-center mb-3">
            <ImagePlus size={24} />
          </div>

          <p className="text-sm text-slate-500 font-semibold">
            Hələ aktiv heyvan elanınız yoxdur.
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Yeni elan yaratmaq üçün yuxarıdakı düymədən istifadə edin.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => {
            const image =
              pet.mainImageUrl ||
              pet.imageUrl ||
              pet.imageUrls?.[0] ||
              PLACEHOLDER_PET;

            return (
              <div
                key={pet.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition"
              >
                <img
                  src={image}
                  alt={pet.name || ''}
                  className="w-full h-56 object-cover bg-slate-100"
                />

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {pet.name || 'Adsız heyvan'}
                    </h4>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        pet.isApproved === false
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {pet.isApproved === false
                        ? 'Təsdiq gözləyir'
                        : 'Aktiv'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-semibold truncate">
                    {pet.breed || 'Cins qeyd edilməyib'} •{' '}
                    {pet.ageText ||
                      (pet.ageInMonths !== undefined
                        ? `${pet.ageInMonths} ay`
                        : 'Yaş qeyd edilməyib')}
                  </p>

                  <p className="text-[11px] text-slate-400 font-semibold truncate">
                    {pet.city || 'Şəhər qeyd edilməyib'}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModal({ pet })}
                      className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1"
                    >
                      <Pencil size={12} />
                      Redaktə
                    </button>

                    {deleteId === pet.id ? (
                      <button
                        type="button"
                        onClick={() => remove(pet.id)}
                        disabled={acting === pet.id}
                        className="flex-1 py-2 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
                      >
                        {acting === pet.id ? 'Silinir...' : 'Təsdiqlə'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteId(pet.id)}
                        className="px-3 py-2 rounded-lg text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="Elanı sil"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {deleteId === pet.id && (
                    <button
                      type="button"
                      onClick={() => setDeleteId(null)}
                      className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-600 transition"
                    >
                      Geri
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};



export default ShopPets;