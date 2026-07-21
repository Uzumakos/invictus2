// ============================================================
// TYPES — Portfolio Platform
// EN + FR only (Haitian Creole removed)
// ============================================================

export enum Language {
  EN = "en",
  FR = "fr",
}

// ─── Project / Case Study ──────────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  description: Record<Language, string>;
  category: Record<Language, string>;
  image: string;
  technologies: string[];
  problem: Record<Language, string>;
  research: Record<Language, string>;
  architecture: Record<Language, string>;
  challenges: Record<Language, string>;
  solutions: Record<Language, string>;
  results: Record<Language, string>;
  lessons: Record<Language, string>;
}

// ─── Service / Consulting ─────────────────────────────────────────────────
export interface ServiceTier {
  name: string;
  multiplier: number;
  extraFeatures: string[];
}

export interface Service {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  duration: number; // in minutes
  features: Record<Language, string[]>;
  category: "engineering" | "strategy" | "marketing" | "training";
  status?: "draft" | "published" | "archived";
  tiers?: ServiceTier[];
}

// ─── Testimonial ──────────────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name?: string;
  clientName?: string;
  role?: Record<Language, string> | string;
  company?: string;
  avatar?: string;
  photoUrl?: string;
  content: Record<Language, string> | string;
  rating: number;
}

// ─── Article / Blog ───────────────────────────────────────────────────────
export interface Article {
  id: string;
  title: Record<Language, string>;
  excerpt: Record<Language, string>;
  content: Record<Language, string>;
  category: "engineering" | "ai" | "marketing" | "strategy";
  publishedAt: string;
  readingTime: string;
  tags: string[];
}

// ─── Booking ──────────────────────────────────────────────────────────────
export type BookingStatus =
  | "pending"
  | "awaiting_payment"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  clientId?: string; // Not stored in DB — bookings are linked via client_email
  clientName: string;
  clientEmail: string;
  serviceId: string;
  serviceTitle: Record<Language, string>;
  packageType: string;
  language: Language;
  date: string;
  time: string;
  timezone: string;
  questionnaire: Record<string, string>;
  status: BookingStatus;
  amount: number;
  paymentMethod?: PaymentMethodType;
  paymentReference?: string; // booking ID used as transfer reference
  discoveryId?: string; // linked discovery if booked from discovery engine
  createdAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────
export type PaymentMethodType =
  | "moncash"
  | "natcash"
  | "unibank"
  | "sogebank"
  | "wise"
  | "paypal";

export type PaymentMethodCategory = "mobile" | "bank" | "international";

export interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  type: PaymentMethodCategory;
  enabled: boolean;
  logoUrl: string;
  // Mobile money fields
  phoneNumber?: string;
  // Bank transfer fields
  accountNumber?: string;
  accountHolder?: string;
  // International fields
  email?: string;
}

export interface PaymentConfig {
  methods: PaymentMethod[];
}

// ─── CRM Lead ─────────────────────────────────────────────────────────────
export type CRMStatus =
  | "lead"
  | "discovery"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface CRMLead {
  id: string;
  company: string;
  contactName: string;
  email: string;
  industry: string;
  budget: string;
  notes: string;
  source: string;
  status: CRMStatus;
  createdAt: string;
}

// ─── Client Portal ────────────────────────────────────────────────────────
export interface PortalTask {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  deadline: string;
  status: "todo" | "in_progress" | "review" | "done";
  assignedTo: "client" | "amedee";
}

export interface PortalDocument {
  id: string;
  title: string;
  category: "contract" | "proposal" | "audit" | "report" | "pdf";
  url: string;
  uploadedAt: string;
  size?: string;
}

export interface PortalProject {
  id: string;
  clientEmail: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "review" | "completed";
  progress: number;
  startDate: string;
  targetLaunch: string;
}

export interface PortalPayment {
  id: string;
  clientEmail: string;
  amount: number;
  service: string;
  date: string;
  status: "paid" | "pending" | "overdue";
  invoiceUrl: string;
  paymentMethod?: PaymentMethodType;
}

export interface PortalConsultationActionItem {
  id: string;
  text: string;
  status: "todo" | "done";
}

export interface PortalConsultation {
  id: string;
  clientEmail: string;
  date: string;
  duration: string;
  notes: string;
  aiSummary: string;
  actionItems: PortalConsultationActionItem[];
}

export interface PortalNotification {
  id: string;
  clientEmail: string;
  text: string;
  type: "meeting" | "document" | "payment" | "task" | "system";
  timestamp: string;
  read: boolean;
}

export interface PortalMessage {
  id: string;
  sender: "client" | "amedee";
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    url: string;
    size?: string;
  };
}

