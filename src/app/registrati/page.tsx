import Header from "@/components/Header";
import RegisterForm from "@/components/RegisterForm";

export default function RegistratiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-sm-navy">Registra la tua ASD su SportMatch</h1>
        <p className="mb-6 text-sm text-zinc-600">
          Profilo base gratuito. Ricevi fino a 3 richieste di contatto al mese — dal 4° in poi vengono messe in coda per il mese successivo.
          Visibilità extra e contatti illimitati con l&apos;abbonamento Premium.
        </p>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
