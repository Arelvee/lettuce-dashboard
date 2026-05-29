import { CircuitBoard, GraduationCap, Leaf } from "lucide-react";

export default function ThesisLogo({ size = "md", inverse = false }) {
  const sizeClass = size === "lg" ? "h-14 w-14" : "h-11 w-11";
  const iconClass = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const circuitClass = size === "lg" ? "h-10 w-10" : "h-8 w-8";
  const capClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const palette = inverse
    ? "bg-white/10 text-white ring-white/20"
    : "bg-slate-950 text-white ring-emerald-500/15 dark:bg-white dark:text-slate-950 dark:ring-white/20";

  return (
    <div
      className={`logo-mark relative flex shrink-0 items-center justify-center rounded-lg shadow-sm shadow-emerald-900/20 ring-1 ${sizeClass} ${palette}`}
      aria-label="Lettuce Predict logo"
    >
      <CircuitBoard className={`logo-circuit absolute text-emerald-300/40 dark:text-emerald-700/35 ${circuitClass}`} aria-hidden="true" />
      <Leaf className={`logo-leaf relative text-emerald-300 dark:text-emerald-700 ${iconClass}`} aria-hidden="true" />
      <GraduationCap className={`logo-cap absolute -right-1 -top-1 rounded-full bg-emerald-500 p-0.5 text-white ${capClass}`} aria-hidden="true" />
    </div>
  );
}
