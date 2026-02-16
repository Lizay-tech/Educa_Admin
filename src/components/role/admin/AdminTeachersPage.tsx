"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  BookOpen, Users, Search, ChevronLeft, ChevronRight,
  Eye, Filter, Download, Plus, FileText, FileSpreadsheet, Printer,
  ChevronDown, MoreHorizontal, Edit3, MessageSquare, Ban,
  Trash2, X, Phone, Mail, MapPin, Calendar, TrendingUp, ArrowUpDown,
  CheckSquare, Square, Upload, Star,
  CreditCard, FileCheck, Award, Repeat, Send,
  Shield, UserCheck, Activity, Clock, Briefcase, GraduationCap,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  LineChart, Line,
} from "recharts";

/* ================================================================
   TYPES
================================================================ */

type ContractType = "permanent" | "temporary" | "partTime";
type AdminStatus = "active" | "onLeave" | "suspended" | "resigned" | "retired";
type DailyStatus = "present" | "absent" | "late";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  subject: string;
  contractType: ContractType;
  adminStatus: AdminStatus;
  dailyStatus: DailyStatus;
  email: string;
  phone: string;
  gender: "M" | "F";
  dob: string;
  address: string;
  hireDate: string;
  experienceYears: number;
  diploma: string;
  educationLevel: string;
  emergencyContact: string;
  emergencyPhone: string;
  assignedClasses: string[];
  weeklyHours: number;
  monthlySalary: number;
}

interface ClassPerformance { className: string; avg: number; passRate: number; students: number }
interface EvalEntry { date: string; score: number; comment: string; period: string }
interface PaymentEntry { type: string; amount: number; status: "paid" | "pending" | "overdue"; date: string }
interface LeaveEntry { type: "sick" | "personal" | "maternity" | "annual"; start: string; end: string; days: number; status: "approved" | "pending" | "rejected" }
interface DocEntry { name: string; provided: boolean }

interface TeacherDetails {
  classPerformances: ClassPerformance[];
  evaluations: EvalEntry[];
  payments: PaymentEntry[];
  leaves: LeaveEntry[];
  documents: DocEntry[];
  schedule: { day: string; time: string; subject: string; room: string; className: string }[];
  performanceTrend: { month: string; avg: number }[];
}

/* ================================================================
   MOCK DATA
================================================================ */

const SUBJECTS = ["Mathématiques", "Français", "Sciences", "Histoire", "Anglais", "Géographie", "Physique", "Chimie"];
const CLASSES = ["NS1", "NS2", "NS3", "NS4"];

