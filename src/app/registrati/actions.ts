"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SPORTS } from "@/lib/sports";
import type { Sport } from "@prisma/client";

export type RegisterFormState = {
  ok: boolean;
  message: string;
};

type RawCategory = {
  name: string;
  ageMin: string;
  ageMax: string;
  hours: string;
  annualFee: string;
};

type ParsedCategory = {
  name: string;
  ageMin: number | null;
  ageMax: number | null;
  hours: string;
  annualFee: number;
};

function parseCategories(raw: string): ParsedCategory[] | { error: string } {
  let items: RawCategory[];
  try {
    items = JSON.parse(raw);
  } catch {
    return { error: "Categorie non valide." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Aggiungi almeno una categoria." };
  }

  const parsed: ParsedCategory[] = [];
  for (const item of items) {
    const name = String(item.name ?? "").trim();
    const hours = String(item.hours ?? "").trim();
    const annualFee = Number(item.annualFee);
    const ageMinRaw = String(item.ageMin ?? "").trim();
    const ageMaxRaw = String(item.ageMax ?? "").trim();
    const ageMin = ageMinRaw ? Number(ageMinRaw) : null;
    const ageMax = ageMaxRaw ? Number(ageMaxRaw) : null;

    if (!name || !hours) {
      return { error: "Ogni categoria richiede un nome e degli orari." };
    }
    if (Number.isNaN(annualFee) || annualFee < 0) {
      return { error: `Quota annuale non valida per la categoria "${name}".` };
    }
    if (ageMin != null && Number.isNaN(ageMin)) {
      return { error: `Età minima non valida per la categoria "${name}".` };
    }
    if (ageMax != null && Number.isNaN(ageMax)) {
      return { error: `Età massima non valida per la categoria "${name}".` };
    }
    if (ageMin != null && ageMax != null && ageMin > ageMax) {
      return { error: `Intervallo di età non valido per la categoria "${name}".` };
    }

    parsed.push({ name, ageMin, ageMax, hours, annualFee });
  }

  return parsed;
}

export async function registerAsd(
  _prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const sport = String(formData.get("sport") ?? "") as Sport;
  const address = String(formData.get("address") ?? "").trim();
  const lat = Number(formData.get("lat"));
  const lon = Number(formData.get("lon"));
  const description = String(formData.get("description") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const categoriesJson = String(formData.get("categoriesJson") ?? "");

  if (!name || !email || !password || !address || !description) {
    return { ok: false, message: "Compila tutti i campi obbligatori." };
  }
  if (!SPORTS.includes(sport)) {
    return { ok: false, message: "Seleziona uno sport valido." };
  }
  if (password.length < 8) {
    return { ok: false, message: "La password deve avere almeno 8 caratteri." };
  }
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return { ok: false, message: "Coordinate non valide." };
  }

  const categories = parseCategories(categoriesJson);
  if ("error" in categories) {
    return { ok: false, message: categories.error };
  }

  const existing = await prisma.asd.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, message: "Esiste già una società registrata con questa email." };
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.asd.create({
    data: {
      name,
      email,
      password: hashed,
      sport,
      address,
      lat,
      lon,
      description,
      photoUrl: photoUrl || null,
      categories: {
        create: categories,
      },
    },
  });

  redirect("/login?registered=1");
}
