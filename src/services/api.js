import axios from 'axios';
import { uploadMultipleFilesToCloudinary } from '../utils/cloudinary';

/** Maps frontend `productType` query param to backend `category`. */
const productTypeToCategory = (productType) => {
  const map = {
    ac: 'AC',
    'washing-machine': 'Washing Machine',
    refrigerator: 'Refrigerator',
  };
  return map[productType] || productType;
};

/** Rental inquiry: backend expects duration Monthly | Quarterly | Yearly */
const normalizeInquiryDuration = (data) => {
  const raw = data.duration || data.tenure || data.preferredDuration;
  if (raw && ['Monthly', 'Quarterly', 'Yearly'].includes(raw)) return raw;
  const t = String(raw || 'monthly').toLowerCase();
  if (t.includes('year') || t === '12months' || t === 'yearly') return 'Yearly';
  if (t.includes('quarter')) return 'Quarterly';
  return 'Monthly';
};

const buildRentalInquiryPayload = (data) => ({
  name: data.name,
  email: data.email,
  phone: data.phone,
  message: data.message || '',
  duration: normalizeInquiryDuration(data),
});

// Production API host (`/api` prefix). Public catalog: prefer GET /products (legacy: /acs).
const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\s+/g, '') || 'https://api.ashenterprises.in/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/** Normalize user from auth responses so `id` is always set. */
const normalizeAuthUser = (u) => {
  if (!u || typeof u !== 'object') return u;
  const id = u.id || u._id;
  return id && !u.id ? { ...u, id } : u;
};

/** Backend envelope: failed requests may still be HTTP 200 with `success: false`. */
const apiEnvelopeFailed = (body) => body && body.success === false;

/**
 * Normalize list endpoints (`GET /products`, `GET /acs`) — some gateways return `data` as array,
 * or nested `{ products|items|results }`, which previously yielded zero recommendations.
 */
const normalizeProductListFromBody = (body) => {
  if (body == null) return [];
  const raw = body.data !== undefined ? body.data : body;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.products)) return raw.products;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.results)) return raw.results;
    if (Array.isArray(raw.docs)) return raw.docs;
  }
  return [];
};

/** Shared query normalization for public catalog list endpoints. */
const buildPublicAcsParams = (filters = {}) => {
  const params = { ...filters };
  if (params.categories) {
    delete params.productType;
    delete params.category;
  } else if (params.productType && !params.category) {
    params.category = productTypeToCategory(params.productType);
    delete params.productType;
  }
  if (params.tenure && !params.duration) {
    const t = String(params.tenure).replace(/months?/i, '').trim();
    const n = parseInt(t, 10);
    if (!Number.isNaN(n)) params.duration = String(n);
    delete params.tenure;
  }
  if (params.duration != null && params.duration !== '') {
    params.duration = String(params.duration);
  }
  Object.keys(params).forEach((k) => {
    if (params[k] === '' || params[k] == null) delete params[k];
  });
  return params;
};

const PUBLIC_PRODUCTS_PATH = '/products';
const PUBLIC_ACS_PATH = '/acs';
const ADMIN_CATALOG_PRIMARY = '/admin/products';
const ADMIN_CATALOG_LEGACY = '/admin/acs';

/** Prefer `GET /products`; fall back to `GET /acs` if the route is not mounted. */
const getPublicCatalogBody = async (params) => {
  try {
    const { data: body } = await api.get(PUBLIC_PRODUCTS_PATH, { params });
    return body;
  } catch (err) {
    const s = err.response?.status;
    if (s === 404 || s === 405) {
      const { data: body } = await api.get(PUBLIC_ACS_PATH, { params });
      return body;
    }
    throw err;
  }
};

const getPublicProductByIdBody = async (id) => {
  const enc = encodeURIComponent(id);
  try {
    const { data: body } = await api.get(`${PUBLIC_PRODUCTS_PATH}/${enc}`);
    return body;
  } catch (err) {
    const s = err.response?.status;
    if (s === 404 || s === 405) {
      const { data: body } = await api.get(`${PUBLIC_ACS_PATH}/${enc}`);
      return body;
    }
    throw err;
  }
};

const getAdminCatalogListResponse = async () => {
  try {
    return await api.get(ADMIN_CATALOG_PRIMARY);
  } catch (e) {
    const s = e.response?.status;
    if (s === 404 || s === 405) {
      return await api.get(ADMIN_CATALOG_LEGACY);
    }
    throw e;
  }
};

const postAdminCatalog = async (body) => {
  try {
    return await api.post(ADMIN_CATALOG_PRIMARY, body);
  } catch (e) {
    const s = e.response?.status;
    if (s === 404 || s === 405) {
      return await api.post(ADMIN_CATALOG_LEGACY, body);
    }
    throw e;
  }
};

const patchAdminCatalog = async (id, body) => {
  const enc = encodeURIComponent(id);
  try {
    return await api.patch(`${ADMIN_CATALOG_PRIMARY}/${enc}`, body);
  } catch (e) {
    const s = e.response?.status;
    if (s === 404 || s === 405) {
      return await api.patch(`${ADMIN_CATALOG_LEGACY}/${enc}`, body);
    }
    throw e;
  }
};

