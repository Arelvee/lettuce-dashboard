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
  { key: "humidity", label: "Humidity", color: "#059669", unit: "%" },
  { key: "atemp", label: "Air Temp", color: "#dc2626", unit: "C" },
  { key: "wtemp", label: "Water Temp", color: "#0284c7", unit: "C" },
];

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-slate-500">{formatTime(label)}</p>
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
    <section className="surface p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title">Environment Trend</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Temperature and humidity</h2>
        </div>
        <p className="text-sm text-slate-500">Latest {chartData.length} readings</p>
      </div>

      <div className="mt-4 h-[300px] w-full">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="timestamp"
              minTickGap={28}
              tickFormatter={formatTime}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip content={<TooltipContent />} />
            <Legend verticalAlign="top" height={32} iconType="circle" />
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

