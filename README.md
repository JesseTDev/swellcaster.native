# Swell Caster Native

A React Native application built with Expo for viewing surf conditions and forecasts.

## Features

- **Clean Architecture**: Separation of concerns with dedicated layers for API, data fetching, and UI
- **Type Safety**: Full TypeScript coverage with types matching the API models
- **Data Fetching**: TanStack Query (React Query) for efficient server state management
- **Reusable Components**: Modular, testable component architecture
- **Testing**: Jest and React Native Testing Library configured
- **Modern Expo**: Built with Expo SDK 54 and React 19

## Project Structure

```
src/
├── app/                    # Expo Router pages (tabs: home + map, sign-in)
├── components/             # Reusable UI components
│   ├── forecast/          # Shared forecast sections, daily/hourly cards
│   ├── charts/            # Wave height, tide charts
│   ├── map/               # Surf map and markers
│   ├── condition-video/   # Record + play crowdsourced clips
│   ├── auth/              # Clerk account button
│   └── ui/                # Forecast cards, badges, pickers
├── hooks/                  # Custom hooks
│   └── api/               # TanStack Query hooks
│       ├── use-forecast.ts
│       └── use-condition-videos.ts
├── services/               # External services
│   ├── api/               # API client and types
│   └── auth/              # Clerk token bridge
├── providers/              # QueryProvider, AuthTokenSync
└── constants/              # Theme, fonts, spacing
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

The app integrates with the SwellCaster.API backend. The primary hook is `useForecast`, which calls the combined forecast endpoint:

- `GET /api/swell/forecast?lat={lat}&lon={lon}&days={days}` — current, hourly, and daily in one response

The API also exposes `/api/swell/current`, `/hourly`, and `/daily` separately; the native app uses the combined endpoint only.

### Usage Example

```typescript
import { useForecast } from '@/hooks/api';

function MyComponent() {
  const { data, isLoading, error } = useForecast(
    { lat: -33.8568, lon: 151.2153, days: 7 },
    { enabled: true }
  );

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return <Text>{data?.current.swell.height} m swell</Text>;
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
import { ConditionBadge } from '@/components/ui/condition-badge';

test('renders rating label', () => {
  render(<ConditionBadge rating="good" />);
  expect(screen.getByText(/good/i)).toBeTruthy();
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
const { data } = useForecast(
  { lat: -33.8568, lon: 151.2153, days: 7 },
  { staleTime: 60000 }
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
EXPO_PUBLIC_API_URL=http://192.168.0.4:5213
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
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

- [Expo Documentation](https://docs.expo.dev/versions/v54.0.0/)
- [React Native](https://reactnative.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)

## License

Private - All rights reserved
