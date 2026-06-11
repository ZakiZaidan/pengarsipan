import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Archive, Eye, MoveRight, Download, FileText, Database } from 'lucide-react';
import { formatTanggal, confirmAlert } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ArsipAktifPage() {
  const { user } = useAuthStore();
  const [arsips, setArsips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState('');
  const navigate = useNavigate();

  // Detail Modal State
  const [selectedArsip, setSelectedArsip] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchArsips = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/arsip?status_retensi=aktif&cari=${search}&kode_klasifikasi=${classification}`);
      setArsips(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Gagal mengambil daftar arsip aktif');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArsips();
  }, [search, classification]);

  const handlePindahkan = async (id, e) => {
    e.stopPropagation();
    const isConfirmed = await confirmAlert('Pindahkan Arsip?', 'Pindahkan arsip ini ke status INAKTIF?', 'Pindahkan');
    if (!isConfirmed) return;
    try {
      await api.put(`/arsip/${id}/pindahkan`);
      toast.success('Arsip berhasil dipindahkan ke status inaktif');
      fetchArsips();
    } catch (err) {
      toast.error('Gagal memindahkan arsip');
    }
  };

  const handleOpenDetail = async (id) => {
    try {
      const res = await api.get(`/arsip/${id}`);
      setSelectedArsip(res.data.data || res.data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error('Gagal mengambil detail arsip');
    }
  };

  if (loading && arsips.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>Pemberkasan & Arsip Aktif</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>Daftar surat resmi yang berada dalam masa retensi aktif organisasi</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }} id="filter-arsip-aktif">
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
              placeholder="Cari perihal, nomor, nama berkas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select 
              className="form-control" 
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">-- Semua Klasifikasi --</option>
              <option value="UMUM">UMUM (Umum & Kepegawaian)</option>
              <option value="KEU">KEU (Keuangan)</option>
              <option value="SDM">SDM (Sumber Daya Manusia)</option>
              <option value="PRG">PRG (Program & Kegiatan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {arsips.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--slate-400)' }}>
              <div style={{ marginBottom: '12px' }}><Archive size={40} style={{ opacity: 0.5 }} /></div>
              Belum ada berkas arsip aktif yang didaftarkan.
            </div>
          ) : (
            <div className="data-table-wrapper" id="table-arsip-aktif">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Berkas & Perihal</th>
                    <th>Nomor Dokumen Resmi</th>
                    <th>Kode Klasifikasi</th>
                    <th>Tanggal Aktif</th>
                    <th>Lokasi Fisik</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {arsips.map((arsip) => (
                    <tr key={arsip.id} onClick={() => handleOpenDetail(arsip.id)} style={{ cursor: 'pointer' }}>
                      <td className="cell-main">
                        <div>{arsip.nama_berkas}</div>
                        <div className="cell-sub" style={{ fontSize: '11px', marginTop: '2px' }}>Surat: {arsip.naskah?.perihal || '-'}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{arsip.naskah?.nomor_naskah || '-'}</td>
                      <td>
                        <span style={{ fontWeight: '700', padding: '2px 8px', background: 'var(--slate-200)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                          {arsip.kode_klasifikasi}
                        </span>
                      </td>
                      <td>{formatTanggal(arsip.tanggal_aktif)}</td>
                      <td>{arsip.lokasi_fisik || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            title="Detail Arsip & Naskah"
                            onClick={(e) => { e.stopPropagation(); handleOpenDetail(arsip.id); }}
                          >
                            <Eye size={16} color="var(--primary-600)" />
                          </button>
                          {(user?.peran === 'ketufor' || user?.peran === 'waketufor') && (
                            <button 
                              className="btn btn-ghost btn-sm" 
                              title="Pindahkan ke Inaktif"
                              onClick={(e) => handlePindahkan(arsip.id, e)}
                            >
                              <MoveRight size={16} color="var(--warning-600)" />
                            </button>
                          )}
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

      {/* Archive detail modal */}
      {showDetailModal && selectedArsip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', zIndex: 1000, padding: '20px', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title">Metadata Arsip Resmi</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>
            <div className="card-body">
              {/* Archive classification & file details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius)', border: '1px solid var(--slate-200)', marginBottom: '24px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: 'var(--slate-500)', marginBottom: '2px' }}>Nama Berkas Arsip:</div>
                  <div style={{ fontWeight: '700' }}>{selectedArsip.nama_berkas}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--slate-500)', marginBottom: '2px' }}>Kode Klasifikasi (JRA):</div>
                  <div><span style={{ fontWeight: '700', padding: '2px 6px', background: 'var(--slate-200)', borderRadius: '4px' }}>{selectedArsip.kode_klasifikasi}</span></div>
                </div>
                <div>
                  <div style={{ color: 'var(--slate-500)', marginBottom: '2px' }}>Mulai Retensi Aktif:</div>
                  <div>{formatTanggal(selectedArsip.tanggal_aktif)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--slate-500)', marginBottom: '2px' }}>Lokasi Penyimpanan Fisik:</div>
                  <div style={{ fontWeight: '600' }}>{selectedArsip.lokasi_fisik || 'Tidak ditentukan'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--slate-500)', marginBottom: '2px' }}>Diberkaskan Oleh:</div>
                  <div>{selectedArsip.pemberkasan?.nama_lengkap}</div>
                </div>
              </div>

              {/* Naskah details */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Database size={16} /> Isi Naskah Dinas Terkait
                </h4>
                <div style={{ padding: '12px 16px', background: 'var(--slate-50)', borderRadius: 'var(--radius)', border: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{selectedArsip.naskah?.perihal}</div>
                    <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: '2px', fontFamily: 'monospace' }}>Nomor: {selectedArsip.naskah?.nomor_naskah || '-'}</div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/naskah/${selectedArsip.naskah?.id}`)}>
                    Buka Naskah
                  </button>
                </div>
              </div>

              {/* PDF Lampiran Download */}
              {selectedArsip.naskah?.file_path && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-50)', padding: '12px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--primary-100)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <FileText size={20} color="var(--primary-600)" />
                    <div>
                      <div style={{ fontWeight: '600' }}>Lampiran File PDF Terkait</div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      try {
                        const res = await api.get(`/naskah/${selectedArsip.naskah.id}/lampiran`, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `lampiran_${selectedArsip.naskah.perihal || 'arsip'}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        toast.error('Gagal mengunduh lampiran');
                      }
                    }}
                  >
                    <Download size={14} /> Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
