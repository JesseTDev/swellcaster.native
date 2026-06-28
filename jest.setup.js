import '@testing-library/jest-native/extend-expect';

process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??= 'pk_test_mock';

jest.mock('@clerk/expo', () => ({
  ClerkProvider: ({ children }) => children,
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
    getToken: jest.fn(async () => null),
    signOut: jest.fn(),
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  }),
  useSSO: () => ({ startSSOFlow: jest.fn() }),
}));

// Mock axios globally
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
      ...mockAxiosInstance,
    },
  };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => false,
  }),
  useLocalSearchParams: () => ({}),
  Link: 'Link',
}));

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
