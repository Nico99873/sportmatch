import Link from "next/link";
import Header from "@/components/Header";
import { PLAN_INFO, PLAN_ORDER } from "@/lib/plans";

export const metadata = {
  title: "Come funziona — SportMatch",
  description:
    "Come funziona SportMatch per le famiglie che cercano una società sportiva e per le ASD che vogliono farsi trovare.",
};

export default function ComeFunzionaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />

      <div className="bg-sm-blue px-4 py-10 text-center text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">Come funziona SportMatch</h1>
        <p className="mt-2 text-sm text-white/90 sm:text-base">Trova la società sportiva giusta, su mappa</p>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10">
        {/* Famiglie */}
        <section>
          <h2 className="mb-1 text-xl font-bold text-sm-navy">Per le famiglie</h2>
          <p className="mb-5 text-sm text-zinc-600">Gratuito, senza account, senza limiti.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StepCard
              icon="🔍"
              step="1"
              title="Cerca"
              text="Apri la mappa, filtra per sport ed età, oppure cerca una città o zona diversa dalla tua."
            />
            <StepCard
              icon="⚖️"
              step="2"
              title="Confronta"
              text="Guarda orari, quote per fascia d'età, recensioni di altri genitori e distanza da casa."
            />
            <StepCard
              icon="✉️"
              step="3"
              title="Contatta"
              text="Invia una richiesta direttamente dalla scheda della società: è gratuita e la società ti risponde via email o telefono."
            />
          </div>
        </section>

        {/* ASD */}
        <section>
          <h2 className="mb-1 text-xl font-bold text-sm-navy">Per le ASD</h2>
          <p className="mb-5 text-sm text-zinc-600">Profilo base sempre gratuito.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StepCard
              icon="📝"
              step="1"
              title="Crea il profilo"
              text="Registra la tua società con indirizzo, categorie (età, orari, quote) e descrizione: compare subito sulla mappa."
            />
            <StepCard
              icon="📬"
              step="2"
              title="Ricevi contatti"
              text="Le famiglie interessate ti scrivono direttamente dal tuo profilo — nessuna registrazione richiesta a loro."
            />
            <StepCard
              icon="📊"
              step="3"
              title="Gestisci tutto dalla dashboard"
              text="Vedi le richieste ricevute, le recensioni e il tuo piano in un unico posto, dopo aver effettuato l'accesso."
            />
          </div>
          <div className="mt-5">
            <Link
              href="/registrati"
              className="inline-block rounded-full bg-sm-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Registra la tua ASD
            </Link>
          </div>
        </section>

        {/* Piani */}
        <section>
          <h2 className="mb-1 text-xl font-bold text-sm-navy">I piani disponibili</h2>
          <p className="mb-5 text-sm text-zinc-600">
            Solo per le ASD — cercare, confrontare e contattare una società resta sempre gratuito per le famiglie.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLAN_ORDER.map((planKey) => {
              const info = PLAN_INFO[planKey];
              const isFeatured = planKey === "BASE";
              return (
                <div
                  key={planKey}
                  className={`flex flex-col rounded-xl border-2 p-5 ${
                    isFeatured ? "border-sm-blue bg-sm-blue/5" : "border-zinc-200 bg-white"
                  }`}
                >
                  <span className="font-semibold text-sm-navy">{info.label}</span>
                  <p className="mb-3 text-lg font-bold text-zinc-800">{info.priceLabel}</p>
                  <ul className="flex flex-1 flex-col gap-1.5 text-sm text-zinc-600">
                    {info.benefits.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function StepCard({ icon, step, title, text }: { icon: string; step: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Passo {step}</span>
      </div>
      <h3 className="mb-1 font-semibold text-sm-navy">{title}</h3>
      <p className="text-sm text-zinc-600">{text}</p>
    </div>
  );
}
