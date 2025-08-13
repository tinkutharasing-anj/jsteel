import React, { useState } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { Button, Card, Text, IconButton } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../services/api';
import { weldingColors } from '../theme/colors';

interface ImageUploadProps {
  value?: string;
  onChange: (imagePath: string) => void;
  onRemove: () => void;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  label = 'Upload Image'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    try {
      setError(null);
      setUploading(true);

      if (Platform.OS === 'web') {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'image/*',
          copyToCacheDirectory: false,
        });

        if (result.canceled || !result.assets?.[0]) {
          setUploading(false);
          return;
        }

        const file = result.assets[0];
        await uploadImage(file);
      } else {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          setUploading(false);
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          await uploadImage(file);
        }
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image');
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const result = await apiService.uploadImage(file);
      if (result.success) {
        onChange(result.imagePath);
      } else {
        setError('Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (Platform.OS === 'web') {
      return `http://localhost:3001${imagePath}`;
    }
    return imagePath;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {value ? (
        <Card style={styles.imageCard}>
          <Card.Cover 
            source={{ uri: getImageUrl(value) }} 
            style={styles.image}
          />
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="outlined" 
              onPress={onRemove}
              style={styles.removeButton}
              textColor={weldingColors.error}
            >
              Remove
            </Button>
          </Card.Actions>
        </Card>
      ) : (
        <Button
          mode="outlined"
          onPress={pickImage}
          loading={uploading}
          disabled={uploading}
          icon="camera"
          style={styles.uploadButton}
          textColor={weldingColors.primary}
        >
          {uploading ? 'Uploading...' : 'Select Image'}
        </Button>
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: weldingColors.textPrimary,
  },
  imageCard: {
    marginTop: 8,
  },
  image: {
    height: 200,
    resizeMode: 'cover',
  },
  cardActions: {
    justifyContent: 'center',
    padding: 8,
  },
  removeButton: {
    borderColor: weldingColors.error,
  },
  uploadButton: {
    borderColor: weldingColors.primary,
    borderWidth: 2,
    paddingVertical: 8,
  },
  errorText: {
    color: weldingColors.error,
    fontSize: 12,
    marginTop: 4,
  },
});


