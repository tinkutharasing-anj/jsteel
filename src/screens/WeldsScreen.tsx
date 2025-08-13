import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  FAB,
  Card,
  Title,
  Paragraph,
  Button,
  Searchbar,
  Chip,
  Menu,
  Divider,
  IconButton,
  Portal,
  Modal,
  Text,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Weld, FieldDefinition } from '../types';
import apiService from '../services/api';
import { weldingColors } from '../theme/colors';
import { ImageViewer } from '../components/ImageViewer';

interface WeldsScreenProps {
  navigation: any;
  route: any;
}

export default function WeldsScreen({ navigation, route }: WeldsScreenProps) {
  const [welds, setWelds] = useState<Weld[]>([]);
  const [filteredWelds, setFilteredWelds] = useState<Weld[]>([]);
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [weldToDelete, setWeldToDelete] = useState<Weld | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (welds.length > 0 || searchQuery.trim()) {
      filterWelds();
    }
  }, [searchQuery, welds]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [weldsData, fieldsData] = await Promise.all([
        apiService.getWelds(),
        apiService.getFieldDefinitions(),
      ]);
      setWelds(weldsData || []);
      setFieldDefinitions(fieldsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
      setWelds([]);
      setFieldDefinitions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterWelds = () => {
    if (!welds || welds.length === 0) {
      setFilteredWelds([]);
      return;
    }
    
    if (!searchQuery.trim()) {
      setFilteredWelds(welds);
      return;
    }

    const filtered = welds.filter(weld => 
      weld.weld_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      weld.welder?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      weld.type_fit?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredWelds(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteWeld = async () => {
    if (!weldToDelete?.id) return;

    try {
      await apiService.deleteWeld(weldToDelete.id);
      setWelds(welds.filter(w => w.id !== weldToDelete.id));
      setDeleteModalVisible(false);
      setWeldToDelete(null);
      Alert.alert('Success', 'Weld deleted successfully');
    } catch (error) {
      console.error('Error deleting weld:', error);
      Alert.alert('Error', 'Failed to delete weld');
    }
  };

  const renderWeldCard = ({ item }: { item: Weld }) => {
    if (!item || !item.id) {
      return null;
    }
    
    const getImageUrl = (imagePath: string) => {
      if (Platform.OS === 'web') {
        return `http://localhost:3001${imagePath}`;
      }
      return imagePath;
    };
    
    return (
      <Card style={styles.card} onPress={() => navigation.navigate('AddWeld', { weld: item })}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.weldNumber}>{item.weld_number || 'No Weld #'}</Title>
            <Chip icon="calendar" mode="outlined" style={styles.dateChip}>
              {item.date ? new Date(item.date).toLocaleDateString() : 'No Date'}
            </Chip>
          </View>
          
          {item.image_path && (
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={() => {
                setSelectedImage(item.image_path!);
                setImageViewerVisible(true);
              }}>
                <Card.Cover 
                  source={{ uri: getImageUrl(item.image_path) }} 
                  style={styles.weldImage}
                />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.cardDetails}>
            {item.welder && (
              <Paragraph style={styles.detail}>
                <Ionicons name="person" size={16} color={weldingColors.secondary} /> {item.welder}
              </Paragraph>
            )}
            {item.type_fit && (
              <Paragraph style={styles.detail}>
                <Ionicons name="construct" size={16} color={weldingColors.secondary} /> {item.type_fit}
              </Paragraph>
            )}
            {item.wps && (
              <Paragraph style={styles.detail}>
                <Ionicons name="document-text" size={16} color={weldingColors.secondary} /> {item.wps}
              </Paragraph>
            )}
            {item.pipe_dia && (
              <Paragraph style={styles.detail}>
                <Ionicons name="resize" size={16} color={weldingColors.secondary} /> {item.pipe_dia}
              </Paragraph>
            )}
          </View>
          
          <View style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('AddWeld', { weld: item })}
              style={styles.actionButton}
              textColor={weldingColors.primary}
            >
              Edit
            </Button>
            {item.image_path && (
              <Button
                mode="outlined"
                onPress={() => {
                  setSelectedImage(item.image_path!);
                  setImageViewerVisible(true);
                }}
                style={styles.actionButton}
                textColor={weldingColors.secondary}
                icon="eye"
              >
                View
              </Button>
            )}
            <Button
              mode="outlined"
              onPress={() => {
                setWeldToDelete(item);
                setDeleteModalVisible(true);
              }}
              style={[styles.actionButton, styles.deleteButton]}
              textColor={weldingColors.error}
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search welds..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={weldingColors.secondary}
        data-testid="search-input"
      />

      <FlatList
        data={filteredWelds}
        renderItem={renderWeldCard}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading welds...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No welds found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Add your first weld using the + button'}
              </Text>
            </View>
          )
        }
      />

      <FAB
        icon="plus"
        data-testid="add-weld-fab"
        style={styles.fab}
        onPress={() => navigation.navigate('AddWeld')}
      />

      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Delete Weld</Title>
          <Paragraph style={styles.modalText}>
            Are you sure you want to delete weld {weldToDelete?.weld_number}? This action cannot be undone.
          </Paragraph>
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setDeleteModalVisible(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleDeleteWeld} style={styles.deleteButton}>
              Delete
            </Button>
          </View>
        </Modal>
      </Portal>

      <ImageViewer
        visible={imageViewerVisible}
        onDismiss={() => setImageViewerVisible(false)}
        imageUri={selectedImage}
        title="Weld Image"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: weldingColors.background,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
    backgroundColor: weldingColors.surface,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: weldingColors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weldNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: weldingColors.primary,
  },
  dateChip: {
    backgroundColor: weldingColors.secondaryLight,
    borderColor: weldingColors.secondary,
  },
  cardDetails: {
    marginBottom: 16,
  },
  detail: {
    marginBottom: 4,
    color: weldingColors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
    borderColor: weldingColors.primary,
  },
  deleteButton: {
    borderColor: weldingColors.error,
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
  },
  modalTitle: {
    color: weldingColors.primary,
    marginBottom: 12,
  },
  modalText: {
    color: weldingColors.textSecondary,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: weldingColors.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: weldingColors.neutral,
    textAlign: 'center',
    marginTop: 5,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  weldImage: {
    width: '100%',
    height: '100%',
  },
});
