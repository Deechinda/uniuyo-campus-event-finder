/** Public Supabase browser client. Never place a service-role key here. */
const SupabaseConfig = (() => {
  const url = "https://tivvjvyaddwqtfvsbsld.supabase.co";
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdnZqdnlhZGR3cXRmdnNic2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMTYxMTEsImV4cCI6MjEwNjY5MjExMX0.rLpXkDCY-ZSt6S0g-V_bByrda7Jj7oWpzZHWPeerp8k";
  const configured = Boolean(window.supabase && url.startsWith("https://") && anonKey.length > 40);
  const client = configured ? window.supabase.createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  }) : null;
  return { url, anonKey, configured, client };
})();
