"use client";

import { useActionState, useState, useRef } from "react";
import { registerAsd, type RegisterFormState } from "@/app/registrati/actions";
import { SPORTS, SPORT_INFO } from "@/lib/sports";
import { geocodePlace } from "@/lib/geocode";

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [geocodeStatus, setGeocodeStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleAddressBlur(e: React.FocusEvent<HTMLInputElement>) {
    const address = e.target.value.trim();
    if (address.length < 5) return;
    setGeocodeStatus("loading");
    try {
      const result = await geocodePlace(address);
      setLat(result.lat);
      setLon(result.lon);
      setGeocodeStatus("ok");
    } catch {
      setGeocodeStatus("error");
    }
  }

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
        <select
          name="sport"
          required
          defaultValue=""
          className="input"
          onChange={(e) => setSelectedSport(e.target.value)}
        >
          <option value="" disabled>Seleziona uno sport</option>
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {SPORT_INFO[s].emoji} {SPORT_INFO[s].label}
            </option>
          ))}
        </select>
      </Field>

      {selectedSport === "ALTRO" && (
        <Field label="Specifica lo sport *">
          <input name="sportCustomLabel" required placeholder="Es. Ginnastica ritmica, Rugby..." className="input" />
        </Field>
      )}

      <div>
        <Field label="Indirizzo *">
          <input
            name="address"
            required
            placeholder="Via, città, provincia"
            className="input"
            onBlur={handleAddressBlur}
          />
        </Field>
        {geocodeStatus === "loading" && (
          <p className="mt-1 text-xs text-zinc-400">📍 Ricerca posizione...</p>
        )}
        {geocodeStatus === "ok" && (
          <p className="mt-1 text-xs text-green-600">📍 Posizione trovata</p>
        )}
        {geocodeStatus === "error" && (
          <p className="mt-1 text-xs text-red-500">Indirizzo non trovato — prova con una formulazione più semplice (es. "Via Roma 1, Milano")</p>
        )}
      </div>

      <input type="hidden" name="lat" value={lat ?? ""} />
      <input type="hidden" name="lon" value={lon ?? ""} />

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

      <Field label="Foto (opzionale)">
        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={handlePhotoChange}
          className="input"
        />
        {photoPreview && (
          <img src={photoPreview} alt="Anteprima foto" className="mt-2 h-24 w-24 rounded-lg object-cover" />
        )}
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
