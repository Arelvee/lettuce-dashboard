import { Brain, DatabaseZap, Gauge, Tags } from "lucide-react";
import { formatDateTime, formatNumber, formatPercent } from "../../utils/format";
import {
  getBatchAgeDays,
  getPredictionConfidence,
  getPredictionStageInfo,
  getYieldPredictionInterval,
  getYieldCountInfo,
} from "../../utils/prediction";
import StatusBadge from "../common/StatusBadge";

export default function PredictionPanel({ prediction, stalePrediction }) {
  const displayPrediction = prediction || stalePrediction;
  const isStale = !prediction && Boolean(stalePrediction);
  const stageInfo = getPredictionStageInfo(displayPrediction);
  const yieldInfo = getYieldCountInfo(displayPrediction);
  const intervalInfo = getYieldPredictionInterval(displayPrediction);
  const confidence = getPredictionConfidence(displayPrediction);
  const ageDays = getBatchAgeDays(displayPrediction);
  const sampleCount = displayPrediction?.window_sample_count ?? displayPrediction?.sample_count ?? null;
  const modelName = displayPrediction?.model_backend || displayPrediction?.model_name || "prediction row";
  const prioritySensor = String(displayPrediction?.priority_sensor || "").trim().toLowerCase();
  const hasPrioritySensor = prioritySensor && prioritySensor !== "none" && prioritySensor !== "no priority";
  const action =
    displayPrediction?.recommended_action ||
    displayPrediction?.adjustment_summary ||
    (hasPrioritySensor
      ? `Priority sensor to review: ${displayPrediction.priority_sensor}.`
      : "Using the database prediction row as the source of truth.");

  return (
    <section className="surface h-full overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">{isStale ? "Last Prediction" : "Latest Prediction"}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            {isStale ? "Stale ML Output" : stageInfo.label}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {displayPrediction
              ? `${stageInfo.label} / ${formatDateTime(displayPrediction.timestamp)}`
              : "Requires a fresh 10-sample TFLite + XGBoost sensor window."}
          </p>
        </div>
        <StatusBadge tone={isStale ? "amber" : Number(confidence || 0) >= 0.75 ? "emerald" : "amber"}>
          <Brain className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {isStale ? "stale" : confidence === null ? "--" : formatPercent(confidence)}
        </StatusBadge>
      </div>

      {isStale ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:px-5 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200">
          This ML row is older than the latest sensor data. Run the simulator until a fresh 10-sample window is uploaded.
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-slate-200 dark:divide-white/10">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Gauge className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Yield Count
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
            {yieldInfo.count === null ? "--" : yieldInfo.count}
            <span className="ml-2 text-sm font-semibold text-slate-500 dark:text-slate-400">of {yieldInfo.slots} heads</span>
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            Database regressor slot-count output
          </p>
          {intervalInfo.available ? (
            <div className="mt-3 rounded-lg border border-sky-200/70 bg-sky-50/80 p-3 dark:border-sky-300/15 dark:bg-sky-400/10">
              <p className="text-[11px] font-bold uppercase text-sky-700 dark:text-sky-200">Prediction Interval</p>
              <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                {formatNumber(intervalInfo.low, 1)}-{formatNumber(intervalInfo.high, 1)} of {intervalInfo.slots} heads
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Yield confidence {intervalInfo.confidencePct === null ? "--" : `${formatNumber(intervalInfo.confidencePct, 1)}%`}
              </p>
            </div>
          ) : null}
        </div>
        <div className="border-t border-slate-200 p-4 sm:border-t-0 sm:p-5 dark:border-white/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Tags className="h-4 w-4 text-sky-600" aria-hidden="true" />
            Prediction Window
          </div>
          <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
            {displayPrediction?.window_start ? formatDateTime(displayPrediction.window_start) : "--"}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            to {displayPrediction?.window_end ? formatDateTime(displayPrediction.window_end) : "--"}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            Age {ageDays === null ? "--" : `${formatNumber(ageDays, 1)} days`}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4 sm:p-5 dark:border-white/10">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <DatabaseZap className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
          Database Output
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="panel-muted p-3">
            <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Growth Stage</p>
            <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{stageInfo.label}</p>
          </div>
          <div className="panel-muted p-3">
            <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Stage Confidence</p>
            <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
              {confidence === null ? "--" : formatPercent(confidence)}
            </p>
          </div>
          <div className="panel-muted p-3">
            <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Raw Yield Estimate</p>
            <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
              {yieldInfo.raw === null ? "--" : `${formatNumber(yieldInfo.raw, 1)} / ${yieldInfo.slots}`}
            </p>
          </div>
          <div className="panel-muted p-3">
            <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Yield Range</p>
            <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
              {intervalInfo.available
                ? `${formatNumber(intervalInfo.low, 1)}-${formatNumber(intervalInfo.high, 1)} / ${intervalInfo.slots}`
                : "--"}
            </p>
          </div>
          <div className="panel-muted p-3">
            <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">Window Samples</p>
            <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
              {sampleCount === null ? modelName : `${sampleCount} samples`}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-emerald-200/70 bg-emerald-50/75 p-3 text-sm font-medium text-emerald-900 dark:border-emerald-300/15 dark:bg-emerald-400/10 dark:text-emerald-100">
          {action}
        </div>
      </div>
    </section>
  );
}
