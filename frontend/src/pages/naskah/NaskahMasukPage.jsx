import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Mail, Plus, Search, Calendar, FileText, Share2, Archive } from 'lucide-react';
import { formatTanggal, STATUS_LABELS } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function NaskahMasukPage() {
  const [naskahs, setNaskahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form states for registering incoming letter
  const [perihal, setPerihal] = useState('');
  const [nomorSuratAsal, setNomorSuratAsal] = useState('');
  const [tanggalSuratAsal, setTanggalSuratAsal] = useState('');
  const [tanggalTerima, setTanggalTerima] = useState(new Date().toISOString().split('T')[0]);
  const [pengirim, setPengirim] = useState('');
  const [lampiran, setLampiran] = useState(null);

  const fetchNaskahs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/naskah?jenis=masuk&cari=${search}`);
      setNaskahs(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Gagal mengambil daftar naskah masuk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNaskahs();
  }, [search]);

  const handleFileChange = (e) => {
    setLampiran(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!perihal || !pengirim) {
      toast.error('Kolom Perihal dan Pengirim wajib diisi');
      return;
    }
    if (!nomorSuratAsal || !tanggalSuratAsal || !tanggalTerima || !lampiran) {
      toast.error('Semua kolom wajib diisi termasuk lampiran PDF');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('perihal', perihal);
      formData.append('jenis', 'masuk');
      formData.append('pengirim', pengirim);
      formData.append('nomor_surat_asal', nomorSuratAsal);
      formData.append('tanggal_surat_asal', tanggalSuratAsal);
      formData.append('tanggal_terima', tanggalTerima);
      if (lampiran) {
        formData.append('lampiran', lampiran);
      }

      await api.post('/naskah', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Surat masuk berhasil diregistrasi!');
      setShowModal(false);
      // Reset form
      setPerihal('');
      setNomorSuratAsal('');
      setTanggalSuratAsal('');
      setPengirim('');
      setLampiran(null);
      fetchNaskahs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal meregistrasi surat masuk');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && naskahs.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>Registrasi Naskah Masuk</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>Daftar surat resmi yang diterima dari pihak eksternal organisasi</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Register Surat Masuk
        </button>
      </div>

      {/* Filter and search */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 24px' }}>
          <div style={{ position: 'relative', maxWidth: '360px' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} 
            />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '38px' }}
              placeholder="Cari perihal, pengirim, asal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {naskahs.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--slate-400)' }}>
              <div style={{ marginBottom: '12px' }}><Mail size={40} style={{ opacity: 0.5 }} /></div>
              Tidak ada naskah masuk terdaftar.
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Perihal / Pengirim</th>
                    <th>No. Asal / Tgl Asal</th>
                    <th>Tgl Terima</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {naskahs.map((naskah) => (
                    <tr key={naskah.id} onClick={() => navigate(`/naskah/${naskah.id}`)} style={{ cursor: 'pointer' }}>
                      <td className="cell-main">
                        <div>{naskah.perihal}</div>
                        <div className="cell-sub" style={{ fontSize: '11px', marginTop: '2px' }}>Dari: {naskah.pengirim || '-'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{naskah.nomor_surat_asal || '-'}</div>
                        <div className="cell-sub" style={{ fontSize: '11px', marginTop: '2px' }}>{formatTanggal(naskah.tanggal_surat_asal)}</div>
                      </td>
                      <td>{formatTanggal(naskah.tanggal_terima)}</td>
                      <td>
                        <span className={`badge ${naskah.status === 'diarsipkan' ? 'badge-diarsipkan' : 'badge-draft'}`}>
                          <span className="badge-dot"></span>
                          {naskah.status === 'diarsipkan' ? 'Diarsipkan' : 'Terdaftar'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            title="Detail / Disposisi"
                            onClick={(e) => { e.stopPropagation(); navigate(`/naskah/${naskah.id}`); }}
                          >
                            <Share2 size={16} color="var(--primary-600)" />
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

      {/* Registration Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="card-header">
              <h3 className="card-title">Registrasi Surat Masuk Baru</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ fontSize: '18px', fontWeight: 'bold' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Perihal Surat Masuk <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Contoh: Permohonan Peminjaman Aula Rapat"
                    value={perihal}
                    onChange={(e) => setPerihal(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Instansi / Pengirim <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Contoh: Pengurus Cabang Muhammadiyah"
                    value={pengirim}
                    onChange={(e) => setPengirim(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nomor Surat Asal <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: 023/PCM/V/2026"
                      value={nomorSuratAsal}
                      onChange={(e) => setNomorSuratAsal(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal Surat Asal <span className="required">*</span></label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={tanggalSuratAsal}
                      onChange={(e) => setTanggalSuratAsal(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tanggal Diterima <span className="required">*</span></label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={tanggalTerima}
                      onChange={(e) => setTanggalTerima(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Upload Berkas Lampiran (PDF) <span className="required">*</span></label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept="application/pdf"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="card-footer" style={{ padding: '16px 24px', background: 'var(--slate-50)', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--slate-200)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Registrasi Surat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
