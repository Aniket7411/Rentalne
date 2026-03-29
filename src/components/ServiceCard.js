import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Zap,
  ShoppingCart,
  User,
  Wrench,
  Droplets,
  Sparkles,
  Home,
} from 'lucide-react';

function coerceStringList(value) {
  if (Array.isArray(value) && value.length) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function inferPlaceholderIcon(title, description) {
  const t = `${title || ''} ${description || ''}`.toLowerCase();
  if (/(install|uninstall|mount|shift|removal)/.test(t)) return Home;
  if (/(gas|refill|leak|water|drain|cooling|refrigerant)/.test(t)) return Droplets;
  if (/(wash|jet|foam|clean|filter)/.test(t)) return Sparkles;
  if (/(repair|inspection|fix|break|fault)/.test(t)) return Wrench;
  return Wrench;
}

function badgeIconFor(badge) {
  if (!badge) return null;
  const b = String(badge).toLowerCase();
  if (/(visit|hour|day|same|quick)/.test(b)) {
    return <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />;
  }
  return null;
}

const ServiceCard = ({ service, onAddClick, onView }) => {
  const badgeIcons = {
    'Visit Within 1 Hour': badgeIconFor('visit'),
    'Most Booked': <ShoppingCart className="w-3.5 h-3.5 shrink-0" aria-hidden />,
    'Power Saver': <Zap className="w-3.5 h-3.5 shrink-0" aria-hidden />,
  };

  const features = useMemo(() => {
    const fromFeatures = coerceStringList(service.features);
    if (fromFeatures.length) return fromFeatures;
    return coerceStringList(service.keyFeatures);
  }, [service.features, service.keyFeatures]);

  const benefits = useMemo(() => coerceStringList(service.benefits), [service.benefits]);

  const PlaceholderIcon = useMemo(
    () => inferPlaceholderIcon(service.title, service.description),
    [service.title, service.description]
  );

  const handleBookClick = (e) => {
    e.stopPropagation();
    onAddClick && onAddClick(service);
  };

  const handleCardClick = () => {
    onView && onView(service);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  const customBadgeIcon = service.badge && !badgeIcons[service.badge] ? badgeIconFor(service.badge) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200/90 hover:border-sky-400/50 hover:-translate-y-1 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:ring-offset-2 h-full flex flex-col"
    >
      <div className="w-full h-40 sm:h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden shrink-0">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title || 'Service'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-50 to-slate-100">
            <PlaceholderIcon className="w-14 h-14 text-sky-500/70" strokeWidth={1.5} aria-hidden />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Service</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 min-h-0">
        {service.badge && (
          <div className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-800 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 w-fit border border-sky-100">
            {badgeIcons[service.badge] || customBadgeIcon || <User className="w-3.5 h-3.5 shrink-0" aria-hidden />}
            <span className="line-clamp-1">{service.badge}</span>
          </div>
        )}

        <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-sky-700 transition-colors">
          {service.title}
        </h3>

        <p className="text-slate-600 text-sm line-clamp-2 mb-3">{service.description}</p>

        {(features.length > 0 || benefits.length > 0) && (
          <div className="mb-4 pt-3 border-t border-slate-100 flex-1 min-h-0">
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
              {(features.length ? features : benefits).slice(0, 3).map((f, i) => (
                <li key={`f-${i}`} className="flex gap-2">
                  <span className="text-sky-500 mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-500" aria-hidden />
                  <span className="leading-snug line-clamp-2">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl sm:text-[1.65rem] font-bold text-sky-600">₹{service.price}</span>
            {service.originalPrice && (
              <span className="text-sm text-slate-400 line-through">₹{service.originalPrice}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleBookClick}
            className="w-full inline-flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white px-5 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Book Service
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
