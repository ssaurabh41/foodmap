import type { LatLng, OpeningPeriod } from "@foodmap/core";

/**
 * A place as a data source returns it, before any translation or dish extraction.
 * Text is usually Traditional Chinese.
 */
export interface RawPlace {
  /** Stable ID from the source, e.g. a Google place_id. */
  sourceId: string;
  source: "google_places" | "osm" | "fixture";
  name: string;
  address: string;
  location: LatLng;
  rating?: number;
  reviewCount?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  hours?: OpeningPeriod[];
  reviews: { rating: number; text: string; when: string }[];
  /** Menu text, e.g. read from a menu photo or a delivery menu. */
  menuText?: string;
  mapsUrl?: string;
}

/** Anything that can list places in an area: Google Places, OpenStreetMap, a fixture file. */
export interface PlaceSource {
  discover(area: { center: LatLng; radiusKm: number }): AsyncIterable<RawPlace>;
}
