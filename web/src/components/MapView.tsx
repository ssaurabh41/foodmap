import { PLACES, type LatLng } from "@foodmap/core";

/**
 * Schematic SVG map for the mockup: rough coastline, Touqian River and railway around Hsinchu.
 * The real app swaps this for an interactive map with the same props.
 */

const BOUNDS = { north: 24.85, south: 24.755, west: 120.89, east: 121.04 };
const W = 1000;
const KM_PER_DEG_LAT = 111.32;
const H = Math.round(
  (W * (BOUNDS.north - BOUNDS.south)) /
    ((BOUNDS.east - BOUNDS.west) * Math.cos((24.8 * Math.PI) / 180)),
);

function project(p: LatLng): [number, number] {
  const x = ((p.lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * W;
  const y = ((BOUNDS.north - p.lat) / (BOUNDS.north - BOUNDS.south)) * H;
  return [x, y];
}

const line = (pts: [number, number][]) =>
  pts.map(([lat, lng], i) => `${i ? "L" : "M"}${project({ lat, lng }).join(",")}`).join(" ");

const COAST: [number, number][] = [
  [24.86, 120.94],
  [24.848, 120.93],
  [24.83, 120.921],
  [24.81, 120.914],
  [24.79, 120.908],
  [24.772, 120.9],
  [24.75, 120.893],
];
// Shapes extend well past the bounds so zooming out never shows an edge.
const FAR = 3000;
const SEA = `${line(COAST)} L${-FAR},${H + FAR} L${-FAR},${-FAR} Z`;
const RIVER = line([
  [24.851, 120.935],
  [24.84, 120.962],
  [24.828, 120.985],
  [24.818, 121.006],
  [24.813, 121.045],
]);
const RAIL = line([
  [24.86, 121.03],
  [24.839, 121.009],
  [24.8016, 120.9716],
  [24.78, 120.94],
  [24.763, 120.914],
  [24.75, 120.905],
]);

export interface MapPin {
  id: string;
  label: string;
  location: LatLng;
}

interface Props {
  center: LatLng;
  radiusKm: number;
  pins: MapPin[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MapView({ center, radiusKm, pins, selectedId, onSelect }: Props) {
  const [cx, cy] = project(center);
  const radiusPx = (radiusKm / KM_PER_DEG_LAT / (BOUNDS.north - BOUNDS.south)) * H;
  // Zoom so the search circle fills the view; k scales pins and labels to stay the same on screen.
  const half = Math.max(radiusPx * 1.25, 60);
  const k = (2 * half) / 600;
  const viewBox = `${cx - half * 1.6} ${cy - half} ${half * 3.2} ${half * 2}`;

  return (
    <div className="map">
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of results">
        <rect x={-FAR} y={-FAR} width={W + 2 * FAR} height={H + 2 * FAR} className="map-land" />
        <g className="map-grid">
          {Array.from({ length: 41 }, (_, i) => (i - 10) * 100).map((v) => (
            <g key={v}>
              <line x1={v} y1={-FAR} x2={v} y2={H + FAR} />
              <line x1={-FAR} y1={v} x2={W + FAR} y2={v} />
            </g>
          ))}
        </g>
        <path d={SEA} className="map-sea" />
        <path d={RIVER} className="map-river" />
        <path d={RAIL} className="map-rail" />
        <g style={{ fontSize: 17 * k }}>
          <text {...labelAt({ lat: 24.775, lng: 120.885 })} className="map-label map-label-sea">
            Taiwan Strait
          </text>
          <text {...labelAt({ lat: 24.836, lng: 120.958 })} className="map-label map-label-river">
            Touqian River 頭前溪
          </text>
          {PLACES.filter((p) => p.id !== "near-me").map((p) => (
            <text key={p.id} {...labelAt(p.center)} className="map-label">
              {p.labelZh}
            </text>
          ))}
        </g>

        <circle cx={cx} cy={cy} r={radiusPx} className="map-radius" />
        <circle cx={cx} cy={cy} r={7 * k} className="map-center" />

        {pins.map((pin, i) => {
          const [x, y] = project(pin.location);
          const selected = pin.id === selectedId;
          return (
            <g
              key={pin.id}
              transform={`translate(${x},${y}) scale(${k * (selected ? 1.35 : 1)})`}
              className={`map-pin ${selected ? "selected" : ""}`}
              onClick={() => onSelect(pin.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(pin.id)}
              aria-label={pin.label}
            >
              <title>{pin.label}</title>
              <path d="M0,0 C-4,-10 -16,-16 -16,-28 A16,16 0 1 1 16,-28 C16,-16 4,-10 0,0 Z" />
              <text y={-23} textAnchor="middle">
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="map-note">Schematic map for the mockup</p>
    </div>
  );
}

function labelAt(p: LatLng) {
  const [x, y] = project(p);
  return { x, y, textAnchor: "middle" as const };
}
