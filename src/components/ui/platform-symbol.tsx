/**
 * PlatformSymbol — SF Symbol on iOS with Material Icons fallback on Android/web.
 * SDK 54 SymbolView accepts an iOS symbol name only; use this for cross-platform icons.
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type PlatformSymbolName = {
  ios: SFSymbol;
  android: MaterialIconName;
  web: MaterialIconName;
};

type PlatformSymbolProps = Omit<SymbolViewProps, 'name' | 'fallback'> & {
  name: PlatformSymbolName;
};

export function PlatformSymbol({ name, size = 24, tintColor, ...rest }: PlatformSymbolProps) {
  const fallbackName = Platform.OS === 'web' ? name.web : name.android;

  return (
    <SymbolView
      name={name.ios}
      size={size}
      tintColor={tintColor}
      fallback={
        <MaterialIcons name={fallbackName} size={size} color={String(tintColor ?? '#000')} />
      }
      {...rest}
    />
  );
}
