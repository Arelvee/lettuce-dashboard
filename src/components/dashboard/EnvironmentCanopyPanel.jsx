import { Activity, Droplets, Gauge, Sun, ThermometerSun, Waves } from "lucide-react";
import { formatDateTime, formatNumber } from "../../utils/format";
import { getSensorStatus, SENSOR_META } from "../../utils/health";
import { getWaterQualityPalette } from "../../utils/waterQuality";
import StatusBadge from "../common/StatusBadge";

const canopySensors = [
  { key: "humidity", group: "Air climate", icon: Droplets },
  { key: "atemp", group: "Air climate", icon: ThermometerSun },
  { key: "light", group: "Light delivery", icon: Sun },
  { key: "ppfd", group: "Light delivery", icon: Gauge },
  { key: "r445", group: "Spectral response", icon: Waves },
  { key: "r480", group: "Spectral response", icon: Activity },
];

const sensorNodes = {
  humidity: { label: "Humidity", badge: [98, 145], width: 112 },
  atemp: { label: "Air Temp", badge: [464, 145], width: 102 },
  light: { label: "Light", badge: [96, 300], width: 80 },
  ppfd: { label: "PPFD", badge: [484, 300], width: 84 },
  r445: { label: "R445", badge: [106, 432], width: 80 },
  r480: { label: "R480", badge: [478, 432], width: 84 },
};

const toneClasses = {
  emerald: {
    card: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-300/20 dark:bg-emerald-400/10",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-300/15 dark:text-emerald-200",
    marker: "bg-emerald-400 shadow-emerald-500/50",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/80 dark:border-amber-300/20 dark:bg-amber-400/10",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-300/15 dark:text-amber-200",
    marker: "bg-amber-400 shadow-amber-500/45",
  },
  rose: {
    card: "border-rose-200 bg-rose-50/80 dark:border-rose-300/20 dark:bg-rose-400/10",
    icon: "bg-rose-100 text-rose-700 dark:bg-rose-300/15 dark:text-rose-200",
    marker: "bg-rose-400 shadow-rose-500/45",
  },
  sky: {
    card: "border-sky-200 bg-sky-50/80 dark:border-sky-300/20 dark:bg-sky-400/10",
    icon: "bg-sky-100 text-sky-700 dark:bg-sky-300/15 dark:text-sky-200",
    marker: "bg-sky-400 shadow-sky-500/45",
  },
  slate: {
    card: "border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/5",
    icon: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    marker: "bg-slate-400 shadow-slate-500/30",
  },
};

const svgToneColors = {
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#ef4444",
  sky: "#0ea5e9",
  slate: "#64748b",
};

const svgToneSoft = {
  emerald: "rgba(187, 247, 208, 0.92)",
  amber: "rgba(254, 243, 199, 0.95)",
  rose: "rgba(254, 226, 226, 0.95)",
  sky: "rgba(186, 230, 253, 0.92)",
  slate: "rgba(226, 232, 240, 0.92)",
};

function getDisplayStatus(sensorKey, value, connectionStatus) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return { ...getSensorStatus(sensorKey, value), label: "No reading", tone: "slate" };
  }
  if (connectionStatus === "offline" || connectionStatus === "stale") {
    return {
      ...getSensorStatus(sensorKey, value),
      label: connectionStatus === "stale" ? "Stale" : "Offline",
      tone: connectionStatus === "stale" ? "amber" : "rose",
    };
  }
  return getSensorStatus(sensorKey, value);
}

