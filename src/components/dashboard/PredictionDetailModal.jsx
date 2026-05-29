import { AlertTriangle, CalendarDays, CheckCircle2, Gauge, Leaf, X } from "lucide-react";
import { formatNumber, formatPercent } from "../../utils/format";
import {
  formatYieldCount,
  getGrowthTimeline,
  getPredictionConfidence,
  getPredictionStageInfo,
  getYieldExplanation,
} from "../../utils/prediction";
import StatusBadge from "../common/StatusBadge";

function formatSchedule(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function stageTone(status) {
  if (status === "completed") return "emerald";
  if (status === "current") return "sky";
  return "slate";
}

function uniqueItems(items = []) {
  return [...new Set(items.filter(Boolean))];
}

export default function PredictionDetailModal({
  type,
  prediction,
  stalePrediction,
  latestReading,
  cropBatches = [],
  onClose,
}) {
  if (!type) return null;

  const stageInfo = getPredictionStageInfo(prediction || latestReading);
  const confidence = getPredictionConfidence(prediction) ?? getPredictionConfidence(latestReading);
  const timeline = getGrowthTimeline({ prediction, latestReading, cropBatches });
  const yieldInfo = getYieldExplanation(prediction);
  const title = type === "stage" ? "Growth Stage Timeline" : "Yield Count Details";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm">
      <section className="surface max-h-[92vh] w-full max-w-3xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5 dark:border-white/10">
          <div>
            <p className="section-title">{title}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
              {stageInfo.label} / {formatYieldCount(prediction)} heads
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Confidence {confidence === null ? "--" : formatPercent(confidence)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close details"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-88px)] overflow-y-auto p-4 sm:p-5">
          {!prediction && stalePrediction ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200">
              Last ML prediction is stale ({formatSchedule(stalePrediction.timestamp)}), so this view is using the current sensor age-stage until lettucertos.py uploads a fresh 10-sample prediction.
            </div>
          ) : null}

          {type === "stage" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="panel-muted p-3">
                  <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Crop Age</p>
                  <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                    {timeline.current_age_days === null || timeline.current_age_days === undefined
                      ? "--"
                      : `${formatNumber(timeline.current_age_days, 1)} days`}
                  </p>
                </div>
                <div className="panel-muted p-3">
                  <Leaf className="h-4 w-4 text-sky-600 dark:text-sky-300" aria-hidden="true" />
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Predicted Stage</p>
                  <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{stageInfo.label}</p>
                </div>
                <div className="panel-muted p-3">
                  <Gauge className="h-4 w-4 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Yield Count</p>
                  <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{formatYieldCount(prediction)}</p>
                </div>
              </div>

              {timeline.available ? (
                <>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-400/20 dark:bg-emerald-400/10">
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                      Harvest window
                    </p>
                    <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200/80">
                      Ready around {formatSchedule(timeline.harvest_ready_timestamp)}. Window ends {formatSchedule(timeline.harvest_window_end_timestamp)}.
                    </p>
                    <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-200/70">
                      {formatNumber(timeline.days_until_harvest_ready || 0, 1)} days until harvest-ready.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {timeline.stages.map((stage) => (
                      <div
                        key={stage.stage}
                        className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto] sm:items-center dark:border-white/10"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-950 dark:text-white">{stage.stage}</p>
                            <StatusBadge tone={stageTone(stage.status)}>{stage.status}</StatusBadge>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Day {formatNumber(stage.start_day, 0)} to {formatNumber(stage.end_day, 0)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Expected yield {formatNumber(stage.expected_yield_slots || 0, 0)}/6
                          </p>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          <p>{formatSchedule(stage.start_timestamp)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">to {formatSchedule(stage.end_timestamp)}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {stage.status === "upcoming"
                            ? `${formatNumber(stage.days_until_start, 1)} days left`
                            : `${formatNumber(stage.days_until_end, 1)} days to next`}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200">
                  Start a batch or pass `--crop-start` so exact stage dates can be calculated.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="panel-muted p-3">
                  <Leaf className="h-4 w-4 text-sky-600 dark:text-sky-300" aria-hidden="true" />
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Alive Slots</p>
                  <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                    {yieldInfo.predicted_alive_slots ?? "--"} / 6
                  </p>
                </div>
                <div className="panel-muted p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Empty or At Risk</p>
                  <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                    {yieldInfo.predicted_empty_slots ?? "--"} slots
                  </p>
                </div>
                <div className="panel-muted p-3">
                  <Gauge className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Yield Confidence</p>
                  <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                    {yieldInfo.yield_confidence_pct === null || yieldInfo.yield_confidence_pct === undefined
                      ? "--"
                      : `${formatNumber(yieldInfo.yield_confidence_pct, 1)}%`}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Why this yield</p>
                  </div>
                  <div className="space-y-2">
                    {uniqueItems(yieldInfo.reasons).length ? (
                      uniqueItems(yieldInfo.reasons).map((reason) => (
                        <p key={reason} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                          {reason}
                        </p>
                      ))
                    ) : (
                      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                        The next prediction upload will include detailed yield reasons.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Adjustments</p>
                  </div>
                  <div className="space-y-2">
                    {uniqueItems(yieldInfo.recommended_actions).length ? (
                      uniqueItems(yieldInfo.recommended_actions).map((action) => (
                        <p key={action} className="rounded-lg bg-emerald-50/70 p-3 text-sm text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200">
                          {action}
                        </p>
                      ))
                    ) : (
                      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                        No sensor correction is attached to this prediction yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {yieldInfo.sensor_adjustments?.length ? (
                <div className="border-t border-slate-200 pt-4 dark:border-white/10">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Sensor targets</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {yieldInfo.sensor_adjustments.map((item) => (
                      <div key={`${item.sensor}-${item.status}`} className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
                        <p className="text-sm font-bold capitalize text-slate-950 dark:text-white">{item.sensor}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Reading {item.reading}; target {item.target_min} to {item.target_max}
                        </p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
