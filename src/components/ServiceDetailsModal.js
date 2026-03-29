import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const ListOrParagraph = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div>
      <h4 className="text-lg font-semibold text-neutral-900 mb-2">{label}</h4>
      {Array.isArray(value) ? (
        <ul className="list-disc list-inside text-slate-500 space-y-1">
          {value.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 whitespace-pre-line">{value}</p>
      )}
    </div>
  );
};

const ServiceDetailsModal = ({ service, isOpen, onClose, onAdd }) => {
  if (!isOpen || !service) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">{service.title}</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-neutral-900">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="h-64 overflow-hidden rounded-lg">
              <img
                src={service.image || 'https://via.placeholder.com/800x400?text=AC+Service'}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>

            {service.badge && (
              <span className="inline-block bg-sky-100 text-sky-700 text-sm font-semibold px-3 py-1 rounded-full">
                {service.badge}
              </span>
            )}

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-sky-500">₹{service.price}</span>
              {service.originalPrice && (
                <span className="text-xl text-slate-500 line-through">₹{service.originalPrice}</span>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-2">Description</h4>
              <p className="text-slate-500">{service.description}</p>
            </div>

            <ListOrParagraph label="Process" value={service.process} />
            <ListOrParagraph label="Benefits" value={service.benefits} />
            <ListOrParagraph label="Key Features" value={service.keyFeatures} />
            {service.recommendedFrequency && (
              <div>
                <h4 className="text-lg font-semibold text-neutral-900 mb-2">Recommended Frequency</h4>
                <p className="text-slate-500">{service.recommendedFrequency}</p>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-end">
            <button
              onClick={() => onAdd(service)}
              className="flex items-center space-x-2 px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition"
            >
              <span>Add</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ServiceDetailsModal;


