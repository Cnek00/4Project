import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access');
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh });
          localStorage.setItem('access', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch (_) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
        }
      }
    }
    return Promise.reject(err);
  }
);

const store = '/store';

// --- Auth (JWT) ---
export const login = (email, password) =>
  api.post('/token/', { username: email, password }).then((res) => res.data);

export const setTokens = (access, refresh) => {
  if (access) localStorage.setItem('access', access);
  if (refresh) localStorage.setItem('refresh', refresh);
};

export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};

// --- Ürünler & Kategoriler ---
export const getProducts = (params = {}) =>
  api.get(`${store}/products/`, { params }).then((res) => res.data);

export const getCategories = () =>
  api.get(`${store}/categories/`).then((res) => res.data);

export const getProductDetail = (id) =>
  api.get(`${store}/products/${id}/`).then((res) => res.data);

// --- Sepet ---
export const getMyCart = () =>
  api.get(`${store}/cart/my_cart/`).then((res) => res.data);

export const addToCart = (productId, sizeId, quantity = 1) =>
  api.post(`${store}/cart/add_to_cart/`, { product_id: productId, size_id: sizeId, quantity }).then((res) => res.data);

export const updateCartItemQuantity = (itemId, quantity) =>
  api.patch(`${store}/cart/${itemId}/update_quantity/`, { quantity }).then((res) => res.data);

export const removeCartItem = (itemId) =>
  api.delete(`${store}/cart/${itemId}/remove_item/`).then((res) => res.data);

export const applyCoupon = (code) =>
  api.post(`${store}/cart/apply_coupon/`, { code }).then((res) => res.data);

export const mergeCart = (items) =>
  api.post(`${store}/cart/merge_cart/`, items).then((res) => res.data);

export const checkout = () =>
  api.post(`${store}/cart/checkout/`).then((res) => res.data);

// --- Siparişler ---
export const getMyOrders = () =>
  api.get(`${store}/orders/`).then((res) => res.data.results ?? res.data ?? []);

export const getOrderDetail = (id) =>
  api.get(`${store}/orders/${id}/`).then((res) => res.data);

export const mediaUrl = (path) =>
  path && (path.startsWith('http') ? path : `${API_BASE}${path}`);
