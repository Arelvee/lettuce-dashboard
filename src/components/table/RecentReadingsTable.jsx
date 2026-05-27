import { formatDateTime, formatNumber } from "../../utils/format";
import { getSensorStatus } from "../../utils/health";
import StatusBadge from "../common/StatusBadge";

const columns = [
  ["humidity", "Hum", 1],
  ["atemp", "Air", 1],
  ["wtemp", "Water", 1],
  ["tds", "TDS", 0],
  ["ec", "EC", 0],
  ["ph", "pH", 2],
];

export default function RecentReadingsTable({ readings }) {
  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-1 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <div>
          <p className="section-title">Recent Samples</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Sensor readings</h2>
        </div>
        <p className="text-sm text-slate-500">Newest first</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
          <tbody className="divide-y divide-slate-100">
            {readings.slice(0, 10).map((row) => {
              const phStatus = getSensorStatus("ph", row.ph);
              return (
                <tr key={row.id || row.timestamp} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {formatDateTime(row.timestamp)}
                  </td>
                  {columns.map(([key, , digits]) => (
                    <td key={key} className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatNumber(row[key], digits)}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge tone={row.pump_on ? "sky" : "slate"}>
                      {row.pump_on ? "On" : "Off"}
                    </StatusBadge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge tone={phStatus.tone}>{phStatus.label}</StatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

