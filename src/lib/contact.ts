import { prisma } from "@/lib/prisma";
import type { SubscriptionPlan } from "@prisma/client";

export const FREE_PLAN_CONTACT_LIMIT = 3;

export function hasUnlimitedContacts(plan: SubscriptionPlan) {
  return plan !== "FREE";
}

export async function countContactsThisMonth(asdId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return prisma.contactRequest.count({
    where: {
      asdId,
      createdAt: { gte: startOfMonth },
    },
  });
}

/**
 * Marks which contacts are "locked" (content hidden until upgrade): on a FREE
 * plan, only the first `FREE_PLAN_CONTACT_LIMIT` contacts per calendar month
 * (oldest first) are visible — the rest are locked. Base/Premium never lock
 * anything. Computed live from the current plan, not persisted, so upgrading
 * retroactively unlocks every past contact.
 */
export function markLockedContacts<T extends { id: string; createdAt: Date }>(
  contacts: T[],
  plan: SubscriptionPlan
): (T & { locked: boolean })[] {
  if (plan !== "FREE") {
    return contacts.map((c) => ({ ...c, locked: false }));
  }

  const byMonth = new Map<string, T[]>();
  for (const c of contacts) {
    const key = `${c.createdAt.getFullYear()}-${c.createdAt.getMonth()}`;
    const group = byMonth.get(key);
    if (group) group.push(c);
    else byMonth.set(key, [c]);
  }

  const lockedIds = new Set<string>();
  for (const group of byMonth.values()) {
    const sorted = [...group].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    for (const c of sorted.slice(FREE_PLAN_CONTACT_LIMIT)) {
      lockedIds.add(c.id);
    }
  }

  return contacts.map((c) => ({ ...c, locked: lockedIds.has(c.id) }));
}
