import { CloudSun, Droplets, Power, ThermometerSun } from "lucide-react";
import { formatDateTime, formatNumber } from "../../utils/format";
import StatusBadge from "../common/StatusBadge";

export default function OperationsPanel({ pumpEvent, weather }) {
  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-slate-200 p-4 sm:p-5 dark:border-white/10">
        <p className="section-title">Operations</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Pump and weather</h2>
      </div>

      <div className="grid divide-y divide-slate-200 dark:divide-white/10">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                <Power className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Nutrient Pump</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pumpEvent?.schedule || "06:00-18:00 Asia/Manila"}</p>
              </div>
            </div>
            <StatusBadge tone={pumpEvent?.pump_on ? "sky" : "slate"}>
              {pumpEvent?.pump_on ? "On" : "Off"}
            </StatusBadge>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {pumpEvent?.timestamp ? formatDateTime(pumpEvent.timestamp) : "No pump event yet."}
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
              <CloudSun className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Manila Weather</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{weather?.source || "Waiting for weather fetch"}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div>
              <ThermometerSun className="h-4 w-4 text-rose-500" aria-hidden="true" />
              <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                {formatNumber(weather?.temperature_2m, 1)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">C</p>
            </div>
            <div>
              <Droplets className="h-4 w-4 text-sky-500" aria-hidden="true" />
              <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                {formatNumber(weather?.relative_humidity_2m, 0)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">%RH</p>
            </div>
            <div>
              <CloudSun className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                {formatNumber(weather?.cloud_cover, 0)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">% cloud</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
