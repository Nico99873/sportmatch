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
