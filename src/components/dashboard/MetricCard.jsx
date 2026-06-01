import { formatNumber } from "../../utils/format";

export default function MetricCard({ icon: Icon, label, value, unit, detail, tone = "emerald", onClick }) {
  const toneMap = {
    emerald: {
      icon: "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 text-white ring-1 ring-emerald-200/70 shadow-lg shadow-emerald-900/20 dark:from-emerald-300 dark:via-emerald-500 dark:to-teal-700 dark:!text-white dark:ring-emerald-200/25",
      accent: "bg-gradient-to-b from-emerald-400 to-teal-600",
    },
    sky: {
      icon: "bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-700 text-white ring-1 ring-sky-200/70 shadow-lg shadow-sky-900/20 dark:from-sky-300 dark:via-cyan-500 dark:to-teal-700 dark:!text-white dark:ring-sky-200/25",
      accent: "bg-gradient-to-b from-sky-400 to-cyan-600",
    },
    amber: {
      icon: "bg-gradient-to-br from-amber-300 via-orange-400 to-amber-700 text-white ring-1 ring-amber-200/80 shadow-lg shadow-amber-900/20 dark:from-amber-200 dark:via-orange-400 dark:to-amber-700 dark:!text-white dark:ring-amber-200/25",
      accent: "bg-gradient-to-b from-amber-300 to-orange-500",
    },
    rose: {
      icon: "bg-gradient-to-br from-rose-400 via-red-500 to-orange-700 text-white ring-1 ring-rose-200/70 shadow-lg shadow-rose-900/20 dark:from-rose-300 dark:via-red-500 dark:to-orange-700 dark:!text-white dark:ring-rose-200/25",
      accent: "bg-gradient-to-b from-rose-400 to-red-600",
    },
    slate: {
      icon: "bg-gradient-to-br from-slate-500 via-slate-700 to-slate-950 text-white ring-1 ring-slate-200/70 shadow-lg shadow-slate-900/20 dark:from-slate-200 dark:via-slate-500 dark:to-slate-800 dark:!text-white dark:ring-white/20",
      accent: "bg-gradient-to-b from-slate-400 to-slate-600",
    },
  };
  const toneClasses = toneMap[tone] || toneMap.emerald;
  const Component = onClick ? "button" : "article";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`surface relative flex h-full min-h-[148px] w-full overflow-hidden p-4 text-left ${
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
            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg ${toneClasses.icon}`}>
              <span className="pointer-events-none absolute inset-1 rounded-md bg-white/20" aria-hidden="true" />
              <Icon className="relative z-10 h-6 w-6 stroke-[2.6]" aria-hidden="true" />
            </div>
          ) : null}
        </div>
        {detail ? <p className="max-h-10 overflow-hidden text-sm leading-5 text-slate-600 dark:text-slate-300/85">{detail}</p> : null}
      </div>
    </Component>
  );
}
