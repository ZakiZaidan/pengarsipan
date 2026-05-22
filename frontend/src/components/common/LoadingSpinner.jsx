import React from 'react';

export default function LoadingSpinner({ fullPage = false }) {
  const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid var(--slate-200)',
    borderTop: '4px solid var(--primary-600)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle = fullPage ? {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle}></div>
    </div>
  );
}
