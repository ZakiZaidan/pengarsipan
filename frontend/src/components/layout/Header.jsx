import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import NotificationBell from './NotificationBell';
import ProfilModal from '../profil/ProfilModal';
import { Menu, HelpCircle } from 'lucide-react';
import { startContextualTour } from '../../services/tourGuide';

export default function Header({ onMenuToggle }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const [showProfilModal, setShowProfilModal] = useState(false);

  // Helper to format path name into friendly Bahasa title
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/draft') return 'Draft Naskah';
    if (path === '/naskah-masuk') return 'Naskah Masuk';
    if (path === '/naskah-keluar') return 'Naskah Keluar';
    if (path === '/disposisi') return 'Disposisi Surat';
    if (path === '/arsip-aktif') return 'Arsip Aktif';
    if (path === '/arsip-inaktif') return 'Arsip Inaktif';
    if (path === '/ekspor-pdf') return 'Ekspor PDF';
    if (path.startsWith('/pengaturan/pengguna')) return 'Pengaturan > Kelola Pengguna';
    if (path.startsWith('/pengaturan/template')) return 'Pengaturan > Template Naskah';
    if (path.startsWith('/pengaturan/sistem')) return 'Pengaturan > Konfigurasi Sistem';
    if (path.startsWith('/naskah/')) return 'Detail Naskah';
    return 'Halaman';
  };

  const handleStartTour = () => {
    startContextualTour(location.pathname, user?.peran);
  };

  return (
    <header className="header">
      <div className="header-left">
        {/* Hamburger menu — only visible on mobile/tablet via CSS */}
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <h2 className="header-title" id="header-breadcrumb">{getBreadcrumbs()}</h2>
      </div>

      <div className="header-right">
        <button
          id="btn-tour-guide"
          className="btn btn-ghost btn-sm"
          onClick={handleStartTour}
          title="Panduan Penggunaan"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: 'var(--primary-600)',
            fontSize: '13px',
            fontWeight: '600',
            padding: '6px 12px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--primary-200)',
            background: 'var(--primary-50)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary-100)';
            e.currentTarget.style.borderColor = 'var(--primary-300)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary-50)';
            e.currentTarget.style.borderColor = 'var(--primary-200)';
          }}
        >
          <HelpCircle size={16} />
          <span>Panduan</span>
        </button>
        <NotificationBell />
        <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--slate-200)' }}></div>
        {user && (
          <div 
            id="header-profile"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: 'var(--radius)', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--slate-50)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={() => setShowProfilModal(true)}
          >
            <span className="header-user-name" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--slate-700)' }}>
              {user.nama_lengkap}
            </span>
            {user.tanda_tangan_path && (
              <span title="TTE Tersedia" style={{ color: 'var(--success-500)', display: 'flex' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
              </span>
            )}
          </div>
        )}
      </div>

      {showProfilModal && <ProfilModal onClose={() => setShowProfilModal(false)} />}
    </header>
  );
}

