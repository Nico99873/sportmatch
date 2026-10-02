import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SPORT_INFO } from "@/lib/sports";
import Header from "@/components/Header";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AreaPersonalePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login-genitore");
  if (session.user.role !== "PARENT") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      contactRequests: {
        orderBy: { createdAt: "desc" },
        include: {
          asd: { select: { id: true, name: true, sport: true } },
        },
      },
      reviews: {
        select: { asdId: true },
      },
    },
  });

  if (!user) redirect("/login-genitore");

  const reviewedAsdIds = new Set(user.reviews.map((r) => r.asdId));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sm-navy">Ciao, {user.name}</h1>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-sm-navy">Le tue richieste di contatto</h2>

          {user.contactRequests.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-zinc-500">Non hai ancora contattato nessuna società.</p>
              <a href="/" className="mt-3 inline-block text-sm font-medium text-sm-blue hover:underline">
                Cerca una società sportiva →
              </a>
            </div>
          ) : (
            <ul className="flex flex-col divide-y">
              {user.contactRequests.map((req) => {
                const sportInfo = SPORT_INFO[req.asd.sport];
                const alreadyReviewed = reviewedAsdIds.has(req.asd.id);
                return (
                  <li key={req.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{sportInfo.emoji}</span>
                          <a
                            href={`/asd/${req.asd.id}`}
                            className="truncate font-semibold text-sm-navy hover:underline"
                          >
                            {req.asd.name}
                          </a>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          {req.createdAt.toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {" · "}
                          {req.enrolleeType === "SELF"
                            ? req.enrolleeAge
                              ? `Iscrizione personale · ${req.enrolleeAge} anni`
                              : "Iscrizione personale"
                            : req.enrolleeAge
                            ? `Per il figlio/a · ${req.enrolleeAge} anni`
                            : "Per il figlio/a"}
                        </p>
                        <p className="mt-1.5 text-sm italic text-zinc-600 line-clamp-2">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {alreadyReviewed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            ✓ Recensita
                          </span>
                        ) : (
                          <a
                            href={`/asd/${req.asd.id}#recensione`}
                            className="inline-flex items-center gap-1 rounded-full bg-sm-blue/10 px-2.5 py-1 text-xs font-medium text-sm-blue hover:bg-sm-blue/20"
                          >
                            Lascia recensione
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