const allTeachers: Teacher[] = [
  { id: "PR-001", firstName: "Jean-Marc", lastName: "Duval", subject: "Mathématiques", contractType: "permanent", adminStatus: "active", dailyStatus: "present", email: "jm.duval@educa.ht", phone: "509-4537-1001", gender: "M", dob: "1985-03-15", address: "Rue Capois, Port-au-Prince", hireDate: "2015-09-01", experienceYears: 10, diploma: "Licence en Mathématiques", educationLevel: "Licence", emergencyContact: "Marie Duval", emergencyPhone: "509-3421-0011", assignedClasses: ["NS1", "NS2", "NS3"], weeklyHours: 24, monthlySalary: 45000 },
  { id: "PR-002", firstName: "Rose", lastName: "Clerveau", subject: "Français", contractType: "permanent", adminStatus: "active", dailyStatus: "present", email: "r.clerveau@educa.ht", phone: "509-6312-1002", gender: "F", dob: "1988-11-22", address: "Delmas 33, Port-au-Prince", hireDate: "2017-09-01", experienceYears: 8, diploma: "Maîtrise en Lettres", educationLevel: "Maîtrise", emergencyContact: "Paul Clerveau", emergencyPhone: "509-4812-7722", assignedClasses: ["NS1", "NS2"], weeklyHours: 18, monthlySalary: 50000 },
  { id: "PR-003", firstName: "Pierre", lastName: "Augustin", subject: "Sciences", contractType: "permanent", adminStatus: "active", dailyStatus: "absent", email: "p.augustin@educa.ht", phone: "509-3421-1003", gender: "M", dob: "1980-07-04", address: "Pétion-Ville", hireDate: "2012-09-01", experienceYears: 13, diploma: "Licence en Biologie", educationLevel: "Licence", emergencyContact: "Anne Augustin", emergencyPhone: "509-3190-4455", assignedClasses: ["NS2", "NS3", "NS4"], weeklyHours: 22, monthlySalary: 48000 },
  { id: "PR-004", firstName: "Sophia", lastName: "Joseph", subject: "Histoire", contractType: "temporary", adminStatus: "active", dailyStatus: "present", email: "s.joseph@educa.ht", phone: "509-4812-1004", gender: "F", dob: "1992-05-18", address: "Tabarre, Port-au-Prince", hireDate: "2023-09-01", experienceYears: 2, diploma: "Licence en Histoire", educationLevel: "Licence", emergencyContact: "Rose Joseph", emergencyPhone: "509-4567-3388", assignedClasses: ["NS1", "NS4"], weeklyHours: 14, monthlySalary: 30000 },
  { id: "PR-005", firstName: "Roudy", lastName: "Germain", subject: "Anglais", contractType: "permanent", adminStatus: "active", dailyStatus: "present", email: "r.germain@educa.ht", phone: "509-3765-1005", gender: "M", dob: "1983-01-30", address: "Carrefour", hireDate: "2014-09-01", experienceYears: 11, diploma: "Maîtrise en Anglais", educationLevel: "Maîtrise", emergencyContact: "Clara Germain", emergencyPhone: "509-3322-9900", assignedClasses: ["NS1", "NS2", "NS3", "NS4"], weeklyHours: 28, monthlySalary: 52000 },
  { id: "PR-006", firstName: "Fabiola", lastName: "Thermidor", subject: "Géographie", contractType: "partTime", adminStatus: "active", dailyStatus: "late", email: "f.thermidor@educa.ht", phone: "509-4623-1006", gender: "F", dob: "1990-09-12", address: "Bourdon, Port-au-Prince", hireDate: "2021-01-15", experienceYears: 4, diploma: "Licence en Géographie", educationLevel: "Licence", emergencyContact: "Claire Thermidor", emergencyPhone: "509-4901-2233", assignedClasses: ["NS2", "NS4"], weeklyHours: 10, monthlySalary: 22000 },
  { id: "PR-007", firstName: "Yvenson", lastName: "Michel", subject: "Physique", contractType: "permanent", adminStatus: "suspended", dailyStatus: "absent", email: "y.michel@educa.ht", phone: "509-3198-1007", gender: "M", dob: "1987-06-25", address: "Cité Soleil", hireDate: "2016-09-01", experienceYears: 9, diploma: "Licence en Physique", educationLevel: "Licence", emergencyContact: "Marie Michel", emergencyPhone: "509-3876-1100", assignedClasses: ["NS3", "NS4"], weeklyHours: 16, monthlySalary: 42000 },
  { id: "PR-008", firstName: "Lovely", lastName: "Charles", subject: "Chimie", contractType: "permanent", adminStatus: "active", dailyStatus: "present", email: "l.charles@educa.ht", phone: "509-4756-1008", gender: "F", dob: "1986-12-08", address: "Turgeau, Port-au-Prince", hireDate: "2013-09-01", experienceYears: 12, diploma: "Maîtrise en Chimie", educationLevel: "Maîtrise", emergencyContact: "Jean Charles", emergencyPhone: "509-4233-5566", assignedClasses: ["NS1", "NS3"], weeklyHours: 16, monthlySalary: 50000 },
  { id: "PR-009", firstName: "Woodley", lastName: "Jean-Pierre", subject: "Mathématiques", contractType: "temporary", adminStatus: "onLeave", dailyStatus: "absent", email: "w.jp@educa.ht", phone: "509-3654-1009", gender: "M", dob: "1995-04-19", address: "Martissant", hireDate: "2024-01-15", experienceYears: 1, diploma: "Licence en Mathématiques", educationLevel: "Licence", emergencyContact: "Fritz Jean-Pierre", emergencyPhone: "509-3543-8877", assignedClasses: ["NS4"], weeklyHours: 8, monthlySalary: 25000 },
  { id: "PR-010", firstName: "Natacha", lastName: "Desrosiers", subject: "Français", contractType: "permanent", adminStatus: "active", dailyStatus: "present", email: "n.desrosiers@educa.ht", phone: "509-4489-1010", gender: "F", dob: "1984-08-02", address: "Kenscoff", hireDate: "2011-09-01", experienceYears: 14, diploma: "Doctorat en Lettres", educationLevel: "Doctorat", emergencyContact: "Anne Desrosiers", emergencyPhone: "509-4678-9900", assignedClasses: ["NS3", "NS4"], weeklyHours: 20, monthlySalary: 60000 },
  { id: "PR-011", firstName: "Ricardo", lastName: "François", subject: "Sciences", contractType: "temporary", adminStatus: "active", dailyStatus: "present", email: "r.francois@educa.ht", phone: "509-3322-1011", gender: "M", dob: "1993-02-14", address: "Delmas 75", hireDate: "2022-09-01", experienceYears: 3, diploma: "Licence en Sciences", educationLevel: "Licence", emergencyContact: "Gérard François", emergencyPhone: "509-3210-4455", assignedClasses: ["NS1"], weeklyHours: 10, monthlySalary: 28000 },
  { id: "PR-012", firstName: "Judeline", lastName: "Pierre-Louis", subject: "Histoire", contractType: "permanent", adminStatus: "active", dailyStatus: "present", email: "j.pl@educa.ht", phone: "509-4901-1012", gender: "F", dob: "1982-04-27", address: "Pétion-Ville", hireDate: "2010-09-01", experienceYears: 15, diploma: "Maîtrise en Histoire", educationLevel: "Maîtrise", emergencyContact: "Yves Pierre-Louis", emergencyPhone: "509-4567-1122", assignedClasses: ["NS2", "NS3"], weeklyHours: 16, monthlySalary: 55000 },
  { id: "PR-013", firstName: "Stanley", lastName: "Moise", subject: "Anglais", contractType: "partTime", adminStatus: "active", dailyStatus: "late", email: "s.moise@educa.ht", phone: "509-3587-1013", gender: "M", dob: "1991-10-31", address: "Grand-Goâve", hireDate: "2020-01-15", experienceYears: 5, diploma: "Licence en Anglais", educationLevel: "Licence", emergencyContact: "Edner Moise", emergencyPhone: "509-3876-5533", assignedClasses: ["NS2"], weeklyHours: 8, monthlySalary: 20000 },
  { id: "PR-014", firstName: "Guerline", lastName: "Toussaint", subject: "Géographie", contractType: "permanent", adminStatus: "resigned", dailyStatus: "absent", email: "g.toussaint@educa.ht", phone: "509-4233-1014", gender: "F", dob: "1979-07-16", address: "Canapé-Vert", hireDate: "2008-09-01", experienceYears: 17, diploma: "Maîtrise en Géographie", educationLevel: "Maîtrise", emergencyContact: "Luc Toussaint", emergencyPhone: "509-4489-3344", assignedClasses: [], weeklyHours: 0, monthlySalary: 0 },
  { id: "PR-015", firstName: "Emmanuel", lastName: "Victor", subject: "Physique", contractType: "permanent", adminStatus: "active", dailyStatus: "present", email: "e.victor@educa.ht", phone: "509-3543-1015", gender: "M", dob: "1989-08-20", address: "Delmas 19", hireDate: "2018-09-01", experienceYears: 7, diploma: "Licence en Physique", educationLevel: "Licence", emergencyContact: "Daniel Victor", emergencyPhone: "509-3322-0011", assignedClasses: ["NS1", "NS2"], weeklyHours: 18, monthlySalary: 43000 },
];

