import { UserRole } from "@/types/user";
import type { TranslationKeys } from "@/lib/i18n/fr";

export type MenuItem = {
  labelKey: string;
  path: string;
  module?: string;
};

/* Résout une clé comme "menu.admin.dashboard" dans le dictionnaire */
export function resolveKey(t: TranslationKeys, key: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = t;
  for (const part of key.split(".")) {
    result = result?.[part];
  }
  return typeof result === "string" ? result : key;
}

export const roleMenu: Record<UserRole, MenuItem[]> = {
  ADMIN: [
    { labelKey: "menu.admin.dashboard", path: "/admin/dashboard" },

    { labelKey: "menu.admin.users", path: "/admin/utilisateurs" },
    { labelKey: "menu.admin.students", path: "/admin/students" },
    { labelKey: "menu.admin.teachers", path: "/admin/teachers" },
    { labelKey: "menu.admin.parents", path: "/admin/parents" },
    { labelKey: "menu.admin.staff", path: "/admin/staff" },

    { labelKey: "menu.admin.classes", path: "/admin/classes" },
    { labelKey: "menu.admin.subjects", path: "/admin/subjects" },
    { labelKey: "menu.admin.schedule", path: "/admin/schedule" },
    { labelKey: "menu.admin.schoolYear", path: "/admin/school-year" },

    { labelKey: "menu.admin.exams", path: "/admin/exams" },
    { labelKey: "menu.admin.discipline", path: "/admin/discipline" },
    { labelKey: "menu.admin.performance", path: "/admin/performance" },

    { labelKey: "menu.admin.communication", path: "/admin/communication" },
    { labelKey: "menu.admin.registrar", path: "/admin/registrar" },

    {
      labelKey: "menu.admin.services",
      path: "/admin/services",
      module: "subscription",
    },

    {
      labelKey: "menu.admin.ai",
      path: "/admin/ai",
      module: "ai",
    },

    { labelKey: "menu.admin.support", path: "/admin/support" },
    { labelKey: "menu.admin.security", path: "/admin/security" },
    { labelKey: "menu.admin.settings", path: "/admin/settings" },
  ],

  TEACHER: [
    { labelKey: "menu.teacher.dashboard", path: "/teacher/dashboard" },

    { labelKey: "menu.teacher.classes", path: "/teacher/classes" },
    { labelKey: "menu.teacher.students", path: "/teacher/students" },
    { labelKey: "menu.teacher.grades", path: "/teacher/grades" },
    { labelKey: "menu.teacher.performance", path: "/teacher/performance" },

    { labelKey: "menu.teacher.schedule", path: "/teacher/schedule" },
    { labelKey: "menu.teacher.resources", path: "/teacher/resources" },
    { labelKey: "menu.teacher.communication", path: "/teacher/communication" },

    {
      labelKey: "menu.teacher.ai",
      path: "/teacher/ai",
      module: "ai",
    },

    { labelKey: "menu.teacher.settings", path: "/teacher/settings" },
  ],

  STUDENT: [
    { labelKey: "menu.student.dashboard", path: "/student/dashboard" },

    { labelKey: "menu.student.courses", path: "/student/courses" },
    { labelKey: "menu.student.homework", path: "/student/homework" },
    { labelKey: "menu.student.grades", path: "/student/grades" },
    { labelKey: "menu.student.schedule", path: "/student/schedule" },
    { labelKey: "menu.student.progress", path: "/student/progress" },

    { labelKey: "menu.student.communication", path: "/student/communication" },
    { labelKey: "menu.student.documents", path: "/student/documents" },

    {
      labelKey: "menu.student.ai",
      path: "/student/ai",
      module: "ai",
    },

    { labelKey: "menu.student.settings", path: "/student/settings" },
  ],
};
