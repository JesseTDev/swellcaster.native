# Surf Height

How Swell Caster turns Open-Meteo ocean data into surf height ranges (e.g. **0–1 ft**, **1–2 ft**) and how that feeds spot quality ratings.

---

## Why not use swell height directly?

Open-Meteo exposes two related fields:

| Field | Open-Meteo name | What it is |
| ----- | --------------- | ---------- |
| **Total wave** | `wave_height` | Significant height of all waves (swell + wind chop + local seas) |
| **Swell only** | `swell_wave_height` | Height of the swell component only |

Most surf reports use **nearshore breaking surf** in foot bins. That number tracks **total significant wave height** much more closely than swell alone.

**Example — Alexandra Headland (typical small day)**

| Source | Height | Period | Old estimate (swell only) | Current estimate (total wave) |
| ------ | ------ | ------ | ------------------------- | ----------------------------- |
| Swell | 0.62 m | 7 s | ~0.9 ft → **0–1 ft** | — |
| Total wave | 0.82 m | 6 s | — | ~1.5 ft → **1–2 ft** |

Using swell alone under-reported surf when wind chop added energy that still breaks on the beach.

---

## End-to-end flow

```
Open-Meteo (offshore grid point)
        │
        ├─ wave.height, wave.period     (total significant wave)
        └─ swell.height, swell.period, swell.direction
                │
                ▼
        pickSurfEstimateSource()
        (prefer total wave when ≥ swell)
                │
                ▼
        estimateSurfHeightM = heightM × surfFactor(period)
                │
                ▼
        metersToFeet → estimated breaking face (ft)
                │
        ┌───────┴───────┐
        ▼               ▼
  formatSurfHeightRange   SpotQualityService (API)
  "1-2 ft" on screen      bad / good / very good / amazing
```

**Native app** computes display ranges locally in `src/utils/surf-height.ts`.

**API** uses the same math in `Services/SurfHeightEstimator.cs` when scoring curated spots. The app shows the API `rating` when available; it does not re-run spot quality logic on device.

---

## Step 1 — Pick input height and period

```typescript
pickSurfEstimateSource(wave, swell)
```

Rules:

1. If `wave.height ≥ swell.height` and `wave.height > 0` → use **total wave** height and `wave.period` (fall back to swell period if missing).
2. Otherwise → use **swell** height and swell period.

Swell **direction** is always used separately for spot alignment scoring on the API — only height/period come from the picked source.

---

## Step 2 — Period factor (offshore → breaking)

Offshore significant height is scaled down to approximate **breaking face height** on the beach. Longer-period swell carries more energy per metre of height, so the factor increases with period:

| Period (s) | Factor | Meaning |
| ---------- | ------ | ------- |
| &lt; 6 | 0.55 | Short chop — much is lost before the beach |
| 6 – 8 | 0.62 | Wind swell / mixed |
| 8 – 10 | 0.68 | Decent swell |
| 10 – 12 | 0.74 | Solid ground swell |
| ≥ 12 | 0.80 | Long-period swell |

```
breakingHeightM = inputHeightM × surfFactor(periodS)
breakingHeightFt = breakingHeightM × 3.28084
```

These factors were **calibrated to common foot bins**, not derived from bathymetry or a wave model.

---

## Step 3 — Display bins

Displayed ranges use standard foot bins:

```
if estimatedFt < 1        → "0-1 ft"
else                      → "{floor(estimatedFt)}-{floor(estimatedFt)+1} ft"
```

Examples:

| Input (total wave) | Period | Est. face | Display |
| ------------------ | ------ | --------- | ------- |
| 0.36 m | 6 s | ~0.7 ft | 0–1 ft |
| 0.82 m | 6 s | ~1.5 ft | 1–2 ft |
| 1.20 m | 10 s | ~2.7 ft | 2–3 ft |
| 2.00 m | 12 s | ~5.2 ft | 5–6 ft |

There is no upper cap on the bin label — very large surf continues as `N-(N+1) ft`.

---

## Where the app uses this