function getCanopyScore(reading, sensorKeys) {
  if (!reading) return null;
  const scores = sensorKeys.map((key) => getSensorStatus(key, reading[key]).score);
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function PipeCup({ x, y, side = "right" }) {
  const sign = side === "right" ? 1 : -1;
  const cupX = sign * 68;
  const cupY = 40;
  const cupTilt = side === "right" ? -22 : 22;
  const branchPath = `M ${sign * 28} 10 C ${sign * 41} 15 ${sign * 48} 29 ${sign * 58} 39`;

  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d={branchPath}
        fill="none"
        stroke="var(--schematic-pipe-fill)"
        strokeLinecap="round"
        strokeWidth="23"
      />
      <path
        d={branchPath}
        fill="none"
        stroke="var(--schematic-line)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d={`M ${sign * 29} -2 C ${sign * 37} 1 ${sign * 40} 9 ${sign * 36} 17`}
        fill="none"
        stroke="var(--schematic-line)"
        strokeLinecap="round"
        strokeWidth="1.7"
        opacity="0.5"
      />
      <g transform={`translate(${cupX} ${cupY}) rotate(${cupTilt})`}>
        <path
          d="M -24 -12 L 24 -12 L 18 36 C 8 45 -8 45 -18 36 Z"
          fill="var(--schematic-fill)"
          stroke="var(--schematic-line)"
          strokeWidth="2"
        />
        <ellipse cx="0" cy="-12" rx="25" ry="11" fill="var(--schematic-bg)" stroke="var(--schematic-line)" strokeWidth="2" />
        <ellipse cx="0" cy="-12" rx="16" ry="6.5" fill="var(--schematic-fill-muted)" stroke="var(--schematic-line)" strokeWidth="1" opacity="0.62" />
        <path
          d="M -13 6 C -7 12 -3 20 0 30 C 3 20 7 12 13 6"
          fill="none"
          stroke="var(--schematic-line)"
          strokeLinecap="round"
          strokeWidth="1.5"
          opacity="0.45"
        />
        <path
          className="schematic-leaf-mark"
          d="M -14 -22 C -36 -42 -8 -55 0 -30 C 8 -55 36 -42 14 -22 C 23 -35 40 -23 20 -12 C 5 -4 -5 -4 -20 -12 C -40 -23 -23 -35 -14 -22 Z"
          fill="var(--schematic-leaf)"
          stroke="var(--schematic-line)"
          strokeWidth="1.4"
        />
      </g>
    </g>
  );
}

function SensorMiniGlyph({ sensorKey, x, y, color }) {
  const common = {
    fill: "none",
    stroke: color,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2.5,
  };

  if (sensorKey === "humidity") {
    return <path {...common} d={`M ${x} ${y - 9} C ${x - 8} ${y} ${x - 7} ${y + 8} ${x} ${y + 8} C ${x + 7} ${y + 8} ${x + 8} ${y} ${x} ${y - 9} Z`} />;
  }
  if (sensorKey === "atemp") {
    return (
      <g {...common}>
        <path d={`M ${x} ${y - 10} L ${x} ${y + 2}`} />
        <circle cx={x} cy={y + 6} r="5" />
        <path d={`M ${x - 6} ${y - 8} L ${x + 6} ${y - 8}`} />
      </g>
    );
  }
  if (sensorKey === "light") {
    return (
      <g {...common}>
        <circle cx={x} cy={y} r="5" />
        <path d={`M ${x} ${y - 12} L ${x} ${y - 9} M ${x} ${y + 9} L ${x} ${y + 12} M ${x - 12} ${y} L ${x - 9} ${y} M ${x + 9} ${y} L ${x + 12} ${y} M ${x - 8.5} ${y - 8.5} L ${x - 6.5} ${y - 6.5} M ${x + 6.5} ${y + 6.5} L ${x + 8.5} ${y + 8.5} M ${x + 8.5} ${y - 8.5} L ${x + 6.5} ${y - 6.5} M ${x - 6.5} ${y + 6.5} L ${x - 8.5} ${y + 8.5}`} />
      </g>
    );
  }
  if (sensorKey === "ppfd") {
    return (
      <g {...common}>
        <path d={`M ${x - 9} ${y + 5} A 10 10 0 0 1 ${x + 9} ${y + 5}`} />
        <path d={`M ${x} ${y + 4} L ${x + 6} ${y - 4}`} />
        <circle cx={x} cy={y + 5} r="1.5" fill={color} stroke="none" />
      </g>
    );
  }
  if (sensorKey === "r445") {
    return <path {...common} d={`M ${x - 11} ${y + 2} C ${x - 7} ${y - 6} ${x - 3} ${y + 10} ${x + 1} ${y + 2} C ${x + 5} ${y - 6} ${x + 8} ${y + 8} ${x + 11} ${y}`} />;
  }
  return <path {...common} d={`M ${x - 10} ${y + 3} L ${x - 4} ${y + 3} L ${x} ${y - 8} L ${x + 4} ${y + 8} L ${x + 10} ${y - 1}`} />;
}

