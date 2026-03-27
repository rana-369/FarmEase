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
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)'
          }}
        >
          <FiShield className="text-4xl" style={{ color: '#22c55e' }} />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>
          Two-Factor Authentication
        </h2>
        <p className="text-sm" style={{ color: '#a1a1a1' }}>
          Enter the 6-digit code sent to your email
        </p>
        <p className="text-xs mt-2 font-mono" style={{ color: '#22c55e' }}>
          {email}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg flex items-center gap-3"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444'
          }}
        >
          <FiAlertCircle className="text-xl flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {/* Code Input */}
      <div className="flex justify-center gap-2 mb-8">
        {code.map((digit, index) => (
          <motion.input
            key={index}
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
            className="w-12 h-14 text-center text-xl font-bold rounded-lg transition-all duration-200"
            style={{
              backgroundColor: digit ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              border: digit ? '2px solid #22c55e' : '2px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontFamily: 'monospace'
            }}
          />
        ))}
      </div>

      {/* Verify Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 text-lg font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        style={{ 
          backgroundColor: '#22c55e', 
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)'
        }}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Verifying...
          </>
        ) : (
          <>
            <FiCheck />
            Verify Code
          </>
        )}
      </motion.button>

      {/* Resend Code */}
      <div className="text-center mb-4">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-sm font-medium hover:text-green-400 transition-colors"
            style={{ color: '#22c55e' }}
          >
            Resend Code
          </button>
        ) : (
          <p className="text-sm" style={{ color: '#a1a1a1' }}>
            Resend code in <span className="font-mono" style={{ color: '#22c55e' }}>{resendTimer}s</span>
          </p>
        )}
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={isLoading}
        className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#a1a1a1',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <FiArrowLeft />
        Back to Login
      </button>

      {/* Security Notice */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#a1a1a1' }}>
          <FiLock />
          <span>Protected by Two-Factor Authentication</span>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
