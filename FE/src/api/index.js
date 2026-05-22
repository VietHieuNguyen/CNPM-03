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
  similar: (categoryId, excludeId) =>
    api.get(`/comics/similar/${categoryId}`, { params: { excludeId } }),
}

export const categoriesAPI = {
  list: () => api.get('/categories'),
  detail: (slug) => api.get(`/categories/${slug}`),
}
