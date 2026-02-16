import { redirect } from "next/navigation";
import { mockUser } from "@/lib/mockUser";

const roleDashboard: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};

export default function HomePage() {
  redirect(roleDashboard[mockUser.role] || "/admin/dashboard");
}
