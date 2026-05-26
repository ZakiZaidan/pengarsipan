import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';
import { Mail, Lock, Shield } from 'lucide-react';

export default function LoginPage() {
  const [loginField, setLoginField] = useState(''); // can be username or email
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const { login, user, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to home
    if (user) {
      navigate('/', { replace: true });
    }
    return () => clearError();
  }, [user, navigate, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginField || !password) {
      toast.error('Silakan isi seluruh kolom login');
      return;
    }

    const res = await login({
      login: loginField,
      password: password,
      remember: remember
    });

    if (res.success) {
      toast.success('Login berhasil! Selamat datang kembali.');
      navigate('/', { replace: true });
    } else {
      toast.error(res.message || 'Login gagal. Periksa kembali username/password Anda.');
    }
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e1b4b 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      fontFamily: 'var(--font-sans)',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <style>{`
        .login-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-lg);
          padding: 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s ease;
        }
        .login-card:hover {
          transform: translateY(-2px);
        }
        .login-input-group {
          position: relative;
          margin-bottom: 24px;
        }
        .login-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius);
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .login-input:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .login-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
        }
        .login-title {
          font-size: 24px;
          font-weight: 800;
          color: white;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .login-subtitle {
          font-size: 13px;
          color: var(--slate-400);
          text-align: center;
          margin-bottom: 32px;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
          color: white;
          font-weight: 600;
          border-radius: var(--radius);
          border: none;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          transform: translateY(-1px);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .demo-accounts {
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .demo-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 12px;
          text-align: center;
          font-weight: 600;
        }
        .demo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .demo-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-sm);
          color: rgba(255, 255, 255, 0.7);
          font-size: 11px;
          padding: 8px 4px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .demo-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img 
            src="/logo forum.png" 
            alt="Logo Forum" 
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              borderRadius: '50%',
            }}
          />
        </div>

        <h2 className="login-title">Sistem Pengarsipan</h2>
        <p className="login-subtitle">Silakan masuk menggunakan akun Anda</p>

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <Mail className="login-icon" size={18} />
            <input 
              type="text" 
              className="login-input" 
              placeholder="Username atau Email"
              value={loginField}
              onChange={(e) => setLoginField(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="login-input-group">
            <Lock className="login-icon" size={18} />
            <input 
              type="password" 
              className="login-input" 
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
                style={{ cursor: 'pointer' }}
              />
              Ingat saya
            </label>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Menghubungkan...' : 'Masuk ke Sistem'}
          </button>
        </form>

        <div className="demo-accounts">
          <div className="demo-title">Akun Uji Coba (Password: password123)</div>
          <div className="demo-grid">
            <button 
              type="button" 
              className="demo-btn" 
              onClick={() => { setLoginField('ketufor'); setPassword('password123'); }}
            >
              Ketua
            </button>
            <button 
              type="button" 
              className="demo-btn" 
              onClick={() => { setLoginField('waketufor'); setPassword('password123'); }}
            >
              Wakil Ketua
            </button>
            <button 
              type="button" 
              className="demo-btn" 
              onClick={() => { setLoginField('sekretaris'); setPassword('password123'); }}
            >
              Sekretaris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
