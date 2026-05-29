export const LETTUCE_SLOT_COUNT = 6;

export const GROWTH_STAGE_LABELS = {
  0: "Seed Sowing",
  1: "Germination",
  2: "Leaf Development",
  3: "Head Formation",
  4: "Harvesting",
};

export const STAGE_AGE_BANDS = [
  { stage: "Seed Sowing", startDay: 0, endDay: 6, expectedYieldSlots: 0 },
  { stage: "Germination", startDay: 6, endDay: 13, expectedYieldSlots: 1 },
  { stage: "Leaf Development", startDay: 13, endDay: 31, expectedYieldSlots: 3 },
  { stage: "Head Formation", startDay: 31, endDay: 44, expectedYieldSlots: 5 },
  { stage: "Harvesting", startDay: 44, endDay: 56, expectedYieldSlots: 6 },
];

export const PREDICTION_FRESH_MINUTES = 30;

function isMeaningful(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function firstMeaningful(candidates) {
  return candidates.find(isMeaningful);
}

function normalizeProbability(value) {
  if (!isMeaningful(value) || Number.isNaN(Number(value))) return null;
  const numeric = Number(value);
  if (numeric > 1 && numeric <= 100) return numeric / 100;
  return numeric;
}

function parseJson(value, fallback = {}) {
  if (!isMeaningful(value)) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

function validDate(value) {
  if (!isMeaningful(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function activeBatch(cropBatches = []) {
  return cropBatches.find((batch) => batch?.status === "active") || cropBatches[0] || null;
}

export function getGrowthStageInfo(stageValue) {
  if (stageValue === null || stageValue === undefined || stageValue === "") {
    return { label: "Waiting for ML window", classId: null };
  }

  const numericClass = Number(stageValue);
  if (Number.isInteger(numericClass) && GROWTH_STAGE_LABELS[numericClass]) {
    return { label: GROWTH_STAGE_LABELS[numericClass], classId: numericClass };
  }

  const label = String(stageValue);
  const matchingClass = Object.entries(GROWTH_STAGE_LABELS).find(
    ([, stageLabel]) => stageLabel.toLowerCase() === label.toLowerCase(),
  );
  return { label, classId: matchingClass ? Number(matchingClass[0]) : null };
}

export function getPredictionStageInfo(prediction) {
  const preferredValue = firstMeaningful([
    prediction?.growth_stage,
    prediction?.model_growth_stage,
    prediction?.growth_stage_label,
    prediction?.stage_label,
    prediction?.expected_growth_stage,
  ]);
  return getGrowthStageInfo(preferredValue);
}

function findYieldValue(prediction) {
  const candidates = [
    prediction?.predicted_alive_slots,
    prediction?.predicted_yield_count,
    prediction?.yield_count,
    prediction?.predicted_yield,
    prediction?.predicted_yield_g,
  ];
  return candidates.find((value) => value !== null && value !== undefined && !Number.isNaN(Number(value)));
}

export function getPredictionConfidence(prediction) {
  return normalizeProbability(
    firstMeaningful([
      prediction?.stage_probability,
      prediction?.stage_probability_pct,
      prediction?.confidence,
      prediction?.growth_stage_age_confidence,
    ]),
  );
}

export function getPredictionFreshness(
  prediction,
  latestReading,
  maxLagMinutes = PREDICTION_FRESH_MINUTES,
) {
  const predictionDate = validDate(prediction?.timestamp) || validDate(prediction?.window_end);
  if (!predictionDate) {
    return { isFresh: false, lagMinutes: null, predictionDate: null };
  }

  const referenceDate = validDate(latestReading?.timestamp) || new Date();
  const lagMinutes = (referenceDate - predictionDate) / 60000;
  return {
    isFresh: Math.abs(lagMinutes) <= maxLagMinutes,
    lagMinutes,
    predictionDate,
    referenceDate,
  };
}

export function getBatchAgeDays(...sources) {
  const value = firstMeaningful(sources.map((source) => source?.batch_age_days));
  if (!isMeaningful(value) || Number.isNaN(Number(value))) return null;
  return Math.max(0, Number(value));
}

export function getPredictionMetrics(prediction) {
  return parseJson(prediction?.thesis_metrics_json, {});
}

export function getSensorAdjustments(prediction) {
  return parseJson(prediction?.sensor_adjustments_json, {});
}

export function getGrowthTimeline({ prediction, latestReading, cropBatches = [] } = {}) {
  const metrics = getPredictionMetrics(prediction);
  if (metrics.growth_timeline?.stages?.length) {
    return metrics.growth_timeline;
  }

  const batch = activeBatch(cropBatches);
  const cropStart =
    validDate(prediction?.crop_start_timestamp) ||
    validDate(batch?.started_at) ||
    validDate(batch?.seedSownAt);
  const current =
    validDate(latestReading?.timestamp) ||
    validDate(prediction?.timestamp) ||
    new Date();
  const ageDays = getBatchAgeDays(prediction, latestReading);

  if (!cropStart) {
    return {
      available: false,
      reason: "missing_crop_start",
      current_age_days: ageDays,
      stages: [],
    };
  }

  const currentAgeDays = Math.max(0, (current - cropStart) / 86400000);
  const stageInfo = getPredictionStageInfo(prediction || latestReading);
  const yieldInfo = getYieldCountInfo(prediction);
  const harvestReady = addDays(cropStart, STAGE_AGE_BANDS.at(-1).startDay);
  const harvestEnd = addDays(cropStart, STAGE_AGE_BANDS.at(-1).endDay);

  return {
    available: true,
    crop_start_timestamp: cropStart.toISOString(),
    current_timestamp: current.toISOString(),
    current_age_days: ageDays ?? currentAgeDays,
    predicted_stage: stageInfo.label,
    predicted_yield_slots: yieldInfo.raw,
    harvest_ready_timestamp: harvestReady.toISOString(),
    harvest_window_end_timestamp: harvestEnd.toISOString(),
    days_until_harvest_ready: Math.max(0, (harvestReady - current) / 86400000),
    stages: STAGE_AGE_BANDS.map(({ stage, startDay, endDay, expectedYieldSlots }) => {
      let status = "upcoming";
      if (currentAgeDays >= endDay) status = "completed";
      else if (currentAgeDays >= startDay) status = "current";
      return {
        stage,
        start_day: startDay,
        end_day: endDay,
        expected_yield_slots: expectedYieldSlots,
        start_timestamp: addDays(cropStart, startDay).toISOString(),
        end_timestamp: addDays(cropStart, endDay).toISOString(),
        days_until_start: Math.max(0, startDay - currentAgeDays),
        days_until_end: Math.max(0, endDay - currentAgeDays),
        status,
      };
    }),
  };
}

export function getYieldExplanation(prediction) {
  const metrics = getPredictionMetrics(prediction);
  if (metrics.yield_explanation) return metrics.yield_explanation;

  const yieldInfo = getYieldCountInfo(prediction);
  const adjustments = getSensorAdjustments(prediction);
  const sensorAdjustments = Array.isArray(adjustments.adjustments) ? adjustments.adjustments : [];
  const alive = yieldInfo.count;
  const empty = alive === null ? null : Math.max(0, yieldInfo.slots - alive);
  const reasons = [];
  if (yieldInfo.raw !== null) {
    reasons.push(`Model estimated ${yieldInfo.raw.toFixed(2)} occupied slots, rounded to ${alive}/${yieldInfo.slots}.`);
  }
  if (prediction?.crop_status) reasons.push(`Crop status: ${prediction.crop_status}.`);
  if (prediction?.window_sensor_health_score || prediction?.window_data_quality_score) {
    reasons.push(
      `Window health ${Number(prediction.window_sensor_health_score || 0).toFixed(1)}% and data quality ${Number(
        prediction.window_data_quality_score || 0,
      ).toFixed(1)}%.`,
    );
  }
  if (empty > 0) reasons.push(`${empty} slot(s) are predicted empty or at risk from the current sensor window.`);
  if (prediction?.priority_sensor) reasons.push(`Priority sensor to adjust: ${prediction.priority_sensor}.`);
  const normalizedYieldConfidence = normalizeProbability(prediction?.yield_confidence);

  return {
    stage: getPredictionStageInfo(prediction).label,
    predicted_yield_slots: yieldInfo.raw,
    predicted_alive_slots: alive,
    predicted_empty_slots: empty,
    yield_confidence_pct:
      prediction?.yield_confidence_pct ?? (normalizedYieldConfidence === null ? null : normalizedYieldConfidence * 100),
    crop_status: prediction?.crop_status,
    risk_score: prediction?.risk_score,
    priority_sensor: prediction?.priority_sensor || adjustments.priority_sensor || "none",
    reasons,
    recommended_actions: [
      prediction?.recommended_action,
      prediction?.adjustment_summary,
      adjustments.summary,
      ...sensorAdjustments.map((item) => item.action),
    ].filter(isMeaningful),
    sensor_adjustments: sensorAdjustments,
  };
}

export function getYieldCountInfo(prediction, slots = LETTUCE_SLOT_COUNT) {
  const rawValue = findYieldValue(prediction);
  if (rawValue === undefined) {
    return { count: null, raw: null, slots };
  }

  const raw = Number(rawValue);
  const count = Math.max(0, Math.min(slots, Math.round(raw)));
  return { count, raw, slots };
}

export function formatYieldCount(prediction, slots = LETTUCE_SLOT_COUNT) {
  const yieldInfo = getYieldCountInfo(prediction, slots);
  return yieldInfo.count === null ? "--" : `${yieldInfo.count}/${yieldInfo.slots}`;
}

export function normalizeProbabilityRows(probabilities) {
  return Object.entries(probabilities)
    .map(([stage, value]) => ({
      stage,
      label: getGrowthStageInfo(stage).label,
      value: normalizeProbability(value) ?? 0,
    }))
    .sort((a, b) => Number(b.value) - Number(a.value));
}
