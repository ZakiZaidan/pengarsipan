import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckSquare } from 'lucide-react';
import useNotifikasiStore from '../../stores/notifikasiStore';
import { formatTanggalRelatif } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { notifikasis, count, fetchBelumDibaca, tandaiBaca, tandaiBacaSemua } = useNotifikasiStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch
    fetchBelumDibaca();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchBelumDibaca();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown on click outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = async (notif) => {
    await tandaiBaca(notif.id);
    setIsOpen(false);

    // Redirect based on notification type
    if (notif.tipe === 'disposisi') {
      navigate('/disposisi');
    } else {
      navigate('/naskah-keluar');
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await tandaiBacaSemua();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="notification-bell" 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifikasi"
      >
        <Bell size={20} />
        {count > 0 && <span className="badge">{count}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Notifikasi</h3>
            {count > 0 && (
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={handleMarkAllRead}
              >
                <CheckSquare size={12} />
                Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div className="notification-list" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifikasis.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '13px' }}>
                Tidak ada notifikasi baru
              </div>
            ) : (
              notifikasis.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item unread`}
                  onClick={() => handleItemClick(notif)}
                >
                  <div className="notification-item-title">{notif.judul}</div>
                  <div className="notification-item-message">{notif.pesan}</div>
                  <div className="notification-item-time">{formatTanggalRelatif(notif.created_at)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
