import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import WeldsScreen from '../WeldsScreen';
import { apiService } from '../../services/api';
import { weldingColors } from '../../theme/colors';

// Mock the API service
jest.mock('../../services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(),
};

const mockRoute = {
  params: {},
};

describe('WeldsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.getWelds.mockResolvedValue([]);
    mockApiService.getFieldDefinitions.mockResolvedValue([]);
  });

  it('renders loading state initially', () => {
    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    expect(screen.getByText('Loading welds...')).toBeTruthy();
  });

  it('loads data on mount', async () => {
    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      expect(mockApiService.getWelds).toHaveBeenCalled();
      expect(mockApiService.getFieldDefinitions).toHaveBeenCalled();
    });
  });

  it('displays welds when data is loaded', async () => {
    const mockWelds = [
      {
        id: 1,
        weld_number: 'W001',
        date: '2024-01-15',
        welder: 'John Doe',
        type_fit: 'Butt Weld',
        wps: 'WPS-001',
        pipe_dia: '6 inch',
      },
      {
        id: 2,
        weld_number: 'W002',
        date: '2024-01-16',
        welder: 'Jane Smith',
        type_fit: 'Fillet Weld',
        wps: 'WPS-002',
        pipe_dia: '4 inch',
      },
    ];

    mockApiService.getWelds.mockResolvedValue(mockWelds);
    mockApiService.getFieldDefinitions.mockResolvedValue([]);

    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      expect(screen.getByText('W001')).toBeTruthy();
      expect(screen.getByText('W002')).toBeTruthy();
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('Jane Smith')).toBeTruthy();
    });
  });

  it('displays empty state when no welds found', async () => {
    mockApiService.getWelds.mockResolvedValue([]);
    mockApiService.getFieldDefinitions.mockResolvedValue([]);

    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      expect(screen.getByText('No welds found')).toBeTruthy();
      expect(screen.getByText('Add your first weld using the + button')).toBeTruthy();
    });
  });

  it('filters welds based on search query', async () => {
    const mockWelds = [
      {
        id: 1,
        weld_number: 'W001',
        date: '2024-01-15',
        welder: 'John Doe',
        type_fit: 'Butt Weld',
        wps: 'WPS-001',
        pipe_dia: '6 inch',
      },
      {
        id: 2,
        weld_number: 'W002',
        date: '2024-01-16',
        welder: 'Jane Smith',
        type_fit: 'Fillet Weld',
        wps: 'WPS-002',
        pipe_dia: '4 inch',
      },
    ];

    mockApiService.getWelds.mockResolvedValue(mockWelds);
    mockApiService.getFieldDefinitions.mockResolvedValue([]);

    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      expect(screen.getByText('W001')).toBeTruthy();
      expect(screen.getByText('W002')).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText('Search welds...');
    fireEvent.changeText(searchInput, 'John');

    await waitFor(() => {
      expect(screen.getByText('W001')).toBeTruthy();
      expect(screen.queryByText('W002')).toBeFalsy();
    });
  });

  it('navigates to AddWeld when FAB is pressed', async () => {
    mockApiService.getWelds.mockResolvedValue([]);
    mockApiService.getFieldDefinitions.mockResolvedValue([]);

    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      const fab = screen.getByRole('button', { name: /plus/i });
      fireEvent.press(fab);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('AddWeld');
    });
  });

  it('navigates to AddWeld when weld card is pressed', async () => {
    const mockWelds = [
      {
        id: 1,
        weld_number: 'W001',
        date: '2024-01-15',
        welder: 'John Doe',
        type_fit: 'Butt Weld',
        wps: 'WPS-001',
        pipe_dia: '6 inch',
      },
    ];

    mockApiService.getWelds.mockResolvedValue(mockWelds);
    mockApiService.getFieldDefinitions.mockResolvedValue([]);

    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      const weldCard = screen.getByText('W001');
      fireEvent.press(weldCard);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('AddWeld', { weld: mockWelds[0] });
    });
  });

  it('handles API errors gracefully', async () => {
    mockApiService.getWelds.mockRejectedValue(new Error('API Error'));
    mockApiService.getFieldDefinitions.mockResolvedValue([]);

    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      expect(screen.getByText('No welds found')).toBeTruthy();
    });
  });

  it('displays correct date format', async () => {
    const mockWelds = [
      {
        id: 1,
        weld_number: 'W001',
        date: '2024-01-15',
        welder: 'John Doe',
        type_fit: 'Butt Weld',
        wps: 'WPS-001',
        pipe_dia: '6 inch',
      },
    ];

    mockApiService.getWelds.mockResolvedValue(mockWelds);
    mockApiService.getFieldDefinitions.mockResolvedValue([]);

    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      const dateChip = screen.getByText('1/15/2024');
      expect(dateChip).toBeTruthy();
    });
  });

  it('handles missing weld data gracefully', async () => {
    const mockWelds = [
      {
        id: 1,
        weld_number: undefined,
        date: '2024-01-15',
        welder: undefined,
        type_fit: undefined,
        wps: undefined,
        pipe_dia: undefined,
      },
    ];

    mockApiService.getWelds.mockResolvedValue(mockWelds);
    mockApiService.getFieldDefinitions.mockResolvedValue([]);

    render(<WeldsScreen navigation={mockNavigation} route={mockRoute} />);
    
    await waitFor(() => {
      expect(screen.getByText('No Weld #')).toBeTruthy();
      expect(screen.getByText('1/15/2024')).toBeTruthy();
    });
  });
});
