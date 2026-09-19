export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Missing env is tolerated elsewhere (the site renders CMS defaults), but in production it
    // means the database is simply unreachable, so say so loudly at build time.
    if (process.env.VERCEL_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in production.");
    }
    return null;
  }
  if (process.env.VERCEL_ENV === "production" && !url.startsWith("https://")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be an https:// URL in production.");
  }
  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null;
}
