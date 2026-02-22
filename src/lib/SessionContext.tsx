"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getSession, clearSession, Session, LOGIN_URL } from "./session";

interface SessionContextValue {
  session: Session;
  logout:  () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Enveloppe les pages authentifiées.
 * – Redirige vers educa-login si aucune session n'est trouvée.
 * – Affiche un écran de chargement le temps de lire le localStorage.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      window.location.replace(LOGIN_URL);
      return;
    }
    setSession(s);
    setChecked(true);
  }, []);

  const logout = () => {
    clearSession();
    window.location.replace(LOGIN_URL);
  };

  // Écran de chargement pendant la vérification de session
  if (!checked || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#013486] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

/** Hook pour accéder à la session dans n'importe quel composant client. */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession doit être utilisé dans un SessionProvider");
  return ctx;
}
