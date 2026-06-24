/**
 * CollapsibleForecastCard — forecast surface with expand/collapse header
 */

import { type ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';

import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { ForecastCard } from '@/components/ui/forecast-card';

interface CollapsibleForecastCardProps {
  title: string;
  subtitle?: string;
  action?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function CollapsibleForecastCard({
  title,
  subtitle,
  action,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  children,
  style,
  testID,
}: CollapsibleForecastCardProps) {
  return (
    <ForecastCard style={[styles.card, style]} testID={testID}>
      <CollapsibleSection
        title={title}
        subtitle={subtitle}
        action={action}
        defaultExpanded={defaultExpanded}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
      >
        {children}
      </CollapsibleSection>
    </ForecastCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
  },
});
