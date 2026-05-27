import { formatNumber } from "../../utils/format";
import { getSensorStatus, SENSOR_META } from "../../utils/health";
import StatusBadge from "../common/StatusBadge";

export default function SensorTile({ sensorKey, value }) {
  const meta = SENSOR_META[sensorKey];
  const status = getSensorStatus(sensorKey, value);
  const percent =
    meta && value !== undefined
      ? Math.max(0, Math.min(100, ((Number(value) - meta.min) / (meta.max - meta.min)) * 100))
      : 0;

  return (
    <article className="surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{meta.label}</p>
          <p className="mt-1 text-xs text-slate-500">
            Target {formatNumber(meta.min, meta.precision)}-{formatNumber(meta.max, meta.precision)} {meta.unit}
          </p>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-950">
          {formatNumber(value, meta.precision)}
        </span>
        <span className="pb-1 text-xs font-semibold text-slate-500">{meta.unit}</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            status.tone === "emerald"
              ? "bg-emerald-500"
              : status.tone === "rose"
                ? "bg-rose-500"
                : "bg-amber-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </article>
  );
}

