import { apiService } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getWelds', () => {
    it('fetches welds successfully', async () => {
      const mockWelds = [
        { id: 1, weld_number: 'W001', date: '2024-01-15' },
        { id: 2, weld_number: 'W002', date: '2024-01-16' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWelds,
      });

      const result = await apiService.getWelds();
      
      expect(result).toEqual(mockWelds);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/welds',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('handles search filters', async () => {
      const mockWelds = [{ id: 1, weld_number: 'W001' }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWelds,
      });

      await apiService.getWelds({ search: 'W001', date_from: '2024-01-01' });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/welds?search=W001&date_from=2024-01-01',
        expect.any(Object)
      );
    });

    it('throws error on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      });

      await expect(apiService.getWelds()).rejects.toThrow('Internal Server Error');
    });
  });

  describe('createWeld', () => {
    it('creates weld successfully', async () => {
      const newWeld = {
        weld_number: 'W003',
        date: '2024-01-17',
        welder: 'John Doe',
      };

      const createdWeld = { id: 3, ...newWeld };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => createdWeld,
      });

      const result = await apiService.createWeld(newWeld);
      
      expect(result).toEqual(createdWeld);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/welds',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newWeld),
        })
      );
    });
  });

  describe('updateWeld', () => {
    it('updates weld successfully', async () => {
      const updateData = { welder: 'Jane Smith' };
      const updatedWeld = { id: 1, weld_number: 'W001', welder: 'Jane Smith' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedWeld,
      });

      const result = await apiService.updateWeld(1, updateData);
      
      expect(result).toEqual(updatedWeld);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/welds/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe('deleteWeld', () => {
    it('deletes weld successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Weld deleted successfully' }),
      });

      const result = await apiService.deleteWeld(1);
      
      expect(result).toEqual({ message: 'Weld deleted successfully' });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/welds/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('getFieldDefinitions', () => {
    it('fetches field definitions successfully', async () => {
      const mockFields = [
        { id: 1, name: 'weld_number', label: 'Weld Number', type: 'text' },
        { id: 2, name: 'welder', label: 'Welder', type: 'text' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFields,
      });

      const result = await apiService.getFieldDefinitions();
      
      expect(result).toEqual(mockFields);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/fields',
        expect.any(Object)
      );
    });
  });

  describe('uploadCSV', () => {
    it('uploads CSV successfully', async () => {
      const mockFile = new File(['test'], 'test.csv', { type: 'text/csv' });
      const mockResponse = {
        message: 'Upload successful',
        totalRows: 10,
        successCount: 8,
        errorCount: 2,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.uploadCSV(mockFile);
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/upload/csv',
        expect.objectContaining({
          method: 'POST',
          headers: {},
        })
      );
    });
  });

  describe('exportCSV', () => {
    it('exports CSV successfully', async () => {
      const mockBlob = new Blob(['test,csv,data'], { type: 'text/csv' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const result = await apiService.exportCSV();
      
      expect(result).toEqual(mockBlob);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/upload/export'
      );
    });

    it('exports CSV with date filters', async () => {
      const mockBlob = new Blob(['test,csv,data'], { type: 'text/csv' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      await apiService.exportCSV({ date_from: '2024-01-01', date_to: '2024-01-31' });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/upload/export?date_from=2024-01-01&date_to=2024-01-31'
      );
    });

    it('handles export errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.exportCSV()).rejects.toThrow('Failed to export CSV');
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.getWelds()).rejects.toThrow('Network error');
    });

    it('handles malformed JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiService.getWelds()).rejects.toThrow('HTTP error! status: 500');
    });
  });
});
