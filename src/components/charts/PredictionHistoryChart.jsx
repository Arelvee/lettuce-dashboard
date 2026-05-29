import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercent, formatTime, sortAscending } from "../../utils/format";
import { getPredictionConfidence, getPredictionStageInfo, getYieldCountInfo } from "../../utils/prediction";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const stageInfo = getPredictionStageInfo(row);
  const yieldInfo = getYieldCountInfo(row);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-slate-900">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formatTime(label)}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{stageInfo.label}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Confidence: {row.confidence === null ? "--" : formatPercent(row.confidence)}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Yield count: {yieldInfo.count === null ? "--" : `${yieldInfo.count}/${yieldInfo.slots}`} heads
      </p>
    </div>
  );
}

export default function PredictionHistoryChart({ predictions }) {
  const chartData = sortAscending(predictions.slice(0, 18)).map((row) => ({
    ...row,
    confidence: getPredictionConfidence(row),
  }));
  const confidenceValues = chartData
    .map((row) => row.confidence)
    .filter((value) => value !== null && value !== undefined && !Number.isNaN(Number(value)));
  const latest = confidenceValues.at(-1);
  const lowerDomain = confidenceValues.length
    ? Math.max(0, Math.min(...confidenceValues) - 0.08)
    : 0;
  const upperDomain = confidenceValues.length
    ? Math.min(1, Math.max(0.7, Math.max(...confidenceValues) + 0.08))
    : 1;

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div>
          <p className="section-title">Prediction History</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Confidence by run</h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            Latest {latest === null || latest === undefined ? "--" : formatPercent(latest)}
          </span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {chartData.length} runs
          </span>
        </div>
      </div>

      <div className="h-[220px] w-full px-3 pb-2 pt-3 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: -4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              minTickGap={24}
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
              domain={[lowerDomain, upperDomain]}
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip content={<TooltipContent />} />
            <Bar dataKey="confidence" name="Confidence" fill="#059669" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
