import { prisma } from "@/lib/prisma";
import type { SubscriptionPlan } from "@prisma/client";

export const FREE_PLAN_CONTACT_LIMIT = 3;

export function hasUnlimitedContacts(plan: SubscriptionPlan) {
  return plan !== "FREE";
}

export async function countContactsThisMonth(asdId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return prisma.contactRequest.count({
    where: { asdId, createdAt: { gte: startOfMonth } },
  });
}

/** How many contacts this ASD has opened (viewedAt set) in the current calendar month. */
export async function countViewsThisMonth(asdId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return prisma.contactRequest.count({
    where: { asdId, viewedAt: { gte: startOfMonth } },
  });
}

/** Remaining opens this month for a FREE-plan ASD. */
export function remainingViews(viewsUsed: number) {
  return Math.max(0, FREE_PLAN_CONTACT_LIMIT - viewsUsed);
}

/**
 * For FREE plan: a contact is "locked" (shows overlay) if it has never been
 * opened (viewedAt == null) and the monthly view quota is exhausted.
 * Non-FREE plans: nothing is ever locked.
 */
export function markLockedContacts<T extends { id: string; viewedAt: Date | null }>(
  contacts: T[],
  plan: SubscriptionPlan,
  viewsUsed: number
): (T & { locked: boolean })[] {
  if (plan !== "FREE") {
    return contacts.map((c) => ({ ...c, locked: false }));
  }
  const quotaExhausted = viewsUsed >= FREE_PLAN_CONTACT_LIMIT;
  return contacts.map((c) => ({
    ...c,
    locked: c.viewedAt === null && quotaExhausted,
  }));
}
