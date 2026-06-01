const stages = ["Seed Sowing", "Germination", "Leaf Development", "Head Formation", "Harvesting"];

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

export function createMockDashboardData() {
  const now = new Date();
  const cropStart = new Date(now.getTime() - 34 * 24 * 60 * 60_000);
  const activeBatch = {
    id: "batch-2026-001",
    batch_name: "Batch #001",
    started_at: cropStart.toISOString(),
    ended_at: null,
    status: "active",
    notes: "Preview batch seeded from mock data.",
    created_at: cropStart.toISOString(),
  };
  const harvestedBatch = {
    id: "batch-2025-004",
    batch_name: "Batch #004",
    started_at: new Date(now.getTime() - 67 * 24 * 60 * 60_000).toISOString(),
    ended_at: new Date(now.getTime() - 31 * 24 * 60 * 60_000).toISOString(),
    status: "harvested",
    notes: "Mock harvested history.",
    created_at: new Date(now.getTime() - 67 * 24 * 60 * 60_000).toISOString(),
  };
  const sensorReadings = Array.from({ length: 48 }, (_, index) => {
    const minutesAgo = (47 - index) * 5;
    const ts = new Date(now.getTime() - minutesAgo * 60_000);
    const hour = ts.getHours() + ts.getMinutes() / 60;
    const wave = Math.sin(index / 6);
    const daylight = hour >= 6 && hour < 18;
    const ledOn = hour >= 20 || hour < 4;
    const light = ledOn ? 17800 + wave * 620 : daylight ? 11200 + wave * 2600 : 80;
    const ec = 1190 + Math.sin(index / 10) * 55;

    return {
      id: index + 1,
      timestamp: ts.toISOString(),
      humidity: round(72 + Math.cos(index / 8) * 5),
      atemp: round(30.8 + Math.sin(index / 9) * 2.4),
      wtemp: round(24.6 + Math.sin(index / 11) * 0.7),
      tds: round(ec * 0.64),
      ec: round(ec),
      light: round(light),
      ppfd: round(light / 54),
      r445: round(0.37 + index * 0.001 + Math.sin(index / 6) * 0.012, 4),
      r480: round(0.41 + index * 0.0011 + Math.cos(index / 7) * 0.014, 4),
      ph: round(6.02 + Math.sin(index / 7) * 0.08, 4),
      pump_on: hour >= 6 && hour < 18,
      source: "mock-preview",
      arduino_payload_json: {},
      batch_id: activeBatch.id,
      batch_age_days: round((ts - cropStart) / 86400000, 1),
      expected_growth_stage: "Head Formation",
      growth_stage_age_confidence: 0.88,
      vpd_kpa: round(1.12 + Math.sin(index / 5) * 0.08, 2),
      dew_point_c: round(23.2 + Math.cos(index / 6) * 0.6, 1),
      light_integral_mol_m2: round(light / 54 / 100, 2),
      sensor_health_score: 96,
      sensor_health_json: {},
      sensor_alerts: index % 11 === 0 ? "pH drift watch" : "",
      data_quality_score: 98,
      data_quality_flags: "",
    };
  }).reverse();

  const predictions = Array.from({ length: 12 }, (_, index) => {
    const ts = new Date(now.getTime() - (11 - index) * 20 * 60_000);
    const stage = stages[Math.min(4, 3 + Math.floor(index / 7))];
    const probabilities = Object.fromEntries(
      stages.map((name, stageIndex) => [
        name,
        round(name === stage ? 0.72 + index * 0.018 : 0.07 - stageIndex * 0.006, 4),
      ]),
    );

    return {
      id: index + 1,
      timestamp: ts.toISOString(),
      window_start: new Date(ts.getTime() - 45 * 60_000).toISOString(),
      window_end: ts.toISOString(),
      growth_stage: stage,
      model_growth_stage: stage,
      age_expected_growth_stage: "Head Formation",
      growth_stage_basis: "model_age_agree",
      stage_probability: round(0.72 + index * 0.018, 4),
      stage_probability_pct: round((0.72 + index * 0.018) * 100, 1),
      confidence_target_met: true,
      detection_quality: "good",
      predicted_yield_count: Math.max(1, Math.min(6, Math.round(4.5 + index * 0.12))),
      predicted_yield_g: Math.max(1, Math.min(6, round(4.5 + index * 0.12, 2))),
      yield_confidence: round(0.82 + index * 0.006, 4),
      yield_confidence_pct: round((0.82 + index * 0.006) * 100, 1),
      yield_prediction_interval_json: {
        low: Math.max(0, Math.min(6, round(4.5 + index * 0.12 - 0.35, 2))),
        high: Math.max(0, Math.min(6, round(4.5 + index * 0.12 + 0.35, 2))),
        unit: "occupied_slots_out_of_6",
      },
      predicted_alive_slots: Math.max(1, Math.min(6, Math.round(4.5 + index * 0.12))),
      predicted_empty_slots: Math.max(0, 6 - Math.max(1, Math.min(6, Math.round(4.5 + index * 0.12)))),
      crop_status: stage === "Harvesting" ? "ready_for_harvest" : "growing",
      recommended_action: stage === "Harvesting" ? "Prepare harvest validation and batch closeout." : "Continue monitoring.",
      priority_sensor: index % 4 === 0 ? "ph" : "none",
      adjustment_summary: index % 4 === 0 ? "pH is drifting and should be watched before the next window." : "All readings remain inside the Manila/Pasig operating range.",
      sensor_adjustments_json: {},
      window_sample_count: 10,
      window_duration_minutes: 45,
      window_sensor_health_score: 96,
      window_data_quality_score: 98,
      window_alerts: "",
      risk_score: round(index % 3 === 0 ? 0.18 : 0.08, 2),
      window_feature_stats_json: {},
      thesis_metrics_json: {},
      model_backend: "tflite+xgboost+sequence-summary",
      batch_id: activeBatch.id,
      crop_start_timestamp: cropStart.toISOString(),
      batch_age_days: round((ts - cropStart) / 86400000, 1),
      probabilities_json: probabilities,
      bottleneck_json: [],
    };
  }).reverse();

  const pumpEvents = [
    {
      id: 1,
      timestamp: now.toISOString(),
      pump_on: now.getHours() >= 6 && now.getHours() < 18,
      schedule: "06:00-18:00 Asia/Manila",
      reason: "day schedule",
      batch_id: activeBatch.id,
    },
  ];

  const weatherSnapshots = [
    {
      id: 1,
      timestamp: now.toISOString(),
      temperature_2m: 29.4,
      relative_humidity_2m: 76,
      cloud_cover: 55,
      source: "mock-preview",
    },
  ];

  return {
    cropBatches: [activeBatch, harvestedBatch],
    sensorReadings,
    denoisedReadings: sensorReadings.slice(0, 30),
    predictions,
    pumpEvents,
    weatherSnapshots,
    isMock: true,
  };
}
