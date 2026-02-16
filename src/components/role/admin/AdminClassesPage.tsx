"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  LayoutGrid, Users, Search, ChevronLeft, ChevronRight,
  Eye, Filter, Download, Plus, FileText, FileSpreadsheet, Printer,
  ChevronDown, MoreHorizontal, Edit3, Trash2, X, Mail, Phone,
  Calendar, ArrowUpDown, CheckSquare, Square, BookOpen,
  Clock, UserCheck, TrendingUp, GraduationCap, Archive,
  ClipboardList, Send, AlertTriangle, Award, Building,
  Table2, Activity, User,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  LineChart, Line,
} from "recharts";

/* ================================================================
   TYPES
================================================================ */

type ClassStatus = "active" | "inactive" | "full" | "archived";
type Shift = "morning" | "afternoon" | "full";

interface ClassTeacher {
  id: string;
  firstName: string;
  lastName: string;
  subject: string;
  hoursPerWeek: number;
  email: string;
  phone: string;
  isHomeroom: boolean;
}

interface ClassStudent {
  id: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F";
  average: number;
  attendanceRate: number;
  dailyStatus: "present" | "absent" | "late";
  rank: number;
}

interface ScheduleSlot {
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

interface SubjectGrade {
  subject: string;
  classAvg: number;
  highest: number;
  lowest: number;
  coeff: number;
  t1: number;
  t2: number;
  t3: number;
}

interface ClassItem {
  id: string;
  code: string;
  name: string;
  level: string;
  section: string;
  shift: Shift;
  room: string;
  capacity: number;
  enrolled: number;
  average: number;
  attendanceRate: number;
  status: ClassStatus;
  schoolYear: string;
  createdAt: string;
  homeroomTeacher: { id: string; firstName: string; lastName: string; specialty: string; since: string; email: string; phone: string } | null;
}

interface ClassDetails {
  students: ClassStudent[];
  teachers: ClassTeacher[];
  schedule: ScheduleSlot[];
  grades: SubjectGrade[];
  performanceTrend: { month: string; avg: number }[];
}

/* ================================================================
   MOCK DATA
================================================================ */

const allClasses: ClassItem[] = [
  { id: "CL-001", code: "NS1-A", name: "NS1 Section A", level: "NS1", section: "A", shift: "morning", room: "Salle 101", capacity: 40, enrolled: 38, average: 72, attendanceRate: 94, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: { id: "T-01", firstName: "Jean", lastName: "Pierre", specialty: "Mathématiques", since: "2024-09-01", email: "jean.pierre@educa.ht", phone: "509-4537-1200" } },
  { id: "CL-002", code: "NS1-B", name: "NS1 Section B", level: "NS1", section: "B", shift: "morning", room: "Salle 102", capacity: 40, enrolled: 35, average: 68, attendanceRate: 91, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: { id: "T-02", firstName: "Marie", lastName: "Augustin", specialty: "Français", since: "2024-09-01", email: "marie.augustin@educa.ht", phone: "509-4623-3400" } },
  { id: "CL-003", code: "NS2-A", name: "NS2 Section A", level: "NS2", section: "A", shift: "morning", room: "Salle 201", capacity: 38, enrolled: 36, average: 75, attendanceRate: 93, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: { id: "T-03", firstName: "Paul", lastName: "Baptiste", specialty: "Sciences", since: "2023-09-01", email: "paul.baptiste@educa.ht", phone: "509-3421-5600" } },
  { id: "CL-004", code: "NS2-B", name: "NS2 Section B", level: "NS2", section: "B", shift: "afternoon", room: "Salle 202", capacity: 38, enrolled: 32, average: 65, attendanceRate: 88, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: { id: "T-04", firstName: "Claire", lastName: "Joseph", specialty: "Histoire", since: "2024-09-01", email: "claire.joseph@educa.ht", phone: "509-4812-7800" } },
  { id: "CL-005", code: "NS3-A", name: "NS3 Section A", level: "NS3", section: "A", shift: "morning", room: "Salle 301", capacity: 36, enrolled: 34, average: 70, attendanceRate: 92, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: { id: "T-05", firstName: "Frantz", lastName: "Michel", specialty: "Anglais", since: "2022-09-01", email: "frantz.michel@educa.ht", phone: "509-3198-9000" } },
  { id: "CL-006", code: "NS3-B", name: "NS3 Section B", level: "NS3", section: "B", shift: "afternoon", room: "Salle 302", capacity: 36, enrolled: 30, average: 62, attendanceRate: 85, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: null },
  { id: "CL-007", code: "NS4-A", name: "NS4 Section A", level: "NS4", section: "A", shift: "morning", room: "Salle 401", capacity: 35, enrolled: 35, average: 74, attendanceRate: 95, status: "full", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: { id: "T-06", firstName: "Sophie", lastName: "Clerveau", specialty: "Physique-Chimie", since: "2023-09-01", email: "sophie.clerveau@educa.ht", phone: "509-4756-1200" } },
  { id: "CL-008", code: "NS4-B", name: "NS4 Section B", level: "NS4", section: "B", shift: "full", room: "Salle 402", capacity: 35, enrolled: 28, average: 58, attendanceRate: 82, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: { id: "T-07", firstName: "Luc", lastName: "Toussaint", specialty: "Géographie", since: "2024-09-01", email: "luc.toussaint@educa.ht", phone: "509-3876-3400" } },
  { id: "CL-009", code: "PHILO-A", name: "Philo Section A", level: "Philo", section: "A", shift: "morning", room: "Salle 501", capacity: 30, enrolled: 27, average: 71, attendanceRate: 90, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: { id: "T-08", firstName: "Rose", lastName: "Exanté", specialty: "Philosophie", since: "2021-09-01", email: "rose.exante@educa.ht", phone: "509-4901-5600" } },
  { id: "CL-010", code: "6AF-A", name: "6ème AF Section A", level: "6AF", section: "A", shift: "morning", room: "Salle 103", capacity: 42, enrolled: 40, average: 67, attendanceRate: 89, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: { id: "T-09", firstName: "Daniel", lastName: "Victor", specialty: "Mathématiques", since: "2024-09-01", email: "daniel.victor@educa.ht", phone: "509-3543-7800" } },
  { id: "CL-011", code: "5AF-A", name: "5ème AF Section A", level: "5AF", section: "A", shift: "afternoon", room: "Salle 104", capacity: 42, enrolled: 38, average: 64, attendanceRate: 87, status: "active", schoolYear: "2024-2025", createdAt: "2024-08-15", homeroomTeacher: null },
  { id: "CL-012", code: "NS1-C", name: "NS1 Section C", level: "NS1", section: "C", shift: "afternoon", room: "Salle 105", capacity: 40, enrolled: 0, average: 0, attendanceRate: 0, status: "archived", schoolYear: "2023-2024", createdAt: "2023-08-20", homeroomTeacher: null },
];

/* generate detail data deterministically from class index */
function getClassDetails(cls: ClassItem): ClassDetails {
  const idx = parseInt(cls.id.replace("CL-0", ""), 10);
  const firstNames = ["Jean", "Marie", "Pierre", "Sophia", "Roudy", "Fabiola", "Yvenson", "Lovely", "Woodley", "Natacha", "Ricardo", "Judeline", "Stanley", "Guerline", "Dieulande", "Cassandra", "Frantz", "Myrlande", "Emmanuel", "Rachelle"];
  const lastNames = ["Baptiste", "Clerveau", "Augustin", "Joseph", "Delmas", "Thermidor", "Michel", "Charles", "Jean-Pierre", "Desrosiers", "François", "Pierre-Louis", "Moise", "Toussaint", "Hyppolite", "Belfort", "Laleau", "Exanté", "Victor", "Jean-Louis"];

  const students: ClassStudent[] = Array.from({ length: Math.min(cls.enrolled, 15) }, (_, i) => {
    const si = (idx * 3 + i) % 20;
    const avg = Math.max(30, Math.min(100, 65 + ((idx * (i + 1) * 7) % 40) - 20));
    return {
      id: `ED-0${1200 + si}`,
      firstName: firstNames[si],
      lastName: lastNames[(si + idx) % 20],
      gender: (si % 2 === 0 ? "M" : "F") as "M" | "F",
      average: avg,
      attendanceRate: Math.max(60, Math.min(100, 85 + ((idx * i * 3) % 15))),
      dailyStatus: (i < cls.enrolled * 0.8 ? "present" : i < cls.enrolled * 0.9 ? "late" : "absent") as "present" | "absent" | "late",
      rank: i + 1,
    };
  }).sort((a, b) => b.average - a.average).map((s, i) => ({ ...s, rank: i + 1 }));

  const subjects = ["Mathématiques", "Français", "Sciences", "Histoire", "Anglais", "Géographie", "Physique-Chimie", "Philosophie"];
  const teacherFirsts = ["Jean", "Marie", "Paul", "Claire", "Frantz", "Sophie", "Luc", "Rose"];
  const teacherLasts = ["Pierre", "Augustin", "Baptiste", "Joseph", "Michel", "Clerveau", "Toussaint", "Exanté"];

  const teachers: ClassTeacher[] = subjects.slice(0, 6).map((sub, i) => ({
    id: `T-${String(i + 1 + idx).padStart(2, "0")}`,
    firstName: teacherFirsts[(i + idx) % 8],
    lastName: teacherLasts[(i + idx + 1) % 8],
    subject: sub,
    hoursPerWeek: [5, 4, 4, 3, 3, 2][i],
    email: `${teacherFirsts[(i + idx) % 8].toLowerCase()}.${teacherLasts[(i + idx + 1) % 8].toLowerCase()}@educa.ht`,
    phone: `509-${3000 + (idx * 100 + i * 11)}-${1000 + i * 111}`,
    isHomeroom: i === 0,
  }));

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const times = ["08:00 - 09:30", "09:45 - 11:15", "11:30 - 13:00", "14:00 - 15:30"];
  const schedule: ScheduleSlot[] = days.flatMap((day, di) =>
    times.slice(0, cls.shift === "morning" ? 3 : cls.shift === "afternoon" ? 2 : 4).map((time, ti) => {
      const si = (di * 4 + ti + idx) % 6;
      return {
        day,
        time,
        subject: subjects[si],
        teacher: `${teacherFirsts[(si + idx) % 8]} ${teacherLasts[(si + idx + 1) % 8]}`,
        room: cls.room,
      };
    })
  );

  const grades: SubjectGrade[] = subjects.slice(0, 6).map((sub, i) => {
    const base = cls.average + ((idx * (i + 1) * 3) % 15) - 7;
    const cAvg = Math.max(35, Math.min(95, base));
    return {
      subject: sub,
      classAvg: cAvg,
      highest: Math.min(100, cAvg + 15 + (idx % 5)),
      lowest: Math.max(15, cAvg - 20 - (idx % 7)),
      coeff: [4, 3, 3, 2, 2, 2][i],
      t1: Math.max(30, Math.min(95, cAvg + ((idx * i * 2) % 10) - 5)),
      t2: Math.max(30, Math.min(95, cAvg + ((idx * (i + 1) * 3) % 8) - 4)),
      t3: Math.max(30, Math.min(95, cAvg + ((idx * (i + 2)) % 12) - 6)),
    };
  });

  const performanceTrend = ["Sep", "Oct", "Nov", "Déc", "Jan", "Fév"].map((m, i) => ({
    month: m,
    avg: Math.max(40, Math.min(95, cls.average + ((idx * (i + 1) * 3) % 15) - 7)),
  }));

  return { students, teachers, schedule, grades, performanceTrend };
}

const COLORS = ["#013486", "#2563EB", "#F35403", "#F97316", "#10B981", "#8B5CF6"];

/* ================================================================
   HELPERS
================================================================ */

type CP = ReturnType<typeof useTranslation>["t"]["classesPage"];

const statusColor: Record<ClassStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-gray-100 text-gray-600",
  full: "bg-amber-100 text-amber-700",
  archived: "bg-red-100 text-red-700",
};

