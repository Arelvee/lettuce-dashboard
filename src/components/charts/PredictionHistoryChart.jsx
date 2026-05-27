import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatPercent, formatTime, sortAscending } from "../../utils/format";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-slate-500">{formatTime(label)}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{row.growth_stage}</p>
      <p className="text-sm text-slate-600">Confidence: {formatPercent(row.stage_probability)}</p>
      <p className="text-sm text-slate-600">Yield: {formatNumber(row.predicted_yield_g, 2)} g</p>
    </div>
  );
}

export default function PredictionHistoryChart({ predictions }) {
  const chartData = sortAscending(predictions.slice(0, 18));

  return (
    <section className="surface p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title">Prediction History</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Confidence by run</h2>
        </div>
        <p className="text-sm text-slate-500">TFLite + XGBoost output</p>
      </div>

      <div className="mt-4 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              minTickGap={24}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
              domain={[0, 1]}
              tick={{ fontSize: 12, fill: "#64748b" }}
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

