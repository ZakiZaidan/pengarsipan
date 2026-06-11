import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '../../services/api';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Sliders, HelpCircle, Save, Upload, ShieldAlert, Award, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SistemPage() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingKop, setUploadingKop] = useState(false);

  // General Settings State
  const [namaOrganisasi, setNamaOrganisasi] = useState('');
  const [alamatOrganisasi, setAlamatOrganisasi] = useState('');
  const [teleponOrganisasi, setTeleponOrganisasi] = useState('');

  // Numbering Settings State
  const [formatNomorSurat, setFormatNomorSurat] = useState('');
  const [kodeUnit, setKodeUnit] = useState('');
  const [counterSurat, setCounterSurat] = useState('');

  // Export & Archiving Settings State
  const [teksWatermark, setTeksWatermark] = useState('');
  const [jraAktifTahun, setJraAktifTahun] = useState('2');
  const [jraInaktifTahun, setJraInaktifTahun] = useState('5');
  const [kopPath, setKopPath] = useState('');

  const isKetufor = user?.peran === 'ketufor';
  const isPimpinan = user?.peran === 'ketufor' || user?.peran === 'waketufor';

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pengaturan');
      const data = res.data || [];
      setSettings(data);

      // Map values to states
      data.forEach(item => {
        switch (item.kunci) {
          case 'nama_organisasi': setNamaOrganisasi(item.nilai); break;
          case 'alamat_organisasi': setAlamatOrganisasi(item.nilai); break;
          case 'telepon_organisasi': setTeleponOrganisasi(item.nilai); break;
          case 'format_nomor_surat': setFormatNomorSurat(item.nilai); break;
          case 'kode_unit': setKodeUnit(item.nilai); break;
          case 'counter_surat': setCounterSurat(item.nilai); break;
          case 'teks_watermark': setTeksWatermark(item.nilai); break;
          case 'jra_aktif_tahun': setJraAktifTahun(item.nilai || '2'); break;
          case 'jra_inaktif_tahun': setJraInaktifTahun(item.nilai || '5'); break;
          case 'kop_path': setKopPath(item.nilai); break;
          default: break;
        }
      });
    } catch (err) {
      toast.error('Gagal mengambil pengaturan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUploadKop = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isPimpinan) {
      toast.error('Hanya Pimpinan yang dapat mengunggah kop organisasi');
      return;
    }

    const formData = new FormData();
    formData.append('kop', file);

    try {
      setUploadingKop(true);
      const res = await api.post('/pengaturan/upload-kop', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Kop organisasi berhasil diunggah');
      setKopPath(res.data.path);
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah kop');
    } finally {
      setUploadingKop(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isKetufor) {
      toast.error('Hanya Ketua Formatur yang dapat memperbarui pengaturan sistem');
      return;
    }

    const payload = {
      pengaturan: [
        { kunci: 'nama_organisasi', nilai: namaOrganisasi, grup: 'umum' },
        { kunci: 'alamat_organisasi', nilai: alamatOrganisasi, grup: 'umum' },
        { kunci: 'telepon_organisasi', nilai: teleponOrganisasi, grup: 'umum' },
        { kunci: 'format_nomor_surat', nilai: formatNomorSurat, grup: 'penomoran' },
        { kunci: 'kode_unit', nilai: kodeUnit, grup: 'penomoran' },
        { kunci: 'counter_surat', nilai: counterSurat, grup: 'penomoran' },
        { kunci: 'teks_watermark', nilai: teksWatermark, grup: 'ekspor' },
        { kunci: 'jra_aktif_tahun', nilai: jraAktifTahun, grup: 'arsip' },
        { kunci: 'jra_inaktif_tahun', nilai: jraInaktifTahun, grup: 'arsip' },
      ]
    };

    try {
      setSubmitting(true);
      await api.put('/pengaturan', payload);
      toast.success('Konfigurasi sistem berhasil disimpan');
      fetchSettings();
    } catch (err) {
      toast.error('Gagal memperbarui konfigurasi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>Konfigurasi Sistem</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-505)' }}>Atur standar penomoran, identitas organisasi, kop surat, dan parameter retensi arsip</p>
        </div>
      </div>

      {!isKetufor && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          backgroundColor: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid rgba(59, 130, 246, 0.2)', 
          borderRadius: 'var(--radius)', 
          padding: '14px 20px', 
          marginBottom: '24px',
          color: 'var(--primary-700)'
        }}>
          <ShieldAlert size={20} />
          <div style={{ fontSize: '13px' }}>
            <strong>Hak Akses Terbatas:</strong> Anda masuk sebagai Wakil Ketua Formatur. Anda dapat melihat pengaturan dan mengunggah Kop surat, namun perubahan parameter teks lainnya hanya dapat dilakukan oleh <strong>Ketua Formatur</strong>.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. Identitas Organisasi */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--slate-150)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="var(--primary-600)" />
                  Identitas & Informasi Organisasi
                </h3>
              </div>
              <div className="card-body" style={{ padding: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Nama Organisasi <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={namaOrganisasi} 
                    onChange={(e) => setNamaOrganisasi(e.target.value)}
                    placeholder="Contoh: Pengurus Besar Formatur 2026"
                    disabled={!isKetufor}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Telepon Organisasi</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={teleponOrganisasi} 
                      onChange={(e) => setTeleponOrganisasi(e.target.value)}
                      placeholder="Contoh: (021) 555-1234"
                      disabled={!isKetufor}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alamat Organisasi</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={alamatOrganisasi} 
                      onChange={(e) => setAlamatOrganisasi(e.target.value)}
                      placeholder="Contoh: Jl. Diponegoro No. 10, Jakarta Pusat"
                      disabled={!isKetufor}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Format Penomoran Surat */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--slate-150)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} color="var(--primary-600)" />
                  Standar Penomoran Otomatis
                </h3>
              </div>
              <div className="card-body" style={{ padding: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Format Penomoran Surat <span className="required">*</span></span>
                    <span style={{ fontSize: '11px', color: 'var(--slate-400)', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HelpCircle size={12} /> Placeholders: {'{nomor}'}, {'{kode_unit}'}, {'{bulan_romawi}'}, {'{tahun}'}
                    </span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formatNomorSurat} 
                    onChange={(e) => setFormatNomorSurat(e.target.value)}
                    placeholder="{nomor}/{kode_unit}/{bulan_romawi}/{tahun}"
                    disabled={!isKetufor}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kode Unit / Singkatan <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={kodeUnit} 
                      onChange={(e) => setKodeUnit(e.target.value)}
                      placeholder="Contoh: ORG"
                      disabled={!isKetufor}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Counter Urutan Surat Terakhir <span className="required">*</span></label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={counterSurat} 
                      onChange={(e) => setCounterSurat(e.target.value)}
                      placeholder="Contoh: 0"
                      disabled={!isKetufor}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Parameter Ekspor & Kearsipan (JRA) */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--slate-150)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--primary-600)" />
                  Ekspor PDF & Jadwal Retensi Arsip (JRA)
                </h3>
              </div>
              <div className="card-body" style={{ padding: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Teks Watermark Default <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={teksWatermark} 
                    onChange={(e) => setTeksWatermark(e.target.value)}
                    placeholder="Contoh: RAHASIA"
                    disabled={!isKetufor}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Masa Retensi Aktif (Tahun) <span className="required">*</span></label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={jraAktifTahun} 
                      onChange={(e) => setJraAktifTahun(e.target.value)}
                      placeholder="Default: 2"
                      min="1"
                      disabled={!isKetufor}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Masa Retensi Inaktif (Tahun) <span className="required">*</span></label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={jraInaktifTahun} 
                      onChange={(e) => setJraInaktifTahun(e.target.value)}
                      placeholder="Default: 5"
                      min="1"
                      disabled={!isKetufor}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Kop Surat Upload Card */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--slate-150)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                  Kop Surat Organisasi
                </h3>
              </div>
              <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                
                {kopPath ? (
                  <div style={{ width: '100%', border: '1px dashed var(--slate-200)', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff' }}>
                    <div style={{ fontSize: '11px', color: 'var(--slate-400)', alignSelf: 'flex-start', marginBottom: '8px' }}>Preview Kop Terpasang:</div>
                    <img 
                      src={`${BASE_URL}/storage/${kopPath}`} 
                      alt="Kop Organisasi" 
                      style={{ width: '100%', maxHeight: '80px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--green-600)', marginTop: '8px', fontWeight: '600' }}>
                      <CheckCircle size={14} /> Kop Siap Digunakan
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', border: '2px dashed var(--slate-200)', borderRadius: 'var(--radius)', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', backgroundColor: 'var(--slate-50)' }}>
                    <Upload size={32} color="var(--slate-300)" />
                    <span style={{ fontSize: '12px', color: 'var(--slate-500)', textAlign: 'center' }}>Kop surat belum diunggah. PDF ekspor akan dicetak tanpa Kop.</span>
                  </div>
                )}

                {isPimpinan && (
                  <div style={{ width: '100%' }}>
                    <label 
                      className="btn btn-secondary btn-block" 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', pointerEvents: uploadingKop ? 'none' : 'auto' }}
                    >
                      <Upload size={16} /> 
                      {uploadingKop ? 'Mengunggah...' : 'Unggah Kop Baru'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleUploadKop} 
                        style={{ display: 'none' }}
                        disabled={uploadingKop}
                      />
                    </label>
                    <div style={{ fontSize: '10px', color: 'var(--slate-400)', textAlign: 'center', marginTop: '6px' }}>Format: PNG/JPG/JPEG (Max. 5MB)</div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Card */}
            {isKetufor && (
              <div className="card" style={{ background: 'linear-gradient(135deg, var(--slate-800) 0%, var(--slate-950) 100%)', color: '#fff' }}>
                <div className="card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>Simpan Konfigurasi</h4>
                  <p style={{ fontSize: '11px', color: 'var(--slate-300)', margin: 0 }}>Pastikan seluruh data format penomoran, identitas, dan parameter retensi dinas sudah sesuai standar tata persuratan organisasi sebelum disimpan.</p>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block" 
                    disabled={submitting}
                    style={{ background: 'var(--primary-600)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Save size={16} />
                    {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </form>
    </div>
  );
}
