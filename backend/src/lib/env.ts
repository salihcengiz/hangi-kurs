import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment contract. Parsed once at boot so a misconfigured deployment fails
 * immediately with a readable message instead of throwing somewhere deep in a
 * request handler.
 *
 * The Firebase block is entirely optional on purpose: a teammate without access
 * to the Firebase console must still be able to run the whole app. When these
 * are absent, auth is disabled and the frontend renders a disabled sign-in
 * button rather than breaking.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required — see README.md'),

  /** Comma-separated list of allowed origins. */
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error(`\n[env] Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === 'production',
  corsOrigins: raw.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  /**
   * True only when all three Firebase Admin credentials are present. Every
   * auth code path checks this first.
   */
  isFirebaseConfigured: Boolean(
    raw.FIREBASE_PROJECT_ID && raw.FIREBASE_CLIENT_EMAIL && raw.FIREBASE_PRIVATE_KEY,
  ),
} as const;
