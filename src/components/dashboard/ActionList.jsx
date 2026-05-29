import { AlertTriangle, CheckCircle2, WifiOff } from "lucide-react";
import { getActionItems, getOverallHealth } from "../../utils/health";
import StatusBadge from "../common/StatusBadge";

export default function ActionList({ latestReading, connectionStatus = "online" }) {
  const actions = getActionItems(latestReading);
  const health = getOverallHealth(latestReading);
  const hasReading = Boolean(latestReading);
  const isPreview = connectionStatus === "preview" || connectionStatus === "fallback";
  const isDelayed = connectionStatus === "stale";
  const isOffline = !hasReading || connectionStatus === "offline";
  const badgeTone = isOffline ? "rose" : isPreview || isDelayed ? "amber" : health >= 85 ? "emerald" : health >= 65 ? "amber" : "rose";
  const badgeLabel = isOffline
    ? "Offline"
    : isPreview
      ? "Preview"
      : isDelayed
        ? "Delayed"
        : health >= 85
          ? "Stable"
          : health >= 65
            ? "Watch"
            : "Needs action";

  return (
    <section className="surface overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4 sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">Crop Health</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            {isOffline ? "Waiting for ESP32" : isPreview ? "Preview guidance" : `${health}% overall`}
          </h2>
        </div>
        <StatusBadge tone={badgeTone}>{badgeLabel}</StatusBadge>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-white/10">
        {isOffline ? (
          <div className="flex gap-3 p-4 sm:p-5">
            <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-300" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">ESP32 is offline</p>
              <p className="mt-1 text-sm text-rose-800 dark:text-rose-200/80">
                No sensor data is being received. Check power, Wi-Fi, or the Supabase upload process.
              </p>
            </div>
          </div>
        ) : isPreview ? (
          <div className="flex gap-3 p-4 sm:p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-300" aria-hidden="true" />
            <p className="text-sm font-medium text-sky-800 dark:text-sky-200">
              Preview readings are shown because no live ESP32 data is available yet.
            </p>
          </div>
        ) : actions.length ? (
          actions.map((item) => (
            <div key={item.key} className="flex gap-3 p-4 sm:p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.sensorLabel}: {item.statusLabel}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.advice}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex gap-3 p-4 sm:p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              All monitored values are inside target ranges.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
