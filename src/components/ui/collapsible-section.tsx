/**
 * CollapsibleSection — tappable section header with expand/collapse
 */

import { PlatformSymbol } from '@/components/ui/platform-symbol';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ForecastColors, ForecastRadii, ForecastTypography } from '@/constants/forecast-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  action?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  action,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  children,
}: CollapsibleSectionProps) {
  const [expandedInternal, setExpandedInternal] = useState(defaultExpanded);
  const expanded = expandedProp ?? expandedInternal;
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];
  const theme = useTheme();

  const toggleExpanded = () => {
    const next = !expanded;
    if (expandedProp == null) {
      setExpandedInternal(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.header,
          {
            backgroundColor: expanded ? palette.surface : 'transparent',
            borderColor: palette.borderStrong,
          },
          expanded && styles.headerExpanded,
          !expanded && styles.headerCollapsed,
          pressed && styles.headerPressed,
        ]}
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${expanded ? 'collapse' : 'expand'}`}
      >
        <PlatformSymbol
          name={{ ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' }}
          size={12}
          weight="semibold"
          tintColor={theme.textSecondary}
          style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
        />

        <View style={styles.textGroup}>
          <ThemedText type="smallBold" style={styles.title}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>

        {action ? (
          <ThemedText themeColor="textSecondary" style={styles.action}>
            {action}
          </ThemedText>
        ) : null}
      </Pressable>

      {expanded ? (
        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
          <View style={[styles.divider, { backgroundColor: palette.borderStrong }]} />
          <View style={styles.body}>{children}</View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: -14,
    marginTop: -14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  headerExpanded: {
    borderBottomWidth: 0,
    borderRadius: ForecastRadii.inner,
    marginBottom: 0,
  },
  headerCollapsed: {
    marginBottom: -14,
  },
  headerPressed: {
    opacity: 0.75,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    ...ForecastTypography.sectionTitle,
  },
  subtitle: {
    ...ForecastTypography.caption,
    marginTop: 2,
  },
  action: {
    ...ForecastTypography.caption,
    maxWidth: '40%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginHorizontal: -14,
  },
  body: {
    paddingTop: 12,
  },
});
