import { create } from 'zustand';
import api from '../services/api';

const useNotifikasiStore = create((set) => ({
  notifikasis: [],
  count: 0,
  loading: false,

  fetchBelumDibaca: async () => {
    try {
      const res = await api.get('/notifikasi/belum-dibaca');
      set({
        notifikasis: res.data.notifikasis,
        count: res.data.count,
      });
    } catch {
      // ignore
    }
  },

  tandaiBaca: async (id) => {
    try {
      await api.put(`/notifikasi/${id}/baca`);
      set((state) => ({
        notifikasis: state.notifikasis.filter((n) => n.id !== id),
        count: Math.max(0, state.count - 1),
      }));
    } catch {
      // ignore
    }
  },

  tandaiBacaSemua: async () => {
    try {
      await api.put('/notifikasi/baca-semua');
      set({ notifikasis: [], count: 0 });
    } catch {
      // ignore
    }
  },
}));

export default useNotifikasiStore;
