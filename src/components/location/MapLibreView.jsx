import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Compass, RotateCcw, RotateCw } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

const rasterStyles = {
  map: {
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution: "&copy; OpenStreetMap contributors",
  },
  satellite: {
    tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    attribution: "Tiles &copy; Esri",
  },
  terrain: {
    tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"],
    attribution: "Tiles &copy; Esri",
  },
  "3d": {
    tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"],
    attribution: "Tiles &copy; Esri",
  },
};

const terrainSourceId = "terrain-dem";
const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;
const terrainSourceConfig = mapTilerKey
  ? {
      type: "raster-dem",
      url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${mapTilerKey}`,
      tileSize: 256,
    }
  : {
      type: "raster-dem",
      url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
      tileSize: 256,
    };
const buildingSourceId = "osm-buildings";
const buildingLayerId = "osm-buildings-extrusion";
const overpassEndpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function emptyFeatureCollection() {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

function createStyle(mode) {
  const style = rasterStyles[mode] || rasterStyles.map;
  return {
    version: 8,
    sources: {
      base: {
        type: "raster",
        tiles: style.tiles,
        tileSize: 256,
        attribution: style.attribution,
      },
    },
    layers: [
      {
        id: "base",
        type: "raster",
        source: "base",
      },
    ],
  };
}

function cameraForMode(mode) {
  if (mode === "3d") return { zoom: 16.65, pitch: 64, bearing: -34 };
  if (mode === "terrain") return { zoom: 15.9, pitch: 62, bearing: -24 };
  if (mode === "satellite") return { zoom: 16.1, pitch: 45, bearing: -12 };
  return { zoom: 15.6, pitch: 36, bearing: 0 };
}

function terrainExaggerationForMode(mode) {
  if (mode === "3d") return 3.2;
  if (mode === "terrain") return 2.6;
  return 1;
}

function addTerrainToMap(map, mode) {
  if (map.getSource(terrainSourceId)) return null;

  map.addSource(terrainSourceId, terrainSourceConfig);
  map.addLayer({
    id: "terrain-hillshade",
    type: "hillshade",
    source: terrainSourceId,
    paint: {
      "hillshade-exaggeration": mode === "3d" ? 0.92 : 0.78,
      "hillshade-shadow-color": "#0f172a",
      "hillshade-highlight-color": "#f8fafc",
      "hillshade-accent-color": "#14b8a6",
    },
  });

  const terrainOptions = {
    source: terrainSourceId,
    exaggeration: terrainExaggerationForMode(mode),
  };
  map.setTerrain(terrainOptions);
  return terrainOptions;
}

function parseMeters(value) {
  if (!value) return null;
  const match = String(value).replace(",", ".").match(/-?\d+(\.\d+)?/);
  const number = match ? Number(match[0]) : null;
  return Number.isFinite(number) ? number : null;
}

function buildingHeight(tags = {}) {
  const explicitHeight = parseMeters(tags.height);
  if (explicitHeight !== null) return Math.min(Math.max(explicitHeight, 4), 180);

  const levels = parseMeters(tags["building:levels"]);
  if (levels !== null) return Math.min(Math.max(levels * 3.2 + 2, 5), 140);

  if (tags.building === "apartments" || tags.building === "commercial") return 22;
  if (tags.building === "house" || tags.building === "residential") return 9;
  return 14;
}

function buildingMinHeight(tags = {}) {
  const explicitMinHeight = parseMeters(tags.min_height);
  if (explicitMinHeight !== null) return explicitMinHeight;

  const minLevel = parseMeters(tags["building:min_level"]);
  return minLevel === null ? 0 : minLevel * 3.2;
}

function createOverpassQuery(latitude, longitude) {
  return `
    [out:json][timeout:18];
    (
      way["building"](around:950,${Number(latitude)},${Number(longitude)});
    );
    out tags geom;
  `;
}

function overpassToGeoJson(payload) {
  const features = (payload.elements || [])
    .filter((element) => element.type === "way" && Array.isArray(element.geometry) && element.geometry.length >= 4)
    .map((element) => {
      const coordinates = element.geometry.map((point) => [point.lon, point.lat]);
      const first = coordinates[0];
      const last = coordinates[coordinates.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) coordinates.push(first);

      return {
        type: "Feature",
        properties: {
          height: buildingHeight(element.tags),
          minHeight: buildingMinHeight(element.tags),
        },
        geometry: {
          type: "Polygon",
          coordinates: [coordinates],
        },
      };
    });

  return {
    type: "FeatureCollection",
    features,
  };
}

async function fetchBuildingFootprints(latitude, longitude) {
  const query = createOverpassQuery(latitude, longitude);

  for (const endpoint of overpassEndpoints) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`Overpass responded ${response.status}`);
      return overpassToGeoJson(await response.json());
    } catch {
      // Try the next public Overpass mirror before falling back to an empty building layer.
    }
  }

  return emptyFeatureCollection();
}

async function addOsmBuildingsToMap(map, latitude, longitude, isActive = () => true) {
  if (map.getSource(buildingSourceId)) return;

  map.addSource(buildingSourceId, {
    type: "geojson",
    data: emptyFeatureCollection(),
  });
  map.addLayer({
    id: buildingLayerId,
    type: "fill-extrusion",
    source: buildingSourceId,
    minzoom: 15,
    paint: {
      "fill-extrusion-color": [
        "interpolate",
        ["linear"],
        ["get", "height"],
        6,
        "#bbf7d0",
        24,
        "#22c55e",
        60,
        "#0f766e",
      ],
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "minHeight"],
      "fill-extrusion-opacity": 0.58,
      "fill-extrusion-vertical-gradient": true,
    },
  });

  const buildingData = await fetchBuildingFootprints(latitude, longitude);
  if (!isActive()) return;

  const source = map.getSource(buildingSourceId);
  if (source?.setData) {
    source.setData(buildingData);
    map.getContainer()
      .closest(".modern-map-shell")
      ?.setAttribute("data-building-count", String(buildingData.features.length));
  }
}

export default function MapLibreView({ latitude, longitude, mode, label }) {
  const shellRef = useRef(null);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const coordinates = useMemo(() => [Number(longitude), Number(latitude)], [latitude, longitude]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    let disposed = false;
    const camera = cameraForMode(mode);
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createStyle(mode),
      center: coordinates,
      zoom: camera.zoom,
      pitch: camera.pitch,
      bearing: camera.bearing,
      antialias: true,
      attributionControl: false,
      maxPitch: 78,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;

    const markerEl = document.createElement("div");
    markerEl.className = "modern-map-pin";
    markerEl.setAttribute("aria-label", label || "Farm location");
    markerEl.innerHTML = '<span class="lettuce-pin-icon"><i></i><b></b></span>';
    markerRef.current = new maplibregl.Marker({ element: markerEl, anchor: "bottom" })
      .setLngLat(coordinates)
      .addTo(map);

    map.on("load", () => {
      let terrainOptions = null;
      if (mode === "terrain" || mode === "3d") {
        terrainOptions = addTerrainToMap(map, mode);
        shellRef.current?.setAttribute("data-terrain-active", terrainOptions ? "true" : "false");
        if (terrainOptions && maplibregl.TerrainControl) {
          map.addControl(new maplibregl.TerrainControl(terrainOptions), "top-right");
        }
      } else {
        shellRef.current?.setAttribute("data-terrain-active", "false");
      }

      if (mode === "3d") {
        addOsmBuildingsToMap(map, latitude, longitude, () => !disposed);
      }
    });

    return () => {
      disposed = true;
      markerRef.current?.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [coordinates, label, latitude, longitude, mode]);

  function rotateMap(delta) {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      bearing: map.getBearing() + delta,
      duration: 420,
    });
  }

  function resetRotation() {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      bearing: 0,
      pitch: cameraForMode(mode).pitch,
      duration: 520,
    });
  }

  return (
    <div ref={shellRef} className="modern-map-shell" data-building-count="0" data-map-mode={mode} data-terrain-active="pending">
      <div ref={containerRef} className="h-full min-h-[520px] w-full" />
      <div className="absolute right-3 top-28 z-10 flex flex-col overflow-hidden rounded-lg border border-white/55 bg-white/90 shadow-xl shadow-slate-950/15 backdrop-blur dark:border-white/10 dark:bg-slate-950/86">
        <button
          type="button"
          onClick={() => rotateMap(-30)}
          className="map-control-button"
          title="Rotate map left"
          aria-label="Rotate map left"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={resetRotation}
          className="map-control-button border-y border-slate-200 dark:border-white/10"
          title="Reset map rotation"
          aria-label="Reset map rotation"
        >
          <Compass className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => rotateMap(30)}
          className="map-control-button"
          title="Rotate map right"
          aria-label="Rotate map right"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/35 to-transparent" />
    </div>
  );
}
