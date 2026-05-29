import { formatNumber } from "../../utils/format";

export default function MetricCard({ icon: Icon, label, value, unit, detail, tone = "emerald", onClick }) {
  const toneMap = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
      accent: "bg-emerald-500",
    },
    sky: {
      icon: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
      accent: "bg-sky-500",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
      accent: "bg-amber-500",
    },
    rose: {
      icon: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
      accent: "bg-rose-500",
    },
    slate: {
      icon: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
      accent: "bg-slate-400",
    },
  };
  const toneClasses = toneMap[tone] || toneMap.emerald;
  const Component = onClick ? "button" : "article";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`surface relative flex min-h-[136px] w-full overflow-hidden p-4 text-left ${
        onClick ? "focus-ring cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg" : ""
      }`}
    >
      <div className={`absolute left-0 top-4 h-10 w-1 rounded-r-full ${toneClasses.accent}`} />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 pl-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="break-words text-2xl font-bold leading-tight text-slate-950 dark:text-white">
                {typeof value === "number" ? formatNumber(value, value >= 100 ? 0 : 1) : value || "--"}
              </span>
              {unit ? <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{unit}</span> : null}
            </div>
          </div>
          {Icon ? (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses.icon}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          ) : null}
        </div>
        {detail ? <p className="max-h-10 overflow-hidden text-sm leading-5 text-slate-500 dark:text-slate-400">{detail}</p> : null}
      </div>
    </Component>
  );
}
