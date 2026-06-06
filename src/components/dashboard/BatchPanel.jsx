import { CalendarDays, CheckCircle2, History, Loader2, Plus, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { createCropBatch, updateCropBatch } from "../../services/supabaseRest";
import { formatDateTime, formatNumber } from "../../utils/format";
import { formatYieldCount, getBatchAgeDays, getPredictionStageInfo } from "../../utils/prediction";
import StatusBadge from "../common/StatusBadge";

const STORAGE_KEY = "lettuce-batch-tracker";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function readStoredBatches() {
  try {
    const payload = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      activeBatch: payload.activeBatch || null,
      history: Array.isArray(payload.history) ? payload.history : [],
    };
  } catch {
    return { activeBatch: null, history: [] };
  }
}

function saveStoredBatches(nextState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

function batchNumberFromName(name, fallback) {
  const match = String(name || "").match(/(\d+)/);
  return match ? Number(match[1]) : fallback;
}

function paddedBatchNumber(number) {
  return String(number).padStart(3, "0");
}

function batchId(number) {
  return `lettuce-batch-${paddedBatchNumber(number)}`;
}

function batchLabel(number) {
  return `Lettuce Batch ${paddedBatchNumber(number)}`;
}

function normalizeBatch(batch, index) {
  const number = batch.number || batchNumberFromName(batch.batch_name || batch.id, index + 1);
  return {
    ...batch,
    number,
    label: batch.batch_name || batchLabel(number),
    startedAt: batch.started_at || batch.seedSownAt,
    endedAt: batch.ended_at || batch.harvestedAt,
    source: batch.started_at ? "supabase" : "local",
  };
}

function daysFrom(value) {
  if (!value) return 0;
  const start = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today - start) / 86400000));
}

