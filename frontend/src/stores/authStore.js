import { create } from 'zustand';
import api, { getCsrfCookie } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Check if user is authenticated on app load
  checkAuth: async () => {
    try {
      set({ loading: true });
      const res = await api.get('/user');
      set({ user: res.data, loading: false, error: null });
    } catch {
      set({ user: null, loading: false, error: null });
    }
  },

  // Login
  login: async (loginData) => {
    try {
      set({ error: null, loading: true });
      await getCsrfCookie();
      const res = await api.post('/login', loginData);
      set({ user: res.data.user, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.login?.[0] || 'Login gagal';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/logout');
    } catch {
      // ignore
    }
    set({ user: null });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
