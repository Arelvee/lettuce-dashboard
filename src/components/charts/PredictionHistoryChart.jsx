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
import { getPredictionStageInfo, getYieldCountInfo } from "../../utils/prediction";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const stageInfo = getPredictionStageInfo(row);
  const yieldInfo = getYieldCountInfo(row);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-white/10 dark:bg-slate-900">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formatTime(label)}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{stageInfo.label}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">Confidence: {formatPercent(row.stage_probability)}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Yield count: {yieldInfo.count === null ? "--" : `${yieldInfo.count}/${yieldInfo.slots}`} heads
      </p>
    </div>
  );
}

export default function PredictionHistoryChart({ predictions }) {
  const chartData = sortAscending(predictions.slice(0, 18));

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">Prediction History</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Confidence by run</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">BiLSTM-Attention + XGBoost output</p>
      </div>

      <div className="h-[260px] w-full p-4 sm:p-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              domain={[0, 1]}
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip content={<TooltipContent />} />
            <Bar dataKey="stage_probability" name="Confidence" fill="#059669" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
