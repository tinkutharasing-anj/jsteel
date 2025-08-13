import { Weld, FieldDefinition, SearchFilters } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getWelds(filters: SearchFilters = {}): Promise<Weld[]> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = `/welds${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Weld[]>(endpoint);
  }

  async getWeld(id: number): Promise<Weld> {
    return this.request<Weld>(`/welds/${id}`);
  }

  async createWeld(weld: Omit<Weld, 'id'>): Promise<Weld> {
    return this.request<Weld>('/welds', {
      method: 'POST',
      body: JSON.stringify(weld),
    });
  }

  async updateWeld(id: number, weld: Partial<Weld>): Promise<Weld> {
    return this.request<Weld>(`/welds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(weld),
    });
  }

  async deleteWeld(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/welds/${id}`, {
      method: 'DELETE',
    });
  }

  async getFieldDefinitions(): Promise<FieldDefinition[]> {
    return this.request<FieldDefinition[]>('/fields');
  }

  async createFieldDefinition(field: Omit<FieldDefinition, 'id' | 'created_at' | 'updated_at'>): Promise<FieldDefinition> {
    return this.request<FieldDefinition>('/fields', {
      method: 'POST',
      body: JSON.stringify(field),
    });
  }

  async updateFieldDefinition(id: number, field: Partial<FieldDefinition>): Promise<FieldDefinition> {
    return this.request<FieldDefinition>(`/fields/${id}`, {
      method: 'PUT',
      body: JSON.stringify(field),
    });
  }

  async deleteFieldDefinition(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/fields/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderFields(fieldOrders: { id: number; order: number }[]): Promise<{ message: string }> {
    return this.request<{ message: string }>('/fields/reorder', {
      method: 'PUT',
      body: JSON.stringify({ fieldOrders }),
    });
  }

  async uploadCSV(file: File): Promise<{
    message: string;
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors?: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(`/upload/csv`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async exportCSV(filters: { date_from?: string; date_to?: string } = {}): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const queryString = params.toString();
    const endpoint = `/upload/export${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Export CSV error:', error);
      throw new Error('Failed to export CSV');
    }
  }

  async uploadImage(file: File): Promise<{ success: boolean; imagePath: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.request(`/welds/upload-image`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }
}

export const apiService = new ApiService();
export default apiService;
