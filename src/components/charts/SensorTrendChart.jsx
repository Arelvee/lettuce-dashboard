import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatTime, sortAscending } from "../../utils/format";

const series = [
  { key: "humidity", label: "Humidity", color: "#10b981", unit: "%" },
  { key: "atemp", label: "Air Temp", color: "#f97316", unit: "C" },
  { key: "wtemp", label: "Water Temp", color: "#38bdf8", unit: "C" },
];

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg dark:border-white/10 dark:bg-slate-950/95">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formatTime(label)}</p>
      <div className="mt-2 space-y-1">
        {payload.map((item) => (
          <p key={item.dataKey} className="text-sm font-medium" style={{ color: item.color }}>
            {item.name}: {formatNumber(item.value, 1)}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function SensorTrendChart({ readings }) {
  const chartData = sortAscending(readings.slice(0, 72)).map((row) => ({
    ...row,
    timestamp: row.timestamp,
  }));

  return (
    <section className="surface flex h-full min-h-[420px] flex-col overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">Environment Trend</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Temperature and humidity</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Latest {chartData.length} readings</p>
      </div>

      <div className="min-h-[300px] flex-1 p-4 sm:p-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {series.map((item) => (
                <linearGradient key={item.key} id={`${item.key}Gradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="timestamp"
              minTickGap={28}
              tickFormatter={formatTime}
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--chart-tick)" }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip content={<TooltipContent />} />
            <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ color: "var(--chart-tick)" }} />
            {series.map((item) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                fill={`url(#${item.key}Gradient)`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
