import '@testing-library/jest-native/extend-expect';

// Mock expo modules
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/document/directory/',
  writeAsStringAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({}),
}));

// Mock react-native-modal-datetime-picker
jest.mock('react-native-modal-datetime-picker', () => 'DateTimePickerModal');

// Global test utilities
global.fetch = jest.fn();

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn((obj) => obj.web),
}));

// Suppress console warnings during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
