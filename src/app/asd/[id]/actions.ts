"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ContactFormState = {
  ok: boolean;
  message: string;
};

export async function submitContactRequest(
  asdId: string,
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const enrolleeType = formData.get("enrolleeType") === "SELF" ? "SELF" : "CHILD";
  const enrolleeAgeRaw = String(formData.get("enrolleeAge") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!contactName || !contactEmail || !contactPhone || !message) {
    return { ok: false, message: "Compila tutti i campi obbligatori." };
  }

  const asd = await prisma.asd.findUnique({ where: { id: asdId } });
  if (!asd) {
    return { ok: false, message: "Società non trovata." };
  }

  await prisma.contactRequest.create({
    data: {
      asdId,
      contactName,
      contactEmail,
      contactPhone,
      enrolleeType,
      enrolleeAge: enrolleeAgeRaw ? Number(enrolleeAgeRaw) : null,
      message,
    },
  });

  return {
    ok: true,
    message: `Richiesta inviata a ${asd.name}! Ti risponderanno via email o telefono a breve.`,
  };
}

export type ReviewFormState = {
  ok: boolean;
  message: string;
};

export async function submitReview(
  asdId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "PARENT") {
    return { ok: false, message: "Devi accedere come genitore per lasciare una recensione." };
  }

  const hasContacted = await prisma.contactRequest.findFirst({
    where: { asdId, contactEmail: { equals: session.user.email ?? "", mode: "insensitive" } },
  });
  if (!hasContacted) {
    return { ok: false, message: "Puoi recensire solo le società che hai già contattato." };
  }

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, message: "Seleziona una valutazione da 1 a 5 stelle." };
  }
  if (!comment) {
    return { ok: false, message: "Scrivi un commento." };
  }

  const asd = await prisma.asd.findUnique({ where: { id: asdId } });
  if (!asd) {
    return { ok: false, message: "Società non trovata." };
  }

  try {
    await prisma.review.create({
      data: {
        asdId,
        userId: session.user.id,
        authorName: session.user.name ?? "Genitore",
        rating,
        comment,
      },
    });
  } catch {
    return { ok: false, message: "Hai già recensito questa società." };
  }

  const agg = await prisma.review.aggregate({ where: { asdId }, _avg: { rating: true } });
  await prisma.asd.update({ where: { id: asdId }, data: { rating: agg._avg.rating ?? 0 } });

  return { ok: true, message: "Recensione pubblicata!" };
}
