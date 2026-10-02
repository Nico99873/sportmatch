"use client";

import { useState, useTransition } from "react";
import { requestPlanUpgrade } from "@/app/dashboard/actions";

export default function UpgradeButton({ planKey, planLabel }: { planKey: string; planLabel: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (result?.ok) {
    return (
      <div className="rounded-lg bg-green-50 px-3 py-2 text-center text-xs font-medium text-green-700">
        ✓ {result.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={() =>
          startTransition(async () => {
            const res = await requestPlanUpgrade(planKey);
            setResult(res);
          })
        }
        disabled={isPending}
        className="rounded-lg bg-sm-orange px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {isPending ? "Invio richiesta…" : `Passa a ${planLabel}`}
      </button>
      {result && !result.ok && (
        <p className="text-center text-xs text-red-600">{result.message}</p>
      )}
    </div>
  );
}