const deleteAdminCatalog = async (id) => {
  const enc = encodeURIComponent(id);
  try {
    return await api.delete(`${ADMIN_CATALOG_PRIMARY}/${enc}`);
  } catch (e) {
    const s = e.response?.status;
    if (s === 404 || s === 405) {
      return await api.delete(`${ADMIN_CATALOG_LEGACY}/${enc}`);
    }
    throw e;
  }
};

/** Service cart: backend expects `bookingDetails.addressType === "other"`, not `someoneElse`. */
const normalizeCartServiceBookingDetails = (bd) => {
  if (!bd || typeof bd !== 'object') return bd;
  const out = { ...bd };
  if (out.addressType === 'someoneElse') out.addressType = 'other';
  return out;
};

/** Product.price keys per API: 3, 6, 9, 11, 12, 24 (not `3months`). */
const normalizeRentalPriceForApi = (priceObj) => {
  if (!priceObj || typeof priceObj !== 'object') return {};
  const out = {};
  const toKey = (k) => {
    const s = String(k).toLowerCase().replace(/\s/g, '');
    const map = {
      '3': '3',
      '3months': '3',
      '6': '6',
      '6months': '6',
      '9': '9',
      '9months': '9',
      '11': '11',
      '11months': '11',
      '12': '12',
      '12months': '12',
      '24': '24',
      '24months': '24',
    };
    return map[s] || null;
  };
  for (const [k, v] of Object.entries(priceObj)) {
    const nk = toKey(k);
    if (!nk || v === '' || v == null) continue;
    const n = Number(v);
    if (!Number.isNaN(n) && n >= 0) out[nk] = n;
  }
  return out;
};

const normalizeConditionForApi = (c) => {
  if (c == null || c === '') return undefined;
  const s = String(c).toLowerCase();
  if (s.includes('refurb')) return 'Refurbished';
  return 'New';
};

