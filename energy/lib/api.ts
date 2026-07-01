import Cookies from 'js-cookie';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  Dispositivo,
  DispositivoAdmin,
  Medicion,
  EstadisticasDispositivo,
  ConsumoReal,
  ConsumoMesActual,
  HistorialMensual,
  AdoptarDispositivoDto,
  CrearDispositivoDto,
  PersonalizarDispositivoDto,
  ControlResponse,
  StatusResponse,
  AnalisisML,
  MLAnalysisResponse,
  MLStats,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
  private getToken(): string | undefined {
    return Cookies.get('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Error de conexión con el servidor',
      }));
      throw new Error(
        Array.isArray(error.message) ? error.message.join(', ') : error.message
      );
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;
    
    return JSON.parse(text);
  }

  // ============ AUTH ============
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Guardar token en cookie
    Cookies.set('access_token', response.accessToken, { 
      expires: 7,
      sameSite: 'strict',
    });
    
    return response;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Guardar token en cookie
    Cookies.set('access_token', response.accessToken, { 
      expires: 7,
      sameSite: 'strict',
    });
    
    return response;
  }

  logout(): void {
    Cookies.remove('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ============ DISPOSITIVOS ============
  async getDispositivos(): Promise<Dispositivo[]> {
    return this.request<Dispositivo[]>('/dispositivos');
  }

  // Admin: obtener todos los dispositivos del sistema
  async getDispositivosAdmin(): Promise<DispositivoAdmin[]> {
    return this.request<DispositivoAdmin[]>('/dispositivos/admin/all');
  }

  async crearDispositivo(data: CrearDispositivoDto): Promise<DispositivoAdmin> {
    return this.request<DispositivoAdmin>('/dispositivos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adoptarDispositivo(data: AdoptarDispositivoDto): Promise<Dispositivo> {
    return this.request<Dispositivo>('/dispositivos/adoptar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async personalizarDispositivo(dispositivoId: number, data: PersonalizarDispositivoDto): Promise<Dispositivo> {
    return this.request<Dispositivo>(`/dispositivos/${dispositivoId}/personalizar`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ============ MEDICIONES ============
  async getMediciones(
    dispositivoId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ data: Medicion[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    
    const queryString = query.toString();
    const endpoint = `/mediciones/${dispositivoId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ data: Medicion[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(endpoint);
  }

  async getEstadisticas(dispositivoId: number): Promise<EstadisticasDispositivo> {
    return this.request<EstadisticasDispositivo>(
      `/mediciones/${dispositivoId}/estadisticas`
    );
  }

  // Obtener consumo REAL en kWh basado en mediciones con timestamps
  async getConsumoReal(dispositivoId: number, dias: number = 30): Promise<ConsumoReal> {
    return this.request<ConsumoReal>(
      `/mediciones/${dispositivoId}/consumo-real?dias=${dias}`
    );
  }

  // Obtener consumo del MES ACTUAL (desde día 1 hasta hoy)
  async getConsumoMesActual(dispositivoId: number): Promise<ConsumoMesActual> {
    return this.request<ConsumoMesActual>(
      `/mediciones/${dispositivoId}/consumo-mes`
    );
  }

  // Obtener historial de consumo mensual (últimos N meses)
  async getHistorialMensual(dispositivoId: number, meses: number = 3): Promise<HistorialMensual> {
    return this.request<HistorialMensual>(
      `/mediciones/${dispositivoId}/historial-mensual?meses=${meses}`
    );
  }

  // ============ CONTROL ============
  async encenderDispositivo(dispositivoId: number): Promise<ControlResponse> {
    return this.request<ControlResponse>(`/device/${dispositivoId}/on`, {
      method: 'POST',
    });
  }

  async apagarDispositivo(dispositivoId: number): Promise<ControlResponse> {
    return this.request<ControlResponse>(`/device/${dispositivoId}/off`, {
      method: 'POST',
    });
  }

  async getEstadoDispositivo(dispositivoId: number): Promise<StatusResponse> {
    return this.request<StatusResponse>(`/device/${dispositivoId}/status`);
  }

  // ============ MACHINE LEARNING ============
  async getMLAnalysis(dispositivoId: number, limit: number = 1000): Promise<MLAnalysisResponse> {
    return this.request<MLAnalysisResponse>(`/ml/analysis/${dispositivoId}?limit=${limit}`);
  }

  async getLastMLAnalysis(dispositivoId: number): Promise<AnalisisML | null> {
    return this.request<AnalisisML | null>(`/ml/last/${dispositivoId}`);
  }

  async getMLHistory(dispositivoId: number, limit: number = 50): Promise<AnalisisML[]> {
    return this.request<AnalisisML[]>(`/ml/history/${dispositivoId}?limit=${limit}`);
  }

  async getMLStats(): Promise<MLStats> {
    return this.request<MLStats>('/ml/stats');
  }

  async getForecast(dispositivoIds: number[]) {
    return this.request(`/ml/forecast?ids=${dispositivoIds.join(',')}`);
  }

  async checkMLHealth() {
    return this.request('/ml/health');
  }

  // ============ ALERTAS ============
  async getUnreadAlerts() {
    return this.request('/alertas/unread');
  }

  async markAlertAsRead(alertaId: number) {
    return this.request(`/alertas/mark-read/${alertaId}`, {
      method: 'POST',
    });
  }

  async markAllAlertsAsRead() {
    return this.request('/alertas/mark-all-read', {
      method: 'POST',
    });
  }

  async getAlertStats() {
    return this.request('/alertas/stats');
  }
}

// Singleton
export const api = new ApiService();
export default api;
