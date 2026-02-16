"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  BookMarked, Users, Search, ChevronLeft, ChevronRight,
  Eye, Filter, Download, Plus, FileText, FileSpreadsheet, Printer,
  ChevronDown, MoreHorizontal, Edit3, Trash2, X, Mail, Phone,
  ArrowUpDown, CheckSquare, Square, Clock, UserCheck, TrendingUp,
  Award, Archive, ClipboardList, BookOpen, GraduationCap,
  Table2, Activity, Layers, BarChart3, Hash,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  LineChart, Line,
} from "recharts";

/* ================================================================
   TYPES
================================================================ */

type SubjectStatus = "active" | "inactive" | "archived";
type Department = "sciences" | "languages" | "humanities" | "arts" | "tech" | "physed";

interface SubjectTeacher {
  id: string;
  firstName: string;
  lastName: string;
  classes: string[];
  hoursPerWeek: number;
  email: string;
  phone: string;
  experience: number;
  role: "main" | "substitute";
}

interface SubjectClass {
  id: string;
  name: string;
  section: string;
  teacher: string;
  hours: number;
  average: number;
  studentCount: number;
}

interface ProgramChapter {
  id: string;
  title: string;
  topics: string[];
  duration: number;
  trimester: 1 | 2 | 3;
  status: "completed" | "inProgress" | "upcoming";
}

interface ClassGrade {
  className: string;
  classAvg: number;
  highest: number;
  lowest: number;
  above70: number;
  below50: number;
  studentCount: number;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  department: Department;
  coefficient: number;
  hoursPerWeek: number;
  totalHoursYear: number;
  description: string;
  levels: string[];
  teacherCount: number;
  classCount: number;
  average: number;
  passRate: number;
  status: SubjectStatus;
  schoolYear: string;
  createdAt: string;
}

interface SubjectDetails {
  teachers: SubjectTeacher[];
  classes: SubjectClass[];
  program: ProgramChapter[];
  grades: ClassGrade[];
  performanceTrend: { month: string; avg: number }[];
}

/* ================================================================
   MOCK DATA
================================================================ */

