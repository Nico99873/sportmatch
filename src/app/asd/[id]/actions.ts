"use server";

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