function BlueprintTowerDiagram({ orderedSensors, latestReading, connectionStatus }) {
  const waterQuality = getWaterQualityPalette(latestReading);
  const jumpToWaterTank = () => {
    document.getElementById("water-tank-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleReservoirKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      jumpToWaterTank();
    }
  };

  return (
    <div className="flex w-full justify-center overflow-hidden">
      <svg
        className="h-auto w-full max-w-[50rem] text-slate-700 dark:text-slate-200"
        viewBox="70 18 570 628"
        role="img"
        aria-label="Technical schematic of the lettuce vertical tower with reservoir, grow pipes, cup holders, pump, and sensor callouts"
        style={waterQuality.cssVars}
      >
        <defs>
          <pattern id="schematicGrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="var(--schematic-grid)" strokeWidth="1" />
          </pattern>
          <linearGradient id="reservoirFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--schematic-reservoir-top)" />
            <stop offset="100%" stopColor="var(--schematic-reservoir-bottom)" />
          </linearGradient>
          <linearGradient id="pipeFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--schematic-pipe-top)" />
            <stop offset="100%" stopColor="var(--schematic-pipe-fill)" />
          </linearGradient>
          <linearGradient id="towerWaterGradient" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor="var(--tank-water-from)" />
            <stop offset="55%" stopColor="var(--tank-water-via)" />
            <stop offset="100%" stopColor="var(--tank-water-to)" />
          </linearGradient>
          <clipPath id="towerReservoirClip">
            <rect x="210" y="532" width="360" height="88" />
          </clipPath>
          <filter id="softSchematicShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="var(--schematic-shadow)" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect x="0" y="0" width="620" height="660" rx="18" fill="var(--schematic-bg)" />
        <rect x="0" y="0" width="620" height="660" rx="18" fill="url(#schematicGrid)" opacity="0.42" />

        <g className="schematic-support-frame" stroke="var(--schematic-support-line)" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 206 88 L 508 88" />
          <path d="M 206 370 L 508 370" />
          <path d="M 206 494 L 508 494" />
          {[206, 508].map((x) => (
            <circle key={`rail-${x}`} cx={x} cy="370" r="3.5" fill="var(--schematic-fill)" />
          ))}
        </g>

        <g filter="url(#softSchematicShadow)">
          <line x1="276" y1="76" x2="458" y2="76" stroke="url(#pipeFill)" strokeWidth="17" strokeLinecap="round" />
          <line x1="276" y1="76" x2="458" y2="76" stroke="var(--schematic-line)" strokeWidth="2" strokeLinecap="round" />
          <line x1="350" y1="32" x2="350" y2="486" stroke="url(#pipeFill)" strokeWidth="16" strokeLinecap="round" />
          <line x1="350" y1="32" x2="350" y2="486" stroke="var(--schematic-line)" strokeWidth="2.1" strokeLinecap="round" />
          {[276, 458].map((pipeX) => (
            <g key={`top-feed-${pipeX}`}>
              <path
                d={`M ${pipeX} 76 L ${pipeX} 112`}
                fill="none"
                stroke="url(#pipeFill)"
                strokeLinecap="round"
                strokeWidth="13"
              />
              <path
                d={`M ${pipeX} 76 L ${pipeX} 112`}
                fill="none"
                stroke="var(--schematic-line)"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <rect x={pipeX - 14} y="63" width="28" height="25" rx="6" fill="var(--schematic-fill)" stroke="var(--schematic-line)" strokeWidth="2" />
            </g>
          ))}
          <rect x="332" y="55" width="36" height="38" rx="7" fill="var(--schematic-fill-muted)" stroke="var(--schematic-line)" strokeWidth="2.2" />
          <rect x="338" y="63" width="24" height="22" rx="5" fill="var(--schematic-fill)" stroke="var(--schematic-line)" strokeWidth="1.6" />
          <path className="schematic-flow-line" d="M 350 76 L 276 76 L 276 111" />
          <path className="schematic-flow-line schematic-flow-delay" d="M 350 76 L 458 76 L 458 111" />
          <path className="schematic-flow-line schematic-flow-delay-long" d="M 350 38 L 350 486" />
        </g>

        <g>
          <rect x="245" y="110" width="62" height="350" rx="29" fill="url(#pipeFill)" stroke="var(--schematic-line)" strokeWidth="2.4" filter="url(#softSchematicShadow)" />
          <ellipse cx="276" cy="110" rx="31" ry="10" fill="var(--schematic-fill)" stroke="var(--schematic-line)" strokeWidth="2" />
          <rect x="427" y="110" width="62" height="350" rx="29" fill="url(#pipeFill)" stroke="var(--schematic-line)" strokeWidth="2.4" filter="url(#softSchematicShadow)" />
          <ellipse cx="458" cy="110" rx="31" ry="10" fill="var(--schematic-fill)" stroke="var(--schematic-line)" strokeWidth="2" />
          {[190, 307, 424].map((bandY) => (
            <g key={`grow-band-${bandY}`}>
              <rect x="242" y={bandY} width="68" height="22" rx="5" fill="var(--schematic-fill-muted)" stroke="var(--schematic-line)" strokeWidth="1.8" />
              <rect x="424" y={bandY} width="68" height="22" rx="5" fill="var(--schematic-fill-muted)" stroke="var(--schematic-line)" strokeWidth="1.8" />
            </g>
          ))}
          <path className="schematic-flow-line schematic-flow-delay-long" d="M 276 118 L 276 456" />
          <path className="schematic-flow-line" d="M 458 118 L 458 456" />

          <PipeCup x={276} y={155} side="right" />
          <PipeCup x={276} y={272} side="right" />
          <PipeCup x={276} y={389} side="right" />
          <PipeCup x={458} y={155} side="left" />
          <PipeCup x={458} y={272} side="left" />
          <PipeCup x={458} y={389} side="left" />

          <path d="M 252 460 C 238 490 246 512 270 516" fill="none" stroke="url(#pipeFill)" strokeLinecap="round" strokeWidth="28" />
          <path d="M 252 460 C 238 490 246 512 270 516" fill="none" stroke="var(--schematic-line)" strokeLinecap="round" strokeWidth="2" />
          <path d="M 482 460 C 496 490 488 512 464 516" fill="none" stroke="url(#pipeFill)" strokeLinecap="round" strokeWidth="28" />
          <path d="M 482 460 C 496 490 488 512 464 516" fill="none" stroke="var(--schematic-line)" strokeLinecap="round" strokeWidth="2" />
        </g>

        <g
          className="schematic-reservoir-link"
          role="button"
          tabIndex={0}
          aria-label="Open water tank readings"
          filter="url(#softSchematicShadow)"
          onClick={jumpToWaterTank}
          onKeyDown={handleReservoirKeyDown}
        >
          <path className="schematic-reservoir-outline" d="M 170 494 L 530 494 L 570 532 L 210 532 Z" fill="var(--schematic-fill-muted)" stroke="var(--schematic-line)" strokeWidth="2" />
          <rect x="210" y="532" width="360" height="88" fill="var(--schematic-fill)" stroke="var(--schematic-line)" strokeWidth="2" />
          <g clipPath="url(#towerReservoirClip)">
            <rect className="schematic-water-fill" x="210" y="554" width="360" height="66" fill="url(#towerWaterGradient)" />
            <path className="schematic-water-wave" d="M 204 554 C 248 542 292 566 336 554 S 424 542 468 554 S 548 566 584 554" />
          </g>
          <rect className="schematic-reservoir-outline" x="210" y="532" width="360" height="88" fill="none" stroke="var(--schematic-line)" strokeWidth="2" />
          <path className="schematic-reservoir-outline" d="M 170 494 L 210 532 L 210 620 L 170 582 Z" fill="var(--schematic-fill-muted)" stroke="var(--schematic-line)" strokeWidth="2" />
          <path d="M 350 572 L 350 460" fill="none" stroke="var(--schematic-pipe-fill)" strokeLinecap="round" strokeWidth="12" />
          <path d="M 350 572 L 350 460" fill="none" stroke="var(--schematic-line)" strokeLinecap="round" strokeWidth="1.9" />
          <rect className="schematic-pump" x="335" y="570" width="30" height="42" rx="7" fill="var(--schematic-fill-muted)" stroke="var(--schematic-line)" strokeWidth="2" />
          <rect x="341" y="577" width="18" height="18" rx="3" fill="var(--schematic-bg)" stroke="var(--schematic-line)" strokeWidth="1.5" />
          <path d="M 350 570 L 350 552" fill="none" stroke="var(--schematic-line)" strokeWidth="1.4" strokeDasharray="4 4" opacity="0.75" />
        </g>

        <g>
          {orderedSensors.map(({ key }) => {
            const sensor = sensorNodes[key];
            const status = getDisplayStatus(key, latestReading?.[key], connectionStatus);
            const color = svgToneColors[status.tone] || svgToneColors.slate;
            if (!sensor) return null;
            const [badgeX, badgeY] = sensor.badge;
            const orbCenterX = badgeX + 25;
            const orbCenterY = badgeY + 25;

            return (
              <g
                key={key}
                className="schematic-sensor-badge"
                style={{
                  "--badge-tone": color,
                  "--badge-soft": svgToneSoft[status.tone] || svgToneSoft.slate,
                }}
              >
                <circle className="schematic-badge-orb" cx={orbCenterX} cy={orbCenterY} r="24" />
                <g transform={`translate(${orbCenterX} ${orbCenterY}) scale(1.16) translate(${-orbCenterX} ${-orbCenterY})`}>
                  <SensorMiniGlyph sensorKey={key} x={orbCenterX} y={orbCenterY} color={color} />
                </g>
                <rect
                  className="schematic-badge-pill"
                  x={badgeX + 60}
                  y={badgeY + 8}
                  width={sensor.width}
                  height="34"
                  rx="13"
                />
                <text
                  x={badgeX + 60 + sensor.width / 2}
                  y={badgeY + 30.5}
                  className="schematic-badge-text"
                  textAnchor="middle"
                >
                  {sensor.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function CanopyReadingCard({ sensorKey, value, connectionStatus }) {
  const meta = SENSOR_META[sensorKey];
  const sensor = canopySensors.find((item) => item.key === sensorKey);
  const SensorIcon = sensor?.icon || Activity;
  const status = getDisplayStatus(sensorKey, value, connectionStatus);
  const hasReading = value !== null && value !== undefined && !Number.isNaN(Number(value));
  const classes = toneClasses[status.tone] || toneClasses.slate;
  const heatPosition = hasReading ? getSensorStatus(sensorKey, value).position : 0;

  return (
    <article className={`rounded-lg border p-3 ${classes.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${classes.icon}`}>
            <SensorIcon className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-5 text-slate-950 dark:text-slate-50">{meta.label}</p>
            <p className="mt-0.5 text-xs font-medium leading-4 text-slate-500 dark:text-slate-300">{sensor?.group}</p>
          </div>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="text-2xl font-bold tracking-normal text-slate-950 dark:text-slate-50">
            {hasReading ? formatNumber(value, meta.precision) : "--"}
          </span>
          <span className="ml-1 text-xs font-semibold text-slate-500 dark:text-slate-300">{meta.unit}</span>
        </div>
        <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950/60 dark:text-slate-100 dark:ring-white/10">
          {hasReading ? `${Math.round(getSensorStatus(sensorKey, value).score)}% fit` : "No data"}
        </span>
      </div>

      <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="relative h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #ef4444 0%, #f97316 18%, #facc15 32%, #22c55e 44%, #10b981 58%, #facc15 70%, #f97316 84%, #ef4444 100%)",
          }}
        >
          <span
            className="absolute top-1/2 h-4 w-2 -translate-y-1/2 rounded-full border border-white bg-slate-950 shadow-md dark:bg-white"
            style={{ left: `calc(${heatPosition}% - 0.25rem)` }}
          />
        </div>
      </div>
    </article>
  );
}

function CanopyStatusChip({ sensorKey, value, connectionStatus }) {
  const meta = SENSOR_META[sensorKey];
  const status = getDisplayStatus(sensorKey, value, connectionStatus);
  const classes = toneClasses[status.tone] || toneClasses.slate;

  return (
    <div className={`flex min-h-[4rem] items-center gap-3 rounded-lg border px-3 py-2 ${classes.card}`}>
      <span className={`h-3 w-3 shrink-0 rounded-full shadow-lg ${classes.marker}`} />
      <p className="text-sm font-semibold leading-5 text-slate-700 dark:text-slate-100">
        {meta.label}:<br />
        <span className="font-semibold text-slate-500 dark:text-slate-300">{status.label}</span>
      </p>
    </div>
  );
}

export default function EnvironmentCanopyPanel({ latestReading, connectionStatus = "online", sensorKeys }) {
  const orderedSensors = canopySensors.filter(({ key }) => sensorKeys.includes(key));
  const orderedKeys = orderedSensors.map(({ key }) => key);
  const canopyScore = getCanopyScore(latestReading, orderedKeys);
  const canopyTone = canopyScore === null ? "slate" : canopyScore >= 85 ? "emerald" : canopyScore >= 65 ? "amber" : "rose";

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5 dark:border-white/10">
        <div>
          <p className="section-title">Sensor Monitoring</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Environment and canopy schematic</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={canopyTone}>
            {canopyScore === null ? "No canopy sample" : `${canopyScore}% canopy fit`}
          </StatusBadge>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
            {latestReading?.timestamp ? formatDateTime(latestReading.timestamp) : "Waiting for sample"}
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.82fr)]">
        <div className="panel-muted min-h-[520px] overflow-hidden p-3 sm:min-h-[590px] sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-300">Proposed vertical tower layout</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">PVC structure / live sensors</p>
          </div>
          <BlueprintTowerDiagram
            orderedSensors={orderedSensors}
            latestReading={latestReading}
            connectionStatus={connectionStatus}
          />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {orderedSensors.map(({ key }) => (
              <CanopyStatusChip
                key={key}
                sensorKey={key}
                value={latestReading?.[key]}
                connectionStatus={connectionStatus}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {orderedSensors.map(({ key }) => (
            <CanopyReadingCard
              key={key}
              sensorKey={key}
              value={latestReading?.[key]}
              connectionStatus={connectionStatus}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
