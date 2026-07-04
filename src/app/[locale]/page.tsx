import { setRequestLocale } from "next-intl/server";
import { loadDB } from "../../../lib/db";

// Public Sections
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import Hero from "../../../components/sections/Hero";
import Statistics from "../../../components/sections/Statistics";
import Organizations from "../../../components/sections/Organizations";
import About from "../../../components/sections/About";
import TechStack from "../../../components/sections/TechStack";
import Services from "../../../components/sections/Services";
import Projects from "../../../components/sections/Projects";
import Training from "../../../components/sections/Training";
import ComingSoon from "../../../components/sections/ComingSoon";
import Blog from "../../../components/sections/Blog";
import AIDiscovery from "../../../components/sections/AIDiscovery";
import ClientPortal from "../../../components/ClientPortal";
import FAQ from "../../../components/sections/FAQ";
import Contact from "../../../components/sections/Contact";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Load the seed database server-side to resolve configuration flags & profile pictures
  const db = loadDB() as any;
  const settings = db.settings;
  const profileImageUrl = settings.profileImageUrl || "/default-avatar.png";
  const trainingEnabled = settings.trainingEnabled;
  const socialLinks = settings.socialLinks;

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)] flex flex-col font-sans selection:bg-[var(--color-brand-primary)] selection:text-white">
      <Header />
      
      <main className="flex-1">
        <Hero profileImageUrl={profileImageUrl} />
        
        <div id="stats">
          <Statistics />
        </div>

        <div id="organizations">
          <Organizations organizations={(db.organizations as any[]) || []} />
        </div>

        <div id="about">
          <About />
        </div>

        <div id="tech-stack">
          <TechStack />
        </div>

        <div id="services">
          <Services />
        </div>

        <div id="projects">
          <Projects projects={(db.projects as any[]) || []} />
        </div>

        <div id="training">
          {trainingEnabled ? <Training programs={(db.trainingPrograms as any[]) || []} locale={locale as "en" | "fr"} /> : <ComingSoon />}
        </div>

        <div id="blog">
          <Blog articles={(db.articles as any[]) || []} />
        </div>

        <div id="discovery">
          <AIDiscovery />
        </div>

        <div id="portal">
          <ClientPortal />
        </div>

        <div id="faq">
          <FAQ faqItems={(db.faqItems as any[]) || []} />
        </div>

        <div id="contact">
          <Contact />
        </div>
      </main>

      <Footer socialLinks={socialLinks} />
    </div>
  );
}
