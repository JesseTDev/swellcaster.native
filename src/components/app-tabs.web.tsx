import type { Href } from 'expo-router';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { PlatformSymbol, type PlatformSymbolName } from '@/components/ui/platform-symbol';

import { ForecastColors } from '@/constants/forecast-theme';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TabName = 'home' | 'map';

const TABS: { name: TabName; href: Href; label: string; icon: TabName }[] = [
  { name: 'home', href: '/', label: 'Home', icon: 'home' },
  { name: 'map', href: '/map', label: 'Map', icon: 'map' },
];

function TabBarContainer({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.two),
          backgroundColor: colors.background,
          borderTopColor: ForecastColors[scheme].border,
        },
      ]}
    >
      {children}
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabBarContainer>
        <TabList style={styles.tabList}>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton label={tab.label} icon={tab.icon} />
            </TabTrigger>
          ))}
        </TabList>
      </TabBarContainer>
    </Tabs>
  );
}

function TabButton({
  label,
  icon,
  isFocused,
  ...props
}: TabTriggerSlotProps & { label: string; icon: TabName }) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];
  const colors = Colors[scheme];
  const active = Boolean(isFocused);

  const iconName: PlatformSymbolName =
    icon === 'home'
      ? active
        ? { ios: 'house.fill', android: 'home', web: 'home' }
        : { ios: 'house', android: 'home', web: 'home' }
      : active
        ? { ios: 'map.fill', android: 'map', web: 'map' }
        : { ios: 'map', android: 'map', web: 'map' };

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <PlatformSymbol
        name={iconName}
        size={22}
        weight={active ? 'semibold' : 'regular'}
        tintColor={active ? palette.accent : colors.textSecondary}
      />
      <ThemedText
        style={[styles.tabLabel, { color: active ? palette.accent : colors.textSecondary }]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabList: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  tabButton: {
    minWidth: 88,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.one,
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
