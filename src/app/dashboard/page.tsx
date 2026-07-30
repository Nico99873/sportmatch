import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FREE_PLAN_CONTACT_LIMIT, hasUnlimitedContacts, countContactsThisMonth, markLockedContacts } from "@/lib/contact";
import { PLAN_INFO, PLAN_ORDER } from "@/lib/plans";
import { SPORT_INFO } from "@/lib/sports";
import Header from "@/components/Header";
import SignOutButton from "@/components/SignOutButton";
import ReplyForm from "@/components/ReplyForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const asd = await prisma.asd.findUnique({
    where: { id: session.user.id },
    include: {
      contactRequests: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!asd) redirect("/login");

  const contactsThisMonth = await countContactsThisMonth(asd.id);
  const unlimited = hasUnlimitedContacts(asd.subscriptionPlan);
  const info = SPORT_INFO[asd.sport];
  const plan = PLAN_INFO[asd.subscriptionPlan];

  const contactsWithLock = markLockedContacts(asd.contactRequests, asd.subscriptionPlan);
  const lockedCount = contactsWithLock.filter((c) => c.locked).length;
  const visibleContacts = contactsWithLock.slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sm-navy">{asd.name}</h1>
            <p className="text-sm text-zinc-500">
              {info.emoji} {info.label} · Piano <span className="font-semibold">{plan.label}</span>
              {asd.subscriptionPlan === "PREMIUM" && (
                <span className="ml-2 rounded-full bg-sm-blue/10 px-2 py-0.5 text-xs font-medium text-sm-blue">
                  ✓ Società verificata
                </span>
              )}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Contatti questo mese" value={String(contactsThisMonth)} />
          {unlimited ? (
            <>
              <StatCard label="Contatti" value="Illimitati" sub="incluso nel tuo piano" />
              <StatCard label="Visualizzazioni profilo" value={String(asd.profileViewCount)} />
            </>
          ) : (
            <StatCard
              label="Contatti gratuiti rimasti"
              value={String(Math.max(0, FREE_PLAN_CONTACT_LIMIT - contactsThisMonth))}
              sub={`su ${FREE_PLAN_CONTACT_LIMIT} inclusi al mese`}
            />
          )}
        </div>

        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-sm-navy">Ultime richieste di contatto</h2>

          {lockedCount > 0 && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-sm-orange/40 bg-sm-orange/5 p-3">
              <p className="text-sm text-zinc-700">
                🔒 Hai <strong>{lockedCount}</strong> {lockedCount === 1 ? "richiesta in attesa" : "richieste in attesa"} —
                passa al piano Base per visualizzarle.
              </p>
            </div>
          )}

          {visibleContacts.length === 0 ? (
            <p className="text-sm text-zinc-500">Nessuna richiesta ricevuta ancora.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {visibleContacts.map((c) =>
                c.locked ? (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-sm font-medium text-zinc-400">Richiesta in attesa</span>
                      <p className="text-xs text-zinc-400">
                        Ricevuta il {c.createdAt.toLocaleDateString("it-IT")} · contenuto bloccato
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                      🔒 Piano Base
                    </span>
                  </li>
                ) : (
                  <li key={c.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-zinc-800">{c.contactName}</span>
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
                )
              )}
            </ul>
          )}
        </div>

        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-sm-navy">Recensioni ({asd.reviews.length})</h2>
          {asd.reviews.length === 0 ? (
            <p className="text-sm text-zinc-500">Ancora nessuna recensione.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {asd.reviews.map((r) => (
                <li key={r.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-800">{r.authorName}</span>
                    <span className="text-xs text-zinc-400">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="mb-2 text-sm italic text-zinc-600">&ldquo;{r.comment}&rdquo;</p>
                  {r.asdReply ? (
                    <div className="rounded-lg bg-zinc-50 p-2 text-xs text-zinc-600">
                      <span className="font-medium text-zinc-800">La tua risposta: </span>
                      {r.asdReply}
                    </div>
                  ) : asd.subscriptionPlan === "PREMIUM" ? (
                    <ReplyForm reviewId={r.id} />
                  ) : (
                    <p className="text-xs text-zinc-400">
                      Rispondere alle recensioni è disponibile con il piano Premium.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-sm-navy">Il tuo piano</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLAN_ORDER.map((planKey) => {
              const info = PLAN_INFO[planKey];
              const isCurrent = planKey === asd.subscriptionPlan;
              const isUpgrade = PLAN_ORDER.indexOf(planKey) > PLAN_ORDER.indexOf(asd.subscriptionPlan);
              return (
                <div
                  key={planKey}
                  className={`flex flex-col rounded-xl border-2 p-4 ${
                    isCurrent ? "border-sm-blue bg-sm-blue/5" : "border-zinc-200"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold text-sm-navy">{info.label}</span>
                    {isCurrent && (
                      <span className="rounded-full bg-sm-blue px-2 py-0.5 text-[11px] font-medium text-white">
                        Attivo
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-sm font-medium text-zinc-800">{info.priceLabel}</p>
                  <ul className="mb-4 flex flex-1 flex-col gap-1.5 text-xs text-zinc-600">
                    {info.benefits.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                  {isUpgrade && (
                    <button
                      disabled
                      title="Pagamenti non ancora disponibili in questo prototipo"
                      className="cursor-not-allowed rounded-lg bg-sm-orange px-3 py-2 text-xs font-semibold text-white opacity-60"
                    >
                      Passa a {info.label} (placeholder pagamento)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
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
