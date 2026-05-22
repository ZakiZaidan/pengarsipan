import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RichTextEditor from '../../components/naskah/RichTextEditor';
import { Save, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { confirmAlert } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function NaskahForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [perihal, setPerihal] = useState('');
  const [isiNaskah, setIsiNaskah] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);

  // Fetch templates & existing draft (if editing)
  useEffect(() => {
    const initData = async () => {
      try {
        const templatesRes = await api.get('/template-naskah');
        setTemplates(templatesRes.data.data || templatesRes.data || []);

        if (isEdit) {
          const draftRes = await api.get(`/naskah/${id}`);
          const draft = draftRes.data.data || draftRes.data;
          setPerihal(draft.perihal);
          setIsiNaskah(draft.isi_naskah);
        }
      } catch (err) {
        toast.error('Gagal memuat data pendukung');
      } finally {
        setPageLoading(false);
      }
    };
    initData();
  }, [id, isEdit]);

  // Handle template selection change
  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);

    if (!templateId) return;

    const tpl = templates.find(t => t.id === parseInt(templateId));
    if (tpl) {
      // Confirm before replacing editor content
      if (isiNaskah) {
        const isConfirmed = await confirmAlert(
          'Ganti Template?',
          'Menggunakan template baru akan menimpa isi naskah yang sudah Anda ketik. Lanjutkan?',
          'Lanjutkan',
          true
        );
        if (!isConfirmed) {
          setSelectedTemplateId('');
          return;
        }
      }
      setIsiNaskah(tpl.konten_template);
      toast.success(`Template "${tpl.nama_template}" diterapkan`);
    }
  };

  const handleSave = async (submitForVerification = false) => {
    if (!perihal.trim()) {
      toast.error('Kolom perihal wajib diisi');
      return;
    }
    if (!isiNaskah.trim() || isiNaskah === '<p></p>') {
      toast.error('Konten naskah dinas tidak boleh kosong');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        perihal,
        isi_naskah: isiNaskah,
        jenis: 'keluar', // Sekretaris creates naskah keluar
        status: submitForVerification ? 'menunggu_verifikasi' : 'draft',
      };

      let res;
      if (isEdit) {
        res = await api.put(`/naskah/${id}`, payload);
      } else {
        res = await api.post('/naskah', payload);
      }

      const savedNaskah = res.data.naskah;

      if (submitForVerification) {
        // If not already submitted (e.g. backend doesn't automatically submit on status=menunggu in post/put, we call the explicit endpoint)
        await api.post(`/naskah/${savedNaskah.id}/ajukan`);
        toast.success('Naskah berhasil disimpan dan diajukan untuk verifikasi!');
      } else {
        toast.success(isEdit ? 'Draft naskah berhasil diperbarui' : 'Draft naskah berhasil dibuat');
      }

      navigate('/draft');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan naskah dinas');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-icon" onClick={() => navigate('/draft')} title="Kembali">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>
            {isEdit ? 'Edit Draft Naskah Dinas' : 'Buat Naskah Dinas Baru'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>
            {isEdit ? 'Perbarui isi naskah dinas Anda' : 'Buat naskah dinas keluar dari awal atau menggunakan template resmi'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Main Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">
                  Perihal Naskah Dinas <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Contoh: Undangan Rapat Koordinasi Bulanan Mei"
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Konten Naskah <span className="required">*</span>
                </label>
                <RichTextEditor 
                  content={isiNaskah}
                  onChange={setIsiNaskah}
                  placeholder="Gunakan editor di sini untuk mengetik surat dinas. Anda dapat memasukkan tabel, menyelaraskan tulisan, menebalkan teks, dsb."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Templates & Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Template Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pilih Template Resmi</h3>
            </div>
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Template Naskah</label>
                <select 
                  className="form-control" 
                  value={selectedTemplateId} 
                  onChange={handleTemplateChange}
                  disabled={loading}
                >
                  <option value="">-- Ketik manual (Kosong) --</option>
                  {templates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.nama_template} ({tpl.jenis})
                    </option>
                  ))}
                </select>
                <p className="form-hint" style={{ marginTop: '8px' }}>
                  Memilih template akan menyalin struktur HTML standar ke editor. Silakan ganti placeholder bertanda kurung siku `[seperti ini]`.
                </p>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Simpan & Ajukan</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%' }}
                onClick={() => handleSave(false)}
                disabled={loading}
              >
                <Save size={18} /> Simpan Draft saja
              </button>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => handleSave(true)}
                disabled={loading}
              >
                <CheckCircle size={18} /> Simpan & Ajukan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
