export const OFFLINE_AFTER_MINUTES = 10;

export function getDeviceConnectionStatus({ latestReading, isMock, error }) {
  if (error) return "fallback";
  if (isMock) return "preview";
  if (!latestReading) return "offline";

  const timestamp = latestReading.timestamp ? new Date(latestReading.timestamp).getTime() : Number.NaN;
  if (Number.isNaN(timestamp)) return "offline";

  const ageMs = Date.now() - timestamp;
  return ageMs > OFFLINE_AFTER_MINUTES * 60_000 ? "stale" : "online";
}

export function getConnectionLabel(status) {
  const labels = {
    online: "ESP32 Online",
    stale: "Signal Delayed",
    offline: "ESP32 Offline",
    preview: "Preview Mode",
    fallback: "Cloud Offline",
  };
  return labels[status] || labels.offline;
}
