import Link from "next/link";
import { auth } from "@/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 bg-sm-navy text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-1 text-lg font-semibold whitespace-nowrap">
          Sport<span className="text-sm-orange">Match</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/come-funziona" className="hidden px-2 py-1.5 transition hover:text-sm-orange sm:inline">
            Come funziona
          </Link>
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-sm-orange px-3 py-1.5 font-medium text-white transition hover:brightness-95"
            >
              La mia dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/registrati"
                className="rounded-full border border-white/30 px-3 py-1.5 transition hover:bg-white/10"
              >
                Sei un&apos;ASD?
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-sm-orange px-3 py-1.5 font-medium text-white transition hover:brightness-95"
              >
                Accedi
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
