import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for cookie-based authentication
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to handle token expiry / auto-refresh in the future if needed
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if error is unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh token
        await axios.post(`${API_BASE_URL}/user/refresh-token`, {}, { withCredentials: true });
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, meaning session has expired
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post("/user/login", { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await apiClient.post("/user/register", { name, email, password });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post("/user/logout");
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get("/user/profile");
    return response.data;
  },
};

export const comicAPI = {
  getComics: async (params) => {
    const response = await apiClient.get("/comics", { params });
    return response.data;
  },
  getFeatured: async () => {
    const response = await apiClient.get("/comics/featured");
    return response.data;
  },
  getNew: async () => {
    const response = await apiClient.get("/comics/new");
    return response.data;
  },
  getBestsellers: async () => {
    const response = await apiClient.get("/comics/bestseller");
    return response.data;
  },
  getMostViewed: async () => {
    const response = await apiClient.get("/comics/most-viewed");
    return response.data;
  },
  getSimilar: async (categoryId, excludeId) => {
    const response = await apiClient.get(`/comics/similar/${categoryId}`, {
      params: { excludeId },
    });
    return response.data;
  },
  getDetail: async (slug) => {
    const response = await apiClient.get(`/comics/${slug}`);
    return response.data;
  },
};

export const categoryAPI = {
  getCategories: async () => {
    const response = await apiClient.get("/categories");
    return response.data;
  },
};

export const cartAPI = {
  getCart: async () => {
    const response = await apiClient.get("/cart");
    return response.data;
  },
  addToCart: async (comicId, quantity) => {
    const response = await apiClient.post("/cart", { comicId, quantity });
    return response.data;
  },
  updateQuantity: async (comicId, quantity) => {
    const response = await apiClient.put("/cart", { comicId, quantity });
    return response.data;
  },
  removeFromCart: async (comicId) => {
    const response = await apiClient.delete(`/cart/${comicId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await apiClient.delete("/cart");
    return response.data;
  },
};

export const orderAPI = {
  createOrder: async (orderData) => {
    const response = await apiClient.post("/orders", orderData);
    return response.data;
  },
  getOrders: async () => {
    const response = await apiClient.get("/orders");
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },
  cancelOrder: async (id) => {
    const response = await apiClient.post(`/orders/${id}/cancel`);
    return response.data;
  },
};

export const paymentAPI = {
  getConfig: async () => {
    const response = await apiClient.get("/payment/config");
    return response.data;
  },
};

export default apiClient;
