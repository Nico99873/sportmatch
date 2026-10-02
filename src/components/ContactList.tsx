"use client";

import { useState, useTransition } from "react";
import { openContactRequest } from "@/app/dashboard/actions";

type Contact = {
  id: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  enrolleeType: "SELF" | "CHILD";
  enrolleeAge: number | null;
  message: string;
  viewedAt: Date | null;
  createdAt: Date;
};

type Props = {
  contacts: Contact[];
  initialViewsUsed: number;
  unlimited: boolean;
  limit: number;
};

export default function ContactList({ contacts, initialViewsUsed, unlimited, limit }: Props) {
  const [viewsUsed, setViewsUsed] = useState(initialViewsUsed);
  const [opened, setOpened] = useState<Map<string, Contact>>(() => {
    const m = new Map<string, Contact>();
    for (const c of contacts) {
      if (c.viewedAt !== null) m.set(c.id, c);
    }
    return m;
  });
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const remaining = unlimited ? Infinity : Math.max(0, limit - viewsUsed);
  const quotaExhausted = !unlimited && remaining === 0;

  function handleOpen(contactId: string) {
    setPendingId(contactId);
    startTransition(async () => {
      const result = await openContactRequest(contactId);
      if (result.ok) {
        setOpened((prev) => new Map(prev).set(contactId, result.contact as Contact));
        const wasNew = contacts.find((c) => c.id === contactId)?.viewedAt === null;
        if (wasNew) setViewsUsed((v) => v + 1);
      }
      setPendingId(null);
    });
  }

  if (contacts.length === 0) {
    return <p className="text-sm text-zinc-500">Nessuna richiesta ricevuta ancora.</p>;
  }

  return (
    <div>
      {/* Counter chip */}
      {!unlimited && (
        <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
          remaining === 0
            ? "bg-red-100 text-red-700"
            : remaining === 1
            ? "bg-amber-100 text-amber-700"
            : "bg-green-100 text-green-700"
        }`}>
          {remaining === 0
            ? "🔒 Limite mensile raggiunto"
            : `👁 ${remaining} ${remaining === 1 ? "lettura rimasta" : "letture rimaste"} questo mese`}
        </div>
      )}

      <ul className="flex flex-col divide-y">
        {contacts.map((c) => {
          const isOpened = opened.has(c.id);
          const data = opened.get(c.id);
          const isLocked = !unlimited && !isOpened && quotaExhausted;
          const isLoading = pendingId === c.id && isPending;

          return (
            <li key={c.id} className="relative py-4 first:pt-0 last:pb-0">
              {/* Header row */}
              <div className="mb-1 flex items-center justify-between gap-2">
                <div>
                  {isOpened ? (
                    <span className="text-sm font-semibold text-zinc-800">{data!.contactName}</span>
                  ) : (
                    <span className="text-sm font-medium text-zinc-400 blur-[3px] select-none">
                      Nome nascosto
                    </span>
                  )}
                  <span className="ml-2 text-xs text-zinc-400">
                    {c.createdAt.toLocaleDateString("it-IT", { day: "numeric", month: "long" })}
                  </span>
                </div>

                {!isOpened && !isLocked && (
                  <button
                    onClick={() => handleOpen(c.id)}
                    disabled={isLoading}
                    className="shrink-0 rounded-lg bg-sm-blue px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sm-navy disabled:opacity-50"
                  >
                    {isLoading ? "Apertura…" : "Apri →"}
                  </button>
                )}
              </div>

              {/* Contact details (after opening) */}
              {isOpened && data && (
                <div className="rounded-lg bg-zinc-50 p-3 text-sm">
                  <p className="text-zinc-500">
                    <span className="font-medium text-zinc-700">{data.contactEmail}</span>
                    {" · "}
                    <span className="font-medium text-zinc-700">{data.contactPhone}</span>
                  </p>
                  <p className="mt-0.5 text-zinc-500">
                    {data.enrolleeType === "SELF"
                      ? data.enrolleeAge ? `Si iscrive personalmente · ${data.enrolleeAge} anni` : "Si iscrive personalmente"
                      : data.enrolleeAge ? `Iscrive un figlio/a · ${data.enrolleeAge} anni` : "Iscrive un figlio/a"}
                  </p>
                  <p className="mt-2 text-zinc-700 italic">&ldquo;{data.message}&rdquo;</p>
                </div>
              )}

              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-[2px]">
                  <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-500">
                    🔒 Limite mensile raggiunto
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
