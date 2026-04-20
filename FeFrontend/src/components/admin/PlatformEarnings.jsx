import { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
  FiRefreshCw
} from 'react-icons/fi';
import { RupeeIcon } from '../RupeeIcon';
import { getPlatformEarnings, processSettlement } from '../../services/paymentService';

const PlatformEarnings = ({ className = '' }) => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPlatformEarnings();
      setEarnings(data);
    } catch (err) {
      setError('Failed to load platform earnings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  const handleProcessSettlement = async (paymentId) => {
    try {
      const result = await processSettlement(paymentId);
      if (result.success) {
        fetchEarnings();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to process settlement');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className={`table-container-new p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-[200px]">
          <FiLoader className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`table-container-new p-6 ${className}`}>
        <div className="flex items-center gap-2" style={{ color: 'var(--error-color, #ef4444)' }}>
          <FiAlertTriangle className="w-5 h-5" />
          <span>{error}</span>
          <button 
            onClick={fetchEarnings}
            className="ml-auto hover:opacity-80"
            style={{ color: 'var(--success-color, #10b981)' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`table-container-new ${className}`}>
      {/* Header */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)' }}>
              <FiTrendingUp className="w-5 h-5" style={{ color: 'var(--success-color, #10b981)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Platform Earnings</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Revenue from platform fees</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            <RupeeIcon className="w-4 h-4" />
            Total Fees
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(earnings?.totalPlatformFees)}
          </div>
        </div>

        <div className="rounded-lg p-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--success-color, #10b981)' }}>
            <FiCheckCircle className="w-4 h-4" />
            Settled
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--success-color, #10b981)' }}>
            {formatCurrency(earnings?.totalSettled)}
          </div>
        </div>

        <div className="rounded-lg p-4" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
          <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--warning-color, #f59e0b)' }}>
            <FiClock className="w-4 h-4" />
            Pending
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--warning-color, #f59e0b)' }}>
            {formatCurrency(earnings?.totalPending)}
          </div>
        </div>

        <div className="rounded-lg p-4" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
          <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--info-color, #3b82f6)' }}>
            <FiTrendingUp className="w-4 h-4" />
            Transactions
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--info-color, #3b82f6)' }}>
            {earnings?.totalTransactions || 0}
          </div>
        </div>
      </div>

      {/* Recent Settlements */}
      {earnings?.recentSettlements && earnings.recentSettlements.length > 0 && (
        <div className="p-6" style={{ borderTop: '1px solid var(--border-color, #e5e7eb)' }}>
          <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Recent Settlements</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color, #e5e7eb)' }}>
                  <th className="pb-2 font-medium">Payment ID</th>
                  <th className="pb-2 font-medium">Owner Amount</th>
                  <th className="pb-2 font-medium">Platform Fee</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {earnings.recentSettlements.map((settlement) => (
                  <tr key={settlement.paymentId} style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                    <td className="py-3">#{settlement.paymentId}</td>
                    <td className="py-3">{formatCurrency(settlement.ownerAmount)}</td>
                    <td className="py-3">{formatCurrency(settlement.platformFeeAmount)}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{
                        background: settlement.settlementStatus === 'Settled' 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : settlement.settlementStatus === 'Pending' 
                          ? 'rgba(245, 158, 11, 0.2)' 
                          : 'rgba(239, 68, 68, 0.2)',
                        color: settlement.settlementStatus === 'Settled' 
                          ? 'var(--success-color, #10b981)' 
                          : settlement.settlementStatus === 'Pending' 
                          ? 'var(--warning-color, #f59e0b)' 
                          : 'var(--error-color, #ef4444)'
                      }}>
                        {settlement.settlementStatus}
                      </span>
                    </td>
                    <td className="py-3" style={{ color: 'var(--text-muted)' }}>
                      {settlement.settledAt 
                        ? new Date(settlement.settledAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="py-3">
                      {settlement.settlementStatus === 'Pending' && (
                        <button
                          onClick={() => handleProcessSettlement(settlement.paymentId)}
                          className="text-xs font-medium hover:opacity-80"
                          style={{ color: 'var(--success-color, #10b981)' }}
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!earnings?.recentSettlements || earnings.recentSettlements.length === 0) && (
        <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>
          <FiTrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No settlements yet</p>
          <p className="text-xs mt-1">Settlements will appear here when payments are processed</p>
        </div>
      )}
    </div>
  );
};

export default PlatformEarnings;
