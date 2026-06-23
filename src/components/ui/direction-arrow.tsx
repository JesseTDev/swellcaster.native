/**
 * DirectionArrow — compass dial pointing where swell/wind come FROM
 */

import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { directionToArrowRotation } from '@/utils/direction';
import { formatDirectionFull } from '@/utils/forecast';

interface DirectionArrowProps {
  /** Degrees the swell/wind is coming FROM (meteorological) */
  fromDegrees: number;
  color?: string;
  size?: number;
  showLabel?: boolean;
  label?: string;
}

export function DirectionArrow({
  fromDegrees,
  color = '#64748B',
  size = 32,
  showLabel = true,
  label,
}: DirectionArrowProps) {
  const rotation = directionToArrowRotation(fromDegrees);
  const center = size / 2;
  const radius = size / 2 - 0.5;
  const stroke = Math.max(1.5, size * 0.07);
  const pad = size * 0.14;
  const tipY = pad;
  const tailY = size - pad;
  const wing = size * 0.17;

  const headPath = [
    `M ${center} ${tipY}`,
    `L ${center - wing} ${tipY + wing * 1.15}`,
    `M ${center} ${tipY}`,
    `L ${center + wing} ${tipY + wing * 1.15}`,
  ].join(' ');

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={center} cy={center} r={radius} fill={color} opacity={0.12} />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.22}
        />

        {/* North tick — fixed reference while arrow rotates */}
        <Line
          x1={center}
          y1={pad * 0.55}
          x2={center}
          y2={pad * 0.95}
          stroke={color}
          strokeWidth={1}
          opacity={0.35}
          strokeLinecap="round"
        />

        <G transform={`rotate(${rotation}, ${center}, ${center})`}>
          <Line
            x1={center}
            y1={tipY + wing * 0.35}
            x2={center}
            y2={tailY}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <Path
            d={headPath}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Circle cx={center} cy={center} r={stroke * 0.45} fill={color} opacity={0.85} />
        </G>
      </Svg>
      {showLabel ? (
        <ThemedText themeColor="textSecondary" style={styles.degrees}>
          {label ?? formatDirectionFull(fromDegrees)}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  degrees: {
    fontSize: 11,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});
