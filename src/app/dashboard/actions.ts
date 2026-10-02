"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FREE_PLAN_CONTACT_LIMIT, hasUnlimitedContacts, countViewsThisMonth } from "@/lib/contact";
import { sendUpgradeRequestEmail } from "@/lib/email";
import { PLAN_INFO } from "@/lib/plans";

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

export async function requestPlanUpgrade(planKey: string): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Non autenticato." };

  const asd = await prisma.asd.findUnique({ where: { id: session.user.id } });
  if (!asd) return { ok: false, message: "ASD non trovata." };

  const planInfo = PLAN_INFO[planKey as keyof typeof PLAN_INFO];
  if (!planInfo) return { ok: false, message: "Piano non valido." };

  try {
    await sendUpgradeRequestEmail({
      asdEmail: asd.email,
      asdName: asd.name,
      requestedPlan: planInfo.label,
    });
    return { ok: true, message: `Richiesta inviata! Ti contatteremo a ${asd.email} entro 24 ore.` };
  } catch {
    return { ok: false, message: "Errore nell'invio della richiesta. Riprova più tardi." };
  }
}

export type OpenContactResult =
  | { ok: true; contact: { id: string; contactName: string; contactEmail: string; contactPhone: string; enrolleeType: "SELF" | "CHILD"; enrolleeAge: number | null; message: string } }
  | { ok: false; error: string };

export async function openContactRequest(contactId: string): Promise<OpenContactResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Non autenticato." };

  const contact = await prisma.contactRequest.findUnique({
    where: { id: contactId },
    include: { asd: { select: { id: true, subscriptionPlan: true } } },
  });

  if (!contact || contact.asd.id !== session.user.id) {
    return { ok: false, error: "Richiesta non trovata." };
  }

  // Already opened
  if (contact.viewedAt !== null) {
    return {
      ok: true,
      contact: {
        id: contact.id,
        contactName: contact.contactName,
        contactEmail: contact.contactEmail,
        contactPhone: contact.contactPhone,
        enrolleeType: contact.enrolleeType,
        enrolleeAge: contact.enrolleeAge,
        message: contact.message,
      },
    };
  }

  // Quota check for FREE plan
  if (!hasUnlimitedContacts(contact.asd.subscriptionPlan)) {
    const used = await countViewsThisMonth(contact.asd.id);
    if (used >= FREE_PLAN_CONTACT_LIMIT) {
      return { ok: false, error: "limite_raggiunto" };
    }
  }

  const updated = await prisma.contactRequest.update({
    where: { id: contactId },
    data: { viewedAt: new Date() },
  });

  return {
    ok: true,
    contact: {
      id: updated.id,
      contactName: updated.contactName,
      contactEmail: updated.contactEmail,
      contactPhone: updated.contactPhone,
      enrolleeType: updated.enrolleeType,
      enrolleeAge: updated.enrolleeAge,
      message: updated.message,
    },
  };
}
