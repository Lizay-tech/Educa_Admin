"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, LOGIN_URL } from "@/lib/session";

const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN:   "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();

    if (!session) {
      window.location.replace(LOGIN_URL);
      return;
    }

    const dest = ROLE_DASHBOARD[session.user.role] ?? "/admin/dashboard";
    router.replace(dest);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#013486] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Redirection...</p>
      </div>
    </div>
  );
}
