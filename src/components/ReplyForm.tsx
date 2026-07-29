"use client";

import { useActionState } from "react";
import { replyToReview, type ReplyFormState } from "@/app/dashboard/actions";

const initialState: ReplyFormState = { ok: false, message: "" };

export default function ReplyForm({ reviewId }: { reviewId: string }) {
  const replyForReview = replyToReview.bind(null, reviewId);
  const [state, formAction, isPending] = useActionState(replyForReview, initialState);

  if (state.ok) {
    return <p className="text-xs text-green-700">✅ {state.message}</p>;
  }

  return (
    <form action={formAction} className="mt-2 flex flex-col gap-2">
      {!state.ok && state.message && <p className="text-xs text-red-600">{state.message}</p>}
      <textarea
        name="reply"
        required
        rows={2}
        placeholder="Scrivi una risposta pubblica a questa recensione..."
        className="input text-xs"
      />
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-sm-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-sm-navy disabled:opacity-60"
      >
        {isPending ? "Invio..." : "Rispondi"}
      </button>
    </form>
  );
}