/* generate rich detail data deterministically from teacher index */
function getTeacherDetails(t: Teacher): TeacherDetails {
  const idx = parseInt(t.id.replace("PR-0", ""), 10);

  const classPerformances: ClassPerformance[] = t.assignedClasses.map((cls, i) => ({
    className: cls,
    avg: Math.max(40, Math.min(95, 65 + ((idx * (i + 1) * 7) % 30) - 10)),
    passRate: Math.max(50, Math.min(100, 75 + ((idx * (i + 2) * 5) % 25) - 10)),
    students: 25 + ((idx * (i + 1)) % 15),
  }));

  const evaluations: EvalEntry[] = [
    { date: "2024-12-15", score: Math.max(50, Math.min(100, 70 + (idx * 3) % 30)), comment: idx % 3 === 0 ? "Excellent travail pédagogique" : idx % 3 === 1 ? "Bonne maîtrise du programme" : "Peut améliorer les interactions", period: "T1 2024-2025" },
    { date: "2024-06-20", score: Math.max(50, Math.min(100, 65 + (idx * 7) % 35)), comment: idx % 2 === 0 ? "Méthodes innovantes appréciées" : "Résultats satisfaisants", period: "T3 2023-2024" },
    { date: "2024-03-15", score: Math.max(50, Math.min(100, 60 + (idx * 5) % 40)), comment: "Évaluation de mi-parcours", period: "T2 2023-2024" },
  ];

  const baseSalary = t.monthlySalary;
  const bonus = idx % 3 === 0 ? Math.round(baseSalary * 0.1) : 0;
  const deduction = Math.round(baseSalary * 0.05);

  const payments: PaymentEntry[] = [
    { type: "baseSalary", amount: baseSalary, status: "paid", date: "2025-01-31" },
    { type: "baseSalary", amount: baseSalary, status: "paid", date: "2024-12-31" },
    { type: "baseSalary", amount: baseSalary, status: idx % 4 === 0 ? "pending" : "paid", date: "2025-02-28" },
    ...(bonus > 0 ? [{ type: "bonus" as const, amount: bonus, status: "paid" as const, date: "2024-12-31" }] : []),
    { type: "deduction", amount: -deduction, status: "paid", date: "2025-01-31" },
  ];

  const leaves: LeaveEntry[] = t.adminStatus === "onLeave" ? [
    { type: "sick" as const, start: "2025-02-01", end: "2025-02-14", days: 14, status: "approved" as const },
  ] : idx % 4 === 0 ? [
    { type: "annual" as const, start: "2024-07-01", end: "2024-07-15", days: 15, status: "approved" as const },
    { type: "personal" as const, start: "2024-11-20", end: "2024-11-22", days: 3, status: "approved" as const },
  ] : idx % 3 === 0 ? [
    { type: "sick" as const, start: "2024-10-05", end: "2024-10-08", days: 4, status: "approved" as const },
  ] : [];

  const hasCV = idx % 5 !== 3;
  const hasDiploma = idx % 4 !== 2;
  const hasIdCard = true;
  const hasContract = t.contractType !== "temporary" || idx % 2 === 0;
  const hasPhoto = true;
  const documents: DocEntry[] = [
    { name: "cvDoc", provided: hasCV },
    { name: "diplomaDoc", provided: hasDiploma },
    { name: "idCardDoc", provided: hasIdCard },
    { name: "contractDoc", provided: hasContract },
    { name: "photoDoc", provided: hasPhoto },
  ];

  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const schedule = t.assignedClasses.flatMap((cls, ci) =>
    [0, 1].map((si) => ({
      day: daysOfWeek[(ci * 2 + si) % 5],
      time: si === 0 ? "08:00 - 09:30" : "10:00 - 11:30",
      subject: t.subject,
      room: `Salle ${100 + (idx * (ci + 1)) % 10}`,
      className: cls,
    }))
  );

  const performanceTrend = ["Sep", "Oct", "Nov", "Dec", "Jan", "Fev"].map((m, i) => ({
    month: m,
    avg: Math.max(40, Math.min(100, 70 + ((idx * (i + 1) * 3) % 20) - 10)),
  }));

  return { classPerformances, evaluations, payments, leaves, documents, schedule, performanceTrend };
}

const subjectChartData = SUBJECTS.slice(0, 6).map((s, i) => ({
  name: s.length > 8 ? s.substring(0, 8) + "." : s,
  value: 2 + (i % 3),
}));
const COLORS = ["#013486", "#2563EB", "#F35403", "#F97316", "#10B981", "#8B5CF6"];

/* ================================================================
   HELPERS
================================================================ */

type TP = ReturnType<typeof useTranslation>["t"]["teachersPage"];

function buildPrintableHTML(
  teachers: Teacher[], headers: string[], title: string, generated: string,
  adminLabels: Record<string, string>,
) {
  const now = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const rows = teachers.map((t, i) =>
    `<tr><td>${i + 1}</td><td>${t.firstName} ${t.lastName}</td><td>${t.id}</td><td>${t.subject}</td><td>${adminLabels[t.adminStatus] ?? t.adminStatus}</td><td>${t.assignedClasses.join(", ")}</td><td>${t.phone}</td><td>${t.email}</td></tr>`
  ).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1a1a1a;padding:30px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #013486;padding-bottom:16px;margin-bottom:24px}.header h1{font-size:20px;color:#013486}.header .sub{font-size:11px;color:#666}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#013486;color:#fff;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #e5e7eb}tr:nth-child(even){background:#f9fafb}.footer{margin-top:24px;padding-top:12px;border-top:2px solid #F35403;font-size:10px;color:#999;text-align:center}@media print{body{padding:15px}}</style></head><body><div class="header"><div><h1>EDUCA</h1><p class="sub">${title}</p></div><div style="text-align:right"><p class="sub">${generated} ${now}</p><p class="sub">${teachers.length} records</p></div></div><table><thead><tr><th>N°</th>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table><div class="footer">EDUCA — ${title} — ${now}</div></body></html>`;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob(["\uFEFF" + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function evalBadge(score: number, tp: TP) {
  if (score >= 85) return { label: tp.evalExcellent, color: "bg-emerald-100 text-emerald-700" };
  if (score >= 70) return { label: tp.evalGood, color: "bg-blue-100 text-blue-700" };
  if (score >= 55) return { label: tp.evalSatisfactory, color: "bg-amber-100 text-amber-700" };
  return { label: tp.evalInsufficient, color: "bg-red-100 text-red-700" };
}

const adminStatusColor: Record<AdminStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  onLeave: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
  resigned: "bg-gray-100 text-gray-600",
  retired: "bg-purple-100 text-purple-700",
};

const contractColor: Record<ContractType, string> = {
  permanent: "bg-blue-100 text-blue-700",
  temporary: "bg-orange-100 text-orange-700",
  partTime: "bg-violet-100 text-violet-700",
};

/* ================================================================
   MODAL COMPONENTS
================================================================ */

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function AssignClassModal({ teacher, tp, onClose }: { teacher: Teacher; tp: TP; onClose: () => void }) {
  const [selected, setSelected] = useState("");
  const available = CLASSES.filter(c => !teacher.assignedClasses.includes(c));
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.currentClasses}</label>
        <div className="flex gap-2 flex-wrap">{teacher.assignedClasses.map(c => <span key={c} className="px-2 py-1 bg-[#013486]/10 text-[#013486] rounded-lg text-xs font-medium">{c}</span>)}</div>
        {teacher.assignedClasses.length === 0 && <p className="text-sm text-gray-400">{tp.noClasses}</p>}
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.availableClasses}</label>
        <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">--</option>
          {available.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.assignSubject}</label>
        <input value={teacher.subject} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50" />
      </div>
      <button className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors">{tp.confirm}</button>
    </div>
  );
}