// ─── Organization ────────────────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────
export interface FAQItem {
  id: string;
  question: Record<Language, string>;
  answer: Record<Language, string>;
}

// ─── Training Enrollment ─────────────────────────────────────────────────
export interface TrainingEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  studentEmail: string;
  studentRole: string;
  notes: string;
  createdAt: string;
}

export interface NotifyEntry {
  id: string;
  email: string;
  createdAt: string;
}

// ─── Site Settings ────────────────────────────────────────────────────────
export interface SiteSettings {
  trainingEnabled: boolean;
  profileImageUrl: string;
  adminPath: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

// ─── Admin Auth ───────────────────────────────────────────────────────────
export interface AdminRateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// ─── Smart Project Discovery Engine ──────────────────────────────────────
export type DiscoveryStatus =
  | "pending"
  | "analyzed"
  | "archived"
  | "converted_lead"
  | "converted_booking";

export type ProjectComplexity = "Low" | "Medium" | "High" | "Critical";

export interface DiscoveryState {
  projectTypes: string[];
  customAnswers?: Record<string, string>;
  // Organization
  companyName: string;
  industry: string;
  country: string;
  orgType: string;
  teamSize: string;
  employeeCount: string;
  website: string;
  socialLinks: string;
  // Goals
  businessGoals: string[];
  // Current situation
  hasSoftware: string;
  challenges: string;
  painPoints: string;
  limits: string;
  // Target audience
  audienceTypes: string[];
  languages: string;
  expectedUsers: string;
  growthExpectations: string;
  // Features
  features: string[];
  // Technical
  techStack: string;
  cloudProvider: string;
  compliance: string;
  accessibility: string;
  needsMigration: boolean;
  needsAPI: boolean;
  needsAI: boolean;
  needsAutomation: boolean;
  // Budget
  budgetRange: string;
  isDecisionMaker: string;
  isFundingAvailable: string;
  expectedROI: string;
  // Timeline
  timeline: string;
  // Language & availability
  preferredLanguage: string;
  timezone: string;
  meetingHours: string;
  // Additional
  links: string;
  notes: string;
}

export interface ProjectDiscovery {
  id: string;
  createdAt: string;
  status: DiscoveryStatus;
  answers: DiscoveryState;
  summary: DiscoverySummary;
}

export interface DiscoverySummary {
  title: string;
  complexity: ProjectComplexity;
  recommendedServices: string[];
  recommendedFeatures: string[];
  overviewMarkdown: string;
  preparationStatus: "Ready" | "Needs Clarification" | "Incomplete";
}

// ─── Rule Engine ──────────────────────────────────────────────────────────
export type RuleConditionOperator =
  | "includes"
  | "includes_any"
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "not_empty"
  | "is_true";

export type RuleActionType =
  | "recommend_service"
  | "recommend_feature"
  | "set_complexity"
  | "add_note";

export interface RuleCondition {
  field: string;
  operator: RuleConditionOperator;
  value: string | string[] | number | boolean;
}

export interface RuleAction {
  type: RuleActionType;
  value: string;
}

export interface RecommendationRule {
  id: string;
  name: string;
  priority: number;
  conditionOperator: "AND" | "OR";
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
}

// ─── Feature Catalog (Discovery Step 7) ──────────────────────────────────
export interface FeatureCatalogItem {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: string;
}

// ─── WhatsApp Quick Contact & Interaction History ─────────────────────────
export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  countryCode?: string;
  preferredLanguage?: "en" | "fr" | string;
  companyName?: string;
  createdAt?: string;
}

export type WhatsAppCategory =
  | "booking_confirmation"
  | "discovery_call_reminder"
  | "invoice_available"
  | "payment_reminder"
  | "payment_confirmation"
  | "consultation_follow_up"
  | "testimonial_request"
  | "project_update"
  | "custom_message";

export interface WhatsAppTemplate {
  id: string;
  name: string;
  language: "en" | "fr";
  category: WhatsAppCategory | string;
  content: string;
  active: boolean;
  createdAt?: string;
}

export interface WhatsAppInteraction {
  id: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  generatedBy?: string;
  templateName: string;
  category?: WhatsAppCategory | string;
  language: "en" | "fr" | string;
  generatedMessage: string;
  generatedLink: string;
  copied: boolean;
  opened: boolean;
  shared: boolean;
  notes?: string;
  createdAt: string;
}

export interface WhatsAppAnalyticsSummary {
  totalGenerated: number;
  mostUsedTemplate: string;
  mostContactedClient: string;
  messagesByLanguage: { en: number; fr: number };
  copiedCount: number;
  openedCount: number;
  sharedCount: number;
  monthlyActivity: { month: string; count: number }[];
}

