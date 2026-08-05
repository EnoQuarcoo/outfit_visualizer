export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  revenueCatApiKey: import.meta.env.VITE_REVENUE_CAT_API_KEY
}