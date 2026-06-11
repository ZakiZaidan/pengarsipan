import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Tour Guide Service untuk Sistem Pengarsipan
 * Menggunakan Driver.js untuk panduan interaktif
 */

// Kustomisasi tema Driver.js agar sesuai desain aplikasi
const baseConfig = {
  showProgress: true,
  animate: true,
  smoothScroll: true,
  allowClose: true,
  overlayClickNext: false,
  stagePadding: 8,
  stageRadius: 8,
  popoverClass: 'tour-popover',
  nextBtnText: 'Selanjutnya →',
  prevBtnText: '← Sebelumnya',
  doneBtnText: '✅ Selesai!',
  progressText: 'Langkah {{current}} dari {{total}}',
};

// =========================================
// DEFINISI LANGKAH TOUR PER HALAMAN
// =========================================

/**
 * Tour Utama — Mengenalkan seluruh antarmuka aplikasi
 * Ditampilkan pertama kali saat user login atau klik tombol Panduan
 */
function getMainTourSteps(userRole) {
  const steps = [
    {
      element: '#sidebar-header',
      popover: {
        title: '🏢 Sistem Pengarsipan',
        description: 'Selamat datang di <strong>Sistem Pengarsipan Naskah Dinas</strong> Forum Duta Anti Narkoba. Sistem ini membantu Anda mengelola surat masuk, surat keluar, disposisi, dan arsip secara digital.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#nav-',
      popover: {
        title: '📊 Dashboard',
        description: 'Halaman utama yang menampilkan <strong>ringkasan statistik</strong> naskah dinas, tabel naskah terbaru, aksi cepat, dan log aktivitas terkini. Ini adalah pusat kendali Anda.',
        side: 'right',
        align: 'start',
      },
    },
  ];

  // Draft Naskah — hanya untuk ketufor, waketufor, sekretaris
  if (['ketufor', 'waketufor', 'sekretaris'].includes(userRole)) {
    steps.push({
      element: '#nav-draft',
      popover: {
        title: '📝 Draft Naskah',
        description: 'Halaman untuk <strong>membuat dan mengelola draft surat keluar</strong>. Di sini Anda bisa:<br/>' +
          '• Membuat draft surat baru menggunakan template<br/>' +
          '• Mengedit draft yang sudah ada<br/>' +
          '• Mengajukan draft ke Pimpinan untuk verifikasi',
        side: 'right',
        align: 'start',
      },
    });
  }

  // Naskah Masuk
  steps.push({
    element: '#nav-naskah-masuk',
    popover: {
      title: '📥 Naskah Masuk',
      description: 'Halaman untuk <strong>meregistrasi dan mengelola surat masuk</strong> yang diterima dari pihak eksternal. Di sini Anda bisa:<br/>' +
        '• Mendaftarkan surat masuk baru beserta lampiran PDF<br/>' +
        '• Melihat daftar seluruh surat masuk<br/>' +
        '• Membuka detail dan melakukan disposisi surat',
      side: 'right',
      align: 'start',
    },
  });

  // Naskah Keluar
  steps.push({
    element: '#nav-naskah-keluar',
    popover: {
      title: '📤 Naskah Keluar',
      description: 'Halaman untuk <strong>melihat semua surat keluar</strong> yang telah melewati proses verifikasi. Di sini Anda bisa:<br/>' +
        '• Memantau status surat (menunggu verifikasi, disetujui, ditandatangani, terkirim)<br/>' +
        '• Membuka detail naskah untuk tindakan lebih lanjut<br/>' +
        '• Badge merah menunjukkan jumlah surat yang membutuhkan tindakan',
      side: 'right',
      align: 'start',
    },
  });

  // Disposisi
  steps.push({
    element: '#nav-disposisi',
    popover: {
      title: '🔀 Disposisi',
      description: 'Halaman untuk <strong>mengelola disposisi surat</strong>. Disposisi adalah instruksi dari Pimpinan kepada anggota untuk menindaklanjuti surat masuk. Di sini Anda bisa:<br/>' +
        '• Melihat disposisi yang ditujukan kepada Anda<br/>' +
        '• Menandai disposisi sebagai sudah dibaca/ditindaklanjuti<br/>' +
        '• Badge merah menunjukkan disposisi yang belum dibaca',
      side: 'right',
      align: 'start',
    },
  });

  // Kearsipan — hanya untuk ketufor, waketufor, sekretaris
  if (['ketufor', 'waketufor', 'sekretaris'].includes(userRole)) {
    steps.push({
      element: '#section-kearsipan',
      popover: {
        title: '🗂️ Kearsipan & Ekspor',
        description: 'Bagian ini berisi modul untuk mengelola <strong>arsip digital</strong> dan <strong>ekspor dokumen PDF</strong>.',
        side: 'right',
        align: 'start',
      },
    });

    steps.push({
      element: '#nav-arsip-aktif',
      popover: {
        title: '📁 Arsip Aktif',
        description: 'Menyimpan arsip naskah dinas yang masih dalam <strong>masa retensi aktif</strong> (baru diarsipkan). Di sini Anda bisa:<br/>' +
          '• Mencari dan memfilter arsip berdasarkan klasifikasi<br/>' +
          '• Melihat detail arsip beserta metadata lengkap<br/>' +
          '• Arsip otomatis berpindah ke Inaktif setelah masa retensi habis',
        side: 'right',
        align: 'start',
      },
    });

    steps.push({
      element: '#nav-arsip-inaktif',
      popover: {
        title: '📦 Arsip Inaktif',
        description: 'Menyimpan arsip naskah dinas yang sudah melewati <strong>masa retensi aktif</strong> dan berpindah ke fase inaktif. Arsip di sini masih bisa dicari dan diakses untuk referensi.',
        side: 'right',
        align: 'start',
      },
    });

    steps.push({
      element: '#nav-ekspor-pdf',
      popover: {
        title: '📄 Ekspor PDF',
        description: 'Halaman untuk <strong>mengekspor naskah dinas ke format PDF</strong>. Fitur yang tersedia:<br/>' +
          '• Pilih naskah yang ingin diekspor<br/>' +
          '• Opsi menyertakan kop surat organisasi<br/>' +
          '• Opsi menambahkan watermark (misal: RAHASIA)<br/>' +
          '• Pilihan ukuran kertas: A4 atau F4<br/>' +
          '• Riwayat ekspor tersimpan untuk diunduh ulang',
        side: 'right',
        align: 'start',
      },
    });
  }

  // Pengaturan — berdasarkan role
  if (['ketufor', 'waketufor', 'sekretaris'].includes(userRole)) {
    steps.push({
      element: '#section-pengaturan',
      popover: {
        title: '⚙️ Pengaturan',
        description: 'Bagian pengaturan sistem. Menu yang tampil disesuaikan dengan hak akses peran Anda.',
        side: 'right',
        align: 'start',
      },
    });
  }

  if (userRole === 'ketufor') {
    steps.push({
      element: '#nav-pengaturan-pengguna',
      popover: {
        title: '👥 Kelola Pengguna',
        description: 'Halaman khusus <strong>Ketua Formatur</strong> untuk mengelola akun pengguna sistem. Di sini Anda bisa:<br/>' +
          '• Menambahkan pengguna baru (Sekretaris, Wakil Ketua, Ketua Panitia)<br/>' +
          '• Mengubah data dan peran pengguna<br/>' +
          '• Menonaktifkan atau menghapus akun pengguna',
        side: 'right',
        align: 'start',
      },
    });
  }

  if (['ketufor', 'sekretaris'].includes(userRole)) {
    steps.push({
      element: '#nav-pengaturan-template',
      popover: {
        title: '📋 Template Naskah',
        description: 'Halaman untuk <strong>mengelola template surat</strong> yang bisa digunakan saat membuat draft. Di sini Anda bisa:<br/>' +
          '• Membuat template surat baru (undangan, permohonan, dll)<br/>' +
          '• Mengedit isi template menggunakan editor WYSIWYG<br/>' +
          '• Mengaktifkan/menonaktifkan template',
        side: 'right',
        align: 'start',
      },
    });
  }

  if (['ketufor', 'waketufor'].includes(userRole)) {
    steps.push({
      element: '#nav-pengaturan-sistem',
      popover: {
        title: '🔧 Konfigurasi Sistem',
        description: 'Halaman untuk <strong>mengatur parameter sistem</strong> organisasi. Termasuk:<br/>' +
          '• Identitas organisasi (nama, alamat, telepon)<br/>' +
          '• Format penomoran surat otomatis<br/>' +
          '• Upload kop surat organisasi<br/>' +
          '• Pengaturan watermark dan Jadwal Retensi Arsip (JRA)',
        side: 'right',
        align: 'start',
      },
    });
  }

  // Header elements
  steps.push({
    element: '#notification-bell',
    popover: {
      title: '🔔 Notifikasi',
      description: 'Klik ikon lonceng untuk melihat <strong>notifikasi terbaru</strong>. Notifikasi muncul saat:<br/>' +
        '• Ada naskah baru yang perlu diverifikasi<br/>' +
        '• Ada disposisi baru yang ditujukan kepada Anda<br/>' +
        '• Ada perubahan status pada naskah Anda<br/>' +
        'Badge merah menunjukkan jumlah notifikasi belum dibaca.',
      side: 'bottom',
      align: 'end',
    },
  });

  steps.push({
    element: '#header-profile',
    popover: {
      title: '👤 Profil Pengguna',
      description: 'Klik nama Anda untuk membuka <strong>modal Profil</strong>. Di sini Anda bisa:<br/>' +
        '• Melihat informasi akun Anda<br/>' +
        '• Mengunggah tanda tangan elektronik (TTE)<br/>' +
        '• Mengunggah stempel organisasi (khusus Ketua Formatur)',
      side: 'bottom',
      align: 'end',
    },
  });

  steps.push({
    element: '#sidebar-footer',
    popover: {
      title: '🚪 Informasi Akun & Logout',
      description: 'Bagian bawah sidebar menampilkan <strong>nama dan peran</strong> Anda yang sedang login. Klik ikon panah untuk <strong>keluar (logout)</strong> dari sistem.',
      side: 'right',
      align: 'end',
    },
  });

  return steps;
}

/**
 * Tour Dashboard — Panduan khusus halaman Dashboard
 */
function getDashboardTourSteps(userRole) {
  const steps = [];

  const welcomeBanner = document.querySelector('.welcome-banner');
  if (welcomeBanner) {
    steps.push({
      element: '.welcome-banner',
      popover: {
        title: '👋 Banner Selamat Datang',
        description: 'Banner ini menampilkan <strong>nama dan peran</strong> Anda yang sedang login. Ini juga memberikan petunjuk singkat tentang cara menggunakan navigasi.',
        side: 'bottom',
        align: 'center',
      },
    });
  }

  const statGrid = document.querySelector('.stat-grid');
  if (statGrid) {
    steps.push({
      element: '.stat-grid',
      popover: {
        title: '📊 Kartu Statistik',
        description: 'Kartu-kartu ini menampilkan <strong>ringkasan angka penting</strong> seperti jumlah draft aktif, surat masuk baru, disposisi belum dibaca, dan total arsip. Klik kartu untuk langsung menuju halaman terkait.',
        side: 'bottom',
        align: 'center',
      },
    });
  }

  const dashboardGrid = document.querySelector('.dashboard-grid');
  if (dashboardGrid) {
    steps.push({
      element: '.dashboard-grid',
      popover: {
        title: '📋 Konten Dashboard',
        description: 'Bagian ini berisi <strong>tabel naskah dinas terbaru</strong> (klik baris untuk melihat detail), panel <strong>Aksi Cepat</strong> untuk shortcut ke fitur utama, dan <strong>Log Aktivitas Terkini</strong> yang mencatat semua aksi di sistem.',
        side: 'top',
        align: 'center',
      },
    });
  }

  return steps;
}

/**
 * Contextual Tours — Panduan spesifik untuk halaman-halaman dalam
 */
function getDraftTourSteps() {
  return [
    {
      element: '.page-header',
      popover: {
        title: '📝 Kelola Draft Naskah',
        description: 'Di halaman ini, Anda mengelola semua draft atau rancangan surat dinas keluar sebelum diajukan ke Pimpinan.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#btn-buat-draft',
      popover: {
        title: '➕ Buat Draft Baru',
        description: 'Klik tombol ini untuk mulai membuat surat baru. Anda akan diarahkan ke halaman editor teks dan dapat memilih template yang sudah disediakan.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '#filter-draft',
      popover: {
        title: '🔍 Filter Status',
        description: 'Gunakan tab ini untuk menyaring tampilan draft berdasarkan statusnya (Belum Diajukan / Sudah Diajukan).',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#table-draft',
      popover: {
        title: '📋 Tabel Draft Naskah',
        description: 'Ini adalah daftar draft naskah Anda. Anda bisa mengedit, menghapus, atau <strong>mengajukan draft</strong> ke Pimpinan dengan menggunakan tombol aksi di sebelah kanan setiap baris.',
        side: 'top',
        align: 'center',
      },
    }
  ];
}

function getNaskahMasukTourSteps() {
  return [
    {
      element: '.page-header',
      popover: {
        title: '📥 Naskah Masuk',
        description: 'Halaman ini adalah tempat untuk mendata semua surat resmi yang masuk ke organisasi dari pihak luar.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#btn-register-masuk',
      popover: {
        title: '➕ Register Surat Masuk',
        description: 'Klik tombol ini jika Anda menerima surat fisik/digital baru. Anda akan diminta mengisi data asal surat dan mengunggah lampiran PDF-nya.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '#search-masuk',
      popover: {
        title: '🔍 Pencarian',
        description: 'Gunakan kolom ini untuk mencari surat masuk berdasarkan perihal, nama pengirim, atau nomor asal secara cepat.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '#table-masuk',
      popover: {
        title: '📋 Daftar Naskah Masuk',
        description: 'Di sini Anda dapat melihat seluruh arsip naskah masuk. Klik ikon "Detail/Disposisi" di sebelah kanan untuk melihat detail lengkap atau melakukan disposisi (teruskan surat ke anggota lain).',
        side: 'top',
        align: 'center',
      },
    }
  ];
}

function getNaskahKeluarTourSteps() {
  return [
    {
      element: '.page-header',
      popover: {
        title: '📤 Naskah Keluar',
        description: 'Halaman ini digunakan untuk melacak status akhir dari draft naskah yang telah diajukan. Hanya naskah yang sedang diproses atau sudah selesai yang tampil di sini.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#filter-keluar',
      popover: {
        title: '🔍 Filter Pencarian & Status',
        description: 'Anda dapat mencari naskah berdasarkan perihal/nomor, atau menyaringnya berdasarkan status spesifik seperti "Menunggu Verifikasi", "Disetujui", atau "Ditandatangani".',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#table-keluar',
      popover: {
        title: '📋 Daftar Naskah Keluar',
        description: 'Pantau status alur dokumen di sini. Klik pada salah satu baris atau klik ikon aksi di sebelah kanan untuk melihat riwayat alur lengkap naskah.',
        side: 'top',
        align: 'center',
      },
    }
  ];
}

function getDisposisiTourSteps() {
  return [
    {
      element: '.page-header',
      popover: {
        title: '🔀 Delegasi & Disposisi',
        description: 'Disposisi adalah instruksi tindak lanjut dari Pimpinan terkait suatu naskah/surat.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#filter-disposisi',
      popover: {
        title: '🔍 Navigasi & Filter',
        description: 'Bagi Pimpinan, ada tab "Disposisi Keluar" (yang diberikan) dan "Disposisi Masuk" (yang diterima). Anda juga bisa menyaring status penyelesaian tugas (Belum Dibaca / Selesai).',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#table-disposisi',
      popover: {
        title: '📋 Tabel Instruksi Disposisi',
        description: 'Berisi instruksi/memo dari Pimpinan beserta batas waktu tugas. Klik ikon "Mata" di aksi kanan untuk melihat detail disposisi dan memberikan Laporan Tindak Lanjut jika Anda sebagai penerima tugas.',
        side: 'top',
        align: 'center',
      },
    }
  ];
}

function getArsipAktifTourSteps() {
  return [
    {
      element: '.page-header',
      popover: {
        title: '📁 Arsip Aktif',
        description: 'Arsip aktif adalah dokumen yang masih sering diakses. Setelah naskah keluar ditandatangani/terkirim, sistem secara otomatis memberkaskannya di sini.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#filter-arsip-aktif',
      popover: {
        title: '🔍 Filter & Klasifikasi',
        description: 'Cari berkas atau filter berdasarkan Kode Klasifikasi Jadwal Retensi Arsip (JRA) seperti UMUM, KEU, SDM, dll.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#table-arsip-aktif',
      popover: {
        title: '📋 Daftar Berkas Arsip',
        description: 'Tabel ini menampilkan metadata arsip. Klik ikon "Detail" di kanan untuk melihat informasi lengkap arsip dan mendownload lampiran PDF-nya. Pimpinan juga memiliki tombol untuk memindahkan arsip ini ke "Inaktif" jika sudah jarang digunakan.',
        side: 'top',
        align: 'center',
      },
    }
  ];
}

// =========================================
// FUNGSI PUBLIK
// =========================================

/**
 * Memulai tour utama (overview seluruh aplikasi)
 */
export function startMainTour(userRole) {
  const steps = getMainTourSteps(userRole);

  // Filter langkah yang elemennya ada di DOM
  const validSteps = steps.filter(step => document.querySelector(step.element));

  if (validSteps.length === 0) return;

  const driverObj = driver({
    ...baseConfig,
    steps: validSteps,
    onDestroyStarted: () => {
      driverObj.destroy();
    },
  });

  driverObj.drive();
}

/**
 * Memulai tour kontekstual berdasarkan halaman (pathname)
 */
export function startContextualTour(pathname, userRole) {
  let steps = [];

  if (pathname === '/') {
    steps = getDashboardTourSteps(userRole);
  } else if (pathname === '/draft' || pathname === '/draft/tambah' || pathname.startsWith('/draft/edit/')) {
    steps = getDraftTourSteps();
  } else if (pathname === '/naskah-masuk') {
    steps = getNaskahMasukTourSteps();
  } else if (pathname === '/naskah-keluar') {
    steps = getNaskahKeluarTourSteps();
  } else if (pathname === '/disposisi') {
    steps = getDisposisiTourSteps();
  } else if (pathname === '/arsip-aktif') {
    steps = getArsipAktifTourSteps();
  } else {
    // Jika tidak ada tour spesifik, jalankan tour utama
    startMainTour(userRole);
    return;
  }

  // Filter valid steps
  const validSteps = steps.filter(step => document.querySelector(step.element));
  if (validSteps.length === 0) {
    // Fallback jika elemen tidak ditemukan
    startMainTour(userRole);
    return;
  }

  const driverObj = driver({
    ...baseConfig,
    steps: validSteps,
    onDestroyStarted: () => {
      driverObj.destroy();
    },
  });

  driverObj.drive();
}

/**
 * Cek apakah tour sudah pernah dilihat
 */
export function hasTourBeenSeen(tourName = 'main') {
  return localStorage.getItem(`tour_seen_${tourName}`) === 'true';
}

/**
 * Tandai tour sebagai sudah dilihat
 */
export function markTourAsSeen(tourName = 'main') {
  localStorage.setItem(`tour_seen_${tourName}`, 'true');
}

/**
 * Reset semua tour (agar bisa ditampilkan ulang)
 */
export function resetAllTours() {
  localStorage.removeItem('tour_seen_main');
  localStorage.removeItem('tour_seen_dashboard');
}
