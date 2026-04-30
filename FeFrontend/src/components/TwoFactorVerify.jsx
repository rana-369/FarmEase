import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiArrowLeft, FiAlertCircle, FiCheck } from 'react-icons/fi';

const TwoFactorVerify = ({ email, onVerify, onBack, loading: parentLoading }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      digits.forEach((digit, i) => {
        if (i < 6 && /^\d$/.test(digit)) {
          newCode[i] = digit;
        }
      });
      setCode(newCode);
      const lastFilledIndex = Math.min(digits.length - 1, 5);
      if (inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex].focus();
      }
      return;
    }

    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVerify(fullCode);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    setCode(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const isLoading = loading || parentLoading;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ 
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)'
          }}
        >
          <FiShield className="text-2xl text-white" />
        </motion.div>
        
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Two-Factor Authentication
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Enter the 6-digit code sent to
        </p>
        <p className="text-sm font-medium mt-1" style={{ color: '#22c55e' }}>
          {email}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3 rounded-xl flex items-center gap-3"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <FiAlertCircle className="text-lg flex-shrink-0" style={{ color: '#ef4444' }} />
          <span className="text-sm" style={{ color: '#ef4444' }}>{error}</span>
        </motion.div>
      )}

      {/* Code Input */}
      <div className="flex justify-center gap-2 mb-6">
        {code.map((digit, index) => (
          <motion.input
            key={`code-digit-${index}`}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-11 h-12 text-center text-lg font-bold rounded-xl transition-all duration-200 focus:outline-none"
            style={{
              backgroundColor: digit ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-button)',
              border: digit ? '2px solid #22c55e' : '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'monospace'
            }}
          />
        ))}
      </div>

      {/* Verify Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-3 text-base font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        style={{ 
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
        }}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Verifying...
          </>
        ) : (
          <>
            <FiCheck className="text-lg" />
            Verify Code
          </>
        )}
      </motion.button>

      {/* Resend Code */}
      <div className="text-center mb-4">
        {canResend ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResend}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
            style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
          >
            Resend Code
          </motion.button>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Resend code in <span className="font-mono font-semibold" style={{ color: '#22c55e' }}>{resendTimer}s</span>
          </p>
        )}
      </div>

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onBack}
        disabled={isLoading}
        className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ 
          backgroundColor: 'var(--bg-button)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-primary)'
        }}
      >
        <FiArrowLeft />
        Back to Login
      </motion.button>

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <FiLock />
          <span>Protected by Two-Factor Authentication</span>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
