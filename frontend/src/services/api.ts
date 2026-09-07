import type {
  Crop,
  DiseaseDiagnosis,
  DroneFlight,
  DroneScan,
  FarmPlot,
  GDDCalculation,
  KCCReport,
  KhataSummary,
  KhataTransaction,
  LaborRecord,
  MandiRate,
  UserProfile,
  WeatherAdvisory,
} from './types';

const API_BASE = '/api/v1';

// Token Management
export const getAccessToken = () => localStorage.getItem('krishi_access_token');
export const getRefreshToken = () => localStorage.getItem('krishi_refresh_token');
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('krishi_access_token', access);
  localStorage.setItem('krishi_refresh_token', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('krishi_access_token');
  localStorage.removeItem('krishi_refresh_token');
};

async function customFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Attempt refresh on 401
  if (response.status === 401 && getRefreshToken()) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: getRefreshToken() }),
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        localStorage.setItem('krishi_access_token', refreshData.access_token);
        headers['Authorization'] = `Bearer ${refreshData.access_token}`;
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        clearTokens();
      }
    } catch {
      clearTokens();
    }
  }

  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const err = await response.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  signup: (data: any) => customFetch<any>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => customFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => customFetch<UserProfile>('/auth/me'),

  // Plots & Crops
  getPlots: () => customFetch<FarmPlot[]>('/crops/plots'),
  createPlot: (data: any) => customFetch<FarmPlot>('/crops/plots', { method: 'POST', body: JSON.stringify(data) }),
  getCrops: () => customFetch<Crop[]>('/crops'),
  createCrop: (data: any) => customFetch<Crop>('/crops', { method: 'POST', body: JSON.stringify(data) }),
  calculateGDD: (cropId: string) => customFetch<GDDCalculation>(`/crops/${cropId}/calculate-gdd`, { method: 'POST' }),

  // Khata & Labor
  getTransactions: (cropId?: string, type?: string) => {
    const params = new URLSearchParams();
    if (cropId) params.append('crop_id', cropId);
    if (type) params.append('transaction_type', type);
    return customFetch<KhataTransaction[]>(`/khata/transactions?${params.toString()}`);
  },
  createTransaction: (data: any) => customFetch<KhataTransaction>('/khata/transactions', { method: 'POST', body: JSON.stringify(data) }),
  getSummary: (cropId?: string) => {
    const query = cropId ? `?crop_id=${cropId}` : '';
    return customFetch<KhataSummary>(`/khata/summary${query}`);
  },
  getLabor: (cropId?: string) => {
    const query = cropId ? `?crop_id=${cropId}` : '';
    return customFetch<LaborRecord[]>(`/khata/labor${query}`);
  },
  createLabor: (data: any) => customFetch<LaborRecord>('/khata/labor', { method: 'POST', body: JSON.stringify(data) }),
  updateLabor: (id: string, data: any) => customFetch<LaborRecord>(`/khata/labor/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getKCCReport: (cropId: string) => customFetch<KCCReport>(`/khata/kcc-report/${cropId}`),

  // Drone Ingestion & AI
  getFlights: () => customFetch<DroneFlight[]>('/drone/flights'),
  startFlight: (data: any) => customFetch<DroneFlight>('/drone/flights/start', { method: 'POST', body: JSON.stringify(data) }),
  endFlight: (flightId: string) => customFetch<DroneFlight>(`/drone/flights/${flightId}/end`, { method: 'POST' }),
  ingestFrame: (formData: FormData) => customFetch<{ scan: DroneScan; diagnosis: DiseaseDiagnosis }>('/drone/ingest', { method: 'POST', body: formData }),
  getScans: (cropId: string) => customFetch<DroneScan[]>(`/drone/scans/${cropId}`),

  // Market & Weather
  getMandiPrices: (commodity?: string, state?: string, district?: string) => {
    const params = new URLSearchParams();
    if (commodity) params.append('commodity', commodity);
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    return customFetch<{ total_records: number; rates: MandiRate[] }>(`/market/prices?${params.toString()}`);
  },
  getWeatherAdvisory: (lat: number = 21.1458, lon: number = 79.0882) =>
    customFetch<WeatherAdvisory>(`/weather/forecast?latitude=${lat}&longitude=${lon}`),
};
