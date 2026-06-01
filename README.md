# Lettuce Dashboard

React + Tailwind dashboard for the Python RTOS lettuce simulator. It includes
a thesis landing page, email authentication screens, profile editing, Supabase
data views, and an ESP32/farm location map.

## Folder Structure

```text
lettuce-dashboard
|- src
|  |- components
|  |  |- charts
|  |  |- common
|  |  |- dashboard
|  |  |- layout
|  |  |- location
|  |  `- table
|  |- config
|  |- data
|  |- hooks
|  |- pages
|  |- services
|  `- utils
|- .env.example
|- package.json
|- tailwind.config.js
`- vite.config.js
```

## Setup

```powershell
cd C:\Users\sayav\Documents\Codex\2026-05-27\files-mentioned-by-the-user-flask\lettuce-dashboard
copy .env.example .env
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173
```

## Environment

```text
VITE_SUPABASE_URL=https://nzeliqbgrlgzdeygvawu.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_vxOvnz4YVRtu5GRjkKx47A_9F1h5ivK
VITE_REFRESH_SECONDS=30
VITE_ESP32_IP=192.168.1.9
```

## Auth Flow

The app uses Supabase Auth REST endpoints for login, registration, forgot
password, email verification resend, and profile metadata updates. Enable email
confirmation in Supabase Auth settings if you want users to verify their email
before they can sign in.

## Supabase Tables Used

The dashboard reads:

```text
crop_batches
sensor_readings
denoised_readings
predictions
pump_events
weather_snapshots
```

Use `C:\Users\sayav\OneDrive\Desktop\Lettuce2026\supabase_schema.sql` first, then run
`lettucertos.py` so the dashboard has live sensor readings and prediction output.

## Notes

- If Supabase is unreachable or empty, the UI automatically shows preview data.
- The dashboard refreshes every `VITE_REFRESH_SECONDS` seconds.
- It expects timestamps in `Asia/Manila` compatible ISO/timestamptz format.
- Yield output is a 0-6 lettuce slot count. The legacy SQL column
  `predicted_yield_g` is displayed as count, not grams.
- Sensor target ranges match the current Manila/Pasig `lettucertos.py` runtime.
