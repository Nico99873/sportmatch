import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asd = await prisma.asd.findUnique({ where: { id }, select: { photoUrl: true } });
  if (!asd?.photoUrl) return new NextResponse(null, { status: 404 });

  const blobRes = await fetch(asd.photoUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!blobRes.ok) return new NextResponse(null, { status: 404 });

  return new NextResponse(blobRes.body, {
    headers: {
      "Content-Type": blobRes.headers.get("Content-Type") ?? "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
