import React, { useEffect } from 'react';

const Modal = ({ onClose, children }) => {
  // ESC zamyka
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={closeButtonStyle} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
};

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: '#fff',
  position: 'relative',
  width: 'min(800px, 95vw)',
//   height: 'min(80vh, 95vh)',
  borderRadius: '12px',
  padding: '25px',
  overflowY: 'auto',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  marginTop: '40px'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '6px',
  right: '10px',
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  lineHeight: 1,
};

export default Modal;
