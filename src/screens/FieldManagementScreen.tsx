import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  List,
  IconButton,
  Portal,
  Modal,
  Chip,
  Divider,
  FAB,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { FieldDefinition } from '../types';
import apiService from '../services/api';
import { weldingColors } from '../theme/colors';

export default function FieldManagementScreen() {
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [formData, setFormData] = useState({
    field_name: '',
    display_name: '',
    field_type: 'text',
    is_required: false,
    is_editable: true,
    field_order: 0,
  });

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
  ];

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      const fieldsData = await apiService.getFieldDefinitions();
      setFields(fieldsData.sort((a, b) => a.field_order - b.field_order));
    } catch (error) {
      console.error('Error loading fields:', error);
      Alert.alert('Error', 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      field_name: '',
      display_name: '',
      field_type: 'text',
      is_required: false,
      is_editable: true,
      field_order: 0,
    });
    setEditingField(null);
  };

  const openAddModal = () => {
    resetForm();
    setFormData(prev => ({ ...prev, field_order: fields.length }));
    setModalVisible(true);
  };

  const openEditModal = (field: FieldDefinition) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      display_name: field.display_name,
      field_type: field.field_type,
      is_required: field.is_required,
      is_editable: field.is_editable,
      field_order: field.field_order,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.field_name.trim() || !formData.display_name.trim()) {
      Alert.alert('Error', 'Field name and display name are required');
      return;
    }

    try {
      if (editingField) {
        await apiService.updateFieldDefinition(editingField.id, formData);
        Alert.alert('Success', 'Field updated successfully');
      } else {
        await apiService.createFieldDefinition(formData);
        Alert.alert('Success', 'Field created successfully');
      }
      
      setModalVisible(false);
      resetForm();
      loadFields();
    } catch (error) {
      console.error('Error saving field:', error);
      Alert.alert('Error', 'Failed to save field');
    }
  };

  const handleDeleteField = async (field: FieldDefinition) => {
    Alert.alert(
      'Delete Field',
      `Are you sure you want to delete "${field.display_name}"? This will remove the field from all existing welds.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteFieldDefinition(field.id);
              Alert.alert('Success', 'Field deleted successfully');
              loadFields();
            } catch (error) {
              console.error('Error deleting field:', error);
              Alert.alert('Error', 'Failed to delete field');
            }
          },
        },
      ]
    );
  };

  const moveField = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);

    const fieldOrders = newFields.map((field, index) => ({
      id: field.id,
      order: index,
    }));

    try {
      await apiService.reorderFields(fieldOrders);
      setFields(newFields);
    } catch (error) {
      console.error('Error reordering fields:', error);
      Alert.alert('Error', 'Failed to reorder fields');
    }
  };

  const renderField = ({ item, index }: { item: FieldDefinition; index: number }) => (
    <Card style={styles.fieldCard}>
      <Card.Content>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldInfo}>
            <Title style={styles.fieldTitle}>{item.display_name}</Title>
            <Chip mode="outlined" style={styles.fieldType}>
              {fieldTypes.find(t => t.value === item.field_type)?.label || item.field_type}
            </Chip>
          </View>
          <View style={styles.fieldActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEditModal(item)}
              iconColor={weldingColors.primary}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteField(item)}
              iconColor={weldingColors.error}
            />
          </View>
        </View>
        
        <View style={styles.fieldDetails}>
          <Chip mode="outlined" style={styles.fieldChip}>
            {item.is_required ? 'Required' : 'Optional'}
          </Chip>
          <Chip mode="outlined" style={styles.fieldChip}>
            {item.is_editable ? 'Editable' : 'Read-only'}
          </Chip>
        </View>

        <View style={styles.fieldOrder}>
          <IconButton
            icon="chevron-up"
            size={20}
            disabled={index === 0}
            onPress={() => moveField(index, index - 1)}
            iconColor={weldingColors.secondary}
          />
          <IconButton
            icon="chevron-down"
            size={20}
            disabled={index === fields.length - 1}
            onPress={() => moveField(index, index + 1)}
            iconColor={weldingColors.secondary}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={fields}
        renderItem={renderField}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openAddModal}
        data-testid="add-field-button"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>
            {editingField ? 'Edit Field' : 'Add New Field'}
          </Title>

          <TextInput
            label="Field Name (Internal)"
            value={formData.field_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, field_name: text }))}
            style={styles.input}
            disabled={!!editingField}
            mode="outlined"
            outlineColor={weldingColors.neutralLight}
            activeOutlineColor={weldingColors.secondary}
            data-testid="field-name-input"
          />

          <TextInput
            label="Display Name"
            value={formData.display_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, display_name: text }))}
            style={styles.input}
            mode="outlined"
            outlineColor={weldingColors.neutralLight}
            activeOutlineColor={weldingColors.secondary}
            data-testid="display-name-input"
          />

          <View style={styles.fieldTypeContainer}>
            <Title style={styles.fieldTypeTitle}>Field Type:</Title>
            <View style={styles.fieldTypeOptions}>
              {fieldTypes.map((type) => (
                <Chip
                  key={type.value}
                  selected={formData.field_type === type.value}
                  onPress={() => setFormData(prev => ({ ...prev, field_type: type.value }))}
                  style={styles.fieldTypeChip}
                  selectedColor={weldingColors.surface}
                  textStyle={{ color: weldingColors.textPrimary }}
                  data-testid={`field-type-chip-${type.value}`}
                >
                  {type.label}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Button
              mode={formData.is_required ? 'contained' : 'outlined'}
              onPress={() => setFormData(prev => ({ ...prev, is_required: !prev.is_required }))}
              style={styles.checkbox}
              buttonColor={formData.is_required ? weldingColors.success : undefined}
              textColor={formData.is_required ? weldingColors.surface : weldingColors.primary}
              data-testid="is-required-checkbox"
            >
              Required Field
            </Button>
            <Button
              mode={formData.is_editable ? 'contained' : 'outlined'}
              onPress={() => setFormData(prev => ({ ...prev, is_editable: !prev.is_editable }))}
              style={styles.checkbox}
              buttonColor={formData.is_editable ? weldingColors.info : undefined}
              textColor={formData.is_editable ? weldingColors.surface : weldingColors.primary}
              data-testid="is-editable-checkbox"
            >
              Editable
            </Button>
          </View>

          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setModalVisible(false)}
              data-testid="cancel-field-button"
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              buttonColor={weldingColors.secondary}
              data-testid="save-field-button"
            >
              {editingField ? 'Update' : 'Create'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: weldingColors.background,
  },
  listContainer: {
    padding: 16,
  },
  fieldCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: weldingColors.surface,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: weldingColors.textPrimary,
  },
  fieldType: {
    alignSelf: 'flex-start',
    borderColor: weldingColors.secondary,
  },
  fieldActions: {
    flexDirection: 'row',
  },
  fieldDetails: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  fieldChip: {
    marginRight: 8,
    borderColor: weldingColors.neutralLight,
  },
  fieldOrder: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: weldingColors.secondary,
  },
  modalContainer: {
    backgroundColor: weldingColors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: weldingColors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: weldingColors.surface,
  },
  fieldTypeContainer: {
    marginBottom: 16,
  },
  fieldTypeTitle: {
    fontSize: 16,
    marginBottom: 12,
    color: weldingColors.textPrimary,
  },
  fieldTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fieldTypeChip: {
    marginRight: 8,
    marginBottom: 8,
    borderColor: weldingColors.neutralLight,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  checkbox: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
