import { Project, Service, Testimonial, Article, Language } from "./types";

export const initialProjects: Project[] = [
  {
    id: "nexa-games",
    title: "NEXA Games Platform",
    category: {
      [Language.EN]: "Web3 & Game Architecture",
      [Language.FR]: "Web3 & Architecture de Jeu",
    },
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    technologies: ["React", "Node.js", "Solidity", "TailwindCSS", "PostgreSQL", "Docker"],
    description: {
      [Language.EN]: "High-performance gaming launcher and distribution system integrated with automated smart contracts.",
      [Language.FR]: "Lanceur de jeux haute performance et système de distribution intégré à des contrats intelligents automatisés.",
    },
    problem: {
      [Language.EN]: "Traditional gaming distribution channels impose high platform fees (30%) and suffer from slow microtransaction processing times for cross-border global creators.",
      [Language.FR]: "Les canaux traditionnels de distribution de jeux imposent des frais de plateforme élevés (30%) et souffrent de délais de traitement lents pour les microtransactions des créateurs internationaux.",
    },
    research: {
      [Language.EN]: "Analyzed gas-efficient Ethereum Layer 2 solutions and designed custom caching layers to maintain sub-second rendering for up to 100k concurrent active players.",
      [Language.FR]: "Analyse des solutions Ethereum Layer 2 économes en gaz et conception de couches de mise en cache personnalisées pour maintenir un rendu en moins d'une seconde pour 100 000 joueurs actifs.",
    },
    architecture: {
      [Language.EN]: "Decoupled Microservices, Express.js gateway, Redis session stores, PostgreSQL primary clustering, and ERC-1155 smart contract logic for in-game item trading.",
      [Language.FR]: "Microservices découplés, passerelle Express.js, sessions Redis, clustering PostgreSQL et contrats intelligents ERC-1155 pour l'échange d'objets en jeu.",
    },
    challenges: {
      [Language.EN]: "Handling high concurrency peaks during tournament launches and securing real-time ledger audits.",
      [Language.FR]: "Gérer les pics de connexion lors des lancements de tournois et sécuriser les audits de registres en temps réel.",
    },
    solutions: {
      [Language.EN]: "Implemented rate-limiting proxies, database read-replicas, and optimized smart-contract code to reduce gas expenditure by 43%.",
      [Language.FR]: "Mise en œuvre de serveurs mandataires de limitation de débit, réplicas de lecture de base de données, et code de contrat intelligent optimisé pour réduire le coût en gaz de 43%.",
    },
    results: {
      [Language.EN]: "Served over 120,000 active players, slashed transaction overheads to under $0.05, and successfully closed Series A funding rounds.",
      [Language.FR]: "Plus de 120 000 joueurs actifs servis, frais de transaction réduits à moins de 0,05 $ et clôture réussie de la levée de fonds Série A.",
    },
    lessons: {
      [Language.EN]: "Strict modularity of contract logic is vital for rolling upgrades. Edge caching saved 60% in backend infrastructure spending.",
      [Language.FR]: "La modularité stricte de la logique contractuelle est vitale pour les mises à jour. Le cache Edge a permis d'économiser 60% sur l'infrastructure.",
    },
  },
  {
    id: "cwo-transportation",
    title: "CWO Transportation Logistics",
    category: {
      [Language.EN]: "Enterprise Fleet & Transit Systems",
      [Language.FR]: "Système Logistique de Transport",
    },
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=800",
    technologies: ["React", "Express", "PostgreSQL", "Google Maps API", "Socket.io", "TailwindCSS"],
    description: {
      [Language.EN]: "Real-time dispatch system managing fleet routing, driver schedules, and automated billing for 300+ commercial assets.",
      [Language.FR]: "Système de répartition en temps réel gérant les itinéraires, les plannings des chauffeurs et la facturation automatique de 300+ véhicules.",
    },
    problem: {
      [Language.EN]: "Manual dispatcher intervention caused routing conflicts, idle asset losses, and an average 18% lag in customer delivery timelines.",
      [Language.FR]: "L'intervention manuelle des répartiteurs causait des conflits d'itinéraires, des pertes de temps et un retard moyen de 18% sur les livraisons.",
    },
    research: {
      [Language.EN]: "Mapped delivery topologies, studied traffic predictive models, and interviewed 40 truck drivers to align on terminal UX specifications.",
      [Language.FR]: "Cartographie des topologies de livraison, étude des modèles prédictifs de trafic et entretiens avec 40 chauffeurs pour harmoniser l'UX des terminaux.",
    },
    architecture: {
      [Language.EN]: "Event-driven architecture utilizing WebSocket for active location sharing, Node worker pools for routing calculations, and robust ACID database design.",
      [Language.FR]: "Architecture événementielle utilisant WebSocket pour le partage de position, des pools de threads Node pour les calculs d'itinéraires et une base ACID robuste.",
    },
    challenges: {
      [Language.EN]: "Maintaining steady real-time connections through low-bandwidth cellular dead zones.",
      [Language.FR]: "Maintenir des connexions temps réel stables dans les zones de couverture mobile faible.",
    },
    solutions: {
      [Language.EN]: "Implemented an offline-first indexedDB buffer on driver terminals that automatically synchronizes once cellular signal strength passes critical parameters.",
      [Language.FR]: "Mise en œuvre d'un tampon IndexedDB hors ligne sur les terminaux des chauffeurs qui se synchronise dès que le signal mobile est rétabli.",
    },
    results: {
      [Language.EN]: "Boosted fleet efficiency by 26%, reduced empty mileage, and increased on-time delivery metric to 99.4%.",
      [Language.FR]: "Efficacité de la flotte améliorée de 26%, réduction des kilomètres à vide et taux de livraison à l'heure porté à 99,4%.",
    },
    lessons: {
      [Language.EN]: "Human factors in field conditions dictate UI density. Large click targets and voice confirmations greatly increased system adoption rates.",
      [Language.FR]: "Les facteurs humains sur le terrain imposent une interface épurée. Les grandes cibles de clic et la synthèse vocale ont grandement favorisé l'adoption.",
    },
  },
  {
    id: "lyanza",
    title: "Lyanza Smart Commerce",
    category: {
      [Language.EN]: "Cloud API & Payment Hubs",
      [Language.FR]: "Hub de Paiements & API Cloud",
    },
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    technologies: ["React", "Go", "Docker", "Stripe API", "Google Cloud Platform", "TailwindCSS"],
    description: {
      [Language.EN]: "High-volume transactional system facilitating seamless multi-vendor checkout, invoice automation, and instant payouts.",
      [Language.FR]: "Système transactionnel à haut volume facilitant le paiement multi-vendeurs, la facturation automatique et les virements instantanés.",
    },
    problem: {
      [Language.EN]: "Fragmented regional payment gateways prevented local merchants from accessing international debit, credit, and mobile money services.",
      [Language.FR]: "Le fractionnement des passerelles de paiement régionales empêchait les commerçants d'accéder aux services de cartes bancaires internationales et de mobile money.",
    },
    research: {
      [Language.EN]: "Consulted financial compliance regulations, PCI-DSS guidelines, and analyzed network latency patterns across three major telecommunication companies.",
      [Language.FR]: "Consultation des réglementations de conformité financière, directives PCI-DSS et analyse de la latence réseau chez trois opérateurs majeurs.",
    },
    architecture: {
      [Language.EN]: "Distributed API Gateway with secure token vaults, high-throughput message brokers (RabbitMQ), and double-entry accounting databases.",
      [Language.FR]: "Passerelle API distribuée avec coffres-forts de jetons sécurisés, courtiers de messages à haut débit (RabbitMQ) et base de comptabilité en partie double.",
    },
    challenges: {
      [Language.EN]: "Preventing race conditions during multi-threaded flash sale checkout events.",
      [Language.FR]: "Prévenir les situations de concurrence (race conditions) lors des événements de vente flash à fort trafic.",
    },
    solutions: {
      [Language.EN]: "Utilized distributed locks in Redis and isolated transactional states with absolute rollbacks on failure.",
      [Language.FR]: "Utilisation de verrous distribués dans Redis et isolation des transactions avec retour à l'état initial (rollback) immédiat en cas d'erreur.",
    },
    results: {
      [Language.EN]: "Processed over $15 Million in annual transaction volume with 99.99% system uptime, helping 450 regional merchants scale globally.",
      [Language.FR]: "Plus de 15 millions de dollars de volume de transactions annuelles traités avec une disponibilité de 99,99%, aidant 450 commerçants à se développer.",
    },
    lessons: {
      [Language.EN]: "Never roll custom cryptography. Standard audited token vaults are mandatory for modern compliance and client confidence.",
      [Language.FR]: "Ne jamais concevoir de cryptographie maison. Les coffres-forts de jetons audités sont indispensables pour la conformité et la confiance.",
    },
  },
  {
    id: "ai-transformation-framework",
    title: "AI-Powered Enterprise Suite",
    category: {
      [Language.EN]: "AI Product Strategy & Integrations",
      [Language.FR]: "Stratégie Produit IA & Intégrations",
    },
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=800",
    technologies: ["React", "Express", "Google Gemini API", "Vector Databases", "LangChain", "Node.js"],
    description: {
      [Language.EN]: "A comprehensive AI framework designed for automatic proposal generation, knowledge extraction, and customer intelligence.",
      [Language.FR]: "Un framework d'IA complet conçu pour la génération automatique de propositions, l'extraction de connaissances et l'intelligence client.",
    },
    problem: {
      [Language.EN]: "Consulting groups waste thousands of hours manually reviewing corporate request documents and drafting lengthy technical architecture proposals.",
      [Language.FR]: "Les cabinets de conseil perdent des milliers d'heures à examiner manuellement les appels d'offres et à rédiger de longues propositions d'architecture technique.",
    },
    research: {
      [Language.EN]: "Studied LLM prompt optimization frameworks, vector embedding dimensions, and context-window limitations to guarantee high proposal accuracy and relevance.",
      [Language.FR]: "Étude des frameworks d'optimisation de prompts LLM, des dimensions d'embeddings vectoriels et des limites de fenêtres de contexte pour garantir l'exactitude des propositions.",
    },
    architecture: {
      [Language.EN]: "Retrieval-Augmented Generation (RAG) system utilizing vector databases, server-side Google Gemini SDK pipelines, and Markdown processing filters.",
      [Language.FR]: "Système RAG (Retrieval-Augmented Generation) utilisant des bases de données vectorielles, des pipelines de serveurs Gemini SDK et des filtres de traitement Markdown.",
    },
    challenges: {
      [Language.EN]: "Preventing model hallucinations and enforcing strict corporate data privacy bounds.",
      [Language.FR]: "Prévenir les hallucinations du modèle et imposer des limites strictes de confidentialité des données de l'entreprise.",
    },
    solutions: {
      [Language.EN]: "Enforced strict system instructions, injected verified corporate knowledge schemas, and ran client verification loops prior to document generation.",
      [Language.FR]: "Instructions système strictes imposées, injection de schémas de connaissances vérifiés et boucles de vérification client avant la génération de documents.",
    },
    results: {
      [Language.EN]: "Slashed corporate response drafting times from 5 days to under 4 minutes, increasing qualified sales pipelines by 340%.",
      [Language.FR]: "Délai de rédaction des propositions réduit de 5 jours à moins de 4 minutes, augmentant les opportunités de vente de 340%.",
    },
    lessons: {
      [Language.EN]: "AI is not a replacement for domain experts. The optimal workflow is 'AI assists, expert approves'.",
      [Language.FR]: "L'IA ne remplace pas les experts du domaine. Le flux de travail optimal est 'L'IA assiste, l'expert approuve'.",
    },
  },
];

