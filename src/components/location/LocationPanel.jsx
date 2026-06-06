import { Building2, Check, ChevronDown, LocateFixed, Map, MapPinned, Mountain, Navigation, Network, Router, Satellite, Search } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import StatusBadge from "../common/StatusBadge";

const MapLibreView = lazy(() => import("./MapLibreView"));

const DEFAULT_LOCATION = {
  latitude: 14.5869,
  longitude: 121.0614,
  label: "Manila / nearby farm fallback",
  address: "Manila, Metro Manila, Philippines",
  source: "default",
};

const RESOLVING_ADDRESS = "Resolving address...";

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
  { key: "map", label: "Map", icon: Map, detail: "Street basemap" },
  { key: "satellite", label: "Satellite", icon: Satellite, detail: "World imagery" },
  { key: "terrain", label: "Terrain", icon: Mountain, detail: "Elevation relief" },
  { key: "3d", label: "3D View", icon: Building2, detail: "3D buildings" },
];

function fixedCoordinate(value) {
  return Number(value).toFixed(6);
}

function addressFromPayload(payload) {
  return [
    payload.display_name,
    payload.locality || payload.city,
    payload.principalSubdivision || payload.region || payload.state,
    payload.countryName || payload.country_name || payload.country,
  ].filter(Boolean).join(", ");
}

function fallbackAddressFor(latitude, longitude, label = "Pinned location") {
  return `${label || "Pinned location"} (${fixedCoordinate(latitude)}, ${fixedCoordinate(longitude)})`;
}

async function fetchJsonWithTimeout(url, timeoutMs = 7000) {
  const controller = new window.AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

export default function LocationPanel({ profile, latestReading }) {
  const initialLocation = useMemo(() => {
    if (profile?.latitude && profile?.longitude) {
      return {
        latitude: Number(profile.latitude),
        longitude: Number(profile.longitude),
        label: profile.farm_name || "Saved farm location",
        address: profile.location_address || profile.address || profile.farm_name || "Saved farm location",
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
  const [mapMenuOpen, setMapMenuOpen] = useState(false);
  const locationLatitude = location.latitude;
  const locationLongitude = location.longitude;
  const locationLabel = location.label;

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    let cancelled = false;
    async function resolveAddress() {
      const fallbackAddress = fallbackAddressFor(locationLatitude, locationLongitude, locationLabel);
      try {
        const payload = await fetchJsonWithTimeout(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(locationLatitude)}&longitude=${encodeURIComponent(locationLongitude)}&localityLanguage=en`,
        );
        const address = addressFromPayload(payload) || fallbackAddress;
        if (cancelled) return;
        setLocation((current) => (
          Number(current.latitude) === Number(locationLatitude) &&
          Number(current.longitude) === Number(locationLongitude)
            ? { ...current, address }
            : current
        ));
      } catch {
        if (cancelled) return;
        setLocation((current) => (
          Number(current.latitude) === Number(locationLatitude) &&
          Number(current.longitude) === Number(locationLongitude) &&
          (!current.address || current.address === RESOLVING_ADDRESS)
            ? { ...current, address: fallbackAddress }
            : current
        ));
      }
    }
    resolveAddress();
    return () => {
      cancelled = true;
    };
  }, [locationLatitude, locationLongitude, locationLabel]);

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
          address: RESOLVING_ADDRESS,
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
        address: addressFromPayload(payload) || "ESP32 public IP location",
        source: "ip",
      });
      setMessage("ESP32 public IP location resolved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "IP lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  const currentMapMode = mapModes.find((mode) => mode.key === mapMode) || mapModes[0];
  const CurrentMapIcon = currentMapMode.icon;

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-title">Farm Location</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Device location map</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {location.address || location.label}
          </p>
        </div>
        <StatusBadge tone={location.source === "device" ? "emerald" : location.source === "ip" ? "sky" : "amber"}>
          {location.source === "device" ? "auto GPS" : location.source}
        </StatusBadge>
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
                    className="field-control mt-0 pl-10 pr-3"
                  />
                </div>
                <button
                  type="button"
                  onClick={lookupIpLocation}
                  disabled={busy}
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-slate-950 to-emerald-900 px-3 text-white shadow-sm transition hover:from-emerald-900 hover:to-teal-800 disabled:opacity-60 dark:from-white dark:to-emerald-100 dark:text-slate-950 dark:hover:from-emerald-50 dark:hover:to-cyan-100"
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
              className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-sm font-bold text-white shadow-sm shadow-emerald-950/15 transition hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-60"
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              Refresh device location
            </button>

            <div className="panel-muted p-3">
              <div className="flex items-start gap-3">
                <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Location address</p>
                  <p className="mt-1 text-sm font-bold leading-6 text-slate-950 dark:text-white">
                    {location.address || location.label}
                  </p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${fixedCoordinate(location.latitude)}&mlon=${fixedCoordinate(location.longitude)}#map=17/${fixedCoordinate(location.latitude)}/${fixedCoordinate(location.longitude)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-200"
                  >
                    Open map reference
                  </a>
                </div>
              </div>
            </div>

            <div className="panel-muted flex gap-3 p-3 text-sm text-slate-600 dark:text-slate-300">
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

        <div className="flex min-h-[560px] flex-col border-t border-slate-200 bg-slate-100 lg:border-l lg:border-t-0 dark:border-white/10 dark:bg-slate-950">
          <div className="relative min-h-[520px] flex-1 overflow-hidden bg-slate-200 dark:bg-slate-950">
            <Suspense
              fallback={
                <div className="flex min-h-[520px] items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 text-sm font-bold text-emerald-800 dark:from-slate-950 dark:to-emerald-950/40 dark:text-emerald-200">
                  Loading 3D map...
                </div>
              }
            >
              <MapLibreView
                key={`${mapMode}-${fixedCoordinate(location.latitude)}-${fixedCoordinate(location.longitude)}`}
                latitude={location.latitude}
                longitude={location.longitude}
                mode={mapMode}
                label={location.address || location.label}
              />
            </Suspense>
            <div className="absolute left-4 top-4 z-10 w-[min(18rem,calc(100%-2rem))]">
              <button
                type="button"
                onClick={() => setMapMenuOpen((open) => !open)}
                className="focus-ring flex w-full items-center justify-between gap-3 rounded-lg border border-white/65 bg-white/92 px-3 py-2 text-left text-sm font-bold text-slate-950 shadow-soft backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-slate-950/90 dark:text-white dark:hover:bg-slate-900/95"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <CurrentMapIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block">{currentMapMode.label}</span>
                    <span className="block truncate text-xs font-semibold text-slate-500 dark:text-slate-300">
                      {location.address || location.label}
                    </span>
                  </span>
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition ${mapMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              {mapMenuOpen ? (
                <div className="mt-2 overflow-hidden rounded-lg border border-white/65 bg-white/95 p-1.5 shadow-2xl shadow-slate-950/15 backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
                  {mapModes.map(({ key, label, icon: Icon, detail }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMapMode(key);
                        setMapMenuOpen(false);
                      }}
                      className={`focus-ring flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm font-bold transition ${
                        mapMode === key
                          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-100"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/8"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block">{label}</span>
                          <span className="block truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{detail}</span>
                        </span>
                      </span>
                      {mapMode === key ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <MapPinned className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
              {location.address || location.label}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {mapMode === "terrain" ? "Elevation terrain with shaded relief and the same farm pin" : mapMode === "3d" ? "3D terrain with nearby map buildings and the same farm pin" : `${mapModes.find((mode) => mode.key === mapMode)?.label} view with the same farm pin`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
