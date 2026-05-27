import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getActionItems, getOverallHealth } from "../../utils/health";
import StatusBadge from "../common/StatusBadge";

export default function ActionList({ latestReading }) {
  const actions = getActionItems(latestReading);
  const health = getOverallHealth(latestReading);

  return (
    <section className="surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-title">Crop Health</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{health}% overall</h2>
        </div>
        <StatusBadge tone={health >= 85 ? "emerald" : health >= 65 ? "amber" : "rose"}>
          {health >= 85 ? "Stable" : health >= 65 ? "Watch" : "Needs action"}
        </StatusBadge>
      </div>

      <div className="mt-5 space-y-3">
        {actions.length ? (
          actions.map((item) => (
            <div key={item.key} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {item.sensorLabel}: {item.statusLabel}
                </p>
                <p className="mt-1 text-sm text-slate-500">{item.advice}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <p className="text-sm font-medium text-emerald-800">
              All monitored values are inside target ranges.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
