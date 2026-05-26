import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileDown, Download, ToggleLeft, ToggleRight, CheckSquare, ListFilter, FileText } from 'lucide-react';
import { formatTanggal } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function EksporPdfPage() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [naskahs, setNaskahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states for new export
  const [selectedNaskahId, setSelectedNaskahId] = useState('');
  const [denganKop, setDenganKop] = useState(true);
  const [denganWatermark, setDenganWatermark] = useState(false);
  const [teksWatermark, setTeksWatermark] = useState('RAHASIA');
  const [ukuranKertas, setUkuranKertas] = useState('A4');

  const fetchHistoryAndNaskahs = async () => {
    try {
      setLoading(true);
      // Fetch history
      const historyRes = await api.get('/ekspor-pdf');
      setHistory(historyRes.data.data || historyRes.data || []);

      // Fetch exportable naskahs (all except drafts, or all for pimpinan)
      const naskahsRes = await api.get('/naskah');
      const allN = naskahsRes.data.data || naskahsRes.data || [];
      // Filter out draft letters unless user is leader or pembuat
      const exportable = allN.filter(n => n.status !== 'draft');
      setNaskahs(exportable);
    } catch (err) {
      toast.error('Gagal mengambil data ekspor PDF');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndNaskahs();
  }, []);

  const handleExport = async (e) => {
    e.preventDefault();
    if (!selectedNaskahId) {
      toast.error('Silakan pilih naskah dinas yang ingin diekspor');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/naskah/${selectedNaskahId}/ekspor-pdf`, {
        dengan_kop: denganKop,
        dengan_watermark: denganWatermark,
        teks_watermark: denganWatermark ? teksWatermark : null,
        ukuran_kertas: ukuranKertas
      });

      toast.success('PDF berhasil digenerate!');
      
      // Trigger download via blob
      const downloadId = res.data.ekspor?.id;
      if (downloadId) {
        const dlRes = await api.get(`/ekspor-pdf/${downloadId}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([dlRes.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `dokumen_${downloadId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      fetchHistoryAndNaskahs();
      setSelectedNaskahId('');
    } catch (err) {
      toast.error('Gagal melakukan ekspor PDF');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await api.get(`/ekspor-pdf/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dokumen_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Gagal mengunduh PDF');
    }
  };

  if (loading && history.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>Ekstrak & Ekspor PDF Resmi</h2>
        <p style={{ fontSize: '13px', color: 'var(--slate-505)' }}>Generate naskah dinas menjadi dokumen PDF standar organisasi lengkap dengan kop surat dan watermark</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        {/* Export Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Generate Dokumen Baru</h3>
          </div>
          <form onSubmit={handleExport}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Pilih Surat / Naskah Dinas <span className="required">*</span></label>
                <select 
                  className="form-control" 
                  value={selectedNaskahId} 
                  onChange={(e) => setSelectedNaskahId(e.target.value)}
                  required
                  disabled={submitting}
                >
                  <option value="">-- Pilih Naskah --</option>
                  {naskahs.map(n => (
                    <option key={n.id} value={n.id}>
                      [{n.status.toUpperCase()}] {n.perihal}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ukuran Kertas PDF</label>
                <select 
                  className="form-control" 
                  value={ukuranKertas} 
                  onChange={(e) => setUkuranKertas(e.target.value)}
                  disabled={submitting}
                >
                  <option value="A4">A4 (Standar)</option>
                  <option value="F4">F4 (Folio Resmi)</option>
                </select>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '14px' }}>
                  <span>Sertakan Kop Surat Organisasi</span>
                  <input 
                    type="checkbox" 
                    checked={denganKop} 
                    onChange={(e) => setDenganKop(e.target.checked)}
                    disabled={submitting}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '14px' }}>
                  <span>Gunakan Watermark Keamanan</span>
                  <input 
                    type="checkbox" 
                    checked={denganWatermark} 
                    onChange={(e) => setDenganWatermark(e.target.checked)}
                    disabled={submitting}
                  />
                </label>
              </div>

              {denganWatermark && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Teks Watermark</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={teksWatermark} 
                    onChange={(e) => setTeksWatermark(e.target.value)}
                    placeholder="Contoh: RAHASIA, DRAFT"
                    disabled={submitting}
                  />
                </div>
              )}
            </div>

            <div className="card-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--slate-200)', background: 'var(--slate-50)' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                <FileDown size={18} /> {submitting ? 'Generating...' : 'Generate & Download PDF'}
              </button>
            </div>
          </form>
        </div>

        {/* Export History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Riwayat Ekspor Dokumen</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {history.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--slate-400)' }}>
                <div style={{ marginBottom: '12px' }}><FileText size={40} style={{ opacity: 0.5 }} /></div>
                Belum ada riwayat pencetakan/ekspor PDF.
              </div>
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Surat Terkait</th>
                      <th>Pengekspor</th>
                      <th>Format Kertas / Kop / Watermark</th>
                      <th>Tanggal Ekspor</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td className="cell-main">
                          <div>{h.naskah?.perihal || 'Naskah dihapus'}</div>
                          <div className="cell-sub" style={{ fontSize: '11px', marginTop: '2px', fontFamily: 'monospace' }}>No: {h.naskah?.nomor_naskah || '-'}</div>
                        </td>
                        <td>{h.pengekspor?.nama_lengkap}</td>
                        <td style={{ fontSize: '13px' }}>
                          <div>Kertas: {h.ukuran_kertas}</div>
                          <div className="cell-sub" style={{ fontSize: '11px', marginTop: '2px' }}>
                            Kop: {h.dengan_kop ? 'Ya' : 'Tidak'} • WM: {h.dengan_watermark ? `Ya (${h.teks_watermark})` : 'Tidak'}
                          </div>
                        </td>
                        <td>{formatTanggal(h.created_at)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            title="Download PDF"
                            onClick={() => handleDownload(h.id)}
                          >
                            <Download size={16} color="var(--primary-600)" />
                          </button>
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
    </div>
  );
}
