const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'] as const

const OPTIONAL_ENV = [
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OCR_API_URL',
  'NEXT_PUBLIC_APP_URL',
] as const

let warned = false

export function warnAboutRuntimeConfig() {
  if (warned) return
  warned = true

  const missingRequired = REQUIRED_ENV.filter((name) => !process.env[name])
  const missingOptional = OPTIONAL_ENV.filter((name) => !process.env[name])

  if (missingRequired.length > 0) {
    console.warn('[runtime-config] Missing required environment variables', {
      missing: missingRequired,
      impact: 'Authentication or database-backed features may fail until these are configured.',
    })
  }

  if (missingOptional.length > 0) {
    console.warn('[runtime-config] Optional services are not fully configured', {
      missing: missingOptional,
      impact: 'Uploads, OCR, OAuth redirects, or direct migration connections may be disabled.',
    })
  }

  if (!process.env.OCR_API_URL && !process.env.PYTHON_OCR_SERVICE_URL && !process.env.PYTHON_AI_SERVICE_URL) {
    console.warn('[runtime-config] OCR service is not configured; writing practice will save attempts with fallback feedback.')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[runtime-config] SUPABASE_SERVICE_ROLE_KEY is missing; server uploads will use anon credentials when possible.')
  }
}
