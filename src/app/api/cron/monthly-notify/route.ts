import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMonthlyPendingContactsEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Vercel cron requests include this header; reject anything else in production
  const authHeader = req.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find FREE-plan ASDs that have at least one unopened contact request
  const asds = await prisma.asd.findMany({
    where: {
      subscriptionPlan: "FREE",
      contactRequests: { some: { viewedAt: null } },
    },
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { contactRequests: { where: { viewedAt: null } } } },
    },
  });

  let notified = 0;
  for (const asd of asds) {
    const pendingCount = asd._count.contactRequests;
    try {
      await sendMonthlyPendingContactsEmail({
        asdEmail: asd.email,
        asdName: asd.name,
        pendingCount,
      });
      notified++;
    } catch (err) {
      console.error(`Failed to notify ${asd.email}:`, err);
    }
  }

  return NextResponse.json({ notified, total: asds.length });
}
