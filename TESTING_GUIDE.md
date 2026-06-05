# Panduan Testing Lengkap — Sistem Pengarsipan

## Akun Login

| Username | Password | Role | Nama |
|----------|----------|------|------|
| `ketufor` | `password123` | Ketua Forum | Royan |
| `waketufor` | `password123` | Wakil Ketua Forum | Fahmi |
| `sekretaris` | `password123` | Sekretaris | Mirza Sabrina |
| `sekretaris2` | `password123` | Sekretaris | Siti Fadillah |

---

## A. Testing Per Role

### A1. Sekretaris (Login: `sekretaris`)

| # | Test | Langkah | Expected |
|---|------|---------|----------|
| 1 | Login | Masukkan username `sekretaris`, password `password123` | Berhasil login, nama "Mirza Sabrina" tampil di sidebar |
| 2 | Dashboard | Cek halaman dashboard | Tampil statistik: draft aktif, surat keluar, arsip |
| 3 | Menu sidebar | Cek menu yang muncul | Dashboard, Draft Naskah, Naskah Masuk, Naskah Keluar, Arsip Aktif, Arsip Inaktif, Ekspor PDF, Template Naskah |
| 4 | Buat Draft | Klik Draft Naskah → Buat Draft Baru → Isi perihal + isi → Simpan | Draft tersimpan dengan status "Draft" |
| 5 | Ajukan Draft | Buka draft yang baru dibuat → Klik "Ajukan" | Status berubah ke "Menunggu Verifikasi" |
| 6 | Registrasi Naskah Masuk | Klik Naskah Masuk → Register Surat Masuk → Isi SEMUA field (perihal, pengirim, nomor asal, tgl asal, tgl terima, upload PDF) | Surat masuk terdaftar |
| 7 | Registrasi tanpa field | Coba submit tanpa isi nomor surat asal | Ditolak: "Semua kolom wajib diisi" |
| 8 | Lihat Naskah Keluar | Klik Naskah Keluar | Bisa lihat daftar naskah keluar |
| 9 | Ekspor PDF | Klik Ekspor PDF → Pilih naskah → Generate | PDF terdownload tanpa error 403 |
| 10 | Download Lampiran | Buka detail naskah masuk yang punya lampiran → Klik "Unduh Berkas" | File PDF terdownload |
| 11 | Profil | Klik nama di sidebar/header → Buka profil | TIDAK ada section TTD dan Stempel (hanya info nama & role) |
| 12 | Arsip | Klik Arsip Aktif / Inaktif | Bisa lihat daftar arsip |

---

### A2. Ketufor (Login: `ketufor`)

| # | Test | Langkah | Expected |
|---|------|---------|----------|
| 1 | Login | Masukkan username `ketufor` | Berhasil, nama "Royan" tampil |
| 2 | Menu sidebar | Cek menu | Semua menu muncul termasuk Kelola Pengguna, Konfigurasi Sistem |
| 3 | Buat Draft | Draft Naskah → Buat Draft → Isi → Simpan & Ajukan | Bisa buat draft (bukan hanya sekretaris) |
| 4 | Naskah Masuk | Klik Naskah Masuk | Bisa lihat dan registrasi naskah masuk |
| 5 | Setujui Naskah | Buka Naskah Keluar → Klik naskah "Menunggu Verifikasi" → Setujui | Status berubah ke "Disetujui" |
| 6 | Tolak Naskah | Buka naskah → Tolak → Isi catatan | Status berubah ke "Ditolak", notif ke pembuat |
| 7 | Upload TTD | Profil → Upload gambar tanda tangan (PNG) | Berhasil, preview muncul |
| 8 | Upload Stempel | Profil → Upload gambar stempel (PNG) | Berhasil, preview muncul |
| 9 | Tandatangani (Editor) | Buka naskah "Disetujui" → Klik "Tandatangani Surat" → Muncul editor → Posisikan kursor → Klik "Sisipkan Tanda Tangan" → Klik "Sisipkan Stempel" → Simpan | TTD + stempel muncul di posisi yang dipilih, status jadi "Ditandatangani" |
| 10 | Posisi fleksibel | Di editor, klik "Posisi Kanan Bawah" → lalu sisipkan TTD | TTD muncul di kanan bawah |
| 11 | Kirim & Arsipkan | Buka naskah "Ditandatangani" → Klik "Kirim & Arsipkan" | Nomor surat digenerate, status "Diarsipkan" |
| 12 | Disposisi | Buka naskah masuk → Klik Disposisi → Pilih penerima → Isi instruksi → Kirim | Disposisi terkirim |
| 13 | Kelola Pengguna | Pengaturan → Kelola Pengguna | Bisa lihat 4 user, bisa edit nama |
| 14 | Ekspor PDF | Ekspor PDF → Pilih naskah → Generate & Download | PDF terdownload tanpa 403 |
| 15 | Download Lampiran | Detail naskah → Unduh Berkas | File terdownload |

