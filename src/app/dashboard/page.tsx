import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FREE_PLAN_CONTACT_LIMIT, hasUnlimitedContacts, countViewsThisMonth } from "@/lib/contact";
import { PLAN_INFO, PLAN_ORDER } from "@/lib/plans";
import { SPORT_INFO } from "@/lib/sports";
import Header from "@/components/Header";
import SignOutButton from "@/components/SignOutButton";
import ReplyForm from "@/components/ReplyForm";
import StarRating from "@/components/StarRating";
import ContactList from "@/components/ContactList";
import UpgradeButton from "@/components/UpgradeButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ASD") redirect("/");

  const asd = await prisma.asd.findUnique({
    where: { id: session.user.id },
    include: {
      contactRequests: { orderBy: { createdAt: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!asd) redirect("/login");

  const viewsUsed = await countViewsThisMonth(asd.id);
  const unlimited = hasUnlimitedContacts(asd.subscriptionPlan);

  // Strip sensitive fields from contacts not yet opened — prevents data leak via client serialization
  const safeContacts = asd.contactRequests.map((c) =>
    c.viewedAt !== null
      ? c
      : { id: c.id, createdAt: c.createdAt, viewedAt: null, contactName: null, contactEmail: null, contactPhone: null, enrolleeType: c.enrolleeType, enrolleeAge: null, message: null }
  );
  const info = SPORT_INFO[asd.sport];
  const plan = PLAN_INFO[asd.subscriptionPlan];

  const reviewCount = asd.reviews.length;
  const realRating = reviewCount > 0 ? asd.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;

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
            <div className="mt-1 flex items-center gap-2">
              {reviewCount > 0 ? (
                <>
                  <StarRating rating={realRating as number} size="text-xs" />
                  <span className="text-xs text-zinc-500">({reviewCount} recensioni)</span>
                </>
              ) : (
                <span className="text-xs text-zinc-500">Nessuna recensione ancora</span>
              )}
            </div>
          </div>
          <SignOutButton />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Richieste ricevute" value={String(asd.contactRequests.length)} />
          {unlimited ? (
            <>
              <StatCard label="Letture contatti" value="Illimitate" sub="incluso nel tuo piano" />
              <StatCard label="Visualizzazioni profilo" value={String(asd.profileViewCount)} />
            </>
          ) : (
            <StatCard
              label="Letture rimaste questo mese"
              value={String(Math.max(0, FREE_PLAN_CONTACT_LIMIT - viewsUsed))}
              sub={`su ${FREE_PLAN_CONTACT_LIMIT} incluse al mese`}
              highlight={Math.max(0, FREE_PLAN_CONTACT_LIMIT - viewsUsed) === 0}
            />
          )}
        </div>

        <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-sm-navy">Richieste di contatto</h2>
          <ContactList
            contacts={safeContacts}
            initialViewsUsed={viewsUsed}
            unlimited={unlimited}
            limit={FREE_PLAN_CONTACT_LIMIT}
          />
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
                    <UpgradeButton planKey={planKey} planLabel={info.label} />
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

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${highlight ? "border-red-200 bg-red-50" : "bg-white"}`}>
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? "text-red-600" : "text-sm-navy"}`}>{value}</div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
