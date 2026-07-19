# Invictus Portfolio & Client Portal — Project Summary

Welcome to the technical documentation of the **Invictus Portfolio & Client Portal** platform, designed and built for **Amedee Erns Baptiste** ( Software Engineer & Digital Transformation Consultant). 

This platform functions both as a high-performance public portfolio showcasing consulting services, projects, and insights, and as an interactive secure portal where clients can book consultations, view tasks, exchange documents and messages, configure settings, and receive customized AI-driven project diagnostics.

---

## 🛠️ Technology Stack & Libraries

- **Framework**: Next.js (using App Router, TypeScript, and standard server-side page conventions)
- **Styling**: TailwindCSS & Vanilla CSS (variables defined in [globals.css](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/src/app/globals.css))
- **Localization (i18n)**: `next-intl` (supporting English and French)
- **Authentication**: Secure, HTTP-only Cookie-based JSON Web Tokens (JWT) using `jsonwebtoken` and `bcryptjs` for admin verification
- **Database Layer**:
  - **Local Development**: JSON file-based database ([db.json](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/db.json)) with file reading/writing helpers ([lib/db.ts](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/lib/db.ts))
  - **Production Ready**: PostgreSQL/Supabase seed script ([schema.sql](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/schema.sql))
- **Icons & Animations**: `lucide-react` for symbols, `motion/react` (formerly framer-motion) for responsive transitions

---

## 📂 Project Architecture

```
Invictus/
└── portfolio/
    ├── components/
    │   ├── layout/          # Global shell components (Header, Footer, Logo)
    │   ├── portal/          # Interactive Client Portal subsections
    │   ├── sections/        # Main landing page interactive sections
    │   └── ClientPortal.tsx # Core Client Portal login/dashboard manager
    ├── lib/
    │   ├── i18n/            # next-intl navigation and routing settings
    │   ├── auth.ts          # Password hashing and JWT verification helpers
    │   ├── data.ts          # Static initial data seeds for projects/services
    │   ├── db.ts            # Local JSON database manager
    │   ├── rate-limit.ts    # Admin login IP-based rate-limiter
    │   └── types.ts         # TypeScript structural definitions
    ├── messages/            # Localization dictionary files (en.json, fr.json)
    ├── src/
    │   └── app/
    │       ├── [locale]/    # Multi-language public routes (Page, Layout)
    │       ├── admin/       # Admin area (Login page, Dashboard panel)
    │       ├── api/         # Backend endpoints (Auth, CRUD Resources, Settings)
    │       └── globals.css  # CSS custom properties and core stylesheets
    ├── db.json              # Local database file
    ├── schema.sql           # PostgreSQL Database Schema
    ├── middleware.ts        # Route routing filter (skips admin/api from i18n)
    └── next.config.ts       # Next.js configurations
```

---

## 🗄️ Database Schema & Data Structure

The application supports a local file-based database for development ([db.json](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/db.json)) and a production-grade PostgreSQL layout ([schema.sql](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/schema.sql)).

### Core Entities & Collections:
1. **Site Settings (`site_settings`)**: Stores toggle options (e.g., whether the training section is active), profile avatar path, custom admin route paths, and links to social media handles.
2. **Payment Configurations (`payment_methods`)**: Details payment gateways (MonCash, NatCash, Unibank, Sogebank, Wise, PayPal) with details like account numbers, types, status (enabled/disabled), and numbers.
3. **Consultation Bookings (`bookings`)**: Holds booked consults, timezone selections, client details, payment references, and status parameters (`pending`, `confirmed`, `completed`).
4. **CRM Leads (`leads`)**: Captures prospective inquiries originating from the public Contact form or Course Enrollment registrations.
5. **Portal Tasks (`portal_tasks`)**: Tracks checklist deliverables assigned to either the client or Amedee with progress states (`todo`, `in_progress`, `review`, `done`).
6. **Portal Documents Vault (`portal_documents`)**: Catalogs contract files, project drafts, and specifications uploaded by clients or the admin.
7. **Portal Secure Messages (`portal_messages`)**: Real-time communication feed between the client and Amedee.
8. **Portal Active Projects (`portal_projects`)**: Tracks projects currently in progress, including their launch dates and completion percentages.
9. **Portal Payments Ledger (`portal_payments`)**: Stores invoice items, payment status (`paid`, `pending`, `overdue`), and receipt links.
10. **Portal Notifications (`portal_notifications`)**: Manages real-time alerts (meeting schedules, new documents, task completions) for client feeds.
11. **Smart Project Discoveries (`discoveries`)**: Contains answers and calculated outputs generated by the AI Discovery wizard.
12. **Recommendation Rules Engine (`recommendation_rules`)**: Dynamic system that evaluates a client's project answers and matches them to specific project structures, required features, and notes.

