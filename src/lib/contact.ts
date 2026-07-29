import { prisma } from "@/lib/prisma";

export const FREE_CONTACTS_PER_MONTH = 3;
export const PRICE_PER_EXTRA_CONTACT = 2;

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
