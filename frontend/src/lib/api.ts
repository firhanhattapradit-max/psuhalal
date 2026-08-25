export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Automatic token refresh logic placeholder
  if (response.status === 401 && token) {
    // Attempt refresh logic here...
    // const newToken = await refreshAuthToken();
    // if (newToken) {
    //   headers.set('Authorization', `Bearer ${newToken}`);
    //   response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers });
    // }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    throw new ApiError(errorData.message || 'API request failed', response.status, errorData);
  }

  return response.json();
}

export const apiClient = {
  get: (url: string) => fetchWithAuth(url, { method: 'GET' }),
  post: (url: string, data: any) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url: string, data: any) => fetchWithAuth(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url: string) => fetchWithAuth(url, { method: 'DELETE' }),
};

export const api = {
  auth: {
    login: (data: any) => apiClient.post('/auth/login', data),
    register: (data: any) => apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout', {}),
  },
  vehicles: {
    getByRoute: (routeId: string) => apiClient.get(`/vehicles?route=${routeId}`),
    getById: (id: string) => apiClient.get(`/vehicles/${id}`),
  },
  pois: {
    getNearby: (lat: number, lng: number, radius: number) => apiClient.get(`/pois?lat=${lat}&lng=${lng}&radius=${radius}`),
    getById: (id: string) => apiClient.get(`/pois/${id}`),
    getByCategory: (category: string) => apiClient.get(`/pois?category=${category}`),
  },
  checkin: {
    validate: (qrData: string) => apiClient.post('/checkin/validate', { qrData }),
    submit: (data: any) => apiClient.post('/checkin', data),
  },
  wallet: {
    getBalance: () => apiClient.get('/wallet/balance'),
    getHistory: () => apiClient.get('/wallet/history'),
  },
  quests: {
    getAll: () => apiClient.get('/quests'),
    getProgress: () => apiClient.get('/quests/progress'),
  },
  rewards: {
    getAll: () => apiClient.get('/rewards'),
    redeem: (id: string) => apiClient.post(`/rewards/${id}/redeem`, {}),
  },
  sadaqah: {
    convert: (points: number, charityId: string) => apiClient.post('/sadaqah/convert', { points, charityId }),
    getHistory: () => apiClient.get('/sadaqah/history'),
  },
  payment: {
    initiate: (data: any) => apiClient.post('/payment/initiate', data),
    confirm: (txId: string) => apiClient.post(`/payment/confirm/${txId}`, {}),
    getTicket: (id: string) => apiClient.get(`/tickets/${id}`),
  },
  prayer: {
    getTimes: (lat: number, lng: number, date: string) => apiClient.get(`/prayer/times?lat=${lat}&lng=${lng}&date=${date}`),
    getQibla: (lat: number, lng: number) => apiClient.get(`/prayer/qibla?lat=${lat}&lng=${lng}`),
    checkJourney: (routeId: string, time: string) => apiClient.post('/prayer/check-journey', { routeId, time }),
  },
};
