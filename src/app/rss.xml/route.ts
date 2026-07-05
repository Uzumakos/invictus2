import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amedee.consulting";

  // Fetch articles and projects in parallel
  const [articlesRes, projectsRes] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false }),
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
  ]);

  const articles = articlesRes.data || [];
  const projects = projectsRes.data || [];

  let rssItems = "";

  // 1. Map articles
  articles.forEach((art) => {
    // English Version
    const titleEn = typeof art.title === "string" ? art.title : (art.title?.en || "");
    const excerptEn = typeof art.excerpt === "string" ? art.excerpt : (art.excerpt?.en || "");
    
    rssItems += `
    <item>
      <title><![CDATA[${titleEn}]]></title>
      <link>${baseUrl}/en/insights?article=${art.id}</link>
      <guid>${baseUrl}/en/insights?article=${art.id}</guid>
      <pubDate>${new Date(art.published_at || art.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${excerptEn}]]></description>
      <category><![CDATA[${art.category || "General"}]]></category>
    </item>
    `;

    // French Version
    const titleFr = typeof art.title === "string" ? art.title : (art.title?.fr || titleEn);
    const excerptFr = typeof art.excerpt === "string" ? art.excerpt : (art.excerpt?.fr || excerptEn);

    rssItems += `
    <item>
      <title><![CDATA[${titleFr}]]></title>
      <link>${baseUrl}/fr/insights?article=${art.id}</link>
      <guid>${baseUrl}/fr/insights?article=${art.id}</guid>
      <pubDate>${new Date(art.published_at || art.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${excerptFr}]]></description>
      <category><![CDATA[${art.category || "General"}]]></category>
    </item>
    `;
  });

  // 2. Map case studies (projects)
  projects.forEach((proj) => {
    // English version
    const descEn = typeof proj.description === "string" ? proj.description : (proj.description?.en || "");
    
    rssItems += `
    <item>
      <title><![CDATA[Case Study: ${proj.title}]]></title>
      <link>${baseUrl}/en/case-studies?project=${proj.id}</link>
      <guid>${baseUrl}/en/case-studies?project=${proj.id}</guid>
      <pubDate>${new Date(proj.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${descEn}]]></description>
      <category><![CDATA[Case Study]]></category>
    </item>
    `;

    // French version
    const descFr = typeof proj.description === "string" ? proj.description : (proj.description?.fr || descEn);

    rssItems += `
    <item>
      <title><![CDATA[Étude de Cas : ${proj.title}]]></title>
      <link>${baseUrl}/fr/case-studies?project=${proj.id}</link>
      <guid>${baseUrl}/fr/case-studies?project=${proj.id}</guid>
      <pubDate>${new Date(proj.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${descFr}]]></description>
      <category><![CDATA[Case Study]]></category>
    </item>
    `;
  });

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Amedee Erns Baptiste — Dynamic RSS Feed</title>
    <link>${baseUrl}</link>
    <description>Latest insights on software engineering, AI agent architectures, and digital transformation consulting.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate"
    }
  });
}
