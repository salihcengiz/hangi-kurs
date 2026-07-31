import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { env } from './env.js';

/**
 * Firebase Admin is initialised lazily and only when all three credentials are
 * present. Without them the whole module stays dormant and `verifyIdToken`
 * returns null — the API keeps serving public data, which is all of v1.
 *
 * This is what lets a teammate clone the repo and run everything without ever
 * opening the Firebase console.
 */
let app: App | null = null;

function getFirebaseApp(): App | null {
  if (!env.isFirebaseConfigured) return null;
  if (app) return app;

  const existing = getApps();
  if (existing.length > 0 && existing[0]) {
    app = existing[0];
    return app;
  }

  app = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      // Private keys are stored in .env with literal \n sequences; turn them
      // back into real newlines or the PEM parser rejects the key.
      privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  return app;
}

/**
 * Verifies a Firebase ID token.
 *
 * Returns null when Firebase is not configured or the token is invalid — the
 * caller decides whether that is fatal (protected route) or fine (optional auth).
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken | null> {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  try {
    return await getAuth(firebaseApp).verifyIdToken(idToken);
  } catch {
    return null;
  }
}

export function isAuthAvailable(): boolean {
  return env.isFirebaseConfigured;
}
