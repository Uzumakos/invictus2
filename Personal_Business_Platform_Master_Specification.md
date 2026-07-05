# PERSONAL BUSINESS PLATFORM — MASTER SPECIFICATION

## Author
Amedee Erns Baptiste

Software Engineer • Product Builder • Digital Marketing Trainer • Digital Transformation Consultant • AI & Automation Specialist

---

# 1. PRODUCT VISION

This project is NOT a portfolio.

It is a **Personal Business & Consulting Platform** designed to:

- Generate high-value consulting leads
- Sell paid consultations
- Manage clients and projects
- Showcase expertise and case studies
- Publish knowledge and insights
- Provide training programs
- Scale into SaaS and digital products

Primary objective:
Convert expertise into a structured, scalable digital consulting business.

---

# 2. CORE PRINCIPLE (CRITICAL)

## EVERYTHING IS EDITABLE

ALL content must be managed via Admin Dashboard:

- Texts
- Pages
- Sections
- Images (URL-based only)
- Translations (EN / FR)
- Navigation
- Buttons
- CTAs
- Case studies
- Services
- Pricing
- FAQs
- Certifications
- Skills
- Testimonials
- Statistics
- SEO metadata
- Blog posts
- Training programs
- Consultation packages
- Availability schedule

❌ NO hardcoded business content
Only layout + logic in code

---

# 3. BRAND POSITIONING

Never refer to this project as a "portfolio".

Allowed terms:

- Consulting Platform
- Digital Business Platform
- Personal Brand Platform
- Technology Advisory Platform
- Digital Transformation Hub

---

# 4. TECH STACK

Frontend:
- Next.js (App Router)
- TypeScript
- TailwindCSS
- ShadCN UI
- Framer Motion
- next-intl (i18n)
- React Hook Form
- Zod

Backend:
- Supabase (PostgreSQL)
- Supabase Auth (RBAC)
- Row Level Security (RLS)

Content:
- Supabase CMS (primary)
- MDX (optional blog rendering only)

Infrastructure:
- Vercel

---

# 5. DESIGN SYSTEM

Colors:

Primary: #27187E
Dark: #121A1B
Background: #F7F7FF
Neutral: #CDD4DD

Design principles:
- Editorial layout
- High whitespace
- Minimalist premium UI
- Strong typography hierarchy
- Subtle shadows
- Soft gradients

Inspired by:
Stripe • Linear • Apple • Vercel • Framer

---

# 6. ANIMATION SYSTEM

Use Framer Motion:

- Page transitions
- Section reveal on scroll
- Card hover elevation
- Counter animations
- Timeline animations
- Modal transitions
- Button micro-interactions

Rules:
- Subtle only
- Performance first
- No decorative overload

---

# 7. INFORMATION ARCHITECTURE

## Navigation

Home
About
Capabilities
Case Studies
Methodology
Training
Insights
Consulting
Contact
Client Portal

Optional:
Resources
Media Kit
Now
Uses

---

# 8. HOMEPAGE (EXECUTIVE SUMMARY)

Homepage is NOT full content.

Each section contains:

- Title
- Short summary
- 3–5 highlights
- CTA button
- "Learn More" link

Sections:

- Hero
- About preview
- Capabilities preview
- Case studies preview
- Training preview
- Insights preview
- Consulting preview
- Testimonials preview
- FAQ preview
- Contact CTA

---

# 9. ABOUT PAGE

Content structure:

- Mission
- Journey (Marketing → Dev → AI → Consulting)
- What I do
- Impact
- Methodology preview
- Vision (Global + Haiti digital transformation)

Tone:
Story-driven, human, strategic

---

# 10. CAPABILITIES PAGE

Replace "Skills"

Pillars:

- Software Engineering
- AI & Automation
- Digital Transformation
- Marketing & Growth
- Training & Consulting

Each includes:
- Business value
- Deliverables
- Use cases
- Technologies

---

# 11. METHODOLOGY PAGE

6-step framework:

Discover → Define → Design → Develop → Deploy → Optimize

Each step includes:
- Objective
- Output
- Tools
- Business impact

---

# 12. CASE STUDIES

Each project includes:

- Problem
- Context
- Architecture
- Tech stack
- Challenges
- Solutions
- Results
- Lessons learned

Projects:
- NEXA 
- NEXA GAMES
- CWO Transportation
- Lyanza
- Government / NGO projects

---

# 13. TRAINING PAGE

Includes:

- Digital Marketing Training (3 years)
- Teacher Digital Literacy (4 years)
- AI Workshops
- Corporate Training
- Government Programs

CMS-managed:
- Programs
- Schedules
- Certifications
- Participants stats

---

# 14. CONSULTING SYSTEM (CORE REVENUE)

Services:

- Software Architecture
- Technical Audit
- AI Integration
- Digital Transformation
- Marketing Strategy
- CTO Advisory
- Training Programs

Each service includes:
- Description
- Deliverables
- Pricing (dynamic CMS)
- Duration
- FAQ

---

# 15. BOOKING SYSTEM (PAID CONSULTATION)

Flow:

Service → Package → Questionnaire → Schedule → Payment → Confirmation

Statuses:
- Pending
- Awaiting Payment
- Confirmed
- Completed
- Cancelled

Features:
- Timezone support
- Availability rules
- Admin-controlled calendar
- Email notifications

---

# 16. CLIENT PORTAL (CRITICAL)

Authenticated workspace:

Features:

- Dashboard
- Meetings history
- Documents
- Tasks
- Messages
- Payments
- AI summaries (future optional)
- Project tracking

Documents:
- Proposals
- Contracts
- Reports
- Invoices

---

# 17. CRM SYSTEM

Lead pipeline:

Lead → Discovery → Proposal → Negotiation → Won → Lost

Data:
- Company
- Budget
- Industry
- Notes
- Source
- Status

---

# 18. ADMIN DASHBOARD (CORE SYSTEM)

Must manage EVERYTHING:

Content:
- Pages
- Sections
- Translations
- Navigation

Business:
- Clients
- Bookings
- Payments
- Services

Knowledge:
- Case studies
- Blog posts
- Training

System:
- SEO
- Analytics
- Settings

---

# 19. MULTI-LANGUAGE SYSTEM

Languages:

- English
- French

Rules:
- No hardcoded text
- Fully CMS-driven translations

---

# 20. SEO SYSTEM

- Dynamic metadata
- OpenGraph
- Twitter cards
- JSON-LD
- Sitemap
- RSS

SEO focus:
Consulting keywords (not developer keywords)

---

# 21. SECURITY

- Supabase RLS
- Role-based access control
- Input validation (Zod)
- Rate limiting
- Secure auth
- Environment isolation

---

# 22. PERFORMANCE

Target:
- Lighthouse 95+

Rules:
- Server Components first
- Lazy loading
- Image optimization
- Minimal JS
- Efficient caching

---

# 23. CLIENT JOURNEY

Flow:

Discover → Trust → Explore → Understand → Engage → Book

No dead ends.

Every page leads to next action.

---

# 24. INTERNAL LINKING

Each page links to:
- Related services
- Case studies
- Consulting

---

# 25. FUTURE EXPANSION

Architecture must support:

- SaaS products
- Online courses
- Membership
- Digital downloads
- AI tools
- Marketplace
- API services

---

# 26. FINAL GOAL

When users land on this platform, they should think:

"This is not a developer portfolio."

"This is a high-level consultant who can design, build and transform digital systems."

---

END OF SPECIFICATION