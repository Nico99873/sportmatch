import type { Sport } from "@prisma/client";

export const SPORTS: Sport[] = [
  "CALCIO",
  "NUOTO",
  "PALLAVOLO",
  "BASKET",
  "TENNIS",
  "ARTI_MARZIALI",
  "ATLETICA",
];

export const SPORT_INFO: Record<Sport, { label: string; emoji: string; color: string }> = {
  CALCIO: { label: "Calcio", emoji: "⚽", color: "#2E7D32" },
  NUOTO: { label: "Nuoto", emoji: "🏊", color: "#0891B2" },
  PALLAVOLO: { label: "Pallavolo", emoji: "🏐", color: "#7C3AED" },
  BASKET: { label: "Basket", emoji: "🏀", color: "#C2410C" },
  TENNIS: { label: "Tennis", emoji: "🎾", color: "#65A30D" },
  ARTI_MARZIALI: { label: "Arti marziali", emoji: "🥋", color: "#DC2626" },
  ATLETICA: { label: "Atletica", emoji: "🏃", color: "#2563EB" },
};
