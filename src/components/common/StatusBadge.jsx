const tones = {
  emerald: "border-emerald-200/80 bg-emerald-50/90 text-emerald-800 shadow-sm shadow-emerald-900/5 dark:!border-emerald-300/25 dark:!bg-emerald-400/15 dark:!text-emerald-100",
  amber: "border-amber-200/90 bg-amber-50/95 text-amber-800 shadow-sm shadow-amber-900/5 dark:!border-amber-300/25 dark:!bg-amber-400/15 dark:!text-amber-100",
  rose: "border-rose-200/90 bg-rose-50/95 text-rose-800 shadow-sm shadow-rose-900/5 dark:!border-rose-300/25 dark:!bg-rose-400/15 dark:!text-rose-100",
  sky: "border-sky-200/90 bg-sky-50/95 text-sky-800 shadow-sm shadow-sky-900/5 dark:!border-sky-300/25 dark:!bg-sky-400/15 dark:!text-sky-100",
  slate: "border-slate-200/90 bg-white/80 text-slate-700 shadow-sm dark:!border-white/10 dark:!bg-white/10 dark:!text-slate-100",
};

export default function StatusBadge({ tone = "slate", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
