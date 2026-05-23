import api from './axios'

export const authAPI = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  logout: () => api.post('/user/logout'),
  profile: () => api.get('/user/profile'),
  refreshToken: () => api.post('/user/refresh-token'),
}

export const comicsAPI = {
  list: (params) => api.get('/comics', { params }),
  detail: (slug) => api.get(`/comics/${slug}`),
  featured: () => api.get('/comics/featured'),
  newComics: () => api.get('/comics/new'),
  bestseller: () => api.get('/comics/bestseller'),
  mostViewed: () => api.get('/comics/most-viewed'),
  similar: (categoryId, excludeId) =>
    api.get(`/comics/similar/${categoryId}`, { params: { excludeId } }),
}

export const categoriesAPI = {
  list: () => api.get('/categories'),
  detail: (slug) => api.get(`/categories/${slug}`),
}

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data), // data: { comicId, quantity }
  update: (data) => api.put('/cart', data), // data: { comicId, quantity }
  remove: (comicId) => api.delete(`/cart/${comicId}`),
  clear: () => api.delete('/cart'),
}

export const orderAPI = {
  create: (data) => api.post('/orders', data), // data: { shippingAddress: { name, phone, address, city }, note, paymentMethod }
  list: () => api.get('/orders'),
  detail: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
}
