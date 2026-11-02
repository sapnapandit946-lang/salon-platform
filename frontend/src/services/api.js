import {
  SERVICE_CATEGORIES,
  POPULAR_SERVICES,
  AI_STYLES,
  mockSearchSalons,
  mockGetSalonById,
  mockToggleFavourite,
  mockGetMyFavourites,
  mockGetComparison,
  mockGetSlots,
  mockCreateBooking,
  mockGetMyBookings,
  mockCancelBooking,
  mockSubmitReview,
  mockOwnerGetMySalon,
  mockOwnerGetServices,
  mockOwnerAddService,
  mockOwnerUpdateService,
  mockOwnerDeleteService,
  mockOwnerGetBookings,
  mockOwnerUpdateBookingStatus,
  mockOwnerGetStats,
  mockAITransform,
  mockAuthLogin,
  mockAuthRegister
} from './mockData.js';

const API_BASE = import.meta.env?.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

// Global state tracking whether backend server is connected
let isBackendLive = null;
const listeners = new Set();

export function subscribeBackendStatus(listener) {
  listeners.add(listener);
  if (isBackendLive !== null) listener(isBackendLive);
  return () => listeners.delete(listener);
}

function updateBackendStatus(status) {
  if (isBackendLive !== status) {
    isBackendLive = status;
    listeners.forEach((fn) => fn(status));
  }
}

function getAuthHeader() {
  const token = localStorage.getItem('salon_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}, fallbackFn = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  let networkFailed = false;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    networkFailed = true;
  }

  // If network failed completely or Vite returned 502/503/504 (FastAPI backend is offline)
  const isServerUnreachable = networkFailed || (response && (response.status === 502 || response.status === 503 || response.status === 504));

  if (isServerUnreachable) {
    updateBackendStatus(false);
    if (fallbackFn) {
      console.info(`[GlamGuide] FastAPI backend offline on port 8000. Serving demo data for: ${endpoint}`);
      return await fallbackFn();
    }
    throw new Error(
      'Backend server is unreachable (HTTP 502 Bad Gateway). Please ensure the FastAPI backend is running on port 8000.'
    );
  }

  updateBackendStatus(true);

  if (response.status === 401) {
    localStorage.removeItem('salon_auth_token');
    localStorage.removeItem('salon_user_data');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map((err) => err.msg || JSON.stringify(err)).join(', ');
      }
    } else if (data?.message) {
      errorMsg = data.message;
    }
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  auth: {
    login: (credentials) =>
      request(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(credentials) },
        () => mockAuthLogin(credentials)
      ),
    register: (userData) =>
      request(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(userData) },
        () => mockAuthRegister(userData)
      ),
    getMe: () =>
      request('/auth/me', {}, () => {
        const stored = localStorage.getItem('salon_user_data');
        if (stored) return JSON.parse(stored);
        return {
          id: 1,
          email: 'rahul.verma@example.com',
          full_name: 'Rahul Verma',
          phone: '+91 9769012345',
          role: 'CUSTOMER',
          is_active: true,
          created_at: new Date().toISOString()
        };
      }),
    updateProfile: (profileData) =>
      request('/auth/me', { method: 'PUT', body: JSON.stringify(profileData) }, () => {
        const stored = localStorage.getItem('salon_user_data');
        const user = stored ? JSON.parse(stored) : {};
        const updated = { ...user, ...profileData };
        localStorage.setItem('salon_user_data', JSON.stringify(updated));
        return updated;
      }),
  },
  salons: {
    getAll: (params = {}) => {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      );
      const queryStr = new URLSearchParams(cleanParams).toString();
      return request(
        `/salons${queryStr ? `?${queryStr}` : ''}`,
        {},
        () => mockSearchSalons(params)
      );
    },
    getById: (id) =>
      request(`/salons/${id}`, {}, () => mockGetSalonById(id)),
    toggleFavourite: (id) =>
      request(
        `/salons/${id}/favourite`,
        { method: 'POST' },
        () => mockToggleFavourite(id)
      ),
    getMyFavourites: () =>
      request('/salons/favourites/my', {}, () => mockGetMyFavourites()),
  },
  services: {
    getCategories: () =>
      request('/services/categories', {}, () => SERVICE_CATEGORIES),
    getPopular: () =>
      request('/services/popular', {}, () => POPULAR_SERVICES),
  },
  compare: {
    getComparison: (payload) =>
      request(
        '/compare',
        { method: 'POST', body: JSON.stringify(payload) },
        () => mockGetComparison(payload)
      ),
  },
  bookings: {
    getSlots: (salonId, serviceId, dateStr) =>
      request(
        `/bookings/slots?salon_id=${salonId}&service_id=${serviceId}&booking_date=${dateStr}`,
        {},
        () => mockGetSlots(salonId, serviceId, dateStr)
      ),
    create: (payload) =>
      request(
        '/bookings',
        { method: 'POST', body: JSON.stringify(payload) },
        () => mockCreateBooking(payload)
      ),
    getMy: () =>
      request('/bookings/my', {}, () => mockGetMyBookings()),
    cancel: (id, reason) =>
      request(
        `/bookings/${id}/cancel?reason=${encodeURIComponent(reason || 'Cancelled by customer')}`,
        { method: 'PUT' },
        () => mockCancelBooking(id, reason)
      ),
  },
  reviews: {
    submit: (payload) =>
      request(
        '/reviews',
        { method: 'POST', body: JSON.stringify(payload) },
        () => mockSubmitReview(payload)
      ),
  },
  owner: {
    getMySalon: () =>
      request('/owner/my-salon', {}, () => mockOwnerGetMySalon()),
    createSalon: (payload) =>
      request(
        '/owner/my-salon',
        { method: 'POST', body: JSON.stringify(payload) },
        () => mockOwnerAddService(payload)
      ),
    updateSalon: (payload) =>
      request(
        '/owner/my-salon',
        { method: 'PUT', body: JSON.stringify(payload) },
        () => ({ status: 'updated' })
      ),
    getServices: () =>
      request('/owner/services', {}, () => mockOwnerGetServices()),
    addService: (payload) =>
      request(
        '/owner/services',
        { method: 'POST', body: JSON.stringify(payload) },
        () => mockOwnerAddService(payload)
      ),
    updateService: (id, payload) =>
      request(
        `/owner/services/${id}`,
        { method: 'PUT', body: JSON.stringify(payload) },
        () => mockOwnerUpdateService(id, payload)
      ),
    deleteService: (id) =>
      request(
        `/owner/services/${id}`,
        { method: 'DELETE' },
        () => mockOwnerDeleteService(id)
      ),
    updateSchedules: (payload) =>
      request(
        '/owner/schedules',
        { method: 'PUT', body: JSON.stringify(payload) },
        () => ({ status: 'schedules_updated' })
      ),
    getBookings: (status) =>
      request(
        `/owner/bookings${status ? `?status_filter=${status}` : ''}`,
        {},
        () => mockOwnerGetBookings(status)
      ),
    updateBookingStatus: (id, payload) =>
      request(
        `/owner/bookings/${id}/status`,
        { method: 'PUT', body: JSON.stringify(payload) },
        () => mockOwnerUpdateBookingStatus(id, payload)
      ),
    getStats: () =>
      request('/owner/stats', {}, () => mockOwnerGetStats()),
  },
  ai: {
    getStyles: () =>
      request('/ai-preview/styles', {}, () => AI_STYLES),
    transform: (formData) =>
      request(
        '/ai-preview/transform',
        { method: 'POST', body: formData },
        () => mockAITransform(formData)
      ),
  }
};