const allSubjects: Subject[] = [
  { id: "SJ-001", code: "MATH", name: "Mathématiques", department: "sciences", coefficient: 4, hoursPerWeek: 5, totalHoursYear: 180, description: "Algèbre, géométrie, arithmétique et statistiques", levels: ["NS1", "NS2", "NS3", "NS4", "Philo"], teacherCount: 4, classCount: 10, average: 68, passRate: 72, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-002", code: "FRAN", name: "Français", department: "languages", coefficient: 3, hoursPerWeek: 4, totalHoursYear: 144, description: "Grammaire, littérature, rédaction et communication", levels: ["NS1", "NS2", "NS3", "NS4", "Philo"], teacherCount: 3, classCount: 10, average: 72, passRate: 78, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-003", code: "SCI", name: "Sciences Naturelles", department: "sciences", coefficient: 3, hoursPerWeek: 4, totalHoursYear: 144, description: "Biologie, chimie et physique de base", levels: ["NS1", "NS2", "NS3", "NS4"], teacherCount: 3, classCount: 8, average: 65, passRate: 68, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-004", code: "HIST", name: "Histoire", department: "humanities", coefficient: 2, hoursPerWeek: 3, totalHoursYear: 108, description: "Histoire d'Haïti, des Caraïbes et mondiale", levels: ["NS1", "NS2", "NS3", "NS4", "Philo"], teacherCount: 2, classCount: 10, average: 70, passRate: 75, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-005", code: "ANG", name: "Anglais", department: "languages", coefficient: 2, hoursPerWeek: 3, totalHoursYear: 108, description: "Grammaire, vocabulaire, expression orale et écrite", levels: ["NS1", "NS2", "NS3", "NS4", "Philo"], teacherCount: 2, classCount: 10, average: 58, passRate: 62, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-006", code: "GEO", name: "Géographie", department: "humanities", coefficient: 2, hoursPerWeek: 2, totalHoursYear: 72, description: "Géographie physique et humaine d'Haïti et du monde", levels: ["NS1", "NS2", "NS3", "NS4"], teacherCount: 2, classCount: 8, average: 66, passRate: 70, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-007", code: "PHCH", name: "Physique-Chimie", department: "sciences", coefficient: 3, hoursPerWeek: 4, totalHoursYear: 144, description: "Mécanique, optique, chimie organique et inorganique", levels: ["NS3", "NS4", "Philo"], teacherCount: 2, classCount: 5, average: 60, passRate: 64, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-008", code: "PHIL", name: "Philosophie", department: "humanities", coefficient: 3, hoursPerWeek: 4, totalHoursYear: 144, description: "Logique, épistémologie, morale et philosophie politique", levels: ["Philo"], teacherCount: 1, classCount: 1, average: 71, passRate: 74, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-009", code: "CREA", name: "Créole Haïtien", department: "languages", coefficient: 2, hoursPerWeek: 2, totalHoursYear: 72, description: "Grammaire créole, littérature haïtienne et expression orale", levels: ["NS1", "NS2", "NS3", "NS4"], teacherCount: 2, classCount: 8, average: 82, passRate: 88, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-010", code: "EDPH", name: "Éducation Physique", department: "physed", coefficient: 1, hoursPerWeek: 2, totalHoursYear: 72, description: "Sports, gymnastique et santé physique", levels: ["NS1", "NS2", "NS3", "NS4", "Philo"], teacherCount: 2, classCount: 10, average: 80, passRate: 92, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-011", code: "INFO", name: "Informatique", department: "tech", coefficient: 1, hoursPerWeek: 2, totalHoursYear: 72, description: "Initiation à l'informatique, bureautique et programmation", levels: ["NS2", "NS3", "NS4"], teacherCount: 1, classCount: 6, average: 74, passRate: 80, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-012", code: "ARTS", name: "Arts Plastiques", department: "arts", coefficient: 1, hoursPerWeek: 2, totalHoursYear: 72, description: "Dessin, peinture et histoire de l'art haïtien", levels: ["NS1", "NS2"], teacherCount: 1, classCount: 4, average: 78, passRate: 85, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-013", code: "MUSQ", name: "Musique", department: "arts", coefficient: 1, hoursPerWeek: 1, totalHoursYear: 36, description: "Théorie musicale et pratique instrumentale", levels: ["NS1", "NS2"], teacherCount: 1, classCount: 4, average: 76, passRate: 82, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-014", code: "ESP", name: "Espagnol", department: "languages", coefficient: 2, hoursPerWeek: 2, totalHoursYear: 72, description: "Initiation et perfectionnement en langue espagnole", levels: ["NS3", "NS4", "Philo"], teacherCount: 1, classCount: 5, average: 64, passRate: 67, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-01" },
  { id: "SJ-015", code: "LAT", name: "Latin", department: "languages", coefficient: 1, hoursPerWeek: 1, totalHoursYear: 36, description: "Initiation au latin", levels: ["Philo"], teacherCount: 1, classCount: 1, average: 0, passRate: 0, status: "archived", schoolYear: "2023-2024", createdAt: "2023-08-01" },
];

function getSubjectDetails(sub: Subject): SubjectDetails {
  const idx = parseInt(sub.id.replace("SJ-0", ""), 10);
  const firstNames = ["Jean", "Marie", "Paul", "Claire", "Frantz", "Sophie", "Luc", "Rose"];
  const lastNames = ["Pierre", "Augustin", "Baptiste", "Joseph", "Michel", "Clerveau", "Toussaint", "Exanté"];

  const teachers: SubjectTeacher[] = Array.from({ length: sub.teacherCount }, (_, i) => {
    const fi = (i + idx) % 8;
    const li = (i + idx + 1) % 8;
    return {
      id: `T-${String(i + 1 + idx).padStart(2, "0")}`,
      firstName: firstNames[fi],
      lastName: lastNames[li],
      classes: sub.levels.slice(0, Math.min(3, sub.levels.length)).map((l, j) => `${l}-${["A", "B"][j % 2]}`),
      hoursPerWeek: Math.max(2, sub.hoursPerWeek - i),
      email: `${firstNames[fi].toLowerCase()}.${lastNames[li].toLowerCase()}@educa.ht`,
      phone: `509-${3000 + idx * 100 + i * 11}-${1000 + i * 111}`,
      experience: 3 + ((idx + i) * 2) % 15,
      role: i === 0 ? "main" : "substitute",
    };
  });

  const classes: SubjectClass[] = sub.levels.flatMap((lv, li) =>
    ["A", "B"].slice(0, li < 3 ? 2 : 1).map((sec, si) => ({
      id: `CL-${String(li * 2 + si + 1).padStart(3, "0")}`,
      name: lv,
      section: sec,
      teacher: `${firstNames[(li + idx) % 8]} ${lastNames[(li + idx + 1) % 8]}`,
      hours: sub.hoursPerWeek,
      average: Math.max(35, Math.min(95, sub.average + ((idx * (li + 1) * 3) % 20) - 10)),
      studentCount: 28 + ((idx + li) % 12),
    }))
  ).slice(0, sub.classCount);

  const chapterTitles: Record<string, string[][]> = {
    sciences: [
      ["Nombres et opérations", "Équations linéaires", "Géométrie plane"],
      ["Fonctions", "Statistiques", "Probabilités"],
      ["Trigonométrie", "Révisions", "Examens finaux"],
    ],
    languages: [
      ["Grammaire de base", "Vocabulaire thématique", "Compréhension orale"],
      ["Rédaction", "Littérature", "Expression écrite"],
      ["Projet oral", "Révisions", "Examens finaux"],
    ],
    humanities: [
      ["Préhistoire et Antiquité", "Moyen Âge", "Temps modernes"],
      ["Révolution haïtienne", "Histoire contemporaine", "Géopolitique"],
      ["Projets de recherche", "Révisions", "Examens finaux"],
    ],
    arts: [
      ["Techniques de base", "Couleurs et formes", "Art haïtien"],
      ["Projets créatifs", "Composition", "Expositions"],
      ["Projet final", "Révisions", "Présentation"],
    ],
    tech: [
      ["Introduction à l'ordinateur", "Bureautique", "Internet"],
      ["Programmation de base", "HTML/CSS", "Bases de données"],
      ["Projet informatique", "Révisions", "Examens finaux"],
    ],
    physed: [
      ["Athlétisme", "Gymnastique", "Sports collectifs"],
      ["Basketball", "Football", "Volleyball"],
      ["Compétitions", "Évaluation physique", "Remise de prix"],
    ],
  };

  const chaptersForDept = chapterTitles[sub.department] || chapterTitles.sciences;
  const program: ProgramChapter[] = chaptersForDept.flatMap((trimTopics, ti) =>
    trimTopics.map((title, ci) => ({
      id: `CH-${ti + 1}-${ci + 1}`,
      title,
      topics: [`Leçon ${ci * 3 + 1}`, `Leçon ${ci * 3 + 2}`, `Leçon ${ci * 3 + 3}`],
      duration: Math.max(6, sub.hoursPerWeek * 2 + ((idx + ci) % 4)),
      trimester: (ti + 1) as 1 | 2 | 3,
      status: ti === 0 ? "completed" : ti === 1 ? (ci < 2 ? "completed" : "inProgress") : "upcoming",
    }))
  );

  const grades: ClassGrade[] = classes.slice(0, 6).map(c => ({
    className: `${c.name} ${c.section}`,
    classAvg: c.average,
    highest: Math.min(100, c.average + 18 + (idx % 5)),
    lowest: Math.max(10, c.average - 25 - (idx % 7)),
    above70: Math.round(c.studentCount * (c.average / 130)),
    below50: Math.round(c.studentCount * Math.max(0, (60 - c.average) / 100)),
    studentCount: c.studentCount,
  }));

  const performanceTrend = ["Sep", "Oct", "Nov", "Déc", "Jan", "Fév"].map((m, i) => ({
    month: m,
    avg: Math.max(40, Math.min(95, sub.average + ((idx * (i + 1) * 3) % 15) - 7)),
  }));

  return { teachers, classes, program, grades, performanceTrend };
}

const COLORS = ["#013486", "#2563EB", "#F35403", "#F97316", "#10B981", "#8B5CF6"];

/* ================================================================
   HELPERS
================================================================ */

type SP = ReturnType<typeof useTranslation>["t"]["subjectsPage"];

const statusColor: Record<SubjectStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-gray-100 text-gray-600",
  archived: "bg-red-100 text-red-700",
};

