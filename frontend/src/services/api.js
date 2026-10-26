const API_BASE = '/api/v1';

function getAuthHeader() {
  const token = localStorage.getItem('salon_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear local credentials
    localStorage.removeItem('salon_auth_token');
    localStorage.removeItem('salon_user_data');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || `HTTP Error ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
    updateProfile: (profileData) => request('/auth/me', { method: 'PUT', body: JSON.stringify(profileData) }),
  },
  salons: {
    getAll: (params = {}) => {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );
      const queryStr = new URLSearchParams(cleanParams).toString();
      return request(`/salons${queryStr ? `?${queryStr}` : ''}`);
    },
    getById: (id) => request(`/salons/${id}`),
    toggleFavourite: (id) => request(`/salons/${id}/favourite`, { method: 'POST' }),
    getMyFavourites: () => request('/salons/favourites/my'),
  },
  services: {
    getCategories: () => request('/services/categories'),
    getPopular: () => request('/services/popular'),
  },
  compare: {
    getComparison: (payload) => request('/compare', { method: 'POST', body: JSON.stringify(payload) }),
  },
  bookings: {
    getSlots: (salonId, serviceId, dateStr) =>
      request(`/bookings/slots?salon_id=${salonId}&service_id=${serviceId}&booking_date=${dateStr}`),
    create: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
    getMy: () => request('/bookings/my'),
    cancel: (id, reason) => request(`/bookings/${id}/cancel?reason=${encodeURIComponent(reason || 'Cancelled by customer')}`, { method: 'PUT' }),
  },
  reviews: {
    submit: (payload) => request('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  },
  owner: {
    getMySalon: () => request('/owner/my-salon'),
    createSalon: (payload) => request('/owner/my-salon', { method: 'POST', body: JSON.stringify(payload) }),
    updateSalon: (payload) => request('/owner/my-salon', { method: 'PUT', body: JSON.stringify(payload) }),
    getServices: () => request('/owner/services'),
    addService: (payload) => request('/owner/services', { method: 'POST', body: JSON.stringify(payload) }),
    updateService: (id, payload) => request(`/owner/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteService: (id) => request(`/owner/services/${id}`, { method: 'DELETE' }),
    updateSchedules: (payload) => request('/owner/schedules', { method: 'PUT', body: JSON.stringify(payload) }),
    getBookings: (status) => request(`/owner/bookings${status ? `?status_filter=${status}` : ''}`),
    updateBookingStatus: (id, payload) => request(`/owner/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
    getStats: () => request('/owner/stats'),
  },
  ai: {
    getStyles: () => request('/ai-preview/styles'),
    transform: (formData) => request('/ai-preview/transform', { method: 'POST', body: formData }),
  }
};
