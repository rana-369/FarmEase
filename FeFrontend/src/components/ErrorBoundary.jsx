import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

// Error Boundary class component - catches JavaScript errors in child components
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Store error info for display
    this.setState({ errorInfo });
    
    // Could also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          padding: '24px',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              maxWidth: '480px',
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-tertiary)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiAlertTriangle size={36} style={{ color: '#ef4444' }} />
            </motion.div>

            {/* Error Title */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              Something went wrong
            </h2>

            {/* Error Description */}
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '24px',
              lineHeight: 1.6,
            }}>
              An unexpected error occurred. Please try again or return to the home page.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-secondary)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: '150px',
              }}>
                <code style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  wordBreak: 'break-word',
                }}>
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}>
              <motion.button
                onClick={this.handleRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <FiRefreshCw size={16} />
                Try Again
              </motion.button>

              <motion.button
                onClick={this.handleGoHome}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'var(--bg-button)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <FiHome size={16} />
                Go Home
              </motion.button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lightweight fallback for lazy loading errors
export const LazyLoadFallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-primary)',
  }}>
    <div className="spinner" />
  </div>
);

// Chunk load error boundary - specifically for lazy loading failures
export class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a chunk loading error
    if (error.message?.includes('Loading chunk') || error.message?.includes('Loading CSS chunk')) {
      return { hasError: true };
    }
    return { hasError: false };
  }

  componentDidCatch(error, errorInfo) {
    if (this.state.hasError) {
      console.error('Chunk loading failed:', error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          padding: '24px',
        }}>
          <div style={{
            maxWidth: '400px',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              Failed to load page
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '20px',
            }}>
              A network error occurred. Please check your connection and try again.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
