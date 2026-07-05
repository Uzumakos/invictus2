const fs = require("fs");
const path = require("path");

function flattenObject(obj, prefix = "") {
  let res = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        res = { ...res, ...flattenObject(val, newKey) };
      } else if (Array.isArray(val)) {
        // Handle array values as string arrays or index-based paths
        val.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            res = { ...res, ...flattenObject(item, `${newKey}.${index}`) };
          } else {
            res[`${newKey}.${index}`] = item;
          }
        });
      } else {
        res[newKey] = val;
      }
    }
  }
  return res;
}

function compile() {
  const enPath = path.join(__dirname, "../messages/en.json");
  const frPath = path.join(__dirname, "../messages/fr.json");

  if (!fs.existsSync(enPath) || !fs.existsSync(frPath)) {
    console.error("Missing translation files.");
    process.exit(1);
  }

  const enRaw = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  const frRaw = JSON.parse(fs.readFileSync(frPath, "utf-8"));

  const enFlat = flattenObject(enRaw);
  const frFlat = flattenObject(frRaw);

  const allKeys = Array.from(new Set([...Object.keys(enFlat), ...Object.keys(frFlat)]));

  console.log(`Found ${allKeys.length} translation keys.`);

  let sql = `-- ==========================================\n`;
  sql += `-- INVICTUS STORAGE BUCKETS & POLICIES\n`;
  sql += `-- ==========================================\n\n`;
  sql += `INSERT INTO storage.buckets (id, name, public)\n`;
  sql += `VALUES ('payment-receipts', 'payment-receipts', true)\n`;
  sql += `ON CONFLICT (id) DO NOTHING;\n\n`;
  sql += `DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;\n`;
  sql += `CREATE POLICY "Allow public uploads" ON storage.objects\n`;
  sql += `FOR INSERT TO public\n`;
  sql += `WITH CHECK (bucket_id = 'payment-receipts');\n\n`;
  sql += `DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;\n`;
  sql += `CREATE POLICY "Allow public reads" ON storage.objects\n`;
  sql += `FOR SELECT TO public\n`;
  sql += `USING (bucket_id = 'payment-receipts');\n\n`;

  sql += `-- ==========================================\n`;
  sql += `-- DYNAMIC TRANSLATIONS SEED\n`;
  sql += `-- ==========================================\n\n`;
  sql += `CREATE TABLE IF NOT EXISTS translations (\n`;
  sql += `    id SERIAL PRIMARY KEY,\n`;
  sql += `    key VARCHAR(255) UNIQUE NOT NULL,\n`;
  sql += `    en TEXT NOT NULL,\n`;
  sql += `    fr TEXT NOT NULL,\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;


  sql += `CREATE TABLE IF NOT EXISTS organizations (\n`;
  sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
  sql += `    name VARCHAR(255) NOT NULL,\n`;
  sql += `    logo_url TEXT,\n`;
  sql += `    website TEXT,\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS projects (\n`;
  sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
  sql += `    title VARCHAR(255) NOT NULL,\n`;
  sql += `    category JSONB NOT NULL,\n`;
  sql += `    image TEXT,\n`;
  sql += `    technologies TEXT[],\n`;
  sql += `    description JSONB NOT NULL,\n`;
  sql += `    problem JSONB,\n`;
  sql += `    research JSONB,\n`;
  sql += `    architecture JSONB,\n`;
  sql += `    challenges JSONB,\n`;
  sql += `    solutions JSONB,\n`;
  sql += `    results JSONB,\n`;
  sql += `    lessons JSONB,\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS testimonials (\n`;
  sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
  sql += `    name VARCHAR(255) NOT NULL,\n`;
  sql += `    role JSONB NOT NULL,\n`;
  sql += `    company VARCHAR(255),\n`;
  sql += `    avatar TEXT,\n`;
  sql += `    content JSONB NOT NULL,\n`;
  sql += `    rating INTEGER DEFAULT 5,\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS faq_items (\n`;
  sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
  sql += `    question JSONB NOT NULL,\n`;
  sql += `    answer JSONB NOT NULL,\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS articles (\n`;
  sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
  sql += `    published_at DATE,\n`;
  sql += `    reading_time VARCHAR(50),\n`;
  sql += `    tags TEXT[],\n`;
  sql += `    category VARCHAR(100),\n`;
  sql += `    title JSONB NOT NULL,\n`;
  sql += `    excerpt JSONB,\n`;
  sql += `    content JSONB,\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS training_programs (\n`;
  sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
  sql += `    title JSONB NOT NULL,\n`;
  sql += `    duration VARCHAR(255),\n`;
  sql += `    audience JSONB,\n`;
  sql += `    description JSONB,\n`;
  sql += `    syllabus TEXT[],\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS users (\n`;
  sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
  sql += `    name VARCHAR(255) NOT NULL,\n`;
  sql += `    email VARCHAR(255) UNIQUE NOT NULL,\n`;
  sql += `    password_hash VARCHAR(255) NOT NULL,\n`;
  sql += `    role VARCHAR(50) DEFAULT 'client',\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;



  sql += `INSERT INTO translations (key, en, fr) VALUES\n`;

  const escapeSql = (str) => {
    if (typeof str !== "string") return "''";
    return "'" + str.replace(/'/g, "''") + "'";
  };

  const rows = allKeys.map((key) => {
    const enVal = enFlat[key] || "";
    const frVal = frFlat[key] || "";
    return `(${escapeSql(key)}, ${escapeSql(enVal)}, ${escapeSql(frVal)})`;
  });

  sql += rows.join(",\n") + `\nON CONFLICT (key) DO UPDATE SET en = EXCLUDED.en, fr = EXCLUDED.fr;\n\n`;

  // Seed default organizations from db.json if it exists
  const dbPath = path.join(__dirname, "../db.json");
  if (fs.existsSync(dbPath)) {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const orgs = db.organizations || [];
      if (orgs.length > 0) {
        sql += `INSERT INTO organizations (id, name, logo_url, website) VALUES\n`;
        const orgRows = orgs.map((org) => {
          return `(${escapeSql(org.id)}, ${escapeSql(org.name)}, ${escapeSql(org.logoUrl || "")}, ${escapeSql(org.website || "")})`;
        });
        sql += orgRows.join(",\n") + `\nON CONFLICT (id) DO NOTHING;\n\n`;
      }
    } catch (e) {
      console.error("Failed to seed organizations from db.json:", e.message);
    }
  }

  // ── Append consulting_services table DDL & seed data ───────────────────────
  sql += `\n-- ==========================================\n`;
  sql += `-- CONSULTING SERVICES\n`;
  sql += `-- ==========================================\n\n`;
  sql += `CREATE TABLE IF NOT EXISTS consulting_services (\n`;
  sql += `    id VARCHAR(100) PRIMARY KEY,\n`;
  sql += `    title JSONB NOT NULL,\n`;
  sql += `    price NUMERIC NOT NULL,\n`;
  sql += `    duration INTEGER NOT NULL,\n`;
  sql += `    category VARCHAR(100) NOT NULL,\n`;
  sql += `    description JSONB NOT NULL,\n`;
  sql += `    features JSONB NOT NULL,\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;
  sql += `INSERT INTO consulting_services (id, title, price, duration, category, description, features) VALUES\n`;
  sql += `('software-architecture', '{"en": "Software Architecture & System Design", "fr": "Architecture Logicielle & Conception de Systèmes"}', 350, 60, 'engineering', '{"en": "High-level review of your tech stack, database schemas, API structures, and cloud infrastructure layout.", "fr": "Examen approfondi de votre pile technologique, schémas de base de données, API et infrastructure cloud."}', '{"en": ["1-Hour Interactive Session", "Full Infrastructure Visual Diagram", "Actionable Bottleneck Report", "Recommended Tech Stack Roadmap"], "fr": ["Session interactive de 1 heure", "Diagramme visuel d''infrastructure complet", "Rapport de goulots d''étranglement", "Feuille de route technologique recommandée"]}'),\n`;
  sql += `('ai-integration-strategy', '{"en": "AI Strategy & Implementation Planning", "fr": "Stratégie d''Intégration de l''IA & Planification"}', 450, 60, 'strategy', '{"en": "A strategic consultation mapping how LLMs, vector database schemas, and AI agents can solve business automation constraints.", "fr": "Une consultation stratégique sur la manière dont les LLM, les bases de données vectorielles et les agents IA peuvent automatiser vos processus."}', '{"en": ["1-Hour Interactive Session", "AI Readiness Scoring Metrics", "Targeted Model Recommendations (Gemini, Claude, GPT)", "Security & Private Data Pipeline Policy Draft"], "fr": ["Session interactive de 1 heure", "Mesure du niveau de préparation à l''IA", "Recommandations de modèles ciblés", "Ébauche de politique de sécurité des données"]}'),\n`;
  sql += `('digital-transformation-consulting', '{"en": "Digital Transformation Consulting", "fr": "Transformation Digitale & Migration Cloud"}', 300, 60, 'strategy', '{"en": "Designed to guide offline institutions, startups, and NGOs towards automated cloud infrastructure operations.", "fr": "Conçu pour guider les institutions hors ligne, les startups et les ONG vers des opérations cloud automatisées."}', '{"en": ["1-Hour Interactive Session", "Legacy Systems Tech Assessment", "Cloud Migration Strategy Document", "Tool Cost and Timeline Estimations"], "fr": ["Session interactive de 1 heure", "Évaluation des systèmes existants", "Document de stratégie de migration cloud", "Estimation des coûts et des délais"]}')\n`;
  sql += `ON CONFLICT (id) DO NOTHING;\n`;

  const outputPath = path.join(__dirname, "../scratch/translations_schema.sql");
  fs.writeFileSync(outputPath, sql, "utf-8");
  console.log(`Generated translation SQL schema at: ${outputPath}`);
}

compile();
