"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_URL } from "@/lib/session";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    // Le hash ressemble à :
    // #at=ACCESS_TOKEN&rt=REFRESH_TOKEN&u=USER_JSON&dest=/admin/dashboard
    const hash = window.location.hash.slice(1); // supprimer le "#"

    if (!hash) {
      window.location.replace(LOGIN_URL);
      return;
    }

    try {
      const params = new URLSearchParams(hash);
      const at   = params.get("at");
      const rt   = params.get("rt");
      const u    = params.get("u");
      const dest = params.get("dest") || "/admin/dashboard";

      if (!at || !u) {
        window.location.replace(LOGIN_URL);
        return;
      }

      // Stocker la session dans le localStorage d'educa-admin
      localStorage.setItem("educa_access_token", at);
      if (rt) localStorage.setItem("educa_refresh_token", rt);
      localStorage.setItem("educa_user", u);

      // Effacer le hash de l'URL (tokens hors historique du navigateur)
      history.replaceState(null, "", dest);

      // Rediriger vers le dashboard
      router.replace(dest);
    } catch {
      setError(true);
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center space-y-3">
          <p className="text-red-600 font-medium">Erreur d&apos;authentification.</p>
          <a
            href={LOGIN_URL}
            className="text-sm text-[#013486] underline hover:text-[#F35403]"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#013486] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Authentification en cours...</p>
      </div>
    </div>
  );
}
