import Header from "@/components/Header";
import ParentRegisterForm from "@/components/ParentRegisterForm";

export default function RegistratiGenitorePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <div className="mx-auto w-full max-w-sm flex-1 px-4 py-12">
        <h1 className="mb-1 text-xl font-bold text-sm-navy">Crea il tuo account</h1>
        <p className="mb-6 text-sm text-zinc-600">
          Registrati per contattare le società sportive e lasciare recensioni.
        </p>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <ParentRegisterForm />
        </div>

        <p className="mt-4 text-center text-sm text-zinc-500">
          Hai già un account?{" "}
          <a href="/login-genitore" className="font-medium text-sm-blue">
            Accedi
          </a>
        </p>
      </div>
    </div>
  );
}
