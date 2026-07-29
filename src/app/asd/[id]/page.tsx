import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SPORT_INFO } from "@/lib/sports";
import { summarizeAgeRange } from "@/lib/eligibility";
import Header from "@/components/Header";
import StarRating from "@/components/StarRating";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

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

  const info = SPORT_INFO[asd.sport];

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
              </div>
              <div className="mb-3 flex items-center gap-2">
                <StarRating rating={asd.rating} />
                <span className="text-sm text-zinc-500">({asd.reviews.length} recensioni)</span>
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
                    </li>
                  ))}
                </ul>
              )}
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