| Location | Function | Notes |
| -------- | -------- | ----- |
| Home hero (`src/app/index.tsx`) | `formatSurfHeightRangeFromConditions(wave, swell)` | Large range next to location name |
| Map spot sheet (`src/app/map.tsx`) | Same | Selected curated spot |
| Daily cards (`src/components/daily-forecast-card.tsx`) | Same, using daily `maxHeight` / `maxPeriod` | One range per forecast day |
| Wave height chart (`src/components/charts/wave-height-chart.tsx`) | `estimateSurfHeightFtFromConditions` | Hourly line chart in feet |

All of these pass both `wave` and `swell` objects from the API response.

---

## Spot quality rating (API)

For **curated spots** (breaks in `curated-spots.json` with `shoreBearing`), the API attaches a `rating` field. That rating uses the **same estimated surf height** as above, then applies break-specific rules:

| Factor | Weight | Role |
| ------ | ------ | ---- |
| Swell alignment vs break direction | 45% | Wrong swell angle → Bad |
| Surf size (estimated ft) | 35% | Flat surf scores low |
| Wind vs break orientation | 20% | Onshore / cross-shore hurts |

Hard caps (see `SPOT_QUALITY.md` in the API repo for full detail):

- Est. surf **&lt; 1 ft** → always **Bad**
- Est. surf **&lt; 2 ft** → cannot be Very good or Amazing
- Period **&lt; 8 s** → downgrades rating
- Cross-shore / onshore wind **≥ 5 kt** → Bad for Good+

The native app **displays** `rating` from the API via `ConditionBadge`. It only falls back to a simple height-only rating (`getSurfRating` in `src/utils/forecast.ts`) for generic locations with no curated spot match.

---

## Worked example — Alexandra Headland

**Inputs (approximate live Open-Meteo):**

- `wave.height` = 0.82 m, `wave.period` = 5.85 s  
- `swell.height` = 0.62 m, `swell.period` = 7 s, direction SE  
- Wind S ~7 kt, break faces east (`shoreBearing = 90`)

**Surf height:**

1. Pick source → total wave (0.82 m ≥ 0.62 m)
2. Factor @ 5.85 s → 0.55  
3. Breaking height → 0.82 × 0.55 = 0.451 m → **1.48 ft**  
4. Display → **1–2 ft**

**Rating (API):**

- Size exists (~1.5 ft) but period &lt; 8 s → downgraded  
- S wind at 7 kt on E-facing beach → not offshore → **Bad**  
- Result: **Bad** (small, short-period, cross-shore wind) ✓

---

## What we do *not* model

These estimates are **heuristic**, not a wave propagation model:

- No bathymetry, sandbars, or reef shape  
- No tide stage (tide data is shown separately)  
- No local refraction or shadowing from headlands  
- No separate primary / secondary swell stacking  
- Same offshore grid point for all spots in an area  

Expect **±1 ft bin** variation on some days. The goal is consistent, explainable ranges aligned with how surfers read conditions.

---

## Source files

| Repo | File | Role |
| ---- | ---- | ---- |
| Native | `src/utils/surf-height.ts` | Display ranges and chart values |
| Native | `src/utils/forecast.ts` | Height-only fallback rating for non-curated locations |
| Native | `src/utils/__tests__/surf-height.test.ts` | Unit tests (Alex-like fixture) |
| API | `Services/SurfHeightEstimator.cs` | Same height math for ratings |
| API | `Services/SpotQualityService.cs` | Full spot rating algorithm |
| API | `SPOT_QUALITY.md` | Rating rules, endpoints, break metadata |

**Keep native and API in sync** — if you change `surfFactor` thresholds or source-picking logic, update both implementations and the tests.

---

## Tuning

To adjust how tall surf reads:

1. Edit `surfFactor()` in `src/utils/surf-height.ts` and `SurfFactor()` in `SurfHeightEstimator.cs`.
2. Update `src/utils/__tests__/surf-height.test.ts` with a real Open-Meteo sample for a spot you care about.
3. Restart the API if rating caps should change too (`SpotQualityService.cs` size thresholds).

Higher factors → taller reported surf. Lower factors → smaller bins.
