export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://nzeliqbgrlgzdeygvawu.supabase.co";

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_vxOvnz4YVRtu5GRjkKx47A_9F1h5ivK";

export const REFRESH_SECONDS = Number(import.meta.env.VITE_REFRESH_SECONDS || 30);

export const TABLES = {
  cropBatches: "crop_batches",
  sensorReadings: "sensor_readings",
  denoisedReadings: "denoised_readings",
  predictions: "predictions",
  pumpEvents: "pump_events",
  weatherSnapshots: "weather_snapshots",
};
