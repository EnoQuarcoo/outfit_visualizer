export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
}