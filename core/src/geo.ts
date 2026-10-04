import type { LatLng } from "./types";

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export interface Place {
  id: string;
  label: string;
  labelZh: string;
  center: LatLng;
}

/** Location presets. "near-me" is a stand-in until the browser's location is wired up. */
export const PLACES: Place[] = [
  { id: "near-me", label: "Near me (Hsinchu Station)", labelZh: "新竹車站", center: { lat: 24.8016, lng: 120.9716 } },
  { id: "hsinchu-east", label: "East District, Hsinchu", labelZh: "新竹市東區", center: { lat: 24.7955, lng: 120.9905 } },
  { id: "hsinchu-north", label: "North District, Hsinchu", labelZh: "新竹市北區", center: { lat: 24.8135, lng: 120.9625 } },
  { id: "hsinchu-xiangshan", label: "Xiangshan District, Hsinchu", labelZh: "新竹市香山區", center: { lat: 24.7745, lng: 120.9335 } },
  { id: "zhubei", label: "Zhubei City", labelZh: "竹北市", center: { lat: 24.8275, lng: 121.0125 } },
];
