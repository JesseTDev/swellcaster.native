/**
 * LocationSearchBar — tap magnifying glass to search beaches and places worldwide
 */

import { PlatformSymbol } from '@/components/ui/platform-symbol';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ForecastColors } from '@/constants/forecast-theme';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useRecentLocationSearchStore } from '@/stores/recent-location-search-store';
import { useSelectedLocationStore } from '@/stores/selected-location-store';
import {
  LocationSearchError,
  SEARCH_EXAMPLES,
  searchPlaces,
  type LocationSearchResult,
} from '@/utils/location-search';

interface LocationSearchBarProps {
  placeholder?: string;
  testID?: string;
  onSelect?: (result: LocationSearchResult) => void;
}

export function LocationSearchBar({
  placeholder = 'Search beaches worldwide…',
  testID = 'location-search',
  onSelect,
}: LocationSearchBarProps) {
  const scheme = useColorScheme();
  const palette = ForecastColors[scheme];
  const colors = Colors[scheme];
  const setManualLocation = useSelectedLocationStore((s) => s.setManualLocation);
  const recentSearches = useRecentLocationSearchStore((s) => s.recent);
  const addRecentSearch = useRecentLocationSearchStore((s) => s.addRecent);
  const inputRef = useRef<TextInput>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const selectingRef = useRef(false);

  const debouncedQuery = useDebouncedValue(query, 350);

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setSearchError(null);

    searchPlaces(trimmed)
      .then((nextResults) => {
        if (cancelled) return;
        setResults(nextResults);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setResults([]);
        setSearchError(
          error instanceof LocationSearchError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Search failed. Is the API running?'
        );
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isOpen]);

  const showTypedResults = isOpen && query.trim().length > 0;
  const showSuggestions = isOpen && query.trim().length === 0;

  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSearchError(null);
    Keyboard.dismiss();
  };

  const openSearch = () => {
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const beginSelection = () => {
    selectingRef.current = true;
  };

  const handleSelect = (result: LocationSearchResult) => {
    beginSelection();
    Keyboard.dismiss();
    addRecentSearch(result);
    setManualLocation(result.coords, result.label);
    onSelect?.(result);
    closeSearch();
    setTimeout(() => {
      selectingRef.current = false;
    }, 300);
  };

  const handleSubmit = () => {
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (selectingRef.current) return;
      if (query.trim().length === 0) {
        setIsOpen(false);
      }
    }, 250);
  };

  const renderResultRow = (result: LocationSearchResult) => (
    <Pressable
      key={result.id}
      style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
      onPressIn={beginSelection}
      onPress={() => handleSelect(result)}
      testID={`${testID}-result-${result.id}`}
    >
      <PlatformSymbol
        name={iconForResult(result.source)}
        size={16}
        weight="medium"
        tintColor={palette.accent}
      />
      <View style={styles.resultText}>
        <ThemedText style={styles.resultLabel}>{result.label}</ThemedText>
        {result.subtitle ? (
          <ThemedText themeColor="textSecondary" style={styles.resultSubtitle}>
            {result.subtitle}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );

  if (!isOpen) {
    return (
      <View style={[styles.container, styles.collapsedContainer]} testID={testID}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
            pressed && styles.pressed,
          ]}
          onPress={openSearch}
          accessibilityRole="button"
          accessibilityLabel="Search locations worldwide"
          testID={`${testID}-toggle`}
        >
          <PlatformSymbol
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
            weight="medium"
            tintColor={palette.accent}
          />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: palette.surfaceElevated,
            borderColor: palette.accent,
          },
        ]}
      >
        <PlatformSymbol
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size={16}
          weight="medium"
          tintColor={palette.muted}
        />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor={palette.muted}
          style={[styles.input, { color: colors.text }]}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
          clearButtonMode="while-editing"
          testID={`${testID}-input`}
        />
        {isSearching ? <ActivityIndicator size="small" color={palette.accent} /> : null}
        <Pressable
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          onPress={closeSearch}
          accessibilityRole="button"
          accessibilityLabel="Close search"
          hitSlop={8}
          testID={`${testID}-close`}
        >
          <PlatformSymbol
            name={{ ios: 'xmark', android: 'close', web: 'close' }}
            size={14}
            weight="semibold"
            tintColor={palette.muted}
          />
        </Pressable>
      </View>

      {showSuggestions ? (
        <View
          style={[
            styles.results,
            {
              backgroundColor: palette.surfaceElevated,
              borderColor: palette.border,
            },
          ]}
        >
          {recentSearches.length > 0 ? (
            <View style={styles.section}>
              <ThemedText themeColor="textSecondary" style={styles.sectionLabel}>
                Recent
              </ThemedText>
              <ScrollView
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
              >
                {recentSearches.map((entry) =>
                  renderResultRow({ ...entry, source: 'recent' })
                )}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText themeColor="textSecondary" style={styles.sectionLabel}>
              Try anywhere in the world
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.exampleRow}
            >
              {SEARCH_EXAMPLES.map((example) => (
                <Pressable
                  key={example}
                  style={({ pressed }) => [
                    styles.exampleChip,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                    },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setQuery(example)}
                  testID={`${testID}-example-${example}`}
                >
                  <ThemedText style={styles.exampleChipText}>{example}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
            <ThemedText themeColor="textSecondary" style={styles.hintText}>
              Search beach names worldwide — e.g. Bondi Beach, Uluwatu, Byron Bay.
            </ThemedText>
          </View>
        </View>
      ) : null}

      {showTypedResults ? (
        <View
          style={[
            styles.results,
            {
              backgroundColor: palette.surfaceElevated,
              borderColor: palette.border,
            },
          ]}
        >
          {results.length > 0 ? (
            <ScrollView
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled
              style={styles.resultsScroll}
            >
              {results.map((result) => renderResultRow(result))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                {isSearching
                  ? 'Searching beaches worldwide…'
                  : searchError ?? 'No beaches found. Try adding “Beach” — e.g. Bondi Beach.'}
              </ThemedText>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

function iconForResult(source: LocationSearchResult['source']) {
  switch (source) {
    case 'spot':
      return { ios: 'water.waves' as const, android: 'waves' as const, web: 'waves' as const };
    case 'recent':
      return { ios: 'clock' as const, android: 'schedule' as const, web: 'schedule' as const };
    default:
      return {
        ios: 'mappin.and.ellipse' as const,
        android: 'location-on' as const,
        web: 'location-on' as const,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.two,
    zIndex: 10,
  },
  collapsedContainer: {
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  results: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultsScroll: {
    maxHeight: 280,
  },
  section: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  exampleRow: {
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 8,
  },
  exampleChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  exampleChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  resultRowPressed: {
    opacity: 0.7,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyState: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
