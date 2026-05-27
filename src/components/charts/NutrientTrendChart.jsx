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
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-slate-500">{formatTime(label)}</p>
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
    <section className="surface p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title">Nutrients</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">TDS, EC, and pH</h2>
        </div>
        <p className="text-sm text-slate-500">Reservoir stability</p>
      </div>

      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              minTickGap={28}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[5.5, 6.7]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<TooltipContent />} />
            <Legend verticalAlign="top" height={32} iconType="circle" />
            <Line yAxisId="left" type="monotone" dataKey="tds" name="TDS" stroke="#7c3aed" strokeWidth={2} dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="ec" name="EC" stroke="#d97706" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="ph" name="pH" stroke="#475569" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

