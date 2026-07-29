"use client";

import { useActionState, useState } from "react";
import { registerAsd, type RegisterFormState } from "@/app/registrati/actions";
import { SPORTS, SPORT_INFO } from "@/lib/sports";
import { BASSANO_CENTER } from "@/lib/geo";

const initialState: RegisterFormState = { ok: false, message: "" };

type CategoryDraft = {
  name: string;
  ageMin: string;
  ageMax: string;
  hours: string;
  annualFee: string;
};

function emptyCategory(): CategoryDraft {
  return { name: "", ageMin: "", ageMax: "", hours: "", annualFee: "" };
}

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAsd, initialState);
  const [categories, setCategories] = useState<CategoryDraft[]>([emptyCategory()]);

  function updateCategory(index: number, field: keyof CategoryDraft, value: string) {
    setCategories((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function addCategory() {
    setCategories((prev) => [...prev, emptyCategory()]);
  }

  function removeCategory(index: number) {
    setCategories((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {!state.ok && state.message && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      )}

      <Field label="Nome società *">
        <input name="name" required className="input" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Email (per accedere) *">
          <input type="email" name="email" required className="input" />
        </Field>
        <Field label="Password (min. 8 caratteri) *">
          <input type="password" name="password" required minLength={8} className="input" />
        </Field>
      </div>

      <Field label="Sport *">
        <select name="sport" required defaultValue="" className="input">
          <option value="" disabled>
            Seleziona uno sport
          </option>
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {SPORT_INFO[s].emoji} {SPORT_INFO[s].label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Indirizzo *">
        <input name="address" required placeholder="Via, città, provincia" className="input" />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Latitudine *" hint="Posizione sulla mappa, regolabile">
          <input
            type="number"
            step="0.0001"
            name="lat"
            required
            defaultValue={BASSANO_CENTER.lat}
            className="input"
          />
        </Field>
        <Field label="Longitudine *">
          <input
            type="number"
            step="0.0001"
            name="lon"
            required
            defaultValue={BASSANO_CENTER.lon}
            className="input"
          />
        </Field>
      </div>

      <div>
        <span className="mb-1 block text-xs font-medium text-zinc-600">Categorie *</span>
        <p className="mb-2 text-[11px] text-zinc-400">
          Aggiungi una categoria per ogni gruppo con orari o quota diversi (es. per fascia d&apos;età, anno di
          nascita o livello). Lascia età min/max vuote se la categoria è aperta a tutte le età.
        </p>
        <input type="hidden" name="categoriesJson" value={JSON.stringify(categories)} />

        <div className="flex flex-col gap-3">
          {categories.map((cat, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Categoria {i + 1}</span>
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCategory(i)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Rimuovi
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-600">Nome categoria *</span>
                  <input
                    value={cat.name}
                    onChange={(e) => updateCategory(i, "name", e.target.value)}
                    placeholder="Es. Pulcini, Under 10, Agonistica..."
                    required
                    className="input"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-600">Orari *</span>
                  <input
                    value={cat.hours}
                    onChange={(e) => updateCategory(i, "hours", e.target.value)}
                    placeholder="Es. Mar/Gio/Sab 16:30-19:00"
                    required
                    className="input"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-600">Età minima</span>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={cat.ageMin}
                    onChange={(e) => updateCategory(i, "ageMin", e.target.value)}
                    className="input"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-zinc-600">Età massima</span>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={cat.ageMax}
                    onChange={(e) => updateCategory(i, "ageMax", e.target.value)}
                    className="input"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-medium text-zinc-600">Quota annua (€) *</span>
                  <input
                    type="number"
                    min={0}
                    value={cat.annualFee}
                    onChange={(e) => updateCategory(i, "annualFee", e.target.value)}
                    required
                    className="input"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCategory}
          className="mt-2 rounded-lg border border-dashed border-sm-blue px-3 py-1.5 text-xs font-medium text-sm-blue hover:bg-sm-blue/5"
        >
          + Aggiungi categoria
        </button>
      </div>

      <Field label="Descrizione *">
        <textarea name="description" required rows={4} placeholder="Racconta la tua società..." className="input" />
      </Field>

      <Field label="URL foto (opzionale)" hint="Il caricamento file arriverà in una prossima versione">
        <input name="photoUrl" placeholder="https://..." className="input" />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-lg bg-sm-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {isPending ? "Creazione profilo..." : "Crea profilo società"}
      </button>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-600">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-[11px] text-zinc-400">{hint}</span>}
    </label>
  );
}
