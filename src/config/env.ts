const requiredEnv = {
  API_URL: import.meta.env.VITE_API_URL,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

for (const [name, value] of Object.entries(requiredEnv)) {
  if (!value) throw new Error(`Missing required environment variable: VITE_${name}`);
}

export const env = {
  API_URL: requiredEnv.API_URL,
  SUPABASE_URL: requiredEnv.SUPABASE_URL,
  SUPABASE_ANON_KEY: requiredEnv.SUPABASE_ANON_KEY,
  /** Slug do tenant enviado em X-Tenant-Slug nas requests públicas. */
  DEFAULT_TENANT_SLUG: import.meta.env.VITE_DEFAULT_TENANT_SLUG || 'default',
};
