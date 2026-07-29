import type { SubscriptionPlan } from "@prisma/client";

export const PLAN_INFO: Record<SubscriptionPlan, { label: string; priceLabel: string; benefits: string[] }> = {
  FREE: {
    label: "Gratuito",
    priceLabel: "0 €",
    benefits: ["Profilo visibile sulla mappa", "Fino a 3 richieste di contatto al mese"],
  },
  BASE: {
    label: "Base",
    priceLabel: "49 €/anno",
    benefits: [
      "Richieste di contatto illimitate",
      "Analytics di base (visualizzazioni profilo, contatti ricevuti)",
      "Priorità nei risultati di ricerca a parità di distanza rispetto ai profili gratuiti",
    ],
  },
  PREMIUM: {
    label: "Premium",
    priceLabel: "99 €/anno",
    benefits: [
      "Tutto il piano Base",
      "Badge \"Società verificata\" sul profilo",
      "Possibilità di rispondere pubblicamente alle recensioni",
      "Visibilità extra nelle ricerche",
    ],
  },
};

export const PLAN_ORDER: SubscriptionPlan[] = ["FREE", "BASE", "PREMIUM"];

function planRank(plan: SubscriptionPlan) {
  return PLAN_ORDER.indexOf(plan);
}

/** Higher-ranked plan wins when two ASDs are otherwise tied (e.g. equal search distance). */
export function comparePlanPriority(a: SubscriptionPlan, b: SubscriptionPlan) {
  return planRank(b) - planRank(a);
}
