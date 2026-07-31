import { Suspense } from "react";
import Header from "@/components/Header";
import ParentLoginForm from "@/components/ParentLoginForm";

export default function LoginGenitorePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <div className="mx-auto w-full max-w-sm flex-1 px-4 py-12">
        <h1 className="mb-1 text-xl font-bold text-sm-navy">Accedi</h1>
        <p className="mb-6 text-sm text-zinc-600">Accedi per contattare le società sportive e lasciare recensioni.</p>

        <Suspense fallback={null}>
          <ParentLoginForm />
        </Suspense>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Non hai ancora un account?{" "}
          <a href="/registrati-genitore" className="font-medium text-sm-blue">
            Registrati
          </a>
        </p>
      </div>
    </div>
  );
}
