import { FALLBACK_BATCH_ID, SUPABASE_ANON_KEY, SUPABASE_URL } from "../config/supabase";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export async function fetchTable(tableName, { filters = {}, limit = 100, order = "timestamp.desc" } = {}) {
  const params = new URLSearchParams({
    select: "*",
    order,
    limit: String(limit),
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, value);
    }
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
  const cropBatches = await fetchTable(tables.cropBatches, { limit: 50, order: "created_at.desc" });
  const activeBatch = cropBatches.find((batch) => batch.status === "active");
  const activeBatchId = activeBatch?.id || FALLBACK_BATCH_ID;
  const batchFilter = { batch_id: `eq.${activeBatchId}` };
  const [sensorReadings, denoisedReadings, predictions, pumpEvents, weatherSnapshots] =
    await Promise.all([
      fetchTable(tables.sensorReadings, { filters: batchFilter, limit: 180 }),
      fetchTable(tables.denoisedReadings, { filters: batchFilter, limit: 60 }),
      fetchTable(tables.predictions, { filters: batchFilter, limit: 50 }),
      fetchTable(tables.pumpEvents, { filters: batchFilter, limit: 30 }),
      fetchTable(tables.weatherSnapshots, { limit: 30 }),
    ]);

  return {
    cropBatches,
    sensorReadings,
    denoisedReadings,
    predictions,
    pumpEvents,
    weatherSnapshots,
    activeBatchId,
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
