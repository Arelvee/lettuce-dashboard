import { Brain, Gauge, Tags } from "lucide-react";
import { formatDateTime, formatPercent, normalizeJson } from "../../utils/format";
import { getPredictionStageInfo, getYieldCountInfo, normalizeProbabilityRows } from "../../utils/prediction";
import StatusBadge from "../common/StatusBadge";

export default function PredictionPanel({ prediction }) {
  const probabilities = normalizeJson(prediction?.probabilities_json, {});
  const probabilityRows = normalizeProbabilityRows(probabilities);
  const stageInfo = getPredictionStageInfo(prediction);
  const yieldInfo = getYieldCountInfo(prediction);

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">Latest Prediction</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            {stageInfo.label}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {prediction
              ? `${stageInfo.classId === null ? "Classifier label" : `Class ${stageInfo.classId}`} / ${formatDateTime(prediction.timestamp)}`
              : "Requires sensor window from BiLSTM-Attention features."}
          </p>
        </div>
        <StatusBadge tone={Number(prediction?.stage_probability || 0) >= 0.75 ? "emerald" : "amber"}>
          <Brain className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {formatPercent(prediction?.stage_probability)}
        </StatusBadge>
      </div>

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
            XGBoost regressor count output
          </p>
        </div>
        <div className="border-t border-slate-200 p-4 sm:border-t-0 sm:p-5 dark:border-white/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Tags className="h-4 w-4 text-sky-600" aria-hidden="true" />
            Prediction Window
          </div>
          <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
            {prediction?.window_start ? formatDateTime(prediction.window_start) : "--"}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            to {prediction?.window_end ? formatDateTime(prediction.window_end) : "--"}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4 sm:p-5 dark:border-white/10">
        {probabilityRows.length ? (
          <div className="space-y-3">
            {probabilityRows.map(({ stage, label, value }) => (
              <div key={stage}>
                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="truncate">{label}</span>
                  <span>{formatPercent(value)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.max(3, Math.min(100, Number(value) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No probability data yet.
          </p>
        )}
      </div>
    </section>
  );
}