export const consultingOffers: Service[] = [
  {
    id: "software-architecture",
    title: {
      [Language.EN]: "Software Architecture & System Design",
      [Language.FR]: "Architecture Logicielle & Conception de Systèmes",
    },
    price: 350,
    duration: 60,
    category: "engineering",
    description: {
      [Language.EN]: "High-level review of your tech stack, database schemas, API structures, and cloud infrastructure layout.",
      [Language.FR]: "Examen approfondi de votre pile technologique, schémas de base de données, API et infrastructure cloud.",
    },
    features: {
      [Language.EN]: [
        "1-Hour Interactive Session",
        "Full Infrastructure Visual Diagram",
        "Actionable Bottleneck Report",
        "Recommended Tech Stack Roadmap",
      ],
      [Language.FR]: [
        "Session interactive de 1 heure",
        "Diagramme visuel d'infrastructure complet",
        "Rapport de goulots d'étranglement",
        "Feuille de route technologique recommandée",
      ],
    },
  },
  {
    id: "ai-integration-strategy",
    title: {
      [Language.EN]: "AI Strategy & Implementation Planning",
      [Language.FR]: "Stratégie d'Intégration de l'IA & Planification",
    },
    price: 450,
    duration: 60,
    category: "strategy",
    description: {
      [Language.EN]: "A strategic consultation mapping how LLMs, vector database schemas, and AI agents can solve business automation constraints.",
      [Language.FR]: "Une consultation stratégique sur la manière dont les LLM, les bases de données vectorielles et les agents IA peuvent automatiser vos processus.",
    },
    features: {
      [Language.EN]: [
        "1-Hour Interactive Session",
        "AI Readiness Scoring Metrics",
        "Targeted Model Recommendations (Gemini, Claude, GPT)",
        "Security & Private Data Pipeline Policy Draft",
      ],
      [Language.FR]: [
        "Session interactive de 1 heure",
        "Mesure du niveau de préparation à l'IA",
        "Recommandations de modèles ciblés",
        "Ébauche de politique de sécurité des données",
      ],
    },
  },
  {
    id: "digital-transformation-consulting",
    title: {
      [Language.EN]: "Digital Transformation Consulting",
      [Language.FR]: "Transformation Digitale & Migration Cloud",
    },
    price: 300,
    duration: 60,
    category: "strategy",
    description: {
      [Language.EN]: "Designed to guide offline institutions, startups, and NGOs towards automated cloud infrastructure operations.",
      [Language.FR]: "Conçu pour guider les institutions hors ligne, les startups et les ONG vers des opérations cloud automatisées.",
    },
    features: {
      [Language.EN]: [
        "1-Hour Interactive Session",
        "Legacy Systems Tech Assessment",
        "Cloud Migration Strategy Document",
        "Tool Cost and Timeline Estimations",
      ],
      [Language.FR]: [
        "Session interactive de 1 heure",
        "Évaluation des systèmes existants",
        "Document de stratégie de migration cloud",
        "Estimation des coûts et des délais",
      ],
    },
  },
];

