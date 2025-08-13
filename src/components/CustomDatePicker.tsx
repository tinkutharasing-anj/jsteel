import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Portal, Modal, Title } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { weldingColors } from '../theme/colors';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  visible: boolean;
  onDismiss: () => void;
  label?: string;
}

export default function CustomDatePicker({ 
  value, 
  onChange, 
  visible, 
  onDismiss, 
  label = 'Select Date' 
}: CustomDatePickerProps) {
  const [tempDate, setTempDate] = useState(new Date(value || Date.now()));

  useEffect(() => {
    console.log('CustomDatePicker - visible:', visible, 'value:', value);
  }, [visible, value]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    console.log('Date confirmed:', tempDate.toISOString().split('T')[0]);
    onChange(tempDate.toISOString().split('T')[0]);
    onDismiss();
  };

  const handleCancel = () => {
    console.log('Date picker cancelled');
    setTempDate(new Date(value || Date.now()));
    onDismiss();
  };

  if (Platform.OS === 'web') {
    console.log('Rendering web date picker, visible:', visible);
    
    if (!visible) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}>
        <div style={{
          backgroundColor: weldingColors.surface,
          padding: '32px',
          borderRadius: '12px',
          minWidth: '400px',
          maxWidth: '90vw',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          border: `1px solid ${weldingColors.neutralLight}`,
        }}>
          <h3 style={{
            color: weldingColors.primary,
            marginBottom: '28px',
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center',
            margin: '0 0 28px 0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>{label}</h3>
          
          <div style={{ 
            marginBottom: '32px',
            textAlign: 'center',
          }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '500',
              color: weldingColors.textPrimary,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              Select Date
            </label>
            <input
              type="date"
              value={tempDate.toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) {
                  setTempDate(new Date(e.target.value));
                }
              }}
              style={{
                fontSize: '18px',
                padding: '16px 20px',
                border: `2px solid ${weldingColors.neutralLight}`,
                borderRadius: '8px',
                backgroundColor: weldingColors.surface,
                color: weldingColors.textPrimary,
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                transition: 'border-color 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = weldingColors.secondary;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = weldingColors.neutralLight;
              }}
            />
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '16px',
          }}>
            <button 
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: `2px solid ${weldingColors.primary}`,
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: weldingColors.primary,
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = weldingColors.primary;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = weldingColors.primary;
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: weldingColors.secondary,
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = weldingColors.primary;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = weldingColors.secondary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.datePickerContainer}>
            <Title style={styles.modalTitle}>{label}</Title>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={handleCancel}
                style={styles.button}
                textColor={weldingColors.primary}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleConfirm}
                style={styles.button}
                buttonColor={weldingColors.secondary}
              >
                Confirm
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    );
  }

  // Android
  if (visible) {
    return (
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          if (selectedDate) {
            onChange(selectedDate.toISOString().split('T')[0]);
          }
          onDismiss();
        }}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: weldingColors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 300,
  },
  datePickerContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    color: weldingColors.primary,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});