function getStatusLabel(s: SubjectStatus, sp: SP) {
  const map: Record<SubjectStatus, string> = { active: sp.statusActive, inactive: sp.statusInactive, archived: sp.statusArchived };
  return map[s];
}

function getDeptLabel(d: Department, sp: SP) {
  const map: Record<Department, string> = { sciences: sp.deptSciences, languages: sp.deptLanguages, humanities: sp.deptHumanities, arts: sp.deptArts, tech: sp.deptTech, physed: sp.deptPhysEd };
  return map[d];
}

const deptGradient: Record<Department, string> = {
  sciences: "from-blue-500 to-blue-700",
  languages: "from-violet-500 to-violet-700",
  humanities: "from-amber-500 to-amber-700",
  arts: "from-fuchsia-500 to-fuchsia-700",
  tech: "from-cyan-500 to-cyan-700",
  physed: "from-emerald-500 to-emerald-700",
};

const deptIcon: Record<Department, string> = {
  sciences: "🔬",
  languages: "📖",
  humanities: "🏛️",
  arts: "🎨",
  tech: "💻",
  physed: "⚽",
};

function buildPrintableHTML(subjects: Subject[], sp: SP) {
  const rows = subjects.map(s => `<tr><td>${s.code}</td><td>${s.name}</td><td>${getDeptLabel(s.department, sp)}</td><td>${s.coefficient}</td><td>${s.hoursPerWeek}</td><td>${s.teacherCount}</td><td>${s.classCount}</td><td>${s.average > 0 ? s.average + "%" : "—"}</td><td>${getStatusLabel(s.status, sp)}</td></tr>`).join("");
  return `<!DOCTYPE html><html><head><title>${sp.filterTitle}</title><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#013486;color:white}</style></head><body><h2>${sp.filterTitle}</h2><table><thead><tr><th>${sp.colCode}</th><th>${sp.colSubject}</th><th>${sp.colDepartment}</th><th>${sp.colCoefficient}</th><th>${sp.colHours}</th><th>${sp.colTeachers}</th><th>${sp.colClasses}</th><th>${sp.colAverage}</th><th>${sp.colStatus}</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ================================================================
   MODAL
================================================================ */

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function AddSubjectModal({ open, onClose, sp }: { open: boolean; onClose: () => void; sp: SP }) {
  return (
    <Modal open={open} onClose={onClose} title={sp.addSubjectTitle}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sp.fieldName}</label>
            <input type="text" placeholder="Ex: Mathématiques" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sp.fieldCode}</label>
            <input type="text" placeholder="Ex: MATH" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{sp.fieldDepartment}</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
            <option value="">{sp.selectDepartment}</option>
            {(["sciences", "languages", "humanities", "arts", "tech", "physed"] as Department[]).map(d => (
              <option key={d} value={d}>{getDeptLabel(d, sp)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sp.fieldCoefficient}</label>
            <input type="number" placeholder="3" min="1" max="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{sp.fieldHours}</label>
            <input type="number" placeholder="4" min="1" max="10" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{sp.fieldDescription}</label>
          <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{sp.fieldLevels}</label>
          <div className="flex flex-wrap gap-2">
            {["NS1", "NS2", "NS3", "NS4", "Philo"].map(l => (
              <label key={l} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="rounded" />
                {l}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{sp.confirm === "Confirmer" ? "Annuler" : "Anile"}</button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-white bg-[#013486] hover:bg-[#013486]/90 rounded-lg">{sp.createSubject}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   SUBJECT DRAWER
================================================================ */

function SubjectDrawer({ sub, onClose, sp }: { sub: Subject; onClose: () => void; sp: SP }) {
  const [tab, setTab] = useState<"overview" | "program" | "teachers" | "classes" | "grades" | "actions">("overview");
  const details = useMemo(() => getSubjectDetails(sub), [sub]);
  const grad = deptGradient[sub.department];

  const tabs = [
    { key: "overview" as const, label: sp.tabOverview },
    { key: "program" as const, label: sp.tabProgram },
    { key: "teachers" as const, label: sp.tabTeachers },
    { key: "classes" as const, label: sp.tabClasses },
    { key: "grades" as const, label: sp.tabGrades },
    { key: "actions" as const, label: sp.tabActions },
  ];

  const programCompletion = details.program.length > 0
    ? Math.round((details.program.filter(p => p.status === "completed").length / details.program.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center gap-4 p-5">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
              {deptIcon[sub.department]}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{sub.name}</h2>
              <p className="text-sm text-gray-500">{sub.code} · {getDeptLabel(sub.department, sp)}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[sub.status]}`}>{getStatusLabel(sub.status, sp)}</span>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>
          <div className="flex gap-1 px-5 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? "border-[#013486] text-[#013486]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* ===== OVERVIEW ===== */}
          {tab === "overview" && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">{sp.subjectInfo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {([
                    [sp.subjectName, sub.name],
                    [sp.subjectCode, sub.code],
                    [sp.department, getDeptLabel(sub.department, sp)],
                    [sp.coefficient, String(sub.coefficient)],
                    [sp.hoursPerWeek, `${sub.hoursPerWeek}h`],
                    [sp.totalHoursYear, `${sub.totalHoursYear}h`],
                    [sp.schoolYear, sub.schoolYear],
                    [sp.createdAt, sub.createdAt],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-gray-500 text-xs">{k}</span>
                      <p className="font-medium text-gray-800">{v}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <span className="text-gray-500 text-xs">{sp.description}</span>
                  <p className="text-sm text-gray-700 mt-0.5">{sub.description}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">{sp.levelsCovered}</span>
                  <div className="flex gap-1.5 mt-1">
                    {sub.levels.map(l => (
                      <span key={l} className="px-2 py-0.5 bg-[#013486]/10 text-[#013486] text-xs font-medium rounded-full">{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* stats */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{sp.subjectStats}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    [sp.overallAverage, sub.average > 0 ? `${sub.average}%` : "—", sub.average >= 70 ? "text-emerald-600" : sub.average >= 50 ? "text-amber-600" : "text-red-600"],
                    [sp.passRate, sub.passRate > 0 ? `${sub.passRate}%` : "—", sub.passRate >= 75 ? "text-emerald-600" : "text-amber-600"],
                    [sp.bestClassAvg, `${Math.min(100, sub.average + 15)}%`, "text-emerald-600"],
                    [sp.worstClassAvg, `${Math.max(25, sub.average - 18)}%`, "text-red-600"],
                    [sp.totalStudents, `${sub.classCount * 33}`, "text-[#013486]"],
                    [sp.totalExams, `${sub.classCount * 3}`, "text-violet-600"],
                    [sp.completionRate, `${programCompletion}%`, programCompletion >= 50 ? "text-emerald-600" : "text-amber-600"],
                    [sp.avgExamScore, sub.average > 0 ? `${Math.max(40, sub.average - 3)}%` : "—", "text-gray-600"],
                  ] as [string, string, string][]).map(([label, val, color]) => (
                    <div key={label} className="bg-white rounded-lg p-3">
                      <span className="text-xs text-gray-500">{label}</span>
                      <p className={`text-lg font-bold ${color}`}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* performance trend */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{sp.performanceTrend}</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={details.performanceTrend}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[30, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avg" stroke="#013486" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ===== PROGRAM TAB ===== */}
          {tab === "program" && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">{sp.programTitle}</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg hover:bg-[#013486]/90">
                  <Plus size={14} />{sp.addChapter}
                </button>
              </div>

              {/* completion bar */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{sp.completionRate}</span>
                  <span className="font-medium">{programCompletion}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#013486] rounded-full" style={{ width: `${programCompletion}%` }} />
                </div>
              </div>

              {[1, 2, 3].map(tri => {
                const triChapters = details.program.filter(p => p.trimester === tri);
                if (triChapters.length === 0) return null;
                const triLabel = tri === 1 ? sp.trimester1 : tri === 2 ? sp.trimester2 : sp.trimester3;
                return (
                  <div key={tri}>
                    <h4 className="text-xs font-semibold text-[#013486] uppercase mb-2">{triLabel}</h4>
                    <div className="space-y-2">
                      {triChapters.map(ch => (
                        <div key={ch.id} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{ch.title}</p>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {ch.topics.map(t => (
                                  <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{t}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{ch.duration} {sp.hours}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ch.status === "completed" ? "bg-emerald-100 text-emerald-700" : ch.status === "inProgress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                                {ch.status === "completed" ? sp.completed : ch.status === "inProgress" ? sp.inProgress : sp.upcoming}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* ===== TEACHERS TAB ===== */}
          {tab === "teachers" && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">{sp.assignedTeachers} ({details.teachers.length})</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg hover:bg-[#013486]/90">
                  <Plus size={14} />{sp.addTeacher}
                </button>
              </div>
              <div className="space-y-3">
                {details.teachers.map(t => (
                  <div key={t.id} className={`border rounded-xl p-4 ${t.role === "main" ? "border-[#013486] bg-blue-50/50" : "border-gray-200"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#013486] to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {t.firstName[0]}{t.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{t.firstName} {t.lastName}</p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${t.role === "main" ? "bg-[#013486] text-white" : "bg-gray-200 text-gray-600"}`}>
                            {t.role === "main" ? sp.mainTeacher : sp.substitute}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {t.classes.map(c => (
                            <span key={c} className="px-2 py-0.5 bg-[#013486]/10 text-[#013486] text-xs rounded">{c}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={12} />{t.hoursPerWeek}h/sem.</span>
                          <span className="flex items-center gap-1"><Award size={12} />{t.experience} {sp.yearsExp}</span>
                          <span className="flex items-center gap-1"><Mail size={12} />{t.email}</span>
                          <span className="flex items-center gap-1"><Phone size={12} />{t.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ===== CLASSES TAB ===== */}
          {tab === "classes" && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">{sp.classesUsing} ({details.classes.length})</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg hover:bg-[#013486]/90">
                  <Plus size={14} />{sp.addClass}
                </button>
              </div>
              {details.classes.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs text-gray-500">{sp.className}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{sp.classSection}</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">{sp.classTeacher}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{sp.classHours}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{sp.classAverage}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.classes.map(c => (
                        <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                          <td className="px-3 py-3 text-center text-gray-600">{c.section}</td>
                          <td className="px-4 py-3 text-gray-600">{c.teacher}</td>
                          <td className="px-3 py-3 text-center text-gray-600">{c.hours}h</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`font-semibold ${c.average >= 70 ? "text-emerald-600" : c.average >= 50 ? "text-amber-600" : "text-red-600"}`}>{c.average}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">{sp.noClasses}</div>
              )}
            </>
          )}

          {/* ===== GRADES TAB ===== */}
          {tab === "grades" && (
            <>
              <h3 className="text-sm font-semibold text-gray-800">{sp.gradesOverview}</h3>
              {details.grades.length > 0 ? (
                <>
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-4 py-3 text-xs text-gray-500">{sp.classLabel}</th>
                          <th className="text-center px-3 py-3 text-xs text-gray-500">{sp.classAvg}</th>
                          <th className="text-center px-3 py-3 text-xs text-gray-500">{sp.highestGrade}</th>
                          <th className="text-center px-3 py-3 text-xs text-gray-500">{sp.lowestGrade}</th>
                          <th className="text-center px-3 py-3 text-xs text-gray-500">{sp.studentsAbove}</th>
                          <th className="text-center px-3 py-3 text-xs text-gray-500">{sp.studentsBelow}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.grades.map(g => (
                          <tr key={g.className} className="border-t border-gray-100">
                            <td className="px-4 py-3 font-medium text-gray-800">{g.className}</td>
                            <td className="px-3 py-3 text-center">
                              <span className={`font-semibold ${g.classAvg >= 70 ? "text-emerald-600" : g.classAvg >= 50 ? "text-amber-600" : "text-red-600"}`}>{g.classAvg}%</span>
                            </td>
                            <td className="px-3 py-3 text-center text-emerald-600 font-medium">{g.highest}</td>
                            <td className="px-3 py-3 text-center text-red-600 font-medium">{g.lowest}</td>
                            <td className="px-3 py-3 text-center text-emerald-600">{g.above70}/{g.studentCount}</td>
                            <td className="px-3 py-3 text-center text-red-600">{g.below50}/{g.studentCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">{sp.gradeDistribution}</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={details.grades}>
                        <XAxis dataKey="className" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="classAvg" fill="#013486" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">{sp.noGrades}</div>
              )}
            </>
          )}

          {/* ===== ACTIONS TAB ===== */}
          {tab === "actions" && (
            <div className="space-y-3">
              {([
                [Edit3, sp.actionEditSubject, sp.actionEditSubjectDesc, "bg-blue-50 text-[#013486]"],
                [BookOpen, sp.actionManageProgram, sp.actionManageProgramDesc, "bg-indigo-50 text-indigo-600"],
                [UserCheck, sp.actionAssignTeacher, sp.actionAssignTeacherDesc, "bg-violet-50 text-violet-600"],
                [Layers, sp.actionAssignClasses, sp.actionAssignClassesDesc, "bg-cyan-50 text-cyan-600"],
                [FileText, sp.actionExportGrades, sp.actionExportGradesDesc, "bg-emerald-50 text-emerald-600"],
                [ClipboardList, sp.actionExportProgram, sp.actionExportProgramDesc, "bg-teal-50 text-teal-600"],
                [Printer, sp.actionPrintSummary, sp.actionPrintSummaryDesc, "bg-gray-50 text-gray-600"],
                [Archive, sp.actionArchive, sp.actionArchiveDesc, "bg-amber-50 text-amber-600"],
                [Trash2, sp.actionDelete, sp.actionDeleteDesc, "bg-red-50 text-red-600"],
              ] as const).map(([Icon, title, desc, color]) => (
                <button key={title} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left">
                  <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function AdminSubjectsPage() {
  const { t } = useTranslation();
  const sp = t.subjectsPage;

  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerSubject, setDrawerSubject] = useState<Subject | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false);
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) setShowActionMenu(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* filtering & sorting */
  const filtered = useMemo(() => {
    let result = [...allSubjects];
    if (filterDept !== "all") result = result.filter(s => s.department === filterDept);
    if (filterStatus !== "all") result = result.filter(s => s.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        getDeptLabel(s.department, sp).toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let va: number | string = "", vb: number | string = "";
      switch (sortCol) {
        case "name": va = a.name; vb = b.name; break;
        case "department": va = a.department; vb = b.department; break;
        case "coefficient": va = a.coefficient; vb = b.coefficient; break;
        case "hours": va = a.hoursPerWeek; vb = b.hoursPerWeek; break;
        case "average": va = a.average; vb = b.average; break;
        case "status": va = a.status; vb = b.status; break;
      }
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return result;
  }, [filterDept, filterStatus, search, sortCol, sortDir, sp]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = useCallback((col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }, [sortCol]);

  const toggleSelect = (id: string) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setSelected(prev => prev.size === paged.length ? new Set() : new Set(paged.map(s => s.id)));

  /* chart data */
  const activeSubjects = allSubjects.filter(s => s.status !== "archived");

  const deptChartData = useMemo(() => {
    const map: Record<string, number> = {};
    activeSubjects.forEach(s => { map[s.department] = (map[s.department] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: getDeptLabel(name as Department, sp), value }));
  }, [sp]);

  const performanceChartData = useMemo(() => {
    return activeSubjects.filter(s => s.average > 0).map(s => ({ name: s.code, avg: s.average }));
  }, []);

  const hoursChartData = useMemo(() => {
    return activeSubjects.map(s => ({ name: s.code, hours: s.hoursPerWeek }));
  }, []);

  const coeffChartData = useMemo(() => {
    const map: Record<number, number> = {};
    activeSubjects.forEach(s => { map[s.coefficient] = (map[s.coefficient] || 0) + 1; });
    return Object.entries(map).map(([coeff, count]) => ({ name: `Coeff. ${coeff}`, value: count }));
  }, []);

  /* stats */
  const totalTeachers = activeSubjects.reduce((s, sub) => s + sub.teacherCount, 0);
  const avgHours = activeSubjects.length > 0 ? (activeSubjects.reduce((s, sub) => s + sub.hoursPerWeek, 0) / activeSubjects.length).toFixed(1) : "0";
  const avgCoeff = activeSubjects.length > 0 ? (activeSubjects.reduce((s, sub) => s + sub.coefficient, 0) / activeSubjects.length).toFixed(1) : "0";
  const highAvg = activeSubjects.filter(s => s.average > 0).reduce((max, s) => s.average > max ? s.average : max, 0);
  const lowAvg = activeSubjects.filter(s => s.average > 0).reduce((min, s) => s.average < min ? s.average : min, 100);

  /* export */
  const handleExportCSV = () => {
    const header = "Code,Matière,Département,Coeff.,Heures/sem.,Enseignants,Classes,Moyenne,Statut\n";
    const rows = filtered.map(s => `${s.code},${s.name},${getDeptLabel(s.department, sp)},${s.coefficient},${s.hoursPerWeek},${s.teacherCount},${s.classCount},${s.average > 0 ? s.average + "%" : "—"},${getStatusLabel(s.status, sp)}`).join("\n");
    downloadBlob(header + rows, "matieres.csv", "text/csv");
  };

  const handlePrint = () => {
    const html = buildPrintableHTML(filtered, sp);
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  const pageWindow = useMemo(() => {
    const w: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) w.push(i);
    return w;
  }, [page, totalPages]);

  const resetFilters = () => { setFilterDept("all"); setFilterStatus("all"); setSearch(""); setPage(1); };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.subjects.title}
        description={t.pages.admin.subjects.desc}
        icon={<BookMarked size={20} />}
      />

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {([
          [BookMarked, sp.totalSubjects, activeSubjects.length, "bg-[#013486]/10 text-[#013486]"],
          [BookOpen, sp.activeSubjects, activeSubjects.filter(s => s.status === "active").length, "bg-blue-100 text-blue-600"],
          [Users, sp.totalTeachers, totalTeachers, "bg-indigo-100 text-indigo-600"],
          [Clock, sp.avgHoursPerWeek, `${avgHours}h`, "bg-violet-100 text-violet-600"],
          [Hash, sp.avgCoefficient, avgCoeff, "bg-amber-100 text-amber-600"],
          [TrendingUp, sp.highestAvg, `${highAvg}%`, "bg-emerald-100 text-emerald-600"],
          [Activity, sp.lowestAvg, `${lowAvg}%`, "bg-[#F35403]/10 text-[#F35403]"],
        ] as const).map(([Icon, label, value, color]) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-2`}><Icon size={18} /></div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{sp.subjectsByDepartment}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={deptChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {deptChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{sp.performanceBySubject}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={performanceChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={45} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avg" fill="#013486" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{sp.hoursDistribution}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hoursChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#F35403" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{sp.coefficientDistribution}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={coeffChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {coeffChartData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">{sp.filterTitle}</h3>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} {filtered.length <= 1 ? sp.result : sp.results}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
            <option value="all">{sp.allDepartments}</option>
            {(["sciences", "languages", "humanities", "arts", "tech", "physed"] as Department[]).map(d => (
              <option key={d} value={d}>{getDeptLabel(d, sp)}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
            <option value="all">{sp.allStatuses}</option>
            <option value="active">{sp.statusActive}</option>
            <option value="inactive">{sp.statusInactive}</option>
            <option value="archived">{sp.statusArchived}</option>
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={sp.searchPlaceholder} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
          </div>
          <button onClick={resetFilters} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">{sp.reset}</button>
        </div>
      </div>

      {/* ===== BULK + EXPORT + ADD ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <div className="flex items-center gap-2 bg-[#013486]/5 border border-[#013486]/20 rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium text-[#013486]">{selected.size} {sp.selected}</span>
              <button className="text-xs text-[#013486] hover:underline flex items-center gap-1"><UserCheck size={12} />{sp.bulkAssignTeacher}</button>
              <button className="text-xs text-[#013486] hover:underline flex items-center gap-1"><Download size={12} />{sp.bulkExport}</button>
              <button className="text-xs text-red-600 hover:underline flex items-center gap-1"><Trash2 size={12} />{sp.bulkDelete}</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={exportRef}>
            <button onClick={() => setShowExport(!showExport)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={14} />{sp.export}<ChevronDown size={14} />
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
                <button onClick={() => { handlePrint(); setShowExport(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><FileText size={14} />{sp.exportPDF}</button>
                <button onClick={() => { handleExportCSV(); setShowExport(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><FileSpreadsheet size={14} />{sp.exportExcel}</button>
                <button onClick={() => { handleExportCSV(); setShowExport(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Table2 size={14} />{sp.exportCSV}</button>
                <button onClick={() => { handlePrint(); setShowExport(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Printer size={14} />{sp.printList}</button>
              </div>
            )}
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-[#013486] rounded-lg hover:bg-[#013486]/90">
            <Plus size={14} />{sp.addNew}
          </button>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                    {selected.size === paged.length && paged.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{sp.colCode}</th>
                {([
                  ["name", sp.colSubject],
                  ["department", sp.colDepartment],
                ] as const).map(([col, label]) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort(col)}>
                    <span className="flex items-center gap-1">{label}<ArrowUpDown size={12} className="text-gray-400" /></span>
                  </th>
                ))}
                {([
                  ["coefficient", sp.colCoefficient],
                  ["hours", sp.colHours],
                ] as const).map(([col, label]) => (
                  <th key={col} className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort(col)}>
                    <span className="flex items-center justify-center gap-1">{label}<ArrowUpDown size={12} className="text-gray-400" /></span>
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">{sp.colTeachers}</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">{sp.colClasses}</th>
                <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort("average")}>
                  <span className="flex items-center justify-center gap-1">{sp.colAverage}<ArrowUpDown size={12} className="text-gray-400" /></span>
                </th>
                <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort("status")}>
                  <span className="flex items-center justify-center gap-1">{sp.colStatus}<ArrowUpDown size={12} className="text-gray-400" /></span>
                </th>
                <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase">{sp.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(sub => {
                const grad = deptGradient[sub.department];
                return (
                  <tr key={sub.id} className={`border-t border-gray-100 hover:bg-gray-50/50 transition-colors ${selected.has(sub.id) ? "bg-[#013486]/5" : ""}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(sub.id)} className="text-gray-400 hover:text-gray-600">
                        {selected.has(sub.id) ? <CheckSquare size={16} className="text-[#013486]" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{sub.code}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDrawerSubject(sub)} className="flex items-center gap-2.5 hover:underline text-left">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-white text-sm shadow-sm`}>
                          {deptIcon[sub.department]}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">{sub.name}</span>
                          <div className="flex gap-1 mt-0.5">
                            {sub.levels.slice(0, 3).map(l => (
                              <span key={l} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{l}</span>
                            ))}
                            {sub.levels.length > 3 && <span className="text-[10px] text-gray-400">+{sub.levels.length - 3}</span>}
                          </div>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{getDeptLabel(sub.department, sp)}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#013486]/10 text-[#013486] text-xs font-bold">{sub.coefficient}</span>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">{sub.hoursPerWeek}h</td>
                    <td className="px-3 py-3 text-center text-gray-600">{sub.teacherCount}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{sub.classCount}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`font-semibold ${sub.average >= 70 ? "text-emerald-600" : sub.average >= 50 ? "text-amber-600" : sub.average > 0 ? "text-red-600" : "text-gray-400"}`}>
                        {sub.average > 0 ? `${sub.average}%` : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[sub.status]}`}>
                        {getStatusLabel(sub.status, sp)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="relative inline-block" ref={showActionMenu === sub.id ? actionRef : undefined}>
                        <button onClick={() => setShowActionMenu(showActionMenu === sub.id ? null : sub.id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>
                        {showActionMenu === sub.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
                            <button onClick={() => { setDrawerSubject(sub); setShowActionMenu(null); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Eye size={14} />{sp.viewDetails}</button>
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Edit3 size={14} />{sp.editSubject}</button>
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Users size={14} />{sp.manageTeachers}</button>
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><BookOpen size={14} />{sp.viewProgram}</button>
                            <hr className="my-1 border-gray-100" />
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-amber-600"><Archive size={14} />{sp.archiveSubject}</button>
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"><Trash2 size={14} />{sp.deleteSubject}</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">{sp.noClasses}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{sp.showing} {(page - 1) * perPage + 1} {sp.to} {Math.min(page * perPage, filtered.length)} {sp.of} {filtered.length}</span>
              <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border border-gray-300 rounded text-xs">
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} {sp.perPage}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              {pageWindow.map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium ${page === p ? "bg-[#013486] text-white" : "hover:bg-gray-200 text-gray-600"}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== DRAWER ===== */}
      {drawerSubject && <SubjectDrawer sub={drawerSubject} onClose={() => setDrawerSubject(null)} sp={sp} />}

      {/* ===== ADD MODAL ===== */}
      <AddSubjectModal open={showAddModal} onClose={() => setShowAddModal(false)} sp={sp} />
    </div>
  );
}