---

## 🌐 Localization (i18n)

- **Setup**: Configured using `next-intl`.
- **Supported Languages**: English (`en`) and French (`fr`).
- **Files**:
  - [messages/en.json](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/messages/en.json)
  - [messages/fr.json](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/messages/fr.json)
- **i18n Middleware**: Handled in [middleware.ts](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/middleware.ts), which applies translations to all user routes while ignoring `/admin`, `/api`, and assets to avoid route conflicts.
- **Language Switcher**: Built into the [Header.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/layout/Header.tsx) component.

---

## 🛡️ Security & Authentication

1. **Admin Authentication**:
   - Implemented via a POST request to `/api/auth/login`.
   - Admin credentials are verified against either [db.json](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/db.json) user records (role: `admin`) or environment variable fallbacks (`ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`).
   - Successful log-ins return a secure, HTTP-only cookie containing a JWT (`admin_token`) signed with `jsonwebtoken` and encrypted using `bcryptjs`.
   - Access verification and route protection checks are handled via `/api/auth/status`.

2. **Login Rate-Limiting**:
   - Configured in [lib/rate-limit.ts](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/lib/rate-limit.ts) using an in-memory IP tracker.
   - Restricts logins to a maximum of **5 attempts** within a 15-minute window.
   - Successive violations trigger incremental lockout timers (1 minute, 5 minutes, up to a maximum of 15 minutes) to protect against brute-force attacks.

3. **Client Autologin Link**:
   - Clients bypass complex setups using a lightweight, secure auto-login parameter that retrieves their profile context via LocalStorage triggers.

---

## 🔌 API Endpoints

- **`/api/auth/login` (POST)**: Validates credentials, issues JWT token cookies, and resets rate counters.
- **`/api/auth/status` (GET)**: Decodes token cookies to verify active admin authorization.
- **`/api/auth/logout` (POST)**: Deletes the `admin_token` cookie.
- **`/api/settings` (GET / PATCH / PUT)**: Manages site parameters (e.g. toggles training, changes social links, uploads profile picture).
- **`/api/[resource]/route.ts` (GET / POST)**: A generic, dynamic CRUD routing layer allowing secure read/write actions on lists like:
  - `tasks`
  - `documents`
  - `messages`
  - `projects`
  - `payments`
  - `consultations`
  - `notifications`
  - `leads`
  - `discoveries`
