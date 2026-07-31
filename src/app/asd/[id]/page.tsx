import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SPORT_INFO } from "@/lib/sports";
import { summarizeAgeRange } from "@/lib/eligibility";
import Header from "@/components/Header";
import StarRating from "@/components/StarRating";
import ContactForm from "@/components/ContactForm";
import ReviewForm from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

type ReviewEligibility = "no_session" | "not_parent" | "not_contacted" | "already_reviewed" | "eligible";

export default async function AsdProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const asd = await prisma.asd.findUnique({
    where: { id },
    include: {
      reviews: { orderBy: { createdAt: "desc" } },
      categories: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!asd) notFound();

  await prisma.asd.update({ where: { id }, data: { profileViewCount: { increment: 1 } } });

  const info = SPORT_INFO[asd.sport];

  const reviewCount = asd.reviews.length;
  const realRating = reviewCount > 0 ? asd.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : null;

  const session = await auth();
  let reviewEligibility: ReviewEligibility = "no_session";
  if (session?.user) {
    if (session.user.role !== "PARENT") {
      reviewEligibility = "not_parent";
    } else {
      const [hasContacted, alreadyReviewed] = await Promise.all([
        prisma.contactRequest.findFirst({
          where: { asdId: asd.id, contactEmail: { equals: session.user.email ?? "", mode: "insensitive" } },
        }),
        prisma.review.findFirst({ where: { asdId: asd.id, userId: session.user.id } }),
      ]);
      reviewEligibility = alreadyReviewed ? "already_reviewed" : hasContacted ? "eligible" : "not_contacted";
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />

      <div
        className="flex h-40 items-end justify-between px-4 py-4 sm:h-52"
        style={{ background: `linear-gradient(135deg, ${info.color}cc, ${info.color})` }}
      >
        <div className="mx-auto flex w-full max-w-5xl items-end justify-between">
          <Link href="/" className="text-sm font-medium text-white/90 hover:text-white">
            ← Torna alla mappa
          </Link>
          <span className="text-6xl drop-shadow-sm sm:text-7xl">{info.emoji}</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-sm-navy">{asd.name}</h1>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: info.color }}
                >
                  {info.emoji} {info.label}
                </span>
                {asd.subscriptionPlan === "PREMIUM" && (
                  <span className="rounded-full bg-sm-blue/10 px-2.5 py-1 text-xs font-semibold text-sm-blue">
                    ✓ Società verificata
                  </span>
                )}
              </div>
              <div className="mb-3 flex items-center gap-2">
                {reviewCount > 0 ? (
                  <>
                    <StarRating rating={realRating as number} />
                    <span className="text-sm text-zinc-500">({reviewCount} recensioni)</span>
                  </>
                ) : (
                  <span className="text-sm text-zinc-500">Nessuna recensione ancora</span>
                )}
              </div>
              <p className="text-sm text-zinc-600">📍 {asd.address}</p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-sm-navy">Categorie e quote</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-zinc-400">
                      <th className="py-2 pr-3 font-medium">Categoria</th>
                      <th className="py-2 pr-3 font-medium">Età</th>
                      <th className="py-2 pr-3 font-medium">Orari</th>
                      <th className="py-2 font-medium">Quota annua</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asd.categories.map((c) => (
                      <tr key={c.id} className="border-b last:border-b-0">
                        <td className="py-2 pr-3 font-medium text-zinc-800">{c.name}</td>
                        <td className="py-2 pr-3 text-zinc-600">{summarizeAgeRange([c])}</td>
                        <td className="py-2 pr-3 text-zinc-600">{c.hours}</td>
                        <td className="py-2 text-zinc-600">{c.annualFee} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-sm-navy">Chi siamo</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">{asd.description}</p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-sm-navy">
                Recensioni ({asd.reviews.length})
              </h2>
              {asd.reviews.length === 0 ? (
                <p className="text-sm text-zinc-500">Ancora nessuna recensione.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {asd.reviews.map((r) => (
                    <li key={r.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-800">{r.authorName}</span>
                        <StarRating rating={r.rating} size="text-xs" />
                      </div>
                      <p className="text-sm italic text-zinc-600">&ldquo;{r.comment}&rdquo;</p>
                      {r.asdReply && (
                        <div className="mt-2 rounded-lg bg-zinc-50 p-2.5 text-xs text-zinc-600">
                          <span className="font-medium text-zinc-800">Risposta di {asd.name}: </span>
                          {r.asdReply}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 border-t pt-4">
                {reviewEligibility === "eligible" && <ReviewForm asdId={asd.id} />}
                {reviewEligibility === "already_reviewed" && (
                  <p className="text-sm text-zinc-500">Hai già lasciato una recensione per questa società.</p>
                )}
                {reviewEligibility === "not_contacted" && (
                  <p className="text-sm text-zinc-500">
                    Puoi recensire questa società solo dopo averla contattata tramite il modulo qui a fianco.
                  </p>
                )}
                {reviewEligibility === "not_parent" && (
                  <p className="text-sm text-zinc-500">Le recensioni sono riservate agli account genitore.</p>
                )}
                {reviewEligibility === "no_session" && (
                  <p className="text-sm text-zinc-500">
                    <Link href="/login-genitore" className="font-medium text-sm-blue">
                      Accedi
                    </Link>{" "}
                    come genitore per lasciare una recensione dopo aver contattato questa società.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border bg-white p-5 shadow-sm">
              <ContactForm asdId={asd.id} asdName={asd.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
