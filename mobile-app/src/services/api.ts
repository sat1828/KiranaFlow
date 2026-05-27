import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'kiranaflow_tokens';

const API_BASE = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.kiranaflow.app/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenPromise: Promise<void> | null = null;

async function loadTokens() {
  if (tokenPromise) return tokenPromise;
  tokenPromise = (async () => {
    try {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (stored) {
        const { access, refresh } = JSON.parse(stored);
        accessToken = access;
        refreshToken = refresh;
      }
    } catch {}
  })();
  return tokenPromise;
}

loadTokens();

export async function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify({ access, refresh }));
  } catch {}
}

export async function clearTokens() {
  accessToken = null;
  refreshToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {}
}

export function getAccessToken() {
  return accessToken;
}

export async function apiRequest<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    let response = await fetch(`${API_BASE}${endpoint}`, config);

    if (response.status === 401 && refreshToken) {
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const tokens = await refreshResponse.json();
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        requestHeaders['Authorization'] = `Bearer ${accessToken}`;
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...config,
          headers: requestHeaders,
        });
      } else {
        clearTokens();
        throw new Error('SESSION_EXPIRED');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.message === 'SESSION_EXPIRED') {
      throw error;
    }
    if (error.name === 'TypeError' && error.message.includes('Network')) {
      throw new Error('NETWORK_ERROR');
    }
    throw error;
  }
}

export const api = {
  auth: {
    sendOtp: (phone: string) =>
      apiRequest('/auth/send-otp', { method: 'POST', body: { phone } }),
    verifyOtp: (phone: string, otp: string, name?: string, role?: string) =>
      apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: { phone, otp, name, role },
      }),
    refresh: (token: string) =>
      apiRequest('/auth/refresh', { method: 'POST', body: { refreshToken: token } }),
    logout: (token: string) =>
      apiRequest('/auth/logout', { method: 'POST', body: { refreshToken: token } }),
  },

  store: {
    getProfile: () => apiRequest('/store/profile'),
    updateProfile: (data: any) =>
      apiRequest('/store/profile', { method: 'PUT', body: data }),
    getDashboard: () => apiRequest('/store/dashboard'),
    getAnalytics: (startDate?: string, endDate?: string) =>
      apiRequest(`/store/analytics?startDate=${startDate || ''}&endDate=${endDate || ''}`),
  },

  orders: {
    list: (params?: string) => apiRequest(`/orders?${params || ''}`),
    getPending: () => apiRequest('/orders/pending'),
    get: (id: string) => apiRequest(`/orders/${id}`),
    create: (data: any) => apiRequest('/orders', { method: 'POST', body: data }),
    updateStatus: (id: string, status: string, reason?: string) =>
      apiRequest(`/orders/${id}/status`, {
        method: 'PUT',
        body: { status, cancellationReason: reason },
      }),
    assign: (id: string, driverId: string, batchId?: string) =>
      apiRequest(`/orders/${id}/assign`, {
        method: 'POST',
        body: { driverId, batchId },
      }),
  },

  drivers: {
    list: () => apiRequest('/drivers'),
    create: (data: any) => apiRequest('/drivers', { method: 'POST', body: data }),
    update: (id: string, data: any) =>
      apiRequest(`/drivers/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiRequest(`/drivers/${id}`, { method: 'DELETE' }),
    toggleDuty: (id: string) => apiRequest(`/drivers/${id}/duty`, { method: 'PUT' }),
    getLocation: (id: string) => apiRequest(`/drivers/${id}/location`),
    getHistory: (id: string) => apiRequest(`/drivers/${id}/history`),
  },

  routes: {
    optimize: (orderIds: string[], driverId: string) =>
      apiRequest('/routes/optimize', {
        method: 'POST',
        body: { orderIds, driverId },
      }),
    getBatches: () => apiRequest('/routes/batches'),
    getBatch: (id: string) => apiRequest(`/routes/batches/${id}`),
    startBatch: (id: string) => apiRequest(`/routes/batches/${id}/start`, { method: 'PUT' }),
  },

  inventory: {
    list: (params?: string) => apiRequest(`/inventory?${params || ''}`),
    getLowStock: () => apiRequest('/inventory/low-stock'),
    create: (data: any) => apiRequest('/inventory', { method: 'POST', body: data }),
    update: (id: string, data: any) =>
      apiRequest(`/inventory/${id}`, { method: 'PUT', body: data }),
    bulkUpdate: (items: any[]) =>
      apiRequest('/inventory/bulk-update', { method: 'POST', body: { items } }),
  },

  ai: {
    runForecast: () => apiRequest('/ai/forecast', { method: 'POST' }),
    getForecast: () => apiRequest('/ai/forecast/latest'),
    getInsights: () => apiRequest('/ai/insights'),
    chat: (message: string) =>
      apiRequest('/ai/chat', { method: 'POST', body: { message } }),
  },

  reports: {
    getDaily: () => apiRequest('/reports/daily'),
    getWeekly: () => apiRequest('/reports/weekly'),
    getDriverReport: (id: string) => apiRequest(`/reports/driver/${id}`),
    generate: () => apiRequest('/reports/generate', { method: 'POST' }),
  },

  driver: {
    getMyOrders: () => apiRequest('/drivers/me/orders'),
    updateLocation: (latitude: number, longitude: number, heading?: number, speed?: number, batchId?: string) =>
      apiRequest('/drivers/me/location', {
        method: 'PUT',
        body: { latitude, longitude, heading, speed, batchId },
      }),
    markDelivered: (driverId: string, orderId: string, proofUrl?: string) =>
      apiRequest(`/drivers/${driverId}/deliver/${orderId}`, {
        method: 'PUT',
        body: { proofOfDeliveryUrl: proofUrl },
      }),
  },
};
