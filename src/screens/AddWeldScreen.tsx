import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  HelperText,
  Card,
  Chip,
  Portal,
  Modal,
  Text,
} from 'react-native-paper';
import { Weld, FieldDefinition } from '../types';
import apiService from '../services/api';
import { weldingColors } from '../theme/colors';
import BetterDatePicker from '../components/BetterDatePicker';
import { ImageUpload } from '../components/ImageUpload';

interface AddWeldScreenProps {
  navigation: any;
  route: any;
}

export default function AddWeldScreen({ navigation, route }: AddWeldScreenProps) {
  const editWeld = route.params?.weld;
  const [formData, setFormData] = useState<Partial<Weld>>({
    date: editWeld?.date || new Date().toISOString().split('T')[0],
    type_fit: editWeld?.type_fit || '',
    wps: editWeld?.wps || '',
    pipe_dia: editWeld?.pipe_dia || '',
    grade_class: editWeld?.grade_class || '',
    weld_number: editWeld?.weld_number || '',
    welder: editWeld?.welder || '',
    first_ht_number: editWeld?.first_ht_number || '',
    first_length: editWeld?.first_length || '',
    jt_number: editWeld?.jt_number || '',
    second_ht_number: editWeld?.second_ht_number || '',
    second_length: editWeld?.second_length || '',
    pre_heat: editWeld?.pre_heat || '',
    vt: editWeld?.vt || '',
    process: editWeld?.process || '',
    nde_number: editWeld?.nde_number || '',
    amps: editWeld?.amps || '',
    volts: editWeld?.volts || '',
    ipm: editWeld?.ipm || '',
    image_path: editWeld?.image_path || '',
  });
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFieldDefinitions();
  }, []);

  const loadFieldDefinitions = async () => {
    try {
      const fields = await apiService.getFieldDefinitions();
      setFieldDefinitions(fields.sort((a, b) => a.field_order - b.field_order));
    } catch (error) {
      console.error('Error loading field definitions:', error);
    }
  };

  const handleInputChange = (field: keyof Weld, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: string) => {
    console.log('Date changed to:', date);
    setFormData(prev => ({ ...prev, date }));
  };

  const handleSubmit = async () => {
    if (!formData.date) {
      Alert.alert('Error', 'Date is required');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting to save weld...');
      console.log('Form data:', formData);
      
      // Clean up form data - convert empty strings to null for optional fields
      const cleanFormData: Partial<Weld> = { ...formData };
      Object.keys(cleanFormData).forEach(key => {
        if (key !== 'date' && cleanFormData[key as keyof Weld] === '') {
          (cleanFormData as any)[key] = null;
        }
      });
      
      console.log('Cleaned form data:', cleanFormData);
      
      // Test API connection first
      console.log('Testing API connection...');
      try {
        const testResponse = await fetch('http://localhost:3001/api/health');
        console.log('Health check response:', testResponse.status, testResponse.ok);
      } catch (testError) {
        console.error('Health check failed:', testError);
      }
      
      if (editWeld?.id) {
        console.log('Updating existing weld with ID:', editWeld.id);
        const result = await apiService.updateWeld(editWeld.id, cleanFormData);
        console.log('Update result:', result);
        console.log('Weld updated successfully, navigating back...');
        navigation.goBack();
      } else {
        console.log('Creating new weld...');
        const result = await apiService.createWeld(cleanFormData as Omit<Weld, 'id'>);
        console.log('Create result:', result);
        console.log('Weld created successfully, navigating back...');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Error saving weld:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = 'Failed to save weld';
      if (error.message?.includes('fetch')) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message?.includes('HTTP error')) {
        errorMessage = `Server error: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FieldDefinition) => {
    const fieldValue = formData[field.field_name as keyof Weld] as string || '';
    
    // Skip date fields - they're handled by BetterDatePicker
    if (field.field_type === 'date') {
      return null;
    }

    return (
      <View key={field.id} style={styles.fieldContainer}>
        <TextInput
          label={field.display_name}
          data-testid={`${field.field_name}-input`}
          value={fieldValue}
          onChangeText={(text) => handleInputChange(field.field_name as keyof Weld, text)}
          style={styles.input}
          editable={field.is_editable}
          multiline={field.field_type === 'textarea'}
          numberOfLines={field.field_type === 'textarea' ? 3 : 1}
          mode="outlined"
          outlineColor={weldingColors.neutralLight}
          activeOutlineColor={weldingColors.secondary}
        />
        {field.is_required && !fieldValue && (
          <HelperText type="error">This field is required</HelperText>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>
              {editWeld ? 'Edit Weld' : 'Add New Weld'}
            </Title>
            
            <BetterDatePicker
              label="Weld Date"
              value={formData.date || ''}
              onChange={handleDateChange}
              placeholder="Select weld date"
              required
            />
            
            <ImageUpload
              value={formData.image_path}
              onChange={(imagePath) => handleInputChange('image_path', imagePath)}
              onRemove={() => handleInputChange('image_path', '')}
              label="Weld Image"
            />
            
            {fieldDefinitions.map(renderField)}

            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={loading}
                textColor={weldingColors.primary}
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSubmit}
                style={styles.button}
                loading={loading}
                disabled={loading}
                buttonColor={weldingColors.secondary}
                data-testid="submit-button"
              >
                {editWeld ? 'Update' : 'Save'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: weldingColors.background,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
    backgroundColor: weldingColors.surface,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: weldingColors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: weldingColors.surface,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
