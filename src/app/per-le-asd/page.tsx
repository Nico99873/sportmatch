import Link from "next/link";
import Header from "@/components/Header";
import { PLAN_INFO, PLAN_ORDER } from "@/lib/plans";

export const metadata = {
  title: "Per le ASD — SportMatch",
  description:
    "Fai trovare la tua società sportiva dalle famiglie della tua zona. Profilo base gratuito, piani Base e Premium per crescere di più.",
};

export default function PerLeAsdPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />

      <div className="bg-sm-navy px-4 py-12 text-center text-white">
        <h1 className="mx-auto max-w-2xl text-2xl font-bold sm:text-3xl">
          Fai crescere la tua società sportiva con SportMatch
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
          Le famiglie della tua zona cercano ogni giorno una società sportiva per i loro figli. Fatti trovare, gratis
          per iniziare.
        </p>
        <Link
          href="/registrati"
          className="mt-6 inline-block rounded-full bg-sm-orange px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
        >
          Registra la tua ASD gratis
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10">
        {/* Vantaggi */}
        <section>
          <h2 className="mb-5 text-xl font-bold text-sm-navy">Perché registrarsi su SportMatch</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BenefitCard
              icon="📍"
              title="Fatti trovare da chi cerca vicino a te"
              text="Le famiglie ti trovano cercando per sport, età dei figli e distanza da casa — non serve che ti conoscano già."
            />
            <BenefitCard
              icon="🆓"
              title="Inizia gratis, senza rischi"
              text="Il profilo base è sempre gratuito: sei subito visibile sulla mappa e ricevi fino a 3 richieste di contatto al mese senza costi."
            />
            <BenefitCard
              icon="📬"
              title="Contatti diretti, nessun intermediario"
              text="Le famiglie ti scrivono direttamente dalla tua scheda profilo: ricevi tutto ordinato nella tua dashboard."
            />
            <BenefitCard
              icon="📈"
              title="Cresci quando vuoi"
              text="Con i piani a pagamento ottieni contatti illimitati, analytics su visite e richieste, e più visibilità nei risultati di ricerca."
            />
          </div>
        </section>

        {/* Piani */}
        <section>
          <h2 className="mb-1 text-xl font-bold text-sm-navy">I piani disponibili</h2>
          <p className="mb-5 text-sm text-zinc-600">Nessun vincolo: puoi passare a un piano superiore quando vuoi.</p>
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

        {/* CTA finale */}
        <section className="rounded-2xl border-2 border-dashed border-sm-orange/40 bg-sm-orange/5 p-6 text-center">
          <h2 className="mb-2 text-lg font-bold text-sm-navy">Pronto a iniziare?</h2>
          <p className="mb-4 text-sm text-zinc-600">Ci vogliono pochi minuti per creare il profilo della tua ASD.</p>
          <Link
            href="/registrati"
            className="inline-block rounded-full bg-sm-orange px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Registra la tua ASD gratis
          </Link>
        </section>
      </div>
    </div>
  );
}

function BenefitCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-2 text-2xl">{icon}</div>
      <h3 className="mb-1 font-semibold text-sm-navy">{title}</h3>
      <p className="text-sm text-zinc-600">{text}</p>
    </div>
  );
}
