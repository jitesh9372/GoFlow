import {
  Station,
  TransitLine,
  CrowdReading,
  CrowdReport,
  RouteOption,
  TransitNotification,
  UserProfile,
  CrowdAnalytics,
  UserRole,
  TransportMode
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;
  private mockRole: UserRole | null = null;

  setToken(token: string | null, _mockRole: UserRole | null = null) {
    this.token = token;
    this.mockRole = null; // Do not use client-side role override header
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = { error: response.statusText };
        }
        throw new Error(errData.error || errData.message || `Request failed (${response.status})`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[API] ${options.method || 'GET'} ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // --- Auth & Profiles ---
  async register(data: { email: string; password: string; displayName?: string; role?: UserRole }) {
    return this.request<{ success: boolean; user: UserProfile; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMe() {
    return this.request<{ profile: UserProfile; role: UserRole }>('/auth/me');
  }

  async checkRegistered(email: string) {
    return this.request<{ registered: boolean; role: UserRole | null }>(
      `/auth/check-registered?email=${encodeURIComponent(email)}`
    );
  }

  async login(email: string, pass: string) {
    return this.request<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
  }

  async demoLogin(role: UserRole) {
    return this.request<{ token: string; user: UserProfile }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  }

  async setRole(uid: string, role: UserRole) {
    return this.request<{ success: boolean; profile: UserProfile }>('/auth/set-role', {
      method: 'POST',
      body: JSON.stringify({ uid, role })
    });
  }

  async getProfile() {
    return this.request<{ profile: UserProfile }>('/auth/profile');
  }

  async saveRoute(route: {
    fromStationId: string;
    fromStationName: string;
    toStationId: string;
    toStationName: string;
    preferredMode?: TransportMode;
  }) {
    return this.request<{ profile: UserProfile }>('/auth/saved-routes', {
      method: 'POST',
      body: JSON.stringify(route)
    });
  }

  async deleteSavedRoute(routeId: string) {
    return this.request<{ profile: UserProfile }>(`/auth/saved-routes/${routeId}`, {
      method: 'DELETE'
    });
  }

  // --- Transport Lines & Stations ---
  async getLines() {
    return this.request<{ lines: TransitLine[] }>('/transport/lines');
  }

  async createLine(line: Partial<TransitLine>) {
    return this.request<{ line: TransitLine }>('/transport/lines', {
      method: 'POST',
      body: JSON.stringify(line)
    });
  }

  async updateLine(id: string, updates: Partial<TransitLine>) {
    return this.request<{ line: TransitLine }>(`/transport/lines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteLine(id: string) {
    return this.request<{ success: boolean }>(`/transport/lines/${id}`, {
      method: 'DELETE'
    });
  }

  async getStations(params?: { mode?: string; lineId?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.mode) searchParams.append('mode', params.mode);
    if (params?.lineId) searchParams.append('lineId', params.lineId);
    if (params?.search) searchParams.append('search', params.search);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ stations: Station[] }>(`/transport/stations${qs}`);
  }

  async createStation(station: Partial<Station>) {
    return this.request<{ station: Station }>('/transport/stations', {
      method: 'POST',
      body: JSON.stringify(station)
    });
  }

  async updateStation(id: string, updates: Partial<Station>) {
    return this.request<{ station: Station }>(`/transport/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteStation(id: string) {
    return this.request<{ success: boolean }>(`/transport/stations/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Crowd Readings & Analytics ---
  async getCrowdReadings(params?: { stationId?: string; lineId?: string; mode?: string; crowdLevel?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.stationId) searchParams.append('stationId', params.stationId);
    if (params?.lineId) searchParams.append('lineId', params.lineId);
    if (params?.mode) searchParams.append('mode', params.mode);
    if (params?.crowdLevel) searchParams.append('crowdLevel', params.crowdLevel);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ readings: CrowdReading[] }>(`/crowd/readings${qs}`);
  }

  async postCrowdReading(reading: Partial<CrowdReading>) {
    return this.request<{ reading: CrowdReading }>('/crowd/readings', {
      method: 'POST',
      body: JSON.stringify(reading)
    });
  }

  async getAnalytics() {
    return this.request<{ analytics: CrowdAnalytics }>('/crowd/analytics');
  }

  // --- Passenger Reports ---
  async getReports(status?: 'pending' | 'verified' | 'rejected') {
    const qs = status ? `?status=${status}` : '';
    return this.request<{ reports: CrowdReport[] }>(`/reports${qs}`);
  }

  async submitReport(report: {
    stationId: string;
    stationName: string;
    mode: TransportMode;
    lineId?: string;
    crowdLevel: string;
    coachType?: string;
    direction?: string;
    notes?: string;
  }) {
    return this.request<{ report: CrowdReport }>('/reports', {
      method: 'POST',
      body: JSON.stringify(report)
    });
  }

  async reviewReport(id: string, status: 'verified' | 'rejected', reviewNotes?: string) {
    return this.request<{ report: CrowdReport }>(`/reports/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes })
    });
  }

  // --- Routing ---
  async planRoute(fromStationId: string, toStationId: string, modes?: TransportMode[]) {
    return this.request<{
      fromStationId: string;
      toStationId: string;
      count: number;
      routes: RouteOption[];
    }>('/routes/plan', {
      method: 'POST',
      body: JSON.stringify({ fromStationId, toStationId, modes })
    });
  }

  // --- Notifications ---
  async getNotifications(all = false) {
    const qs = all ? '?all=true' : '';
    return this.request<{ notifications: TransitNotification[] }>(`/notifications${qs}`);
  }

  async createNotification(notif: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'alert';
    mode?: TransportMode;
    lineId?: string;
    affectedStations?: string[];
  }) {
    return this.request<{ notification: TransitNotification }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notif)
    });
  }

  async dismissNotification(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE'
    });
  }

  // --- RailRadar Transit API Integration ---
  async searchTrains(query: string) {
    return this.request<{ success: boolean; count: number; trains: any[] }>(
      `/railradar/search?q=${encodeURIComponent(query)}`
    );
  }

  async getLiveTrainStatus(trainNumber: string) {
    return this.request<{ success: boolean; live: any }>(
      `/railradar/live/${encodeURIComponent(trainNumber)}`
    );
  }

  async getTrainsBetween(from: string, to: string) {
    return this.request<any>(
      `/railradar/between?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
  }

  async getPopularMumbaiTrains() {
    return this.request<{ success: boolean; count: number; trains: any[] }>(
      '/railradar/popular'
    );
  }

  async getRailRadarStatus() {
    return this.request<{ success: boolean; status: any }>(
      '/railradar/status'
    );
  }
}

export const api = new ApiClient();
