import { Brain, Gauge } from "lucide-react";
import { formatDateTime, formatNumber, formatPercent, normalizeJson } from "../../utils/format";
import StatusBadge from "../common/StatusBadge";

export default function PredictionPanel({ prediction }) {
  const probabilities = normalizeJson(prediction?.probabilities_json, {});
  const probabilityRows = Object.entries(probabilities).sort((a, b) => Number(b[1]) - Number(a[1]));

  return (
    <section className="surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-title">Latest Prediction</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {prediction?.growth_stage || "Waiting for ML window"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {prediction ? formatDateTime(prediction.timestamp) : "Requires 10 sensor samples."}
          </p>
        </div>
        <StatusBadge tone={Number(prediction?.stage_probability || 0) >= 0.75 ? "emerald" : "amber"}>
          <Brain className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {formatPercent(prediction?.stage_probability)}
        </StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Gauge className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Predicted Yield
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {formatNumber(prediction?.predicted_yield_g, 2)}
            <span className="ml-2 text-sm font-semibold text-slate-500">g</span>
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-600">Window</p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            {prediction?.window_start ? formatDateTime(prediction.window_start) : "--"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            to {prediction?.window_end ? formatDateTime(prediction.window_end) : "--"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {probabilityRows.length ? (
          probabilityRows.map(([stage, value]) => (
            <div key={stage}>
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                <span className="truncate">{stage}</span>
                <span>{formatPercent(value)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.max(3, Math.min(100, Number(value) * 100))}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
            No probability data yet.
          </p>
        )}
      </div>
    </section>
  );
}

