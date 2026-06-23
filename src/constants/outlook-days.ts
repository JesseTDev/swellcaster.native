/** Open-Meteo marine API supports up to 16 forecast days (not 30). */

export const MAX_OUTLOOK_DAYS = 16;

export const OUTLOOK_DAY_OPTIONS = [7, 14, 16] as const;

export type OutlookDays = (typeof OUTLOOK_DAY_OPTIONS)[number];

export function isOutlookDays(value: number): value is OutlookDays {
  return OUTLOOK_DAY_OPTIONS.includes(value as OutlookDays);
}

export function clampOutlookDays(days: number): OutlookDays {
  if (days >= 16) return 16;
  if (days >= 14) return 14;
  return 7;
}
