import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution: "&copy; OpenStreetMap contributors",
  },
};

const terrainSourceId = "terrain-dem";
const terrainTiles = ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"];

function offsetCoordinate(latitude, longitude, eastMeters, northMeters) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const nextLat = lat + northMeters / 111320;
  const nextLon = lon + eastMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  return [nextLon, nextLat];
}

function rectangleFeature(latitude, longitude, centerEast, centerNorth, width, depth, height, color, name) {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const corners = [
    offsetCoordinate(latitude, longitude, centerEast - halfWidth, centerNorth - halfDepth),
    offsetCoordinate(latitude, longitude, centerEast + halfWidth, centerNorth - halfDepth),
    offsetCoordinate(latitude, longitude, centerEast + halfWidth, centerNorth + halfDepth),
    offsetCoordinate(latitude, longitude, centerEast - halfWidth, centerNorth + halfDepth),
  ];

  return {
    type: "Feature",
    properties: { color, height, minHeight: 0, name },
    geometry: {
      type: "Polygon",
      coordinates: [[...corners, corners[0]]],
    },
  };
}

function createFarmFeatures(latitude, longitude) {
  return {
    type: "FeatureCollection",
    features: [
      rectangleFeature(latitude, longitude, -42, -12, 28, 78, 24, "#0ea5e9", "Sensor wall"),
      rectangleFeature(latitude, longitude, 0, 0, 40, 92, 38, "#10b981", "Vertical racks"),
      rectangleFeature(latitude, longitude, 43, 14, 28, 68, 22, "#84cc16", "Grow bay"),
      rectangleFeature(latitude, longitude, 0, 56, 98, 14, 10, "#f59e0b", "Service path"),
      rectangleFeature(latitude, longitude, 0, -58, 102, 12, 7, "#14b8a6", "Reservoir lane"),
    ],
  };
}

function createStyle(mode) {
  const style = rasterStyles[mode] || rasterStyles.map;
  const terrainEnabled = mode === "terrain" || mode === "3d";
  return {
    version: 8,
    sources: {
      base: {
        type: "raster",
        tiles: style.tiles,
        tileSize: 256,
        attribution: style.attribution,
      },
      ...(terrainEnabled
        ? {
            [terrainSourceId]: {
              type: "raster-dem",
              tiles: terrainTiles,
              tileSize: 256,
              maxzoom: 15,
              encoding: "terrarium",
              attribution: "Elevation tiles &copy; AWS Open Data",
            },
          }
        : {}),
    },
    layers: [
      {
        id: "base",
        type: "raster",
        source: "base",
      },
      ...(terrainEnabled
        ? [
            {
              id: "terrain-hillshade",
              type: "hillshade",
              source: terrainSourceId,
              paint: {
                "hillshade-exaggeration": mode === "3d" ? 0.62 : 0.8,
                "hillshade-shadow-color": mode === "3d" ? "#0f172a" : "#164e63",
                "hillshade-highlight-color": "#ecfeff",
                "hillshade-accent-color": "#10b981",
              },
            },
          ]
        : []),
    ],
  };
}

function cameraForMode(mode) {
  if (mode === "3d") return { zoom: 17.35, pitch: 69, bearing: -34 };
  if (mode === "terrain") return { zoom: 15.9, pitch: 62, bearing: -24 };
  if (mode === "satellite") return { zoom: 16.1, pitch: 45, bearing: -12 };
  return { zoom: 15.6, pitch: 36, bearing: 0 };
}

function terrainExaggerationForMode(mode) {
  if (mode === "3d") return 2.65;
  if (mode === "terrain") return 2.25;
  return 1;
}

export default function MapLibreView({ latitude, longitude, mode, label }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const coordinates = useMemo(() => [Number(longitude), Number(latitude)], [latitude, longitude]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

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
    markerEl.innerHTML = "<span></span>";
    markerRef.current = new maplibregl.Marker({ element: markerEl, anchor: "bottom" })
      .setLngLat(coordinates)
      .addTo(map);

    map.on("load", () => {
      if (mode === "terrain" || mode === "3d") {
        const terrainOptions = { source: terrainSourceId, exaggeration: terrainExaggerationForMode(mode) };
        map.setTerrain(terrainOptions);
        if (maplibregl.TerrainControl) {
          map.addControl(new maplibregl.TerrainControl(terrainOptions), "top-right");
        }
      }

      map.addSource("farm-volume", {
        type: "geojson",
        data: createFarmFeatures(latitude, longitude),
      });
      map.addLayer({
        id: "farm-volume-shadow",
        type: "fill",
        source: "farm-volume",
        paint: {
          "fill-color": "#0f766e",
          "fill-opacity": mode === "3d" ? 0.18 : 0.1,
        },
      });
      map.addLayer({
        id: "farm-volume-fill",
        type: "fill-extrusion",
        source: "farm-volume",
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "minHeight"],
          "fill-extrusion-opacity": mode === "3d" ? 0.82 : 0.46,
          "fill-extrusion-vertical-gradient": true,
        },
      });
      map.addLayer({
        id: "farm-volume-outline",
        type: "line",
        source: "farm-volume",
        paint: {
          "line-color": "#ecfeff",
          "line-width": mode === "3d" ? 2.2 : 1.4,
          "line-opacity": 0.82,
        },
      });
    });

    return () => {
      markerRef.current?.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [coordinates, label, latitude, longitude, mode]);

  return (
    <div className="modern-map-shell">
      <div ref={containerRef} className="h-full min-h-[520px] w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/35 to-transparent" />
    </div>
  );
}
