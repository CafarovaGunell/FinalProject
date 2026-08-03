import API from './api';

const u = (p) => p.then((r) => r.data);   // { success, message, data }

export const authApi = {
  login:    (d) => u(API.post('/Auth/login', d)),
  register: (d) => u(API.post('/Auth/register', d)),
  me:       ()  => u(API.get('/Auth/me')),
  logout:   (refreshToken) => u(API.post('/Auth/logout', { accessToken: '', refreshToken })),
  changePassword: (d) => u(API.post('/Auth/change-password', d)),
};

export const userApi = {
  profile: () => u(API.get('/User/profile')),
  update:  (d) => u(API.put('/User/profile', d)),
};

export const uploadApi = {
  single: (file, folder = 'misc') => {
    const fd = new FormData();
    fd.append('file', file);
    return u(API.post(`/Upload/single?folder=${folder}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },
  multiple: (files, folder = 'misc') => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return u(API.post(`/Upload/multiple?folder=${folder}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },
};

// type: 1=Pet, 2=Product, 3=Article
export const categoryApi = {
  all: (type) => u(API.get('/Category', { params: { type } })),
};

export const petApi = {
  list:   (params) => u(API.get('/Pet', { params })),
  byId:   (id) => u(API.get(`/Pet/${id}`)),
  mine:   () => u(API.get('/Pet/my-pets')),
  create: (d) => u(API.post('/Pet', d)),
  update: (id, d) => u(API.put(`/Pet/${id}`, d)),
  remove: (id) => u(API.delete(`/Pet/${id}`)),
};

export const adoptionApi = {
  create:   (d) => u(API.post('/adoption-requests', d)),
  mine:     () => u(API.get('/adoption-requests/my-requests')),
  received: () => u(API.get('/adoption-requests/received')),
  byPet:    (petId) => u(API.get(`/adoption-requests/by-pet/${petId}`)),
  review:   (id, d) => u(API.put(`/adoption-requests/${id}/review`, d)),
  cancel:   (id) => u(API.put(`/adoption-requests/${id}/cancel`)),
  remove:   (id) => u(API.delete(`/adoption-requests/${id}`)), 
};

export const wishlistApi = {
  list:   () => u(API.get('/wishlist')),
  ids:    () => u(API.get('/wishlist/ids')),
  toggle: (petId) => u(API.post(`/wishlist/toggle/${petId}`)),
};

export const shopApi = {
  list:   (city) => u(API.get('/PetShop', { params: { city } })),
  byId:   (id) => u(API.get(`/PetShop/${id}`)),
  mine:   () => u(API.get('/PetShop/my-shop')),
  create: (d) => u(API.post('/PetShop', d)),
  update: (d) => u(API.put('/PetShop', d)),
};

export const productApi = {
  list:      (params) => u(API.get('/Product', { params })),
  byId:      (id) => u(API.get(`/Product/${id}`)),
  mine:      () => u(API.get('/Product/my-products')),
  create:    (d) => u(API.post('/Product', d)),
  update:    (id, d) => u(API.put(`/Product/${id}`, d)),
  remove:    (id) => u(API.delete(`/Product/${id}`)),
  reviews:   (productId) => u(API.get(`/product-reviews/by-product/${productId}`)),
  addReview: (d) => u(API.post('/product-reviews', d)),
};

export const cartApi = {
  get:        () => u(API.get('/Cart')),
  add:        (d) => u(API.post('/Cart/add', d)),
  updateItem: (id, quantity) => u(API.put(`/Cart/items/${id}`, { quantity })),
  removeItem: (id) => u(API.delete(`/Cart/items/${id}`)),
  clear:      () => u(API.delete('/Cart/clear')),
};

export const orderApi = {
  checkout:   (d) => u(API.post('/Order/checkout', d)),
  mine:       () => u(API.get('/Order/my-orders')),
  byId:       (id) => u(API.get(`/Order/${id}`)),
  shopOrders: (status) => u(API.get('/Order/shop-orders', { params: { status } })),
  setStatus:  (id, d) => u(API.put(`/Order/${id}/status`, d)),
  cancel:     (id, reason) => u(API.put(`/Order/${id}/cancel`, null, { params: { reason } })),
};

export const vetApi = {
  list:   (params) => u(API.get('/vet-profile', { params })),
  byId:   (id) => u(API.get(`/vet-profile/${id}`)),
  me:     () => u(API.get('/vet-profile/me')),
  create: (d) => u(API.post('/vet-profile', d)),
  update: (d) => u(API.put('/vet-profile', d)),

  services:      (vetId) => u(API.get(`/vet-management/${vetId}/services`)),
  addService:    (d) => u(API.post('/vet-management/services', d)),
  updateService: (id, d) => u(API.put(`/vet-management/services/${id}`, d)),
  removeService: (id) => u(API.delete(`/vet-management/services/${id}`)),

  schedules:      (vetId) => u(API.get(`/vet-management/${vetId}/schedules`)),
  addSchedule:    (d) => u(API.post('/vet-management/schedules', d)),
  removeSchedule: (id) => u(API.delete(`/vet-management/schedules/${id}`)),

  timeOffs:      () => u(API.get('/vet-management/time-offs')),
  addTimeOff:    (d) => u(API.post('/vet-management/time-offs', d)),
  removeTimeOff: (id) => u(API.delete(`/vet-management/time-offs/${id}`)),
};

export const appointmentApi = {
  slots:  (vetProfileId, date, serviceId) =>
    u(API.get('/appointments/slots', { params: { vetProfileId, date, serviceId } })),
  create: (d) => u(API.post('/appointments', d)),
  mine:   (status) => u(API.get('/appointments/my-appointments', { params: { status } })),
  vetList:(status, date) => u(API.get('/appointments/vet-appointments', { params: { status, date } })),
  setStatus: (id, status, reason) =>
    u(API.put(`/appointments/${id}/status`, null, { params: { status, reason } })),
  cancel: (id, reason) => u(API.put(`/appointments/${id}/cancel`, null, { params: { reason } })),
};

export const testimonialApi = {
  list:   () => u(API.get('/Testimonial')),
  mine:   () => u(API.get('/Testimonial/mine')),
  create: (d) => u(API.post('/Testimonial', d)),
  like:   (id) => u(API.post(`/Testimonial/${id}/like`)),
  remove: (id) => u(API.delete(`/Testimonial/${id}`)),
};

export const articleApi = {
  list:   (params) => u(API.get('/Article', { params })),
  bySlug: (slug) => u(API.get(`/Article/${slug}`)),
  mine:   () => u(API.get('/Article/mine')),
  create: (d) => u(API.post('/Article', d)),
  update: (id, d) => u(API.put(`/Article/${id}`, d)),
  remove: (id) => u(API.delete(`/Article/${id}`)),
};

export const notificationApi = {
  list:        (unreadOnly = false) => u(API.get('/Notification', { params: { unreadOnly } })),
  unreadCount: () => u(API.get('/Notification/unread-count')),
  read:        (id) => u(API.put(`/Notification/${id}/read`)),
  readAll:     () => u(API.put('/Notification/read-all')),
  remove:      (id) => u(API.delete(`/Notification/${id}`)),
};

export const adminApi = {
  dashboard:    () => u(API.get('/Admin/dashboard')),
  shops:        (status) => u(API.get('/Admin/shops', { params: { status } })),
  approveShop:  (id, d) => u(API.put(`/Admin/shops/${id}/approval`, d)),
  vets:         (status) => u(API.get('/Admin/vets', { params: { status } })),
  approveVet:   (id, d) => u(API.put(`/Admin/vets/${id}/approval`, d)),
  pendingPets:  (page, pageSize) => u(API.get('/Admin/pets/pending', { params: { page, pageSize } })),
  approvePet:   (id, approve, reason) =>
    u(API.put(`/Admin/pets/${id}/approve`, null, { params: { approve, reason } })),

  adoptedPets:  () => u(API.get('/Admin/pets/adopted')), // ✅ YENİ

  orders:       (status) => u(API.get('/Admin/orders', { params: { status } })),
  pendingTestimonials: () => u(API.get('/Admin/testimonials/pending')),
  approveTestimonial:  (id, approve) =>
    u(API.put(`/Admin/testimonials/${id}/approve`, null, { params: { approve } })),
  users:         (role, search) => u(API.get('/Admin/users', { params: { role, search } })),
  setUserActive: (id, isActive) =>
    u(API.put(`/Admin/users/${id}/active`, null, { params: { isActive } })),
  setUserRole: (id, role) => u(API.put(`/Admin/users/${id}/role`, { role })),
  deleteUser:  (id) => u(API.delete(`/Admin/users/${id}`)),

  adoptionRequests: () => u(API.get('/Admin/adoption-requests')),
appointments: (status, date) =>
  u(API.get('/Admin/appointments', { params: { status, date } })),

};


