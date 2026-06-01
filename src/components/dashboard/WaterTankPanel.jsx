import { Activity, Droplets, Gauge, Power, ThermometerSun, Zap } from "lucide-react";
import { formatDateTime, formatNumber } from "../../utils/format";
import { getSensorStatus, SENSOR_META } from "../../utils/health";
import StatusBadge from "../common/StatusBadge";

const waterSensors = [
  { key: "wtemp", icon: ThermometerSun, position: { left: "22%", top: "33%" } },
  { key: "ph", icon: Activity, position: { left: "74%", top: "35%" } },
  { key: "tds", icon: Gauge, position: { left: "27%", top: "69%" } },
  { key: "ec", icon: Zap, position: { left: "72%", top: "69%" } },
];

const toneClasses = {
  emerald: {
    card: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-300/20 dark:bg-emerald-400/10",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-300/15 dark:text-emerald-200",
    marker: "bg-emerald-400 shadow-emerald-500/40",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/80 dark:border-amber-300/20 dark:bg-amber-400/10",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-300/15 dark:text-amber-200",
    marker: "bg-amber-400 shadow-amber-500/40",
  },
  rose: {
    card: "border-rose-200 bg-rose-50/80 dark:border-rose-300/20 dark:bg-rose-400/10",
    icon: "bg-rose-100 text-rose-700 dark:bg-rose-300/15 dark:text-rose-200",
    marker: "bg-rose-400 shadow-rose-500/40",
  },
  slate: {
    card: "border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/5",
    icon: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    marker: "bg-slate-400 shadow-slate-500/30",
  },
};

function getWaterScore(reading) {
  if (!reading) return null;
  const scores = waterSensors.map(({ key }) => getSensorStatus(key, reading[key]).score);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function WaterReadingCard({ sensorKey, value }) {
  const meta = SENSOR_META[sensorKey];
  const status = getSensorStatus(sensorKey, value);
  const hasReading = value !== null && value !== undefined && !Number.isNaN(Number(value));
  const classes = toneClasses[status.tone] || toneClasses.slate;
  const SensorIcon = waterSensors.find((sensor) => sensor.key === sensorKey)?.icon || Droplets;

  return (
    <article className={`rounded-lg border p-3 ${classes.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${classes.icon}`}>
            <SensorIcon className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-950 dark:text-white">{meta.label}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-300">
              {formatNumber(meta.min, meta.precision)}-{formatNumber(meta.max, meta.precision)} {meta.unit}
            </p>
          </div>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <span className="text-2xl font-black text-slate-950 dark:text-white">
            {hasReading ? formatNumber(value, meta.precision) : "--"}
          </span>
          <span className="ml-1 text-xs font-bold text-slate-500 dark:text-slate-300">{meta.unit}</span>
        </div>
        <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:text-slate-100 dark:ring-white/10">
          {hasReading ? `${Math.round(status.score)}% fit` : "No data"}
        </span>
      </div>
    </article>
  );
}

export default function WaterTankPanel({ latestReading, pumpEvent, connectionStatus = "online" }) {
  const pumpOn = Boolean(pumpEvent?.pump_on ?? latestReading?.pump_on);
  const reservoirScore = getWaterScore(latestReading);
  const reservoirTone = reservoirScore === null ? "slate" : reservoirScore >= 85 ? "emerald" : reservoirScore >= 65 ? "amber" : "rose";
  const timestamp = latestReading?.timestamp || pumpEvent?.timestamp;

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">Water Tank</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Nutrient reservoir readings</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={pumpOn ? "sky" : "slate"}>Pump {pumpOn ? "On" : "Off"}</StatusBadge>
          <StatusBadge tone={reservoirTone}>
            {reservoirScore === null ? "No reservoir sample" : `${reservoirScore}% reservoir fit`}
          </StatusBadge>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
        <div className="panel-muted relative min-h-[320px] overflow-hidden p-4">
          <div className="absolute inset-x-4 top-4 z-20 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-300">Reservoir sensor layout</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">
              {timestamp ? formatDateTime(timestamp) : "Waiting for sample"}
            </p>
          </div>

          <div className="relative mx-auto mt-9 aspect-[4/3] w-full max-w-[27rem]">
            <div className="absolute left-[12%] right-[12%] top-[15%] bottom-[10%] overflow-hidden rounded-b-[2rem] rounded-t-xl border-2 border-cyan-200/90 bg-white/55 shadow-inner dark:border-cyan-200/20 dark:bg-slate-950/30">
              <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-cyan-500/70 via-teal-400/55 to-emerald-300/35 dark:from-cyan-500/55 dark:via-teal-400/35 dark:to-emerald-300/20" />
              <div className="tank-water-surface absolute left-[-8%] right-[-8%] top-[30%] h-8 rounded-[50%] bg-white/35 blur-[1px] dark:bg-cyan-100/15" />
              <div className="absolute left-[8%] right-[8%] top-[27%] h-px bg-cyan-700/25 dark:bg-cyan-100/20" />
            </div>

            <div className="absolute left-[16%] right-[16%] top-[12%] h-4 rounded-full border border-cyan-200 bg-white/70 dark:border-cyan-200/15 dark:bg-white/10" />
            <div className={`absolute right-[1%] top-[31%] h-4 w-[18%] rounded-full bg-slate-300 dark:bg-slate-600 ${pumpOn ? "tank-flow-on" : ""}`} />
            <div className={`absolute right-[-1%] top-[25%] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-lg dark:border-slate-900 ${pumpOn ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200"}`}>
              <Power className="h-5 w-5" aria-hidden="true" />
            </div>

            {waterSensors.map(({ key, icon: SensorIcon, position }) => {
              const status = getSensorStatus(key, latestReading?.[key]);
              const classes = toneClasses[status.tone] || toneClasses.slate;
              return (
                <div
                  key={key}
                  className="absolute z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
                  style={position}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-lg ${classes.icon}`}
                  >
                    <SensorIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="hidden rounded-lg border border-white/70 bg-white/85 px-2 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur sm:inline-flex dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100">
                    {SENSOR_META[key].label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {waterSensors.map(({ key }) => {
              const status = getSensorStatus(key, latestReading?.[key]);
              const classes = toneClasses[status.tone] || toneClasses.slate;
              return (
                <div key={key} className="flex items-center gap-2 rounded-lg bg-white/70 px-2 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
                  <span className={`h-2.5 w-2.5 rounded-full shadow-md ${classes.marker}`} />
                  {SENSOR_META[key].label}: {status.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {waterSensors.map(({ key }) => (
            <WaterReadingCard key={key} sensorKey={key} value={latestReading?.[key]} />
          ))}

          <div className="rounded-lg border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white">Pump Schedule</p>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300">
                  {pumpEvent?.schedule || "06:00-18:00 Asia/Manila"}
                </p>
              </div>
              <StatusBadge tone={connectionStatus === "offline" ? "rose" : pumpOn ? "sky" : "slate"}>
                {pumpOn ? "Running" : "Idle"}
              </StatusBadge>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-300">
              {pumpEvent?.timestamp ? `Last pump event: ${formatDateTime(pumpEvent.timestamp)}` : "No pump event logged yet."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
