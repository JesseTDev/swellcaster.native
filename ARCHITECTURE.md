# Swell Caster Native - Architecture Overview

## Project Setup Complete ✓

Your React Native project has been set up with industry best practices, including:

- ✅ **API Layer** - Type-safe axios client with interceptors
- ✅ **Data Fetching** - TanStack Query for server state management
- ✅ **Reusable Components** - Modular, testable UI components
- ✅ **Testing Infrastructure** - Jest with passing tests
- ✅ **TypeScript** - Full type safety matching your API models
- ✅ **Clean Architecture** - Separation of concerns

## Architecture Layers

### 1. API Service Layer (`src/services/api/`)

**Purpose**: Centralized API communication with type safety

**Files**:
- `types.ts` - TypeScript interfaces matching your C# API models
- `config.ts` - API configuration (base URL, timeout, endpoints)
- `client.ts` - Axios instance with request/response interceptors
- `endpoints.ts` - Type-safe API methods (getForecast, getCurrent, etc.)
- `index.ts` - Barrel export for clean imports

**Key Features**:
- Automatic request/response logging in development
- Global error handling
- Request/response interceptors for auth tokens
- Type-safe API calls

**Example**:
```typescript
import { swellApi } from '@/services/api';

const forecast = await swellApi.getForecast({ lat: -33.8568, lon: 151.2153 });
```

---

### 2. Data Fetching Layer (`src/hooks/api/`)

**Purpose**: React hooks for data fetching using TanStack Query

**Files**:
- `use-forecast.ts` - Hook for full forecast data
- `use-current.ts` - Hook for current conditions
- `use-hourly.ts` - Hook for hourly forecast  
- `use-daily.ts` - Hook for daily summary
- `index.ts` - Barrel export

**Key Features**:
- Automatic caching (5 min stale time, 10 min cache time)
- Automatic retries on failure
- Loading and error states
- Refetch on window focus (development only)
- Background refetching

**Example**:
```typescript
import { useCurrent } from '@/hooks/api';

function MyComponent() {
  const { data, isLoading, error, refetch } = useCurrent({
    lat: -33.8568,
    lon: 151.2153,
  });

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return <Display data={data} />;
}
```

---

### 3. Component Layer (`src/components/`)

**Purpose**: Reusable, testable UI components

**Structure**:
```
src/components/
├── surf/                    # Surf-specific components
│   ├── wave-card.tsx       # Display wave data
│   ├── current-conditions.tsx
│   └── index.ts
├── themed-text.tsx          # Existing themed components
├── themed-view.tsx
└── ...
```

**Component Guidelines**:
1. Single responsibility
2. TypeScript props interface
3. `testID` prop for testing
4. Themed components for styling consistency
5. Error and loading states handled

**Example**:
```typescript
<WaveCard 
  title="Current Wave" 
  data={{ height: 1.5, direction: 180, period: 10 }}
  testID="wave-card"
/>
```

---

### 4. Provider Layer (`src/providers/`)

**Purpose**: React context providers

**Files**:
- `query-provider.tsx` - TanStack Query configuration

**Setup**: Already integrated in `_layout.tsx`

---

### 5. Testing Layer (`__tests__/`)

**Purpose**: Automated testing with Jest

**Configuration**:
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Global mocks and setup
- `__mocks__/` - Mock files

**Current Coverage**:
- ✅ API endpoints (5 tests passing)
- Path aliases working (`@/...`)
- Axios mocked globally
- CSS imports mocked

**Run Tests**:
```bash
npm test                  # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # Coverage report
```

---

## API Integration

### Available Endpoints

| Hook | API Endpoint | Returns | Use Case |
|------|-------------|---------|----------|
| `useForecast` | `/api/swell/forecast` | Full forecast with current, hourly, daily | Dashboard, overview screens |
| `useCurrent` | `/api/swell/current` | Current conditions only | Quick status widgets |
| `useHourly` | `/api/swell/hourly` | Hourly forecast array | Hour-by-hour charts |
| `useDaily` | `/api/swell/daily` | Daily summary array | Multi-day forecasts |

### API Configuration

Update `src/services/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:5000'           // Development
    : 'https://your-api.com',            // Production
  TIMEOUT: 10000,
  ENDPOINTS: { /* ... */ }
};
```

For environment variables, create `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:5000
```

Then use in config:
```typescript
BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'
```

---

## Type System

### Type Flow

```
C# API Models → TypeScript Types → React Components
```

**Example Flow**:
1. C# API returns `CurrentConditions`
2. TypeScript types defined in `types.ts`
3. TanStack Query hook typed as `UseQueryResult<CurrentConditions>`
4. Component receives typed `data: CurrentConditions`

### Adding New Types

When API changes:
1. Update `src/services/api/types.ts`
2. Add endpoint to `endpoints.ts`
3. Create hook in `src/hooks/api/`
4. Use in components

---

## Best Practices Implemented

