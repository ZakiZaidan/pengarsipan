import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';

// Layouts & Routing
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/common/PrivateRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Dashboard Page
import DashboardPage from './pages/dashboard/DashboardPage';

// Naskah Pages
import DraftNaskahPage from './pages/naskah/DraftNaskahPage';
import NaskahForm from './pages/naskah/NaskahForm';
import NaskahMasukPage from './pages/naskah/NaskahMasukPage';
import NaskahKeluarPage from './pages/naskah/NaskahKeluarPage';
import NaskahDetailPage from './pages/naskah/NaskahDetailPage';

// Disposisi Pages
import DisposisiListPage from './pages/disposisi/DisposisiListPage';

// Arsip Pages
import ArsipAktifPage from './pages/arsip/ArsipAktifPage';
import ArsipInaktifPage from './pages/arsip/ArsipInaktifPage';

// Ekspor PDF Page
import EksporPdfPage from './pages/ekspor/EksporPdfPage';

// Pengaturan Pages
import PenggunaPage from './pages/pengaturan/PenggunaPage';
import TemplatePage from './pages/pengaturan/TemplatePage';
import SistemPage from './pages/pengaturan/SistemPage';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--slate-800, #1e293b)',
            color: '#fff',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius)',
            fontSize: '14px',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: 'var(--success-500, #10b981)',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger-500, #ef4444)',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes inside MainLayout */}
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Draft Naskah */}
          <Route path="draft" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris']}><DraftNaskahPage /></PrivateRoute>
          } />
          <Route path="draft/tambah" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris']}><NaskahForm /></PrivateRoute>
          } />
          <Route path="draft/edit/:id" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris']}><NaskahForm /></PrivateRoute>
          } />

          {/* Naskah Masuk */}
          <Route path="naskah-masuk" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris', 'ketua_panitia']}><NaskahMasukPage /></PrivateRoute>
          } />

          {/* Naskah Keluar */}
          <Route path="naskah-keluar" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris', 'ketua_panitia']}><NaskahKeluarPage /></PrivateRoute>
          } />

          {/* Naskah Detail (Handles both masuk and keluar details) */}
          <Route path="naskah/:id" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris', 'ketua_panitia']}><NaskahDetailPage /></PrivateRoute>
          } />

          {/* Disposisi */}
          <Route path="disposisi" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris', 'ketua_panitia']}><DisposisiListPage /></PrivateRoute>
          } />

          {/* Kearsipan */}
          <Route path="arsip-aktif" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris']}><ArsipAktifPage /></PrivateRoute>
          } />
          <Route path="arsip-inaktif" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris']}><ArsipInaktifPage /></PrivateRoute>
          } />

          {/* Ekspor PDF */}
          <Route path="ekspor-pdf" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian', 'sekretaris']}><EksporPdfPage /></PrivateRoute>
          } />

          {/* Pengaturan */}
          <Route path="pengaturan/pengguna" element={
            <PrivateRoute allowedRoles={['ketufor']}><PenggunaPage /></PrivateRoute>
          } />
          <Route path="pengaturan/template" element={
            <PrivateRoute allowedRoles={['ketufor', 'sekretaris']}><TemplatePage /></PrivateRoute>
          } />
          <Route path="pengaturan/sistem" element={
            <PrivateRoute allowedRoles={['ketufor', 'waketufor', 'penasehat', 'ketua_harian']}><SistemPage /></PrivateRoute>
          } />

        </Route>

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
