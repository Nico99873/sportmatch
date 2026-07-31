"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type RegisterUserFormState = {
  ok: boolean;
  message: string;
};

export async function registerUser(
  _prevState: RegisterUserFormState,
  formData: FormData
): Promise<RegisterUserFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { ok: false, message: "Compila tutti i campi obbligatori." };
  }
  if (password.length < 8) {
    return { ok: false, message: "La password deve avere almeno 8 caratteri." };
  }

  const existingAsd = await prisma.asd.findUnique({ where: { email } });
  const existingUser = existingAsd ? null : await prisma.user.findUnique({ where: { email } });
  if (existingAsd || existingUser) {
    return { ok: false, message: "Esiste già un account registrato con questa email." };
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, password: hashed },
  });

  redirect("/login-genitore?registered=1");
}
