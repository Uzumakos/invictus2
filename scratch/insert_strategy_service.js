const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");
const ws = require("ws");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

async function insertStrategyService() {
  const strategyService = {
    id: "strategy",
    title: {
      en: "Strategic Discovery Call",
      fr: "Session de Découverte Stratégique"
    },
    price: 60,
    duration: 30,
    category: "strategy",
    description: {
      en: "A focused 30-minute consultation designed to understand your goals, evaluate technical and business requirements, and identify the most effective strategy for your project. Ideal for startups, organizations, and businesses seeking expert guidance before committing to a larger engagement.",
      fr: "Une consultation ciblée de 30 minutes conçue pour comprendre vos objectifs, analyser vos besoins techniques et métiers, et définir la stratégie la plus adaptée à votre projet. Idéale pour les startups, les entreprises et les institutions souhaitant bénéficier d'un accompagnement expert avant de s'engager dans une collaboration plus importante."
    },
    features: {
      en: [
        "30-minute private video consultation",
        "Project and business requirements review",
        "Initial technical and strategic recommendations",
        "Identification of opportunities and potential risks",
        "Q&A session",
        "Follow-up summary by email",
        "Consultation fee credited toward future engagements"
      ],
      fr: [
        "Consultation vidéo privée de 30 minutes",
        "Analyse des besoins du projet et de l'entreprise",
        "Premières recommandations techniques et stratégiques",
        "Identification des opportunités et des risques potentiels",
        "Session de questions-réponses",
        "Compte rendu envoyé par e-mail",
        "Montant déductible d'une future collaboration"
      ]
    },
    status: "published"
  };

  const { data, error } = await supabase.from("consulting_services").upsert(strategyService).select();
  console.log("Upsert error:", error);
  console.log("Upserted data:", data);
}

insertStrategyService();
