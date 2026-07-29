"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Sport } from "@prisma/client";
import ResultsList from "./ResultsList";
import { SPORTS, SPORT_INFO } from "@/lib/sports";
import { BASSANO_CENTER, haversineKm } from "@/lib/geo";
import { geocodePlace, searchPlaces, type GeocodeResult } from "@/lib/geocode";
import { anyCategoryAcceptsAge, type AgeRange } from "@/lib/eligibility";

const SportMap = dynamic(() => import("./SportMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm text-zinc-400">
      Caricamento mappa...
    </div>
  ),
});

export type AsdCategorySummary = AgeRange & {
  id: string;
  name: string;
  hours: string;
  annualFee: number;
};

export type AsdListItem = {
  id: string;
  name: string;
  sport: Sport;
  lat: number;
  lon: number;
  rating: number;
  reviewCount: number;
  address: string;
  categories: AsdCategorySummary[];
};

type OriginStatus = "default" | "locating" | "located" | "denied" | "searching" | "error";

export default function HomeExplorer({ asds }: { asds: AsdListItem[] }) {
  const [nameQuery, setNameQuery] = useState("");
  const [enrolleeAge, setEnrolleeAge] = useState("");
  const [zoneQuery, setZoneQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeSports, setActiveSports] = useState<Sport[]>([]);
  const [origin, setOrigin] = useState(BASSANO_CENTER);
  const [originLabel, setOriginLabel] = useState("Bassano del Grappa (zona predefinita)");
  const [originStatus, setOriginStatus] = useState<OriginStatus>("default");
  const [originError, setOriginError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("list");

  function locate() {
    if (!navigator.geolocation) return;
    setOriginStatus("locating");
    setOriginError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setOriginLabel("la tua posizione");
        setOriginStatus("located");
      },
      () => setOriginStatus("denied"),
      { timeout: 8000 }
    );
  }

  function handleZoneQueryChange(value: string) {
    setZoneQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(trimmed, 5, origin);
        setSuggestions(results);
        setSuggestOpen(true);
      } catch {
        // Autocomplete is best-effort: stay quiet, "Cerca zona" submit still works as fallback.
      }
    }, 500);
  }

  function applyOrigin(result: GeocodeResult) {
    setOrigin({ lat: result.lat, lon: result.lon });
    setOriginLabel(result.label);
    setOriginStatus("located");
    setOriginError(null);
    setZoneQuery(result.label);
    setSuggestions([]);
    setSuggestOpen(false);
  }

  async function searchZone(e: React.FormEvent) {
    e.preventDefault();
    if (!zoneQuery.trim()) return;

    if (suggestions.length > 0) {
      applyOrigin(suggestions[0]);
      return;
    }

    setOriginStatus("searching");
    setOriginError(null);
    try {
      const result = await geocodePlace(zoneQuery.trim(), origin);
      applyOrigin(result);
    } catch (err) {
      setOriginStatus("error");
      setOriginError(err instanceof Error ? err.message : "Ricerca non riuscita.");
    }
  }

  function toggleSport(s: Sport) {
    setActiveSports((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const withDistance = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    const age = enrolleeAge.trim() ? Number(enrolleeAge) : null;
    return asds
      .filter((a) => {
        if (activeSports.length && !activeSports.includes(a.sport)) return false;
        if (q && !a.name.toLowerCase().includes(q) && !a.address.toLowerCase().includes(q)) return false;
        if (age !== null && !Number.isNaN(age) && !anyCategoryAcceptsAge(a.categories, age)) return false;
        return true;
      })
      .map((a) => ({ ...a, distanceKm: haversineKm(origin, { lat: a.lat, lon: a.lon }) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [asds, activeSports, nameQuery, enrolleeAge, origin]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-sm-blue px-4 py-2.5 text-center text-sm font-medium text-white sm:text-base">
        Trova la società sportiva giusta, su mappa
      </div>

      <div className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          <form onSubmit={searchZone} className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={zoneQuery}
                onChange={(e) => handleZoneQueryChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
                onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                placeholder="Cerca una città o zona (es. Bari, Vicenza, Milano...)"
                className="w-full rounded-full border border-zinc-300 px-4 py-2 text-sm focus:border-sm-blue focus:outline-none"
              />
              {suggestOpen && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                  {suggestions.map((s, i) => (
                    <li key={`${s.lat}-${s.lon}-${i}`}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyOrigin(s)}
                        className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                      >
                        📍 {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              disabled={originStatus === "searching"}
              className="shrink-0 rounded-full bg-sm-blue px-3 py-2 text-xs font-medium text-white hover:bg-sm-navy disabled:opacity-60 sm:text-sm"
            >
              {originStatus === "searching" ? "Cerco..." : "Cerca zona"}
            </button>
            <button
              type="button"
              onClick={locate}
              className="shrink-0 rounded-full border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 sm:text-sm"
            >
              📍 {originStatus === "locating" ? "..." : "Usa la mia posizione"}
            </button>
          </form>

          <div className="text-xs text-zinc-500">
            {originStatus === "error" ? (
              <span className="text-red-600">{originError}</span>
            ) : originStatus === "denied" ? (
              <span className="text-red-600">Posizione non disponibile, sto usando: {originLabel}</span>
            ) : (
              <>
                Distanze calcolate da: <strong className="text-zinc-700">{originLabel}</strong>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              placeholder="Filtra per nome società..."
              className="w-full flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm focus:border-sm-blue focus:outline-none"
            />
            <input
              value={enrolleeAge}
              onChange={(e) => setEnrolleeAge(e.target.value)}
              type="number"
              min={0}
              max={99}
              placeholder="Età (anni)"
              className="w-32 shrink-0 rounded-full border border-zinc-300 px-4 py-2 text-sm focus:border-sm-blue focus:outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {SPORTS.map((s) => {
              const info = SPORT_INFO[s];
              const active = activeSports.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSport(s)}
                  className="flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition"
                  style={
                    active
                      ? { backgroundColor: info.color, borderColor: info.color, color: "#fff" }
                      : { borderColor: "#d4d4d8", color: "#3f3f46", backgroundColor: "#fff" }
                  }
                >
                  <span>{info.emoji}</span>
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex border-b bg-white sm:hidden">
        <button
          className={`flex-1 py-2 text-sm font-medium ${mobileView === "list" ? "border-b-2 border-sm-blue text-sm-blue" : "text-zinc-500"}`}
          onClick={() => setMobileView("list")}
        >
          Lista
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${mobileView === "map" ? "border-b-2 border-sm-blue text-sm-blue" : "text-zinc-500"}`}
          onClick={() => setMobileView("map")}
        >
          Mappa
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col sm:flex-row">
        <div
          className={`${mobileView === "list" ? "flex" : "hidden"} w-full flex-col sm:flex sm:w-[380px] sm:shrink-0 sm:border-r`}
        >
          <div className="border-b px-4 py-2 text-sm text-zinc-500">
            <strong className="text-zinc-800">{withDistance.length}</strong>{" "}
            {withDistance.length === 1 ? "società trovata" : "società trovate"}
          </div>
          <ResultsList items={withDistance} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className={`${mobileView === "map" ? "block" : "hidden"} relative flex-1 sm:block`} style={{ minHeight: 420 }}>
          <SportMap items={withDistance} userLoc={origin} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>
    </div>
  );
}
