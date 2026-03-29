import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import ProductCard from '../components/ProductCard';
import LeadCaptureModal from '../components/LeadCaptureModal';
import {
  Search,
  Filter,
  X,
  AlertCircle,
  Check,
  Snowflake,
  Package,
  Droplet,
  ArrowUpDown,
} from 'lucide-react';
import {
  BROWSE_CATEGORY,
  categoryParamToSlug,
  slugToCategoryParam,
  DEFAULT_BROWSE_CATEGORIES,
} from '../utils/browseUrls';

const DURATION_MONTHS = [3, 6, 9, 11, 12, 24];

/** Sort/display price: use selected tenure (e.g. price["3"]) when duration filter is set. */
const listingSortPrice = (product, durationMonths) => {
  const prices = product?.price || {};
  if (durationMonths) {
    const key = String(durationMonths);
    const v = prices[key];
    if (v != null && Number(v) > 0) return Number(v);
  }
  const nums = Object.values(prices).filter((v) => v != null && Number(v) > 0).map(Number);
  if (!nums.length) return null;
  return Math.min(...nums);
};

const BrowseACs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const categoriesFromUrl = searchParams.get('categories');
  const productType = categoryFromUrl
    ? categoryParamToSlug(categoryFromUrl)
    : categoriesFromUrl
      ? 'all'
      : 'all';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    capacity: '',
    type: '',
    location: '',
    duration: '3',
    condition: '',
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const modalTimerRef = useRef(null);

  useEffect(() => {
    const category = searchParams.get('category');
    const categories = searchParams.get('categories');
    const legacy = searchParams.get('productType');
    if (legacy && !category) {
      const legacyMap = {
        ac: BROWSE_CATEGORY.AC,
        refrigerator: BROWSE_CATEGORY.REFRIGERATOR,
        'washing-machine': BROWSE_CATEGORY.WASHING_MACHINE,
      };
      const next = new URLSearchParams(searchParams);
      next.delete('productType');
      next.set('category', legacyMap[legacy] || BROWSE_CATEGORY.AC);
      setSearchParams(next, { replace: true });
      return;
    }
    if (!category && !categories && !legacy) {
      setSearchParams({ categories: DEFAULT_BROWSE_CATEGORIES }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    loadProducts();

    modalTimerRef.current = setTimeout(() => {
      setShowModal(true);
    }, 120000);

    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, [productType, searchParams]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadProducts();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, productType, searchParams]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const queryParams = {};

      if (productType === 'all') {
        queryParams.categories =
          searchParams.get('categories') || DEFAULT_BROWSE_CATEGORIES;
      } else {
        queryParams.productType = productType;
      }

      if (filters.search) queryParams.search = filters.search;
      if (filters.brand) queryParams.brand = filters.brand;
      if (filters.capacity) queryParams.capacity = filters.capacity;
      if (filters.type) queryParams.type = filters.type;
      if (filters.location) queryParams.location = filters.location;
      if (filters.duration) queryParams.duration = String(filters.duration);
      if (filters.condition) queryParams.condition = filters.condition;
      if (filters.minPrice) queryParams.minPrice = filters.minPrice;
      if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;

      const response = await apiService.getProducts(queryParams);

      if (response.success) {
        setProducts(response.data || []);
      } else {
        setError(response.message || 'Failed to load products');
        setProducts([]);
      }
    } catch (err) {
      setError('An error occurred while loading products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = useMemo(() => {
    const list = [...products];
    const d = filters.duration;
    list.sort((a, b) => {
      const pa = listingSortPrice(a, d);
      const pb = listingSortPrice(b, d);
      if (pa == null && pb == null) return 0;
      if (pa == null) return 1;
      if (pb == null) return -1;
      return sortOrder === 'asc' ? pa - pb : pb - pa;
    });
    return list;
  }, [products, sortOrder, filters.duration]);

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      capacity: '',
      type: '',
      location: '',
      duration: '3',
      condition: '',
      minPrice: '',
      maxPrice: '',
    });
    setSearchParams(
      () => {
        const next = new URLSearchParams();
        next.set('categories', DEFAULT_BROWSE_CATEGORIES);
        return next;
      },
      { replace: true }
    );
  };

  const setCategorySlug = (slug) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('productType');
        if (slug === 'all') {
          next.delete('category');
          next.set('categories', DEFAULT_BROWSE_CATEGORIES);
        } else {
          next.delete('categories');
          next.set('category', slugToCategoryParam(slug));
        }
        return next;
      },
      { replace: true }
    );
  };

  const getFilterOptions = () => {
    if (productType === 'all') {
      return {
        capacities: [
          '1 Ton',
          '1.5 Ton',
          '2 Ton',
          '2.5 Ton',
          '190 litres',
          '210 litres',
          '240 litres',
          '260 litres',
          '300 litres',
          '6 Kg',
          '7 Kg',
          '8 Kg',
          '9 Kg',
          '10 Kg',
          '12 Kg',
        ],
        types: ['Split', 'Window', 'Automatic', 'Semi automatic'],
        brands: [
          'LG',
          'Samsung',
          'Daikin',
          'Voltas',
          'Whirlpool',
          'Haier',
          'Godrej',
          'Panasonic',
          'Hitachi',
          'Blue Star',
          'Carrier',
          'IFB',
          'Other',
        ],
      };
    }
    if (productType === 'washing-machine') {
      return {
        capacities: ['6 Kg', '7 Kg', '8 Kg', '9 Kg', '10 Kg', '12 Kg'],
        types: ['Automatic', 'Semi automatic'],
        brands: ['Whirlpool', 'Haier', 'Godrej', 'Samsung', 'Panasonic', 'LG', 'IFB', 'Other'],
      };
    } else if (productType === 'refrigerator') {
      return {
        capacities: ['190 litres', '210 litres', '240 litres', '260 litres', '300 litres'],
        types: ['Single Door', 'Double Door'],
        brands: ['LG', 'Samsung', 'Whirlpool', 'Godrej', 'Haier', 'Panasonic', 'Hitachi', 'Other'],
      };
    } else {
      return {
        capacities: ['1 Ton', '1.5 Ton', '2 Ton', '2.5 Ton'],
        types: ['Split', 'Window'],
        brands: ['LG', 'Samsung', 'Daikin', 'Voltas', 'Hitachi', 'Blue Star', 'Carrier', 'Other'],
      };
    }
  };

  const filterOptions = getFilterOptions();

  const categoryDefinitions = [
    { slug: 'ac', label: 'Air Conditioners', Icon: Snowflake },
    { slug: 'refrigerator', label: 'Refrigerators', Icon: Package },
    { slug: 'washing-machine', label: 'Washing Machines', Icon: Droplet },
  ];

  const handleCategoryChip = (slug) => {
    if (productType === 'all') {
      setCategorySlug(slug);
      return;
    }
    if (productType === slug) {
      setCategorySlug('all');
      return;
    }
    setCategorySlug(slug);
  };

  const capacityChipLabel = (cap) =>
    String(cap)
      .replace(/\blitres\b/gi, 'L')
      .replace(/\bKg\b/g, 'kg');

  const selectedDuration =
    filters.duration != null && filters.duration !== '' ? Number(filters.duration) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
          <div
            className={`lg:w-80 xl:w-[22rem] shrink-0 order-2 lg:order-1 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)] sticky top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto overscroll-contain">
              <div className="flex justify-between items-center gap-3 pb-4 border-b border-gray-100">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-text-dark tracking-wide uppercase">
                  <Filter className="w-5 h-5 text-primary-blue shrink-0" strokeWidth={2.25} />
                  FILTERS
                </h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-sky-500 hover:text-sky-600 whitespace-nowrap"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-7 pt-6">
                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Product Category
                  </p>
                  <div className="space-y-2.5">
                    {categoryDefinitions.map(({ slug, label, Icon }) => {
                      const active = productType === 'all' || productType === slug;
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => handleCategoryChip(slug)}
                          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-sm font-bold transition-all ${
                            active
                              ? 'bg-gradient-to-r from-[#3b82f6] via-[#4f8ff5] to-[#60a5fa] text-white shadow-[0_8px_20px_-4px_rgba(37,99,235,0.55)] ring-1 ring-white/20'
                              : 'bg-slate-50 text-text-dark hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} strokeWidth={2} />
                          <span className="flex-1 min-w-0 leading-snug">{label}</span>
                          {active ? (
                            <Check className="w-4 h-4 shrink-0 text-white" strokeWidth={3} />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Condition
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['New', 'Refurbished'].map((cond) => {
                      const active = filters.condition === cond;
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() =>
                            handleFilterChange('condition', active ? '' : cond)
                          }
                          className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-all ${
                            active
                              ? 'border-sky-500 bg-sky-500 text-white shadow-[0_5px_16px_-4px_rgba(14,165,233,0.5)]'
                              : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-slate-300 hover:bg-slate-200/70'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filterOptions.types.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Type
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.types.map((typeOpt) => {
                        const active = filters.type === typeOpt;
                        return (
                          <button
                            key={typeOpt}
                            type="button"
                            onClick={() =>
                              handleFilterChange('type', active ? '' : typeOpt)
                            }
                            className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-all ${
                              active
                                ? 'border-sky-500 bg-sky-500 text-white shadow-[0_5px_16px_-4px_rgba(14,165,233,0.5)]'
                                : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-slate-300 hover:bg-slate-200/70'
                            }`}
                          >
                            {typeOpt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Rental Duration
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {DURATION_MONTHS.map((m) => {
                      const active = selectedDuration === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() =>
                            handleFilterChange('duration', active ? '' : String(m))
                          }
                          className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                            active
                              ? 'border-sky-500 bg-sky-500 text-white shadow-[0_5px_16px_-4px_rgba(14,165,233,0.5)]'
                              : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-slate-300 hover:bg-slate-200/70'
                          }`}
                        >
                          {m}M
                        </button>
                      );
                    })}
                  </div>
                  {selectedDuration != null && (
                    <div className="mt-3 w-full rounded-xl border border-sky-400 bg-sky-500 py-2.5 text-center text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(14,165,233,0.55)]">
                      {selectedDuration} {selectedDuration === 1 ? 'Month' : 'Months'}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    {productType === 'washing-machine'
                      ? 'Capacity'
                      : productType === 'refrigerator'
                        ? 'Capacity'
                        : productType === 'all'
                          ? 'Capacity'
                          : 'Cooling Capacity'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.capacities.map((cap) => {
                      const active = filters.capacity === cap;
                      return (
                        <button
                          key={cap}
                          type="button"
                          onClick={() =>
                            handleFilterChange('capacity', active ? '' : cap)
                          }
                          className={`min-w-0 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            active
                              ? 'border-sky-500 bg-sky-500 text-white shadow-[0_4px_12px_-3px_rgba(14,165,233,0.45)]'
                              : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-slate-300 hover:bg-slate-200/70'
                          }`}
                        >
                          {capacityChipLabel(cap)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Brand
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="">All</option>
                    {filterOptions.brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Price Range (₹)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="lg:hidden mt-4 w-full py-2 border border-gray-200 rounded-xl flex items-center justify-center gap-2"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
                Close filters
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="mb-5 md:mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-primary-blue tracking-tight mb-1.5">
                Browse Rental Products
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl">
                Discover amazing appliances for your home
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-8 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-stretch sm:justify-between">
              <div className="relative min-w-0 flex-1 sm:max-w-xl lg:max-w-none xl:max-w-2xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-text-light w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by brand, model, location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-text-dark shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSortOrder('asc')}
                  className={`inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-sm transition min-w-[8.5rem] ${
                    sortOrder === 'asc'
                      ? 'bg-primary-blue text-white'
                      : 'border border-gray-200 bg-white text-text-dark hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpDown className={`h-4 w-4 shrink-0 ${sortOrder === 'asc' ? 'text-white' : 'text-text-dark'}`} />
                  Low to High
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder('desc')}
                  className={`inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-sm transition min-w-[8.5rem] ${
                    sortOrder === 'desc'
                      ? 'bg-primary-blue text-white'
                      : 'border border-gray-200 bg-white text-text-dark hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpDown className={`h-4 w-4 shrink-0 ${sortOrder === 'desc' ? 'text-white' : 'text-text-dark'}`} />
                  High to Low
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex lg:hidden w-full sm:w-auto sm:flex-1 items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 font-semibold text-sm"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    listingDuration={filters.duration || undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-100">
                <p className="text-text-light text-lg mb-4">No products found matching your criteria.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary-blue text-white rounded-xl hover:bg-primary-blue-light transition-all font-semibold"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <LeadCaptureModal onClose={() => setShowModal(false)} source="browse" />
      )}
    </div>
  );
};

export default BrowseACs;
