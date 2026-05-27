const stages = ["Seed Sowing", "Germination", "Leaf Development", "Head Formation", "Harvesting"];

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

export function createMockDashboardData() {
  const now = new Date();
  const sensorReadings = Array.from({ length: 48 }, (_, index) => {
    const minutesAgo = (47 - index) * 5;
    const ts = new Date(now.getTime() - minutesAgo * 60_000);
    const hour = ts.getHours() + ts.getMinutes() / 60;
    const wave = Math.sin(index / 6);
    const daylight = hour >= 6 && hour < 18;
    const ledOn = hour >= 20 || hour < 4;
    const light = ledOn ? 18000 + wave * 420 : daylight ? 13200 + wave * 1800 : 120;
    const ec = 970 + Math.sin(index / 10) * 70;

    return {
      id: index + 1,
      timestamp: ts.toISOString(),
      humidity: round(76 + Math.cos(index / 8) * 4),
      atemp: round(28 + Math.sin(index / 9) * 2.1),
      wtemp: round(19.2 + Math.sin(index / 11) * 0.9),
      tds: round(ec * 0.64),
      ec: round(ec),
      light: round(light),
      ppfd: round(light / 54),
      r445: round(0.28 + index * 0.002 + Math.sin(index / 6) * 0.01, 4),
      r480: round(0.32 + index * 0.002 + Math.cos(index / 7) * 0.01, 4),
      ph: round(6.08 + Math.sin(index / 7) * 0.09, 4),
      pump_on: hour >= 6 && hour < 18,
      source: "mock-preview",
    };
  }).reverse();

  const predictions = Array.from({ length: 12 }, (_, index) => {
    const ts = new Date(now.getTime() - (11 - index) * 20 * 60_000);
    const stage = stages[Math.min(4, 2 + Math.floor(index / 5))];
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
      stage_probability: round(0.72 + index * 0.018, 4),
      predicted_yield_g: round(34 + index * 1.35),
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
    sensorReadings,
    denoisedReadings: sensorReadings.slice(0, 30),
    predictions,
    pumpEvents,
    weatherSnapshots,
    isMock: true,
  };
}

