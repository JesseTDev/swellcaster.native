/**
 * CollapsibleSection — tappable section header with expand/collapse
 */

import { PlatformSymbol } from '@/components/ui/platform-symbol';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  action?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  subtitle,
  action,
  defaultExpanded = true,
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.header,
          !expanded && styles.headerCollapsed,
          pressed && styles.headerPressed,
        ]}
        onPress={() => setExpanded((value) => !value)}
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
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  headerCollapsed: {
    marginBottom: 0,
  },
  headerPressed: {
    opacity: 0.7,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  action: {
    fontSize: 12,
    maxWidth: '35%',
    textAlign: 'right',
  },
});
