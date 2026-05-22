import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FilePlus, Edit, Trash2, Send, FileText } from 'lucide-react';
import { formatTanggal, STATUS_LABELS, confirmAlert } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function DraftNaskahPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/naskah?jenis=draft');
      // On the backend, we filter by jenis = draft or status = draft
      setDrafts(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Gagal mengambil daftar draft naskah');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const isConfirmed = await confirmAlert('Hapus Draft?', 'Apakah Anda yakin ingin menghapus draft ini secara permanen?', 'Hapus', true);
    if (!isConfirmed) return;

    try {
      await api.delete(`/naskah/${id}`);
      toast.success('Draft naskah berhasil dihapus');
      fetchDrafts();
    } catch (err) {
      toast.error('Gagal menghapus draft naskah');
    }
  };

  const handleAjukan = async (id, e) => {
    e.stopPropagation();
    const isConfirmed = await confirmAlert('Ajukan Naskah?', 'Ajukan draft naskah ini ke Pimpinan untuk verifikasi?', 'Ajukan');
    if (!isConfirmed) return;

    try {
      await api.post(`/naskah/${id}/ajukan`);
      toast.success('Naskah berhasil diajukan untuk verifikasi');
      fetchDrafts();
    } catch (err) {
      toast.error('Gagal mengajukan naskah');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>Kelola Draft Naskah</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>Daftar rancangan surat dinas yang sedang dikerjakan</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/draft/tambah')}>
          <FilePlus size={18} /> Buat Draft Baru
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {drafts.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--slate-400)' }}>
              <div style={{ marginBottom: '12px' }}><FileText size={40} style={{ opacity: 0.5 }} /></div>
              Belum ada draft naskah dinas. Silakan klik tombol "Buat Draft Baru" untuk memulai.
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Perihal</th>
                    <th>Nomor Naskah</th>
                    <th>Terakhir Diubah</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((draft) => (
                    <tr key={draft.id} onClick={() => navigate(`/naskah/${draft.id}`)} style={{ cursor: 'pointer' }}>
                      <td className="cell-main">{draft.perihal}</td>
                      <td>{draft.nomor_naskah || '-'}</td>
                      <td>{formatTanggal(draft.updated_at)}</td>
                      <td>
                        <span className="badge badge-draft">
                          <span className="badge-dot"></span>
                          {STATUS_LABELS[draft.status] || draft.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="actions" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            title="Edit"
                            onClick={(e) => { e.stopPropagation(); navigate(`/draft/edit/${draft.id}`); }}
                          >
                            <Edit size={16} color="var(--primary-600)" />
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            title="Ajukan Verifikasi"
                            onClick={(e) => handleAjukan(draft.id, e)}
                          >
                            <Send size={16} color="var(--success-600)" />
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            title="Hapus"
                            onClick={(e) => handleDelete(draft.id, e)}
                          >
                            <Trash2 size={16} color="var(--danger-600)" />
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
