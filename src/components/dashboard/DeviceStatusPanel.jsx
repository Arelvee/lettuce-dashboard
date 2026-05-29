import { AlertTriangle, CheckCircle2, Clock3, Cpu, Database, Wifi, WifiOff } from "lucide-react";
import { formatDateTime } from "../../utils/format";
import { getSensorStatus, SENSOR_META } from "../../utils/health";
import { getConnectionLabel, OFFLINE_AFTER_MINUTES } from "../../utils/deviceStatus";
import StatusBadge from "../common/StatusBadge";

const statusConfig = {
  online: {
    tone: "emerald",
    icon: Wifi,
    title: "Live packets are arriving.",
    message: "ESP32 sensor data is updating normally.",
  },
  stale: {
    tone: "amber",
    icon: Clock3,
    title: "No recent packet received.",
    message: "Check ESP32 power, Wi-Fi, or the upload script.",
  },
  offline: {
    tone: "rose",
    icon: WifiOff,
    title: "No live sensor packet yet.",
    message: "The dashboard will mark readings until ESP32 sends data.",
  },
  preview: {
    tone: "sky",
    icon: Database,
    title: "Showing preview readings.",
    message: "No live ESP32 rows are available yet.",
  },
  fallback: {
    tone: "amber",
    icon: AlertTriangle,
    title: "Using backup preview data.",
    message: "Supabase is unreachable from this browser session.",
  },
};

export default function DeviceStatusPanel({ latestReading, connectionStatus, sensorKeys }) {
  const config = statusConfig[connectionStatus] || statusConfig.offline;
  const StatusIcon = config.icon;
  const missingSensors = sensorKeys.filter((key) => {
    const value = latestReading?.[key];
    return value === null || value === undefined || Number.isNaN(Number(value));
  });
  const watchSensors = sensorKeys
    .filter((key) => !missingSensors.includes(key))
    .filter((key) => getSensorStatus(key, latestReading?.[key]).label !== "Optimal");
  const readyCount = sensorKeys.length - missingSensors.length;
  const healthPercent = Math.round((readyCount / sensorKeys.length) * 100);

  return (
    <section className="surface overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div className="border-b border-slate-200 p-4 sm:p-5 lg:border-b-0 lg:border-r dark:border-white/10">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <StatusIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Hardware Link</p>
                <StatusBadge tone={config.tone}>{getConnectionLabel(connectionStatus)}</StatusBadge>
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{config.title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{config.message}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 p-4 sm:p-5 lg:border-b-0 lg:border-r dark:border-white/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Clock3 className="h-4 w-4 text-sky-600 dark:text-sky-300" aria-hidden="true" />
            Last ESP32 Sample
          </div>
          <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">
            {latestReading?.timestamp ? formatDateTime(latestReading.timestamp) : "No timestamp"}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Offline after {OFFLINE_AFTER_MINUTES} minutes without a new packet.
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            Sensor Channels
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950 dark:text-white">{readyCount}</span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">of {sensorKeys.length} receiving</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${healthPercent}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {missingSensors.length ? (
              missingSensors.slice(0, 3).map((key) => (
                <StatusBadge key={key} tone="slate">
                  {SENSOR_META[key].label}: No reading
                </StatusBadge>
              ))
            ) : watchSensors.length ? (
              watchSensors.slice(0, 3).map((key) => (
                <StatusBadge key={key} tone={getSensorStatus(key, latestReading?.[key]).tone}>
                  {SENSOR_META[key].label}: {getSensorStatus(key, latestReading?.[key]).label}
                </StatusBadge>
              ))
            ) : (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                All sensor channels ready.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
