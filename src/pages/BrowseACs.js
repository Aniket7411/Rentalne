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
    type: searchParams.get('type') ? [searchParams.get('type')] : [],
    location: '',
    duration: '3',
    condition: '',
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const modalTimerRef = useRef(null);

  useEffect(() => {
    const urlType = searchParams.get('type') || '';
    const urlTypes = urlType ? [urlType] : [];
    setFilters((prev) => {
      const same = prev.type.length === urlTypes.length && prev.type.every((t, i) => t === urlTypes[i]);
      return same ? prev : { ...prev, type: urlTypes };
    });
  }, [searchParams]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType, searchParams]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadProducts();
    }, 500);

    return () => clearTimeout(debounceTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (filters.type.length) queryParams.type = filters.type.join(',');
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
      type: [],
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

  const allCatValues = [BROWSE_CATEGORY.AC, BROWSE_CATEGORY.REFRIGERATOR, BROWSE_CATEGORY.WASHING_MACHINE];

  const selectedCatSet = useMemo(() => {
    if (categoryFromUrl) return new Set([categoryFromUrl]);
    if (categoriesFromUrl) return new Set(categoriesFromUrl.split(',').map((s) => s.trim()));
    return new Set(allCatValues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFromUrl, categoriesFromUrl]);

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
    const catValue = slugToCategoryParam(slug);
    const next = new Set(selectedCatSet);
    if (next.has(catValue)) {
      next.delete(catValue);
      if (next.size === 0) return; // keep at least one
    } else {
      next.add(catValue);
    }
    const arr = [...next];
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.delete('productType');
        p.delete('category');
        p.delete('categories');
        if (arr.length === 1) {
          p.set('category', arr[0]);
        } else {
          p.set('categories', arr.join(','));
        }
        return p;
      },
      { replace: true }
    );
  };

  const capacityChipLabel = (cap) =>
    String(cap)
      .replace(/\blitres\b/gi, 'L')
      .replace(/\bKg\b/g, 'kg');

  const selectedDuration =
    filters.duration != null && filters.duration !== '' ? Number(filters.duration) : null;

  const filterBody = (
    <div className="space-y-6 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Product Category
                  </p>
                  <div className="space-y-2">
                    {categoryDefinitions.map(({ slug, label, Icon }) => {
                      const active = selectedCatSet.has(slugToCategoryParam(slug));
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => handleCategoryChip(slug)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all ${
                            active
                              ? 'bg-gradient-to-r from-[#3b82f6] via-[#4f8ff5] to-[#60a5fa] text-white shadow-[0_8px_20px_-4px_rgba(37,99,235,0.55)]'
                              : 'bg-slate-50 text-text-dark hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} strokeWidth={2} />
                          <span className="flex-1 min-w-0 leading-snug">{label}</span>
                          {active && <Check className="w-4 h-4 shrink-0 text-white" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Condition</p>
                  <div className="flex flex-wrap gap-2">
                    {['New', 'Refurbished'].map((cond) => {
                      const active = filters.condition === cond;
                      return (
                        <button key={cond} type="button"
                          onClick={() => handleFilterChange('condition', active ? '' : cond)}
                          className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200/70'}`}>
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filterOptions.types.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Type</p>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.types.map((typeOpt) => {
                        const active = filters.type.includes(typeOpt);
                        return (
                          <button key={typeOpt} type="button"
                            onClick={() => {
                              const next = active ? filters.type.filter((t) => t !== typeOpt) : [...filters.type, typeOpt];
                              handleFilterChange('type', next);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200/70'}`}>
                            {typeOpt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Rental Duration</p>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_MONTHS.map((m) => {
                      const active = selectedDuration === m;
                      return (
                        <button key={m} type="button"
                          onClick={() => handleFilterChange('duration', active ? '' : String(m))}
                          className={`py-2 rounded-xl text-sm font-bold border transition-all ${active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200/70'}`}>
                          {m}M
                        </button>
                      );
                    })}
                  </div>
                  {selectedDuration != null && (
                    <div className="mt-2 w-full rounded-xl bg-sky-500 py-2 text-center text-sm font-bold text-white">
                      {selectedDuration} {selectedDuration === 1 ? 'Month' : 'Months'}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    {productType === 'ac' ? 'Cooling Capacity' : 'Capacity'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.capacities.map((cap) => {
                      const active = filters.capacity === cap;
                      return (
                        <button key={cap} type="button"
                          onClick={() => handleFilterChange('capacity', active ? '' : cap)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200/70'}`}>
                          {capacityChipLabel(cap)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Brand</p>
                  <select value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue">
                    <option value="">All</option>
                    {filterOptions.brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Location</p>
                  <input type="text" placeholder="Enter location" value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Price Range (₹)</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                    <input type="number" placeholder="Max" value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                  </div>
                </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-6 sm:py-10">

      {/* Mobile left-slide drawer — starts below navbar (top-16) */}
      <div className={`fixed inset-x-0 bottom-0 top-16 z-40 lg:hidden transition-all duration-300 ${showFilters ? 'visible' : 'invisible pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setShowFilters(false)}
        />
        {/* Drawer panel */}
        <div className={`absolute left-0 inset-y-0 w-[80vw] max-w-xs bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-text-dark uppercase tracking-wide">
              <Filter className="w-4 h-4 text-primary-blue" strokeWidth={2.25} />
              Filters
            </h2>
            <div className="flex items-center gap-3">
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-sky-500 hover:text-sky-600">
                Clear All
              </button>
              <button type="button" onClick={() => setShowFilters(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
          {/* Scrollable filter body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
            {filterBody}
          </div>
          {/* Apply button */}
          <div className="px-4 py-3 border-t border-gray-100 shrink-0">
            <button type="button" onClick={() => setShowFilters(false)}
              className="w-full py-3 bg-primary-blue text-white font-semibold rounded-xl text-sm">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-3 sm:px-5 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
          {/* Desktop sidebar */}
          <div className="lg:w-72 xl:w-80 shrink-0 hidden lg:block">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)] sticky top-16 md:top-20 max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-text-dark tracking-wide uppercase">
                  <Filter className="w-4 h-4 text-primary-blue" strokeWidth={2.25} />
                  Filters
                </h2>
                <button type="button" onClick={clearFilters} className="text-sm font-semibold text-sky-500 hover:text-sky-600">
                  Clear All
                </button>
              </div>
              {filterBody}
            </div>
          </div>

          <div className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="mb-4 lg:mb-5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-primary-blue tracking-tight mb-1">
                Browse Rental Products
              </h1>
              <p className="text-sm text-slate-500">
                Discover amazing appliances for your home
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mobile category chips */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 mb-3 no-scrollbar">
              {categoryDefinitions.map(({ slug, label, Icon }) => {
                const active = selectedCatSet.has(slugToCategoryParam(slug));
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => handleCategoryChip(slug)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                      active
                        ? 'bg-primary-blue text-white shadow'
                        : 'bg-white border border-gray-200 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Search + sort + filter toggle */}
            <div className="mb-5 flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by brand, model, location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-text-dark shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSortOrder('asc')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-sm transition ${
                    sortOrder === 'asc'
                      ? 'bg-primary-blue text-white'
                      : 'border border-gray-200 bg-white text-text-dark hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
                  Low to High
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder('desc')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-sm transition ${
                    sortOrder === 'desc'
                      ? 'bg-primary-blue text-white'
                      : 'border border-gray-200 bg-white text-text-dark hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
                  High to Low
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex lg:hidden items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-xs"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
