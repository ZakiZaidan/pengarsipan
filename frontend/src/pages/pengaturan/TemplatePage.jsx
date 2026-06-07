import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { confirmAlert } from '../../utils/helpers';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RichTextEditor from '../../components/naskah/RichTextEditor';
import { FileText, Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TemplatePage() {
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form / Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Inputs
  const [namaTemplate, setNamaTemplate] = useState('');
  const [jenis, setJenis] = useState('surat_keluar');
  const [kontenTemplate, setKontenTemplate] = useState('');
  const [aktif, setAktif] = useState(true);

  const isPimpinan = user?.peran === 'ketufor' || user?.peran === 'waketufor';
  const isKetufor = user?.peran === 'ketufor';

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/template-naskah');
      setTemplates(res.data || []);
    } catch (err) {
      toast.error('Gagal mengambil daftar template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenAdd = () => {
    if (!isPimpinan) {
      toast.error('Hanya Ketufor/Waketufor yang dapat membuat template');
      return;
    }
    setIsEdit(false);
    setEditingTemplateId(null);
    setNamaTemplate('');
    setJenis('surat_keluar');
    setKontenTemplate('');
    setAktif(true);
    setShowModal(true);
  };

  const handleOpenEdit = (tpl) => {
    if (!isPimpinan) {
      toast.error('Hanya Ketufor/Waketufor yang dapat mengedit template');
      return;
    }
    setIsEdit(true);
    setEditingTemplateId(tpl.id);
    setNamaTemplate(tpl.nama_template);
    setJenis(tpl.jenis);
    setKontenTemplate(tpl.konten_template);
    setAktif(tpl.aktif);
    setShowModal(true);
  };

  const handleDelete = async (tpl, e) => {
    e.stopPropagation();
    if (!isKetufor) {
      toast.error('Hanya Ketufor yang dapat menghapus template');
      return;
    }
    const isConfirmed = await confirmAlert(
      'Hapus Template?',
      `Apakah Anda yakin ingin menghapus template "${tpl.nama_template}"?`,
      'Hapus',
      true
    );
    if (!isConfirmed) return;

    try {
      await api.delete(`/template-naskah/${tpl.id}`);
      toast.success('Template berhasil dihapus');
      fetchTemplates();
    } catch (err) {
      toast.error('Gagal menghapus template');
    }
  };

  const handleToggleAktif = async (tpl, e) => {
    e.stopPropagation();
    if (!isPimpinan) return;
    const newStatus = !tpl.aktif;
    try {
      await api.put(`/template-naskah/${tpl.id}`, { aktif: newStatus });
      toast.success(`Template berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchTemplates();
    } catch (err) {
      toast.error('Gagal memperbarui status template');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaTemplate || !kontenTemplate) {
      toast.error('Nama dan isi template wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        nama_template: namaTemplate,
        jenis,
        konten_template: kontenTemplate,
        aktif
      };

      if (isEdit) {
        await api.put(`/template-naskah/${editingTemplateId}`, payload);
        toast.success('Template berhasil diperbarui');
      } else {
        await api.post('/template-naskah', payload);
        toast.success('Template baru berhasil ditambahkan');
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan template');
    } finally {
      setSubmitting(false);
    }
  };

  const getJenisLabel = (val) => {
    switch (val) {
      case 'surat_keluar': return 'Surat Keluar';
      case 'berita_acara': return 'Berita Acara';
      case 'memo': return 'Memo';
      case 'undangan': return 'Undangan';
      default: return 'Lainnya';
    }
  };

  const getJenisColor = (val) => {
    switch (val) {
      case 'surat_keluar': return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-600)' };
      case 'berita_acara': return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
      case 'memo': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' };
      case 'undangan': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      default: return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' };
    }
  };

  if (loading && templates.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>Template Naskah Dinas</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-505)' }}>Kelola template naskah dinas baku untuk mempercepat penyusunan dokumen</p>
        </div>
        {isPimpinan && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> Tambah Template
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {templates.map((tpl) => {
          const colors = getJenisColor(tpl.jenis);
          return (
            <div key={tpl.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="card-body" style={{ flex: '1', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    padding: '4px 8px', 
                    borderRadius: '9999px',
                    backgroundColor: colors.bg,
                    color: colors.color
                  }}>
                    {getJenisLabel(tpl.jenis)}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span 
                      className={`badge ${tpl.aktif ? 'badge-aktif' : 'badge-ditolak'}`}
                      style={{ cursor: isPimpinan ? 'pointer' : 'default', padding: '4px 8px', fontSize: '11px' }}
                      onClick={(e) => handleToggleAktif(tpl, e)}
                      title={isPimpinan ? 'Klik untuk mengubah status' : ''}
                    >
                      <span className="badge-dot"></span>
                      {tpl.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--slate-900)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--slate-400)" />
                  {tpl.nama_template}
                </h3>
                
                <p style={{ fontSize: '12px', color: 'var(--slate-500)', marginBottom: '16px' }}>
                  Dibuat oleh: <span style={{ fontWeight: '500', color: 'var(--slate-700)' }}>{tpl.pembuat?.nama_lengkap || 'System'}</span>
                </p>

                <div 
                  style={{ 
                    maxHeight: '120px', 
                    overflow: 'hidden', 
                    border: '1px solid var(--slate-100)', 
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: 'var(--slate-500)',
                    backgroundColor: 'var(--slate-50)',
                    fontFamily: 'monospace',
                    textOverflow: 'ellipsis',
                    marginBottom: '16px'
                  }}
                >
                  {tpl.konten_template.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </div>
              </div>

              {isPimpinan && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: '8px', 
                  padding: '12px 20px', 
                  borderTop: '1px solid var(--slate-150)',
                  backgroundColor: 'rgba(248, 250, 252, 0.5)'
                }}>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => handleOpenEdit(tpl)}
                    style={{ color: 'var(--primary-600)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                  >
                    <Edit size={14} /> Edit
                  </button>
                  {isKetufor && (
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={(e) => handleDelete(tpl, e)}
                      style={{ color: 'var(--red-600)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Template Form Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', zIndex: 1000, padding: '20px', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title" style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                {isEdit ? 'Perbarui Template Naskah' : 'Tambah Template Naskah Baru'}
              </h3>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setShowModal(false)}
                style={{ fontSize: '20px', padding: '4px', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div className="card-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nama Template <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: Surat Tugas Resmi Formatur"
                      value={namaTemplate}
                      onChange={(e) => setNamaTemplate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Jenis Naskah <span className="required">*</span></label>
                    <select 
                      className="form-control" 
                      value={jenis} 
                      onChange={(e) => setJenis(e.target.value)}
                      required
                    >
                      <option value="surat_keluar">Surat Keluar</option>
                      <option value="berita_acara">Berita Acara</option>
                      <option value="memo">Memo</option>
                      <option value="undangan">Undangan</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Konten Template <span className="required">*</span></span>
                    <span style={{ fontSize: '11px', color: 'var(--slate-400)', fontWeight: 'normal' }}>
                      Gunakan penanda seperti <code>[Nomor Surat]</code>, <code>[Perihal]</code>, <code>[Isi surat]</code> untuk diganti otomatis.
                    </span>
                  </label>
                  <RichTextEditor 
                    content={kontenTemplate} 
                    onChange={setKontenTemplate}
                    placeholder="Susun kerangka naskah dinas di sini..."
                  />
                </div>
              </div>
              
              <div className="card-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)', flexShrink: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
