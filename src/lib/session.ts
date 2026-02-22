import { User, UserRole } from "@/types/user";

// Clés localStorage identiques à celles écrites par educa-login
const KEYS = {
  ACCESS_TOKEN:  "educa_access_token",
  REFRESH_TOKEN: "educa_refresh_token",
  USER:          "educa_user",
} as const;

// URL du portail de connexion (pour la déconnexion / redirection)
export const LOGIN_URL = "https://educa-login.vercel.app";

// Correspondance code rôle backend → rôle frontend
const ROLE_MAP: Record<string, UserRole> = {
  ADMIN_ECOLE: "ADMIN",
  ENSEIGNANT:  "TEACHER",
  ELEVE:       "STUDENT",
  PARENT:      "STUDENT",
};

/** Données brutes telles que stockées par educa-login */
export interface RawUser {
  id:         string;
  email:      string;
  first_name: string;
  last_name:  string;
  role:       string;      // code backend ex: "ADMIN_ECOLE"
  school_id:  string | null;
}

export interface Session {
  accessToken:  string;
  refreshToken: string;
  user:         User;      // format normalisé pour le dashboard
  rawUser:      RawUser;   // données originales du backend
}

/**
 * Lit la session depuis localStorage.
 * Retourne null si aucune session n'est présente ou si l'exécution
 * se fait côté serveur (SSR).
 */
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const accessToken  = localStorage.getItem(KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(KEYS.REFRESH_TOKEN) ?? "";
    const rawStr       = localStorage.getItem(KEYS.USER);

    if (!accessToken || !rawStr) return null;

    const rawUser: RawUser = JSON.parse(rawStr);
    const role: UserRole   = ROLE_MAP[rawUser.role] ?? "STUDENT";

    const user: User = {
      id:    rawUser.id,
      name:  `${rawUser.first_name} ${rawUser.last_name}`.trim(),
      email: rawUser.email,
      role,
    };

    return { accessToken, refreshToken, user, rawUser };
  } catch {
    return null;
  }
}

/** Supprime la session du localStorage. */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.ACCESS_TOKEN);
  localStorage.removeItem(KEYS.REFRESH_TOKEN);
  localStorage.removeItem(KEYS.USER);
}
