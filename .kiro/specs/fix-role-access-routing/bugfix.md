# Bugfix Requirements Document

## Introduction

Dua bug ditemukan pada konfigurasi routing frontend (`App.jsx`) di Sistem Pengarsipan. Properti `allowedRoles` pada komponen `PrivateRoute` tidak sesuai dengan spesifikasi hak akses yang didefinisikan di SRS (Software Requirements Specification). Bug ini menyebabkan role Ketufor dan Waketufor tidak bisa mengakses halaman Draft Naskah, serta role Sekretaris tidak bisa mengakses halaman Naskah Masuk — padahal seharusnya ketiga role tersebut memiliki akses ke kedua modul tersebut sesuai SRS Bagian 3.1, 3.3, dan Matriks Hak Akses (Bagian 4).

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN user dengan role ketufor mengakses halaman `/draft`, `/draft/tambah`, atau `/draft/edit/:id` THEN the system menolak akses dan me-redirect ke halaman utama dengan pesan error "Anda tidak memiliki akses ke halaman ini"

1.2 WHEN user dengan role waketufor mengakses halaman `/draft`, `/draft/tambah`, atau `/draft/edit/:id` THEN the system menolak akses dan me-redirect ke halaman utama dengan pesan error "Anda tidak memiliki akses ke halaman ini"

1.3 WHEN user dengan role sekretaris mengakses halaman `/naskah-masuk` THEN the system menolak akses dan me-redirect ke halaman utama dengan pesan error "Anda tidak memiliki akses ke halaman ini"

### Expected Behavior (Correct)

2.1 WHEN user dengan role ketufor mengakses halaman `/draft`, `/draft/tambah`, atau `/draft/edit/:id` THEN the system SHALL menampilkan halaman Draft Naskah / Form Naskah sesuai dengan route yang diminta

2.2 WHEN user dengan role waketufor mengakses halaman `/draft`, `/draft/tambah`, atau `/draft/edit/:id` THEN the system SHALL menampilkan halaman Draft Naskah / Form Naskah sesuai dengan route yang diminta

2.3 WHEN user dengan role sekretaris mengakses halaman `/naskah-masuk` THEN the system SHALL menampilkan halaman Naskah Masuk sehingga sekretaris dapat meregistrasi naskah masuk

### Unchanged Behavior (Regression Prevention)

3.1 WHEN user dengan role sekretaris mengakses halaman `/draft`, `/draft/tambah`, atau `/draft/edit/:id` THEN the system SHALL CONTINUE TO menampilkan halaman Draft Naskah / Form Naskah (akses sekretaris ke draft tetap dipertahankan)

3.2 WHEN user dengan role ketufor atau waketufor mengakses halaman `/naskah-masuk` THEN the system SHALL CONTINUE TO menampilkan halaman Naskah Masuk (akses ketufor/waketufor ke naskah masuk tetap dipertahankan)

3.3 WHEN user yang belum login mengakses route manapun THEN the system SHALL CONTINUE TO me-redirect ke halaman `/login`

3.4 WHEN user dengan role yang tidak termasuk dalam allowedRoles mengakses route lain yang tidak terkait bug ini (misalnya sekretaris mengakses `/disposisi`) THEN the system SHALL CONTINUE TO menolak akses dan me-redirect ke halaman utama

3.5 WHEN user dengan role apapun mengakses halaman `/naskah-keluar`, `/arsip-aktif`, `/arsip-inaktif`, atau `/ekspor-pdf` THEN the system SHALL CONTINUE TO menampilkan halaman tersebut sesuai konfigurasi existing (semua role memiliki akses)

---

### Bug Condition (Formal Specification)

**Bug Condition Function:**

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type RouteAccess { role: string, path: string }
  OUTPUT: boolean

  RETURN (X.role IN ['ketufor', 'waketufor'] AND X.path IN ['/draft', '/draft/tambah', '/draft/edit/:id'])
      OR (X.role = 'sekretaris' AND X.path = '/naskah-masuk')
END FUNCTION
```

**Property Specification — Fix Checking:**

```pascal
// Property: Fix Checking - Role Access Corrected
FOR ALL X WHERE isBugCondition(X) DO
  result ← accessRoute'(X)
  ASSERT result.granted = true AND result.redirected = false
END FOR
```

**Preservation Goal:**

```pascal
// Property: Preservation Checking - Other Routes Unchanged
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT accessRoute(X) = accessRoute'(X)
END FOR
```

**Key Definitions:**
- **F (accessRoute)**: Fungsi routing sebelum perbaikan — menggunakan `allowedRoles` yang salah
- **F' (accessRoute')**: Fungsi routing setelah perbaikan — menggunakan `allowedRoles` yang benar sesuai SRS
