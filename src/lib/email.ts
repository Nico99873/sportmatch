import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactRequestEmail({
  asdEmail,
  asdName,
  contactName,
  enrolleeType,
  message,
}: {
  asdEmail: string;
  asdName: string;
  contactName: string;
  enrolleeType: "SELF" | "CHILD";
  message: string;
}) {
  const requestType = enrolleeType === "SELF" ? "Iscrizione personale" : "Iscrizione per il figlio/a";

  await resend.emails.send({
    from: "SportMatch <onboarding@resend.dev>",
    to: asdEmail,
    subject: `Nuova richiesta di contatto da ${contactName}`,
    html: `
      <p><strong>${escapeHtml(contactName)}</strong> ha inviato una richiesta di contatto a ${escapeHtml(asdName)} tramite SportMatch.</p>
      <p><strong>Tipo di richiesta:</strong> ${requestType}</p>
      <p><strong>Messaggio:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      <p><a href="https://sportmatch-black.vercel.app/dashboard">Vai alla tua dashboard</a> per rispondere.</p>
    `,
  });
}
