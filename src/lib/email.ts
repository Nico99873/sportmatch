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

export async function sendUpgradeRequestEmail({
  asdEmail,
  asdName,
  requestedPlan,
}: {
  asdEmail: string;
  asdName: string;
  requestedPlan: string;
}) {
  await resend.emails.send({
    from: "SportMatch <noreply@sportmatch.it>",
    to: process.env.ADMIN_EMAIL ?? "nicolofrighetto@gmail.com",
    subject: `Richiesta upgrade piano — ${asdName}`,
    html: `
      <p><strong>${escapeHtml(asdName)}</strong> ha richiesto l'upgrade al piano <strong>${escapeHtml(requestedPlan)}</strong>.</p>
      <p><strong>Email ASD:</strong> ${escapeHtml(asdEmail)}</p>
      <p>Contattala per procedere con il pagamento e aggiorna il piano nella dashboard di amministrazione.</p>
    `,
  });
}

export async function sendMonthlyPendingContactsEmail({
  asdEmail,
  asdName,
  pendingCount,
}: {
  asdEmail: string;
  asdName: string;
  pendingCount: number;
}) {
  await resend.emails.send({
    from: "SportMatch <noreply@sportmatch.it>",
    to: asdEmail,
    subject: `${pendingCount} ${pendingCount === 1 ? "richiesta in attesa" : "richieste in attesa"} — ora disponibili`,
    html: `
      <p>Ciao ${escapeHtml(asdName)},</p>
      <p>È iniziato un nuovo mese e il tuo limite di letture si è azzerato.</p>
      <p>Hai <strong>${pendingCount} ${pendingCount === 1 ? "richiesta di contatto" : "richieste di contatto"} in attesa</strong> che ${pendingCount === 1 ? "puoi ora leggere" : "puoi ora leggere"} dalla tua dashboard.</p>
      <p>Ricorda che i genitori contattano più società in parallelo: rispondi subito per non perdere l'iscrizione.</p>
      <p><a href="https://sportmatch.it/dashboard">Vai alla dashboard →</a></p>
    `,
  });
}

export async function sendLockedContactEmail({
  asdEmail,
  asdName,
  nextMonthLabel,
}: {
  asdEmail: string;
  asdName: string;
  nextMonthLabel: string;
}) {
  await resend.emails.send({
    from: "SportMatch <noreply@sportmatch.it>",
    to: asdEmail,
    subject: "Nuova richiesta in attesa — visibile il mese prossimo",
    html: `
      <p>Ciao ${escapeHtml(asdName)},</p>
      <p>Hai ricevuto una nuova richiesta di contatto tramite SportMatch, ma hai già raggiunto il <strong>limite di 3 contatti gratuiti</strong> per questo mese.</p>
      <p>La richiesta è salvata e ti arriverà automaticamente <strong>il 1° ${escapeHtml(nextMonthLabel)}</strong>, insieme alle altre in attesa (fino a 3 in totale).</p>
      <p><strong>Tieni presente che</strong> i genitori di solito contattano più società in parallelo. Se aspetti il mese prossimo, rischi che si affidino a un'altra ASD nel frattempo.</p>
      <p>Se vuoi rispondere subito, passa al piano <strong>Premium</strong> per sbloccare questa richiesta e ricevere contatti illimitati senza aspettare.</p>
      <p><a href="https://sportmatch.it/dashboard">Vai alla dashboard →</a></p>
      <p style="color:#888;font-size:12px;">Il limite gratuito si azzera il primo di ogni mese.</p>
    `,
  });
}