function dateInputToTimestamp(dateValue) {
  return new Date(`${dateValue || todayIsoDate()}T00:00:00+08:00`).toISOString();
}

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export default function BatchPanel({ cropBatches = [], isMock, latestReading, latestPrediction, onRefresh }) {
  const initialState = useMemo(readStoredBatches, []);
  const [localActiveBatch, setLocalActiveBatch] = useState(initialState.activeBatch);
  const [localHistory, setLocalHistory] = useState(initialState.history);
  const [seedDate, setSeedDate] = useState(localActiveBatch?.seedSownAt || todayIsoDate());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const remoteBatches = useMemo(
    () => cropBatches.map((batch, index) => normalizeBatch(batch, index)),
    [cropBatches],
  );
  const remoteActiveBatch = remoteBatches.find((batch) => batch.status === "active");
  const remoteHistory = remoteBatches.filter((batch) => batch.status !== "active" || batch.endedAt);
  const localActive = localActiveBatch ? normalizeBatch(localActiveBatch, remoteBatches.length) : null;
  const localHarvestHistory = localHistory.map((batch, index) => normalizeBatch(batch, index));
  const activeBatch = remoteActiveBatch || localActive;
  const history = remoteHistory.length ? remoteHistory : localHarvestHistory;
  const usingSupabase = !isMock;
  const highestNumber = Math.max(
    activeBatch?.number || 0,
    ...remoteBatches.map((batch) => batch.number || 0),
    ...localHarvestHistory.map((batch) => batch.number || 0),
    0,
  );
  const nextNumber = highestNumber + 1;
  const stageInfo = getPredictionStageInfo(latestPrediction);
  const realtimeAgeDays = getBatchAgeDays(latestPrediction, latestReading);
  const ageDays = realtimeAgeDays ?? daysFrom(activeBatch?.startedAt);
  const hasPrediction = Boolean(latestPrediction);

  function persistLocal(nextActiveBatch, nextHistory) {
    setLocalActiveBatch(nextActiveBatch);
    setLocalHistory(nextHistory);
    saveStoredBatches({ activeBatch: nextActiveBatch, history: nextHistory });
  }

  async function startBatch() {
    const startedAt = dateInputToTimestamp(seedDate);
    const number = nextNumber;
    const nextBatch = {
      id: batchId(number),
      batch_name: batchLabel(number),
      started_at: startedAt,
      ended_at: null,
      status: "active",
      notes: "Started from dashboard batch tracker.",
    };

    setBusy(true);
    setMessage("");
    try {
      if (usingSupabase) {
        await createCropBatch(nextBatch);
        await onRefresh?.();
        setMessage(`${nextBatch.batch_name} saved to Supabase.`);
      } else {
        persistLocal({ ...nextBatch, seedSownAt: startedAt }, localHistory);
        setMessage(`${nextBatch.batch_name} started in preview mode.`);
      }
    } catch (error) {
      persistLocal({ ...nextBatch, seedSownAt: startedAt }, localHistory);
      setMessage(error instanceof Error ? `Saved locally only: ${error.message}` : "Saved locally only.");
    } finally {
      setBusy(false);
    }
  }

  async function harvestBatch() {
    if (!activeBatch) return;
    const endedAt = new Date().toISOString();
    const harvestedBatch = {
      ...activeBatch,
      ended_at: endedAt,
      harvestedAt: endedAt,
      status: "harvested",
      harvestedStage: stageInfo.label,
      harvestedYield: formatYieldCount(latestPrediction),
    };

    setBusy(true);
    setMessage("");
    try {
      if (usingSupabase && activeBatch.source === "supabase") {
        await updateCropBatch(activeBatch.id, {
          ended_at: endedAt,
          status: "harvested",
          notes: `Harvested from dashboard. Stage: ${stageInfo.label}. Yield slots: ${formatYieldCount(latestPrediction)}.`,
        });
        await onRefresh?.();
        setMessage(`${activeBatch.label} marked harvested in Supabase.`);
      } else {
        persistLocal(null, [harvestedBatch, ...localHistory].slice(0, 8));
        setSeedDate(todayIsoDate());
        setMessage(`${activeBatch.label} moved to local harvest history.`);
      }
    } catch (error) {
      persistLocal(null, [harvestedBatch, ...localHistory].slice(0, 8));
      setSeedDate(todayIsoDate());
      setMessage(error instanceof Error ? `Saved locally only: ${error.message}` : "Saved locally only.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface h-full overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-white to-emerald-50/60 p-4 sm:p-5 dark:border-white/10 dark:from-slate-900 dark:to-emerald-950/30">
        <div>
          <p className="section-title">Batch Tracker</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            {activeBatch ? activeBatch.label : "No active batch"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Supabase-backed crop cycle from seed sowing to harvest.
          </p>
        </div>
        <StatusBadge tone={activeBatch ? "emerald" : "slate"}>
          <Sprout className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {activeBatch ? "Growing" : "Ready"}
        </StatusBadge>
      </div>

      {activeBatch ? (
        <div className="p-4 sm:p-5">
          <div className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-950 to-emerald-950 px-4 text-sm font-bold text-white dark:from-white dark:to-emerald-200 dark:text-slate-950">
            <Sprout className="h-4 w-4" aria-hidden="true" />
            {activeBatch.label}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="panel-muted p-3">
              <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Seed Sowing</p>
              <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{formatDate(activeBatch.startedAt)}</p>
            </div>
            <div className="panel-muted p-3">
              <CheckCircle2 className="h-4 w-4 text-sky-600 dark:text-sky-300" aria-hidden="true" />
              <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Crop Age</p>
              <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                {formatNumber(ageDays, realtimeAgeDays === null ? 0 : 1)} days
              </p>
            </div>
          </div>

          {hasPrediction ? (
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 text-sm dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">Prediction snapshot</p>
              <p className="mt-1 text-emerald-800 dark:text-emerald-200/80">
                {stageInfo.label} / {formatYieldCount(latestPrediction)} heads
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={harvestBatch}
            disabled={busy}
            className="focus-ring mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            Mark as harvested
          </button>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Seed sowing date</span>
            <input
              type="date"
              value={seedDate}
              onChange={(event) => setSeedDate(event.target.value)}
              className="focus-ring mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={startBatch}
            disabled={busy}
            className="focus-ring mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            Start {batchLabel(nextNumber)}
          </button>
        </div>
      )}

      {message ? (
        <div className="border-t border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 dark:border-white/10 dark:text-slate-300">
          {message}
        </div>
      ) : null}

      <div className="border-t border-slate-200 p-4 sm:p-5 dark:border-white/10">
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">Harvest history</p>
        </div>
        {history.length ? (
          <div className="space-y-2">
            {history.slice(0, 4).map((batch) => (
              <div key={batch.id} className="panel-muted flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">{batch.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Started {formatDate(batch.startedAt)}
                    {batch.endedAt ? ` / Harvested ${formatDateTime(batch.endedAt)}` : ""}
                  </p>
                </div>
                <StatusBadge tone={batch.status === "harvested" ? "emerald" : "slate"}>
                  {batch.status}
                </StatusBadge>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
            Harvested batches from Supabase or local preview will appear here.
          </p>
        )}
      </div>
    </section>
  );
}
