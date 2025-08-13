import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Modal, Portal, Button, Text } from 'react-native-paper';
import { Image } from 'react-native';
import { weldingColors } from '../theme/colors';

interface ImageViewerProps {
  visible: boolean;
  onDismiss: () => void;
  imageUri: string;
  title?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  onDismiss,
  imageUri,
  title = 'Weld Image'
}) => {
  const getImageUrl = (imagePath: string) => {
    if (Platform.OS === 'web') {
      return `http://localhost:3001${imagePath}`;
    }
    return imagePath;
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Button
            mode="text"
            onPress={onDismiss}
            textColor={weldingColors.primary}
          >
            Close
          </Button>
        </View>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(imageUri) }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.closeButton}
            textColor={weldingColors.primary}
          >
            Close
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: weldingColors.surface,
    margin: 20,
    borderRadius: 12,
    maxHeight: height * 0.8,
    maxWidth: width * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: weldingColors.neutralLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: weldingColors.primary,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: 300,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    minHeight: 300,
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: weldingColors.neutralLight,
    alignItems: 'center',
  },
  closeButton: {
    borderColor: weldingColors.primary,
    minWidth: 100,
  },
});


