import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amedee.consulting";
  const locales = ["en", "fr"];
  const staticPaths = [
    "",
    "/about",
    "/capabilities",
    "/methodology",
    "/case-studies",
    "/training",
    "/consulting",
    "/payments"
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Generate entries for static pages
  staticPaths.forEach((path) => {
    locales.forEach((locale) => {
      const priority = path === "" ? 1.0 : 0.8;
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: priority,
      });
    });
  });

  // Dynamic Case Studies entries from Supabase
  try {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, created_at");

    if (projects && projects.length > 0) {
      projects.forEach((proj) => {
        locales.forEach((locale) => {
          entries.push({
            url: `${baseUrl}/${locale}/case-studies?project=${proj.id}`,
            lastModified: proj.created_at ? new Date(proj.created_at) : new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
          });
        });
      });
    }
  } catch (err) {
    console.error("Failed to generate dynamic sitemap projects entries:", err);
  }

  return entries;
}
