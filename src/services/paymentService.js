import API from '../api/axios';

/**
 * Create a Razorpay order for a booking
 * @param {number} bookingId - The booking ID
 * @returns {Promise<{orderId: string, amount: number, currency: string, keyId: string}>}
 */
export const createOrder = async (bookingId) => {
  const { data } = await API.post('/payments/create-order', { bookingId });
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
  const { data } = await API.post('/payments/verify-payment', {
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });
  return data;
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
    const checkoutOptions = {
      key: options.keyId,
      amount: options.amount * 100, // Convert rupees to paise
      currency: 'INR',
      name: 'AgriConnect',
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
  try {
    // Step 1: Create order
    const order = await createOrder(bookingId);

    // Step 2: Open Razorpay checkout
    const paymentResponse = await openRazorpayCheckout({
      keyId: order.keyId,
      amount: order.amount,
      orderId: order.orderId,
      description: `Payment for ${machineName}`,
      prefill: {
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || ''
      }
    });

    // Step 3: Verify payment
    const result = await verifyPayment({
      bookingId,
      razorpayOrderId: paymentResponse.razorpay_order_id,
      razorpayPaymentId: paymentResponse.razorpay_payment_id,
      razorpaySignature: paymentResponse.razorpay_signature
    });

    return { success: true, message: result.message };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Payment failed' 
    };
  }
};
