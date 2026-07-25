// src/utils/constants.js
export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  ADMIN: "Admin",
  CUSTOMER: "Customer",
  PET_SHOP: "PetShop",
  VET: "Veterinarian",
};

export const GENDER = { MALE: 1, FEMALE: 2 };
export const GENDER_TEXT = { 1: "Erkək", 2: "Dişi" };

export const PET_SIZE = { SMALL: 1, MEDIUM: 2, LARGE: 3 };
export const PET_SIZE_TEXT = { 1: "Kiçik", 2: "Orta", 3: "Böyük" };

export const OWNER_TYPE = { SHOP: 1, USER: 2 };
export const OWNER_TYPE_TEXT = { 1: "Mağaza", 2: "Şəxsi elan" };

export const ADOPTION_STATUS = { AVAILABLE: 1, PENDING: 2, ADOPTED: 3, INACTIVE: 4 };
export const ADOPTION_STATUS_TEXT = {
  1: "Sahiblənməyə hazır", 2: "Müraciət gözlənilir", 3: "Sahibləndirilib", 4: "Deaktiv",
};
export const ADOPTION_STATUS_COLOR = {
  1: "bg-teal-100 text-teal-700",
  2: "bg-amber-100 text-amber-700",
  3: "bg-slate-100 text-slate-600",
  4: "bg-slate-100 text-slate-500",
};

export const REQUEST_STATUS = { PENDING: 1, APPROVED: 2, REJECTED: 3, CANCELLED: 4 };
export const REQUEST_STATUS_TEXT = {
  1: "Gözləmədə", 2: "Təsdiqləndi", 3: "Rədd edildi", 4: "Ləğv edildi",
};
export const REQUEST_STATUS_COLOR = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-teal-100 text-teal-700",
  3: "bg-rose-100 text-rose-700",
  4: "bg-slate-100 text-slate-600",
};

export const APPOINTMENT_STATUS = {
  PENDING: 1, CONFIRMED: 2, COMPLETED: 3, CANCELLED: 4, NO_SHOW: 5,
};
export const APPOINTMENT_STATUS_TEXT = {
  1: "Gözləmədə", 2: "Təsdiqləndi", 3: "Tamamlandı", 4: "Ləğv edildi", 5: "Gəlmədi",
};
export const APPOINTMENT_STATUS_COLOR = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-teal-100 text-teal-700",
  3: "bg-emerald-100 text-emerald-700",
  4: "bg-rose-100 text-rose-700",
  5: "bg-slate-100 text-slate-600",
};

export const ORDER_STATUS = {
  PENDING: 1, CONFIRMED: 2, PREPARING: 3, SHIPPED: 4, DELIVERED: 5, CANCELLED: 6,
};
export const ORDER_STATUS_TEXT = {
  1: "Gözləmədə", 2: "Təsdiqləndi", 3: "Hazırlanır",
  4: "Göndərildi", 5: "Çatdırıldı", 6: "Ləğv edildi",
};
export const ORDER_STATUS_COLOR = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-sky-100 text-sky-700",
  3: "bg-indigo-100 text-indigo-700",
  4: "bg-violet-100 text-violet-700",
  5: "bg-teal-100 text-teal-700",
  6: "bg-rose-100 text-rose-700",
};

export const APPROVAL_STATUS = { PENDING: 1, APPROVED: 2, REJECTED: 3 };
export const APPROVAL_STATUS_TEXT = {
  1: "Təsdiq gözləyir", 2: "Təsdiqlənib", 3: "Rədd edilib",
};
export const APPROVAL_STATUS_COLOR = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-teal-100 text-teal-700",
  3: "bg-rose-100 text-rose-700",
};

export const CATEGORY_TYPE = { PET: 1, PRODUCT: 2, ARTICLE: 3 };

export const DAY_NAMES = {
  0: "Bazar", 1: "Bazar ertəsi", 2: "Çərşənbə axşamı", 3: "Çərşənbə",
  4: "Cümə axşamı", 5: "Cümə", 6: "Şənbə",
};

export const CITIES = [
  "Bakı", "Gəncə", "Sumqayıt", "Mingəçevir", "Şirvan", "Naxçıvan",
  "Şəki", "Yevlax", "Lənkəran", "Xankəndi", "Quba", "Qəbələ",
];

export const PLACEHOLDER_PET = "https://placehold.co/600x450/FFE6DA/FF7A45?text=ViViPaw";
export const PLACEHOLDER_PRODUCT = "https://placehold.co/600x600/F1F5F9/94A3B8?text=Product";
export const PLACEHOLDER_AVATAR = "https://placehold.co/200x200/FFE6DA/FF7A45?text=%F0%9F%90%BE";