export const trainingPrograms: Article[] = [
  {
    id: "digital-marketing-bootcamp",
    title: {
      [Language.EN]: "Digital Marketing Mastery for Sales Teams",
      [Language.FR]: "Masterclass en Marketing Digital pour Commerciaux",
    },
    excerpt: {
      [Language.EN]: "An intensive professional program to master search optimization, paid advertising, and conversion rate attribution.",
      [Language.FR]: "Un programme professionnel intensif pour maîtriser le référencement, l'achat média et l'attribution publicitaire.",
    },
    content: {
      [Language.EN]: "Detailed training course covering Google Ads, Meta Business Suite, Google Analytics 4, and lead generation frameworks.",
      [Language.FR]: "Cours de formation détaillé couvrant Google Ads, Meta Business Suite, Google Analytics 4 et les stratégies de génération de leads.",
    },
    category: "marketing",
    publishedAt: "2026-06-01",
    readingTime: "6 weeks",
    tags: ["SEO", "SEA", "Growth", "Marketing"],
  },
  {
    id: "ai-product-engineering",
    title: {
      [Language.EN]: "AI Product Strategy & Prompt Engineering",
      [Language.FR]: "Stratégie Produit IA & Ingénierie de Prompts",
    },
    excerpt: {
      [Language.EN]: "Learn to build production-grade AI features, optimize prompt pipelines, and deploy autonomous LLM agents.",
      [Language.FR]: "Apprenez à concevoir des fonctionnalités IA en production, optimiser les prompts et déployer des agents LLM.",
    },
    content: {
      [Language.EN]: "A hands-on program focusing on Google Gemini API, LangChain frameworks, vector embedding, and context-window optimizations.",
      [Language.FR]: "Un programme pratique axé sur l'API Google Gemini, LangChain, les embeddings vectoriels et la gestion du contexte.",
    },
    category: "ai",
    publishedAt: "2026-06-15",
    readingTime: "4 weeks",
    tags: ["LLM", "Gemini", "RAG", "Engineering"],
  },
  {
    id: "digital-literacy-educators",
    title: {
      [Language.EN]: "Digital Literacy & Tech Tools for Educators",
      [Language.FR]: "Littératie Numérique & Outils pour Éducateurs",
    },
    excerpt: {
      [Language.EN]: "Empowering teachers and university professors with modern digital tools, LMS management, and interactive teaching methods.",
      [Language.FR]: "Autonomiser les enseignants et professeurs avec les outils numériques modernes, la gestion des LMS et la pédagogie interactive.",
    },
    content: {
      [Language.EN]: "Covers Google Workspace for Education, Canvas/Moodle configuration, interactive virtual whiteboards, and digital evaluation frameworks.",
      [Language.FR]: "Couvre Google Workspace pour l'Éducation, la configuration de Canvas/Moodle, les tableaux virtuels et l'évaluation numérique.",
    },
    category: "strategy",
    publishedAt: "2026-07-01",
    readingTime: "3 weeks",
    tags: ["Education", "LMS", "Digital Literacy", "Pedagogy"],
  },
];

