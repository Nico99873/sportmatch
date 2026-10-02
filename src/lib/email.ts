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
    from: "SportMatch <noreply@sportmatch.it>",
    to: asdEmail,
    subject: `Nuova richiesta di contatto da ${contactName}`,
    html: `
      <p><strong>${escapeHtml(contactName)}</strong> ha inviato una richiesta di contatto a ${escapeHtml(asdName)} tramite SportMatch.</p>
      <p><strong>Tipo di richiesta:</strong> ${requestType}</p>
      <p><strong>Messaggio:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      <p><a href="https://sportmatch.it/dashboard">Vai alla tua dashboard</a> per rispondere.</p>
    `,
  });
}

export async function sendLockedContactEmail({
  asdEmail,
  asdName,
}: {
  asdEmail: string;
  asdName: string;
}) {
  await resend.emails.send({
    from: "SportMatch <noreply@sportmatch.it>",
    to: asdEmail,
    subject: "Hai ricevuto una nuova richiesta di contatto (sospesa)",
    html: `
      <p>Ciao ${escapeHtml(asdName)},</p>
      <p>Hai ricevuto una nuova richiesta di contatto tramite SportMatch, ma hai raggiunto il <strong>limite di 3 contatti gratuiti</strong> per questo mese.</p>
      <p>I dati del genitore sono al sicuro nella tua dashboard, ma resteranno nascosti fino a quando non passi al piano <strong>Premium</strong>.</p>
      <p><a href="https://sportmatch.it/dashboard">Vai alla dashboard</a> per sbloccare questa e le prossime richieste senza limiti.</p>
      <p style="color:#888;font-size:12px;">Il limite si azzera il primo del mese successivo.</p>
    `,
  });
}
