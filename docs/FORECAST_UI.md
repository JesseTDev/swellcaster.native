# Forecast UI

How the native app presents surf conditions on the **home** screen, **map spot sheet**, and **extended outlook**.

---

## Shared forecast block

`LocationForecastSections` (`src/components/forecast/location-forecast-sections.tsx`) is used by:

- **Home** (`src/app/(tabs)/index.tsx`) — GPS or searched location
- **Map** (`src/app/(tabs)/map.tsx`) — tap a spot or map point

This keeps one layout for header, hero conditions, hourly preview, charts, and daily outlook.

---

## Location header

`LocationHeader` shows:

| Element | Source |
| ------- | ------ |
| Place name + region | Reverse geocode or search label |
| **Condition badge** | API `current.rating` (wind-aware); see ratings below |
| **Water temp** | `current.waterTemperature` — °C |
| **Tide** | `current.seaLevelHeightM` — metres |
| Timestamp | **Updated {time}** from `current.timestamp` |

---

## Primary conditions card

Two-column hero row:

- **Swell height** — range in ft from `formatSurfHeightRangeFromConditions`, swell direction when known
- **Wind** — speed in kt, direction arrow (tertiary colour)

---

## Today’s hourly preview

`DailyHourlyPreview` (card presentation on home) appears under the day overview for **today**:

1. **Colour strip** — hourly surf quality (rating colour per hour), from **now** through end of day
2. **Anchor bars** — wave height at 6 am, 9 am, 12 pm, 3 pm, 6 pm (only future anchors after current hour)

Hourly data is sliced with `sliceHourlyFromNow(current.timestamp)` so past hours are not shown on the main view.

The **inset** presentation (inside expanded daily outlook rows) keeps compact wind detail under each bar.

---

## Charts

| Chart | Data slice | Notes |
| ----- | ---------- | ----- |
| **Wave height** | Next 24 h from now | Collapsible line chart, est. surf ft |
| **Tide** | Next 24 h from now | API `seaLevelHeightM` only (same cached forecast) |

If the API omits sea level for a location, the tide chart shows “Tide data unavailable”.

---

## Extended outlook

Collapsible card with day picker (**7 / 14 / 16 days**). Each `DailyForecastCard`:

- Collapsed: surf range, wind chip, hourly preview
- Expanded: swell/wave/wind stats + 24 h scroll list

Today’s row uses hours from **now**; future days use the full day.

---

## Ratings (good / bad / very good / amazing)

The app **displays** ratings from the API when present. It does not re-run full spot geometry on device for the main badge.

| Situation | Rating source |
| --------- | ------------- |
| API returns `current.rating` | Use as-is (curated or generic coastal from API) |
| No API rating | `rateGenericCoastal()` in `src/utils/spot-quality.ts` — wind + swell proxy |
| Hourly colour strip | Same generic coastal logic per hour in `buildHourlySnapshot` |

**Uncurated locations** (search/GPS with no curated spot match): API applies generic coastal rating (swell direction ≈ beach facing). See API **[SPOT_QUALITY.md](../../SwellCaster.API/SPOT_QUALITY.md)**.

**Curated spots** (e.g. Warana, Alexandra Headland): API uses known `shoreBearing` from `curated-spots.json`.

Native fallback mirrors API hard rules:

- Non-offshore wind ≥ 5 kt → **bad**
- Short period (&lt; 8 s) caps quality
- Flat surf (&lt; ~1 ft) → **bad**

---

## Key source files

| File | Role |
| ---- | ---- |
| `src/components/forecast/location-forecast-sections.tsx` | Shared forecast layout |
| `src/components/location-header.tsx` | Header + env stats |
| `src/components/ui/primary-conditions-card.tsx` | Hero surf + wind |
| `src/components/forecast/daily-hourly-preview.tsx` | Strip + anchor bars |
| `src/components/forecast/daily-forecast-card.tsx` | Outlook day rows |
| `src/components/charts/tide-chart.tsx` | Tide line chart (API data) |
| `src/utils/daily-hourly-forecast.ts` | Hour grouping, anchors, `sliceHourlyFromNow` |
| `src/utils/surf-height.ts` | Surf ft ranges and chart values |
| `src/utils/tide.ts` | Tide extremes and formatting |
| `src/utils/spot-quality.ts` | Client-side generic coastal rating |
| `src/utils/forecast.ts` | Height-only fallback, colours, labels |

---

## Related docs

- [Surf height](../SURF_HEIGHT.md) — ft bins, period factors, swell reach
- [Quickstart](../QUICKSTART.md) — run API + app
- [API spot quality](../../SwellCaster.API/SPOT_QUALITY.md) — rating algorithm
