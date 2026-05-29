import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatTime, sortAscending } from "../../utils/format";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg dark:border-white/10 dark:bg-slate-950/95">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formatTime(label)}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-sm font-medium" style={{ color: item.color }}>
          {item.name}: {formatNumber(item.value, item.dataKey === "ph" ? 2 : 0)}
        </p>
      ))}
    </div>
  );
}

export default function NutrientTrendChart({ readings }) {
  const chartData = sortAscending(readings.slice(0, 72));

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">Nutrients</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">TDS, EC, and pH</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Reservoir stability</p>
      </div>

      <div className="h-[300px] w-full p-4 sm:p-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              minTickGap={28}
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[5.5, 6.7]}
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<TooltipContent />} />
            <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ color: "var(--chart-tick)" }} />
            <Line yAxisId="left" type="monotone" dataKey="tds" name="TDS" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="ec" name="EC" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="ph" name="pH" stroke="#14b8a6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