export const initialArticles: Article[] = [
  {
    id: "nextjs-15-migration-guide",
    title: {
      [Language.EN]: "Migrating Enterprise React Applications to Next.js 15",
      [Language.FR]: "Migration d'Applications React d'Entreprise vers Next.js 15",
    },
    excerpt: {
      [Language.EN]: "A deep dive into Server Components, route handler optimizations, and Turbopack deployment strategies for large codebases.",
      [Language.FR]: "Une analyse approfondie des Server Components, de l'optimisation des handlers et du déploiement Turbopack pour les grandes bases de code.",
    },
    content: {
      [Language.EN]: "Next.js 15 introduces key structural optimizations, especially regarding caching behaviors, server action executions, and Turbopack compiler speeds. In this guide, we walk through rewriting Vite applications to the App Router structure, explaining how to manage global layout configurations, next-intl setups for robust locale directories, and database synchronization without breaking state constraints.",
      [Language.FR]: "Next.js 15 introduit des optimisations structurelles importantes, notamment concernant les comportements de cache, l'exécution des Server Actions et la vitesse du compilateur Turbopack. Dans ce guide, nous abordons la réécriture d'applications Vite vers la structure App Router, en expliquant la gestion des layouts, la configuration de next-intl et la synchronisation de base de données.",
    },
    category: "engineering",
    publishedAt: "2026-06-28",
    readingTime: "8",
    tags: ["Next.js", "React", "Web Development", "Migration"],
  },
  {
    id: "building-ai-agents-with-gemini-sdk",
    title: {
      [Language.EN]: "Building Deterministic and Agentic Workflows with Gemini SDK",
      [Language.FR]: "Construire des Flux Déterministes et Agentiques avec le SDK Gemini",
    },
    excerpt: {
      [Language.EN]: "How to combine rule engines with Google Gemini models to construct production-ready AI products.",
      [Language.FR]: "Comment combiner les moteurs de règles avec les modèles Google Gemini pour concevoir des produits IA fiables en production.",
    },
    content: {
      [Language.EN]: "Many teams jump straight to pure LLM calls, which often lead to hallucinations, lack of control, and high execution costs. In this article, we demonstrate how to design a hybrid architecture: starting with a clean deterministic rule engine to classify and route requests, and then using Google Gemini only where creative reasoning or semantic parsing is strictly required. This reduces costs by over 40% and ensures predictable system behavior.",
      [Language.FR]: "De nombreuses équipes se lancent directement dans des appels LLM purs, ce qui entraîne des hallucinations, un manque de contrôle et des coûts d'exécution élevés. Dans cet article, nous démontrons comment concevoir une architecture hybride : commencer par un moteur de règles déterministe pour classer et router les requêtes, et n'utiliser Gemini que là où le raisonnement est strictement nécessaire.",
    },
    category: "ai",
    publishedAt: "2026-07-02",
    readingTime: "12",
    tags: ["Gemini", "AI Agents", "Architecture", "Software Engineering"],
  },
];

