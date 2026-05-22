import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('id');

export const formatTanggal = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY');
};

export const formatTanggalWaktu = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY HH:mm');
};

export const formatTanggalRelatif = (date) => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

export const formatRelatif = (date) => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

export const STATUS_LABELS = {
  draft: 'Draft',
  menunggu_verifikasi: 'Menunggu Verifikasi',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
  ditandatangani: 'Ditandatangani',
  terkirim: 'Terkirim',
  diarsipkan: 'Diarsipkan',
};

export const JENIS_LABELS = {
  masuk: 'Naskah Masuk',
  keluar: 'Naskah Keluar',
  draft: 'Draft',
};

export const PERAN_LABELS = {
  ketufor: 'Ketua Forum',
  waketufor: 'Wakil Ketua Forum',
  sekretaris: 'Sekretaris',
};

export const STATUS_RETENSI_LABELS = {
  aktif: 'Aktif',
  inaktif: 'Inaktif',
  musnah: 'Musnah',
};

export const STATUS_DISPOSISI_LABELS = {
  belum_dibaca: 'Belum Dibaca',
  dibaca: 'Dibaca',
  ditindaklanjuti: 'Ditindaklanjuti',
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// --- SweetAlert2 Helpers ---
import Swal from 'sweetalert2';

export const confirmAlert = async (title, text = '', confirmText = 'Ya', isDanger = false) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: isDanger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonColor: isDanger ? '#ef4444' : '#3b82f6',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    reverseButtons: true,
  });
  return result.isConfirmed;
};
