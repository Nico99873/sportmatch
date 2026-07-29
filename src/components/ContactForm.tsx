"use client";

import { useActionState, useState } from "react";
import { submitContactRequest, type ContactFormState } from "@/app/asd/[id]/actions";

const initialState: ContactFormState = { ok: false, message: "" };

export default function ContactForm({ asdId, asdName }: { asdId: string; asdName: string }) {
  const submitForAsd = submitContactRequest.bind(null, asdId);
  const [state, formAction, isPending] = useActionState(submitForAsd, initialState);
  const [enrolleeType, setEnrolleeType] = useState<"SELF" | "CHILD">("CHILD");

  if (state.ok) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        ✅ {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-sm-navy">Richiedi informazioni a {asdName}</h3>

      {!state.ok && state.message && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <div>
        <span className="mb-1 block text-xs font-medium text-zinc-600">Chi si iscrive?</span>
        <div className="flex gap-2">
          <input type="hidden" name="enrolleeType" value={enrolleeType} />
          <button
            type="button"
            onClick={() => setEnrolleeType("SELF")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              enrolleeType === "SELF" ? "border-sm-blue bg-sm-blue text-white" : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Mi iscrivo io
          </button>
          <button
            type="button"
            onClick={() => setEnrolleeType("CHILD")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              enrolleeType === "CHILD" ? "border-sm-blue bg-sm-blue text-white" : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Iscrivo mio figlio/a
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Il tuo nome *</label>
        <input
          name="contactName"
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-sm-blue focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Email *</label>
          <input
            type="email"
            name="contactEmail"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-sm-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Telefono *</label>
          <input
            type="tel"
            name="contactPhone"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-sm-blue focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">
          {enrolleeType === "SELF" ? "La tua età" : "Età di tuo figlio/a"}
        </label>
        <input
          type="number"
          name="enrolleeAge"
          min={0}
          max={99}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-sm-blue focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Messaggio *</label>
        <textarea
          name="message"
          required
          rows={3}
          placeholder={
            enrolleeType === "SELF"
              ? "Ciao, vorrei iscrivermi al corso..."
              : "Ciao, vorrei iscrivere mio figlio/a al corso..."
          }
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-sm-blue focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 rounded-lg bg-sm-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sm-navy disabled:opacity-60"
      >
        {isPending ? "Invio in corso..." : "Invia richiesta di contatto"}
      </button>
      <p className="text-center text-[11px] text-zinc-400">
        La società riceverà i tuoi dati per ricontattarti. Nessun costo per te.
      </p>
    </form>
  );
}
