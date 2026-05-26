import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ArrowLeft, 
  FileText, 
  Check, 
  X, 
  FileDown, 
  Send, 
  Share2, 
  Archive, 
  User, 
  Calendar, 
  AlertTriangle,
  Clock,
  Download
} from 'lucide-react';
import { formatTanggal, STATUS_LABELS, STATUS_DISPOSISI_LABELS, confirmAlert } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function NaskahDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [naskah, setNaskah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const editorRef = useRef(null);

  // Users list for disposisi dropdown
  const [users, setUsers] = useState([]);

  // Modals visibility
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisposisiModal, setShowDisposisiModal] = useState(false);
  const [showArsipModal, setShowArsipModal] = useState(false);

  // Form states
  const [catatanPenolakan, setCatatanPenolakan] = useState('');
  const [kePengguna, setKePengguna] = useState('');
  const [instruksi, setInstruksi] = useState('');
  const [batasWaktu, setBatasWaktu] = useState('');
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState('UMUM');
  const [lokasiFisik, setLokasiFisik] = useState('');

  const fetchNaskah = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/naskah/${id}`);
      setNaskah(res.data.data || res.data);
    } catch (err) {
      toast.error('Gagal mengambil detail naskah dinas');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/pengguna-list');
      // Filter out the current user and leaders themselves to avoid self-disposisi if desired,
      // or show all other users.
      const filtered = res.data.filter(u => u.id !== user?.id);
      setUsers(filtered);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNaskah();
    fetchUsers();
  }, [id]);

  const handleAjukan = async () => {
    const isConfirmed = await confirmAlert('Ajukan Naskah?', 'Ajukan draft naskah ini ke Pimpinan untuk verifikasi?', 'Ajukan');
    if (!isConfirmed) return;
    try {
      setActionLoading(true);
      await api.post(`/naskah/${id}/ajukan`);
      toast.success('Naskah berhasil diajukan untuk verifikasi!');
      fetchNaskah();
    } catch (err) {
      toast.error('Gagal mengajukan naskah');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetujui = async () => {
    const isConfirmed = await confirmAlert('Setujui Naskah?', 'Setujui naskah dinas ini?', 'Setujui');
    if (!isConfirmed) return;
    try {
      setActionLoading(true);
      await api.post(`/naskah/${id}/setujui`);
      toast.success('Naskah dinas berhasil disetujui!');
      fetchNaskah();
    } catch (err) {
      toast.error('Gagal menyetujui naskah');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTolak = async (e) => {
    e.preventDefault();
    if (!catatanPenolakan.trim()) {
      toast.error('Silakan isi catatan penolakan');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/naskah/${id}/tolak`, { catatan: catatanPenolakan });
      toast.success('Naskah dinas berhasil ditolak.');
      setShowRejectModal(false);
      fetchNaskah();
    } catch (err) {
      toast.error('Gagal menolak naskah');
    } finally {
      setActionLoading(false);
    }
  };

  // State for signature editor modal
  const [showSignEditor, setShowSignEditor] = useState(false);
  const [signEditorContent, setSignEditorContent] = useState('');
  const [signEditorMode, setSignEditorMode] = useState('first'); // 'first' | 'second'

  const handleTandaTangan = async (isSecond = false) => {
    if (!user?.tanda_tangan_path) {
      toast.error('Silakan unggah Tanda Tangan Anda di menu Profil terlebih dahulu!');
      return;
    }
    // Open editor modal with current naskah content
    setSignEditorContent(naskah?.isi_naskah || '');
    setSignEditorMode(isSecond ? 'second' : 'first');
    setShowSignEditor(true);
  };

  const handleInsertSignature = (editorInstance) => {
    if (!editorInstance) return;
    const ttdUrl = `http://localhost:8000/storage/${user.tanda_tangan_path}`;
    const label = signEditorMode === 'second' ? 'Penandatangan II' : 'Penandatangan I';
    const html = `<div style="display: inline-block; text-align: center; margin: 15px 20px 0 0;"><img src="${ttdUrl}" alt="TTE ${label}" style="max-height: 100px; width: auto;" /><br/><span style="font-size: 11px; color: #64748b;">${label}:<br/><strong>${user.nama_lengkap}</strong></span></div>`;
    editorInstance.insertContent(html);
  };

  const handleInsertStempel = (editorInstance) => {
    if (!editorInstance) return;
    if (!user?.stempel_path) {
      toast.error('Anda belum mengupload stempel di Profil');
      return;
    }
    const stempelUrl = `http://localhost:8000/storage/${user.stempel_path}`;
    const html = `<div style="display: inline-block; margin: 10px 20px 0 0;"><img src="${stempelUrl}" alt="Stempel" style="max-height: 80px; width: auto; opacity: 0.9;" /></div>`;
    editorInstance.insertContent(html);
  };

  const handleInsertAlignedBlock = (editorInstance, position) => {
    if (!editorInstance) return;
    const align = position === 'left' ? 'left' : position === 'right' ? 'right' : 'center';
    editorInstance.insertContent(`<div style="text-align: ${align}; margin-top: 30px;">&nbsp;</div>`);
    // Move cursor inside the div
    editorInstance.selection.select(editorInstance.selection.getNode());
    editorInstance.selection.collapse(false);
  };

  const handleSaveSignEditor = async () => {
    try {
      setActionLoading(true);
      await api.post(`/naskah/${id}/tandatangan`, { 
        sebagai_penandatangan_kedua: signEditorMode === 'second',
        isi_naskah_custom: signEditorContent,
      });
      toast.success(signEditorMode === 'second' ? 'Tanda tangan kedua berhasil!' : 'Naskah berhasil ditandatangani!');
      setShowSignEditor(false);
      fetchNaskah();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menandatangani naskah');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKirim = async () => {
    const isConfirmed = await confirmAlert('Kirim Naskah?', 'Kirim naskah dinas ini? Surat akan mendapatkan nomor resmi dan diarsipkan secara otomatis.', 'Kirim');
    if (!isConfirmed) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/naskah/${id}/kirim`);
      toast.success(`Naskah dikirim! Nomor Surat resmi: ${res.data.nomor_surat}`);
      fetchNaskah();
    } catch (err) {
      toast.error('Gagal mengirim naskah');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisposisi = async (e) => {
    e.preventDefault();
    if (!kePengguna || !instruksi || !batasWaktu) {
      toast.error('Silakan isi seluruh kolom disposisi');
      return;
    }
    try {
      setActionLoading(true);
      await api.post('/disposisi', {
        naskah_id: id,
        ke_pengguna: kePengguna,
        instruksi,
        batas_waktu: batasWaktu
      });
      toast.success('Disposisi naskah berhasil dikirim!');
      setShowDisposisiModal(false);
      setKePengguna('');
      setInstruksi('');
      setBatasWaktu('');
      fetchNaskah();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim disposisi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArsip = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post(`/naskah/${id}/arsipkan`, {
        kode_klasifikasi: kodeKlasifikasi,
        nama_berkas: naskah.perihal,
        lokasi_fisik: lokasiFisik
      });
      toast.success('Naskah dinas berhasil diarsipkan!');
      setShowArsipModal(false);
      fetchNaskah();
    } catch (err) {
      toast.error('Gagal mengarsipkan naskah');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const nask = naskah;
  const isPembuat = nask?.dibuat_oleh === user?.id;
  const isPimpinan = user?.peran === 'ketufor' || user?.peran === 'waketufor';

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
      {/* Header back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary btn-icon" onClick={() => navigate(-1)} title="Kembali">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>
              {nask.perihal}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
              Jenis: {nask.jenis === 'masuk' ? 'Naskah Masuk' : nask.jenis === 'keluar' ? 'Naskah Keluar' : 'Draft'} • Status: <span className={`badge ${getStatusClass(nask.status)}`} style={{ padding: '2px 8px', fontSize: '11px' }}>{STATUS_LABELS[nask.status]}</span>
            </p>
          </div>
        </div>
        
        {/* Export / Print PDF Button */}
        {nask.jenis === 'keluar' && nask.status !== 'draft' && (
          <button className="btn btn-secondary" onClick={() => navigate('/ekspor-pdf')}>
            <FileDown size={18} /> Opsi Ekspor PDF
          </button>
        )}
      </div>

      {/* Rejection comment */}
      {nask.status === 'ditolak' && nask.catatan_penolakan && (
        <div className="card" style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-500)', marginBottom: '24px', borderRadius: 'var(--radius)' }}>
          <div className="card-body" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertTriangle color="var(--danger-600)" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ color: 'var(--danger-600)', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>Naskah Dinas Ditolak</h4>
              <p style={{ color: 'var(--slate-700)', fontSize: '13px' }}><strong>Catatan Pimpinan:</strong> {nask.catatan_penolakan}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Letter Preview Sheet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {nask.jenis === 'masuk' ? (
            /* Incoming Letter Info Card */
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Informasi Surat Masuk</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                  <div>
                    <div style={{ color: 'var(--slate-500)', marginBottom: '4px' }}>Pengirim / Asal Surat</div>
                    <div style={{ fontWeight: '600', color: 'var(--slate-800)' }}>{nask.pengirim}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--slate-500)', marginBottom: '4px' }}>Nomor Surat Asal</div>
                    <div style={{ fontWeight: '600', color: 'var(--slate-800)' }}>{nask.nomor_surat_asal || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--slate-500)', marginBottom: '4px' }}>Tanggal Surat Asal</div>
                    <div style={{ fontWeight: '600', color: 'var(--slate-800)' }}>{formatTanggal(nask.tanggal_surat_asal)}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--slate-500)', marginBottom: '4px' }}>Tanggal Diterima</div>
                    <div style={{ fontWeight: '600', color: 'var(--slate-800)' }}>{formatTanggal(nask.tanggal_terima)}</div>
                  </div>
                </div>

                {nask.file_path && (
                  <div style={{ marginTop: '24px', padding: '16px', background: 'var(--slate-50)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={24} color="var(--primary-600)" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>Berkas Lampiran Surat</div>
                        <div style={{ fontSize: '11px', color: 'var(--slate-400)' }}>Format PDF</div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={async () => {
                        try {
                          const res = await api.get(`/naskah/${nask.id}/lampiran`, { responseType: 'blob' });
                          const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `lampiran_${nask.perihal || nask.id}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          toast.error('Gagal mengunduh lampiran');
                        }
                      }}
                    >
                      <Download size={14} /> Unduh Berkas
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Outgoing Letter A4 Preview */
            <div className="card" style={{
              background: 'white',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              overflow: 'hidden'
            }}>
              {/* Kop Surat Placeholder if status is verified or higher */}
              {nask.status !== 'draft' && (
                <div style={{
                  padding: '40px 40px 0',
                  textAlign: 'center',
                  borderBottom: '2px double var(--slate-800)',
                  marginBottom: '20px',
                  fontFamily: 'Georgia, serif'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase' }}>KOP ORGANISASI RESMI</h2>
                  <p style={{ fontSize: '11px', color: 'var(--slate-500)', fontStyle: 'italic', marginTop: '4px' }}>Jl. Contoh Alamat No. 1, Telp: 021-1234567, Email: info@organisasi.id</p>
                </div>
              )}

              {/* Document sheet */}
              <div 
                style={{
                  padding: nask.status === 'draft' ? '40px' : '20px 40px 40px',
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: '12pt',
                  lineHeight: '1.6',
                  color: 'black',
                  minHeight: '500px'
                }}
                dangerouslySetInnerHTML={{ __html: nask.isi_naskah }}
              />
            </div>
          )}

          {/* Disposisi History Section */}
          {nask.jenis === 'masuk' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Riwayat Disposisi Surat</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {(!nask.disposisis || nask.disposisis.length === 0) ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '13px' }}>
                    Belum ada disposisi untuk naskah masuk ini.
                  </div>
                ) : (
                  <div className="data-table-wrapper">
                    <table className="data-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Oleh</th>
                          <th>Penerima</th>
                          <th>Instruksi Disposisi</th>
                          <th>Batas Waktu</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nask.disposisis.map((disp) => (
                          <tr key={disp.id}>
                            <td>{disp.pengirim?.nama_lengkap || 'Sistem'}</td>
                            <td>{disp.penerima?.nama_lengkap}</td>
                            <td>{disp.instruksi}</td>
                            <td>{formatTanggal(disp.batas_waktu)}</td>
                            <td>
                              <span className={`badge ${
                                disp.status === 'ditindaklanjuti' ? 'badge-aktif' :
                                disp.status === 'dibaca' ? 'badge-dibaca' : 'badge-belum_dibaca'
                              }`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                                {STATUS_DISPOSISI_LABELS[disp.status] || disp.status}
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
          )}
        </div>

        {/* Action Panel Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Metadata Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Informasi Alur</h3>
            </div>
            <div className="card-body" style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Pembuat:</span>
                <span style={{ fontWeight: '600' }}>{nask.pembuat?.nama_lengkap}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Tanggal Buat:</span>
                <span>{formatTanggal(nask.created_at)}</span>
              </div>
              {nask.nomor_naskah && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Nomor Surat:</span>
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{nask.nomor_naskah}</span>
                </div>
              )}
              {nask.penyetuju && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Diverifikasi:</span>
                  <span style={{ fontWeight: '600' }}>{nask.penyetuju?.nama_lengkap}</span>
                </div>
              )}
            </div>
          </div>

          {/* Operations Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Operasi Dokumen</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Sekretaris actions */}
              {user?.peran === 'sekretaris' && isPembuat && (
                <>
                  {(nask.status === 'draft' || nask.status === 'ditolak') && (
                    <>
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }}
                        onClick={() => navigate(`/draft/edit/${id}`)}
                        disabled={actionLoading}
                      >
                        Edit Draft
                      </button>
                      <button 
                        className="btn btn-success" 
                        style={{ width: '100%' }}
                        onClick={handleAjukan}
                        disabled={actionLoading}
                      >
                        <Send size={16} /> Ajukan Verifikasi
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Pimpinan actions */}
              {isPimpinan && (
                <>
                  {/* Pimpinan yang buat draft sendiri — bisa langsung TTD + stempel tanpa ajukan */}
                  {isPembuat && (nask.status === 'draft' || nask.status === 'ditolak') && (
                    <>
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }}
                        onClick={() => navigate(`/draft/edit/${id}`)}
                        disabled={actionLoading}
                      >
                        Edit Draft
                      </button>
                      <button 
                        className={`btn ${user?.tanda_tangan_path ? 'btn-success' : 'btn-secondary'}`}
                        style={{ width: '100%', opacity: user?.tanda_tangan_path ? 1 : 0.7 }}
                        onClick={() => {
                          if (!user?.tanda_tangan_path) {
                            toast.error('Silakan unggah Tanda Tangan Anda di menu Profil terlebih dahulu!');
                            return;
                          }
                          handleTandaTangan();
                        }}
                        disabled={actionLoading}
                      >
                        {user?.tanda_tangan_path ? '📝 Tandatangani & Stempel' : 'Tanda Tangan Belum Diatur'}
                      </button>
                    </>
                  )}

                  {nask.status === 'menunggu_verifikasi' && (
                    <>
                      <button 
                        className="btn btn-success" 
                        style={{ width: '100%' }}
                        onClick={handleSetujui}
                        disabled={actionLoading}
                      >
                        <Check size={16} /> Setujui Surat
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ width: '100%' }}
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                      >
                        <X size={16} /> Tolak Surat
                      </button>
                    </>
                  )}

                  {nask.status === 'disetujui' && (
                    <button 
                      className={`btn ${user?.tanda_tangan_path ? 'btn-primary' : 'btn-secondary'}`} 
                      style={{ width: '100%', opacity: user?.tanda_tangan_path ? 1 : 0.7 }}
                      onClick={() => {
                        if (!user?.tanda_tangan_path) {
                          toast.error('Silakan unggah Tanda Tangan Anda di menu Profil terlebih dahulu!');
                          return;
                        }
                        handleTandaTangan();
                      }}
                      disabled={actionLoading}
                    >
                      {user?.tanda_tangan_path ? 'Tandatangani Surat' : 'Tanda Tangan Belum Diatur'}
                    </button>
                  )}

                  {nask.status === 'ditandatangani' && (
                    <>
                      {/* Tombol tanda tangan kedua — muncul untuk pimpinan yang punya TTD dan naskah belum punya TTD kedua */}
                      {user?.tanda_tangan_path && !nask.ditandatangani_oleh_2 && (user?.peran === 'ketufor' || user?.peran === 'waketufor') && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%', marginBottom: '8px' }}
                          onClick={() => handleTandaTangan(true)}
                          disabled={actionLoading}
                        >
                          + Tanda Tangan Kedua
                        </button>
                      )}
                      {(user?.peran === 'ketufor' || user?.peran === 'waketufor') && (
                        <button 
                          className="btn btn-success" 
                          style={{ width: '100%' }}
                          onClick={handleKirim}
                          disabled={actionLoading}
                        >
                          Kirim & Arsipkan
                        </button>
                      )}
                    </>
                  )}

                  {nask.jenis === 'masuk' && (
                    <>
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }}
                        onClick={() => setShowDisposisiModal(true)}
                        disabled={actionLoading}
                      >
                        <Share2 size={16} /> Disposisikan
                      </button>
                      {nask.status !== 'diarsipkan' && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%' }}
                          onClick={() => setShowArsipModal(true)}
                          disabled={actionLoading}
                        >
                          <Archive size={16} /> Berkaskan / Arsip
                        </button>
                      )}
                    </>
                  )}
                </>
              )}

              {nask.status === 'diarsipkan' && (
                <div style={{ textAlign: 'center', color: 'var(--success-600)', fontSize: '13px', fontWeight: '600', padding: '10px', background: 'var(--success-50)', borderRadius: 'var(--radius)' }}>
                  Selesai & Diarsipkan
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 1000, padding: '20px', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div className="card-header">
              <h3 className="card-title">Catatan Penolakan Naskah</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowRejectModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleTolak}>
              <div className="card-body">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Alasan Penolakan <span className="required">*</span></label>
                  <textarea 
                    className="form-control" 
                    placeholder="Tulis alasan penolakan naskah dinas ini agar sekretaris dapat merevisinya..."
                    value={catatanPenolakan}
                    onChange={(e) => setCatatanPenolakan(e.target.value)}
                    required
                    style={{ minHeight: '120px' }}
                  />
                </div>
              </div>
              <div className="card-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Batal</button>
                <button type="submit" className="btn btn-danger">Tolak Surat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disposisi Modal */}
      {showDisposisiModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', zIndex: 1000, padding: '20px', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <h3 className="card-title">Delegasikan Disposisi Surat</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDisposisiModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleDisposisi}>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Tujukan Ke Anggota <span className="required">*</span></label>
                  <select 
                    className="form-control" 
                    value={kePengguna} 
                    onChange={(e) => setKePengguna(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Anggota --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.nama_lengkap} ({u.peran})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Instruksi / Catatan Pimpinan <span className="required">*</span></label>
                  <textarea 
                    className="form-control" 
                    placeholder="Tulis instruksi tindak lanjut disposisi..."
                    value={instruksi}
                    onChange={(e) => setInstruksi(e.target.value)}
                    required
                    style={{ minHeight: '100px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Batas Waktu Penyelesaian <span className="required">*</span></label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={batasWaktu}
                    onChange={(e) => setBatasWaktu(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="card-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDisposisiModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Kirim Disposisi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Arsip Modal */}
      {showArsipModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', zIndex: 1000, padding: '20px', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div className="card-header">
              <h3 className="card-title">Berkas & Arsipkan Surat</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowArsipModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleArsip}>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Kode Klasifikasi Berkas <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={kodeKlasifikasi}
                    onChange={(e) => setKodeKlasifikasi(e.target.value)}
                    placeholder="Contoh: KEU, UMUM, SDM"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Lokasi Penyimpanan Fisik</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={lokasiFisik}
                    onChange={(e) => setLokasiFisik(e.target.value)}
                    placeholder="Contoh: Lemari A Rak 3"
                  />
                </div>
              </div>
              <div className="card-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowArsipModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Arsip Dokumen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signature Editor Modal */}
      {showSignEditor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ flexShrink: 0 }}>
              <h3 className="card-title">
                {signEditorMode === 'second' ? 'Tambah Tanda Tangan Kedua' : 'Tandatangani Naskah'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSignEditor(false)}>&times;</button>
            </div>
            <div className="card-body" style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginBottom: '12px' }}>
                Posisikan kursor di tempat yang diinginkan, lalu klik tombol untuk menyisipkan. Gunakan tombol posisi untuk mengatur rata kiri/tengah/kanan.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleInsertSignature(editorRef.current)}
                >
                  📝 Sisipkan Tanda Tangan
                </button>
                {user?.stempel_path && (
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleInsertStempel(editorRef.current)}
                  >
                    🔏 Sisipkan Stempel
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleInsertAlignedBlock(editorRef.current, 'left')}
                >
                  ⬅ Posisi Kiri Bawah
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleInsertAlignedBlock(editorRef.current, 'center')}
                >
                  ⬇ Posisi Tengah Bawah
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleInsertAlignedBlock(editorRef.current, 'right')}
                >
                  ➡ Posisi Kanan Bawah
                </button>
              </div>
              <Editor
                apiKey="ern0cy0zzrd7z1v1xf7y0glwofutjfdq8ptz9z7y9btlv2rk"
                onInit={(evt, editor) => { editorRef.current = editor; }}
                value={signEditorContent}
                onEditorChange={(content) => setSignEditorContent(content)}
                init={{
                  height: 450,
                  menubar: 'edit view insert format',
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image',
                    'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'table', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | table | removeformat',
                  content_style: 'body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.6; padding: 20px; }',
                  branding: false,
                  promotion: false,
                }}
              />
            </div>
            <div className="card-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)', flexShrink: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSignEditor(false)}>Batal</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSaveSignEditor}
                disabled={actionLoading}
              >
                {actionLoading ? 'Menyimpan...' : 'Simpan & Tandatangani'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
