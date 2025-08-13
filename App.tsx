import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { weldingColors } from './src/theme/colors';

import WeldsScreen from './src/screens/WeldsScreen';
import AddWeldScreen from './src/screens/AddWeldScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FieldManagementScreen from './src/screens/FieldManagementScreen';
import ImportExportScreen from './src/screens/ImportExportScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: weldingColors.primary,
    primaryContainer: weldingColors.primaryLight,
    secondary: weldingColors.secondary,
    secondaryContainer: weldingColors.secondaryLight,
    surface: weldingColors.surface,
    background: weldingColors.background,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: weldingColors.textPrimary,
    onBackground: weldingColors.textPrimary,
  },
};

const WeldsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="WeldsList" 
      component={WeldsScreen} 
      options={{ title: 'Welding Log' }}
    />
    <Stack.Screen 
      name="AddWeld" 
      component={AddWeldScreen} 
      options={{ title: 'Add New Weld' }}
    />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SettingsMain" 
      component={SettingsScreen} 
      options={{ title: 'Settings' }}
    />
    <Stack.Screen 
      name="FieldManagement" 
      component={FieldManagementScreen} 
      options={{ title: 'Field Management' }}
    />
    <Stack.Screen 
      name="ImportExport" 
      component={ImportExportScreen} 
      options={{ title: 'Import/Export' }}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <PaperProvider theme={customTheme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Welds') {
                iconName = focused ? 'flame' : 'flame-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: weldingColors.secondary,
            tabBarInactiveTintColor: weldingColors.neutral,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: weldingColors.surface,
              borderTopColor: weldingColors.neutralLight,
            },
          })}
        >
          <Tab.Screen name="Welds" component={WeldsStack} />
          <Tab.Screen name="Settings" component={SettingsStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
