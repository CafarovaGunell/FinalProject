
import api from "./axios";

const unwrap = (p) => p.then((r) => r.data);

export const authApi = {
  login: (d) => unwrap(api.post("/Auth/login", d)),
  register: (d) => unwrap(api.post("/Auth/register", d)),
  me: () => unwrap(api.get("/Auth/me")),
  logout: (refreshToken) =>
    unwrap(api.post("/Auth/logout", { accessToken: "", refreshToken })),
  changePassword: (d) => unwrap(api.post("/Auth/change-password", d)),
};

export const userApi = {
  profile: () => unwrap(api.get("/User/profile")),
  update: (d) => unwrap(api.put("/User/profile", d)),
};

export const uploadApi = {
  single: (file, folder = "misc") => {
    const fd = new FormData();
    fd.append("file", file);
    return unwrap(
      api.post(`/Upload/single?folder=${folder}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
  multiple: (files, folder = "misc") => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    return unwrap(
      api.post(`/Upload/multiple?folder=${folder}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
};

export const categoryApi = {
  all: (type) => unwrap(api.get("/Category", { params: { type } })),
};

export const petApi = {
  list: (params) => unwrap(api.get("/Pet", { params })),
  byId: (id) => unwrap(api.get(`/Pet/${id}`)),
  mine: () => unwrap(api.get("/Pet/my-pets")),
  create: (d) => unwrap(api.post("/Pet", d)),
  update: (id, d) => unwrap(api.put(`/Pet/${id}`, d)),
  remove: (id) => unwrap(api.delete(`/Pet/${id}`)),
};

export const adoptionApi = {
  create: (d) => unwrap(api.post("/adoption-requests", d)),
  mine: () => unwrap(api.get("/adoption-requests/my-requests")),
  received: () => unwrap(api.get("/adoption-requests/received")),
  byPet: (petId) => unwrap(api.get(`/adoption-requests/by-pet/${petId}`)),
  review: (id, d) => unwrap(api.put(`/adoption-requests/${id}/review`, d)),
  cancel: (id) => unwrap(api.put(`/adoption-requests/${id}/cancel`)),
};

export const wishlistApi = {
  list: () => unwrap(api.get("/wishlist")),
  ids: () => unwrap(api.get("/wishlist/ids")),
  toggle: (petId) => unwrap(api.post(`/wishlist/toggle/${petId}`)),
};

export const shopApi = {
  list: (city) => unwrap(api.get("/PetShop", { params: { city } })),
  byId: (id) => unwrap(api.get(`/PetShop/${id}`)),
  mine: () => unwrap(api.get("/PetShop/my-shop")),
  create: (d) => unwrap(api.post("/PetShop", d)),
  update: (d) => unwrap(api.put("/PetShop", d)),
};

export const productApi = {
  list: (params) => unwrap(api.get("/Product", { params })),
  byId: (id) => unwrap(api.get(`/Product/${id}`)),
  mine: () => unwrap(api.get("/Product/my-products")),
  create: (d) => unwrap(api.post("/Product", d)),
  update: (id, d) => unwrap(api.put(`/Product/${id}`, d)),
  remove: (id) => unwrap(api.delete(`/Product/${id}`)),
  reviews: (productId) => unwrap(api.get(`/product-reviews/by-product/${productId}`)),
  addReview: (d) => unwrap(api.post("/product-reviews", d)),
};

export const cartApi = {
  get: () => unwrap(api.get("/Cart")),
  add: (d) => unwrap(api.post("/Cart/add", d)),
  updateItem: (id, quantity) => unwrap(api.put(`/Cart/items/${id}`, { quantity })),
  removeItem: (id) => unwrap(api.delete(`/Cart/items/${id}`)),
  clear: () => unwrap(api.delete("/Cart/clear")),
};

export const orderApi = {
  checkout: (d) => unwrap(api.post("/Order/checkout", d)),
  mine: () => unwrap(api.get("/Order/my-orders")),
  byId: (id) => unwrap(api.get(`/Order/${id}`)),
  shopOrders: (status) => unwrap(api.get("/Order/shop-orders", { params: { status } })),
  setStatus: (id, d) => unwrap(api.put(`/Order/${id}/status`, d)),
  cancel: (id, reason) => unwrap(api.put(`/Order/${id}/cancel`, null, { params: { reason } })),
};

export const vetApi = {
  list: (params) => unwrap(api.get("/vet-profile", { params })),
  byId: (id) => unwrap(api.get(`/vet-profile/${id}`)),
  me: () => unwrap(api.get("/vet-profile/me")),
  create: (d) => unwrap(api.post("/vet-profile", d)),
  update: (d) => unwrap(api.put("/vet-profile", d)),

  services: (vetId) => unwrap(api.get(`/vet-management/${vetId}/services`)),
  addService: (d) => unwrap(api.post("/vet-management/services", d)),
  updateService: (id, d) => unwrap(api.put(`/vet-management/services/${id}`, d)),
  removeService: (id) => unwrap(api.delete(`/vet-management/services/${id}`)),

  schedules: (vetId) => unwrap(api.get(`/vet-management/${vetId}/schedules`)),
  addSchedule: (d) => unwrap(api.post("/vet-management/schedules", d)),
  removeSchedule: (id) => unwrap(api.delete(`/vet-management/schedules/${id}`)),

  timeOffs: () => unwrap(api.get("/vet-management/time-offs")),
  addTimeOff: (d) => unwrap(api.post("/vet-management/time-offs", d)),
  removeTimeOff: (id) => unwrap(api.delete(`/vet-management/time-offs/${id}`)),
};

export const appointmentApi = {
  slots: (vetProfileId, date, serviceId) =>
    unwrap(api.get("/appointments/slots", { params: { vetProfileId, date, serviceId } })),
  create: (d) => unwrap(api.post("/appointments", d)),
  mine: (status) => unwrap(api.get("/appointments/my-appointments", { params: { status } })),
  vetList: (status, date) =>
    unwrap(api.get("/appointments/vet-appointments", { params: { status, date } })),
  setStatus: (id, status, reason) =>
    unwrap(api.put(`/appointments/${id}/status`, null, { params: { status, reason } })),
  cancel: (id, reason) =>
    unwrap(api.put(`/appointments/${id}/cancel`, null, { params: { reason } })),
};

export const testimonialApi = {
  list: () => unwrap(api.get("/Testimonial")),
  mine: () => unwrap(api.get("/Testimonial/mine")),
  create: (d) => unwrap(api.post("/Testimonial", d)),
  like: (id) => unwrap(api.post(`/Testimonial/${id}/like`)),
  remove: (id) => unwrap(api.delete(`/Testimonial/${id}`)),
};

export const articleApi = {
  list: (params) => unwrap(api.get("/Article", { params })),
  bySlug: (slug) => unwrap(api.get(`/Article/${slug}`)),
  mine: () => unwrap(api.get("/Article/mine")),
  create: (d) => unwrap(api.post("/Article", d)),
  update: (id, d) => unwrap(api.put(`/Article/${id}`, d)),
  remove: (id) => unwrap(api.delete(`/Article/${id}`)),
};

export const notificationApi = {
  list: (unreadOnly = false) => unwrap(api.get("/Notification", { params: { unreadOnly } })),
  unreadCount: () => unwrap(api.get("/Notification/unread-count")),
  read: (id) => unwrap(api.put(`/Notification/${id}/read`)),
  readAll: () => unwrap(api.put("/Notification/read-all")),
  remove: (id) => unwrap(api.delete(`/Notification/${id}`)),
};

export const adminApi = {
  dashboard: () => unwrap(api.get("/Admin/dashboard")),
  shops: (status) => unwrap(api.get("/Admin/shops", { params: { status } })),
  approveShop: (id, d) => unwrap(api.put(`/Admin/shops/${id}/approval`, d)),
  vets: (status) => unwrap(api.get("/Admin/vets", { params: { status } })),
  approveVet: (id, d) => unwrap(api.put(`/Admin/vets/${id}/approval`, d)),
  pendingPets: (page, pageSize) =>
    unwrap(api.get("/Admin/pets/pending", { params: { page, pageSize } })),
  approvePet: (id, approve, reason) =>
    unwrap(api.put(`/Admin/pets/${id}/approve`, null, { params: { approve, reason } })),
  orders: (status) => unwrap(api.get("/Admin/orders", { params: { status } })),
  pendingTestimonials: () => unwrap(api.get("/Admin/testimonials/pending")),
  approveTestimonial: (id, approve) =>
    unwrap(api.put(`/Admin/testimonials/${id}/approve`, null, { params: { approve } })),
  users: (role, search) => unwrap(api.get("/Admin/users", { params: { role, search } })),
  setUserActive: (id, isActive) =>
    unwrap(api.put(`/Admin/users/${id}/active`, null, { params: { isActive } })),
};