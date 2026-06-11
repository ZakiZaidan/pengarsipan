import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Send, Clock, Eye } from 'lucide-react';
import { formatTanggal, STATUS_LABELS } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function NaskahKeluarPage() {
  const [naskahs, setNaskahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const fetchNaskahs = async () => {
    try {
      setLoading(true);
      // Naskah keluar: hanya yang sudah diajukan ke atas (bukan draft murni)
      const res = await api.get(`/naskah?jenis=keluar&status=${statusFilter}&cari=${search}`);
      const allNaskah = res.data.data || res.data || [];
      // Exclude draft yang belum diajukan — itu ditampilkan di halaman Draft Naskah
      const filtered = statusFilter ? allNaskah : allNaskah.filter(n => n.status !== 'draft' && n.status !== 'ditolak');
      setNaskahs(filtered);
    } catch (err) {
      toast.error('Gagal mengambil daftar naskah keluar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNaskahs();
  }, [search, statusFilter]);

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

  if (loading && naskahs.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>Daftar Naskah Dinas Keluar</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>Lacak status pengajuan, verifikasi, tanda tangan, dan pengiriman naskah dinas keluar</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="card" style={{ marginBottom: '20px' }} id="filter-keluar">
        <div className="card-body" style={{ padding: '16px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} 
            />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '38px' }}
              placeholder="Cari perihal, nomor naskah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select 
              className="form-control" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '200px' }}
            >
              <option value="">-- Semua Status --</option>
              <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
              <option value="ditandatangani">Ditandatangani</option>
              <option value="terkirim">Terkirim</option>
              <option value="diarsipkan">Diarsipkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {naskahs.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--slate-400)' }}>
              <div style={{ marginBottom: '12px' }}><Send size={40} style={{ opacity: 0.5 }} /></div>
              Tidak ada naskah dinas keluar terdaftar.
            </div>
          ) : (
            <div className="data-table-wrapper" id="table-keluar">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Perihal</th>
                    <th>Nomor Surat Resmi</th>
                    <th>Pengaju</th>
                    <th>Tanggal Pengajuan</th>
                    <th>Status Alur</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {naskahs.map((naskah) => (
                    <tr key={naskah.id} onClick={() => navigate(`/naskah/${naskah.id}`)} style={{ cursor: 'pointer' }}>
                      <td className="cell-main">{naskah.perihal}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{naskah.nomor_naskah || '-'}</td>
                      <td>{naskah.pembuat?.nama_lengkap || '-'}</td>
                      <td>{formatTanggal(naskah.created_at)}</td>
                      <td>
                        <span className={`badge ${getStatusClass(naskah.status)}`}>
                          <span className="badge-dot"></span>
                          {STATUS_LABELS[naskah.status]}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            title="Detail Alur"
                            onClick={(e) => { e.stopPropagation(); navigate(`/naskah/${naskah.id}`); }}
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
    </div>
  );
}
