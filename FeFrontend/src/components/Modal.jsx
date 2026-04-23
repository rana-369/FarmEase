import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const Modal = ({ isOpen, onClose, children, fullScreenOnMobile = false }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backgroundColor: 'var(--overlay-bg)',
        padding: fullScreenOnMobile ? '0' : '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          background: 'var(--modal-bg)',
          borderRadius: fullScreenOnMobile ? '0' : '16px',
          maxWidth: fullScreenOnMobile ? '100%' : '28rem',
          width: '100%',
          maxHeight: fullScreenOnMobile ? '100%' : '90vh',
          height: fullScreenOnMobile ? '100%' : 'auto',
          border: fullScreenOnMobile ? 'none' : '1px solid var(--border-primary)',
          boxShadow: fullScreenOnMobile ? 'none' : 'var(--shadow-lg)',
          overflow: 'auto'
        }}
        className="modal-mobile-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>,
    document.body
  );
};

export default Modal;
