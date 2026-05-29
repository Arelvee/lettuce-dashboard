import logoMark from "../../assets/lettuce-network-logo.svg";

const sizes = {
  xs: "h-8 w-8 p-0.5",
  sm: "h-9 w-9 p-0.5",
  md: "h-11 w-11 p-1",
  lg: "h-14 w-14 p-1.5",
  xl: "h-20 w-20 p-2",
  hero: "h-24 w-24 p-2 sm:h-28 sm:w-28 sm:p-3",
};

export default function ThesisLogo({
  size = "md",
  inverse = false,
  animated = true,
  loading = false,
  decorative = false,
  bare = false,
  className = "",
}) {
  const palette = bare
    ? "ring-transparent"
    : inverse
      ? "bg-white/10 ring-white/20"
      : "bg-white ring-emerald-500/20 dark:bg-slate-950/90 dark:ring-white/10";
  const sizeClass = sizes[size] || sizes.md;
  const frameClass = bare ? "logo-mark-bare rounded-none shadow-none ring-0" : "rounded-lg shadow-sm shadow-emerald-900/20 ring-1";

  return (
    <div
      className={`logo-mark relative isolate flex shrink-0 items-center justify-center overflow-hidden ${frameClass} ${sizeClass} ${palette} ${
        animated ? "logo-mark-animated" : ""
      } ${loading ? "logo-mark-loading" : ""} ${className}`}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : "Lettuce Predict logo"}
    >
      <span className="logo-glow" aria-hidden="true" />
      <span className="logo-orbit" aria-hidden="true" />
      <img src={logoMark} alt="" className="logo-image relative z-10 h-full w-full object-contain" draggable="false" />
      <span className="logo-spark" aria-hidden="true" />
    </div>
  );
}
