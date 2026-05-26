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
  ketua_panitia: 'Ketua Panitia',
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

// --- WhatsApp Redirect Helper ---

/**
 * Format nomor WA ke format internasional (62xxx)
 */
const formatWaNumber = (nomor) => {
  if (!nomor) return '';
  let clean = nomor.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.substring(1);
  if (!clean.startsWith('62')) clean = '62' + clean;
  return clean;
};

/**
 * Buka WhatsApp dengan template pesan
 * @param {string} nomor - Nomor WA tujuan
 * @param {string} pesan - Template pesan
 */
export const openWhatsApp = (nomor, pesan) => {
  const formattedNumber = formatWaNumber(nomor);
  const encodedMessage = encodeURIComponent(pesan);
  window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
};

/**
 * Template WA: Sekretaris ajukan naskah ke pimpinan
 */
export const waTemplateAjukan = (perihal) => {
  return `Assalamualaikum Kak, ada naskah baru yang perlu diverifikasi:\n\nPerihal: ${perihal || 'DIISI PERIHALNYA'}\n\nMohon dicek di sistem Arsip. Terima kasih.`;
};

/**
 * Template WA: Pimpinan disposisi ke penerima
 */
export const waTemplateDisposisi = (perihal, instruksi) => {
  return `Assalamualaikum, ada disposisi baru untuk kamu:\n\nPerihal: ${perihal || 'DIISI PERIHALNYA'}\nInstruksi: ${instruksi || 'DIISI INSTRUKSINYA'}\n\nMohon ditindaklanjuti. Terima kasih.`;
};

/**
 * Template WA: Naskah disetujui
 */
export const waTemplateDisetujui = (perihal) => {
  return `Assalamualaikum, naskah kamu telah disetujui.\n\nPerihal: ${perihal || 'DIISI PERIHALNYA'}\n\nSilakan cek di sistem Arsip. Terima kasih.`;
};

/**
 * Template WA: Naskah ditolak
 */
export const waTemplateDitolak = (perihal, catatan) => {
  return `Assalamualaikum, naskah kamu ditolak.\n\nPerihal: ${perihal || 'DIISI PERIHALNYA'}\nCatatan: ${catatan || 'DIISI CATATANNYA'}\n\nSilakan revisi dan ajukan kembali. Terima kasih.`;
};

/**
 * Template WA: Naskah sudah ditandatangani
 */
export const waTemplateDitandatangani = (perihal) => {
  return `Assalamualaikum, naskah berikut sudah ditandatangani.\n\nPerihal: ${perihal || 'DIISI PERIHALNYA'}\n\nSilakan cek di sistem Arsip untuk proses selanjutnya. Terima kasih.`;
};
