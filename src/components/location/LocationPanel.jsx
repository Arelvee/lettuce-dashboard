import { Building2, LocateFixed, Map, MapPinned, Mountain, Network, Router, Satellite, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import StatusBadge from "../common/StatusBadge";

const DEFAULT_LOCATION = {
  latitude: 14.5869,
  longitude: 121.0614,
  label: "Manila / nearby farm fallback",
  source: "default",
};

function isPrivateIp(ip) {
  return (
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    /^127\./.test(ip) ||
    ip === "localhost"
  );
}

const mapModes = [
  { key: "map", label: "Map", icon: Map },
  { key: "satellite", label: "Satellite", icon: Satellite },
  { key: "terrain", label: "Terrain", icon: Mountain },
  { key: "3d", label: "3D View", icon: Building2 },
];

function embedUrl(latitude, longitude, mode) {
  const lat = Number(latitude).toFixed(6);
  const lon = Number(longitude).toFixed(6);
  if (mode === "3d") {
    return `https://osmbuildings.org/?lat=${lat}&lon=${lon}&zoom=17&tilt=45&rotation=25`;
  }
  const mapType = mode === "satellite" ? "k" : mode === "terrain" ? "p" : "m";
  return `https://maps.google.com/maps?q=${lat},${lon}&z=17&t=${mapType}&output=embed`;
}

export default function LocationPanel({ profile, latestReading }) {
  const initialLocation = useMemo(() => {
    if (profile?.latitude && profile?.longitude) {
      return {
        latitude: Number(profile.latitude),
        longitude: Number(profile.longitude),
        label: profile.farm_name || "Saved farm location",
        source: "profile",
      };
    }
    return DEFAULT_LOCATION;
  }, [profile]);

  const [esp32Ip, setEsp32Ip] = useState(profile?.esp32_ip || import.meta.env.VITE_ESP32_IP || "192.168.1.9");
  const [location, setLocation] = useState(initialLocation);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [mapMode, setMapMode] = useState("map");

  const locateDevice = useCallback((mode = "manual") => {
    setBusy(true);
    setMessage(mode === "auto" ? "Auto-locating this device..." : "");
    if (!navigator.geolocation) {
      setMessage("Device geolocation is not available in this browser.");
      setBusy(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: "Device location",
          source: "device",
        });
        setMessage(mode === "auto" ? "Device location detected automatically." : "Device location refreshed.");
        setBusy(false);
      },
      () => {
        setMessage(
          mode === "auto"
            ? "Allow location permission to auto-pin the farm/device location. Using saved fallback for now."
            : "Location permission was denied or unavailable.",
        );
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    locateDevice("auto");
  }, [locateDevice]);

  async function lookupIpLocation() {
    setBusy(true);
    setMessage("");
    const trimmedIp = esp32Ip.trim();
    if (isPrivateIp(trimmedIp)) {
      setLocation(initialLocation);
      setMessage("Private LAN IP detected. Public IP geolocation cannot locate a local ESP32; using saved farm/device location.");
      setBusy(false);
      return;
    }
    try {
      const response = await fetch(`https://ipapi.co/${encodeURIComponent(trimmedIp)}/json/`);
      const payload = await response.json();
      if (!response.ok || payload.error || !payload.latitude || !payload.longitude) {
        throw new Error(payload.reason || "IP location lookup failed.");
      }
      setLocation({
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
        label: payload.city ? `${payload.city}, ${payload.country_name}` : "ESP32 public IP location",
        source: "ip",
      });
      setMessage("ESP32 public IP location resolved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "IP lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title">Farm Location</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Device location map</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {location.label}
          </p>
        </div>
        <StatusBadge tone={location.source === "device" ? "emerald" : location.source === "ip" ? "sky" : "amber"}>
          {location.source === "device" ? "auto GPS" : location.source}
        </StatusBadge>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {mapModes.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMapMode(key)}
              className={`focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                mapMode === key
                  ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <div className="bg-slate-50/70 p-4 sm:p-5 dark:bg-white/[0.03]">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">ESP32 IP address</span>
              <div className="mt-1 flex gap-2">
                <div className="relative flex-1">
                  <Router className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                  <input
                    value={esp32Ip}
                    onChange={(event) => setEsp32Ip(event.target.value)}
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={lookupIpLocation}
                  disabled={busy}
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-3 text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  title="Lookup public IP location"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </label>

            <button
              type="button"
              onClick={() => locateDevice("manual")}
              disabled={busy}
              className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              Refresh device location
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950/80">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Latitude</p>
                <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{Number(location.latitude).toFixed(5)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950/80">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Longitude</p>
                <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{Number(location.longitude).toFixed(5)}</p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-300">
              <Network className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-300" aria-hidden="true" />
              <p>
                Last ESP32 sample: {latestReading?.timestamp ? new Date(latestReading.timestamp).toLocaleString("en-PH") : "waiting for sensor data"}
              </p>
            </div>

            {message ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200">
                {message}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex min-h-[660px] flex-col border-t border-slate-200 bg-slate-100 lg:border-l lg:border-t-0 dark:border-white/10 dark:bg-slate-950">
          <div className="relative min-h-[600px] flex-1 overflow-hidden bg-slate-200 dark:bg-slate-950">
            <iframe
              key={`${mapMode}-${location.latitude}-${location.longitude}`}
              title={`${mapMode} device location map`}
              src={embedUrl(location.latitude, location.longitude, mapMode)}
              className="h-full min-h-[600px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/60 bg-white/90 px-3 py-2 text-sm shadow-soft backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
              <div className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                <MapPinned className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                {mapModes.find((mode) => mode.key === mapMode)?.label}
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              {location.label}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {mapMode === "3d" ? "3D building view inside dashboard" : `${mapModes.find((mode) => mode.key === mapMode)?.label} view inside dashboard`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
