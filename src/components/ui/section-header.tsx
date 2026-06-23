/**
 * SectionHeader — consistent section titles
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  },
});
