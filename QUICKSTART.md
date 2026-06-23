# Quick Start Guide

This guide will help you get started with the Swell Caster API integration.

## 1. Configure Your API URL

Update the API URL in `src/services/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000', // Change to your API URL
  // ...
};
```

## 2. Using API Hooks

### Fetch Current Conditions

```typescript
import { useCurrent } from '@/hooks/api';

function MyComponent() {
  const { data, isLoading, error } = useCurrent({
    lat: -33.8568,
    lon: 151.2153,
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error!</Text>;

  return <Text>Wave Height: {data.wave.height}m</Text>;
}
```

### Fetch Hourly Forecast

```typescript
import { useHourly } from '@/hooks/api';

const { data, isLoading } = useHourly({
  lat: -33.8568,
  lon: 151.2153,
  hours: 24, // Optional: limit to 24 hours
});
```

### Fetch Daily Summary

```typescript
import { useDaily } from '@/hooks/api';

const { data, isLoading } = useDaily({
  lat: -33.8568,
  lon: 151.2153,
});
```

### Fetch Full Forecast

```typescript
import { useForecast } from '@/hooks/api';

const { data, isLoading } = useForecast({
  lat: -33.8568,
  lon: 151.2153,
});

// Access all data:
// data.current - Current conditions
// data.hourlyForecast - Array of hourly forecasts
// data.dailySummary - Array of daily summaries
// data.location - Location info
// data.timezone - Timezone string
```

## 3. Using Reusable Components

### CurrentConditions Component

```typescript
import { CurrentConditions } from '@/components/surf';
import { useCurrent } from '@/hooks/api';

function Screen() {
  const { data, isLoading, error } = useCurrent({
    lat: -33.8568,
    lon: 151.2153,
  });

  return (
    <CurrentConditions
      data={data}
      isLoading={isLoading}
      error={error}
      testID="conditions"
    />
  );
}
```

### WaveCard Component

```typescript
import { WaveCard } from '@/components/surf';

function MyComponent() {
  const waveData = {
    height: 1.5,
    direction: 180,
    period: 10,
  };

  return <WaveCard title="Current Wave" data={waveData} />;
}
```

## 4. Custom Query Options

Override default TanStack Query options:

```typescript
const { data } = useCurrent(
  { lat: -33.8568, lon: 151.2153 },
  {
    // Refetch every 2 minutes
    staleTime: 2 * 60 * 1000,
    
    // Refetch when user focuses app
    refetchOnWindowFocus: true,
    
    // Callback on success
    onSuccess: (data) => {
      console.log('Got data:', data);
    },
    
    // Callback on error
    onError: (error) => {
      console.error('Failed:', error);
    },
  }
);
```

## 5. TypeScript Types

All API types are exported and available:

```typescript
import type {
  SurfForecastResponse,
  CurrentConditions,
  ForecastHour,
  DailySummary,
  WaveData,
  SwellData,
  WindWaveData,
} from '@/services/api';

function processWave(wave: WaveData) {
  console.log(`Height: ${wave.height}m`);
  if (wave.direction) {
    console.log(`Direction: ${wave.direction}°`);
  }
}
```

## 6. Testing Your Components

Example test:

```typescript
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

test('renders current conditions', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const { getByText } = render(
    <QueryClientProvider client={queryClient}>
      <MyComponent />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(getByText(/Wave Height/i)).toBeTruthy();
  });
});
```

## 7. Example Screen

Check out `src/app/example.tsx` for a complete working example!

## 8. Available API Endpoints

| Hook | Endpoint | Returns |
|------|----------|---------|
| `useForecast` | `/api/swell/forecast` | Full forecast data |
| `useCurrent` | `/api/swell/current` | Current conditions only |
| `useHourly` | `/api/swell/hourly` | Hourly forecast array |
| `useDaily` | `/api/swell/daily` | Daily summary array |

## 9. Error Handling

All hooks return an `error` object:

```typescript
const { data, isLoading, error } = useCurrent(coords);

if (error) {
  if (error.response?.status === 404) {
    return <Text>Location not found</Text>;
  }
  return <Text>Error: {error.message}</Text>;
}
```

## 10. Manual Refetch

```typescript
const { data, refetch, isRefetching } = useCurrent(coords);

// Manual refresh
<Button 
  onPress={() => refetch()} 
  title={isRefetching ? "Refreshing..." : "Refresh"}
/>
```

## Next Steps

1. Update the API URL in `config.ts`
2. Replace example coordinates with your target location
3. Build your UI using the provided hooks and components
4. Add more reusable components as needed
5. Write tests for your components

Happy coding!
