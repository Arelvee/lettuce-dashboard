export function formatDateTime(value) {
  if (!value) return "No timestamp";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function formatTime(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  return Number(value).toLocaleString("en-PH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  return `${formatNumber(Number(value) * 100, 1)}%`;
}

export function normalizeJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function sortAscending(rows) {
  return [...rows].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

