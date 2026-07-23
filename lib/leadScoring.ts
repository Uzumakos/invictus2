/**
 * Lead Scoring Engine & CRM Metrics Calculator
 * REDESIGN — Client Acquisition System & Lead Qualification Engine
 */

export interface LeadScoringResult {
  leadScore: number;
  priority: string;
  stars: number;
  priorityColor: string;
  estimatedValue: number;
  probabilityOfClosing: number;
}

export function calculateLeadScoreAndMetrics(lead: {
  budget?: string;
  timeline?: string;
  notes?: string; // project description
  companyType?: string;
  projectType?: string; // service requested
  previousRelationship?: string;
}): LeadScoringResult {
  let score = 0;

  // 1. Budget Scopes
  const budget = lead.budget || "";
  if (budget.includes("Above $15,000") || budget.includes("above_15k") || budget.includes("$50k+")) {
    score += 35;
  } else if (budget.includes("$5,000–15,000") || budget.includes("5k_15k") || budget.includes("$25k - $50k") || budget.includes("$10k - $25k")) {
    score += 25;
  } else if (budget.includes("$1,000–5,000") || budget.includes("1k_5k") || budget.includes("$5k - $10k")) {
    score += 15;
  } else if (budget.includes("Under $1,000") || budget.includes("under_1k") || budget.includes("Under $5k")) {
    score += 5;
  }

  // 2. Timeline Scopes
  const timeline = lead.timeline || "";
  const timelineLower = timeline.toLowerCase();
  if (timelineLower.includes("urgent")) {
    score += 25;
  } else if (timelineLower.includes("within 1 month") || timelineLower.includes("1 month") || timelineLower.includes("1_month")) {
    score += 20;
  } else if (timelineLower.includes("within 3 months") || timelineLower.includes("3 months") || timelineLower.includes("3_months")) {
    score += 10;
  } else if (timelineLower.includes("flexible")) {
    score += 5;
  }

  // 3. Project Description Length (notes field represents project description)
  const desc = lead.notes || "";
  const descLen = desc.trim().length;
  if (descLen > 500) {
    score += 25; // Very detailed
  } else if (descLen >= 150) {
    score += 15; // Detailed
  } else if (descLen >= 50) {
    score += 5;  // Basic
  } // Under 50 is Very short (+0)

  // 4. Company Type Scopes
  const companyType = lead.companyType || "";
  const companyTypeLower = companyType.toLowerCase();
  if (companyTypeLower.includes("government")) {
    score += 30;
  } else if (companyTypeLower.includes("enterprise")) {
    score += 25;
  } else if (companyTypeLower.includes("ngo")) {
    score += 20;
  } else if (companyTypeLower.includes("university")) {
    score += 20;
  } else if (companyTypeLower.includes("small business") || companyTypeLower.includes("small_business") || companyTypeLower.includes("small")) {
    score += 15;
  } else if (companyTypeLower.includes("startup")) {
    score += 10;
  } else if (companyTypeLower.includes("individual")) {
    score += 5;
  }

  // 5. Service Requested (ProjectType) Scopes
  const projectType = lead.projectType || "";
  const projectTypeLower = projectType.toLowerCase();
  if (projectTypeLower.includes("long-term advisory") || projectTypeLower.includes("long_term_advisory") || projectTypeLower.includes("advisory")) {
    score += 35;
  } else if (projectTypeLower.includes("digital transformation") || projectTypeLower.includes("digital_transformation")) {
    score += 30;
  } else if (projectTypeLower.includes("ai consulting") || projectTypeLower.includes("ai_consulting") || projectTypeLower === "ai" || projectTypeLower.startsWith("ai ") || projectTypeLower.endsWith(" ai")) {
    score += 25;
  } else if (projectTypeLower.includes("software development") || projectTypeLower.includes("software_development") || projectTypeLower.includes("development") || projectTypeLower.includes("software")) {
    score += 20;
  } else if (projectTypeLower.includes("architecture audit") || projectTypeLower.includes("architecture_audit") || projectTypeLower.includes("audit")) {
    score += 20;
  } else if (projectTypeLower.includes("training")) {
    score += 15;
  } else if (projectTypeLower.includes("discovery call") || projectTypeLower.includes("discovery_call") || projectTypeLower.includes("discovery")) {
    score += 10;
  }

  // 6. Previous Relationship Scopes
  const prevRel = lead.previousRelationship || "";
  const prevRelLower = prevRel.toLowerCase();
  if (prevRelLower.includes("returning")) {
    score += 25;
  } else if (prevRelLower.includes("referral")) {
    score += 20;
  } else if (prevRelLower.includes("existing")) {
    score += 15;
  }

  // Final score cap
  const finalScore = Math.min(100, Math.max(0, score));

  // Visual Classifications and Priorities
  let priority = "Low Priority";
  let stars = 1;
  let priorityColor = "gray"; // matches color themes: purple, red, amber, blue, gray
  if (finalScore >= 90) {
    priority = "Strategic Opportunity";
    stars = 5;
    priorityColor = "purple";
  } else if (finalScore >= 75) {
    priority = "Hot Lead";
    stars = 4;
    priorityColor = "red";
  } else if (finalScore >= 60) {
    priority = "Qualified";
    stars = 3;
    priorityColor = "amber";
  } else if (finalScore >= 40) {
    priority = "Warm Lead";
    stars = 2;
    priorityColor = "blue";
  }

  // Probability Calculation: maps 97/100 score to 92% closing probability
  // Formula: Math.round(finalScore * 0.9 + 5)
  const probabilityOfClosing = finalScore > 0 ? Math.round(finalScore * 0.9 + 5) : 0;

  // Per user request, default estimated value is 0 (to be filled manually or negotiated later)
  const estimatedValue = 0;

  return {
    leadScore: finalScore,
    priority,
    stars,
    priorityColor,
    estimatedValue,
    probabilityOfClosing,
  };
}
