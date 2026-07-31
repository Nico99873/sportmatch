"use client";

import { useActionState } from "react";
import { registerUser, type RegisterUserFormState } from "@/app/registrati-genitore/actions";

const initialState: RegisterUserFormState = { ok: false, message: "" };

export default function ParentRegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {!state.ok && state.message && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      )}

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">Nome *</span>
        <input name="name" required className="input" />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">Email *</span>
        <input type="email" name="email" required className="input" />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">Password (min. 8 caratteri) *</span>
        <input type="password" name="password" required minLength={8} className="input" />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-sm-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sm-navy disabled:opacity-60"
      >
        {isPending ? "Creazione account..." : "Crea account"}
      </button>
    </form>
  );
}
