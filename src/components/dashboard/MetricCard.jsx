import { formatNumber } from "../../utils/format";

export default function MetricCard({ icon: Icon, label, value, unit, detail, tone = "emerald" }) {
  const toneMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <article className="surface min-h-[132px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-2xl font-bold text-slate-950">
              {typeof value === "number" ? formatNumber(value, value >= 100 ? 0 : 1) : value || "--"}
            </span>
            {unit ? <span className="text-sm font-semibold text-slate-500">{unit}</span> : null}
          </div>
        </div>
        {Icon ? (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneMap[tone]}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-4 text-sm text-slate-500">{detail}</p> : null}
    </article>
  );
}

