"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitReview, type ReviewFormState } from "@/app/asd/[id]/actions";

const initialState: ReviewFormState = { ok: false, message: "" };

export default function ReviewForm({ asdId }: { asdId: string }) {
  const router = useRouter();
  const submitForAsd = submitReview.bind(null, asdId);
  const [state, formAction, isPending] = useActionState(submitForAsd, initialState);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  if (state.ok) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
        ✅ {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border bg-zinc-50 p-4">
      <h3 className="text-sm font-semibold text-sm-navy">Lascia una recensione</h3>

      {state.message && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{state.message}</p>}

      <div>
        <span className="mb-1 block text-xs font-medium text-zinc-600">Valutazione *</span>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1 text-2xl leading-none">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${n} stelle`}
              className={`transition ${(hoverRating || rating) >= n ? "text-sm-orange" : "text-zinc-300"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Commento *</label>
        <textarea
          name="comment"
          required
          rows={3}
          placeholder="Racconta la tua esperienza..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-sm-blue focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="self-start rounded-lg bg-sm-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-sm-navy disabled:opacity-60"
      >
        {isPending ? "Invio in corso..." : "Pubblica recensione"}
      </button>
    </form>
  );
}
