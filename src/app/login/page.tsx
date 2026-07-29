import { Suspense } from "react";
import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <div className="mx-auto w-full max-w-sm flex-1 px-4 py-12">
        <h1 className="mb-1 text-xl font-bold text-sm-navy">Area riservata ASD</h1>
        <p className="mb-6 text-sm text-zinc-600">Accedi per gestire il tuo profilo e le richieste di contatto.</p>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Non hai ancora un profilo?{" "}
          <a href="/registrati" className="font-medium text-sm-blue">
            Registra la tua ASD
          </a>
        </p>
      </div>
    </div>
  );
}