export const initialTestimonials: Testimonial[] = [
  {
    id: "4546ce77-2c5d-41b9-87a5-0510e30eecfa",
    name: "Guerly Laroche",
    clientName: "Guerly Laroche",
    role: "CEO of GLCreativedesign",
    company: "GLCreativedesign",
    avatar: "https://ik.imagekit.io/tche25kem/Guerly.jpg",
    photoUrl: "https://ik.imagekit.io/tche25kem/Guerly.jpg",
    rating: 5,
    content: {
      en: "Great services . Very professional! Thank you for helping revamp my website!",
      fr: "Grands services . Très professionnel ! Merci de m'avoir aidé à repenser mon site web !"
    }
  },
  {
    id: "57f78b24-59e2-4ad7-96c5-aee64bbc87de",
    name: "Isaac Admeus",
    clientName: "Isaac Admeus",
    role: "CEO of Edutech | lekòlAlèz",
    company: "Edutech | lekòlAlèz",
    avatar: "https://ik.imagekit.io/tche25kem/Isaac56.jpg",
    photoUrl: "https://ik.imagekit.io/tche25kem/Isaac56.jpg",
    rating: 5,
    content: {
      en: "Amédée is one of the developers I know who combines talent, dedication and seriousness. His ability to create and respond to client or project requirements is phenomenal. I work with him on lekolalez.com and I can honestly say he went above and beyond what I expected.",
      fr: "Amédée est l'un des développeurs que je connais qui allie talent, dévouement et sérieux. Sa capacité à créer et à répondre aux exigences des clients ou des projets est phénoménale. Je travaille avec lui sur lekolalez.com et je peux honnêtement dire qu'il est allé au-delà de mes attentes."
    }
  }
];

