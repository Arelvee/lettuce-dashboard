export const SENSOR_META = {
  humidity: { label: "Humidity", unit: "%RH", min: 65, max: 85, precision: 1 },
  atemp: { label: "Air Temp", unit: "C", min: 22, max: 30, precision: 1 },
  wtemp: { label: "Water Temp", unit: "C", min: 18, max: 22, precision: 1 },
  tds: { label: "TDS", unit: "ppm", min: 700, max: 900, precision: 0 },
  ec: { label: "EC", unit: "uS/cm", min: 900, max: 1600, precision: 0 },
  light: { label: "Light", unit: "lux", min: 8000, max: 24000, precision: 0 },
  ppfd: { label: "PPFD", unit: "umol/m2/s", min: 150, max: 450, precision: 0 },
  r445: { label: "R445", unit: "a.u.", min: 0.1, max: 0.55, precision: 4 },
  r480: { label: "R480", unit: "a.u.", min: 0.12, max: 0.6, precision: 4 },
  ph: { label: "pH", unit: "pH", min: 5.8, max: 6.4, precision: 2 },
};

const advice = {
  humidity: {
    low: "Increase humidity or reduce exhaust speed.",
    high: "Improve airflow to reduce fungal pressure.",
  },
  atemp: {
    low: "Warm the growing area gradually.",
    high: "Add cooling or improve ventilation.",
  },
  wtemp: {
    low: "Warm nutrient solution slowly.",
    high: "Cool reservoir to protect roots.",
  },
  tds: {
    low: "Add nutrients after checking EC meter calibration.",
    high: "Dilute solution with clean water.",
  },
  ec: {
    low: "Increase nutrient strength carefully.",
    high: "Reduce nutrient concentration.",
  },
  light: {
    low: "Increase light intensity or photoperiod.",
    high: "Raise fixture or reduce intensity.",
  },
  ppfd: {
    low: "Increase canopy light delivery.",
    high: "Reduce light stress at canopy level.",
  },
  r445: {
    low: "Check spectral sensor and canopy coverage.",
    high: "Confirm reflectance sensor alignment.",
  },
  r480: {
    low: "Check spectral sensor and leaf coverage.",
    high: "Confirm reflectance sensor alignment.",
  },
  ph: {
    low: "Raise pH gradually toward 6.0-6.2.",
    high: "Lower pH gradually toward 6.0-6.2.",
  },
};

export function getSensorStatus(key, value) {
  const meta = SENSOR_META[key];
  if (!meta || value === null || value === undefined) {
    return { label: "No reading", tone: "slate", score: 0, advice: "No data received from this sensor yet." };
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return { label: "No reading", tone: "slate", score: 0, advice: "Sensor value is not readable yet." };
  }
  if (numeric < meta.min) {
    return {
      label: "Low",
      tone: "amber",
      score: Math.max(0, 100 - ((meta.min - numeric) / Math.max(meta.min, 1)) * 100),
      advice: advice[key]?.low,
    };
  }
  if (numeric > meta.max) {
    return {
      label: "High",
      tone: "rose",
      score: Math.max(0, 100 - ((numeric - meta.max) / Math.max(meta.max, 1)) * 100),
      advice: advice[key]?.high,
    };
  }
  return { label: "Optimal", tone: "emerald", score: 100, advice: "Within target range." };
}

export function getOverallHealth(reading) {
  if (!reading) return 0;
  const scores = Object.keys(SENSOR_META).map((key) => getSensorStatus(key, reading[key]).score);
  return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
}

export function getActionItems(reading) {
  if (!reading) return [];
  return Object.keys(SENSOR_META)
    .map((key) => {
      const status = getSensorStatus(key, reading[key]);
      return {
        key,
        sensorLabel: SENSOR_META[key].label,
        statusLabel: status.label,
        ...status,
      };
    })
    .filter((item) => item.statusLabel !== "Optimal")
    .slice(0, 5);
}
