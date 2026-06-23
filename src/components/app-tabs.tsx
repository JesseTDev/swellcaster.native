import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { ForecastColors } from '@/constants/forecast-theme';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];
  const colors = Colors[scheme];

  return (
    <NativeTabs tintColor={palette.accent} labelStyle={{ color: colors.textSecondary }}>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="map">
        <Label>Map</Label>
        <Icon sf={{ default: 'map', selected: 'map.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