export const initialFaqItems: any[] = [
  {
    id: "call",
    question: {
      en: "1- What happens during the Strategy & Discovery session?",
      fr: "1- Que se passe-t-il pendant la session Stratégie & Découverte ?"
    },
    answer: {
      en: "The discovery session is designed to understand your goals, technical constraints, system requirements, and business objectives. We analyze your needs and establish a clear roadmap for execution.",
      fr: "La session de découverte est conçue pour comprendre vos objectifs, vos contraintes techniques, vos exigences système et vos objectifs commerciaux. Nous analysons vos besoins et établissons une feuille de route claire."
    }
  },
  {
    id: "team",
    question: {
      en: "2- Can you work with existing teams and codebases?",
      fr: "2- Pouvez-vous travailler avec des équipes et des bases de code existantes ?"
    },
    answer: {
      en: "Absolutely. I can collaborate with your in-house team, CTO, product managers, or external partners to improve system architecture, optimize code, and accelerate development.",
      fr: "Absolument. Je peux collaborer avec votre équipe interne, votre CTO, vos chefs de projet ou des partenaires externes pour améliorer l'architecture du système, optimiser le code et accélérer le développement."
    }
  },
  {
    id: "remote",
    question: {
      en: "3- Do you work internationally?",
      fr: "3- Travaillez-vous à l'international ?"
    },
    answer: {
      en: "Yes. I work remotely with clients across different countries and time zones, providing consulting, development, and training services worldwide.",
      fr: "Oui. Je travaille à distance avec des clients situés dans différents pays et fuseaux horaires, en proposant des services de conseil, de développement et de formation à l'échelle internationale."
    }
  },
  {
    id: "services",
    question: {
      en: "4- What services do you offer?",
      fr: "4- Quels services proposez-vous ?"
    },
    answer: {
      en: "My services include software architecture, custom web and mobile development, AI integration, digital transformation consulting, product strategy, and professional training.",
      fr: "Mes services comprennent l'architecture logicielle, le développement d'applications web et mobiles sur mesure, l'intégration de solutions d'intelligence artificielle, le conseil en transformation numérique, la stratégie produit ainsi que la formation professionnelle."
    }
  },
  {
    id: "works",
    question: {
      en: "5- What types of organizations do you work with?",
      fr: "5- Avec quels types d'organisations travaillez-vous ?"
    },
    answer: {
      en: "I collaborate with startups, SMEs, institutions, NGOs, and established companies seeking digital transformation, custom software development, AI integration, and strategic technology consulting.",
      fr: "Je collabore avec des startups, des PME, des institutions, des ONG et des entreprises établies souhaitant accélérer leur transformation numérique, développer des solutions sur mesure, intégrer l'intelligence artificielle ou bénéficier d'un accompagnement stratégique."
    }
  },
  {
    id: "fees",
    question: {
      en: "6- Is the Discovery Call fee deductible from future projects?",
      fr: "6- Les frais de la session de découverte sont-ils déductibles d'un futur projet ?"
    },
    answer: {
      en: "Yes. The consultation fee can be credited toward larger engagements and long-term collaborations.",
      fr: "Oui. Les frais de consultation peuvent être déduits du coût d'un projet plus important ou d'une collaboration à long terme."
    }
  },
  {
    id: "process",
    question: {
      en: "7- How does your consulting process work?",
      fr: "7- Comment se déroule votre processus d'accompagnement ?"
    },
    answer: {
      en: "My consulting process typically follows four stages:\n\nDiscovery\nStrategy & Planning\nDevelopment & Implementation\nSupport & Optimization",
      fr: "Mon processus d'accompagnement s'articule généralement autour de quatre étapes :\n\nDécouverte\nStratégie et planification\nDéveloppement et mise en œuvre\nSupport et optimisation"
    }
  },
  {
    id: "nda",
    question: {
      en: "8- Do you sign NDAs?",
      fr: "8- Signez-vous des accords de confidentialité (NDA) ?"
    },
    answer: {
      en: "Yes. Confidentiality agreements can be signed before discussing sensitive business or technical information.",
      fr: "Oui. Des accords de confidentialité peuvent être signés avant toute discussion portant sur des informations sensibles, qu'elles soient commerciales ou techniques."
    }
  },
  {
    id: "technologies",
    question: {
      en: "9- Which technologies do you specialize in?",
      fr: "9- Quelles technologies maîtrisez-vous ?"
    },
    answer: {
      en: "I primarily work with Next.js, React, TypeScript, Node.js, Supabase, PostgreSQL, WordPress, AI tools, cloud platforms, and modern web technologies.",
      fr: "Je travaille principalement avec Next.js, React, TypeScript, Node.js, Supabase, PostgreSQL, WordPress, les outils d'intelligence artificielle, les plateformes cloud et les technologies web modernes."
    }
  },
  {
    id: "ai",
    question: {
      en: "10- Can you integrate artificial intelligence into existing products?",
      fr: "10- Pouvez-vous intégrer l'intelligence artificielle à une plateforme existante ?"
    },
    answer: {
      en: "Yes. I help organizations integrate AI-powered features, automation workflows, and intelligent systems into their existing platforms.",
      fr: "Oui. J'accompagne les organisations dans l'intégration de fonctionnalités basées sur l'intelligence artificielle, de flux d'automatisation et de systèmes intelligents au sein de leurs plateformes existantes."
    }
  },
  {
    id: "project",
    question: {
      en: "11- Do you build custom software solutions?",
      fr: "11- Développez-vous des solutions logicielles sur mesure ?"
    },
    answer: {
      en: "Yes. Every project is designed according to your business goals, technical requirements, and long-term growth strategy.",
      fr: "Oui. Chaque solution est conçue sur mesure en fonction de vos objectifs métier, de vos contraintes techniques et de votre stratégie de croissance."
    }
  },
  {
    id: "audit",
    question: {
      en: "12- Can you audit an existing application?",
      fr: "12- Pouvez-vous auditer une application existante ?"
    },
    answer: {
      en: "Absolutely. I provide technical audits covering architecture, security, performance, scalability, and user experience.",
      fr: "Absolument. Je réalise des audits techniques portant sur l'architecture, la sécurité, les performances, la scalabilité et l'expérience utilisateur."
    }
  },
  {
    id: "price",
    question: {
      en: "13- How are your services priced?",
      fr: "13- Comment vos services sont-ils tarifés ?"
    },
    answer: {
      en: "Pricing depends on the scope, complexity, timeline, and support requirements of each project.",
      fr: "La tarification dépend de la portée, de la complexité, des délais et des besoins d'accompagnement propres à chaque projet."
    }
  },
  {
    id: "hourly",
    question: {
      en: "14- Do you offer fixed-price and hourly engagements?",
      fr: "14- Proposez-vous des forfaits et des prestations à l'heure ?"
    },
    answer: {
      en: "Yes. Depending on the project, I offer fixed-price packages, strategic consulting sessions, and long-term support agreements.",
      fr: "Oui. Selon le projet, je propose des forfaits à prix fixe, des sessions de conseil stratégique ainsi que des contrats d'accompagnement sur le long terme."
    }
  },
  {
    id: "payment",
    question: {
      en: "15- Which payment methods do you accept?",
      fr: "15- Quels moyens de paiement acceptez-vous ?"
    },
    answer: {
      en: "I accept mobile payment (Moncash, Natcash), bank transfers, and other payment methods depending on the client's location.",
      fr: "J'accepte les paiements mobiles (Moncash, Natcash), les virements bancaires et d'autres moyens de paiement selon la localisation du client."
    }
  },
  {
    id: "invoice",
    question: {
      en: "16- Can I receive invoices in English or French?",
      fr: "16- Puis-je recevoir mes factures en anglais ou en français ?"
    },
    answer: {
      en: "Yes. Professional invoices and project documents can be generated in both English and French.",
      fr: "Oui. Les factures professionnelles ainsi que les documents liés au projet peuvent être générés en anglais comme en français."
    }
  }
];


