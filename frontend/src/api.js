import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// Dashboard
export const dashboardAPI = {
  getMetrics: (filters) =>
    api.get('/dashboard', { params: filters }),
};

// Chat
export const chatAPI = {
  getSessions: () => api.get('/chat'),
  createSession: () => api.post('/chat'),
  getSession: (id) => api.get(`/chat/${id}`),
  sendMessage: (id, question) =>
    api.post(`/chat/${id}/ask`, { question }),
};

// Sales
export const salesAPI = {
  getSales: (filters) =>
    api.get('/sales', { params: filters }),
  createSale: (data) =>
    api.post('/sales', data),
  deleteSale: (id) =>
    api.delete(`/sales/${id}`),
};

// Data (Customers, Products)
export const dataAPI = {
  getCustomers: (filters) =>
    api.get('/customers', { params: filters }),
  getProducts: () =>
    api.get('/products'),
  getCategories: () =>
    api.get('/categories'),
  createProduct: (data) =>
    api.post('/products', data),
  createCategory: (data) =>
    api.post('/categories', data),
  getAnalytics: {
    products: (filters) =>
      api.get('/analytics/products', { params: filters }),
    regions: (filters) =>
      api.get('/analytics/regions', { params: filters }),
  },
};

// Customers CRUD
export const customerAPI = {
  createCustomer: (data) =>
    api.post('/customers', data),
  updateCustomer: (id, data) =>
    api.put(`/customers/${id}`, data),
  deleteCustomer: (id) =>
    api.delete(`/customers/${id}`),
};

// Upload
export const uploadAPI = {
  getHistory: () =>
    api.get('/upload/history'),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
