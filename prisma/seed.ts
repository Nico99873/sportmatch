import { Sport } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const asds = [
  {
    name: "ASD San Vito Bassano 1953",
    email: "info@sanvitobassano.it",
    sport: Sport.CALCIO,
    lat: 45.7735,
    lon: 11.7479,
    rating: 4.4,
    address: "Via Col Moschin 40, Bassano del Grappa (VI)",
    categories: [
      { name: "Pulcini", ageMin: 5, ageMax: 8, hours: "Mar/Gio 16:30-17:30", annualFee: 150 },
      { name: "Esordienti", ageMin: 9, ageMax: 12, hours: "Mar/Gio/Sab 17:30-19:00", annualFee: 180 },
      { name: "Giovanissimi", ageMin: 13, ageMax: 16, hours: "Lun/Mer/Ven 18:00-19:30", annualFee: 200 },
    ],
    description:
      "Storica società calcistica di Bassano del Grappa, fondata nel 1953. Settore giovanile radicato sul territorio, campi in erba naturale e sintetica, staff tecnico qualificato FIGC.",
    photoUrl: null,
    reviews: [
      { authorName: "Marco B.", rating: 5, comment: "Ottimi allenatori, mio figlio si diverte tantissimo." },
      { authorName: "Laura T.", rating: 4, comment: "Organizzazione seria, un po' affollati i gruppi under 10." },
    ],
  },
  {
    name: "Società Tennis Bassano",
    email: "segreteria@tennisbassano.it",
    sport: Sport.TENNIS,
    lat: 45.7717,
    lon: 11.7505,
    rating: 4.3,
    address: "Via Col Fagheron 10, Bassano del Grappa (VI)",
    categories: [{ name: "Tutti", ageMin: 5, ageMax: 18, hours: "Lun-Dom 8:00-23:00", annualFee: 350 }],
    description:
      "Circolo tennistico con campi in terra rossa e sintetico, corsi per tutte le età dai piccolissimi agli agonisti. Maestri federali FIT.",
    photoUrl: null,
    reviews: [
      { authorName: "Giulia M.", rating: 5, comment: "Struttura curatissima, corsi ben organizzati per livello." },
      { authorName: "Andrea P.", rating: 4, comment: "Ottimo il campo estivo, un po' caro l'abbonamento." },
    ],
  },
  {
    name: "ASD Volley Cassola",
    email: "info@volleycassola.it",
    sport: Sport.PALLAVOLO,
    lat: 45.733,
    lon: 11.8,
    rating: 4.7,
    address: "Piazza Aldo Moro 2, Cassola (VI)",
    categories: [
      { name: "Tutti", ageMin: 6, ageMax: 18, hours: "Mar/Gio 17:00-21:00, Sab 9:00-13:00", annualFee: 190 },
    ],
    description:
      "Società di pallavolo con squadre giovanili maschili e femminili, dal minivolley all'under 18. Ambiente familiare e attento alla crescita dei ragazzi.",
    photoUrl: null,
    reviews: [
      { authorName: "Elisa F.", rating: 5, comment: "La miglior società della zona, allenatrici fantastiche." },
      { authorName: "Davide R.", rating: 5, comment: "Mia figlia è cresciuta tantissimo, sia tecnicamente che come persona." },
    ],
  },
  {
    name: "Aquapolis Bassano",
    email: "info@aquapolisbassano.it",
    sport: Sport.NUOTO,
    lat: 45.7459,
    lon: 11.7413,
    rating: 4.4,
    address: "Via Ca' Dolfin 139, Bassano del Grappa (VI)",
    categories: [
      { name: "Tutti", ageMin: 3, ageMax: 18, hours: "Lun-Ven 6:50-22:00, Sab-Dom 8:30-18:00", annualFee: 380 },
    ],
    description:
      "Centro natatorio con piscine coperte e scoperte, corsi di acquaticità neonatale, nuoto agonistico e propedeutico. Istruttori FIN qualificati.",
    photoUrl: null,
    reviews: [
      { authorName: "Chiara V.", rating: 4, comment: "Impianto grande e moderno, orari molto flessibili." },
      { authorName: "Simone D.", rating: 5, comment: "Corso di acquaticità neonatale top, mio figlio adora l'acqua ora." },
    ],
  },
  {
    name: "Orange1 Basket Bassano",
    email: "segreteria@basketbassano.it",
    sport: Sport.BASKET,
    lat: 45.769,
    lon: 11.711,
    rating: 4.1,
    address: "Via Villaggio Europa 2, Bassano del Grappa (VI)",
    categories: [{ name: "Tutti", ageMin: 5, ageMax: 18, hours: "Lun/Mer/Ven 17:00-20:00", annualFee: 250 }],
    description:
      "Società cestistica con settore giovanile strutturato dal minibasket alla serie giovanile regionale. Palestra moderna e staff tecnico FIP.",
    photoUrl: null,
    reviews: [
      { authorName: "Federico G.", rating: 4, comment: "Buon settore giovanile, palestra un po' lontana dal centro." },
      { authorName: "Sara N.", rating: 4, comment: "Allenatori preparati, mio figlio ha fatto grandi progressi." },
    ],
  },
];

async function main() {
  const password = await bcrypt.hash("password123", 10);

  for (const asd of asds) {
    const { reviews, categories, ...data } = asd;
    await prisma.asd.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        password,
        reviews: {
          create: reviews,
        },
        categories: {
          create: categories,
        },
      },
    });
  }

  console.log(`Seeded ${asds.length} ASDs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