### Code Organization
- ✅ Barrel exports (`index.ts`) for clean imports
- ✅ Colocation (tests near source files)
- ✅ Feature-based folders (`surf/`, `api/`)

### React Patterns
- ✅ Custom hooks for data fetching
- ✅ Compound components pattern
- ✅ Props interfaces for all components
- ✅ Error boundaries ready

### API Patterns
- ✅ Single axios instance
- ✅ Centralized error handling
- ✅ Request/response interceptors
- ✅ Type-safe API calls

### Testing Patterns
- ✅ Mock at the boundary (axios)
- ✅ Test behavior, not implementation
- ✅ Descriptive test names
- ✅ Arrange-Act-Assert pattern

---

## Next Steps

### 1. Update API Configuration
```bash
# Edit src/services/api/config.ts
# Set your API BASE_URL
```

### 2. Test API Connection
```bash
# Start your API
cd ../SwellCaster.API
dotnet run

# Start Expo
cd ../native
npm start
```

### 3. Build Your First Screen
```typescript
// src/app/surf.tsx
import { useCurrent } from '@/hooks/api';
import { CurrentConditions } from '@/components/surf';

export default function SurfScreen() {
  const { data, isLoading, error } = useCurrent({
    lat: -33.8915,
    lon: 151.2767,
  });

  return (
    <CurrentConditions
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

### 4. Add More Components

**Create reusable components for**:
- Hourly forecast list/carousel
- Daily forecast cards
- Wave height charts
- Location selector
- Forecast details

**Component Template**:
```typescript
interface MyComponentProps {
  data: SomeType;
  onPress?: () => void;
  testID?: string;
}

export function MyComponent({ data, onPress, testID }: MyComponentProps) {
  return (
    <ThemedView style={styles.container} testID={testID}>
      {/* Component content */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { /* styles */ },
});
```

### 5. Add Tests

```bash
# Create test file next to component
touch src/components/my-component.test.tsx

# Run tests
npm test -- --watch
```

---

## File Structure Summary

```
native/
├── src/
│   ├── app/                      # Expo Router pages
│   │   ├── _layout.tsx          # Root layout (QueryProvider added)
│   │   ├── index.tsx            # Home screen
│   │   ├── explore.tsx          # Explore screen
│   │   └── example.tsx          # Example usage ✨
│   │
│   ├── services/                 # External services
│   │   └── api/                 # API layer
│   │       ├── types.ts         # TypeScript types ✨
│   │       ├── config.ts        # API configuration ✨
│   │       ├── client.ts        # Axios instance ✨
│   │       ├── endpoints.ts     # API methods ✨
│   │       ├── index.ts         # Exports ✨
│   │       └── __tests__/       # API tests ✨
│   │           └── endpoints.test.ts
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── api/                 # Data fetching hooks
│   │   │   ├── use-forecast.ts  # ✨
│   │   │   ├── use-current.ts   # ✨
│   │   │   ├── use-hourly.ts    # ✨
│   │   │   ├── use-daily.ts     # ✨
│   │   │   └── index.ts         # ✨
│   │   └── ...
│   │
│   ├── components/               # UI components
│   │   ├── surf/                # Surf components
│   │   │   ├── wave-card.tsx    # ✨
│   │   │   ├── current-conditions.tsx  # ✨
│   │   │   └── index.ts         # ✨
│   │   └── ...
│   │
│   ├── providers/                # React providers
│   │   └── query-provider.tsx   # ✨
│   │
│   └── constants/                # App constants
│
├── __mocks__/                    # Jest mocks ✨
│   └── styleMock.js
│
├── jest.config.js                # Jest configuration ✨
├── jest.setup.js                 # Jest setup ✨
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies ✨
├── .env.example                  # Environment template ✨
├── README.md                     # Documentation ✨
└── QUICKSTART.md                 # Quick reference ✨

✨ = New or updated files
```

---

## Commands Reference

```bash
# Development
npm start                # Start Expo dev server
npm run ios             # Run on iOS
npm run android         # Run on Android  
npm run web             # Run on web

# Testing
npm test                # Run tests once
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage report

# Linting
npm run lint            # Run linter
```

---

## Resources

- **Expo v56 Docs**: https://docs.expo.dev/versions/v56.0.0/
- **TanStack Query**: https://tanstack.com/query/latest
- **React Native**: https://reactnative.dev/
- **Testing Library**: https://callstack.github.io/react-native-testing-library/

---

## Support Files Created

1. `README.md` - Full documentation
2. `QUICKSTART.md` - Quick reference guide
3. `ARCHITECTURE.md` - This file
4. `.env.example` - Environment template
5. Example screen showing usage

---

## Summary

Your project is now ready for development with:

- ✅ **Clean architecture** with clear separation of concerns
- ✅ **Type-safe API integration** with your C# backend
- ✅ **Modern data fetching** with TanStack Query
- ✅ **Reusable components** ready to build on
- ✅ **Testing infrastructure** with passing tests
- ✅ **Best practices** throughout the codebase

**Next**: Update the API URL and start building your screens!
