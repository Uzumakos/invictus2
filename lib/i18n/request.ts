import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { supabase } from "../supabaseClient";

// Helper to expand flat dot-notation keys back into a nested object
function unflatten(flatObj: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in flatObj) {
    const keys = key.split(".");
    let current = result;
    for (let i = 0; i < keys.length; i++) {
      const part = keys[i];
      if (i === keys.length - 1) {
        current[part] = flatObj[key];
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming locale is supported
  if (!locale || !routing.locales.includes(locale as "en" | "fr")) {
    locale = routing.defaultLocale;
  }

  let messages: Record<string, any> | null = null;

  try {
    // Attempt to load translations from Supabase
    const { data, error } = await supabase
      .from("translations")
      .select("key, en, fr");

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const flatObj: Record<string, string> = {};
      data.forEach((row) => {
        flatObj[row.key] = locale === "fr" ? row.fr : row.en;
      });
      messages = unflatten(flatObj);
      console.log(`🌐 Loaded ${data.length} translations dynamically from Supabase for locale: ${locale}`);
    }
  } catch (err: any) {
    console.warn("⚠️ Failed to fetch dynamic translations from Supabase, using local fallback. Error:", err.message || err);
  }

  // Fallback to local files if Supabase load is unsuccessful or empty
  if (!messages) {
    messages = (await import(`../../messages/${locale}.json`)).default;
  }

  return {
    locale,
    messages,
  };
});
