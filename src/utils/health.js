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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getRange(meta) {
  return Math.max(meta.max - meta.min, Number.EPSILON);
}

function getTargetFitScore(meta, numeric) {
  const range = getRange(meta);
  const center = (meta.min + meta.max) / 2;

  if (numeric >= meta.min && numeric <= meta.max) {
    const halfRange = range / 2;
    const distanceFromCenter = Math.abs(numeric - center) / halfRange;
    return Math.round(clamp(100 - distanceFromCenter * 15, 85, 100));
  }

  const deviation = numeric < meta.min ? meta.min - numeric : numeric - meta.max;
  const outsideSeverity = deviation / range;
  return Math.round(clamp(85 - outsideSeverity * 70, 0, 84));
}

function getHeatPosition(meta, numeric) {
  const range = getRange(meta);
  const extendedMin = meta.min - range;
  const extendedMax = meta.max + range;
  return clamp(((numeric - extendedMin) / (extendedMax - extendedMin)) * 100, 0, 100);
}

export function getSensorStatus(key, value) {
  const meta = SENSOR_META[key];
  if (!meta || value === null || value === undefined) {
    return {
      label: "No reading",
      tone: "slate",
      score: 0,
      position: 0,
      direction: "missing",
      advice: "No data received from this sensor yet.",
    };
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return {
      label: "No reading",
      tone: "slate",
      score: 0,
      position: 0,
      direction: "missing",
      advice: "Sensor value is not readable yet.",
    };
  }

  const score = getTargetFitScore(meta, numeric);
  const position = getHeatPosition(meta, numeric);
  const range = getRange(meta);

  if (numeric < meta.min) {
    const severity = (meta.min - numeric) / range;
    return {
      label: "Low",
      tone: severity >= 0.45 ? "rose" : "amber",
      score,
      position,
      direction: "low",
      severity,
      advice: advice[key]?.low,
    };
  }
  if (numeric > meta.max) {
    const severity = (numeric - meta.max) / range;
    return {
      label: "High",
      tone: severity >= 0.45 ? "rose" : "amber",
      score,
      position,
      direction: "high",
      severity,
      advice: advice[key]?.high,
    };
  }
  return {
    label: "Optimal",
    tone: "emerald",
    score,
    position,
    direction: "target",
    severity: 0,
    advice: score >= 95 ? "Centered in the target range." : "Within range but away from the ideal center.",
  };
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
