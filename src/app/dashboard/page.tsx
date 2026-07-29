import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FREE_CONTACTS_PER_MONTH, PRICE_PER_EXTRA_CONTACT, countContactsThisMonth } from "@/lib/contact";
import { SPORT_INFO } from "@/lib/sports";
import Header from "@/components/Header";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const asd = await prisma.asd.findUnique({
    where: { id: session.user.id },
    include: { contactRequests: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!asd) redirect("/login");

  const contactsThisMonth = await countContactsThisMonth(asd.id);
  const billableCount = Math.max(0, contactsThisMonth - FREE_CONTACTS_PER_MONTH);
  const estimatedCost = billableCount * PRICE_PER_EXTRA_CONTACT;
  const info = SPORT_INFO[asd.sport];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sm-navy">{asd.name}</h1>
            <p className="text-sm text-zinc-500">
              {info.emoji} {info.label} · Piano{" "}
              <span className="font-semibold">{asd.subscriptionPlan === "PREMIUM" ? "Premium" : "Base (gratuito)"}</span>
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Contatti questo mese" value={String(contactsThisMonth)} />
          <StatCard
            label="Contatti gratuiti rimasti"
            value={String(Math.max(0, FREE_CONTACTS_PER_MONTH - contactsThisMonth))}
            sub={`su ${FREE_CONTACTS_PER_MONTH} inclusi`}
          />
          <StatCard
            label="Costo extra stimato"
            value={`${estimatedCost} €`}
            sub={billableCount > 0 ? `${billableCount} contatti a ${PRICE_PER_EXTRA_CONTACT}€` : "nessun costo questo mese"}
          />
        </div>

        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-sm-navy">Ultime richieste di contatto</h2>
          {asd.contactRequests.length === 0 ? (
            <p className="text-sm text-zinc-500">Nessuna richiesta ricevuta ancora.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {asd.contactRequests.map((c) => (
                <li key={c.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-800">{c.contactName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        c.status === "BILLABLE" ? "bg-sm-orange/10 text-sm-orange" : "bg-green-50 text-green-700"
                      }`}
                    >
                      {c.status === "BILLABLE" ? `Fatturabile (${PRICE_PER_EXTRA_CONTACT}€)` : "Incluso"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {c.contactEmail} · {c.contactPhone}
                    {c.enrolleeType === "SELF"
                      ? c.enrolleeAge
                        ? ` · si iscrive lui/lei stesso/a, ${c.enrolleeAge} anni`
                        : " · si iscrive lui/lei stesso/a"
                      : c.enrolleeAge
                        ? ` · iscrive un/una figlio/a di ${c.enrolleeAge} anni`
                        : " · iscrive un/una figlio/a"}
                  </p>
                  <p className="text-sm text-zinc-600">{c.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border-2 border-dashed border-sm-orange/40 bg-sm-orange/5 p-5">
          <h2 className="mb-1 text-lg font-semibold text-sm-navy">Passa a SportMatch Premium</h2>
          <p className="mb-3 text-sm text-zinc-600">
            Visibilità extra nella mappa e nelle ricerche, badge Premium sul profilo e analytics sulle visite e i
            contatti ricevuti.
          </p>
          <p className="mb-4 text-sm font-medium text-zinc-800">
            29 € il primo anno · poi 49 €/anno al rinnovo
          </p>
          <button
            disabled
            title="Pagamenti non ancora disponibili in questo prototipo"
            className="cursor-not-allowed rounded-lg bg-sm-orange px-4 py-2.5 text-sm font-semibold text-white opacity-60"
          >
            Passa a Premium (placeholder pagamento)
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</div>
      <div className="text-2xl font-bold text-sm-navy">{value}</div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
