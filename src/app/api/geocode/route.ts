import { NextRequest } from "next/server";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

const BIAS_BOX_DEGREES = 1.5;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "1");
  const limit = Math.min(Math.max(Number.isNaN(limitParam) ? 1 : limitParam, 1), 5);
  const near = request.nextUrl.searchParams.get("near");

  if (!q) {
    return Response.json({ error: "Parametro di ricerca mancante." }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));

  if (near) {
    const [latStr, lonStr] = near.split(",");
    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      // Soft bias toward the current search origin (bounded=0 keeps far-away
      // matches like "Bassano, Alberta, Canada" reachable, just deprioritized).
      url.searchParams.set(
        "viewbox",
        [lon - BIAS_BOX_DEGREES, lat + BIAS_BOX_DEGREES, lon + BIAS_BOX_DEGREES, lat - BIAS_BOX_DEGREES].join(",")
      );
      url.searchParams.set("bounded", "0");
    }
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent": "SportMatch-Prototype/0.1 (educational prototype; no production traffic)",
    },
  });

  if (!res.ok) {
    return Response.json({ error: "Servizio di geocoding non disponibile." }, { status: 502 });
  }

  const results = (await res.json()) as NominatimResult[];

  return Response.json({
    results: results.map((r) => ({
      lat: Number(r.lat),
      lon: Number(r.lon),
      label: r.display_name,
    })),
  });
}
