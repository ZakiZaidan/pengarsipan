import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FileText, 
  Mail, 
  Send, 
  Share2, 
  Archive, 
  Users, 
  FilePlus, 
  PlusCircle, 
  CheckCircle, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { formatTanggal, formatTanggalRelatif, STATUS_LABELS } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        toast.error('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return <LoadingSpinner />;
  }

  const { statistik, aktivitas_terkini, naskah_terbaru: naskahTerbaru } = data;

  const handleRowClick = (id) => {
    navigate(`/naskah/${id}`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'draft': return 'badge-draft';
      case 'menunggu_verifikasi': return 'badge-menunggu';
      case 'disetujui': return 'badge-disetujui';
      case 'ditolak': return 'badge-ditolak';
      case 'ditandatangani': return 'badge-ditandatangani';
      case 'terkirim': return 'badge-terkirim';
      case 'diarsipkan': return 'badge-diarsipkan';
      default: return 'badge-draft';
    }
  };

  return (
    <div>
      {/* Welcome banner */}
      <div className="card welcome-banner">
        <h2>
          Selamat Datang, {user?.nama_lengkap}!
        </h2>
        <p>
          Anda login sebagai <strong>{user?.peran === 'ketufor' ? 'Ketua Formatur' : user?.peran === 'waketufor' ? 'Wakil Ketua Formatur' : 'Sekretaris'}</strong>. Gunakan modul navigasi di sebelah kiri untuk mengelola persuratan dan pengarsipan organisasi.
        </p>
      </div>

      {/* Stats grid */}
      <div className="stat-grid">
        {user?.peran === 'sekretaris' ? (
          <>
            <div className="stat-card stat-blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/draft')}>
              <div className="stat-icon blue"><FileText size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Draft Naskah Aktif</div>
                <div className="stat-value">{statistik.naskah_draft}</div>
              </div>
            </div>
            <div className="stat-card stat-green" style={{ cursor: 'pointer' }} onClick={() => navigate('/naskah-keluar')}>
              <div className="stat-icon green"><Send size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Total Surat Keluar</div>
                <div className="stat-value">{statistik.total_naskah - statistik.naskah_draft}</div>
              </div>
            </div>
            <div className="stat-card stat-amber" style={{ cursor: 'pointer' }} onClick={() => navigate('/arsip-aktif')}>
              <div className="stat-icon amber"><Archive size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Arsip Aktif</div>
                <div className="stat-value">{statistik.arsip_aktif}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card stat-blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/naskah-masuk')}>
              <div className="stat-icon blue"><Mail size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Naskah Masuk Baru</div>
                <div className="stat-value">{statistik.naskah_masuk_hari_ini}</div>
              </div>
            </div>
            <div className="stat-card stat-amber" style={{ cursor: 'pointer' }} onClick={() => navigate('/naskah-keluar')}>
              <div className="stat-icon amber"><Clock size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Menunggu Verifikasi</div>
                <div className="stat-value">{statistik.naskah_menunggu_verifikasi}</div>
              </div>
            </div>
            <div className="stat-card stat-red" style={{ cursor: 'pointer' }} onClick={() => navigate('/disposisi')}>
              <div className="stat-icon red"><Share2 size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Disposisi Belum Dibaca</div>
                <div className="stat-value">{statistik.disposisi_belum_dibaca}</div>
              </div>
            </div>
            <div className="stat-card stat-green" style={{ cursor: 'pointer' }} onClick={() => navigate('/arsip-aktif')}>
              <div className="stat-icon green"><Archive size={24} /></div>
              <div className="stat-info">
                <div className="stat-label">Total Arsip Terdaftar</div>
                <div className="stat-value">{statistik.total_arsip}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions & Recent documents */}
      <div className="dashboard-grid">
        {/* Recent letters */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Naskah Dinas Terbaru</h3>
            <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate(user?.peran === 'sekretaris' ? '/draft' : '/naskah-keluar')}>
              Lihat Semua <ChevronRight size={16} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {naskahTerbaru.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-400)' }}>
                Belum ada naskah dinas yang dibuat.
              </div>
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Perihal</th>
                      <th>Jenis</th>
                      <th>Pembuat</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {naskahTerbaru.map((naskah) => (
                      <tr key={naskah.id} onClick={() => handleRowClick(naskah.id)} style={{ cursor: 'pointer' }}>
                        <td className="cell-main">{naskah.perihal}</td>
                        <td style={{ textTransform: 'capitalize' }}>{naskah.jenis}</td>
                        <td>{naskah.pembuat || 'Sistem'}</td>
                        <td>{formatTanggal(naskah.tanggal)}</td>
                        <td>
                          <span className={`badge ${getStatusClass(naskah.status)}`}>
                            <span className="badge-dot"></span>
                            {STATUS_LABELS[naskah.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Aksi Cepat</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user?.peran === 'sekretaris' && (
                <>
                  <button className="btn btn-primary btn-block" style={{ width: '100%' }} onClick={() => navigate('/draft/tambah')}>
                    <FilePlus size={18} /> Buat Draft Naskah
                  </button>
                  <button className="btn btn-secondary btn-block" style={{ width: '100%' }} onClick={() => navigate('/pengaturan/template')}>
                    <PlusCircle size={18} /> Kelola Template
                  </button>
                  <button className="btn btn-secondary btn-block" style={{ width: '100%' }} onClick={() => navigate('/arsip-aktif')}>
                    <Archive size={18} /> Kelola Arsip Aktif
                  </button>
                </>
              )}
              {(user?.peran === 'ketufor' || user?.peran === 'waketufor') && (
                <>
                  <button className="btn btn-primary btn-block" style={{ width: '100%' }} onClick={() => navigate('/naskah-masuk')}>
                    <Mail size={18} /> Register Surat Masuk
                  </button>
                  <button className="btn btn-secondary btn-block" style={{ width: '100%' }} onClick={() => navigate('/disposisi')}>
                    <Share2 size={18} /> Kelola Disposisi
                  </button>
                  {user?.peran === 'ketufor' && (
                    <button className="btn btn-secondary btn-block" style={{ width: '100%' }} onClick={() => navigate('/pengaturan/pengguna')}>
                      <Users size={18} /> Kelola Pengguna
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Activity log */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Log Aktivitas Terkini</h3>
            </div>
            <div className="card-body" style={{ maxHeight: '350px', overflowY: 'auto', padding: '16px' }}>
              {aktivitas_terkini.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--slate-400)', fontSize: '13px' }}>
                  Tidak ada aktivitas terdeteksi.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {aktivitas_terkini.map((log, idx) => (
                    <div key={log.id || idx} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-500)',
                        marginTop: '6px',
                        flexShrink: 0
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: 'var(--slate-800)' }}>
                          {log.pengguna}
                        </div>
                        <div style={{ color: 'var(--slate-600)', margin: '2px 0' }}>
                          {log.aksi}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--slate-400)' }}>
                          {formatTanggalRelatif(log.terjadi_pada)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
