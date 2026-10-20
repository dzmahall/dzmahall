/**
 * DzMahall - Authentification Client-Side Google Workspace OAuth 2.0 (Firebase Auth)
 * Respect strict du principe du moindre privilège et mise en cache du jeton en mémoire.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';

// Réutilisation de l'instance Firebase sans réinitialisation concurrente
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Définition des Scopes Google Workspace demandés pour DzMahall
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/calendar.events',
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

// Drapeau d'état de connexion
let isSigningIn = false;

// Mise en cache strictly IN-MEMORY du jeton d'accès (interdiction de localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let tokenIssuedAt: number | null = null;

export interface GoogleAuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  userPhoto: string | null;
}

/**
 * Initialise l'écouteur d'état d'authentification Firebase
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      tokenIssuedAt = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Connexion via popup Google OAuth officielle
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Impossible de récupérer le jeton d’accès OAuth Google.');
    }

    cachedAccessToken = credential.accessToken;
    tokenIssuedAt = Date.now();

    return { 
      user: result.user, 
      accessToken: cachedAccessToken 
    };
  } catch (error: any) {
    console.error('Erreur connexion Google Workspace:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Récupère le jeton en mémoire
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Vérifie si le jeton est encore valide (environ 1h après délivrance)
 */
export const isTokenValid = (): boolean => {
  if (!cachedAccessToken || !tokenIssuedAt) return false;
  const elapsed = Date.now() - tokenIssuedAt;
  return elapsed < 3500 * 1000; // Valide moins de ~58 minutes
};

/**
 * Déconnexion sécurisée et purge du jeton en mémoire
 */
export const logoutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  tokenIssuedAt = null;
};
