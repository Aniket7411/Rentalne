/** Load Razorpay Checkout (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/) */

export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) {
      const tick = () =>
        window.Razorpay ? resolve(window.Razorpay) : setTimeout(tick, 30);
      tick();
      return;
    }
    const s = document.createElement('script');
    s.id = 'razorpay-checkout-js';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(window.Razorpay);
    s.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(s);
  });
}

/**
 * @param {object} opts
 * @param {string} opts.key - Razorpay key_id from API
 * @param {string} opts.orderId - razorpay_order_id from API
 * @param {function} opts.onSuccess - (response) => void
 * @param {function} [opts.onDismiss]
 * @param {{email?:string,contact?:string}} [opts.prefill]
 */
export async function openRazorpayCheckout(opts) {
  const Razorpay = await loadRazorpayScript();
  const { key, orderId, name, description, prefill, onSuccess, onDismiss } = opts;
  const options = {
    key,
    order_id: orderId,
    name: name || 'ASH Enterprises',
    description: description || 'Secure payment',
    handler(response) {
      onSuccess(response);
    },
    modal: {
      ondismiss() {
        onDismiss?.();
      },
    },
    prefill: prefill || {},
    theme: { color: '#0284c7' },
  };
  const rzp = new Razorpay(options);
  rzp.open();
  return rzp;
}
