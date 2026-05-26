import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Plus, Edit, Search, UserCheck, UserX } from 'lucide-react';
import { PERAN_LABELS, confirmAlert } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function PenggunaPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [peranFilter, setPeranFilter] = useState('');

  // Form / Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Inputs
  const [username, setUsername] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [peran, setPeran] = useState('sekretaris');
  const [aktif, setAktif] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pengguna?cari=${search}&peran=${peranFilter}`);
      setUsers(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Gagal mengambil daftar pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, peranFilter]);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setEditingUserId(null);
    setUsername('');
    setNamaLengkap('');
    setEmail('');
    setPassword('');
    setPeran('sekretaris');
    setAktif(true);
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setIsEdit(true);
    setEditingUserId(user.id);
    setUsername(user.username);
    setNamaLengkap(user.nama_lengkap);
    setEmail(user.email);
    setPassword(''); // Reset password field
    setPeran(user.peran?.value || user.peran);
    setAktif(user.aktif);
    setShowModal(true);
  };

  const handleToggleAktif = async (user, e) => {
    e.stopPropagation();
    if (user.id === currentUser?.id) {
      toast.error('Anda tidak dapat menonaktifkan akun sendiri');
      return;
    }
    const newStatus = !user.aktif;
    const isConfirmed = await confirmAlert(
      'Ubah Status Pengguna?',
      `Apakah Anda yakin ingin ${newStatus ? 'mengaktifkan' : 'menonaktifkan'} akun ${user.nama_lengkap}?`,
      newStatus ? 'Aktifkan' : 'Nonaktifkan',
      !newStatus
    );
    if (!isConfirmed) return;

    try {
      await api.put(`/pengguna/${user.id}`, { aktif: newStatus });
      toast.success(`Akun berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Gagal memperbarui status akun');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaLengkap || !email) {
      toast.error('Silakan isi seluruh kolom wajib');
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        const payload = {
          nama_lengkap: namaLengkap,
          email,
          peran,
          aktif
        };
        if (password) {
          payload.password = password;
        }
        await api.put(`/pengguna/${editingUserId}`, payload);
        toast.success('Pengguna berhasil diperbarui');
      } else {
        if (!username || !password) {
          toast.error('Username dan Kata Sandi wajib untuk pengguna baru');
          return;
        }
        await api.post('/pengguna', {
          username,
          nama_lengkap: namaLengkap,
          email,
          password,
          peran
        });
        toast.success('Pengguna baru berhasil ditambahkan');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data pengguna');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-900)' }}>Kelola Pengguna Sistem (RBAC)</h2>
          <p style={{ fontSize: '13px', color: 'var(--slate-505)' }}>Daftar akun dan hak akses personil dalam sistem pengarsipan</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Tambah Pengguna
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
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
              placeholder="Cari nama, email, username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select 
              className="form-control" 
              value={peranFilter}
              onChange={(e) => setPeranFilter(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">-- Semua Peran --</option>
              <option value="ketufor">Ketua Forum</option>
              <option value="waketufor">Wakil Ketua Forum</option>
              <option value="sekretaris">Sekretaris</option>
              <option value="ketua_panitia">Ketua Panitia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid list */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Lengkap / Username</th>
                  <th>Email</th>
                  <th>Hak Akses Peran</th>
                  <th>Status Akun</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="cell-main">
                      <div>{user.nama_lengkap}</div>
                      <div className="cell-sub" style={{ fontSize: '11px', marginTop: '2px', fontFamily: 'monospace' }}>@{user.username}</div>
                    </td>
                    <td>{user.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span style={{ fontWeight: '600' }}>{PERAN_LABELS[user.peran?.value || user.peran] || user.peran}</span>
                    </td>
                    <td>
                      <span 
                        className={`badge ${user.aktif ? 'badge-aktif' : 'badge-ditolak'}`}
                        style={{ cursor: user.id !== currentUser?.id ? 'pointer' : 'default' }}
                        onClick={(e) => user.id !== currentUser?.id && handleToggleAktif(user, e)}
                        title={user.id !== currentUser?.id ? 'Klik untuk mengubah status' : ''}
                      >
                        <span className="badge-dot"></span>
                        {user.aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          title="Edit Profil Pengguna"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Edit size={16} color="var(--primary-600)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', zIndex: 1000, padding: '20px', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header">
              <h3 className="card-title">{isEdit ? 'Perbarui Profil Pengguna' : 'Daftarkan Pengguna Baru'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                
                {!isEdit && (
                  <div className="form-group">
                    <label className="form-label">Username <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: ahmad_arsip"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Nama Lengkap <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Contoh: Ahmad Hidayat"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Email <span className="required">*</span></label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Contoh: ahmad@organisasi.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kata Sandi {!isEdit && <span className="required">*</span>}</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder={isEdit ? 'Kosongkan jika tidak ingin mengubah sandi' : 'Min. 8 karakter'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isEdit}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hak Akses Peran <span className="required">*</span></label>
                    <select 
                      className="form-control" 
                      value={peran} 
                      onChange={(e) => setPeran(e.target.value)}
                      required
                    >
                      <option value="sekretaris">Sekretaris</option>
                      <option value="ketua_panitia">Ketua Panitia</option>
                      <option value="waketufor">Wakil Ketua Forum</option>
                      <option value="ketufor">Ketua Forum</option>
                    </select>
                  </div>

                  {isEdit && (
                    <div className="form-group">
                      <label className="form-label">Status Akun</label>
                      <select 
                        className="form-control" 
                        value={aktif ? '1' : '0'} 
                        onChange={(e) => setAktif(e.target.value === '1')}
                      >
                        <option value="1">Aktif</option>
                        <option value="0">Nonaktif</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
