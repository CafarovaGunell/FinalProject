export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
  PET_SHOP: 'PetShop',
  VET: 'Veterinarian',
};

export const GENDER_TEXT   = { 1: 'Erkək', 2: 'Dişi' };
export const PET_SIZE_TEXT = { 1: 'Kiçik', 2: 'Orta', 3: 'Böyük' };
export const OWNER_TYPE    = { SHOP: 1, USER: 2 };

export const ADOPTION_STATUS = { AVAILABLE: 1, PENDING: 2, ADOPTED: 3, INACTIVE: 4 };
export const ADOPTION_STATUS_TEXT = {
  1: 'Sahiblənməyə hazır', 2: 'Müraciət gözlənilir', 3: 'Sahibləndirilib', 4: 'Deaktiv',
};
export const ADOPTION_STATUS_COLOR = {
  1: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  2: 'bg-amber-50 text-amber-600 border-amber-200',
  3: 'bg-slate-100 text-slate-500 border-slate-200',
  4: 'bg-slate-100 text-slate-400 border-slate-200',
};

export const REQUEST_STATUS_TEXT = {
  1: 'Gözləmədə', 2: 'Təsdiqləndi', 3: 'Rədd edildi', 4: 'Ləğv edildi',
};
export const REQUEST_STATUS_COLOR = {
  1: 'bg-amber-50 text-amber-600 border-amber-200',
  2: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  3: 'bg-rose-50 text-rose-600 border-rose-200',
  4: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const APPOINTMENT_STATUS_TEXT = {
  1: 'Gözləmədə', 2: 'Təsdiqləndi', 3: 'Tamamlandı', 4: 'Ləğv edildi', 5: 'Gəlmədi',
};
export const APPOINTMENT_STATUS_COLOR = {
  1: 'bg-amber-50 text-amber-600 border-amber-200',
  2: 'bg-sky-50 text-sky-600 border-sky-200',
  3: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  4: 'bg-rose-50 text-rose-600 border-rose-200',
  5: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const ORDER_STATUS_TEXT = {
  1: 'Gözləmədə', 2: 'Təsdiqləndi', 3: 'Hazırlanır',
  4: 'Göndərildi', 5: 'Çatdırıldı', 6: 'Ləğv edildi',
};
export const ORDER_STATUS_COLOR = {
  1: 'bg-amber-50 text-amber-600 border-amber-200',
  2: 'bg-sky-50 text-sky-600 border-sky-200',
  3: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  4: 'bg-violet-50 text-violet-600 border-violet-200',
  5: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  6: 'bg-rose-50 text-rose-600 border-rose-200',
};

export const APPROVAL_STATUS_TEXT = {
  1: 'Təsdiq gözləyir', 2: 'Təsdiqlənib', 3: 'Rədd edilib',
};

export const CATEGORY_TYPE = { PET: 1, PRODUCT: 2, ARTICLE: 3 };

export const DAY_NAMES = {
  0: 'Bazar', 1: 'Bazar ertəsi', 2: 'Çərşənbə axşamı', 3: 'Çərşənbə',
  4: 'Cümə axşamı', 5: 'Cümə', 6: 'Şənbə',
};

export const CITIES = [
  'Bakı', 'Gəncə', 'Sumqayıt', 'Mingəçevir', 'Şirvan',
  'Naxçıvan', 'Şəki', 'Yevlax', 'Lənkəran', 'Quba', 'Qəbələ',
];

export const PET_ICONS = {
  'it': '🐶', 'pişik': '🐱', 'quş': '🦜',
  'balıq': '🐠', 'gəmirici': '🐹', 'digər': '🐾',
};

export const PLACEHOLDER_PET     = 'https://placehold.co/600x450/e0f2fe/0284c7?text=%F0%9F%90%BE';
export const PLACEHOLDER_PRODUCT = 'https://placehold.co/600x600/f1f5f9/94a3b8?text=Product';



