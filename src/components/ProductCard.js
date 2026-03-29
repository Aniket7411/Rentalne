import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Listing card fields align with `GET /api/products` (or `/api/acs`) items:
 * `_id`, `category`, `name`, `brand`, `model`, `type`, `capacity`, `price` { "3"|"6"|… },
 * `images[]`, `status`, etc.
 */
function pickPriceForCard(product, listingDuration) {
  const prices = product.price || {};
  const key = listingDuration != null && listingDuration !== '' ? String(listingDuration) : null;
  if (key && prices[key] != null && Number(prices[key]) > 0) {
    return { months: Number(key), amount: Number(prices[key]) };
  }
  const entries = Object.entries(prices)
    .filter(([, v]) => v != null && Number(v) > 0)
    .map(([k, v]) => [Number(k), Number(v)]);
  if (!entries.length) return null;
  entries.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  return { months: entries[0][0], amount: entries[0][1] };
}

const ProductCard = ({ product, listingDuration }) => {
  const [saved, setSaved] = useState(false);

  const getCategorySlug = () => {
    const raw = product.category || product.productType || 'AC';
    const s = String(raw);
    if (s === 'Washing Machine' || s === 'washing-machine') return 'washing-machine';
    if (s === 'Refrigerator' || s === 'refrigerator') return 'refrigerator';
    return 'ac';
  };

  const getProductRoute = () => {
    const productType = getCategorySlug();
    const id = product._id || product.id;
    if (productType === 'washing-machine') return `/washing-machine/${id}`;
    if (productType === 'refrigerator') return `/refrigerator/${id}`;
    return `/ac/${id}`;
  };

  const displayInfo = useMemo(() => {
    const raw = product.category || product.productType || 'AC';
    const s = String(raw);
    let productType = 'ac';
    if (s === 'Washing Machine' || s === 'washing-machine') productType = 'washing-machine';
    else if (s === 'Refrigerator' || s === 'refrigerator') productType = 'refrigerator';

    if (productType === 'washing-machine') {
      return {
        title: product.name || `${product.brand || ''} ${product.capacity || ''}`.trim(),
        subtitle: [product.capacity, product.type].filter(Boolean).join(' • '),
      };
    }
    if (productType === 'refrigerator') {
      const cap = product.capacity || '';
      const typ = product.type || 'Single Door';
      return {
        title: product.name || `${product.brand || ''} ${cap}`.trim(),
        subtitle: [cap, typ].filter(Boolean).join(' • '),
      };
    }
    return {
      title: product.name || `${product.brand || ''} ${product.model || ''}`.trim(),
      subtitle: [product.capacity, product.type].filter(Boolean).join(' • '),
    };
  }, [product]);

  const priceInfo = useMemo(
    () => pickPriceForCard(product, listingDuration),
    [product, listingDuration]
  );

  const primaryImage = product.images?.length ? product.images[0] : null;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((v) => !v);
  };

  const route = getProductRoute();
  const available = product.status === 'Available';
  const titleForAlt = displayInfo.title || product.name || 'Product';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sky-200/70 bg-white shadow-[0_4px_20px_-6px_rgba(15,23,42,0.1)] transition-shadow duration-300 hover:shadow-[0_10px_28px_-8px_rgba(15,23,42,0.14)]"
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-slate-100">
        <Link to={route} className="absolute inset-0 z-0 block" aria-label={titleForAlt}>
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={titleForAlt}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&q=80';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">No image</div>
          )}
        </Link>

        {product.status && (
          <div
            className={`pointer-events-none absolute left-3 top-3 z-[1] rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${
              available ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            {product.status}
          </div>
        )}

        <button
          type="button"
          onClick={handleWishlistClick}
          className="absolute right-3 top-3 z-[1] bg-transparent p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-0 rounded-sm"
          aria-label={saved ? 'Remove from saved' : 'Save to wishlist'}
        >
          <Heart
            className={`h-5 w-5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] ${
              saved ? 'fill-rose-400/90 text-white' : 'fill-transparent text-white'
            }`}
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3.5 sm:px-4 sm:pt-4 sm:pb-4">
        <Link to={route} className="block min-w-0">
          <h3 className="text-[0.9375rem] sm:text-base font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-primary-blue transition-colors">
            {displayInfo.title}
          </h3>
          {displayInfo.subtitle ? (
            <p className="mt-1 text-xs text-slate-500 line-clamp-1">{displayInfo.subtitle}</p>
          ) : null}
        </Link>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
          {priceInfo ? (
            <>
              <span className="text-lg sm:text-xl font-bold text-primary-blue tabular-nums">
                ₹{priceInfo.amount.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-normal text-slate-400">starting</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-slate-600">Price on request</span>
          )}
        </div>

        <p className="mt-2.5 text-[11px] sm:text-xs leading-relaxed text-slate-500">
          {priceInfo ? (
            <>
              For {priceInfo.months} months{' '}
              <span className="text-slate-300">•</span>{' '}
              <Link to={route} className="font-medium text-primary-blue/90 hover:text-primary-blue hover:underline">
                View details for more options
              </Link>
            </>
          ) : (
            <Link to={route} className="font-medium text-primary-blue/90 hover:text-primary-blue hover:underline">
              View details for tenure options
            </Link>
          )}
        </p>
      </div>
    </motion.article>
  );
};

export default ProductCard;
