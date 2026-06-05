import { getSensorStatus } from "./health";

const waterQualityPalettes = {
  balanced: {
    label: "Balanced",
    tone: "emerald",
    from: "rgba(14, 165, 233, 0.78)",
    via: "rgba(20, 184, 166, 0.66)",
    to: "rgba(110, 231, 183, 0.42)",
    surface: "rgba(236, 254, 255, 0.58)",
    accent: "#14b8a6",
  },
  low: {
    label: "Low nutrient/pH",
    tone: "amber",
    from: "rgba(245, 158, 11, 0.76)",
    via: "rgba(251, 191, 36, 0.6)",
    to: "rgba(254, 243, 199, 0.42)",
    surface: "rgba(255, 251, 235, 0.6)",
    accent: "#f59e0b",
  },
  high: {
    label: "High nutrient/pH",
    tone: "rose",
    from: "rgba(239, 68, 68, 0.78)",
    via: "rgba(249, 115, 22, 0.62)",
    to: "rgba(251, 191, 36, 0.4)",
    surface: "rgba(255, 237, 213, 0.58)",
    accent: "#ef4444",
  },
  missing: {
    label: "Waiting",
    tone: "slate",
    from: "rgba(14, 165, 233, 0.55)",
    via: "rgba(45, 212, 191, 0.42)",
    to: "rgba(226, 232, 240, 0.36)",
    surface: "rgba(248, 250, 252, 0.48)",
    accent: "#64748b",
  },
};

function withCssVars(palette) {
  return {
    ...palette,
    cssVars: {
      "--tank-water-from": palette.from,
      "--tank-water-via": palette.via,
      "--tank-water-to": palette.to,
      "--tank-water-surface": palette.surface,
      "--tank-water-accent": palette.accent,
    },
  };
}

export function getWaterQualityPalette(reading) {
  if (!reading) return withCssVars(waterQualityPalettes.missing);

  const nutrientStatuses = ["ph", "tds", "ec"]
    .map((key) => ({ key, status: getSensorStatus(key, reading[key]) }))
    .filter(({ status }) => status.direction !== "missing");

  if (!nutrientStatuses.length) return withCssVars(waterQualityPalettes.missing);

  const worst = nutrientStatuses.sort((a, b) => a.status.score - b.status.score)[0];

  if (worst.status.direction === "target") {
    return withCssVars({ ...waterQualityPalettes.balanced, sensorKey: worst.key, status: worst.status });
  }

  const palette = worst.status.direction === "low" ? waterQualityPalettes.low : waterQualityPalettes.high;
  return withCssVars({ ...palette, sensorKey: worst.key, status: worst.status });
}
