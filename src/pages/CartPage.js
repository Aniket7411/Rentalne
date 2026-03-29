import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { defaultBrowsePath } from '../utils/browseUrls';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, loading, refreshCart, removeFromCart } = useCart();
  const { toasts, removeToast, success, error: showError } = useToast();

  const rentals = cart.rentals || [];
  const services = cart.services || [];

  const removeLine = async (itemId) => {
    const res = await removeFromCart(itemId);
    if (res.success) {
      success('Removed from cart');
      await refreshCart();
    } else {
      showError(res.message || 'Could not remove');
    }
  };

  const count = rentals.length + services.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text-dark mb-2 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-primary-blue" />
          Cart
        </h1>
        <p className="text-text-light mb-8">
          {count === 0 ? 'Your cart is empty.' : `${count} item(s)`}
        </p>

        {count === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-text-light mb-4">Browse products and add rentals to your cart.</p>
            <Link
              to={defaultBrowsePath()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-xl font-semibold hover:opacity-90"
            >
              Browse rental products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((line) => (
              <div
                key={line.id || line._id}
                className="bg-white rounded-xl shadow border border-gray-100 p-4 flex gap-4 justify-between items-start"
              >
                <div>
                  <p className="font-semibold text-text-dark">
                    {line.product?.name || line.product?.brand || 'Rental item'}
                  </p>
                  <p className="text-sm text-text-light">
                    Qty {line.quantity} · {line.paymentOption || 'payAdvance'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(line.id || line._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label="Remove"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {services.map((line) => (
              <div
                key={line.id || line._id}
                className="bg-white rounded-xl shadow border border-gray-100 p-4 flex gap-4 justify-between items-start"
              >
                <div>
                  <p className="font-semibold text-text-dark">{line.serviceTitle}</p>
                  <p className="text-sm text-text-light">₹{line.servicePrice}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(line.id || line._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label="Remove"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-xl font-semibold hover:opacity-90"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to={defaultBrowsePath()}
                className="flex-1 text-center px-6 py-3 border border-gray-200 rounded-xl font-medium text-text-dark hover:bg-gray-50"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
