import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Share2, Clock, CheckCircle, Eye, CornerDownRight, CheckSquare, MessageSquare } from 'lucide-react';
import { formatTanggal, STATUS_DISPOSISI_LABELS } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function DisposisiListPage() {
  const { user } = useAuthStore();
  const [disposisis, setDisposisis] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs: 'masuk' (received) / 'keluar' (sent)
  const isPimpinan = user?.peran === 'ketufor' || user?.peran === 'waketufor';
  const [activeTab, setActiveTab] = useState(isPimpinan ? 'keluar' : 'masuk');
  const [statusFilter, setStatusFilter] = useState('');

  // Detail & Tindaklanjuti Modal States
  const [selectedDisp, setSelectedDisp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTindakModal, setShowTindakModal] = useState(false);
  const [catatanTindakLanjut, setCatatanTindakLanjut] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDisposisis = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/disposisi?tab=${activeTab}&status=${statusFilter}`);
      setDisposisis(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Gagal memuat daftar disposisi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisposisis();
  }, [activeTab, statusFilter]);

  const handleOpenDetail = async (disp) => {
    setSelectedDisp(disp);
    setShowDetailModal(true);

    // If it's a received disposisi and currently unread, automatically mark as read on backend
    if (activeTab === 'masuk' && disp.status === 'belum_dibaca') {
      try {
        await api.put(`/disposisi/${disp.id}/baca`);
        // Silently update status locally
        setDisposisis(prev => prev.map(item => item.id === disp.id ? { ...item, status: 'dibaca' } : item));
      } catch (err) {
        // ignore
      }
    }
  };

  const handleTindakLanjut = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/disposisi/${selectedDisp.id}/tindaklanjuti`, { catatan: catatanTindakLanjut });
      toast.success('Disposisi berhasil ditindaklanjuti!');
      setShowTindakModal(false);
      setShowDetailModal(false);
      setCatatanTindakLanjut('');
      fetchDisposisis();
    } catch (err) {
      toast.error('Gagal menyelesaikan disposisi');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'belum_dibaca': return 'badge-belum_dibaca';
      case 'dibaca': return 'badge-dibaca';
      case 'ditindaklanjuti': return 'badge-ditindaklanjuti';
      default: return 'badge-belum_dibaca';
    }
  };

  if (loading && disposisis.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>Delegasi & Disposisi Surat</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>Daftar penugasan dan pelaporan tindak lanjut surat dinas organisasi</p>
        </div>
      </div>

      {/* Tabs and filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        {isPimpinan && (
          <div style={{ display: 'flex', gap: '8px', background: 'var(--slate-200)', padding: '4px', borderRadius: 'var(--radius)', border: '1px solid var(--slate-300)' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'keluar' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ borderRadius: 'var(--radius-sm)', border: 'none', background: activeTab === 'keluar' ? undefined : 'transparent', color: activeTab === 'keluar' ? undefined : 'var(--slate-700)' }}
              onClick={() => setActiveTab('keluar')}
            >
              Disposisi Keluar (Dikirim)
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'masuk' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ borderRadius: 'var(--radius-sm)', border: 'none', background: activeTab === 'masuk' ? undefined : 'transparent', color: activeTab === 'masuk' ? undefined : 'var(--slate-700)' }}
              onClick={() => setActiveTab('masuk')}
            >
              Disposisi Masuk (Diterima)
            </button>
          </div>
        )}

        <div>
          <select 
            className="form-control" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="">-- Semua Status --</option>
            <option value="belum_dibaca">Belum Dibaca</option>
            <option value="dibaca">Sudah Dibaca</option>
            <option value="ditindaklanjuti">Selesai Tindak Lanjut</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {disposisis.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--slate-400)' }}>
              <div style={{ marginBottom: '12px' }}><Share2 size={40} style={{ opacity: 0.5 }} /></div>
              Tidak ada disposisi ditemukan.
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Naskah Surat</th>
                    <th>{activeTab === 'keluar' ? 'Penerima Disposisi' : 'Pengirim Disposisi'}</th>
                    <th>Instruksi / Memo</th>
                    <th>Batas Waktu</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {disposisis.map((disp) => (
                    <tr key={disp.id} onClick={() => handleOpenDetail(disp)} style={{ cursor: 'pointer' }}>
                      <td className="cell-main">
                        <div>{disp.naskah?.perihal || 'Naskah dihapus'}</div>
                        <div className="cell-sub" style={{ fontSize: '11px', marginTop: '2px', fontFamily: 'monospace' }}>No: {disp.naskah?.nomor_naskah || '-'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>
                          {activeTab === 'keluar' ? disp.penerima?.nama_lengkap : disp.pengirim?.nama_lengkap}
                        </div>
                        <div className="cell-sub" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                          {activeTab === 'keluar' ? disp.penerima?.peran : disp.pengirim?.peran}
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {disp.instruksi}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                          <Clock size={14} style={{ color: 'var(--slate-400)' }} />
                          {formatTanggal(disp.batas_waktu)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusClass(disp.status)}`}>
                          <span className="badge-dot"></span>
                          {STATUS_DISPOSISI_LABELS[disp.status] || disp.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            title="Detail Penugasan"
                            onClick={(e) => { e.stopPropagation(); handleOpenDetail(disp); }}
                          >
                            <Eye size={16} color="var(--primary-600)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Disposisi Detail Modal Drawer */}
      {showDetailModal && selectedDisp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', zIndex: 1000, padding: '20px', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title">Instruksi Disposisi Pimpinan</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>
            <div className="card-body">
              {/* Task metadata */}
              <div style={{ background: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--slate-200)', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ color: 'var(--slate-500)', marginBottom: '2px' }}>Delegator:</div>
                    <div style={{ fontWeight: '600' }}>{selectedDisp.pengirim?.nama_lengkap}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--slate-500)', marginBottom: '2px' }}>Penerima:</div>
                    <div style={{ fontWeight: '600' }}>{selectedDisp.penerima?.nama_lengkap}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--slate-500)', marginBottom: '2px' }}>Tanggal Kirim:</div>
                    <div>{formatTanggal(selectedDisp.created_at)}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--slate-500)', marginBottom: '2px' }}>Batas Waktu:</div>
                    <div style={{ color: 'var(--danger-600)', fontWeight: '600' }}>{formatTanggal(selectedDisp.batas_waktu)}</div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CornerDownRight size={16} /> Instruksi Pimpinan:
                </h4>
                <p style={{ background: 'var(--warning-50)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--warning-500)', fontSize: '14px', lineHeight: '1.6', color: 'var(--slate-800)' }}>
                  {selectedDisp.instruksi}
                </p>
              </div>

              {/* Letter link */}
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', padding: '12px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--slate-200)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>Dokumen Dinas Terkait:</div>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>{selectedDisp.naskah?.perihal}</div>
                </div>
                <a href={`/naskah/${selectedDisp.naskah?.id}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} /> Lihat Surat
                </a>
              </div>

              {/* Action completion notes */}
              {selectedDisp.status === 'ditindaklanjuti' ? (
                <div style={{ background: 'var(--success-50)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--success-600)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--success-600)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> Disposisi Selesai Ditindaklanjuti
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--slate-700)', marginBottom: '8px' }}>
                    <strong>Laporan Tindak Lanjut:</strong> {selectedDisp.catatan_tindak_lanjut || 'Selesai tanpa catatan tambahan.'}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)' }}>
                    Ditindaklanjuti pada: {formatTanggal(selectedDisp.ditindaklanjuti_pada)}
                  </div>
                </div>
              ) : (
                activeTab === 'masuk' && (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowTindakModal(true)}>
                    <CheckSquare size={16} /> Konfirmasi Selesai & Tindak Lanjut
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tindak Lanjut Confirmation Modal */}
      {showTindakModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', zIndex: 1010, padding: '20px', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <div className="card-header">
              <h3 className="card-title">Laporan Penyelesaian Tugas</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTindakModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleTindakLanjut}>
              <div className="card-body">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Catatan Tindak Lanjut (Opsional)</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Tulis laporan ringkas penyelesaian tugas atau disposisi pimpinan ini..."
                    value={catatanTindakLanjut}
                    onChange={(e) => setCatatanTindakLanjut(e.target.value)}
                    style={{ minHeight: '100px' }}
                  />
                </div>
              </div>
              <div className="card-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTindakModal(false)} disabled={submitting}>Kembali</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Selesaikan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
