import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import useNotifikasiStore from '../../stores/notifikasiStore';
import { 
  LayoutDashboard, 
  FileText, 
  Mail, 
  Send, 
  Share2, 
  Archive, 
  FileDown, 
  Users, 
  Settings, 
  LogOut,
  FolderOpen,
  Sliders
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { count: unreadCount, countDisposisi, countNaskahKeluar, countNaskahMasuk } = useNotifikasiStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const formatRole = (role) => {
    switch (role) {
      case 'ketufor': return 'Ketua Formatur';
      case 'waketufor': return 'Wakil Ketua Formatur';
      case 'sekretaris': return 'Sekretaris';
      case 'ketua_panitia': return 'Ketua Panitia';
      default: return role;
    }
  };

  // Define sidebar links based on user role
  const menuItems = [
    {
      title: 'Menu Utama',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ketufor', 'waketufor', 'sekretaris', 'ketua_panitia'] },
        { name: 'Draft Naskah', path: '/draft', icon: FileText, roles: ['ketufor', 'waketufor', 'sekretaris'] },
        { name: 'Naskah Masuk', path: '/naskah-masuk', icon: Mail, roles: ['ketufor', 'waketufor', 'sekretaris', 'ketua_panitia'] },
        { name: 'Naskah Keluar', path: '/naskah-keluar', icon: Send, roles: ['ketufor', 'waketufor', 'sekretaris', 'ketua_panitia'] },
        { name: 'Disposisi', path: '/disposisi', icon: Share2, roles: ['ketufor', 'waketufor', 'ketua_panitia'] },
      ]
    },
    {
      title: 'Kearsipan & Ekspor',
      items: [
        { name: 'Arsip Aktif', path: '/arsip-aktif', icon: Archive, roles: ['ketufor', 'waketufor', 'sekretaris'] },
        { name: 'Arsip Inaktif', path: '/arsip-inaktif', icon: FolderOpen, roles: ['ketufor', 'waketufor', 'sekretaris'] },
        { name: 'Ekspor PDF', path: '/ekspor-pdf', icon: FileDown, roles: ['ketufor', 'waketufor', 'sekretaris'] },
      ]
    },
    {
      title: 'Pengaturan',
      items: [
        { name: 'Kelola Pengguna', path: '/pengaturan/pengguna', icon: Users, roles: ['ketufor'] },
        { name: 'Template Naskah', path: '/pengaturan/template', icon: FileText, roles: ['ketufor', 'sekretaris'] },
        { name: 'Konfigurasi Sistem', path: '/pengaturan/sistem', icon: Sliders, roles: ['ketufor', 'waketufor'] },
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo forum.png" alt="Logo Forum" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '50%' }} />
        <div>
          <h1 className="sidebar-title">Sistem Arsip</h1>
          <p className="sidebar-subtitle">Forum Anak Muda</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((section, idx) => {
          // Filter items that current user has access to
          const filteredItems = section.items.filter(item => item.roles.includes(user?.peran));
          if (filteredItems.length === 0) return null;

          return (
            <div key={idx} className="nav-section">
              <h2 className="nav-section-title">{section.title}</h2>
              {filteredItems.map((item, itemIdx) => (
                <NavLink 
                  key={itemIdx} 
                  to={item.path} 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="nav-icon" />
                  <span>{item.name}</span>
                  {item.name === 'Disposisi' && countDisposisi > 0 && (
                    <span className="nav-badge">{countDisposisi}</span>
                  )}
                  {item.name === 'Naskah Keluar' && countNaskahKeluar > 0 && (
                    <span className="nav-badge">{countNaskahKeluar}</span>
                  )}
                  {item.name === 'Naskah Masuk' && countNaskahMasuk > 0 && (
                    <span className="nav-badge">{countNaskahMasuk}</span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {getInitials(user.nama_lengkap)}
            </div>
            <div className="sidebar-user-info">
              <h4 className="sidebar-user-name" title={user.nama_lengkap}>{user.nama_lengkap}</h4>
              <p className="sidebar-user-role">{formatRole(user.peran)}</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-ghost btn-sm" 
              style={{ color: 'var(--slate-400)', padding: '6px' }}
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