---

### A3. Waketufor (Login: `waketufor`)

| # | Test | Langkah | Expected |
|---|------|---------|----------|
| 1 | Login | Masukkan username `waketufor` | Berhasil, nama "Fahmi" tampil |
| 2 | Menu sidebar | Cek menu | Sama seperti ketufor KECUALI Kelola Pengguna |
| 3 | Buat Draft | Draft Naskah → Buat Draft | Bisa buat draft |
| 4 | Setujui Naskah | Naskah Keluar → Setujui | Bisa setujui |
| 5 | Upload TTD | Profil → Upload tanda tangan | Berhasil |
| 6 | Profil - Stempel | Profil | TIDAK ada section stempel (hanya ketufor) |
| 7 | TTD Kedua (Editor) | Buka naskah "Ditandatangani" → Klik "+ Tanda Tangan Kedua" → Editor muncul → Posisikan → Sisipkan TTD → Simpan | TTD kedua berhasil ditambahkan |
| 8 | Disposisi | Bisa buat disposisi | Berhasil |
| 9 | Ekspor PDF | Generate & Download | Terdownload tanpa 403 |
| 10 | Download Lampiran | Unduh Berkas | Terdownload |

---

## B. Testing Antar Role (Alur Lengkap)

### B1. Alur Draft → Setujui → TTD → TTD Kedua → Kirim

| Step | Role | Aksi | Expected |
|------|------|------|----------|
| 1 | Sekretaris | Buat draft "Surat Undangan Rapat" → Simpan & Ajukan | Status: Menunggu Verifikasi |
| 2 | Ketufor | Cek sidebar → Badge muncul di "Naskah Keluar" | Badge angka muncul |
| 3 | Ketufor | Buka Naskah Keluar → Klik naskah → Setujui | Status: Disetujui |
| 4 | Ketufor | Klik "Tandatangani Surat" → Editor muncul → Klik "Posisi Kanan Bawah" → Sisipkan TTD + Stempel → Simpan | Status: Ditandatangani, TTD + stempel di kanan bawah |
| 5 | Waketufor | Buka Naskah Keluar → Klik naskah yang sama | Tombol "+ Tanda Tangan Kedua" muncul |
| 6 | Waketufor | Klik "+ Tanda Tangan Kedua" → Editor → Posisikan di sebelah TTD pertama → Sisipkan TTD → Simpan | TTD kedua berhasil |
| 7 | Ketufor/Waketufor | Klik "Kirim & Arsipkan" | Nomor surat digenerate, masuk arsip |
| 8 | Semua role | Ekspor PDF naskah tersebut | PDF berisi isi surat + TTD + stempel, terdownload |

### B2. Alur Naskah Masuk → Disposisi

