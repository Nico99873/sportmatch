import { prisma } from "@/lib/prisma";
import HomeExplorer from "@/components/HomeExplorer";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function Home() {
  const asds = await prisma.asd.findMany({
    include: {
      _count: { select: { reviews: true } },
      categories: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  const data = asds.map((a) => ({
    id: a.id,
    name: a.name,
    sport: a.sport,
    lat: a.lat,
    lon: a.lon,
    rating: a.rating,
    reviewCount: a._count.reviews,
    address: a.address,
    subscriptionPlan: a.subscriptionPlan,
    categories: a.categories.map((c) => ({
      id: c.id,
      name: c.name,
      ageMin: c.ageMin,
      ageMax: c.ageMax,
      hours: c.hours,
      annualFee: c.annualFee,
    })),
  }));

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      <HomeExplorer asds={data} />
    </div>
  );
}
