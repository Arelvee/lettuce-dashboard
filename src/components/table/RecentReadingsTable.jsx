import { formatDateTime, formatNumber } from "../../utils/format";
import { getOverallHealth } from "../../utils/health";
import StatusBadge from "../common/StatusBadge";

const columns = [
  ["humidity", "Hum", 1],
  ["atemp", "Air", 1],
  ["wtemp", "Water", 1],
  ["tds", "TDS", 0],
  ["ec", "EC", 0],
  ["light", "Light", 0],
  ["ppfd", "PPFD", 0],
  ["r445", "R445", 4],
  ["r480", "R480", 4],
  ["ph", "pH", 2],
];

function healthTone(health) {
  if (health >= 85) return "emerald";
  if (health >= 65) return "amber";
  return "rose";
}

export default function RecentReadingsTable({ readings }) {
  return (
    <section className="surface flex h-full min-h-[420px] flex-col overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">Recent Samples</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Sensor readings</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Newest first</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="min-w-[1120px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-white/5 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Time</th>
              {columns.map(([, label]) => (
                <th key={label} className="px-4 py-3 font-semibold">
                  {label}
                </th>
              ))}
              <th className="px-4 py-3 font-semibold">Pump</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {readings.slice(0, 10).map((row) => {
              const health = getOverallHealth(row);
              return (
                <tr key={row.id || row.timestamp} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {formatDateTime(row.timestamp)}
                  </td>
                  {columns.map(([key, , digits]) => (
                    <td key={key} className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatNumber(row[key], digits)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge tone={row.pump_on ? "sky" : "slate"}>
                      {row.pump_on ? "On" : "Off"}
                    </StatusBadge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge tone={healthTone(health)}>{health}%</StatusBadge>
                  </td>
                </tr>
              );
            })}
            {!readings.length ? (
              <tr>
                <td colSpan={columns.length + 3} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No sensor samples available yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
