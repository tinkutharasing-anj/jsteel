import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, Portal, Modal, Text } from 'react-native-paper';
import DatePicker from 'react-datepicker';
import { weldingColors } from '../theme/colors';

interface BetterDatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function BetterDatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  required = false,
  disabled = false,
}: BetterDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      onChange(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }
    setShowPicker(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Add web-specific CSS styles
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        .react-datepicker {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 14px !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          background-color: white !important;
          width: 320px !important;
          padding: 0 !important;
          margin-top: 8px !important;
        }
        
        .react-datepicker__header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border-radius: 12px 12px 0 0 !important;
          padding: 0 !important;
          border: none !important;
          position: relative !important;
          min-height: 60px !important;
          margin-bottom: 0 !important;
        }
        
        .react-datepicker__header__dropdown {
          display: none !important;
        }
        
        .react-datepicker__month-dropdown-container,
        .react-datepicker__year-dropdown-container {
          display: none !important;
        }
        
        .react-datepicker__current-month {
          font-size: 18px !important;
          font-weight: 600 !important;
          color: white !important;
          text-align: center !important;
          margin: 0 !important;
          padding: 16px 0 8px 0 !important;
          position: relative !important;
          z-index: 0 !important;
        }
        
        .react-datepicker__day-names {
          display: flex !important;
          justify-content: space-around !important;
          margin-bottom: 8px !important;
        }
        
        .react-datepicker__day-name {
          color: rgba(255,255,255,0.9) !important;
          font-weight: 500 !important;
          font-size: 12px !important;
          width: 32px !important;
          text-align: center !important;
        }
        
        .react-datepicker__month {
          padding: 16px !important;
        }
        
        .react-datepicker__week {
          display: flex !important;
          justify-content: space-around !important;
          margin-bottom: 4px !important;
        }
        
        .react-datepicker__day {
          color: ${weldingColors.textPrimary} !important;
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          text-align: center !important;
          margin: 2px !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          font-weight: 500 !important;
          font-size: 14px !important;
        }
        
        .react-datepicker__day:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
        }
        
        .react-datepicker__day--selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
        }
        
        .react-datepicker__day--keyboard-selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
        }
        
        .react-datepicker__day--outside-month {
          color: ${weldingColors.neutral} !important;
          opacity: 0.5 !important;
        }
        
        .react-datepicker__day--today {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3) !important;
        }
        
        .react-datepicker__day--disabled {
          color: ${weldingColors.neutral} !important;
          opacity: 0.3 !important;
          cursor: not-allowed !important;
        }
        
        .react-datepicker__day--disabled:hover {
          background: none !important;
          transform: none !important;
          box-shadow: none !important;
        }
        
        .react-datepicker__triangle {
          display: none !important;
        }
        
        .react-datepicker-popper {
          z-index: 1000 !important;
        }
        
        .react-datepicker__input-container input {
          display: none !important;
        }
        .react-datepicker__navigation {
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 32px !important;
          height: 32px !important;
          border: none !important;
          background: none !important;
          cursor: pointer !important;
          padding: 0 !important;
          z-index: 10 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
        }
        
        .react-datepicker__navigation:hover {
          background: rgba(255,255,255,0.1) !important;
          border-radius: 50% !important;
          transform: translateY(-50%) scale(1.1) !important;
        }
        
        .react-datepicker__navigation--previous {
          left: 8px !important;
        }
        
        .react-datepicker__navigation--next {
          right: 8px !important;
        }
        
        .react-datepicker__navigation-icon {
          display: none !important;
        }
        
        .react-datepicker__navigation--previous::before {
          content: "‹" !important;
          font-size: 24px !important;
          font-weight: bold !important;
          color: white !important;
          line-height: 1 !important;
        }
        
        .react-datepicker__navigation--next::before {
          content: "›" !important;
          font-size: 24px !important;
          font-weight: bold !important;
          color: white !important;
          line-height: 1 !important;
        }
        
        .react-datepicker__month-container {
          background: white !important;
          border-radius: 0 0 12px 12px !important;
          position: relative !important;
          overflow: visible !important;
        }
        
        .react-datepicker__month {
          margin: 0 !important;
          padding: 16px !important;
          position: relative !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <TextInput
          label={label}
          value={formatDisplayDate(value)}
          placeholder={placeholder}
          editable={false}
          disabled={disabled}
          style={styles.input}
          mode="outlined"
          outlineColor={weldingColors.neutralLight}
          activeOutlineColor={weldingColors.secondary}
          right={
            <TextInput.Icon
              icon="calendar"
              onPress={() => !disabled && setShowPicker(!showPicker)}
              disabled={disabled}
            />
          }
        />
        
        {showPicker && (
          <View style={styles.inlineDatePicker}>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              inline
              dateFormat="yyyy-MM-dd"
              calendarStartDay={1}
              showWeekNumbers={false}
              useWeekdaysShort={true}
              fixedHeight={true}
            />
          </View>
        )}
      </View>
    );
  }

  // Fallback for mobile - use native date picker
  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={formatDisplayDate(value)}
        placeholder={placeholder}
        editable={false}
        disabled={disabled}
        style={styles.input}
        mode="outlined"
        outlineColor={weldingColors.neutralLight}
        activeOutlineColor={weldingColors.secondary}
        right={
          <TextInput.Icon
            icon="calendar"
            onPress={() => !disabled && setShowPicker(true)}
            disabled={disabled}
          />
        }
      />
      
      <Portal>
        <Modal
          visible={showPicker}
          onDismiss={() => setShowPicker(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Text style={styles.mobileMessage}>
              Use your device's native date picker
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowPicker(false)}
              style={styles.modalButton}
            >
              Close
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: weldingColors.surface,
  },
  modalContainer: {
    backgroundColor: 'transparent',
    margin: 20,
    borderRadius: 12,
    padding: 0,
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: weldingColors.primary,
  },
  datePickerContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  mobileMessage: {
    marginBottom: 20,
    textAlign: 'center',
    color: weldingColors.textSecondary,
  },
  inlineDatePicker: {
    marginTop: 8,
    backgroundColor: weldingColors.surface,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
  modalButton: {
    marginTop: 20,
    borderRadius: 8,
  },
});
