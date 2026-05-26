import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Upload, X, User } from 'lucide-react';

export default function ProfilModal({ onClose }) {
  const { user, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingStempel, setLoadingStempel] = useState(false);
  const fileInputRef = useRef(null);
  const stempelInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStempelClick = () => {
    stempelInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // validasi tipe dan ukuran (max 2MB)
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Gunakan format gambar JPG atau PNG');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('tanda_tangan', file);

      await api.post('/profil/upload-ttd', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Gambar tanda tangan berhasil diunggah');
      await checkAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah tanda tangan');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStempelChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Gunakan format gambar JPG atau PNG');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }

    try {
      setLoadingStempel(true);
      const formData = new FormData();
      formData.append('stempel', file);

      await api.post('/profil/upload-stempel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Stempel berhasil diunggah');
      await checkAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah stempel');
    } finally {
      setLoadingStempel(false);
      if (stempelInputRef.current) stempelInputRef.current.value = '';
    }
  };

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '40px auto' }}>
        <div className="card-header">
          <h3 className="card-title">Profil Pengguna</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>&times;</button>
        </div>
        <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
          
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <User size={32} />
          </div>
          
          <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{user?.nama_lengkap}</h4>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px', marginBottom: '24px' }}>{user?.peran_label}</p>

          {/* Tanda Tangan — hanya untuk Ketufor dan Waketufor */}
          {(user?.peran === 'ketufor' || user?.peran === 'waketufor') && (
          <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '24px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', textAlign: 'left' }}>Tanda Tangan Elektronik</h5>
            
            {user?.tanda_tangan_path ? (
              <div style={{ border: '1px solid var(--slate-200)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '16px', background: 'var(--slate-50)' }}>
                <img 
                  src={`http://localhost:8000/storage/${user.tanda_tangan_path}`} 
                  alt="Tanda Tangan" 
                  style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{ padding: '20px', border: '1px dashed var(--slate-300)', borderRadius: 'var(--radius)', marginBottom: '16px', color: 'var(--slate-500)', fontSize: '13px' }}>
                Belum ada tanda tangan yang diunggah.
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg"
              style={{ display: 'none' }} 
            />

            <button 
              className="btn btn-secondary btn-block" 
              onClick={handleUploadClick}
              disabled={loading}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              <Upload size={16} /> 
              {loading ? 'Mengunggah...' : (user?.tanda_tangan_path ? 'Ubah Tanda Tangan' : 'Unggah Tanda Tangan')}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--slate-400)', marginTop: '8px', textAlign: 'left' }}>
              * Gunakan gambar .PNG dengan latar belakang transparan (max 2MB) untuk hasil terbaik.
            </p>
          </div>
          )}

          {/* Section Stempel — hanya untuk Ketufor */}
          {user?.peran === 'ketufor' && (
          <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '24px', marginTop: '24px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', textAlign: 'left' }}>Stempel Organisasi</h5>
            
            {user?.stempel_path ? (
              <div style={{ border: '1px solid var(--slate-200)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '16px', background: 'var(--slate-50)' }}>
                <img 
                  src={`http://localhost:8000/storage/${user.stempel_path}`} 
                  alt="Stempel" 
                  style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div style={{ padding: '20px', border: '1px dashed var(--slate-300)', borderRadius: 'var(--radius)', marginBottom: '16px', color: 'var(--slate-500)', fontSize: '13px' }}>
                Belum ada stempel yang diunggah. Stempel akan otomatis ditambahkan saat disposisi.
              </div>
            )}

            <input 
              type="file" 
              ref={stempelInputRef}
              onChange={handleStempelChange}
              accept=".png,.jpg,.jpeg"
              style={{ display: 'none' }} 
            />

            <button 
              className="btn btn-secondary btn-block" 
              onClick={handleStempelClick}
              disabled={loadingStempel}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              <Upload size={16} /> 
              {loadingStempel ? 'Mengunggah...' : (user?.stempel_path ? 'Ubah Stempel' : 'Unggah Stempel')}
            </button>
            <p style={{ fontSize: '11px', color: 'var(--slate-400)', marginTop: '8px', textAlign: 'left' }}>
              * Stempel otomatis ditempelkan pada naskah saat disposisi dilakukan.
            </p>
          </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
