import api from './api';

/**
 * Create a Razorpay order for a booking
 * @param {number} bookingId - The booking ID
 * @returns {Promise<{orderId: string, amount: number, currency: string, keyId: string}>}
 */
export const createOrder = async (bookingId) => {
  const { data } = await api.post('/payments/create-order', { bookingId });
  return data;
};

/**
 * Verify payment with backend after Razorpay success
 * @param {Object} params - Verification parameters
 * @param {number} params.bookingId - The booking ID
 * @param {string} params.razorpayOrderId - Razorpay order ID
 * @param {string} params.razorpayPaymentId - Razorpay payment ID
 * @param {string} params.razorpaySignature - Razorpay signature
 * @returns {Promise<{message: string, bookingId: number}>}
 */
export const verifyPayment = async ({ bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const { data } = await api.post('/payments/verify-payment', {
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });
  return data;
};

/**
 * Process refund for a booking
 * @param {number} bookingId - The booking ID
 * @param {string} reason - Optional refund reason
 * @returns {Promise<{success: boolean, message: string, refundData?: object}>}
 */
export const processRefund = async (bookingId, reason = null) => {
  console.log('\n=== PROCESS REFUND START ===');
  console.log('BookingId:', bookingId);
  console.log('Reason:', reason);
  
  try {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    const { data } = await api.post(`/payments/refund/${bookingId}${params}`);
    
    console.log('Refund response:', data);
    console.log('=== PROCESS REFUND SUCCESS ===\n');
    
    return { 
      success: true, 
      message: data.message,
      refundData: data.refundData 
    };
  } catch (error) {
    console.error('!!! REFUND ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Refund failed' 
    };
  }
};

/**
 * Open Razorpay checkout modal
 * @param {Object} options - Checkout options
 * @param {string} options.keyId - Razorpay key ID
 * @param {number} options.amount - Amount in rupees
 * @param {string} options.orderId - Razorpay order ID
 * @param {string} options.description - Payment description
 * @param {Object} options.prefill - Prefill data (name, email)
 * @returns {Promise<{razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string}>}
 */
export const openRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    // Validate keyId before opening checkout
    if (!options.keyId) {
      reject(new Error('Razorpay key ID is missing. Please check your configuration.'));
      return;
    }

    const checkoutOptions = {
      key: options.keyId,
      amount: options.amount * 100, // Convert rupees to paise
      currency: 'INR',
      name: 'FarmEase',
      description: options.description,
      order_id: options.orderId,
      handler: (response) => {
        resolve({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
      },
      prefill: options.prefill || {},
      theme: {
        color: '#22c55e'
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        }
      }
    };

    const razorpay = new window.Razorpay(checkoutOptions);
    razorpay.on('payment.failed', (response) => {
      reject(new Error(response.error.description || 'Payment failed'));
    });
    razorpay.open();
  });
};

/**
 * Complete payment flow: create order -> open checkout -> verify payment
 * @param {number} bookingId - The booking ID
 * @param {string} machineName - Machine name for description
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const processPayment = async (bookingId, machineName) => {
  console.log('\n=== PROCESS PAYMENT START ===');
  console.log('BookingId:', bookingId);
  console.log('MachineName:', machineName);
  
  try {
    // Step 1: Create order
    console.log('Step 1: Creating order...');
    const order = await createOrder(bookingId);
    console.log('Order created:', order);

    // Extract keyId with fallback for different case formats
    const keyId = order.keyId || order.KeyId;
    const amount = order.amount || order.Amount;
    const orderId = order.orderId || order.OrderId;
    
    console.log('Step 2: Opening Razorpay checkout...');
    console.log('KeyId:', keyId);
    console.log('Amount:', amount);
    console.log('OrderId:', orderId);
    
    // Validate keyId exists
    if (!keyId) {
      console.error('!!! ERROR: KeyId is undefined or null');
      return { 
        success: false, 
        message: 'Payment configuration error. Razorpay key is missing. Please contact support.' 
      };
    }

    const paymentResponse = await openRazorpayCheckout({
      keyId: keyId,
      amount: amount,
      orderId: orderId,
      description: `Payment for ${machineName}`,
      prefill: {
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || ''
      }
    });
    
    console.log('Payment response:', paymentResponse);

    // Step 3: Verify payment
    console.log('Step 3: Verifying payment...');
    const result = await verifyPayment({
      bookingId,
      razorpayOrderId: paymentResponse.razorpay_order_id,
      razorpayPaymentId: paymentResponse.razorpay_payment_id,
      razorpaySignature: paymentResponse.razorpay_signature
    });
    
    console.log('Verify result:', result);
    console.log('=== PROCESS PAYMENT SUCCESS ===\n');

    return { success: true, message: result.message };
  } catch (error) {
    console.error('!!! PAYMENT ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Payment failed'
    };
  }
};

// ============================================
// Razorpay Route API - Owner Payment Settings
// ============================================

/**
 * Get owner's payment settings status
 * @returns {Promise<{isOnboardingComplete: boolean, onboardingCompletedAt: string, accountStatus: string, canReceivePayments: boolean}>}
 */
export const getOwnerPaymentSettings = async () => {
  const { data } = await api.get('/payments/owner/settings');
  return data;
};

/**
 * Initiate Razorpay onboarding for owner to receive payments directly
 * @returns {Promise<{success: boolean, message: string, data?: {onboardingUrl: string, accountId: string}}>}
 */
export const initiateOwnerOnboarding = async () => {
  try {
    const { data } = await api.post('/payments/owner/onboarding');
    return {
      success: true,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to initiate onboarding'
    };
  }
};

/**
 * Complete owner onboarding after KYC verification
 * @param {string} accountId - Razorpay account ID from onboarding
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const completeOwnerOnboarding = async (accountId) => {
  try {
    const { data } = await api.post('/payments/owner/onboarding/complete', { accountId });
    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to complete onboarding'
    };
  }
};

// ============================================
// Admin - Platform Earnings
// ============================================

/**
 * Get platform earnings summary for admin dashboard
 * @returns {Promise<{totalPlatformFees: number, totalSettled: number, totalPending: number, totalTransactions: number, recentSettlements: Array}>}
 */
export const getPlatformEarnings = async () => {
  const { data } = await api.get('/payments/admin/earnings');
  return data;
};

/**
 * Manually process pending settlement for a payment
 * @param {number} paymentId - Payment ID to settle
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const processSettlement = async (paymentId) => {
  try {
    const { data } = await api.post(`/payments/admin/settlements/${paymentId}`);
    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to process settlement'
    };
  }
};
