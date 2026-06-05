import { create } from 'zustand';
import api from '../services/api';

const useNotifikasiStore = create((set) => ({
  notifikasis: [],
  count: 0,
  countDisposisi: 0,
  countNaskahKeluar: 0,
  countNaskahMasuk: 0,
  loading: false,

  fetchBelumDibaca: async () => {
    try {
      const res = await api.get('/notifikasi/belum-dibaca');
      const notifs = res.data.notifikasis || [];
      const disposisiTypes = ['DISPOSISI_BARU', 'DISPOSISI_DITINDAKLANJUTI'];
      const naskahKeluarTypes = ['NASKAH_PERLU_VERIFIKASI', 'NASKAH_DISETUJUI', 'NASKAH_DITOLAK'];
      const naskahMasukTypes = ['NASKAH_MASUK_BARU'];
      
      set({
        notifikasis: notifs,
        count: res.data.count,
        countDisposisi: notifs.filter(n => disposisiTypes.includes(n.tipe)).length,
        countNaskahKeluar: notifs.filter(n => naskahKeluarTypes.includes(n.tipe)).length,
        countNaskahMasuk: notifs.filter(n => naskahMasukTypes.includes(n.tipe)).length,
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
      // Re-fetch to recalculate per-type counts
      useNotifikasiStore.getState().fetchBelumDibaca();
    } catch {
      // ignore
    }
  },

  tandaiBacaSemua: async () => {
    try {
      await api.put('/notifikasi/baca-semua');
      set({ notifikasis: [], count: 0, countDisposisi: 0, countNaskahKeluar: 0, countNaskahMasuk: 0 });
    } catch {
      // ignore
    }
  },
}));

export default useNotifikasiStore;