| Step | Role | Aksi | Expected |
|------|------|------|----------|
| 1 | Sekretaris | Naskah Masuk → Register Surat Masuk → Isi semua field + upload PDF | Surat terdaftar |
| 2 | Ketufor | Cek sidebar → Badge di "Naskah Keluar" (notif naskah masuk baru) | Badge muncul |
| 3 | Ketufor | Buka Naskah Masuk → Klik surat → Buat Disposisi ke Sekretaris | Disposisi terkirim |
| 4 | Sekretaris | Cek sidebar → Badge di "Disposisi" | Badge muncul |
| 5 | Sekretaris | Buka Disposisi → Lihat instruksi → Konfirmasi tindak lanjut | Status: Ditindaklanjuti |
| 6 | Ketufor | Buka detail naskah masuk → Cek isi naskah | Stempel otomatis ter-inject (jika naskah punya isi) |

### B3. Alur Download File (Semua Role)

| Step | Role | Aksi | Expected |
|------|------|------|----------|
| 1 | Sekretaris | Detail naskah masuk → Unduh Berkas | PDF terdownload, BUKAN 403 |
| 2 | Ketufor | Ekspor PDF → Generate → Download | PDF terdownload |
| 3 | Waketufor | Arsip Aktif → Buka detail → Download File | PDF terdownload |
| 4 | Sekretaris | Ekspor PDF → Pilih naskah miliknya → Generate | Berhasil |

---

## C. Testing Notifikasi Sidebar

| Aksi | Siapa dapat notif | Badge muncul di menu |
|------|-------------------|---------------------|
| Sekretaris ajukan draft | Ketufor + Waketufor | **Naskah Keluar** |
| Ketufor setujui naskah | Sekretaris (pembuat) | **Naskah Keluar** |
| Ketufor tolak naskah | Sekretaris (pembuat) | **Naskah Keluar** |
| Sekretaris registrasi naskah masuk | Ketufor + Waketufor | **Naskah Masuk** |
| Ketufor buat disposisi ke Sekretaris | Sekretaris | **Disposisi** |
| Sekretaris tindaklanjuti disposisi | Ketufor (pengirim) | **Disposisi** |

---

## D. Testing Logo & UI

| # | Test | Expected |
|---|------|----------|
| 1 | Logo di halaman login | Logo forum bulat, ukuran besar (80px), tanpa box biru |
| 2 | Logo di sidebar | Logo forum bulat, ukuran 48px, tanpa background warna |
| 3 | Editor TTD (ketufor) | TinyMCE muncul tanpa error "Add API key", toolbar lengkap |
| 4 | Editor TTD (waketufor) | Sama persis seperti ketufor — TinyMCE proper |

---

## E. Testing Error Handling

| # | Test | Expected |
|---|------|----------|
| 1 | Login salah password | Pesan error "Username/password salah" |
| 2 | Akses URL langsung tanpa login | Redirect ke /login |
| 3 | Sekretaris akses /pengaturan/pengguna | Redirect ke dashboard + toast error |
| 4 | TTD tanpa upload gambar dulu | Toast: "Silakan unggah Tanda Tangan" |
| 5 | Submit naskah masuk tanpa lampiran | Toast: "Semua kolom wajib diisi" |

---

## Catatan Penting

- **Multi TTD**: Jangan klik "Kirim & Arsipkan" sebelum TTD kedua selesai. Setelah kirim, naskah sudah diarsipkan dan tidak bisa ditandatangani lagi.
- **Stempel**: Hanya ketufor yang upload stempel. Stempel otomatis masuk ke naskah saat disposisi ATAU bisa disisipkan manual via editor saat tandatangan.
- **WhatsApp**: Belum aktif sampai `WHATSAPP_API_KEY` diisi di file `.env` backend.
- **PDF Export**: Jika naskah masuk hanya punya lampiran (tanpa isi HTML), ekspor PDF akan kosong. Ekspor PDF paling berguna untuk naskah keluar yang punya isi.
