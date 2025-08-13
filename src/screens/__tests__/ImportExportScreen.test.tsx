import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ImportExportScreen from '../ImportExportScreen';
import { apiService } from '../../services/api';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Mock the API service
jest.mock('../../services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock expo modules
jest.mock('expo-document-picker');
jest.mock('expo-file-system');
jest.mock('expo-sharing');

describe('ImportExportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.exportCSV.mockResolvedValue(new Blob(['test']));
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'test.csv', name: 'test.csv' }],
    });
    (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders import and export sections', () => {
    render(<ImportExportScreen />);
    
    expect(screen.getByText('Import CSV')).toBeTruthy();
    expect(screen.getByText('Export CSV')).toBeTruthy();
  });

  it('displays import instructions', () => {
    render(<ImportExportScreen />);
    
    expect(screen.getByText(/Select a CSV file to import/)).toBeTruthy();
    expect(screen.getByText(/The file should contain/)).toBeTruthy();
  });

  it('displays export instructions', () => {
    render(<ImportExportScreen />);
    
    expect(screen.getByText(/Export your welding data/)).toBeTruthy();
    expect(screen.getByText(/Choose date range/)).toBeTruthy();
  });

  it('shows date picker inputs for export', () => {
    render(<ImportExportScreen />);
    
    expect(screen.getByText('Date From (YYYY-MM-DD)')).toBeTruthy();
    expect(screen.getByText('Date To (YYYY-MM-DD)')).toBeTruthy();
  });

  it('handles CSV import successfully', async () => {
    const mockResponse = {
      message: 'Import successful',
      totalRows: 10,
      successCount: 8,
      errorCount: 2,
    };

    mockApiService.uploadCSV.mockResolvedValue(mockResponse);

    render(<ImportExportScreen />);
    
    const importButton = screen.getByText('Import CSV');
    fireEvent.press(importButton);

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });
    });

    await waitFor(() => {
      expect(mockApiService.uploadCSV).toHaveBeenCalled();
    });
  });

  it('handles CSV import cancellation', async () => {
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: true,
    });

    render(<ImportExportScreen />);
    
    const importButton = screen.getByText('Import CSV');
    fireEvent.press(importButton);

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
    });

    expect(mockApiService.uploadCSV).not.toHaveBeenCalled();
  });

  it('handles CSV import errors', async () => {
    mockApiService.uploadCSV.mockRejectedValue(new Error('Import failed'));

    render(<ImportExportScreen />);
    
    const importButton = screen.getByText('Import CSV');
    fireEvent.press(importButton);

    await waitFor(() => {
      expect(mockApiService.uploadCSV).toHaveBeenCalled();
    });
  });

  it('exports CSV without date filters', async () => {
    render(<ImportExportScreen />);
    
    const exportButton = screen.getByText('Export CSV');
    fireEvent.press(exportButton);

    await waitFor(() => {
      expect(mockApiService.exportCSV).toHaveBeenCalledWith({});
    });
  });

  it('exports CSV with date filters', async () => {
    render(<ImportExportScreen />);
    
    // Set date filters
    const dateFromInput = screen.getByDisplayValue('');
    const dateToInput = screen.getByDisplayValue('');
    
    fireEvent.changeText(dateFromInput, '2024-01-01');
    fireEvent.changeText(dateToInput, '2024-01-31');
    
    const exportButton = screen.getByText('Export CSV');
    fireEvent.press(exportButton);

    await waitFor(() => {
      expect(mockApiService.exportCSV).toHaveBeenCalledWith({
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      });
    });
  });

  it('clears date filters when clear button is pressed', () => {
    render(<ImportExportScreen />);
    
    // Set date filters
    const dateFromInput = screen.getByDisplayValue('');
    const dateToInput = screen.getByDisplayValue('');
    
    fireEvent.changeText(dateFromInput, '2024-01-01');
    fireEvent.changeText(dateToInput, '2024-01-31');
    
    // Clear dates button should appear
    const clearButton = screen.getByText('Clear Dates');
    fireEvent.press(clearButton);
    
    expect(dateFromInput.props.value).toBe('');
    expect(dateToInput.props.value).toBe('');
  });

  it('shows clear dates button only when dates are set', () => {
    render(<ImportExportScreen />);
    
    // Initially no clear button
    expect(screen.queryByText('Clear Dates')).toBeFalsy();
    
    // Set a date
    const dateFromInput = screen.getByDisplayValue('');
    fireEvent.changeText(dateFromInput, '2024-01-01');
    
    // Clear button should appear
    expect(screen.getByText('Clear Dates')).toBeTruthy();
  });

  it('handles export errors gracefully', async () => {
    mockApiService.exportCSV.mockRejectedValue(new Error('Export failed'));

    render(<ImportExportScreen />);
    
    const exportButton = screen.getByText('Export CSV');
    fireEvent.press(exportButton);

    await waitFor(() => {
      expect(mockApiService.exportCSV).toHaveBeenCalled();
    });
  });

  it('displays import modal with results', async () => {
    const mockResponse = {
      message: 'Import successful',
      totalRows: 10,
      successCount: 8,
      errorCount: 2,
    };

    mockApiService.uploadCSV.mockResolvedValue(mockResponse);

    render(<ImportExportScreen />);
    
    const importButton = screen.getByText('Import CSV');
    fireEvent.press(importButton);

    await waitFor(() => {
      expect(screen.getByText('Import Results')).toBeTruthy();
      expect(screen.getByText('Total Rows:')).toBeTruthy();
      expect(screen.getByText('10')).toBeTruthy();
    });
  });

  it('closes import modal when close button is pressed', async () => {
    const mockResponse = {
      message: 'Import successful',
      totalRows: 10,
      successCount: 8,
      errorCount: 2,
    };

    mockApiService.uploadCSV.mockResolvedValue(mockResponse);

    render(<ImportExportScreen />);
    
    const importButton = screen.getByText('Import CSV');
    fireEvent.press(importButton);

    await waitFor(() => {
      expect(screen.getByText('Import Results')).toBeTruthy();
    });

    const closeButton = screen.getByText('Close');
    fireEvent.press(closeButton);

    expect(screen.queryByText('Import Results')).toBeFalsy();
  });

  it('handles empty import results', async () => {
    const mockResponse = {
      message: 'Import successful',
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
    };

    mockApiService.uploadCSV.mockResolvedValue(mockResponse);

    render(<ImportExportScreen />);
    
    const importButton = screen.getByText('Import CSV');
    fireEvent.press(importButton);

    await waitFor(() => {
      expect(screen.getByText('Import Results')).toBeTruthy();
      expect(screen.getByText('Total Rows:')).toBeTruthy();
      expect(screen.getByText('0')).toBeTruthy();
    });
  });
});