- **`/api/users` (GET / POST)`** & **`/api/users/[id]` (DELETE)**: Handles client onboarding and administrative user lists.

---

## 🖥️ Public Landing Page & Sections

The root site (`/en` or `/fr`) compiles a single-page scrolling interface importing the following layout and section elements:

### Global Framework:
- [Header.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/layout/Header.tsx): Interactive header with brand logo, smooth anchors, and translation toggle.
- [Footer.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/layout/Footer.tsx): Bottom shell containing legal notices, links, and dynamic social buttons.
- [Logo.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/layout/Logo.tsx): Renders custom SVG branding.

### Content Sections:
- [Hero.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/Hero.tsx): Professional intro, profile card showing Amedee's avatar, and a call-to-action to book a consultation or run the diagnostic tool.
- [Statistics.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/Statistics.tsx): Counters displaying years of experience, completed projects, and customer satisfaction rates.
- [Organizations.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/Organizations.tsx): Horizontal logo slider showcasing past employers, partners, and NGOs.
- [About.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/About.tsx): Descriptive bio highlighting consulting approach and engineering philosophies.
- [TechStack.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/TechStack.tsx): Interactive display listing languages, tools, frameworks, and database architectures.
- [Services.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/Services.tsx): Grid of consulting packages (e.g., MVP Construction, Architectural Audits, AI Automations) with detailed specs, pricing tiers, and direct booking links.
- [Projects.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/Projects.tsx): Portfolio items containing deep case studies (Problems, Research, Architecture, Challenges, Solutions, Results, and Lessons Learned) rendered inside full-screen overlay modals.
- [Training.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/Training.tsx): Renders active training courses. If disabled in settings, renders the fallback [ComingSoon.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/ComingSoon.tsx) component instead. Enrolling creates lead items.
- [Blog.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/Blog.tsx): Grid displaying industry articles and tech writings.
- [FAQ.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/FAQ.tsx): Collapsible FAQ accordion.
- [Contact.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/Contact.tsx): Form creating CRM entries in the database.

---

## 🤖 Smart Features

### 1. AI Discovery Wizard (`AIDiscovery.tsx`)
Located at [AIDiscovery.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/sections/AIDiscovery.tsx), this is a **13-step** interactive product evaluation engine:
- **Flow**: Guides users through welcome steps, selecting project types, organizational profiles, business goals, current bottlenecks, target audience sizes, required tech features, budget brackets, timeline expectations, language options, and final summaries.
- **Auto-save**: Saves drafts automatically to LocalStorage.
- **Rule Evaluation**: Queries custom logic from `/api/recommendation-rules` to calculate complexity, target architecture paths (e.g. suggesting database schemas, caching levels), and relevant consulting programs.
- **Lead Creation**: Submitting uploads data records to `/api/discoveries`, creating a permanent project roadmap dashboard.

### 2. Client Portal Workspace (`ClientPortal.tsx`)
A centralized customer cockpit located at [ClientPortal.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/ClientPortal.tsx) containing several modular sub-components:
- [PortalDashboard.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/portal/PortalDashboard.tsx): High-level view showing active checklists, pending alerts, recent messages, and invoice totals.
- [PortalTasks.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/portal/PortalTasks.tsx): Interactive project board showing item deadlines and status updates.
- [PortalConsultations.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/portal/PortalConsultations.tsx): Overview of booked dates, time configurations, meeting links, and questionnaire states.
- [PortalDocuments.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/portal/PortalDocuments.tsx): File manager listing deliverables, assets, contracts, and guidelines.
- [PortalMessages.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/portal/PortalMessages.tsx): Inline client chat messaging system.
- [PortalPayments.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/portal/PortalPayments.tsx): Shows open invoices, past receipts, and payment instructions.
- [PortalDiscoveries.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/components/portal/PortalDiscoveries.tsx): Renders custom generated roadmaps based on the client's submitted AI Discovery forms.

---

## 👑 Admin Panel

The Admin suite provides Amedee with total platform control and is split into two views:
- **Login Page** ([admin/login/page.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/src/app/admin/login/page.tsx)): Form containing error messages, email fields, and password checks protected by rate limit configurations.
- **Dashboard Panel** ([admin/dashboard/page.tsx](file:///c:/Users/Dan-s/Documents/Invictus/portfolio/src/app/admin/dashboard/page.tsx)): A multi-tab dashboard displaying:
  1. **Analytics**: Overview statistics (leads totals, won accounts, pending bookings, active projects).
  2. **CRM Pipeline**: Grid of prospective clients grouped by status (`lead`, `discovery`, `proposal`, `negotiation`, `won`, `lost`).
  3. **Bookings Schedule**: Listing of upcoming client consultations.
  4. **Project Discoveries**: Detail viewer for incoming product diagnostics.
  5. **Site Settings & Payments**: Fields to toggle course catalogs, update avatar URLs, add social platforms, and configure local/international payment pathways.
  6. **Users & Onboarding**: Tool to create and manage client credentials or additional administrative accounts.