function MessageModal({ teacher, tp, onClose }: { teacher: Teacher; tp: TP; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.messageTo}</label>
        <input value={`${teacher.firstName} ${teacher.lastName}`} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.messageSubject}</label>
        <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.messageBody}</label>
        <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <button className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors flex items-center justify-center gap-2"><Send size={14} />{tp.messageSend}</button>
    </div>
  );
}

function EvaluateModal({ teacher, tp, onClose }: { teacher: Teacher; tp: TP; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.evaluatePeriod}</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option>T1 2024-2025</option><option>T2 2024-2025</option><option>T3 2024-2025</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.evaluateScore} (0-100)</label>
        <input type="number" min={0} max={100} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.evaluateComment}</label>
        <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <button className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors">{tp.confirm}</button>
    </div>
  );
}

function SuspendModal({ tp }: { tp: TP }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.suspendReason}</label>
        <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.suspendDuration}</label>
        <input type="number" min={1} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <button className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">{tp.confirm}</button>
    </div>
  );
}

function TransferModal({ tp }: { tp: TP }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.transferSchool}</label>
        <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.transferReason}</label>
        <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <button className="w-full py-2.5 bg-[#F35403] text-white rounded-lg text-sm font-medium hover:bg-[#F35403]/90 transition-colors">{tp.confirm}</button>
    </div>
  );
}

function LeaveModal({ tp }: { tp: TP }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.leaveTypeLabel}</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="sick">{tp.leaveSick}</option>
          <option value="personal">{tp.leavePersonal}</option>
          <option value="maternity">{tp.leaveMaternity}</option>
          <option value="annual">{tp.leaveAnnual}</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.leaveStartLabel}</label>
          <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.leaveEndLabel}</label>
          <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{tp.leaveReasonLabel}</label>
        <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <button className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors">{tp.confirm}</button>
    </div>
  );
}

