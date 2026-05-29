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

const progressColors = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  slate: "bg-slate-400",
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
        : connectionStatus === "preview" || connectionStatus === "fallback"
          ? { label: "Preview", tone: "sky" }
          : liveStatus;
  const percent =
    meta && hasReading
      ? Math.max(0, Math.min(100, ((Number(value) - meta.min) / (meta.max - meta.min)) * 100))
      : 0;

  return (
    <article className="surface min-h-[154px] overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300">
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
        <div className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {hasReading && connectionStatus === "online" ? `${Math.round(percent)}%` : "check"}
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${progressColors[status.tone] || progressColors.slate}`}
          style={{ width: `${hasReading ? Math.max(5, percent) : 100}%` }}
        />
      </div>

      {!hasReading ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
          No data received from this sensor.
        </p>
      ) : null}
    </article>
  );
}
