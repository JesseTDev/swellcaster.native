# Running Swell Caster locally

You need **two processes**: the API (forecast data) and the native app (Expo).

## Prerequisites

- **Node.js 18+** and npm
- **.NET SDK** (for `SwellCaster.API`)
- **PostgreSQL** (API database — connection string in `SwellCaster.API/appsettings.Development.local.json`)
- **Expo Go** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Phone and Mac on the **same Wi‑Fi**

---

## 1. Start the API

From the API repo (sibling to `native/`):

```bash
cd ../SwellCaster.API
dotnet run --launch-profile http
```

The API listens on **http://0.0.0.0:5213**.

On first run, migrations and spot seeding run automatically. After ~2 seconds you should see:

```text
Spot conditions cache warmed (28 spots).
```

Leave this terminal running.

### API config (optional)

- Local secrets: copy `appsettings.Development.local.json.example` → `appsettings.Development.local.json`
- Condition videos: stored on API disk — see [docs/SURF_FORECAST_VIDEOS.md](./docs/SURF_FORECAST_VIDEOS.md) and API [CONDITION_VIDEOS.md](../SwellCaster.API/CONDITION_VIDEOS.md)

---

## 2. Start the native app

From this folder (`native/`):

```bash
npm install   # first time only
npm run start:phone
```

This runs **`expo start --go`** — Expo Go mode with a QR code for your physical device.

### What happens

| Platform | API URL (dev) |
|----------|----------------|
| **Physical phone** | `http://<your-mac-ip>:8081` — Metro proxies `/api/*` → `localhost:5213` |
| **iOS Simulator / Android emulator** | `http://localhost:5213` — direct to API |

You’ll see in the Metro logs:

```text
API base URL: http://192.168.x.x:8081
```

Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

---

## npm scripts

| Command | What it does |
|---------|----------------|
| `npm run start:phone` | **Recommended for real device** — Expo Go + QR code |
| `npm start` | Expo dev server (choose platform in terminal) |
| `npm run ios` | Open in iOS Simulator |
| `npm run android` | Open in Android emulator |
| `npm run web` | Run in browser |
| `npm test` | Run Jest tests |

---

## Typical dev session (phone)

**Terminal 1 — API**

```bash
cd ~/Documents/dev/swell-caster/SwellCaster.API
dotnet run --launch-profile http
```

**Terminal 2 — App**

```bash
cd ~/Documents/dev/swell-caster/native
npm run start:phone
```

Then open **Expo Go** on your phone and scan the QR code.

---

## Troubleshooting

### `502` or “API proxy failed” on the phone

The API isn’t running or isn’t on port **5213**. Start it in Terminal 1 (see above).

### Map markers gray / timeout on spot conditions

First map load can take **20–30 seconds** while the API fetches all curated spots from Open-Meteo. Wait for `Spot conditions cache warmed` in the API log, then reload the app (`r` in Metro).

### `npm run start:phone` fails with `fetch failed`

Expo CLI needs network access (checks version compatibility). Ensure you’re online, or run:

```bash
EXPO_OFFLINE=1 npm run start:phone
```

### Wrong API URL

Override with an env var before starting Metro:

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.4:5213 npm run start:phone
```

Only needed if you’re not using the Metro proxy (e.g. testing API directly on LAN).

### Reload the app

In the Metro terminal: press **`r`** to reload, **`m`** for the dev menu.

---

## Repo layout

```text
swell-caster/
├── native/           ← this app (Expo / React Native)
└── SwellCaster.API/  ← .NET API (forecast, map spots, videos)
```

The native app does **not** call Open-Meteo directly. All forecast data (wave, swell, wind, tide, water temp) goes through the API, which caches upstream responses.

---

## Surf forecast videos (optional)

To test crowdsourced live videos on the map:

1. Start the API: `dotnet run --launch-profile http` in `SwellCaster.API`.
2. Open the **Map** tab on your phone; enable **location** and **camera** for Expo Go.
3. Tap **Record a surf forecast video**, film a short clip, then tap the **film icon** on the map to watch it.

See **[docs/SURF_FORECAST_VIDEOS.md](./docs/SURF_FORECAST_VIDEOS.md)** for the full flow, architecture, and troubleshooting.
