export const LETTUCE_SLOT_COUNT = 6;

export const GROWTH_STAGE_LABELS = {
  0: "Seed Sowing",
  1: "Germination",
  2: "Leaf Development",
  3: "Head Formation",
  4: "Harvesting",
};

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
  const preferredValue =
    prediction?.model_growth_stage ??
    prediction?.growth_stage_label ??
    prediction?.stage_label ??
    prediction?.growth_stage;
  return getGrowthStageInfo(preferredValue);
}

function findYieldValue(prediction) {
  const candidates = [
    prediction?.predicted_alive_slots,
    prediction?.predicted_yield_count,
    prediction?.yield_count,
    prediction?.predicted_yield,
  ];
  return candidates.find((value) => value !== null && value !== undefined && !Number.isNaN(Number(value)));
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
      value,
    }))
    .sort((a, b) => Number(b.value) - Number(a.value));
}
