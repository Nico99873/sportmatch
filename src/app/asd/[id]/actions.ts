"use server";

import { prisma } from "@/lib/prisma";
import { countContactsThisMonth, hasUnlimitedContacts, FREE_PLAN_CONTACT_LIMIT } from "@/lib/contact";

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

  if (!hasUnlimitedContacts(asd.subscriptionPlan)) {
    const contactsThisMonth = await countContactsThisMonth(asdId);
    if (contactsThisMonth >= FREE_PLAN_CONTACT_LIMIT) {
      return {
        ok: false,
        message: `Questa società ha raggiunto il limite di ${FREE_PLAN_CONTACT_LIMIT} richieste per questo mese. Riprova il mese prossimo.`,
      };
    }
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
