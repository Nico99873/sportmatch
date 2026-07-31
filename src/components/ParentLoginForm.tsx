"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function ParentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const res = await signIn("credentials", { email, password, redirect: false });

    setIsPending(false);
    if (res?.error) {
      setError("Email o password non corrette.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {justRegistered && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Account creato! Accedi con le credenziali appena scelte.
        </p>
      )}
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-zinc-600">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-sm-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sm-navy disabled:opacity-60"
        >
          {isPending ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>
    </>
  );
}
