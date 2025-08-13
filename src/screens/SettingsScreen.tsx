import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  List,
  Card,
  Title,
  Paragraph,
  Divider,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { weldingColors } from '../theme/colors';

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const settingsOptions = [
    {
      title: 'Field Management',
      description: 'Manage custom fields and labels',
      icon: 'cog',
      onPress: () => navigation.navigate('FieldManagement'),
      testId: 'field-management-button',
    },
    {
      title: 'Import/Export',
      description: 'Import and export CSV data',
      icon: 'file-export',
      onPress: () => navigation.navigate('ImportExport'),
      testId: 'import-export-button',
    },
    {
      title: 'Data Backup',
      description: 'Backup and restore your welding data',
      icon: 'cloud-upload-outline',
      onPress: () => {},
      testId: 'data-backup-button',
    },
    {
      title: 'App Settings',
      description: 'Configure app preferences and appearance',
      icon: 'options-outline',
      onPress: () => {},
      testId: 'app-settings-button',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.appTitle}>Welding Work Manager</Title>
          <Paragraph style={styles.appDescription}>
            Manage your daily welding work details with customizable fields and easy data entry
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Configuration</Title>
          {settingsOptions.map((option, index) => (
            <View key={option.title}>
              <List.Item
                title={option.title}
                description={option.description}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={option.icon}
                    color={weldingColors.secondary}
                  />
                )}
                right={(props) => (
                  <List.Icon
                    {...props}
                    icon="chevron-forward"
                    color={weldingColors.neutral}
                  />
                )}
                onPress={option.onPress}
                style={styles.listItem}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
                data-testid={option.testId}
              />
              {index < settingsOptions.length - 1 && <Divider />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>App Information</Title>
          <View style={styles.infoRow}>
            <Paragraph style={styles.infoLabel}>Version:</Paragraph>
            <Paragraph style={styles.infoValue}>1.0.0</Paragraph>
          </View>
          <View style={styles.infoRow}>
            <Paragraph style={styles.infoLabel}>Database:</Paragraph>
            <Paragraph style={styles.infoValue}>PostgreSQL</Paragraph>
          </View>
          <View style={styles.infoRow}>
            <Paragraph style={styles.infoLabel}>Backend:</Paragraph>
            <Paragraph style={styles.infoValue}>Node.js + Express</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Paragraph style={styles.footerText}>
          Built for professional welding operations
        </Paragraph>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: weldingColors.background,
  },
  headerCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: weldingColors.primary,
  },
  appTitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  appDescription: {
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    backgroundColor: weldingColors.surface,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: weldingColors.primary,
  },
  listItem: {
    paddingVertical: 8,
  },
  listItemTitle: {
    color: weldingColors.textPrimary,
    fontWeight: '600',
  },
  listItemDescription: {
    color: weldingColors.textSecondary,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    backgroundColor: weldingColors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: weldingColors.textSecondary,
  },
  infoValue: {
    color: weldingColors.textPrimary,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    color: weldingColors.textLight,
    fontSize: 12,
  },
});
