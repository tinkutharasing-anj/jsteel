import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  TextInput,
  Text,
  Portal,
  Modal,
  List,
  Chip,
  Divider,
} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { apiService } from '../services/api';
import { weldingColors } from '../theme/colors';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import BetterDatePicker from '../components/BetterDatePicker';

export default function ImportExportScreen() {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [importedData, setImportedData] = useState<any>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Add web-specific CSS styles for gradient buttons
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        .gradient-import {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border: none !important;
          color: white !important;
          transition: all 0.3s ease !important;
        }
        .gradient-import:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
        }
        .gradient-export {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
          border: none !important;
          color: white !important;
          transition: all 0.3s ease !important;
        }
        .gradient-export:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(240, 147, 251, 0.4) !important;
        }
        .gradient-clear {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%) !important;
          border: none !important;
          color: #8b4513 !important;
          transition: all 0.3s ease !important;
        }
        .gradient-clear:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(252, 182, 159, 0.4) !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const handleImportCSV = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: 'text/csv',
        name: file.name,
      } as any);

      const response = await apiService.uploadCSV(formData as any);
      
      if (response.successCount > 0) {
        setImportedData(Array(response.successCount).fill({}));
        setImportPreview(Array(Math.min(response.successCount, 5)).fill({}));
        Alert.alert('Import Successful', `Imported ${response.successCount} records successfully`);
      } else {
        Alert.alert('Import Failed', 'No records were imported');
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);

      const filters: { date_from?: string; date_to?: string } = {};
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;

      if (Platform.OS === 'web') {
        // Web-specific export using direct download
        const params = new URLSearchParams();
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);

        const queryString = params.toString();
        const url = `http://localhost:3001/api/upload/export${queryString ? `?${queryString}` : ''}`;
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `welding-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Alert.alert('Export Complete', 'CSV file downloaded successfully');
      } else {
        // Mobile export using FileSystem and Sharing
        const blob = await apiService.exportCSV(filters);
        
        const fileName = `welding-data-${new Date().toISOString().split('T')[0]}.csv`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(fileUri, await blob.text());
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Welding Data',
          });
        } else {
          Alert.alert('Export Complete', `File saved as ${fileName}`);
        }
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `DATE,TYPE FIT,WPS,PIPE DIA,GRADE /CLASS,WELD #,WELDER,1st HT#,"1st Length",JT#,2nd HT#,"2nd Length",PRE HEAT,VT,Process,NDE#,Amps,Volts,IPM
2024-01-15,EL 90 to Pipe,WPS-6,24 inch,X65-x65,A1368,QA,CAAD,35.5 feet,,1F769H,21.5 feet,YES,HFW/DSAW,Gmaw-saw,Sk324,"31,63,25,333","27,30,33v",8-inch
2024-01-15,EL90-WNF,WPS-6,24inch,"24"" #300",A1369,QA,CAAD,90,,1F769H,WNF,Yes,HFW-DSAW,Gmaw -saw,,,,`;

    const fileName = 'sample-welding-data.csv';
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    FileSystem.writeAsStringAsync(fileUri, sampleData).then(async () => {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Sample CSV Template',
        });
      }
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Import Data</Title>
          <Paragraph style={styles.cardDescription}>
            Import welding data from CSV files. The CSV should match the expected format with headers.
          </Paragraph>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleImportCSV}
              style={styles.importButton}
              loading={loading}
              disabled={loading}
              data-testid="import-csv-button"
            >
              Import CSV
            </Button>
            <Button
              mode="outlined"
              icon="download"
              onPress={downloadSampleCSV}
              style={styles.sampleButton}
              textColor={weldingColors.primary}
            >
              Download Sample
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Export Data</Title>
          <Paragraph style={styles.cardDescription}>
            Export your welding data to CSV format. You can filter by date range.
          </Paragraph>
          
          <View style={styles.dateContainer}>
            <BetterDatePicker
              label="Date From"
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="2024-01-01"
            />
            <BetterDatePicker
              label="Date To"
              value={dateTo}
              onChange={setDateTo}
              placeholder="2024-12-31"
            />
            {(dateFrom || dateTo) && (
              <Button
                mode="outlined"
                onPress={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                style={styles.clearButton}
                textColor={weldingColors.error}
                icon="close"
              >
                Clear Dates
              </Button>
            )}
          </View>
          
          <Button
            mode="contained"
            onPress={handleExportCSV}
            style={styles.exportButton}
            loading={loading}
            disabled={loading}
            data-testid="export-csv-button"
          >
            Export CSV
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>CSV Format</Title>
          <Paragraph style={styles.cardDescription}>
            Your CSV file should include these columns (headers are case-sensitive):
          </Paragraph>
          
          <View style={styles.csvColumns}>
            {[
              'DATE', 'TYPE FIT', 'WPS', 'PIPE DIA', 'GRADE /CLASS', 'WELD #',
              'WELDER', '1st HT#', '1st Length', 'JT#', '2nd HT#', '2nd Length',
              'PRE HEAT', 'VT', 'Process', 'NDE#', 'Amps', 'Volts', 'IPM'
            ].map((column, index) => (
              <Chip key={index} mode="outlined" style={styles.columnChip}>
                {column}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={importedData !== null}
          onDismiss={() => setImportedData(null)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Import Results</Title>
          
          {importedData && (
            <View style={styles.importResults}>
              <View style={styles.resultRow}>
                <Paragraph>Total Rows:</Paragraph>
                <Paragraph style={styles.resultValue}>{importedData.length}</Paragraph>
              </View>
              <View style={styles.resultRow}>
                <Paragraph>Preview:</Paragraph>
                <List.Section>
                  {importPreview.map((item: any, index: number) => (
                    <View key={index} style={styles.previewItem}>
                      <Text style={styles.previewText}>Record {index + 1}</Text>
                    </View>
                  ))}
                </List.Section>
              </View>
              
              {importedData.length > 0 && (
                <View style={styles.errorsContainer}>
                  <Title style={styles.errorsTitle}>Imported Data:</Title>
                  {importedData.slice(0, 5).map((item: any, index: number) => (
                    <Paragraph key={index} style={styles.errorText}>
                      {JSON.stringify(item)}
                    </Paragraph>
                  ))}
                  {importedData.length > 5 && (
                    <Paragraph style={styles.errorText}>
                      ... and {importedData.length - 5} more records
                    </Paragraph>
                  )}
                </View>
              )}
            </View>
          )}
          
          <Button
            mode="contained"
            onPress={() => setImportedData(null)}
            style={styles.modalButton}
            buttonColor={weldingColors.secondary}
          >
            Close
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: weldingColors.background,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    backgroundColor: weldingColors.surface,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: weldingColors.primary,
  },
  cardDescription: {
    marginBottom: 16,
    color: weldingColors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  importButton: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      color: 'white',
      transition: 'all 0.3s ease',
    }),
  },
  sampleButton: {
    flex: 1,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateInputContainer: {
    position: 'relative',
  },
  dateInput: {
    marginBottom: 12,
    backgroundColor: weldingColors.surface,
  },
  exportButton: {
    width: '100%',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      border: 'none',
      color: 'white',
      transition: 'all 0.3s ease',
    }),
  },
  csvColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  columnChip: {
    marginBottom: 8,
    borderColor: weldingColors.neutralLight,
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
  importResults: {
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: weldingColors.neutralLight,
  },
  resultValue: {
    fontWeight: 'bold',
    color: weldingColors.secondary,
  },
  errorsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: weldingColors.error + '20',
    borderRadius: 8,
  },
  errorsTitle: {
    color: weldingColors.error,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  errorText: {
    color: weldingColors.error,
    fontSize: 12,
    marginBottom: 4,
  },
  modalButton: {
    width: '100%',
  },
  clearButton: {
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      border: 'none',
      color: '#8b4513',
      transition: 'all 0.3s ease',
    }),
  },
  input: {
    marginBottom: 12,
    backgroundColor: weldingColors.surface,
  },
  previewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: weldingColors.neutralLight,
  },
  previewText: {
    fontSize: 14,
    color: weldingColors.textSecondary,
  },
});