function getStatusLabel(s: ClassStatus, cp: CP) {
  const map: Record<ClassStatus, string> = { active: cp.statusActive, inactive: cp.statusInactive, full: cp.statusFull, archived: cp.statusArchived };
  return map[s];
}

function getShiftLabel(s: Shift, cp: CP) {
  const map: Record<Shift, string> = { morning: cp.shiftMorning, afternoon: cp.shiftAfternoon, full: cp.shiftFull };
  return map[s];
}

const avatarGradient: Record<string, string> = {
  NS1: "from-blue-500 to-blue-700",
  NS2: "from-indigo-500 to-indigo-700",
  NS3: "from-violet-500 to-violet-700",
  NS4: "from-purple-500 to-purple-700",
  Philo: "from-fuchsia-500 to-fuchsia-700",
  "6AF": "from-teal-500 to-teal-700",
  "5AF": "from-cyan-500 to-cyan-700",
};

function buildPrintableHTML(classes: ClassItem[], cp: CP) {
  const rows = classes.map(c => `<tr><td>${c.code}</td><td>${c.name}</td><td>${c.level}</td><td>${c.section}</td><td>${c.homeroomTeacher ? `${c.homeroomTeacher.firstName} ${c.homeroomTeacher.lastName}` : "—"}</td><td>${c.enrolled}/${c.capacity}</td><td>${c.average}%</td><td>${c.attendanceRate}%</td><td>${getStatusLabel(c.status, cp)}</td></tr>`).join("");
  return `<!DOCTYPE html><html><head><title>${cp.filterTitle}</title><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#013486;color:white}</style></head><body><h2>${cp.filterTitle}</h2><table><thead><tr><th>${cp.colCode}</th><th>${cp.colClass}</th><th>${cp.colLevel}</th><th>${cp.colSection}</th><th>${cp.colHomeroom}</th><th>${cp.colStudents}</th><th>${cp.colAverage}</th><th>${cp.colAttendance}</th><th>${cp.colStatus}</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ================================================================
   MODAL COMPONENTS
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

function AddClassModal({ open, onClose, cp }: { open: boolean; onClose: () => void; cp: CP }) {
  return (
    <Modal open={open} onClose={onClose} title={cp.addClassTitle}>
      <div className="space-y-4">
        {([
          [cp.fieldClassName, "text", "Ex: NS1 Section A"],
          [cp.fieldClassCode, "text", "Ex: NS1-A"],
        ] as const).map(([label, type, ph]) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} placeholder={ph} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{cp.fieldLevel}</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
              <option value="">{cp.selectLevel}</option>
              {["levelPrimary5", "levelPrimary6", "levelSecondary1", "levelSecondary2", "levelSecondary3", "levelSecondary4", "levelPhilo"].map(k => (
                <option key={k} value={k}>{cp[k as keyof CP] as string}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{cp.fieldSection}</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
              <option value="">{cp.selectSection}</option>
              {["A", "B", "C", "D"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{cp.fieldShift}</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
              <option value="">{cp.selectShift}</option>
              <option value="morning">{cp.shiftMorning}</option>
              <option value="afternoon">{cp.shiftAfternoon}</option>
              <option value="full">{cp.shiftFull}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{cp.fieldCapacity}</label>
            <input type="number" placeholder="40" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{cp.fieldRoom}</label>
          <input type="text" placeholder="Salle 101" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{cp.fieldHomeroom}</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
            <option value="">{cp.selectTeacher}</option>
            <option value="T-01">Jean Pierre</option>
            <option value="T-02">Marie Augustin</option>
            <option value="T-03">Paul Baptiste</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{cp.confirm === "Confirmer" ? "Annuler" : "Anile"}</button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-white bg-[#013486] hover:bg-[#013486]/90 rounded-lg">{cp.createClass}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   CLASS DRAWER
================================================================ */

function ClassDrawer({ cls, onClose, cp }: { cls: ClassItem; onClose: () => void; cp: CP }) {
  const [tab, setTab] = useState<"overview" | "students" | "teachers" | "schedule" | "grades" | "actions">("overview");
  const details = useMemo(() => getClassDetails(cls), [cls]);
  const grad = avatarGradient[cls.level] || "from-gray-500 to-gray-700";

  const tabs = [
    { key: "overview" as const, label: cp.tabOverview },
    { key: "students" as const, label: cp.tabStudents },
    { key: "teachers" as const, label: cp.tabTeachers },
    { key: "schedule" as const, label: cp.tabSchedule },
    { key: "grades" as const, label: cp.tabGrades },
    { key: "actions" as const, label: cp.tabActions },
  ];

  const occupancy = cls.capacity > 0 ? Math.round((cls.enrolled / cls.capacity) * 100) : 0;
  const absToday = details.students.filter(s => s.dailyStatus === "absent").length;
  const lateToday = details.students.filter(s => s.dailyStatus === "late").length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center gap-4 p-5">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {cls.level}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{cls.name}</h2>
              <p className="text-sm text-gray-500">{cls.code} · {cls.room}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[cls.status]}`}>{getStatusLabel(cls.status, cp)}</span>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>
          {/* tabs */}
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
              {/* class info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">{cp.classInfo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {([
                    [cp.className, cls.name],
                    [cp.classCode, cls.code],
                    [cp.level, cls.level],
                    [cp.section, cls.section],
                    [cp.shift, getShiftLabel(cls.shift, cp)],
                    [cp.room, cls.room],
                    [cp.schoolYear, cls.schoolYear],
                    [cp.createdAt, cls.createdAt],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-gray-500 text-xs">{k}</span>
                      <p className="font-medium text-gray-800">{v}</p>
                    </div>
                  ))}
                </div>
                {/* occupancy bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{cp.occupancy}</span>
                    <span className="font-medium">{cls.enrolled}/{cls.capacity} ({occupancy}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${occupancy >= 95 ? "bg-red-500" : occupancy >= 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${occupancy}%` }} />
                  </div>
                </div>
              </div>

              {/* homeroom teacher */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{cp.homeroomTeacher}</h3>
                {cls.homeroomTeacher ? (
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#013486] to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {cls.homeroomTeacher.firstName[0]}{cls.homeroomTeacher.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{cls.homeroomTeacher.firstName} {cls.homeroomTeacher.lastName}</p>
                      <p className="text-xs text-gray-500">{cp.specialty}: {cls.homeroomTeacher.specialty}</p>
                      <p className="text-xs text-gray-500">{cp.since} {cls.homeroomTeacher.since}</p>
                      <div className="flex gap-3 mt-2">
                        <a className="text-xs text-[#013486] hover:underline flex items-center gap-1"><Mail size={12} />{cls.homeroomTeacher.email}</a>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={12} />{cls.homeroomTeacher.phone}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <UserCheck size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{cp.noHomeroom}</p>
                    <button className="mt-2 text-xs text-[#013486] font-medium hover:underline">{cp.assignTeacher}</button>
                  </div>
                )}
              </div>

              {/* class stats */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{cp.classStats}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    [cp.classAverage, `${cls.average}%`, cls.average >= 70 ? "text-emerald-600" : cls.average >= 50 ? "text-amber-600" : "text-red-600"],
                    [cp.bestAverage, `${Math.min(100, cls.average + 18)}%`, "text-emerald-600"],
                    [cp.lowestAverage, `${Math.max(20, cls.average - 22)}%`, "text-red-600"],
                    [cp.attendanceRateLabel, `${cls.attendanceRate}%`, cls.attendanceRate >= 90 ? "text-emerald-600" : "text-amber-600"],
                    [cp.absentToday, `${absToday}`, "text-red-600"],
                    [cp.lateToday, `${lateToday}`, "text-amber-600"],
                    [cp.passRateLabel, `${Math.min(100, Math.round(cls.average * 1.15))}%`, "text-[#013486]"],
                    [cp.disciplinaryIssues, `${Math.max(0, Math.floor((100 - cls.average) / 15))}`, "text-gray-600"],
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
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{cp.performanceTrend}</h3>
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

          {/* ===== STUDENTS TAB ===== */}
          {tab === "students" && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">{cp.enrolledStudents} ({details.students.length})</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg hover:bg-[#013486]/90">
                  <Plus size={14} />{cp.addStudent}
                </button>
              </div>

              {/* quick stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  [cp.topStudents, details.students.filter(s => s.average >= 80).length, "bg-emerald-50 text-emerald-700"],
                  [cp.present, details.students.filter(s => s.dailyStatus === "present").length, "bg-blue-50 text-blue-700"],
                  [cp.atRiskStudents, details.students.filter(s => s.average < 50).length, "bg-red-50 text-red-700"],
                ].map(([label, count, cls2]) => (
                  <div key={label as string} className={`rounded-lg p-3 text-center ${cls2}`}>
                    <p className="text-lg font-bold">{count as number}</p>
                    <p className="text-xs">{label as string}</p>
                  </div>
                ))}
              </div>

              {details.students.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs text-gray-500">#</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">{cp.studentName}</th>
                        <th className="text-center px-4 py-3 text-xs text-gray-500">{cp.studentAverage}</th>
                        <th className="text-center px-4 py-3 text-xs text-gray-500">{cp.studentAttendance}</th>
                        <th className="text-center px-4 py-3 text-xs text-gray-500">{cp.studentStatus}</th>
                        <th className="text-center px-4 py-3 text-xs text-gray-500">{cp.studentRank}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.students.map(s => (
                        <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs text-gray-400">{s.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${s.gender === "M" ? "from-blue-500 to-blue-700" : "from-violet-500 to-violet-700"} flex items-center justify-center text-white text-xs font-bold`}>
                                {s.firstName[0]}{s.lastName[0]}
                              </div>
                              <span className="font-medium text-gray-800">{s.firstName} {s.lastName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-semibold ${s.average >= 70 ? "text-emerald-600" : s.average >= 50 ? "text-amber-600" : "text-red-600"}`}>{s.average}%</span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{s.attendanceRate}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.dailyStatus === "present" ? "bg-emerald-100 text-emerald-700" : s.dailyStatus === "late" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                              {s.dailyStatus === "present" ? cp.present : s.dailyStatus === "late" ? cp.late : cp.absent}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${s.rank <= 3 ? "bg-[#F35403]/10 text-[#F35403]" : "bg-gray-100 text-gray-600"}`}>
                              {s.rank}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">{cp.noStudents}</div>
              )}
            </>
          )}

          {/* ===== TEACHERS TAB ===== */}
          {tab === "teachers" && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">{cp.assignedTeachers} ({details.teachers.length})</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg hover:bg-[#013486]/90">
                  <Plus size={14} />{cp.addTeacherSubject}
                </button>
              </div>

              <div className="space-y-3">
                {details.teachers.map(t => (
                  <div key={t.id} className={`border rounded-xl p-4 ${t.isHomeroom ? "border-[#013486] bg-blue-50/50" : "border-gray-200"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#013486] to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {t.firstName[0]}{t.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{t.firstName} {t.lastName}</p>
                          {t.isHomeroom && <span className="px-2 py-0.5 bg-[#013486] text-white text-xs rounded-full">{cp.homeroomTeacher}</span>}
                        </div>
                        <p className="text-sm text-[#013486] font-medium">{t.subject}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={12} />{t.hoursPerWeek}h/{cp.teacherHours.split("/")[1] || "semaine"}</span>
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

          {/* ===== SCHEDULE TAB ===== */}
          {tab === "schedule" && (
            <>
              <h3 className="text-sm font-semibold text-gray-800">{cp.weeklySchedule}</h3>
              {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map(day => {
                const dayKey = { Lundi: cp.monday, Mardi: cp.tuesday, Mercredi: cp.wednesday, Jeudi: cp.thursday, Vendredi: cp.friday }[day] || day;
                const slots = details.schedule.filter(s => s.day === day);
                return (
                  <div key={day}>
                    <h4 className="text-xs font-semibold text-[#013486] uppercase mb-2">{dayKey}</h4>
                    <div className="space-y-2">
                      {slots.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 w-28 flex-shrink-0 flex items-center gap-1"><Clock size={12} />{s.time}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{s.subject}</p>
                            <p className="text-xs text-gray-500">{s.teacher} · {s.room}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* ===== GRADES TAB ===== */}
          {tab === "grades" && (
            <>
              <h3 className="text-sm font-semibold text-gray-800">{cp.gradesOverview}</h3>
              {details.grades.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs text-gray-500">{cp.subjectName}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{cp.coefficient}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{cp.trimester1}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{cp.trimester2}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{cp.trimester3}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{cp.classAvg}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{cp.highestGrade}</th>
                        <th className="text-center px-3 py-3 text-xs text-gray-500">{cp.lowestGrade}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.grades.map(g => (
                        <tr key={g.subject} className="border-t border-gray-100">
                          <td className="px-4 py-3 font-medium text-gray-800">{g.subject}</td>
                          <td className="px-3 py-3 text-center text-gray-500">{g.coeff}</td>
                          <td className="px-3 py-3 text-center">{g.t1}</td>
                          <td className="px-3 py-3 text-center">{g.t2}</td>
                          <td className="px-3 py-3 text-center">{g.t3}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`font-semibold ${g.classAvg >= 70 ? "text-emerald-600" : g.classAvg >= 50 ? "text-amber-600" : "text-red-600"}`}>{g.classAvg}</span>
                          </td>
                          <td className="px-3 py-3 text-center text-emerald-600 font-medium">{g.highest}</td>
                          <td className="px-3 py-3 text-center text-red-600 font-medium">{g.lowest}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200">
                        <td className="px-4 py-3 font-bold text-gray-800">{cp.generalAverage}</td>
                        <td />
                        <td className="px-3 py-3 text-center font-bold">{Math.round(details.grades.reduce((s, g) => s + g.t1 * g.coeff, 0) / details.grades.reduce((s, g) => s + g.coeff, 0))}</td>
                        <td className="px-3 py-3 text-center font-bold">{Math.round(details.grades.reduce((s, g) => s + g.t2 * g.coeff, 0) / details.grades.reduce((s, g) => s + g.coeff, 0))}</td>
                        <td className="px-3 py-3 text-center font-bold">{Math.round(details.grades.reduce((s, g) => s + g.t3 * g.coeff, 0) / details.grades.reduce((s, g) => s + g.coeff, 0))}</td>
                        <td className="px-3 py-3 text-center font-bold text-[#013486]">{Math.round(details.grades.reduce((s, g) => s + g.classAvg * g.coeff, 0) / details.grades.reduce((s, g) => s + g.coeff, 0))}</td>
                        <td /><td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">{cp.noGrades}</div>
              )}

              {/* grade distribution chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">{cp.performanceByClass}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={details.grades}>
                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="classAvg" fill="#013486" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ===== ACTIONS TAB ===== */}
          {tab === "actions" && (
            <div className="space-y-3">
              {([
                [Edit3, cp.actionEditClass, cp.actionEditClassDesc, "bg-blue-50 text-[#013486]"],
                [Users, cp.actionManageStudents, cp.actionManageStudentsDesc, "bg-indigo-50 text-indigo-600"],
                [UserCheck, cp.actionAssignTeacher, cp.actionAssignTeacherDesc, "bg-violet-50 text-violet-600"],
                [Calendar, cp.actionSchedule, cp.actionScheduleDesc, "bg-cyan-50 text-cyan-600"],
                [FileText, cp.actionExportGrades, cp.actionExportGradesDesc, "bg-emerald-50 text-emerald-600"],
                [ClipboardList, cp.actionExportAttendance, cp.actionExportAttendanceDesc, "bg-teal-50 text-teal-600"],
                [Printer, cp.actionPrintRoster, cp.actionPrintRosterDesc, "bg-gray-50 text-gray-600"],
                [Archive, cp.actionArchive, cp.actionArchiveDesc, "bg-amber-50 text-amber-600"],
                [Trash2, cp.actionDelete, cp.actionDeleteDesc, "bg-red-50 text-red-600"],
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

export default function AdminClassesPage() {
  const { t } = useTranslation();
  const cp = t.classesPage;

  /* state */
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerClass, setDrawerClass] = useState<ClassItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  /* refs for click-outside */
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

  /* unique values for filters */
  const levels = useMemo(() => [...new Set(allClasses.map(c => c.level))], []);
  const sections = useMemo(() => [...new Set(allClasses.map(c => c.section))], []);

  /* filtering & sorting */
  const filtered = useMemo(() => {
    let result = [...allClasses];
    if (filterLevel !== "all") result = result.filter(c => c.level === filterLevel);
    if (filterSection !== "all") result = result.filter(c => c.section === filterSection);
    if (filterStatus !== "all") result = result.filter(c => c.status === filterStatus);
    if (filterShift !== "all") result = result.filter(c => c.shift === filterShift);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.homeroomTeacher && `${c.homeroomTeacher.firstName} ${c.homeroomTeacher.lastName}`.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      let va: number | string = "", vb: number | string = "";
      switch (sortCol) {
        case "name": va = a.name; vb = b.name; break;
        case "level": va = a.level; vb = b.level; break;
        case "enrolled": va = a.enrolled; vb = b.enrolled; break;
        case "average": va = a.average; vb = b.average; break;
        case "attendance": va = a.attendanceRate; vb = b.attendanceRate; break;
        case "status": va = a.status; vb = b.status; break;
      }
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return result;
  }, [filterLevel, filterSection, filterStatus, filterShift, search, sortCol, sortDir]);

  /* pagination */
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = useCallback((col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }, [sortCol]);

  const toggleSelect = (id: string) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setSelected(prev => prev.size === paged.length ? new Set() : new Set(paged.map(c => c.id)));

  /* chart data */
  const levelChartData = useMemo(() => {
    const map: Record<string, number> = {};
    allClasses.filter(c => c.status !== "archived").forEach(c => { map[c.level] = (map[c.level] || 0) + c.enrolled; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, []);

  const performanceChartData = useMemo(() => {
    return allClasses.filter(c => c.status !== "archived" && c.average > 0).map(c => ({ name: c.code, avg: c.average }));
  }, []);

  const shiftChartData = useMemo(() => {
    const map: Record<string, number> = {};
    allClasses.filter(c => c.status !== "archived").forEach(c => { map[c.shift] = (map[c.shift] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name === "morning" ? cp.shiftMorning : name === "afternoon" ? cp.shiftAfternoon : cp.shiftFull, value }));
  }, [cp]);

  const attendanceChartData = useMemo(() => {
    return allClasses.filter(c => c.status !== "archived" && c.attendanceRate > 0).map(c => ({ name: c.code, rate: c.attendanceRate }));
  }, []);

  /* stats */
  const activeClasses = allClasses.filter(c => c.status !== "archived");
  const totalStudents = activeClasses.reduce((s, c) => s + c.enrolled, 0);
  const avgStudents = activeClasses.length > 0 ? Math.round(totalStudents / activeClasses.length) : 0;
  const withTeacher = activeClasses.filter(c => c.homeroomTeacher !== null).length;
  const avgAverage = activeClasses.length > 0 ? Math.round(activeClasses.filter(c => c.average > 0).reduce((s, c) => s + c.average, 0) / activeClasses.filter(c => c.average > 0).length) : 0;
  const avgAttendance = activeClasses.length > 0 ? Math.round(activeClasses.filter(c => c.attendanceRate > 0).reduce((s, c) => s + c.attendanceRate, 0) / activeClasses.filter(c => c.attendanceRate > 0).length) : 0;
  const passRate = Math.min(100, Math.round(avgAverage * 1.12));

  /* export handlers */
  const handleExportCSV = () => {
    const header = "Code,Classe,Niveau,Section,Titulaire,Inscrits,Capacité,Moyenne,Présence,Horaire,Statut\n";
    const rows = filtered.map(c => `${c.code},${c.name},${c.level},${c.section},${c.homeroomTeacher ? `${c.homeroomTeacher.firstName} ${c.homeroomTeacher.lastName}` : "—"},${c.enrolled},${c.capacity},${c.average}%,${c.attendanceRate}%,${getShiftLabel(c.shift, cp)},${getStatusLabel(c.status, cp)}`).join("\n");
    downloadBlob(header + rows, "classes.csv", "text/csv");
  };

  const handlePrint = () => {
    const html = buildPrintableHTML(filtered, cp);
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  /* pagination window */
  const pageWindow = useMemo(() => {
    const w: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) w.push(i);
    return w;
  }, [page, totalPages]);

  const resetFilters = () => { setFilterLevel("all"); setFilterSection("all"); setFilterStatus("all"); setFilterShift("all"); setSearch(""); setPage(1); };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.classes.title}
        description={t.pages.admin.classes.desc}
        icon={<LayoutGrid size={20} />}
      />

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {([
          [LayoutGrid, cp.totalClasses, activeClasses.length, "bg-[#013486]/10 text-[#013486]"],
          [Users, cp.totalStudents, totalStudents, "bg-blue-100 text-blue-600"],
          [User, cp.avgStudentsPerClass, avgStudents, "bg-indigo-100 text-indigo-600"],
          [UserCheck, cp.classesWithTeacher, `${withTeacher}/${activeClasses.length}`, "bg-violet-100 text-violet-600"],
          [TrendingUp, cp.avgClassAverage, `${avgAverage}%`, "bg-emerald-100 text-emerald-600"],
          [Activity, cp.attendanceRate, `${avgAttendance}%`, "bg-teal-100 text-teal-600"],
          [Award, cp.passRate, `${passRate}%`, "bg-[#F35403]/10 text-[#F35403]"],
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
        {/* student distribution by level */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{cp.studentDistribution}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={levelChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {levelChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* performance by class */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{cp.performanceByClass}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={performanceChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={45} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avg" fill="#013486" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* shift distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{cp.levelDistribution}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={shiftChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {shiftChartData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* attendance by class */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{cp.attendanceByClass}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={45} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="rate" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">{cp.filterTitle}</h3>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} {filtered.length <= 1 ? cp.result : cp.results}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* level */}
          <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
            <option value="all">{cp.allLevels}</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {/* section */}
          <select value={filterSection} onChange={e => { setFilterSection(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
            <option value="all">{cp.allSections}</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* status */}
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
            <option value="all">{cp.allStatuses}</option>
            <option value="active">{cp.statusActive}</option>
            <option value="inactive">{cp.statusInactive}</option>
            <option value="full">{cp.statusFull}</option>
            <option value="archived">{cp.statusArchived}</option>
          </select>
          {/* shift */}
          <select value={filterShift} onChange={e => { setFilterShift(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none">
            <option value="all">{cp.allShifts}</option>
            <option value="morning">{cp.shiftMorning}</option>
            <option value="afternoon">{cp.shiftAfternoon}</option>
            <option value="full">{cp.shiftFull}</option>
          </select>
          {/* search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={cp.searchPlaceholder} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
          </div>
          {/* reset */}
          <button onClick={resetFilters} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">{cp.reset}</button>
        </div>
      </div>

      {/* ===== BULK ACTIONS + EXPORT + ADD ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <div className="flex items-center gap-2 bg-[#013486]/5 border border-[#013486]/20 rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium text-[#013486]">{selected.size} {cp.selected}</span>
              <button className="text-xs text-[#013486] hover:underline flex items-center gap-1"><UserCheck size={12} />{cp.bulkAssignTeacher}</button>
              <button className="text-xs text-[#013486] hover:underline flex items-center gap-1"><Clock size={12} />{cp.bulkChangeShift}</button>
              <button className="text-xs text-[#013486] hover:underline flex items-center gap-1"><Download size={12} />{cp.bulkExport}</button>
              <button className="text-xs text-amber-600 hover:underline flex items-center gap-1"><Archive size={12} />{cp.bulkArchive}</button>
              <button className="text-xs text-red-600 hover:underline flex items-center gap-1"><Trash2 size={12} />{cp.bulkDelete}</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* export dropdown */}
          <div className="relative" ref={exportRef}>
            <button onClick={() => setShowExport(!showExport)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={14} />{cp.export}<ChevronDown size={14} />
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
                <button onClick={() => { handlePrint(); setShowExport(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><FileText size={14} />{cp.exportPDF}</button>
                <button onClick={() => { handleExportCSV(); setShowExport(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><FileSpreadsheet size={14} />{cp.exportExcel}</button>
                <button onClick={() => { handleExportCSV(); setShowExport(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Table2 size={14} />{cp.exportCSV}</button>
                <button onClick={() => { handlePrint(); setShowExport(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Printer size={14} />{cp.printList}</button>
              </div>
            )}
          </div>
          {/* add class */}
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-[#013486] rounded-lg hover:bg-[#013486]/90">
            <Plus size={14} />{cp.addNew}
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{cp.colCode}</th>
                {([
                  ["name", cp.colClass],
                  ["level", cp.colLevel],
                ] as const).map(([col, label]) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort(col)}>
                    <span className="flex items-center gap-1">{label}<ArrowUpDown size={12} className="text-gray-400" /></span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{cp.colSection}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{cp.colHomeroom}</th>
                {([
                  ["enrolled", cp.colStudents],
                  ["average", cp.colAverage],
                  ["attendance", cp.colAttendance],
                ] as const).map(([col, label]) => (
                  <th key={col} className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort(col)}>
                    <span className="flex items-center justify-center gap-1">{label}<ArrowUpDown size={12} className="text-gray-400" /></span>
                  </th>
                ))}
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">{cp.colShift}</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => toggleSort("status")}>
                  <span className="flex items-center justify-center gap-1">{cp.colStatus}<ArrowUpDown size={12} className="text-gray-400" /></span>
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">{cp.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(cls => {
                const grad = avatarGradient[cls.level] || "from-gray-500 to-gray-700";
                const occupancy = cls.capacity > 0 ? Math.round((cls.enrolled / cls.capacity) * 100) : 0;
                return (
                  <tr key={cls.id} className={`border-t border-gray-100 hover:bg-gray-50/50 transition-colors ${selected.has(cls.id) ? "bg-[#013486]/5" : ""}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(cls.id)} className="text-gray-400 hover:text-gray-600">
                        {selected.has(cls.id) ? <CheckSquare size={16} className="text-[#013486]" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{cls.code}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDrawerClass(cls)} className="flex items-center gap-2.5 hover:underline text-left">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                          {cls.level.slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-800">{cls.name}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cls.level}</td>
                    <td className="px-4 py-3 text-gray-600">{cls.section}</td>
                    <td className="px-4 py-3">
                      {cls.homeroomTeacher ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#013486] to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {cls.homeroomTeacher.firstName[0]}{cls.homeroomTeacher.lastName[0]}
                          </div>
                          <span className="text-sm text-gray-700">{cls.homeroomTeacher.firstName} {cls.homeroomTeacher.lastName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">{cp.noHomeroom}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{cls.enrolled}/{cls.capacity}</span>
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${occupancy >= 95 ? "bg-red-500" : occupancy >= 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${occupancy}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${cls.average >= 70 ? "text-emerald-600" : cls.average >= 50 ? "text-amber-600" : cls.average > 0 ? "text-red-600" : "text-gray-400"}`}>
                        {cls.average > 0 ? `${cls.average}%` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${cls.attendanceRate >= 90 ? "text-emerald-600" : cls.attendanceRate >= 80 ? "text-amber-600" : cls.attendanceRate > 0 ? "text-red-600" : "text-gray-400"}`}>
                        {cls.attendanceRate > 0 ? `${cls.attendanceRate}%` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                        <Clock size={12} />{getShiftLabel(cls.shift, cp)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[cls.status]}`}>
                        {getStatusLabel(cls.status, cp)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative inline-block" ref={showActionMenu === cls.id ? actionRef : undefined}>
                        <button onClick={() => setShowActionMenu(showActionMenu === cls.id ? null : cls.id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>
                        {showActionMenu === cls.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
                            <button onClick={() => { setDrawerClass(cls); setShowActionMenu(null); }} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Eye size={14} />{cp.viewDetails}</button>
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Edit3 size={14} />{cp.editClass}</button>
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Users size={14} />{cp.manageStudents}</button>
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"><Calendar size={14} />{cp.viewSchedule}</button>
                            <hr className="my-1 border-gray-100" />
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-amber-600"><Archive size={14} />{cp.archiveClass}</button>
                            <button onClick={() => setShowActionMenu(null)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"><Trash2 size={14} />{cp.deleteClass}</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-gray-400 text-sm">{cp.noStudents}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{cp.showing} {(page - 1) * perPage + 1} {cp.to} {Math.min(page * perPage, filtered.length)} {cp.of} {filtered.length}</span>
              <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border border-gray-300 rounded text-xs">
                {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} {cp.perPage}</option>)}
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
      {drawerClass && <ClassDrawer cls={drawerClass} onClose={() => setDrawerClass(null)} cp={cp} />}

      {/* ===== ADD CLASS MODAL ===== */}
      <AddClassModal open={showAddModal} onClose={() => setShowAddModal(false)} cp={cp} />
    </div>
  );
}
