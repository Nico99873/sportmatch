"use client";

import Link from "next/link";
import type { Sport } from "@prisma/client";
import { SPORT_INFO } from "@/lib/sports";
import { formatDistance } from "@/lib/geo";
import { summarizeAgeRange, summarizeMinFee, type AgeRange } from "@/lib/eligibility";
import StarRating from "./StarRating";

export type AsdWithDistance = {
  id: string;
  name: string;
  sport: Sport;
  rating: number;
  reviewCount: number;
  address: string;
  categories: (AgeRange & { annualFee: number })[];
  distanceKm: number;
};

export default function ResultsList({
  items,
  selectedId,
  onSelect,
}: {
  items: AsdWithDistance[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-zinc-500">
        Nessuna società trovata. Prova a cambiare filtro o zona di ricerca.
      </div>
    );
  }

  return (
    <ul className="flex-1 divide-y overflow-y-auto">
      {items.map((a) => {
        const info = SPORT_INFO[a.sport];
        const isSelected = a.id === selectedId;
        const minFee = summarizeMinFee(a.categories);
        return (
          <li
            key={a.id}
            onMouseEnter={() => onSelect(a.id)}
            className={`transition ${isSelected ? "bg-sm-blue/5" : "hover:bg-zinc-50"}`}
          >
            <Link href={`/asd/${a.id}`} className="block px-4 py-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-sm-navy">{a.name}</h3>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: info.color }}
                >
                  {info.emoji} {info.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                <StarRating rating={a.rating} />
                <span>({a.reviewCount} recensioni)</span>
                <span className="font-medium text-sm-blue">📍 {formatDistance(a.distanceKm)}</span>
              </div>
              <p className="mt-1 truncate text-xs text-zinc-500">{a.address}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {summarizeAgeRange(a.categories)}
                {minFee != null ? ` · da ${minFee} €/anno` : ""}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