/** Unified POST /admin/acs body (AC, Refrigerator, Washing Machine). */
const buildAdminProductPayload = (raw) => {
  const category =
    raw.category || (raw.productType ? productTypeToCategory(raw.productType) : null) || 'AC';
  const price = normalizeRentalPriceForApi(raw.price);
  const model =
    raw.model ||
    [raw.brand, raw.capacity].filter(Boolean).join(' ').trim() ||
    raw.name ||
    '';
  const payload = {
    category,
    name: raw.name,
    brand: raw.brand || '',
    model,
    capacity: raw.capacity,
    type: raw.type,
    description: raw.description || '',
    location: raw.location,
    status: raw.status || 'Available',
    price,
    images: raw.images || [],
  };
  const cond = normalizeConditionForApi(raw.condition);
  if (cond) payload.condition = cond;
  if (raw.discount != null && raw.discount !== '') {
    const d = Number(raw.discount);
    if (!Number.isNaN(d)) payload.discount = d;
  }
  if (raw.features != null && typeof raw.features === 'object' && !Array.isArray(raw.features)) {
    payload.features = raw.features;
  } else if (Array.isArray(raw.features) && raw.features.length) {
    payload.features = { specs: raw.features };
  }
  if (raw.benefits != null && String(raw.benefits).trim() !== '') {
    payload.benefits = String(raw.benefits);
  }
  if (raw.monthlyPaymentEnabled === true || raw.monthlyPaymentEnabled === false) {
    payload.monthlyPaymentEnabled = raw.monthlyPaymentEnabled;
  }
  if (raw.monthlyPrice != null && raw.monthlyPrice !== '') {
    const mp = Number(raw.monthlyPrice);
    if (!Number.isNaN(mp)) payload.monthlyPrice = mp;
  }
  if (raw.securityDeposit != null && raw.securityDeposit !== '') {
    const sd = Number(raw.securityDeposit);
    if (!Number.isNaN(sd)) payload.securityDeposit = sd;
  }
  return payload;
};

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and let route guards handle redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Admin Authentication
  adminLogin: async (email, password) => {
    try {
      const { data } = await api.post('/admin/login', { email, password });
      if (data.success === false) {
        return {
          success: false,
          message: data.message || 'Login failed',
          error: data.error,
        };
      }
      return {
        success: true,
        token: data.token,
        user: normalizeAuthUser(data.user),
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        error: error.response?.data?.error,
      };
    }
  },

  // User Authentication (POST /api/auth/login, /api/auth/signup)
  userLogin: async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success === false) {
        return {
          success: false,
          message: data.message || 'Login failed',
          error: data.error,
        };
      }
      return {
        success: true,
        token: data.token,
        user: normalizeAuthUser(data.user),
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        error: error.response?.data?.error,
      };
    }
  },

  userSignup: async (userData) => {
    try {
      const { name, email, password, phone, homeAddress, interestedIn } = userData;
      const body = {
        name: String(name || '').trim(),
        email: String(email || '').trim(),
        password,
        phone,
      };
      const addr = String(homeAddress || '').trim();
      if (addr) body.homeAddress = addr;
      if (Array.isArray(interestedIn) && interestedIn.length > 0) {
        body.interestedIn = interestedIn;
      }
      const { data } = await api.post('/auth/signup', body);
      if (data.success === false) {
        return {
          success: false,
          message: data.message || 'Signup failed',
          error: data.error,
        };
      }
      return {
        success: true,
        token: data.token,
        user: normalizeAuthUser(data.user),
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
        error: error.response?.data?.error,
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success === false) {
        return {
          success: false,
          message: data.message || 'Request failed',
          error: data.error,
        };
      }
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Request failed',
        error: error.response?.data?.error,
      };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const { data: body } = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Could not reset password',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Password updated',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Could not reset password',
        error: error.response?.data?.error,
      };
    }
  },

  /** Public FAQ list (`GET /api/faqs`) */
  getFaqs: async () => {
    try {
      const { data: body } = await api.get('/faqs');
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          data: [],
          message: body.message,
        };
      }
      const raw = body.data !== undefined ? body.data : body;
      return {
        success: true,
        data: Array.isArray(raw) ? raw : [],
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load FAQs',
      };
    }
  },

  sendOtp: async (phone) => {
    try {
      const { data } = await api.post('/auth/send-otp', { phone });
      if (data.success === false) {
        return {
          success: false,
          message: data.message || 'Failed to send OTP',
          error: data.error,
        };
      }
      return {
        success: true,
        message: data.message,
        sessionId: data.sessionId,
        otp: data.otp,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP',
        error: error.response?.data?.error,
      };
    }
  },

  verifyOtp: async (phone, otp, sessionId) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp, sessionId });
      if (data.success === false) {
        return {
          success: false,
          message: data.message || 'OTP verification failed',
          error: data.error,
          attemptsRemaining: data.attemptsRemaining,
        };
      }
      return {
        success: true,
        token: data.token,
        user: normalizeAuthUser(data.user),
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed',
        attemptsRemaining: error.response?.data?.attemptsRemaining,
        error: error.response?.data?.error,
      };
    }
  },

  // ACs - Public endpoints
  getACs: async (filters = {}) => {
    try {
      const params = buildPublicAcsParams(filters);
      const body = await getPublicCatalogBody(params);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to fetch ACs',
          data: [],
        };
      }
      const list = normalizeProductListFromBody(body);
      return {
        success: true,
        data: list,
        total: body.total,
        page: body.page,
        limit: body.limit,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch ACs',
        data: [],
      };
    }
  },

  getACById: async (id) => {
    try {
      const body = await getPublicProductByIdBody(id);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'AC not found',
          data: null,
        };
      }
      return {
        success: true,
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'AC not found',
        data: null,
      };
    }
  },

  // Rental Inquiry - Public endpoint
  createRentalInquiry: async (acId, inquiryData) => {
    try {
      const dataToSend = buildRentalInquiryPayload(inquiryData);
      const { data: body } = await api.post(`/acs/${encodeURIComponent(acId)}/inquiry`, dataToSend);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to submit inquiry',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Rental inquiry submitted successfully',
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit inquiry',
      };
    }
  },

  createProductInquiry: async (productId, productType, inquiryData) => {
    try {
      const dataToSend = {
        ...buildRentalInquiryPayload(inquiryData),
        productId,
      };
      const { data: body } = await api.post(
        `/acs/${encodeURIComponent(productId)}/inquiry`,
        dataToSend
      );
      if (body && body.success === false) {
        return {
          success: false,
          message: body.message || 'Failed to submit inquiry',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body?.message || 'Rental inquiry submitted successfully',
        data: body?.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit inquiry',
        error: error.response?.data?.error,
      };
    }
  },

  // Intentionally not implementing POST /service-requests here.
  // The app uses /service-bookings for user service flows. Add this when the UI needs it.

  // Lead Capture - Public endpoint
  createLead: async (leadData) => {
    try {
      const response = await api.post('/leads', leadData);
      return {
        success: true,
        message: response.data.message || 'Thank you! We will contact you soon.',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit lead',
      };
    }
  },

  // Contact Form - Public endpoint
  submitContactForm: async (formData) => {
    try {
      const response = await api.post('/contact', formData);
      return {
        success: true,
        message: response.data.message || 'Message sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
      };
    }
  },

  // Vendor Listing Request - Public endpoint
  submitVendorListingRequest: async (vendorData) => {
    try {
      const { data: body } = await api.post('/vendor-listing-request', vendorData);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to submit request',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Request submitted successfully. We will contact you soon.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit request',
        error: error.response?.data?.error,
      };
    }
  },

  // Admin - AC Management
  getAdminACs: async () => {
    try {
      const response = await getAdminCatalogListResponse();
      const body = response.data;
      let list = normalizeProductListFromBody(body);
      if (!list.length && Array.isArray(body?.data)) {
        list = body.data;
      }
      return {
        success: true,
        data: list,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch ACs',
        data: [],
      };
    }
  },

  addAC: async (acData) => {
    try {
      const dataToSend = buildAdminProductPayload({ ...acData, category: acData.category || 'AC' });
      const { data: body } = await postAdminCatalog(dataToSend);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to add AC',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'AC added successfully',
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add AC',
        error: error.response?.data?.error,
      };
    }
  },

  // Unified Product Management — same catalog as POST /admin/acs (per API reference)
  addProduct: async (productData) => {
    try {
      const dataToSend = buildAdminProductPayload(productData);
      const { data: body } = await postAdminCatalog(dataToSend);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to add product',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Product added successfully',
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add product',
        error: error.response?.data?.error,
      };
    }
  },

  /** Public catalog: GET /products (falls back to GET /acs). Same Product shape. */
  getProducts: async (filters = {}) => {
    try {
      const params = buildPublicAcsParams(filters);
      const body = await getPublicCatalogBody(params);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to fetch products',
          data: [],
        };
      }
      const list = normalizeProductListFromBody(body);
      return {
        success: true,
        data: list,
        total: body.total,
        page: body.page,
        limit: body.limit,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch products',
        data: [],
      };
    }
  },

  /**
   * Related / recommended rows on product detail: same category, prefer same brand,
   * fall back to category-only then unfiltered (same query params as public catalog).
   */
  getRecommendedProducts: async ({ category, brand, excludeId, limit = 24 }) => {
    const ex = excludeId != null ? String(excludeId) : '';
    const collected = [];
    const seen = new Set();
    const add = (rows) => {
      for (const p of rows) {
        const id = String(p?._id ?? p?.id ?? '');
        if (!id || id === ex || seen.has(id)) continue;
        seen.add(id);
        collected.push(p);
      }
    };
    try {
      if (category && brand) {
        const body = await getPublicCatalogBody(
          buildPublicAcsParams({ category, brand, limit })
        );
        if (!apiEnvelopeFailed(body)) add(normalizeProductListFromBody(body));
      }
      if (collected.length < 4 && category) {
        const body = await getPublicCatalogBody(buildPublicAcsParams({ category, limit }));
        if (!apiEnvelopeFailed(body)) add(normalizeProductListFromBody(body));
      }
      if (collected.length < 2) {
        const body = await getPublicCatalogBody({ limit });
        if (!apiEnvelopeFailed(body)) add(normalizeProductListFromBody(body));
      }
      return { success: true, data: collected.slice(0, 8) };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load recommendations',
      };
    }
  },

  getProductById: async (id, productType) => {
    try {
      const body = await getPublicProductByIdBody(id);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Product not found',
          data: null,
        };
      }
      return {
        success: true,
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Product not found',
        data: null,
      };
    }
  },

  updateAC: async (id, acData) => {
    try {
      // Check if acData.images contains File objects (new files to upload)
      // vs URL strings (existing images to preserve)
      const hasNewFiles = acData.images &&
        Array.isArray(acData.images) &&
        acData.images.length > 0 &&
        acData.images[0] instanceof File;

      let imageUrls = [];

      // Only upload to Cloudinary if we have new File objects
      if (hasNewFiles) {
        const uploadedUrls = await uploadMultipleFilesToCloudinary(acData.images);
        if (uploadedUrls.length === 0) {
          return {
            success: false,
            message: 'Failed to upload images. Please try again.',
          };
        }
        // Combine existing images with newly uploaded ones
        imageUrls = [...(acData.existingImages || []), ...uploadedUrls];
      } else if (acData.images && Array.isArray(acData.images) && acData.images.length > 0) {
        // If images is an array of URLs (strings), use them directly
        imageUrls = acData.images;
      } else if (acData.existingImages && Array.isArray(acData.existingImages)) {
        // If we have existing images to preserve, use them
        imageUrls = acData.existingImages;
      }

      // Send data with image URLs to backend
      // Only send fields that are provided (for partial updates)
      const dataToSend = {};

      if (acData.brand !== undefined) dataToSend.brand = acData.brand;
      if (acData.model !== undefined) dataToSend.model = acData.model;
      if (acData.capacity !== undefined) dataToSend.capacity = acData.capacity;
      if (acData.type !== undefined) dataToSend.type = acData.type;
      if (acData.description !== undefined) dataToSend.description = acData.description;
      if (acData.location !== undefined) dataToSend.location = acData.location;
      if (acData.status !== undefined) dataToSend.status = acData.status;
      if (acData.name !== undefined) dataToSend.name = acData.name;
      if (acData.category !== undefined) dataToSend.category = acData.category;
      if (acData.price !== undefined) {
        dataToSend.price = normalizeRentalPriceForApi(acData.price);
      }
      if (acData.condition !== undefined) {
        const c = normalizeConditionForApi(acData.condition);
        if (c) dataToSend.condition = c;
      }
      if (acData.discount !== undefined && acData.discount !== '') {
        const d = Number(acData.discount);
        if (!Number.isNaN(d)) dataToSend.discount = d;
      }
      if (acData.features !== undefined) {
        if (typeof acData.features === 'object' && !Array.isArray(acData.features)) {
          dataToSend.features = acData.features;
        } else if (Array.isArray(acData.features)) {
          dataToSend.features = acData.features.length ? { specs: acData.features } : { specs: [] };
        }
      }
      if (acData.benefits !== undefined) dataToSend.benefits = acData.benefits;
      if (acData.monthlyPaymentEnabled === true || acData.monthlyPaymentEnabled === false) {
        dataToSend.monthlyPaymentEnabled = acData.monthlyPaymentEnabled;
      }
      if (acData.monthlyPrice !== undefined && acData.monthlyPrice !== '') {
        const mp = Number(acData.monthlyPrice);
        if (!Number.isNaN(mp)) dataToSend.monthlyPrice = mp;
      }
      if (acData.securityDeposit !== undefined && acData.securityDeposit !== '') {
        const sd = Number(acData.securityDeposit);
        if (!Number.isNaN(sd)) dataToSend.securityDeposit = sd;
      }

      // Only include images if we explicitly have images to send
      // If images is undefined, don't send it (backend will preserve existing)
      if (acData.images !== undefined) {
        // If images is explicitly set (even if empty array), send it
        dataToSend.images = imageUrls;
      }
      // If images is undefined, don't include it in dataToSend (backend preserves existing)

      const { data: body } = await patchAdminCatalog(id, dataToSend);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to update AC',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'AC updated successfully',
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update AC',
        error: error.response?.data?.error,
      };
    }
  },

  deleteAC: async (id) => {
    try {
      const { data: body } = await deleteAdminCatalog(id);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to delete AC',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'AC deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete AC',
      };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const patch = { ...productData };
      if (productData.price != null) {
        patch.price = normalizeRentalPriceForApi(productData.price);
      }
      if (productData.condition != null) {
        const c = normalizeConditionForApi(productData.condition);
        if (c) patch.condition = c;
      }
      if (productData.productType && !productData.category) {
        patch.category = productTypeToCategory(productData.productType);
        delete patch.productType;
      }
      if (productData.features != null) {
        if (typeof productData.features === 'object' && !Array.isArray(productData.features)) {
          patch.features = productData.features;
        } else if (Array.isArray(productData.features)) {
          patch.features = productData.features.length ? { specs: productData.features } : {};
        }
      }
      if (productData.monthlyPaymentEnabled === true || productData.monthlyPaymentEnabled === false) {
        patch.monthlyPaymentEnabled = productData.monthlyPaymentEnabled;
      }
      if (productData.monthlyPrice != null && productData.monthlyPrice !== '') {
        const mp = Number(productData.monthlyPrice);
        if (!Number.isNaN(mp)) patch.monthlyPrice = mp;
      }
      if (productData.securityDeposit != null && productData.securityDeposit !== '') {
        const sd = Number(productData.securityDeposit);
        if (!Number.isNaN(sd)) patch.securityDeposit = sd;
      }
      if (productData.benefits !== undefined) {
        patch.benefits = productData.benefits;
      }
      const { data: body } = await patchAdminCatalog(id, patch);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to update product',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Product updated successfully',
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product',
      };
    }
  },

  deleteProduct: async (id) => {
    try {
      const { data: body } = await deleteAdminCatalog(id);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to delete product',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Product deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete product',
      };
    }
  },

  // Admin - Service Leads
  getServiceLeads: async () => {
    try {
      const response = await api.get('/admin/service-bookings');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch leads',
        data: [],
      };
    }
  },

  updateLeadStatus: async (leadId, status) => {
    try {
      const response = await api.patch(`/admin/service-bookings/${leadId}`, { status });
      return {
        success: true,
        message: response.data.message || 'Lead status updated',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update lead status',
      };
    }
  },

  // Admin - Rental Inquiries
  getRentalInquiries: async () => {
    try {
      const response = await api.get('/admin/rental-inquiries');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch inquiries',
        data: [],
      };
    }
  },

  updateInquiryStatus: async (inquiryId, status) => {
    try {
      const response = await api.patch(`/admin/rental-inquiries/${inquiryId}`, { status });
      return {
        success: true,
        message: response.data.message || 'Inquiry status updated',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update inquiry status',
      };
    }
  },

  // Admin - Vendor Requests
  getVendorRequests: async () => {
    try {
      const response = await api.get('/admin/vendor-requests');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch vendor requests',
        data: [],
      };
    }
  },

  // Services - Public endpoints
  getServices: async () => {
    try {
      const response = await api.get('/services');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch services',
        data: [],
      };
    }
  },

  // Service Booking - Public endpoint
  createServiceBooking: async (bookingData) => {
    try {
      const response = await api.post('/service-bookings', bookingData);
      return {
        success: true,
        message: response.data.message || 'Service booking submitted successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit booking',
      };
    }
  },

  // Admin - Service Management
  addService: async (serviceData) => {
    try {
      const response = await api.post('/admin/services', serviceData);
      return {
        success: true,
        message: response.data.message || 'Service added successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add service',
      };
    }
  },

  updateService: async (id, serviceData) => {
    try {
      const response = await api.patch(`/admin/services/${id}`, serviceData);
      return {
        success: true,
        message: response.data.message || 'Service updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update service',
      };
    }
  },

  deleteService: async (id) => {
    try {
      const response = await api.delete(`/admin/services/${id}`);
      return {
        success: true,
        message: response.data.message || 'Service deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete service',
      };
    }
  },

  // User Profile & Dashboard (GET/PATCH /api/users/profile)
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile',
        data: null,
      };
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      const response = await api.patch('/users/profile', profileData);
      return {
        success: true,
        message: response.data.message || 'Profile updated successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
      };
    }
  },

  getUserOrders: async (userId, params = {}) => {
    try {
      const { data: body } = await api.get(`/users/${encodeURIComponent(userId)}/orders`, { params });
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to fetch orders',
          data: [],
        };
      }
      const raw = body.data !== undefined ? body.data : body;
      const list = Array.isArray(raw)
        ? raw
        : raw && typeof raw === 'object' && Array.isArray(raw.orders)
          ? raw.orders
          : [];
      return {
        success: true,
        data: list,
        pagination: body.pagination || (raw && raw.pagination),
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch orders',
        data: [],
      };
    }
  },

  /** Lists user orders (backend has no /users/:id/rentals). */
  getUserRentals: async (userId) => {
    return apiService.getUserOrders(userId, { limit: 50 });
  },

  getUserServiceRequests: async () => {
    try {
      const response = await api.get('/users/service-requests');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch service requests',
        data: [],
      };
    }
  },

  getUserWishlist: async () => {
    try {
      const { data: body } = await api.get('/wishlist');
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to fetch wishlist',
          data: [],
        };
      }
      const raw = body.data !== undefined ? body.data : body;
      return {
        success: true,
        data: Array.isArray(raw) ? raw : [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch wishlist',
        data: [],
      };
    }
  },

  /** `GET /api/wishlist/check/:productId` → `{ success, isInWishlist }` */
  checkWishlistProduct: async (productId) => {
    try {
      const { data: body } = await api.get(
        `/wishlist/check/${encodeURIComponent(productId)}`
      );
      if (apiEnvelopeFailed(body)) {
        return { success: false, isInWishlist: false };
      }
      const flag = body.isInWishlist ?? body.data?.isInWishlist;
      return { success: true, isInWishlist: Boolean(flag) };
    } catch (error) {
      return { success: false, isInWishlist: false };
    }
  },

  addToWishlist: async (productId) => {
    try {
      const { data: body } = await api.post('/wishlist', { productId });
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to add to wishlist',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Added to wishlist',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to wishlist',
        error: error.response?.data?.error,
      };
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      const { data: body } = await api.delete(
        `/wishlist/${encodeURIComponent(productId)}`
      );
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to remove from wishlist',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Removed from wishlist',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from wishlist',
      };
    }
  },

  getUserIssues: async () => {
    try {
      const response = await api.get('/tickets');
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch tickets',
        data: [],
      };
    }
  },

  submitUserConcern: async (concernData) => {
    try {
      const type = concernData.type || 'general';
      const categoryMap = {
        general: 'general',
        order: 'billing',
        service: 'service',
        payment: 'billing',
        other: 'other',
      };
      const body = {
        subject: concernData.subject,
        description: concernData.message || concernData.description || '',
        category: categoryMap[type] || 'general',
        priority: concernData.priority || 'medium',
      };
      const response = await api.post('/tickets', body);
      return {
        success: true,
        message: response.data.message || 'Ticket submitted successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit ticket',
      };
    }
  },

  /** No documented user-review list in API reference; returns empty until backend adds one. */
  getUserReviews: async () => {
    return { success: true, data: [] };
  },

  /** No vendor-scoped catalog route in API reference; uses public AC listing. */
  getVendorACs: async () => {
    return apiService.getACs();
  },

  getSettings: async () => {
    const fallback = {
      instantPaymentDiscount: 10,
      advancePaymentDiscount: 5,
      advancePaymentAmount: 500,
    };
    try {
      const { data: body } = await api.get('/settings');
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to load settings',
          data: fallback,
        };
      }
      return {
        success: true,
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load settings',
        data: fallback,
      };
    }
  },

  validateCoupon: async ({ code, orderTotal, userId, items }) => {
    try {
      const { data: body } = await api.post('/coupons/validate', {
        code,
        orderTotal,
        userId,
        items,
      });
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Invalid coupon',
          error: body.error,
        };
      }
      return {
        success: true,
        data: body.data,
        message: body.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid coupon',
        error: error.response?.data?.error,
      };
    }
  },

  getAvailableCoupons: async () => {
    try {
      const { data: body } = await api.get('/coupons/available');
      if (apiEnvelopeFailed(body)) {
        return { success: false, data: [], message: body.message };
      }
      return {
        success: true,
        data: body.data || body,
      };
    } catch (error) {
      return { success: false, data: [], message: error.response?.data?.message };
    }
  },

  getCart: async () => {
    try {
      const { data: body } = await api.get('/users/cart');
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Failed to load cart',
          data: { rentals: [], services: [] },
        };
      }
      return {
        success: true,
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load cart',
        data: { rentals: [], services: [] },
      };
    }
  },

  addCartRental: async ({ productId, quantity = 1, paymentOption = 'payAdvance' }) => {
    try {
      const { data: body } = await api.post('/users/cart/rentals', {
        productId,
        quantity,
        paymentOption,
      });
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Could not add to cart',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Added to cart',
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Could not add to cart',
        error: error.response?.data?.error,
      };
    }
  },

  addCartService: async ({ serviceId, bookingDetails }) => {
    try {
      const { data: body } = await api.post('/users/cart/services', {
        serviceId,
        bookingDetails: normalizeCartServiceBookingDetails(bookingDetails),
      });
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Could not add service to cart',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Added to cart',
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Could not add service to cart',
      };
    }
  },

  updateCartItem: async (itemId, body) => {
    try {
      const response = await api.patch(`/users/cart/${itemId}`, body);
      return {
        success: true,
        message: response.data.message,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  },

  removeCartItem: async (itemId) => {
    try {
      const response = await api.delete(`/users/cart/${itemId}`);
      return {
        success: true,
        message: response.data.message || 'Removed',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Remove failed',
      };
    }
  },

  clearCart: async () => {
    try {
      const response = await api.delete('/users/cart');
      return {
        success: true,
        message: response.data.message || 'Cart cleared',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Clear cart failed',
      };
    }
  },

  createOrder: async (orderPayload) => {
    try {
      const payload =
        orderPayload && Array.isArray(orderPayload.items)
          ? {
              ...orderPayload,
              items: orderPayload.items.map((item) =>
                item?.type === 'service' && item.bookingDetails
                  ? {
                      ...item,
                      bookingDetails: normalizeCartServiceBookingDetails(item.bookingDetails),
                    }
                  : item
              ),
            }
          : orderPayload;
      const { data: body } = await api.post('/users/orders', payload);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Order failed',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message || 'Order created',
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Order failed',
        error: error.response?.data?.error,
      };
    }
  },

  getOrderById: async (orderId) => {
    try {
      const { data: body } = await api.get(`/users/orders/${encodeURIComponent(orderId)}`);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Order not found',
          data: null,
        };
      }
      const inner = body.data !== undefined ? body.data : body;
      if (inner == null) {
        return {
          success: false,
          message: 'Order not found',
          data: null,
        };
      }
      const orderDoc =
        inner.order && typeof inner.order === 'object' ? inner.order : inner;
      return {
        success: true,
        data: orderDoc,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Order not found',
        data: null,
      };
    }
  },

  cancelOrder: async (orderId, cancellationReason) => {
    try {
      const { data: body } = await api.patch(
        `/users/orders/${encodeURIComponent(orderId)}/cancel`,
        { cancellationReason }
      );
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Cancel failed',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message,
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Cancel failed',
      };
    }
  },

  getOrderRefundStatus: async (orderId) => {
    try {
      const response = await api.get(
        `/users/orders/${encodeURIComponent(orderId)}/refund-status`
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Refund status unavailable',
        data: null,
      };
    }
  },

  createRazorpayPaymentOrder: async (orderId, amount) => {
    try {
      const { data: body } = await api.post('/payments/create-order', { orderId, amount });
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Payment init failed',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message,
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Payment init failed',
        error: error.response?.data?.error,
      };
    }
  },

  verifyRazorpayPayment: async (payload) => {
    try {
      const { data: body } = await api.post('/payments/verify', payload);
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Verification failed',
          error: body.error,
        };
      }
      return {
        success: true,
        message: body.message,
        data: body.data || body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed',
        error: error.response?.data?.error,
      };
    }
  },

  /** Retry checkout: amount in paise */
  createOrderRetryRazorpay: async (orderId, amountPaise) => {
    try {
      const { data: body } = await api.post(
        `/users/orders/${encodeURIComponent(orderId)}/create-razorpay-order`,
        { amount: amountPaise }
      );
      if (apiEnvelopeFailed(body)) {
        return {
          success: false,
          message: body.message || 'Could not create payment',
          error: body.error,
        };
      }
      return {
        success: true,
        data: body.data || body,
        message: body.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Could not create payment',
      };
    }
  },

  verifyOrderGatewayPayment: async (orderId, body) => {
    try {
      const { data: resBody } = await api.post(
        `/users/orders/${encodeURIComponent(orderId)}/verify-payment`,
        body
      );
      if (apiEnvelopeFailed(resBody)) {
        return {
          success: false,
          message: resBody.message || 'Verify failed',
          error: resBody.error,
        };
      }
      return {
        success: true,
        message: resBody.message,
        data: resBody.data || resBody,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verify failed',
      };
    }
  },

  // ——— Admin: settings, orders, coupons, FAQs, tickets, service-requests ———

  getAdminSettings: async () => {
    try {
      const { data: body } = await api.get('/admin/settings');
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, data: null };
      }
      return {
        success: true,
        data: body.data !== undefined ? body.data : body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load settings',
        data: null,
      };
    }
  },

  updateAdminSettings: async (partial) => {
    try {
      const { data: body } = await api.put('/admin/settings', partial);
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, error: body.error };
      }
      return {
        success: true,
        message: body.message,
        data: body.data !== undefined ? body.data : body,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  },

  getAdminOrders: async (params = {}) => {
    try {
      const { data: body } = await api.get('/admin/orders', { params });
      if (apiEnvelopeFailed(body)) {
        return { success: false, data: [], message: body.message, pagination: null };
      }
      const raw = body.data !== undefined ? body.data : body;
      const list = Array.isArray(raw)
        ? raw
        : raw && typeof raw === 'object' && Array.isArray(raw.orders)
          ? raw.orders
          : [];
      return {
        success: true,
        data: list,
        pagination: body.pagination || raw?.pagination,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load orders',
      };
    }
  },

  patchAdminOrderStatus: async (orderId, status) => {
    try {
      const { data: body } = await api.patch(
        `/admin/orders/${encodeURIComponent(orderId)}/status`,
        { status }
      );
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, error: body.error };
      }
      return { success: true, message: body.message, data: body.data || body };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Status update failed',
      };
    }
  },

  patchAdminOrderPaymentStatus: async (orderId, paymentStatus) => {
    try {
      const { data: body } = await api.patch(
        `/admin/orders/${encodeURIComponent(orderId)}/payment-status`,
        { paymentStatus }
      );
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, error: body.error };
      }
      return { success: true, message: body.message, data: body.data || body };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Payment status update failed',
      };
    }
  },

  getAdminCoupons: async () => {
    try {
      const { data: body } = await api.get('/admin/coupons');
      if (apiEnvelopeFailed(body)) {
        return { success: false, data: [], message: body.message };
      }
      const raw = body.data !== undefined ? body.data : body;
      return { success: true, data: Array.isArray(raw) ? raw : [] };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load coupons',
      };
    }
  },

  createAdminCoupon: async (payload) => {
    try {
      const { data: body } = await api.post('/admin/coupons', payload);
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, error: body.error };
      }
      return { success: true, message: body.message, data: body.data || body };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Create failed',
      };
    }
  },

  updateAdminCoupon: async (couponId, payload) => {
    try {
      const { data: body } = await api.put(
        `/admin/coupons/${encodeURIComponent(couponId)}`,
        payload
      );
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, error: body.error };
      }
      return { success: true, message: body.message, data: body.data || body };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  },

  deleteAdminCoupon: async (couponId) => {
    try {
      const { data: body } = await api.delete(
        `/admin/coupons/${encodeURIComponent(couponId)}`
      );
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, error: body.error };
      }
      return { success: true, message: body.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Delete failed',
      };
    }
  },

  createAdminFaq: async (payload) => {
    try {
      const { data: body } = await api.post('/admin/faqs', payload);
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, error: body.error };
      }
      return { success: true, message: body.message, data: body.data || body };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Create failed',
      };
    }
  },

  updateAdminFaq: async (id, payload) => {
    try {
      const { data: body } = await api.patch(
        `/admin/faqs/${encodeURIComponent(id)}`,
        payload
      );
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, error: body.error };
      }
      return { success: true, message: body.message, data: body.data || body };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  },

  deleteAdminFaq: async (id) => {
    try {
      const { data: body } = await api.delete(`/admin/faqs/${encodeURIComponent(id)}`);
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message, error: body.error };
      }
      return { success: true, message: body.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Delete failed',
      };
    }
  },

  getAdminTickets: async () => {
    try {
      const { data: body } = await api.get('/admin/tickets');
      if (apiEnvelopeFailed(body)) {
        return { success: false, data: [], message: body.message };
      }
      const raw = body.data !== undefined ? body.data : body;
      return { success: true, data: Array.isArray(raw) ? raw : [] };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load tickets',
      };
    }
  },

  patchAdminTicketStatus: async (ticketId, status) => {
    try {
      const { data: body } = await api.patch(
        `/admin/tickets/${encodeURIComponent(ticketId)}/status`,
        { status }
      );
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message };
      }
      return { success: true, message: body.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  },

  getAdminServiceRequestsList: async () => {
    try {
      const { data: body } = await api.get('/admin/service-requests');
      if (apiEnvelopeFailed(body)) {
        return { success: false, data: [], message: body.message };
      }
      const raw = body.data !== undefined ? body.data : body;
      return { success: true, data: Array.isArray(raw) ? raw : [] };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load requests',
      };
    }
  },

  patchAdminServiceRequest: async (requestId, patch) => {
    try {
      const { data: body } = await api.patch(
        `/admin/service-requests/${encodeURIComponent(requestId)}`,
        patch
      );
      if (apiEnvelopeFailed(body)) {
        return { success: false, message: body.message };
      }
      return { success: true, message: body.message, data: body.data || body };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  },

  submitReview: async (orderId, reviewData) => {
    try {
      const response = await api.post(`/orders/${orderId}/review`, reviewData);
      return {
        success: true,
        message: response.data.message || 'Review submitted successfully',
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit review',
      };
    }
  },
};

export default api;
