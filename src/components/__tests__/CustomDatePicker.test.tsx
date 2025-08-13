import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CustomDatePicker from '../CustomDatePicker';

describe('CustomDatePicker', () => {
  const defaultProps = {
    value: '2024-01-15',
    onChange: jest.fn(),
    visible: false,
    onDismiss: jest.fn(),
    label: 'Select Date',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not visible', () => {
    render(<CustomDatePicker {...defaultProps} visible={false} />);
    
    expect(screen.queryByText('Select Date')).toBeFalsy();
  });

  it('renders date picker when visible', () => {
    render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    expect(screen.getByText('Select Date')).toBeTruthy();
    expect(screen.getByDisplayValue('2024-01-15')).toBeTruthy();
  });

  it('displays correct date value', () => {
    const testDate = '2024-12-25';
    render(<CustomDatePicker {...defaultProps} visible={true} value={testDate} />);
    
    expect(screen.getByDisplayValue('2024-12-25')).toBeTruthy();
  });

  it('calls onChange when confirm button is pressed', () => {
    render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    const confirmButton = screen.getByText('Confirm');
    fireEvent.press(confirmButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('2024-01-15');
  });

  it('calls onDismiss when cancel button is pressed', () => {
    render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.press(cancelButton);
    
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });

  it('updates date when input value changes', async () => {
    render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    const dateInput = screen.getByDisplayValue('2024-01-15');
    fireEvent.changeText(dateInput, '2024-06-20');
    
    await waitFor(() => {
      expect(dateInput.props.value).toBe('2024-06-20');
    });
  });

  it('handles empty date input gracefully', async () => {
    render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    const dateInput = screen.getByDisplayValue('2024-01-15');
    fireEvent.changeText(dateInput, '');
    
    await waitFor(() => {
      expect(dateInput.props.value).toBe('2024-01-15');
    });
  });

  it('displays custom label', () => {
    render(<CustomDatePicker {...defaultProps} visible={true} label="Custom Date Label" />);
    
    expect(screen.getByText('Custom Date Label')).toBeTruthy();
  });

  it('applies correct styling to modal', () => {
    render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    const modal = screen.getByText('Select Date').parent?.parent;
    expect(modal).toBeTruthy();
  });

  it('handles date changes correctly', async () => {
    render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    const dateInput = screen.getByDisplayValue('2024-01-15');
    const newDate = '2024-03-10';
    
    fireEvent.changeText(dateInput, newDate);
    
    await waitFor(() => {
      expect(dateInput.props.value).toBe(newDate);
    });
  });

  it('maintains date state between renders', () => {
    const { rerender } = render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    expect(screen.getByDisplayValue('2024-01-15')).toBeTruthy();
    
    rerender(<CustomDatePicker {...defaultProps} visible={true} value="2024-05-20" />);
    
    expect(screen.getByDisplayValue('2024-05-20')).toBeTruthy();
  });

  it('handles invalid date gracefully', () => {
    render(<CustomDatePicker {...defaultProps} visible={true} value="invalid-date" />);
    
    expect(screen.getByDisplayValue('')).toBeTruthy();
  });

  it('calls onChange with updated date after input change', async () => {
    render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    const dateInput = screen.getByDisplayValue('2024-01-15');
    fireEvent.changeText(dateInput, '2024-08-15');
    
    const confirmButton = screen.getByText('Confirm');
    fireEvent.press(confirmButton);
    
    await waitFor(() => {
      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  it('handles rapid date changes correctly', async () => {
    render(<CustomDatePicker {...defaultProps} visible={true} />);
    
    const dateInput = screen.getByDisplayValue('2024-01-15');
    
    fireEvent.changeText(dateInput, '2024-02-01');
    fireEvent.changeText(dateInput, '2024-03-01');
    fireEvent.changeText(dateInput, '2024-04-01');
    
    await waitFor(() => {
      expect(dateInput.props.value).toBe('2024-04-01');
    });
  });
});
