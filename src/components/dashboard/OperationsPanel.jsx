import { CloudSun, Droplets, ThermometerSun, Wind } from "lucide-react";
import { formatDateTime, formatNumber } from "../../utils/format";

export default function OperationsPanel({ weather }) {
  return (
    <section className="surface h-full overflow-hidden">
      <div className="border-b border-slate-200 p-4 sm:p-5 dark:border-white/10">
        <p className="section-title">Weather</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Manila environment</h2>
      </div>

      <div className="grid divide-y divide-slate-200 dark:divide-white/10">
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

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-teal-600 dark:text-teal-300" aria-hidden="true" />
              {weather?.timestamp ? `Last weather sample ${formatDateTime(weather.timestamp)}` : "Weather sample not available yet."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
