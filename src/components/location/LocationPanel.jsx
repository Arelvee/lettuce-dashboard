import { LocateFixed, MapPinned, Network, Router, Search } from "lucide-react";
import { useMemo, useState } from "react";
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

function mapUrl(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const delta = 0.012;
  const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
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

  function useDeviceLocation() {
    setBusy(true);
    setMessage("");
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
        setMessage("Device location captured.");
        setBusy(false);
      },
      () => {
        setMessage("Location permission was denied or unavailable.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

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
      <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-title">Farm Location</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">ESP32 location map</h2>
            </div>
            <StatusBadge tone={location.source === "device" ? "emerald" : location.source === "ip" ? "sky" : "amber"}>
              {location.source}
            </StatusBadge>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">ESP32 IP address</span>
              <div className="mt-1 flex gap-2">
                <div className="relative flex-1">
                  <Router className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                  <input
                    value={esp32Ip}
                    onChange={(event) => setEsp32Ip(event.target.value)}
                    className="focus-ring h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3"
                  />
                </div>
                <button
                  type="button"
                  onClick={lookupIpLocation}
                  disabled={busy}
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-3 text-white hover:bg-slate-800 disabled:opacity-60"
                  title="Lookup public IP location"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </label>

            <button
              type="button"
              onClick={useDeviceLocation}
              disabled={busy}
              className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              Use device location
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Latitude</p>
                <p className="mt-1 text-sm font-bold text-slate-950">{Number(location.latitude).toFixed(5)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Longitude</p>
                <p className="mt-1 text-sm font-bold text-slate-950">{Number(location.longitude).toFixed(5)}</p>
              </div>
            </div>

            <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <Network className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
              <p>
                Last ESP32 sample: {latestReading?.timestamp ? new Date(latestReading.timestamp).toLocaleString("en-PH") : "waiting for sensor data"}
              </p>
            </div>

            {message ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {message}
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-h-[360px] border-t border-slate-200 bg-slate-100 lg:border-l lg:border-t-0">
          <iframe
            title="ESP32 farm location map"
            src={mapUrl(location.latitude, location.longitude)}
            className="h-full min-h-[360px] w-full"
            loading="lazy"
          />
          <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
            <MapPinned className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            {location.label}
          </div>
        </div>
      </div>
    </section>
  );
}

