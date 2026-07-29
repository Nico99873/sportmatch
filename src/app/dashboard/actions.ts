"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ReplyFormState = {
  ok: boolean;
  message: string;
};

export async function replyToReview(
  reviewId: string,
  _prevState: ReplyFormState,
  formData: FormData
): Promise<ReplyFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Devi accedere per rispondere." };
  }

  const reply = String(formData.get("reply") ?? "").trim();
  if (!reply) {
    return { ok: false, message: "Scrivi una risposta prima di inviare." };
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { asd: true } });
  if (!review || review.asd.id !== session.user.id) {
    return { ok: false, message: "Recensione non trovata." };
  }
  if (review.asd.subscriptionPlan !== "PREMIUM") {
    return { ok: false, message: "Rispondere alle recensioni è disponibile solo con il piano Premium." };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { asdReply: reply, asdReplyAt: new Date() },
  });

  return { ok: true, message: "Risposta pubblicata." };
}
