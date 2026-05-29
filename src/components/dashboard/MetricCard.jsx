import { formatNumber } from "../../utils/format";

export default function MetricCard({ icon: Icon, label, value, unit, detail, tone = "emerald", onClick }) {
  const toneMap = {
    emerald: {
      icon: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-300/12 dark:text-emerald-200 dark:ring-emerald-300/20",
      accent: "bg-gradient-to-b from-emerald-400 to-teal-600",
    },
    sky: {
      icon: "bg-sky-100 text-sky-800 ring-1 ring-sky-200 dark:bg-sky-300/12 dark:text-sky-200 dark:ring-sky-300/20",
      accent: "bg-gradient-to-b from-sky-400 to-cyan-600",
    },
    amber: {
      icon: "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-300/12 dark:text-amber-200 dark:ring-amber-300/20",
      accent: "bg-gradient-to-b from-amber-300 to-orange-500",
    },
    rose: {
      icon: "bg-rose-100 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-300/12 dark:text-rose-200 dark:ring-rose-300/20",
      accent: "bg-gradient-to-b from-rose-400 to-red-600",
    },
    slate: {
      icon: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-white/8 dark:text-slate-200 dark:ring-white/10",
      accent: "bg-gradient-to-b from-slate-400 to-slate-600",
    },
  };
  const toneClasses = toneMap[tone] || toneMap.emerald;
  const Component = onClick ? "button" : "article";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`surface relative flex min-h-[136px] w-full overflow-hidden p-4 text-left ${
        onClick ? "focus-ring cursor-pointer transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-950/10" : ""
      }`}
    >
      <div className={`absolute left-0 top-4 h-10 w-1 rounded-r-full ${toneClasses.accent}`} />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 pl-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
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
        {detail ? <p className="max-h-10 overflow-hidden text-sm leading-5 text-slate-600 dark:text-slate-300/85">{detail}</p> : null}
      </div>
    </Component>
  );
}
