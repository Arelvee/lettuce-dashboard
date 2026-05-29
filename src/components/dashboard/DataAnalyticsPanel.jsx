import { Activity, BarChart3, Gauge, Target, TrendingUp } from "lucide-react";
import { formatNumber, formatPercent } from "../../utils/format";
import { getSensorStatus, SENSOR_META } from "../../utils/health";
import { getPredictionStageInfo, getYieldCountInfo } from "../../utils/prediction";

function average(rows, key) {
  const values = rows
    .map((row) => Number(row[key]))
    .filter((value) => !Number.isNaN(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function targetRate(rows) {
  if (!rows.length) return null;
  const total = rows.length * Object.keys(SENSOR_META).length;
  const optimal = rows.reduce((count, row) => {
    return count + Object.keys(SENSOR_META).filter((key) => getSensorStatus(key, row[key]).label === "Optimal").length;
  }, 0);
  return optimal / total;
}

export default function DataAnalyticsPanel({ readings = [], predictions = [] }) {
  const recentReadings = readings.slice(0, 24);
  const latestPrediction = predictions[0];
  const stageInfo = getPredictionStageInfo(latestPrediction);
  const yieldInfo = getYieldCountInfo(latestPrediction);
  const avgTemp = average(recentReadings, "atemp");
  const avgPh = average(recentReadings, "ph");
  const avgEc = average(recentReadings, "ec");
  const target = targetRate(recentReadings);

  const analytics = [
    {
      icon: Target,
      label: "Target Stability",
      value: target === null ? "--" : formatPercent(target),
      detail: "Optimal readings across recent samples",
      tone: "emerald",
    },
    {
      icon: TrendingUp,
      label: "Latest Stage",
      value: stageInfo.label,
      detail: stageInfo.classId === null ? "Classifier waiting" : `Class ${stageInfo.classId}`,
      tone: "sky",
    },
    {
      icon: BarChart3,
      label: "Yield Count",
      value: yieldInfo.count === null ? "--" : `${yieldInfo.count}/${yieldInfo.slots}`,
      detail: "Regressor output for lettuce slots",
      tone: "amber",
    },
    {
      icon: Activity,
      label: "Samples Used",
      value: recentReadings.length || "--",
      detail: "Latest records in analytics window",
      tone: "slate",
    },
  ];
  const toneText = {
    emerald: "text-emerald-600 dark:text-emerald-300",
    sky: "text-sky-600 dark:text-sky-300",
    amber: "text-amber-600 dark:text-amber-300",
    slate: "text-slate-600 dark:text-slate-300",
  };

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">Data Analytics</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Model and sensor summary</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Recent {recentReadings.length || 0} samples</p>
      </div>

      <div className="grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4 dark:divide-white/10">
        {analytics.map((item) => (
          <div key={item.label} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{item.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-white/5 ${toneText[item.tone] || toneText.emerald}`}>
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid border-t border-slate-200 md:grid-cols-3 md:divide-x md:divide-slate-200 dark:border-white/10 dark:divide-white/10">
        <div className="p-4 sm:p-5">
          <Gauge className="h-4 w-4 text-rose-500" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Avg Air Temp</p>
          <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{formatNumber(avgTemp, 1)} C</p>
        </div>
        <div className="border-t border-slate-200 p-4 sm:p-5 md:border-t-0 dark:border-white/10">
          <Gauge className="h-4 w-4 text-sky-500" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Avg pH</p>
          <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{formatNumber(avgPh, 2)}</p>
        </div>
        <div className="border-t border-slate-200 p-4 sm:p-5 md:border-t-0 dark:border-white/10">
          <Gauge className="h-4 w-4 text-amber-500" aria-hidden="true" />
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Avg EC</p>
          <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{formatNumber(avgEc, 0)} uS/cm</p>
        </div>
      </div>
    </section>
  );
}
