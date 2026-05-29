import {
  Activity,
  Bell,
  Cloud,
  Cpu,
  LineChart,
  Lock,
  RadioTower,
  Smartphone,
  Wifi,
  Zap,
} from "lucide-react";
import ThesisLogo from "../components/common/ThesisLogo";

const appFeatures = [
  { icon: Bell, label: "Live alerts", detail: "Sensor drift, ESP32 downtime, and pump checks surface as priority notices." },
  { icon: LineChart, label: "Pocket analytics", detail: "Stage confidence, 6-slot yield count, and sensor history stay readable on small screens." },
  { icon: Cloud, label: "Cloud sync", detail: "The app reads the same Supabase-backed data used by the web dashboard." },
  { icon: Lock, label: "Secure access", detail: "Email-verified researcher accounts keep farm records tied to one profile." },
];

const sensorRows = [
  { label: "Light", value: "High", width: "w-[82%]", color: "bg-amber-300" },
  { label: "pH", value: "Optimal", width: "w-[68%]", color: "bg-emerald-400" },
  { label: "EC", value: "Stable", width: "w-[74%]", color: "bg-sky-400" },
];

const telemetryCards = [
  { label: "ESP32", value: "Live", icon: RadioTower, tone: "text-emerald-300" },
  { label: "Window", value: "10 rows", icon: Cpu, tone: "text-sky-300" },
  { label: "Action", value: "1 task", icon: Zap, tone: "text-amber-200" },
];

export default function MobileAppPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-white shadow-soft dark:border-white/10">
        <div className="relative grid min-h-[640px] gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.72fr)] lg:items-center">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:30px_30px]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-400/18 to-transparent" />
          <div className="absolute bottom-0 right-0 h-40 w-2/3 bg-gradient-to-l from-sky-400/14 to-transparent" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <ThesisLogo inverse size="lg" loading />
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold backdrop-blur">
                <Smartphone className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                Mobile App Preview
              </div>
            </div>

            <div className="mt-12 max-w-2xl">
              <p className="section-title text-emerald-200">Companion Workspace</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                Farm checks built for the phone in your hand.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                A focused mobile view for sensor health, lettuce stage prediction, yield count,
                and the next adjustment to make during field checks.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {telemetryCards.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <item.icon className={`h-5 w-5 ${item.tone}`} aria-hidden="true" />
                  <p className="mt-3 text-xs font-semibold uppercase text-slate-400">{item.label}</p>
                  <p className="mt-1 text-xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="phone-float relative z-10 mx-auto w-full max-w-[320px] rounded-[2rem] border border-white/20 bg-slate-900 p-3 shadow-2xl shadow-emerald-950/50">
            <div className="rounded-[1.55rem] border border-white/10 bg-slate-950 p-4">
              <div className="mx-auto h-1.5 w-16 rounded-full bg-white/20" />
              <div className="mt-5 flex items-center justify-between">
                <ThesisLogo inverse decorative />
                <div className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-200">
                  <Wifi className="h-4 w-4" aria-hidden="true" />
                  Live
                </div>
              </div>

              <div className="relative mt-6 overflow-hidden rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
                <div className="scan-line absolute left-0 right-0 top-2 h-0.5 bg-emerald-300/70" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-emerald-200">Growth Stage</p>
                    <p className="mt-2 text-2xl font-bold">Seed Sowing</p>
                  </div>
                  <Activity className="h-5 w-5 text-emerald-200" aria-hidden="true" />
                </div>
                <p className="mt-1 text-sm text-slate-300">0.9 days / 71.6% confidence</p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-slate-400">Yield</p>
                  <p className="mt-1 text-xl font-bold">3/6</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-slate-400">Health</p>
                  <p className="mt-1 text-xl font-bold text-emerald-300">86%</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {sensorRows.map((sensor) => (
                  <div key={sensor.label} className="rounded-lg bg-white/10 p-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>{sensor.label}</span>
                      <span>{sensor.value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${sensor.width} ${sensor.color}`} />
                    </div>
                  </div>
                ))}
                <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3">
                  <p className="text-xs font-bold text-amber-100">Adjustment</p>
                  <p className="mt-1 text-xs leading-5 text-amber-50/90">Raise fixture height before the next reading window.</p>
                </div>
              </div>
            </div>
            <span className="signal-wave absolute -right-4 top-20 h-12 w-12 rounded-full border border-emerald-300/50" />
            <span className="signal-wave absolute -right-4 top-20 h-12 w-12 rounded-full border border-sky-300/40 [animation-delay:0.7s]" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
