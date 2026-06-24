# Swell Caster Native

A React Native application built with Expo for viewing surf conditions and forecasts.

## Features

- **Clean Architecture**: Separation of concerns with dedicated layers for API, data fetching, and UI
- **Type Safety**: Full TypeScript coverage with types matching the API models
- **Data Fetching**: TanStack Query (React Query) for efficient server state management
- **Reusable Components**: Modular, testable component architecture
- **Testing**: Jest and React Native Testing Library configured
- **Modern Expo**: Built with Expo SDK 56 and React 19

## Project Structure

```
src/
├── app/                    # Expo Router pages
├── components/             # Reusable UI components
│   ├── surf/              # Surf-specific components
│   │   ├── wave-card.tsx
│   │   └── current-conditions.tsx
│   └── ...
├── hooks/                  # Custom hooks
│   └── api/               # TanStack Query hooks
│       ├── use-forecast.ts
│       ├── use-current.ts
│       ├── use-hourly.ts
│       └── use-daily.ts
├── services/               # External services
│   └── api/               # API client and types
│       ├── types.ts       # TypeScript types
│       ├── config.ts      # API configuration
│       ├── client.ts      # Axios instance
│       └── endpoints.ts   # API endpoints
├── providers/              # React context providers
│   └── query-provider.tsx # TanStack Query provider
└── constants/              # App constants
```

## Getting Started

See **[QUICKSTART.md](./QUICKSTART.md)** for the full local dev guide (API + phone + troubleshooting).

**Documentation:** [docs/](./docs/README.md) — detailed guides including [surf forecast videos](./docs/SURF_FORECAST_VIDEOS.md) (map recording, film icons, API flow).

**Quick version — two terminals:**

```bash
# Terminal 1 — API (from ../SwellCaster.API)
dotnet run --launch-profile http

# Terminal 2 — app (from this folder)
npm install
npm run start:phone
```

Scan the QR code with **Expo Go** on your phone (same Wi‑Fi as your Mac).

| Command | Use case |
|---------|----------|
| `npm run start:phone` | Physical device via Expo Go (recommended) |
| `npm run ios` | iOS Simulator |
| `npm run android` | Android emulator |
| `npm start` | Expo menu — pick platform |

Dev API URL is chosen automatically in `src/services/api/config.ts` (Metro proxy on phone, `localhost:5213` on simulator).

## API Integration

### Available Endpoints

The app integrates with the following API endpoints:

- `GET /api/swell/forecast?lat={lat}&lon={lon}` - Full forecast
- `GET /api/swell/current?lat={lat}&lon={lon}` - Current conditions
- `GET /api/swell/hourly?lat={lat}&lon={lon}&hours={hours}` - Hourly forecast
- `GET /api/swell/daily?lat={lat}&lon={lon}` - Daily summary

### Usage Example

```typescript
import { useCurrent } from '@/hooks/api';

function MyComponent() {
  const { data, isLoading, error } = useCurrent({
    lat: -33.8568,
    lon: 151.2153,
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return <CurrentConditions data={data} />;
}
```

## Testing

### Run Tests

```bash
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Generate coverage report
```

### Test Structure

- Unit tests: `__tests__/*.test.ts(x)`
- Component tests: Use React Native Testing Library
- Hook tests: Use `renderHook` from Testing Library
- API tests: Mock axios and test endpoints

### Example Test

```typescript
import { render, screen } from '@testing-library/react-native';
import { WaveCard } from '@/components/surf/wave-card';

test('renders wave data', () => {
  render(
    <WaveCard 
      title="Wave" 
      data={{ height: 1.5, direction: 180, period: 10 }}
    />
  );
  
  expect(screen.getByText('1.5m')).toBeTruthy();
});
```

## Component Guidelines

### Reusable Components

- Each component should have a single responsibility
- Include TypeScript types/interfaces for all props
- Add `testID` prop for testing
- Use themed components for consistent styling
- Export from index files for clean imports

### Example Component Structure

```typescript
/**
 * Component Name
 * Brief description of what it does
 */

import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
  testID?: string;
}

export function MyComponent({ title, onPress, testID }: MyComponentProps) {
  return (
    <View style={styles.container} testID={testID}>
      <ThemedText>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

## Code Quality

### TypeScript

- Strict mode enabled
- No implicit `any` types
- Full type coverage for API responses
- Import types with `import type` when possible

### Best Practices

- Use functional components with hooks
- Implement proper error handling
- Keep components small and focused
- Use meaningful variable and function names
- Add comments for complex logic only
- Follow React Native performance best practices

## TanStack Query Configuration

### Query Settings

Defaults in `src/providers/query-provider.tsx`: 5 min stale time, no refetch on window focus. Per-hook overrides (e.g. spot conditions 15 min) live in `src/hooks/`.

### Custom Query Options

All hooks accept custom options:

```typescript
const { data } = useCurrent(
  { lat: -33.8568, lon: 151.2153 },
  {
    staleTime: 60000, // Override to 1 minute
    onSuccess: (data) => console.log('Success!', data),
  }
);
```

## Environment Variables

For production, use environment variables:

```typescript
// In config.ts
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
  // ...
};
```

Create `.env` file:
```
EXPO_PUBLIC_API_URL=https://api.example.com
```

## Scripts

- `npm run start:phone` - Expo Go on a physical device (QR code)
- `npm start` - Expo development server
- `npm run ios` - iOS Simulator
- `npm run android` - Android emulator
- `npm run web` - Web browser
- `npm test` - Run tests
- `npm run lint` - Run linter

## Contributing

1. Follow the established project structure
2. Write tests for new features
3. Use TypeScript strictly
4. Keep components reusable
5. Document complex logic
6. Run tests before committing

## Resources

- [Expo Documentation](https://docs.expo.dev/versions/v56.0.0/)
- [React Native](https://reactnative.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

## License

Private - All rights reserved
