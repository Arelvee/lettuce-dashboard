import { Activity, Droplets, Gauge, Sun, ThermometerSun, Waves, Zap } from "lucide-react";
import { formatNumber } from "../../utils/format";
import { getSensorStatus, SENSOR_META } from "../../utils/health";
import StatusBadge from "../common/StatusBadge";

const sensorIcons = {
  humidity: Droplets,
  atemp: ThermometerSun,
  wtemp: Droplets,
  tds: Gauge,
  ec: Zap,
  light: Sun,
  ppfd: Sun,
  r445: Waves,
  r480: Waves,
  ph: Activity,
};

const tileStyles = {
  emerald:
    "border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/70 dark:border-emerald-400/15 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/25",
  amber:
    "border-amber-200 bg-gradient-to-br from-white via-amber-50/70 to-orange-50 dark:border-amber-400/25 dark:from-slate-900 dark:via-amber-950/15 dark:to-orange-950/20",
  rose:
    "border-rose-200 bg-gradient-to-br from-white via-rose-50/70 to-red-50 dark:border-rose-400/25 dark:from-slate-900 dark:via-rose-950/15 dark:to-red-950/20",
  sky:
    "border-sky-200 bg-gradient-to-br from-white via-sky-50/70 to-cyan-50 dark:border-sky-400/25 dark:from-slate-900 dark:via-sky-950/15 dark:to-cyan-950/20",
  slate:
    "border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/70 dark:border-white/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80",
};

const iconStyles = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
};

export default function SensorTile({ sensorKey, value, connectionStatus = "online" }) {
  const meta = SENSOR_META[sensorKey];
  const hasReading = value !== null && value !== undefined && !Number.isNaN(Number(value));
  const liveStatus = getSensorStatus(sensorKey, value);
  const SensorIcon = sensorIcons[sensorKey] || Activity;
  const status =
    !hasReading
      ? { label: "No reading", tone: "slate" }
      : connectionStatus === "offline" || connectionStatus === "stale"
        ? { label: connectionStatus === "stale" ? "Stale" : "Offline", tone: "rose" }
        : liveStatus;
  const heatPosition = hasReading ? liveStatus.position : 0;
  const targetFit = hasReading ? Math.round(liveStatus.score) : 0;
  const tileClass = tileStyles[status.tone] || tileStyles.slate;
  const iconClass = iconStyles[status.tone] || iconStyles.slate;

  return (
    <article className={`surface min-h-[174px] overflow-hidden p-4 ${tileClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
            <SensorIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{meta.label}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Target range</p>
          </div>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-950 dark:text-white">
              {hasReading ? formatNumber(value, meta.precision) : "--"}
            </span>
            <span className="pb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{meta.unit}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Target {formatNumber(meta.min, meta.precision)}-{formatNumber(meta.max, meta.precision)} {meta.unit}
          </p>
        </div>
        <div className="rounded-md bg-white/75 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
          {hasReading && connectionStatus !== "offline" ? `${targetFit}% fit` : "check"}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
          <span>Low</span>
          <span>Target</span>
          <span>Over</span>
        </div>
        <div className="relative mt-1.5 h-2.5 overflow-visible rounded-full bg-slate-100 shadow-inner dark:bg-slate-800">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #ef4444 0%, #f97316 18%, #facc15 31%, #22c55e 43%, #10b981 57%, #facc15 69%, #f97316 82%, #ef4444 100%)",
            }}
          />
          <span className="absolute left-[33.33%] top-1/2 h-4 w-px -translate-y-1/2 bg-white/80 shadow dark:bg-slate-950/80" />
          <span className="absolute left-[66.66%] top-1/2 h-4 w-px -translate-y-1/2 bg-white/80 shadow dark:bg-slate-950/80" />
          <span
            className="absolute top-1/2 h-4 w-2 -translate-y-1/2 rounded-full border border-white bg-slate-950 shadow-md dark:bg-white"
            style={{ left: `calc(${heatPosition}% - 0.25rem)` }}
          />
        </div>
      </div>

      {!hasReading ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
          No data received from this sensor.
        </p>
      ) : null}
    </article>
  );
}
