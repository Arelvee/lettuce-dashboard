import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config/supabase";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export async function fetchTable(tableName, { limit = 100, order = "timestamp.desc" } = {}) {
  const params = new URLSearchParams({
    select: "*",
    order,
    limit: String(limit),
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?${params}`, {
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${tableName}: HTTP ${response.status} ${text}`);
  }

  return response.json();
}

export async function fetchDashboardTables(tables) {
  const [cropBatches, sensorReadings, denoisedReadings, predictions, pumpEvents, weatherSnapshots] =
    await Promise.all([
      fetchTable(tables.cropBatches, { limit: 50, order: "created_at.desc" }),
      fetchTable(tables.sensorReadings, { limit: 180 }),
      fetchTable(tables.denoisedReadings, { limit: 60 }),
      fetchTable(tables.predictions, { limit: 50 }),
      fetchTable(tables.pumpEvents, { limit: 30 }),
      fetchTable(tables.weatherSnapshots, { limit: 30 }),
    ]);

  return {
    cropBatches,
    sensorReadings,
    denoisedReadings,
    predictions,
    pumpEvents,
    weatherSnapshots,
  };
}

export async function createCropBatch(batch) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/crop_batches`, {
    method: "POST",
    headers: {
      ...headers,
      Prefer: "return=representation",
    },
    body: JSON.stringify(batch),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`crop_batches insert: HTTP ${response.status} ${text}`);
  }

  return response.json();
}

export async function updateCropBatch(id, fields) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/crop_batches?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      ...headers,
      Prefer: "return=representation",
    },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`crop_batches update: HTTP ${response.status} ${text}`);
  }

  return response.json();
}
