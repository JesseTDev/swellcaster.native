# Forecast UI

How the native app presents surf conditions on the **home** screen, **map spot sheet**, and **extended outlook**.

---

## Shared forecast block

`LocationForecastSections` (`src/components/location-forecast-sections.tsx`) is used by:

- **Home** (`src/app/index.tsx`) — GPS or searched location
- **Map** (`src/app/map.tsx`) — tap a spot or map point

This keeps one layout for header, hero conditions, hourly preview, charts, and daily outlook.

---

## Location header

`LocationHeader` shows:

| Element | Source |
| ------- | ------ |
| Place name + region | Reverse geocode or search label |
| **Condition badge** | API `current.rating` (wind-aware); see ratings below |
| **Water temp** | `current.waterTemperature` — label “Water temp” + °C |
| **Tide** | `current.seaLevelHeightM` — label “Tide” + height in ft |
| Timestamp | **Now · {time} local** from `current.timestamp` |

---

## Primary conditions card

Hero row with:

- **Est. surf height** — range in ft from `formatSurfHeightRangeFromConditions`
- **Wind** — direction arrow, compass label, speed in kt
- **Gusts** — shown when API sends `wind.gustKnots` above sustained (e.g. `13 kt (gusts 18)`)

---

## Today’s hourly preview

`DailyHourlyPreview` appears directly under the primary card for **today**:

1. **Colour strip** — hourly surf quality (rating colour per hour), from **now** through end of day
2. **Anchor bars** — wave height at 6 am, 9 am, 12 pm, 3 pm, 6 pm (only future anchors after current hour)
3. Under each bar — **ft** label, small **wind arrow**, **compass** (e.g. SSE), **kt**

Hourly data is sliced with `sliceHourlyFromNow(current.timestamp)` so past hours are not shown on the main view.

Same preview appears in collapsed **extended outlook** day rows.

---

## Charts

| Chart | Data slice | Notes |
| ----- | ---------- | ----- |
| **Wave height** | Next 24 h from now | Collapsible line chart, est. surf ft |
| **Tide** | Next 24 h from now | API sea level or Open-Meteo fallback |

---

## Extended outlook

Collapsible card with day picker (3 / 5 / 7 days). Each `DailyForecastCard`:

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
| `src/components/location-forecast-sections.tsx` | Shared forecast layout |
| `src/components/location-header.tsx` | Header + env stats |
| `src/components/ui/primary-conditions-card.tsx` | Hero surf + wind |
| `src/components/daily-hourly-preview.tsx` | Strip + anchor bars + wind |
| `src/components/daily-forecast-card.tsx` | Outlook day rows |
| `src/utils/daily-hourly-forecast.ts` | Hour grouping, anchors, `sliceHourlyFromNow` |
| `src/utils/surf-height.ts` | Surf ft ranges and chart values |
| `src/utils/spot-quality.ts` | Client-side generic coastal rating |
| `src/utils/forecast.ts` | Height-only fallback, colours, labels |

---

## Related docs

- [Surf height](../SURF_HEIGHT.md) — ft bins and period factors
- [Quickstart](../QUICKSTART.md) — run API + app
- [API forecast pipeline](../../SwellCaster.API/docs/FORECAST.md) — current/wind/cache
- [API spot quality](../../SwellCaster.API/SPOT_QUALITY.md) — rating algorithm
