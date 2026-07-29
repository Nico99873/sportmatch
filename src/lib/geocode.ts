export type GeocodeResult = { lat: number; lon: number; label: string };
export type LatLon = { lat: number; lon: number };

export async function searchPlaces(query: string, limit = 5, near?: LatLon): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (near) params.set("near", `${near.lat},${near.lon}`);

  const res = await fetch(`/api/geocode?${params.toString()}`);
  if (!res.ok) throw new Error("Servizio di geocoding non disponibile.");
  const data = (await res.json()) as { results: GeocodeResult[] };
  return data.results;
}

export async function geocodePlace(query: string, near?: LatLon): Promise<GeocodeResult> {
  const results = await searchPlaces(query, 1, near);
  if (!results.length) {
    throw new Error(`Nessun risultato trovato per "${query}".`);
  }
  return results[0];
}
