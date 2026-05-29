import { Bell, Cloud, LineChart, Lock, Smartphone, Wifi } from "lucide-react";
import ThesisLogo from "../components/common/ThesisLogo";

const appFeatures = [
  { icon: Bell, label: "Live alerts", detail: "Notify when ESP32 readings stop or sensors drift." },
  { icon: LineChart, label: "Pocket analytics", detail: "Track stage confidence and 6-slot yield count." },
  { icon: Cloud, label: "Cloud sync", detail: "Read Supabase data from the farm dashboard." },
  { icon: Lock, label: "Secure access", detail: "Researcher login with verified account flow." },
];

export default function MobileAppPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="surface overflow-hidden">
        <div className="relative min-h-[620px] overflow-hidden bg-slate-950 p-5 text-white sm:p-8">
          <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <ThesisLogo inverse size="lg" />
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold backdrop-blur">
              <Smartphone className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Mobile App
            </div>
          </div>

          <div className="relative z-10 mt-14 max-w-xl">
            <p className="section-title text-emerald-200">Coming Soon</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              Farm monitoring from your phone.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              The companion app will bring ESP32 status, lettuce stage prediction, yield count,
              and sensor alerts into a focused mobile view for field checks.
            </p>
          </div>

          <div className="phone-float relative z-10 mx-auto mt-12 w-[250px] rounded-[2rem] border border-white/20 bg-slate-900 p-3 shadow-2xl shadow-emerald-950/50 sm:w-[300px]">
            <div className="rounded-[1.55rem] border border-white/10 bg-slate-950 p-4">
              <div className="mx-auto h-1.5 w-16 rounded-full bg-white/20" />
              <div className="mt-5 flex items-center justify-between">
                <ThesisLogo inverse />
                <Wifi className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              </div>
              <div className="relative mt-6 overflow-hidden rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
                <div className="scan-line absolute left-0 right-0 top-2 h-0.5 bg-emerald-300/70" />
                <p className="text-xs font-semibold text-emerald-200">Growth Stage</p>
                <p className="mt-2 text-2xl font-bold">Harvesting</p>
                <p className="mt-1 text-sm text-slate-300">Class 4 / 91.4% confidence</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-slate-400">Yield</p>
                  <p className="mt-1 text-xl font-bold">5/6</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-slate-400">ESP32</p>
                  <p className="mt-1 text-xl font-bold text-emerald-300">Live</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full w-[78%] rounded-full bg-emerald-400" />
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full w-[54%] rounded-full bg-sky-400" />
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full w-[66%] rounded-full bg-amber-300" />
                </div>
              </div>
            </div>
            <span className="signal-wave absolute -right-5 top-16 h-12 w-12 rounded-full border border-emerald-300/50" />
            <span className="signal-wave absolute -right-5 top-16 h-12 w-12 rounded-full border border-sky-300/40 [animation-delay:0.7s]" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {appFeatures.map((feature) => (
          <article key={feature.label} className="surface p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">{feature.label}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