function ImportCSVModal({ tp, onClose }: { tp: TP; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n").filter(r => r.trim()).map(r => r.split(",").map(c => c.trim()));
      setPreview(rows.slice(0, 6));
    };
    reader.readAsText(f);
  }, []);

  const downloadTemplate = () => {
    const csv = "Code,Prénom,Nom,Matière,Contrat,Email,Téléphone,Diplôme\nPR-100,Jean,Dupont,Mathématiques,permanent,j.dupont@educa.ht,509-1234-5678,Licence en Mathématiques";
    downloadBlob(csv, "modele_enseignants.csv", "text/csv");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{tp.importDesc}</p>
      <button onClick={downloadTemplate} className="text-xs text-[#013486] underline">{tp.importTemplate}</button>
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#013486]/40 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
      >
        <Upload size={24} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">{tp.importDrag}</p>
        {file && <p className="text-xs text-[#013486] mt-2 font-medium">{file.name}</p>}
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      </div>
      {preview.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">{tp.importPreview}</h4>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <tbody>
                {preview.map((row, ri) => (
                  <tr key={ri} className={ri === 0 ? "bg-gray-50 font-medium" : ""}>
                    {row.map((cell, ci) => <td key={ci} className="px-2 py-1.5 border-b border-gray-100">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-1">{preview.length - 1} {tp.importReady}</p>
        </div>
      )}
      <button disabled={!file} className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors disabled:opacity-50">{tp.importConfirm}</button>
    </div>
  );
}

/* ================================================================
   TEACHER DRAWER
================================================================ */

type DrawerTab = "profile" | "classes" | "performance" | "admin" | "actions";

function TeacherDrawer({
  teacher, onClose, tp, onAction,
}: {
  teacher: Teacher; onClose: () => void; tp: TP;
  onAction: (action: string, t: Teacher) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("profile");
  const details = useMemo(() => getTeacherDetails(teacher), [teacher]);

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: "profile", label: tp.tabProfile },
    { key: "classes", label: tp.tabClasses },
    { key: "performance", label: tp.tabPerformance },
    { key: "admin", label: tp.tabAdmin },
    { key: "actions", label: tp.tabActions },
  ];

  const adminLabel: Record<AdminStatus, string> = {
    active: tp.statusActive, onLeave: tp.statusOnLeave, suspended: tp.statusSuspended,
    resigned: tp.statusResigned, retired: tp.statusRetired,
  };

  const contractLabel: Record<ContractType, string> = {
    permanent: tp.contractPermanent, temporary: tp.contractTemporary, partTime: tp.contractPartTime,
  };

  const leaveTypeLabel: Record<string, string> = {
    sick: tp.leaveSick, personal: tp.leavePersonal, maternity: tp.leaveMaternity, annual: tp.leaveAnnual,
  };

  const leaveStatusLabel: Record<string, string> = {
    approved: tp.leaveApproved, pending: tp.leavePending, rejected: tp.leaveRejected,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#013486] to-[#2563EB] flex items-center justify-center text-white font-bold text-lg">
                {teacher.firstName[0]}{teacher.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{teacher.firstName} {teacher.lastName}</h2>
                <p className="text-xs text-gray-500">{teacher.id} · {teacher.subject}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>
          {/* KPI pills */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-[#013486]/5 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-bold text-[#013486]">{teacher.assignedClasses.length}</p>
              <p className="text-[10px] text-gray-500">{tp.classesCount}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-bold text-emerald-600">{teacher.weeklyHours}h</p>
              <p className="text-[10px] text-gray-500">{tp.weeklyHours}</p>
            </div>
            <div className="bg-amber-50 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-bold text-amber-600">{teacher.experienceYears}</p>
              <p className="text-[10px] text-gray-500">{tp.experienceYears}</p>
            </div>
            <div className="bg-violet-50 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-bold text-violet-600">{teacher.assignedClasses.reduce((s, c) => s + (25 + (parseInt(teacher.id.replace("PR-0",""),10) * (CLASSES.indexOf(c)+1)) % 15), 0)}</p>
              <p className="text-[10px] text-gray-500">{tp.totalStudents}</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === t.key ? "bg-[#013486] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* -------- PROFILE -------- */}
          {tab === "profile" && (
            <>
              {/* Status badges */}
              <div className="flex gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${adminStatusColor[teacher.adminStatus]}`}>{adminLabel[teacher.adminStatus]}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${contractColor[teacher.contractType]}`}>{contractLabel[teacher.contractType]}</span>
              </div>

              {/* Personal info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Users size={14} />{tp.personalInfo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">{tp.genderLabel}</span><p className="font-medium">{teacher.gender === "M" ? "Masculin" : "Féminin"}</p></div>
                  <div><span className="text-gray-500 text-xs">{tp.dobLabel}</span><p className="font-medium">{teacher.dob}</p></div>
                  <div className="col-span-2"><span className="text-gray-500 text-xs">{tp.addressLabel}</span><p className="font-medium flex items-center gap-1"><MapPin size={12} />{teacher.address}</p></div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Phone size={14} />{tp.contactInfo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">{tp.phoneLabel}</span><p className="font-medium flex items-center gap-1"><Phone size={12} />{teacher.phone}</p></div>
                  <div><span className="text-gray-500 text-xs">{tp.emailLabel}</span><p className="font-medium flex items-center gap-1"><Mail size={12} />{teacher.email}</p></div>
                  <div><span className="text-gray-500 text-xs">{tp.emergencyContact}</span><p className="font-medium">{teacher.emergencyContact}</p></div>
                  <div><span className="text-gray-500 text-xs">{tp.emergencyPhone}</span><p className="font-medium">{teacher.emergencyPhone}</p></div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><GraduationCap size={14} />{tp.qualifications}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">{tp.specialization}</span><p className="font-medium">{teacher.subject}</p></div>
                  <div><span className="text-gray-500 text-xs">{tp.diploma}</span><p className="font-medium">{teacher.diploma}</p></div>
                  <div><span className="text-gray-500 text-xs">{tp.educationLevel}</span><p className="font-medium">{teacher.educationLevel}</p></div>
                  <div><span className="text-gray-500 text-xs">{tp.hireDate}</span><p className="font-medium">{teacher.hireDate}</p></div>
                </div>
              </div>
            </>
          )}

          {/* -------- CLASSES & SCHEDULE -------- */}
          {tab === "classes" && (
            <>
              {/* Assigned classes */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><BookOpen size={14} />{tp.assignedClasses}</h3>
                {teacher.assignedClasses.length === 0 ? (
                  <p className="text-sm text-gray-400">{tp.noClasses}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {details.classPerformances.map(cp => (
                      <div key={cp.className} className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#013486]">{cp.className}</span>
                          <span className="text-xs text-gray-400">{cp.students} {tp.studentsCount.toLowerCase()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>{tp.classAvg}: <strong>{cp.avg}</strong>/100</span>
                          <span>{tp.passRate}: <strong>{cp.passRate}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Calendar size={14} />{tp.scheduleTitle}</h3>
                {details.schedule.length === 0 ? (
                  <p className="text-sm text-gray-400">{tp.noSchedule}</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-white text-gray-500 border-b">
                        <th className="px-3 py-2 text-left font-medium">{tp.day}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.time}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.class}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.room}</th>
                      </tr></thead>
                      <tbody>
                        {details.schedule.map((s, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-white/50">
                            <td className="px-3 py-2 font-medium">{s.day}</td>
                            <td className="px-3 py-2">{s.time}</td>
                            <td className="px-3 py-2"><span className="px-1.5 py-0.5 bg-[#013486]/10 text-[#013486] rounded text-[10px] font-medium">{s.className}</span></td>
                            <td className="px-3 py-2">{s.room}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* -------- PERFORMANCE -------- */}
          {tab === "performance" && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#013486]/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#013486]">
                    {details.classPerformances.length > 0 ? Math.round(details.classPerformances.reduce((s, c) => s + c.avg, 0) / details.classPerformances.length) : "—"}
                  </p>
                  <p className="text-xs text-gray-500">{tp.avgClassPerformance}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {details.classPerformances.length > 0 ? Math.round(details.classPerformances.reduce((s, c) => s + c.passRate, 0) / details.classPerformances.length) : "—"}%
                  </p>
                  <p className="text-xs text-gray-500">{tp.studentSuccessRate}</p>
                </div>
              </div>

              {/* Performance trend chart */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><TrendingUp size={14} />{tp.performanceTrend}</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={details.performanceTrend}>
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="avg" stroke="#013486" strokeWidth={2} dot={{ fill: "#013486", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {details.classPerformances.length > 0 && (
                  <div className="flex gap-4 mt-3 text-xs">
                    <span className="text-emerald-600">{tp.bestClass}: <strong>{[...details.classPerformances].sort((a, b) => b.avg - a.avg)[0].className}</strong></span>
                    <span className="text-amber-600">{tp.worstClass}: <strong>{[...details.classPerformances].sort((a, b) => a.avg - b.avg)[0].className}</strong></span>
                  </div>
                )}
              </div>

              {/* Class performance table */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Activity size={14} />{tp.classPerformance}</h3>
                {details.classPerformances.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-white text-gray-500 border-b">
                        <th className="px-3 py-2 text-left font-medium">{tp.className}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.classAvg}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.passRate}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.studentsCount}</th>
                      </tr></thead>
                      <tbody>
                        {details.classPerformances.map((cp) => (
                          <tr key={cp.className} className="border-b border-gray-50">
                            <td className="px-3 py-2 font-medium">{cp.className}</td>
                            <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cp.avg >= 70 ? "bg-emerald-100 text-emerald-700" : cp.avg >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{cp.avg}/100</span></td>
                            <td className="px-3 py-2">{cp.passRate}%</td>
                            <td className="px-3 py-2">{cp.students}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-sm text-gray-400">{tp.noClasses}</p>}
              </div>

              {/* Evaluation history */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Star size={14} />{tp.evaluationHistory}</h3>
                <div className="space-y-2">
                  {details.evaluations.map((ev, i) => {
                    const badge = evalBadge(ev.score, tp);
                    return (
                      <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">{ev.period} — {ev.date}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>{badge.label} ({ev.score}/100)</span>
                        </div>
                        <p className="text-xs text-gray-600">{ev.comment}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* -------- ADMIN -------- */}
          {tab === "admin" && (
            <>
              {/* Salary info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><CreditCard size={14} />{tp.salaryInfo}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                    <p className="text-xl font-bold text-[#013486]">{teacher.monthlySalary.toLocaleString()} HTG</p>
                    <p className="text-xs text-gray-500">{tp.monthlySalary}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                    <p className="text-xl font-bold text-emerald-600">
                      {details.payments.filter(p => p.status === "paid" && p.amount > 0).reduce((s, p) => s + p.amount, 0).toLocaleString()} HTG
                    </p>
                    <p className="text-xs text-gray-500">{tp.totalPaid}</p>
                  </div>
                </div>
              </div>

              {/* Payment history */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><FileText size={14} />{tp.paymentHistory}</h3>
                <div className="space-y-2">
                  {details.payments.map((p, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                      <div>
                        <p className="text-xs font-medium text-gray-800">{(tp as Record<string, string>)[p.type] ?? p.type}</p>
                        <p className="text-[10px] text-gray-400">{p.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${p.amount < 0 ? "text-red-500" : "text-gray-800"}`}>{p.amount > 0 ? "+" : ""}{p.amount.toLocaleString()} HTG</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${p.status === "paid" ? "bg-emerald-100 text-emerald-700" : p.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                          {p.status === "paid" ? tp.paymentPaid : p.status === "pending" ? tp.paymentPending : tp.paymentOverdue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave history */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Calendar size={14} />{tp.leaveHistory}</h3>
                {details.leaves.length === 0 ? (
                  <p className="text-sm text-gray-400">—</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-white text-gray-500 border-b">
                        <th className="px-3 py-2 text-left font-medium">{tp.leaveType}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.leaveStart}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.leaveEnd}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.leaveDays}</th>
                        <th className="px-3 py-2 text-left font-medium">{tp.leaveStatus}</th>
                      </tr></thead>
                      <tbody>
                        {details.leaves.map((l, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="px-3 py-2 font-medium">{leaveTypeLabel[l.type]}</td>
                            <td className="px-3 py-2">{l.start}</td>
                            <td className="px-3 py-2">{l.end}</td>
                            <td className="px-3 py-2">{l.days}</td>
                            <td className="px-3 py-2">
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${l.status === "approved" ? "bg-emerald-100 text-emerald-700" : l.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                {leaveStatusLabel[l.status]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="text-xs text-gray-500">{tp.remainingLeave}: <strong className="text-[#013486]">{15 - details.leaves.filter(l => l.status === "approved").reduce((s, l) => s + l.days, 0)}</strong> {tp.leaveDays.toLowerCase()}</p>
              </div>

              {/* Documents */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><FileCheck size={14} />{tp.requiredDocs}</h3>
                <div className="space-y-1.5">
                  {details.documents.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                      <span className="text-xs text-gray-700">{(tp as Record<string, string>)[d.name] ?? d.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${d.provided ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {d.provided ? tp.docProvided : tp.docMissing}
                      </span>
                    </div>
                  ))}
                </div>
                {(() => {
                  const missing = details.documents.filter(d => !d.provided).length;
                  return (
                    <p className={`text-xs font-medium ${missing > 0 ? "text-red-500" : "text-emerald-600"}`}>
                      {missing > 0 ? tp.incompleteFile : tp.completeFile}
                    </p>
                  );
                })()}
              </div>
            </>
          )}

          {/* -------- ACTIONS -------- */}
          {tab === "actions" && (
            <div className="space-y-2">
              {[
                { key: "edit", icon: <Edit3 size={14} />, label: tp.actionEdit, color: "text-gray-700" },
                { key: "assign", icon: <BookOpen size={14} />, label: tp.actionAssign, color: "text-[#013486]" },
                { key: "message", icon: <MessageSquare size={14} />, label: tp.actionMessage, color: "text-[#013486]" },
                { key: "schedule", icon: <Calendar size={14} />, label: tp.actionSchedule, color: "text-[#013486]" },
                { key: "evaluate", icon: <Star size={14} />, label: tp.actionEvaluate, color: "text-amber-600" },
                { key: "leave", icon: <Clock size={14} />, label: tp.actionLeave, color: "text-violet-600" },
                { key: "payslip", icon: <CreditCard size={14} />, label: tp.actionPayslip, color: "text-emerald-600" },
                { key: "certificate", icon: <Award size={14} />, label: tp.actionCertificate, color: "text-[#013486]" },
                { key: "stats", icon: <Activity size={14} />, label: tp.actionStats, color: "text-[#013486]" },
                ...(teacher.adminStatus === "suspended"
                  ? [{ key: "reactivate", icon: <Shield size={14} />, label: tp.actionReactivate, color: "text-emerald-600" }]
                  : [{ key: "suspend", icon: <Ban size={14} />, label: tp.actionSuspend, color: "text-red-500" }]
                ),
                { key: "transfer", icon: <Repeat size={14} />, label: tp.actionTransfer, color: "text-[#F35403]" },
                { key: "delete", icon: <Trash2 size={14} />, label: tp.actionDelete, color: "text-red-500" },
              ].map(a => (
                <button key={a.key} onClick={() => onAction(a.key, teacher)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium ${a.color}`}>
                  {a.icon}{a.label}
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

export default function AdminTeachersPage() {
  const { t } = useTranslation();
  const tp = t.teachersPage;

  /* --- state --- */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDailyStatus, setFilterDailyStatus] = useState("");
  const [filterAdminStatus, setFilterAdminStatus] = useState("");
  const [filterContract, setFilterContract] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | "subject" | "classes" | "experience">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerTeacher, setDrawerTeacher] = useState<Teacher | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"assign" | "message" | "evaluate" | "suspend" | "transfer" | "leave" | "import" | null>(null);
  const [modalTeacher, setModalTeacher] = useState<Teacher | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  /* close menus on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) setActionMenuId(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* admin status / contract / daily labels */
  const adminLabels: Record<string, string> = {
    active: tp.statusActive, onLeave: tp.statusOnLeave, suspended: tp.statusSuspended,
    resigned: tp.statusResigned, retired: tp.statusRetired,
  };
  const dailyLabels: Record<string, string> = {
    present: tp.statusPresent, absent: tp.statusAbsent, late: tp.statusLate,
  };
  const contractLabels: Record<string, string> = {
    permanent: tp.contractPermanent, temporary: tp.contractTemporary, partTime: tp.contractPartTime,
  };

  /* --- filtering, sorting, pagination --- */
  const filtered = useMemo(() => {
    let result = [...allTeachers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q)
      );
    }
    if (filterSubject) result = result.filter(t => t.subject === filterSubject);
    if (filterDailyStatus) result = result.filter(t => t.dailyStatus === filterDailyStatus);
    if (filterAdminStatus) result = result.filter(t => t.adminStatus === filterAdminStatus);
    if (filterContract) result = result.filter(t => t.contractType === filterContract);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
      else if (sortKey === "subject") cmp = a.subject.localeCompare(b.subject);
      else if (sortKey === "classes") cmp = a.assignedClasses.length - b.assignedClasses.length;
      else cmp = a.experienceYears - b.experienceYears;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [searchQuery, filterSubject, filterDailyStatus, filterAdminStatus, filterContract, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* reset page when filters change */
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterSubject, filterDailyStatus, filterAdminStatus, filterContract]);

  /* --- stats --- */
  const totalActive = allTeachers.filter(t => t.adminStatus === "active").length;
  const totalOnLeave = allTeachers.filter(t => t.adminStatus === "onLeave").length;
  const avgExp = Math.round(allTeachers.reduce((s, t) => s + t.experienceYears, 0) / allTeachers.length);
  const presentToday = allTeachers.filter(t => t.dailyStatus === "present").length;
  const maleCount = allTeachers.filter(t => t.gender === "M").length;
  const femaleCount = allTeachers.filter(t => t.gender === "F").length;

  /* --- selection --- */
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(t => t.id)));
  };

  /* --- sort toggle --- */
  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  /* --- export --- */
  const doExport = (type: "pdf" | "excel" | "csv" | "print") => {
    setExportOpen(false);
    const headers = [tp.colTeacher, tp.colCode, tp.colSubject, tp.colAdminStatus, tp.colClasses, tp.colPhone, "Email"];

    if (type === "pdf" || type === "print") {
      const html = buildPrintableHTML(filtered, headers, tp.exportTitle, tp.exportGenerated, adminLabels);
      const w = window.open("", "_blank");
      if (w) { w.document.write(html); w.document.close(); if (type === "print") setTimeout(() => w.print(), 300); }
    } else if (type === "csv") {
      const csv = [headers.join(","), ...filtered.map(t => [
        `${t.firstName} ${t.lastName}`, t.id, t.subject, adminLabels[t.adminStatus], `"${t.assignedClasses.join(", ")}"`, t.phone, t.email,
      ].join(","))].join("\n");
      downloadBlob(csv, "enseignants_educa.csv", "text/csv");
    } else {
      const html = `<table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>${filtered.map(t => `<tr><td>${t.firstName} ${t.lastName}</td><td>${t.id}</td><td>${t.subject}</td><td>${adminLabels[t.adminStatus]}</td><td>${t.assignedClasses.join(", ")}</td><td>${t.phone}</td><td>${t.email}</td></tr>`).join("")}</table>`;
      downloadBlob(html, "enseignants_educa.xls", "application/vnd.ms-excel");
    }
  };

  /* --- drawer action handler --- */
  const handleDrawerAction = (action: string, teacher: Teacher) => {
    setDrawerTeacher(null);
    setModalTeacher(teacher);
    if (action === "assign") setModalType("assign");
    else if (action === "message") setModalType("message");
    else if (action === "evaluate") setModalType("evaluate");
    else if (action === "suspend") setModalType("suspend");
    else if (action === "transfer") setModalType("transfer");
    else if (action === "leave") setModalType("leave");
    else if (action === "delete") {
      if (confirm(tp.confirmDelete)) { /* mock delete */ }
    }
  };

  const genderChartData = [
    { name: tp.men, value: maleCount },
    { name: tp.women, value: femaleCount },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.teachers.title}
        description={t.pages.admin.teachers.desc}
        icon={<BookOpen size={20} />}
      />

      {/* ====== STAT CARDS ====== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: tp.totalTeachers, value: allTeachers.length, icon: <Users size={18} />, bg: "bg-[#013486]/5", text: "text-[#013486]" },
          { label: tp.activeTeachers, value: totalActive, icon: <UserCheck size={18} />, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: tp.onLeave, value: totalOnLeave, icon: <Clock size={18} />, bg: "bg-amber-50", text: "text-amber-600" },
          { label: tp.avgExperience, value: `${avgExp} ${tp.years}`, icon: <Briefcase size={18} />, bg: "bg-violet-50", text: "text-violet-600" },
          { label: tp.presentToday, value: presentToday, icon: <Shield size={18} />, bg: "bg-blue-50", text: "text-blue-600" },
          { label: tp.totalTeachers, value: `${maleCount}H / ${femaleCount}F`, icon: <Activity size={18} />, bg: "bg-[#F35403]/5", text: "text-[#F35403]" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center ${s.text}`}>{s.icon}</div>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ====== CHARTS ====== */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Subject distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{tp.subjectDist}</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {subjectChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Gender distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{tp.genderDist}</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="#013486" />
                  <Cell fill="#F35403" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ====== FILTERS ====== */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">{tp.filterTitle}</span>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} {filtered.length === 1 ? tp.result : tp.results}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Subject */}
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{tp.allSubjects}</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Daily status */}
          <select value={filterDailyStatus} onChange={e => setFilterDailyStatus(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{tp.allStatuses}</option>
            <option value="present">{tp.statusPresent}</option>
            <option value="absent">{tp.statusAbsent}</option>
            <option value="late">{tp.statusLate}</option>
          </select>
          {/* Admin status */}
          <select value={filterAdminStatus} onChange={e => setFilterAdminStatus(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{tp.allStatuses}</option>
            <option value="active">{tp.statusActive}</option>
            <option value="onLeave">{tp.statusOnLeave}</option>
            <option value="suspended">{tp.statusSuspended}</option>
            <option value="resigned">{tp.statusResigned}</option>
            <option value="retired">{tp.statusRetired}</option>
          </select>
          {/* Contract */}
          <select value={filterContract} onChange={e => setFilterContract(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{tp.allContractTypes}</option>
            <option value="permanent">{tp.contractPermanent}</option>
            <option value="temporary">{tp.contractTemporary}</option>
            <option value="partTime">{tp.contractPartTime}</option>
          </select>
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={tp.searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg" />
          </div>
          {/* Reset */}
          <button onClick={() => { setSearchQuery(""); setFilterSubject(""); setFilterDailyStatus(""); setFilterAdminStatus(""); setFilterContract(""); }}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">{tp.reset}</button>
          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button onClick={() => setExportOpen(!exportOpen)} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <Download size={13} />{tp.export}<ChevronDown size={12} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 min-w-[160px]">
                <button onClick={() => doExport("pdf")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><FileText size={12} />{tp.exportPDF}</button>
                <button onClick={() => doExport("excel")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><FileSpreadsheet size={12} />{tp.exportExcel}</button>
                <button onClick={() => doExport("csv")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><FileText size={12} />{tp.exportCSV}</button>
                <button onClick={() => doExport("print")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Printer size={12} />{tp.print}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== BULK SELECTION BAR ====== */}
      {selectedIds.size > 0 && (
        <div className="bg-[#013486] text-white rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium">{selectedIds.size} {tp.selected}</span>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1"><MessageSquare size={12} />{tp.bulkMessage}</button>
            <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1"><Download size={12} />{tp.bulkExport}</button>
            <button className="text-xs px-3 py-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 flex items-center gap-1"><Trash2 size={12} />{tp.bulkDelete}</button>
          </div>
        </div>
      )}

      {/* ====== TABLE ====== */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-800">{tp.listTitle}</h3>
            <button onClick={() => setModalType("import")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#013486] hover:text-[#013486]">
              <Upload size={12} />{tp.importCSV}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>{tp.itemsPerPage}:</span>
              <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-200 rounded px-1.5 py-0.5 text-xs">
                <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
              </select>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#013486] text-white text-xs font-medium rounded-lg hover:bg-[#013486]/90">
              <Plus size={14} />{tp.addTeacher}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-[#013486]">
                    {selectedIds.size === paginated.length && paginated.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("name")}>
                  <span className="flex items-center gap-1">{tp.colTeacher}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{tp.colCode}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("subject")}>
                  <span className="flex items-center gap-1">{tp.colSubject}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{tp.colContract}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{tp.colAdminStatus}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{tp.colStatus}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("classes")}>
                  <span className="flex items-center gap-1">{tp.colClasses}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{tp.colPhone}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{tp.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">{tp.noResults}</td></tr>
              ) : paginated.map((teacher) => (
                <tr key={teacher.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(teacher.id)} className="text-gray-400 hover:text-[#013486]">
                      {selectedIds.has(teacher.id) ? <CheckSquare size={16} className="text-[#013486]" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#013486] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
                        {teacher.firstName[0]}{teacher.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{teacher.firstName} {teacher.lastName}</p>
                        <p className="text-[10px] text-gray-400">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{teacher.id}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{teacher.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${contractColor[teacher.contractType]}`}>
                      {contractLabels[teacher.contractType]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${adminStatusColor[teacher.adminStatus]}`}>
                      {adminLabels[teacher.adminStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      teacher.dailyStatus === "present" ? "text-emerald-600" : teacher.dailyStatus === "late" ? "text-amber-600" : "text-red-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        teacher.dailyStatus === "present" ? "bg-emerald-500" : teacher.dailyStatus === "late" ? "bg-amber-500" : "bg-red-500"
                      }`} />
                      {dailyLabels[teacher.dailyStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {teacher.assignedClasses.map(c => (
                        <span key={c} className="px-1.5 py-0.5 bg-[#013486]/10 text-[#013486] rounded text-[10px] font-medium">{c}</span>
                      ))}
                      {teacher.assignedClasses.length === 0 && <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{teacher.phone || tp.noPhone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDrawerTeacher(teacher)} className="p-1.5 rounded-lg hover:bg-[#013486]/10 text-[#013486]"><Eye size={14} /></button>
                      <div className="relative">
                        <button onClick={() => setActionMenuId(actionMenuId === teacher.id ? null : teacher.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal size={14} /></button>
                        {actionMenuId === teacher.id && (
                          <div ref={actionMenuRef} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 min-w-[180px]">
                            <button onClick={() => { setActionMenuId(null); setDrawerTeacher(teacher); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Eye size={12} />{tp.actionView}</button>
                            <button onClick={() => { setActionMenuId(null); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Edit3 size={12} />{tp.actionEdit}</button>
                            <button onClick={() => { setActionMenuId(null); setModalTeacher(teacher); setModalType("assign"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><BookOpen size={12} />{tp.actionAssign}</button>
                            <button onClick={() => { setActionMenuId(null); setModalTeacher(teacher); setModalType("message"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><MessageSquare size={12} />{tp.actionMessage}</button>
                            <button onClick={() => { setActionMenuId(null); setModalTeacher(teacher); setModalType("evaluate"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Star size={12} />{tp.actionEvaluate}</button>
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => { setActionMenuId(null); setModalTeacher(teacher); setModalType("suspend"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2 text-red-500"><Ban size={12} />{tp.actionSuspend}</button>
                            <button onClick={() => { setActionMenuId(null); if (confirm(tp.confirmDelete)) { /* mock delete */ } }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2 text-red-500"><Trash2 size={12} />{tp.actionDelete}</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {tp.showing} {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} {tp.on} {filtered.length} {tp.teachers}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button key={pg} onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${currentPage === pg ? "bg-[#013486] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                  {pg}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* ====== DRAWER ====== */}
      {drawerTeacher && (
        <TeacherDrawer teacher={drawerTeacher} onClose={() => setDrawerTeacher(null)} tp={tp} onAction={handleDrawerAction} />
      )}

      {/* ====== MODALS ====== */}
      <Modal open={modalType === "assign" && !!modalTeacher} onClose={() => setModalType(null)} title={tp.assignClassTitle}>
        {modalTeacher && <AssignClassModal teacher={modalTeacher} tp={tp} onClose={() => setModalType(null)} />}
      </Modal>
      <Modal open={modalType === "message" && !!modalTeacher} onClose={() => setModalType(null)} title={tp.messageTitle}>
        {modalTeacher && <MessageModal teacher={modalTeacher} tp={tp} onClose={() => setModalType(null)} />}
      </Modal>
      <Modal open={modalType === "evaluate" && !!modalTeacher} onClose={() => setModalType(null)} title={tp.evaluateTitle}>
        {modalTeacher && <EvaluateModal teacher={modalTeacher} tp={tp} onClose={() => setModalType(null)} />}
      </Modal>
      <Modal open={modalType === "suspend"} onClose={() => setModalType(null)} title={tp.suspendTitle}>
        <SuspendModal tp={tp} />
      </Modal>
      <Modal open={modalType === "transfer"} onClose={() => setModalType(null)} title={tp.transferTitle}>
        <TransferModal tp={tp} />
      </Modal>
      <Modal open={modalType === "leave"} onClose={() => setModalType(null)} title={tp.leaveTitle}>
        <LeaveModal tp={tp} />
      </Modal>
      <Modal open={modalType === "import"} onClose={() => setModalType(null)} title={tp.importTitle}>
        <ImportCSVModal tp={tp} onClose={() => setModalType(null)} />
      </Modal>
    </div>
  );
}
