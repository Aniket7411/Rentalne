import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

/** Order / payment feedback — success or error. */
const CheckoutFeedbackModal = ({ isOpen, variant = 'success', title, message, onClose, confirmText = 'OK' }) => {
  if (!isOpen) return null;
  const isOk = variant === 'success';
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-5 py-6 text-center">
            {isOk ? (
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
            ) : (
              <AlertCircle className="w-14 h-14 text-amber-500 mx-auto mb-3" />
            )}
            {message && <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{message}</p>}
          </div>
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl font-semibold text-white ${
                isOk ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-700 hover:bg-slate-800'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutFeedbackModal;
