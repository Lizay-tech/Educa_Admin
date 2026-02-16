"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  GraduationCap, Users, UserX, UserPlus, Search, ChevronLeft, ChevronRight,
  Eye, Filter, Download, Plus, FileText, FileSpreadsheet, Printer,
  ChevronDown, MoreHorizontal, Edit3, MessageSquare, ClipboardList, Ban,
  Trash2, X, Phone, Mail, MapPin, Calendar, TrendingUp, ArrowUpDown,
  CheckSquare, Square, ChevronUp, Upload, BookOpen,
  AlertTriangle, CreditCard, FileCheck, Award, Repeat, Send,
  School, Shield, Table2, UserCheck, Activity,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  LineChart, Line,
} from "recharts";

/* ================================================================
   TYPES
================================================================ */

type AdminStatus = "active" | "suspended" | "graduated" | "transferred";
type DailyStatus = "present" | "absent" | "late";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  section: string;
  adminStatus: AdminStatus;
  dailyStatus: DailyStatus;
  email: string;
  phone: string;
  gender: "M" | "F";
  average: number;
  rank: number;
  dob: string;
  address: string;
  parent: string;
  parentPhone: string;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  schoolYear: string;
  enrollDate: string;
}

interface GradeEntry { subject: string; t1: number; t2: number; t3: number; coeff: number }
interface AbsenceEntry { date: string; reason: string; justified: boolean }
interface SanctionEntry { type: "warning" | "detention" | "temporary"; date: string; reason: string }
interface PaymentEntry { type: string; amount: number; status: "paid" | "pending" | "overdue"; date: string }
interface DocEntry { name: string; provided: boolean }

interface StudentDetails {
  previousClasses: { year: string; cls: string }[];
  grades: GradeEntry[];
  absences: AbsenceEntry[];
  sanctions: SanctionEntry[];
  payments: PaymentEntry[];
  documents: DocEntry[];
  schedule: { day: string; time: string; subject: string; room: string }[];
  performanceTrend: { month: string; avg: number }[];
}

/* ================================================================
   MOCK DATA
================================================================ */

const allStudents: Student[] = [
  { id: "ED-01201", firstName: "Jean", lastName: "Baptiste", class: "NS1", section: "A", adminStatus: "active", dailyStatus: "present", email: "jean.baptiste@email.com", phone: "509-4537-1345", gender: "M", average: 78, rank: 5, dob: "2010-03-15", address: "Rue Capois, Port-au-Prince", parent: "Marc Baptiste", parentPhone: "509-3421-0011", daysPresent: 142, daysAbsent: 5, daysLate: 3, schoolYear: "2024-2025", enrollDate: "2024-09-02" },
  { id: "ED-01202", firstName: "Marie", lastName: "Clerveau", class: "NS1", section: "A", adminStatus: "active", dailyStatus: "present", email: "marie.clerveau@email.com", phone: "509-6312-3765", gender: "F", average: 85, rank: 2, dob: "2009-11-22", address: "Delmas 33, Port-au-Prince", parent: "Sophie Clerveau", parentPhone: "509-4812-7722", daysPresent: 148, daysAbsent: 1, daysLate: 1, schoolYear: "2024-2025", enrollDate: "2024-09-01" },
  { id: "ED-01203", firstName: "Pierre", lastName: "Augustin", class: "NS2", section: "B", adminStatus: "active", dailyStatus: "absent", email: "pierre.augustin@email.com", phone: "509-3421-8901", gender: "M", average: 62, rank: 14, dob: "2010-07-04", address: "Pétion-Ville", parent: "Jean Augustin", parentPhone: "509-3190-4455", daysPresent: 120, daysAbsent: 22, daysLate: 8, schoolYear: "2024-2025", enrollDate: "2024-09-03" },
  { id: "ED-01204", firstName: "Sophia", lastName: "Joseph", class: "NS2", section: "A", adminStatus: "active", dailyStatus: "present", email: "sophia.joseph@email.com", phone: "509-4812-5543", gender: "F", average: 91, rank: 1, dob: "2009-05-18", address: "Tabarre, Port-au-Prince", parent: "Rose Joseph", parentPhone: "509-4567-3388", daysPresent: 149, daysAbsent: 0, daysLate: 1, schoolYear: "2024-2025", enrollDate: "2024-09-01" },
  { id: "ED-01205", firstName: "Roudy", lastName: "Delmas", class: "NS3", section: "A", adminStatus: "active", dailyStatus: "present", email: "roudy.delmas@email.com", phone: "509-3765-2210", gender: "M", average: 55, rank: 18, dob: "2010-01-30", address: "Carrefour", parent: "Paul Delmas", parentPhone: "509-3322-9900", daysPresent: 130, daysAbsent: 12, daysLate: 8, schoolYear: "2024-2025", enrollDate: "2024-09-02" },
  { id: "ED-01206", firstName: "Fabiola", lastName: "Thermidor", class: "NS3", section: "B", adminStatus: "active", dailyStatus: "late", email: "fabiola.thermidor@email.com", phone: "509-4623-9987", gender: "F", average: 73, rank: 8, dob: "2009-09-12", address: "Bourdon, Port-au-Prince", parent: "Claire Thermidor", parentPhone: "509-4901-2233", daysPresent: 138, daysAbsent: 4, daysLate: 8, schoolYear: "2024-2025", enrollDate: "2024-09-01" },
  { id: "ED-01207", firstName: "Yvenson", lastName: "Michel", class: "NS4", section: "A", adminStatus: "suspended", dailyStatus: "absent", email: "yvenson.michel@email.com", phone: "509-3198-4412", gender: "M", average: 44, rank: 19, dob: "2010-06-25", address: "Cité Soleil", parent: "Marie Michel", parentPhone: "509-3876-1100", daysPresent: 110, daysAbsent: 30, daysLate: 10, schoolYear: "2024-2025", enrollDate: "2024-09-04" },
  { id: "ED-01208", firstName: "Lovely", lastName: "Charles", class: "NS1", section: "B", adminStatus: "active", dailyStatus: "present", email: "lovely.charles@email.com", phone: "509-4756-3301", gender: "F", average: 88, rank: 3, dob: "2009-12-08", address: "Turgeau, Port-au-Prince", parent: "Jean Charles", parentPhone: "509-4233-5566", daysPresent: 147, daysAbsent: 2, daysLate: 1, schoolYear: "2024-2025", enrollDate: "2024-09-01" },
  { id: "ED-01209", firstName: "Woodley", lastName: "Jean-Pierre", class: "NS4", section: "A", adminStatus: "active", dailyStatus: "absent", email: "woodley.jp@email.com", phone: "509-3654-7789", gender: "M", average: 39, rank: 20, dob: "2010-04-19", address: "Martissant", parent: "Fritz Jean-Pierre", parentPhone: "509-3543-8877", daysPresent: 100, daysAbsent: 40, daysLate: 10, schoolYear: "2024-2025", enrollDate: "2024-09-05" },
  { id: "ED-01210", firstName: "Natacha", lastName: "Desrosiers", class: "NS2", section: "A", adminStatus: "active", dailyStatus: "present", email: "natacha.desrosiers@email.com", phone: "509-4489-1122", gender: "F", average: 81, rank: 4, dob: "2009-08-02", address: "Kenscoff", parent: "Anne Desrosiers", parentPhone: "509-4678-9900", daysPresent: 145, daysAbsent: 3, daysLate: 2, schoolYear: "2024-2025", enrollDate: "2024-09-01" },
  { id: "ED-01211", firstName: "Ricardo", lastName: "François", class: "NS3", section: "A", adminStatus: "active", dailyStatus: "present", email: "ricardo.francois@email.com", phone: "509-3322-5588", gender: "M", average: 67, rank: 10, dob: "2010-02-14", address: "Delmas 75", parent: "Gérard François", parentPhone: "509-3210-4455", daysPresent: 135, daysAbsent: 8, daysLate: 7, schoolYear: "2024-2025", enrollDate: "2024-09-02" },
  { id: "ED-01212", firstName: "Judeline", lastName: "Pierre-Louis", class: "NS1", section: "A", adminStatus: "active", dailyStatus: "present", email: "judeline.pl@email.com", phone: "509-4901-3367", gender: "F", average: 92, rank: 1, dob: "2009-04-27", address: "Pétion-Ville", parent: "Yves Pierre-Louis", parentPhone: "509-4567-1122", daysPresent: 150, daysAbsent: 0, daysLate: 0, schoolYear: "2024-2025", enrollDate: "2024-09-01" },
  { id: "ED-01213", firstName: "Stanley", lastName: "Moise", class: "NS4", section: "B", adminStatus: "active", dailyStatus: "late", email: "stanley.moise@email.com", phone: "509-3587-2244", gender: "M", average: 48, rank: 17, dob: "2010-10-31", address: "Grand-Goâve", parent: "Edner Moise", parentPhone: "509-3876-5533", daysPresent: 115, daysAbsent: 20, daysLate: 15, schoolYear: "2024-2025", enrollDate: "2024-09-03" },
  { id: "ED-01214", firstName: "Guerline", lastName: "Toussaint", class: "NS2", section: "B", adminStatus: "graduated", dailyStatus: "present", email: "guerline.toussaint@email.com", phone: "509-4233-9901", gender: "F", average: 76, rank: 7, dob: "2009-07-16", address: "Canapé-Vert", parent: "Luc Toussaint", parentPhone: "509-4489-3344", daysPresent: 140, daysAbsent: 6, daysLate: 4, schoolYear: "2024-2025", enrollDate: "2023-09-01" },
  { id: "ED-01215", firstName: "Dieulande", lastName: "Hyppolite", class: "NS3", section: "A", adminStatus: "active", dailyStatus: "present", email: "dieulande.h@email.com", phone: "509-3876-4455", gender: "M", average: 70, rank: 9, dob: "2010-05-09", address: "Thomassin", parent: "Jules Hyppolite", parentPhone: "509-3654-2211", daysPresent: 137, daysAbsent: 7, daysLate: 6, schoolYear: "2024-2025", enrollDate: "2024-09-02" },
  { id: "ED-01216", firstName: "Cassandra", lastName: "Belfort", class: "NS1", section: "B", adminStatus: "active", dailyStatus: "absent", email: "cassandra.belfort@email.com", phone: "509-4567-8899", gender: "F", average: 83, rank: 3, dob: "2009-01-23", address: "Laboule", parent: "Michel Belfort", parentPhone: "509-4756-6677", daysPresent: 143, daysAbsent: 5, daysLate: 2, schoolYear: "2024-2025", enrollDate: "2024-09-01" },
  { id: "ED-01217", firstName: "Frantz", lastName: "Laleau", class: "NS4", section: "A", adminStatus: "transferred", dailyStatus: "absent", email: "frantz.laleau@email.com", phone: "509-3210-6677", gender: "M", average: 41, rank: 18, dob: "2010-09-07", address: "Croix-des-Bouquets", parent: "Robert Laleau", parentPhone: "509-3198-8899", daysPresent: 108, daysAbsent: 32, daysLate: 10, schoolYear: "2024-2025", enrollDate: "2024-09-04" },
  { id: "ED-01218", firstName: "Myrlande", lastName: "Exanté", class: "NS2", section: "A", adminStatus: "active", dailyStatus: "present", email: "myrlande.exante@email.com", phone: "509-4678-1133", gender: "F", average: 87, rank: 2, dob: "2009-06-11", address: "Vivy Mitchell", parent: "Claude Exanté", parentPhone: "509-4901-7788", daysPresent: 146, daysAbsent: 2, daysLate: 2, schoolYear: "2024-2025", enrollDate: "2024-09-01" },
  { id: "ED-01219", firstName: "Emmanuel", lastName: "Victor", class: "NS3", section: "B", adminStatus: "active", dailyStatus: "present", email: "emmanuel.victor@email.com", phone: "509-3543-2200", gender: "M", average: 59, rank: 15, dob: "2010-08-20", address: "Delmas 19", parent: "Daniel Victor", parentPhone: "509-3322-0011", daysPresent: 128, daysAbsent: 14, daysLate: 8, schoolYear: "2024-2025", enrollDate: "2024-09-02" },
  { id: "ED-01220", firstName: "Rachelle", lastName: "Jean-Louis", class: "NS4", section: "B", adminStatus: "active", dailyStatus: "present", email: "rachelle.jl@email.com", phone: "509-4890-5544", gender: "F", average: 52, rank: 16, dob: "2009-03-03", address: "Gressier", parent: "Henri Jean-Louis", parentPhone: "509-4233-1199", daysPresent: 125, daysAbsent: 18, daysLate: 7, schoolYear: "2024-2025", enrollDate: "2024-09-03" },
];

/* generate rich detail data deterministically from student index */
function getStudentDetails(s: Student): StudentDetails {
  const idx = parseInt(s.id.replace("ED-012", ""), 10);
  const subjects = ["Mathématiques", "Français", "Sciences", "Histoire", "Anglais", "Géographie"];
  const grades: GradeEntry[] = subjects.map((sub, i) => ({
    subject: sub,
    t1: Math.max(20, Math.min(100, s.average + ((idx * (i + 1) * 7) % 30) - 15)),
    t2: Math.max(20, Math.min(100, s.average + ((idx * (i + 2) * 5) % 25) - 12)),
    t3: Math.max(20, Math.min(100, s.average + ((idx * (i + 3) * 3) % 20) - 10)),
    coeff: [4, 3, 3, 2, 2, 2][i],
  }));

  const absences: AbsenceEntry[] = Array.from({ length: Math.min(s.daysAbsent, 5) }, (_, i) => ({
    date: `2025-0${1 + (i % 3)}-${String(5 + i * 3).padStart(2, "0")}`,
    reason: ["Maladie", "Raison familiale", "Non justifiée", "Rendez-vous médical", "Autre"][i % 5],
    justified: i % 3 !== 2,
  }));

  const sanctions: SanctionEntry[] = s.average < 50 ? [
    { type: "warning", date: "2025-01-15", reason: "Comportement en classe" },
    ...(s.daysAbsent > 20 ? [{ type: "detention" as const, date: "2025-02-01", reason: "Absences répétées" }] : []),
  ] : [];

  const tuitionTotal = 25000;
  const paid = s.adminStatus === "active" ? (idx % 3 === 0 ? tuitionTotal : tuitionTotal * 0.6) : tuitionTotal;
  const payments: PaymentEntry[] = [
    { type: "registration", amount: 5000, status: "paid", date: s.enrollDate },
    { type: "tuition", amount: 12500, status: "paid", date: "2024-10-01" },
    { type: "tuition", amount: 12500, status: paid >= tuitionTotal ? "paid" : "pending", date: "2025-01-15" },
    { type: "uniform", amount: 3500, status: "paid", date: s.enrollDate },
    { type: "books", amount: 2000, status: idx % 4 === 0 ? "overdue" : "paid", date: "2024-09-15" },
  ];

  const hasBirthCert = idx % 5 !== 3;
  const hasIdCard = idx % 4 !== 2;
  const hasPrevReport = s.class !== "NS1" || idx % 3 === 0;
  const hasPhoto = true;
  const hasMedical = idx % 3 !== 1;
  const documents: DocEntry[] = [
    { name: "birthCertDoc", provided: hasBirthCert },
    { name: "idCardDoc", provided: hasIdCard },
    { name: "prevReportDoc", provided: hasPrevReport },
    { name: "photoDoc", provided: hasPhoto },
    { name: "medicalDoc", provided: hasMedical },
  ];

  const previousClasses = s.class === "NS1"
    ? []
    : s.class === "NS2"
    ? [{ year: "2023-2024", cls: "NS1" }]
    : s.class === "NS3"
    ? [{ year: "2023-2024", cls: "NS2" }, { year: "2022-2023", cls: "NS1" }]
    : [{ year: "2023-2024", cls: "NS3" }, { year: "2022-2023", cls: "NS2" }, { year: "2021-2022", cls: "NS1" }];

  const schedule = [
    { day: "Lundi", time: "08:00 - 09:30", subject: "Mathématiques", room: "Salle 201" },
    { day: "Lundi", time: "10:00 - 11:30", subject: "Français", room: "Salle 105" },
    { day: "Mardi", time: "08:00 - 09:30", subject: "Sciences", room: "Labo 1" },
    { day: "Mardi", time: "10:00 - 11:30", subject: "Histoire", room: "Salle 302" },
    { day: "Mercredi", time: "08:00 - 09:30", subject: "Anglais", room: "Salle 108" },
    { day: "Jeudi", time: "08:00 - 09:30", subject: "Géographie", room: "Salle 302" },
    { day: "Vendredi", time: "08:00 - 11:30", subject: "Mathématiques", room: "Salle 201" },
  ];

  const performanceTrend = ["Sep", "Oct", "Nov", "Dec", "Jan", "Fev"].map((m, i) => ({
    month: m,
    avg: Math.max(30, Math.min(100, s.average + ((idx * (i + 1) * 3) % 20) - 10)),
  }));

  return { previousClasses, grades, absences, sanctions, payments, documents, schedule, performanceTrend };
}

const classChartData = [
  { name: "NS1", value: 120 }, { name: "NS2", value: 95 },
  { name: "NS3", value: 80 }, { name: "NS4", value: 90 },
];
const COLORS = ["#013486", "#2563EB", "#F35403", "#F97316"];

/* ================================================================
   HELPERS
================================================================ */

type SP = ReturnType<typeof useTranslation>["t"]["studentsPage"];

function buildPrintableHTML(
  students: Student[], headers: string[], title: string, generated: string,
  dailyLabels: Record<string, string>, adminLabels: Record<string, string>,
) {
  const now = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const rows = students.map((s, i) =>
    `<tr><td>${i + 1}</td><td>${s.firstName} ${s.lastName}</td><td>${s.id}</td><td>${s.class}</td><td>${adminLabels[s.adminStatus] ?? s.adminStatus}</td><td>${dailyLabels[s.dailyStatus] ?? s.dailyStatus}</td><td>${s.average}/100</td><td>${s.phone}</td><td>${s.email}</td></tr>`
  ).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1a1a1a;padding:30px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #013486;padding-bottom:16px;margin-bottom:24px}.header h1{font-size:20px;color:#013486}.header .sub{font-size:11px;color:#666}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#013486;color:#fff;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #e5e7eb}tr:nth-child(even){background:#f9fafb}.footer{margin-top:24px;padding-top:12px;border-top:2px solid #F35403;font-size:10px;color:#999;text-align:center}@media print{body{padding:15px}}</style></head><body><div class="header"><div><h1>EDUCA</h1><p class="sub">${title}</p></div><div style="text-align:right"><p class="sub">${generated} ${now}</p><p class="sub">${students.length} records</p></div></div><table><thead><tr><th>N°</th>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table><div class="footer">EDUCA — ${title} — ${now}</div></body></html>`;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob(["\uFEFF" + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function perfBadge(avg: number, sp: SP) {
  if (avg >= 85) return { label: sp.excellent, color: "bg-emerald-100 text-emerald-700" };
  if (avg >= 70) return { label: sp.good, color: "bg-blue-100 text-blue-700" };
  if (avg >= 55) return { label: sp.average, color: "bg-yellow-100 text-yellow-700" };
  if (avg >= 40) return { label: sp.weak, color: "bg-orange-100 text-orange-700" };
  return { label: sp.critical, color: "bg-red-100 text-red-700" };
}

const adminStatusColor: Record<AdminStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  suspended: "bg-red-50 text-red-600 border-red-200",
  graduated: "bg-purple-50 text-purple-700 border-purple-200",
  transferred: "bg-gray-100 text-gray-600 border-gray-200",
};

/* ================================================================
   MODAL COMPONENTS
================================================================ */

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">{children}
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition"><X size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function ChangeClassModal({ student, sp, onClose }: { student: Student; sp: SP; onClose: () => void }) {
  const [newCls, setNewCls] = useState("");
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Repeat size={18} className="text-[#F35403]" />
        <h3 className="text-lg font-bold text-gray-900">{sp.changeClassTitle}</h3>
      </div>
      <p className="text-sm text-gray-500">{student.firstName} {student.lastName} — {student.id}</p>
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-medium text-gray-500">{sp.currentClass}</label>
          <div className="mt-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-[#013486]">{student.class} — {student.section}</div>
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500">{sp.newClass}</label>
          <select value={newCls} onChange={e => setNewCls(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none">
            <option value="">—</option>
            {["NS1-A", "NS1-B", "NS2-A", "NS2-B", "NS3-A", "NS3-B", "NS4-A", "NS4-B"].filter(c => c !== `${student.class}-${student.section}`).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">{sp.cancel}</button>
        <button disabled={!newCls} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#F35403] rounded-xl hover:bg-[#d14a03] disabled:opacity-40 transition">{sp.confirm}</button>
      </div>
    </div>
  );
}

function MessageModal({ student, sp, onClose }: { student: Student; sp: SP; onClose: () => void }) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2"><Send size={18} className="text-[#013486]" /><h3 className="text-lg font-bold text-gray-900">{sp.messageTitle}</h3></div>
      <div>
        <label className="text-[11px] font-medium text-gray-500">{sp.messageTo}</label>
        <div className="mt-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">{student.parent} — {student.parentPhone}</div>
      </div>
      <div>
        <label className="text-[11px] font-medium text-gray-500">{sp.messageSubject}</label>
        <input className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/30 focus:border-[#013486] outline-none" />
      </div>
      <div>
        <label className="text-[11px] font-medium text-gray-500">{sp.messageBody}</label>
        <textarea rows={4} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/30 focus:border-[#013486] outline-none resize-none" />
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">{sp.cancel}</button>
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#013486] rounded-xl hover:bg-[#012a6b] transition"><Send size={14} />{sp.messageSend}</button>
      </div>
    </div>
  );
}

function SuspendModal({ student, sp, onClose }: { student: Student; sp: SP; onClose: () => void }) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2"><Ban size={18} className="text-red-500" /><h3 className="text-lg font-bold text-gray-900">{sp.suspendTitle}</h3></div>
      <p className="text-sm text-gray-500">{student.firstName} {student.lastName} — {student.id}</p>
      <div>
        <label className="text-[11px] font-medium text-gray-500">{sp.suspendReason}</label>
        <textarea rows={3} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none" />
      </div>
      <div>
        <label className="text-[11px] font-medium text-gray-500">{sp.suspendDuration}</label>
        <input type="number" min={1} max={30} defaultValue={3} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none" />
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">{sp.cancel}</button>
        <button className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition">{sp.confirm}</button>
      </div>
    </div>
  );
}

function TransferModal({ student, sp, onClose }: { student: Student; sp: SP; onClose: () => void }) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2"><School size={18} className="text-[#F35403]" /><h3 className="text-lg font-bold text-gray-900">{sp.transferTitle}</h3></div>
      <p className="text-sm text-gray-500">{student.firstName} {student.lastName} — {student.id}</p>
      <div>
        <label className="text-[11px] font-medium text-gray-500">{sp.transferSchool}</label>
        <input className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none" placeholder="Nom de l'école..." />
      </div>
      <div>
        <label className="text-[11px] font-medium text-gray-500">{sp.transferReason}</label>
        <textarea rows={3} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none resize-none" />
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">{sp.cancel}</button>
        <button className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#F35403] rounded-xl hover:bg-[#d14a03] transition">{sp.confirm}</button>
      </div>
    </div>
  );
}

function ImportCSVModal({ sp, onClose }: { sp: SP; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(Boolean).slice(0, 6);
      setPreview(lines.map(l => l.split(",").map(c => c.trim())));
    };
    reader.readAsText(f);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2"><Upload size={18} className="text-[#013486]" /><h3 className="text-lg font-bold text-gray-900">{sp.importTitle}</h3></div>
      <p className="text-sm text-gray-500">{sp.importDesc}</p>

      <button onClick={() => {
        downloadBlob("Prénom,Nom,Classe,Section,Sexe,Date naissance,Email,Téléphone,Parent,Tel parent,Adresse\nJean,Dupont,NS1,A,M,2010-01-15,jean@email.com,509-1234-5678,Pierre Dupont,509-8765-4321,Delmas", "modele_import_educa.csv", "text/csv");
      }} className="flex items-center gap-2 text-[12px] font-medium text-[#013486] hover:underline">
        <Download size={14} /> {sp.importTemplate}
      </button>

      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#F35403] hover:bg-[#F35403]/5 transition"
      >
        <Upload size={24} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">{sp.importDrag}</p>
        {file && <p className="text-sm font-semibold text-[#013486] mt-2">{file.name}</p>}
      </div>

      {preview.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.importPreview} — {preview.length - 1} {sp.importReady}</p>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-[11px]">
              <thead><tr className="bg-gray-50">{preview[0].map((h, i) => <th key={i} className="px-2 py-1.5 text-left font-semibold text-gray-600">{h}</th>)}</tr></thead>
              <tbody>{preview.slice(1).map((row, i) => <tr key={i} className="border-t border-gray-100">{row.map((c, j) => <td key={j} className="px-2 py-1.5 text-gray-700">{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">{sp.cancel}</button>
        <button disabled={!file} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#013486] rounded-xl hover:bg-[#012a6b] disabled:opacity-40 transition"><Upload size={14} /> {sp.importConfirm}</button>
      </div>
    </div>
  );
}

/* ================================================================
   STUDENT DETAIL DRAWER (tabbed)
================================================================ */

type DrawerTab = "profile" | "academic" | "admin" | "actions";

function StudentDrawer({
  student, onClose, sp,
  onChangeClass, onMessage, onSuspend, onTransfer,
}: {
  student: Student; onClose: () => void; sp: SP;
  onChangeClass: () => void; onMessage: () => void; onSuspend: () => void; onTransfer: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("profile");
  const details = useMemo(() => getStudentDetails(student), [student]);
  const totalDays = student.daysPresent + student.daysAbsent + student.daysLate;
  const attendPct = totalDays > 0 ? Math.round((student.daysPresent / totalDays) * 100) : 0;
  const badge = perfBadge(student.average, sp);

  const adminLabel: Record<AdminStatus, string> = { active: sp.statusActive, suspended: sp.statusSuspended, graduated: sp.statusGraduated, transferred: sp.statusTransferred };
  const sanctionLabel: Record<string, string> = { warning: sp.sanctionWarning, detention: sp.sanctionDetention, temporary: sp.sanctionTemporary };
  const payTypeLabel: Record<string, string> = { tuition: sp.tuition, registration: sp.registration, uniform: sp.uniform, books: sp.books };
  const payStatusColor: Record<string, string> = { paid: "text-green-600 bg-green-50", pending: "text-yellow-600 bg-yellow-50", overdue: "text-red-600 bg-red-50" };
  const payStatusLabel: Record<string, string> = { paid: sp.paymentPaid, pending: sp.paymentPending, overdue: sp.paymentOverdue };

  const attendChart = [
    { name: sp.daysPresent, value: student.daysPresent, fill: "#22c55e" },
    { name: sp.daysLate, value: student.daysLate, fill: "#f59e0b" },
    { name: sp.daysAbsent, value: student.daysAbsent, fill: "#ef4444" },
  ];

  const totalPaidAmt = details.payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalDueAmt = details.payments.reduce((s, p) => s + p.amount, 0) - totalPaidAmt;
  const docsComplete = details.documents.filter(d => d.provided).length;
  const docsTotal = details.documents.length;

  const tabs: { key: DrawerTab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: sp.tabProfile, icon: <Eye size={13} /> },
    { key: "academic", label: sp.tabAcademic, icon: <BookOpen size={13} /> },
    { key: "admin", label: sp.tabAdmin, icon: <Shield size={13} /> },
    { key: "actions", label: sp.tabActions, icon: <Activity size={13} /> },
  ];

  /* helper to get doc display name */
  const docLabel = (name: string) => (sp as Record<string, string>)[name] ?? name;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#013486] to-[#0152b5] p-5 pb-4">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition"><X size={18} /></button>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white border-2 border-white/30">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{student.firstName} {student.lastName}</h2>
              <p className="text-sm text-white/70 font-mono">{student.id}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[10px] font-semibold text-white bg-white/20 px-2 py-0.5 rounded-full">{student.class}-{student.section}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${adminStatusColor[student.adminStatus]}`}>{adminLabel[student.adminStatus]}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-white/10 rounded-xl p-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold rounded-lg transition ${tab === t.key ? "bg-white text-[#013486] shadow-sm" : "text-white/70 hover:text-white hover:bg-white/10"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* ========== PROFILE TAB ========== */}
          {tab === "profile" && (<>
            {/* KPI */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{student.average}<span className="text-xs text-gray-400">/100</span></p>
                <p className="text-[10px] text-gray-500">{sp.averageLabel}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-[#013486]">{attendPct}%</p>
                <p className="text-[10px] text-gray-500">{sp.attendancePercent}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-[#F35403]">#{student.rank}</p>
                <p className="text-[10px] text-gray-500">{sp.rankLabel}</p>
              </div>
            </div>

            {/* Attendance chart */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.attendanceInfo}</p>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 shrink-0">
                  <ResponsiveContainer><PieChart><Pie data={attendChart} dataKey="value" innerRadius={25} outerRadius={40} paddingAngle={2}>{attendChart.map((e, i) => <Cell key={i} fill={e.fill} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />{sp.daysPresent}: <strong>{student.daysPresent}</strong></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />{sp.daysLate}: <strong>{student.daysLate}</strong></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />{sp.daysAbsent}: <strong>{student.daysAbsent}</strong></div>
                </div>
              </div>
            </div>

            {/* Personal */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.personalInfo}</p>
              <div className="space-y-2">
                {[
                  { icon: <Calendar size={13} />, label: sp.dobLabel, value: student.dob },
                  { icon: <Users size={13} />, label: sp.genderLabel, value: student.gender === "M" ? "♂ " + sp.boys : "♀ " + sp.girls },
                  { icon: <MapPin size={13} />, label: sp.addressLabel, value: student.address },
                  { icon: <GraduationCap size={13} />, label: sp.enrollDate, value: student.enrollDate },
                  { icon: <BookOpen size={13} />, label: sp.schoolYear, value: student.schoolYear },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[12px]">
                    <span className="text-gray-400 mt-0.5">{r.icon}</span>
                    <span className="text-gray-500 w-28 shrink-0">{r.label}</span>
                    <span className="text-gray-900 font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.contactInfo}</p>
              <div className="space-y-2">
                {[
                  { icon: <Phone size={13} />, label: sp.colPhone, value: student.phone },
                  { icon: <Mail size={13} />, label: "Email", value: student.email },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[12px]">
                    <span className="text-gray-400 mt-0.5">{r.icon}</span>
                    <span className="text-gray-500 w-28 shrink-0">{r.label}</span>
                    <span className="text-gray-900 font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Parent */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.parentInfo}</p>
              <div className="bg-[#013486]/5 rounded-xl p-3 space-y-2">
                {[
                  { icon: <Users size={13} />, label: sp.parentName, value: student.parent },
                  { icon: <Phone size={13} />, label: sp.parentPhone, value: student.parentPhone },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[12px]">
                    <span className="text-[#013486] mt-0.5">{r.icon}</span>
                    <span className="text-gray-500 w-28 shrink-0">{r.label}</span>
                    <span className="text-gray-900 font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>)}

          {/* ========== ACADEMIC TAB ========== */}
          {tab === "academic" && (<>
            {/* Performance trend */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.performanceTrend}</p>
              <div className="h-28">
                <ResponsiveContainer>
                  <LineChart data={details.performanceTrend}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avg" stroke="#F35403" strokeWidth={2} dot={{ r: 3, fill: "#F35403" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="text-[11px]"><span className="text-gray-500">{sp.bestSubject}: </span><strong className="text-green-600">{details.grades.reduce((best, g) => ((g.t1 + g.t2 + g.t3) / 3 > (best.t1 + best.t2 + best.t3) / 3 ? g : best)).subject}</strong></div>
                <div className="text-[11px]"><span className="text-gray-500">{sp.worstSubject}: </span><strong className="text-red-500">{details.grades.reduce((worst, g) => ((g.t1 + g.t2 + g.t3) / 3 < (worst.t1 + worst.t2 + worst.t3) / 3 ? g : worst)).subject}</strong></div>
              </div>
            </div>

            {/* Previous classes */}
            {details.previousClasses.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.previousClasses}</p>
                <div className="flex flex-wrap gap-2">
                  {details.previousClasses.map((pc, i) => (
                    <span key={i} className="text-[11px] px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600"><span className="font-semibold text-[#013486]">{pc.cls}</span> — {pc.year}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Grades table */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.gradesHistory}</p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-[11px]">
                  <thead><tr className="bg-gray-50 text-gray-600">
                    <th className="px-2 py-1.5 text-left font-semibold">{sp.subject}</th>
                    <th className="px-2 py-1.5 text-center font-semibold">T1</th>
                    <th className="px-2 py-1.5 text-center font-semibold">T2</th>
                    <th className="px-2 py-1.5 text-center font-semibold">T3</th>
                    <th className="px-2 py-1.5 text-center font-semibold">{sp.coeff}</th>
                  </tr></thead>
                  <tbody>
                    {details.grades.map((g, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 font-medium text-gray-800">{g.subject}</td>
                        <td className={`px-2 py-1.5 text-center font-semibold ${g.t1 >= 70 ? "text-green-600" : g.t1 >= 50 ? "text-gray-700" : "text-red-500"}`}>{g.t1}</td>
                        <td className={`px-2 py-1.5 text-center font-semibold ${g.t2 >= 70 ? "text-green-600" : g.t2 >= 50 ? "text-gray-700" : "text-red-500"}`}>{g.t2}</td>
                        <td className={`px-2 py-1.5 text-center font-semibold ${g.t3 >= 70 ? "text-green-600" : g.t3 >= 50 ? "text-gray-700" : "text-red-500"}`}>{g.t3}</td>
                        <td className="px-2 py-1.5 text-center text-gray-500">{g.coeff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Absences */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.absenceHistory} ({details.absences.length})</p>
              {details.absences.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic">{sp.noAbsences}</p>
              ) : (
                <div className="space-y-1.5">
                  {details.absences.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] bg-gray-50 rounded-lg px-3 py-2">
                      <Calendar size={12} className="text-gray-400 shrink-0" />
                      <span className="text-gray-600">{a.date}</span>
                      <span className="text-gray-800 font-medium flex-1">{a.reason}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.justified ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {a.justified ? sp.justified : sp.unjustified}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sanctions */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.sanctionsHistory} ({details.sanctions.length})</p>
              {details.sanctions.length === 0 ? (
                <p className="text-[11px] text-gray-400 italic">{sp.noSanctions}</p>
              ) : (
                <div className="space-y-1.5">
                  {details.sanctions.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] bg-orange-50 rounded-lg px-3 py-2">
                      <AlertTriangle size={12} className="text-orange-500 shrink-0" />
                      <span className="font-semibold text-orange-700">{sanctionLabel[s.type]}</span>
                      <span className="text-gray-600">{s.date}</span>
                      <span className="text-gray-500 flex-1 truncate">— {s.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>)}

          {/* ========== ADMIN TAB ========== */}
          {tab === "admin" && (<>
            {/* Payments */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.paymentHistory}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-green-700">{totalPaidAmt.toLocaleString()} HTG</p>
                  <p className="text-[10px] text-green-600">{sp.totalPaid}</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${totalDueAmt > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                  <p className={`text-lg font-bold ${totalDueAmt > 0 ? "text-red-600" : "text-gray-400"}`}>{totalDueAmt.toLocaleString()} HTG</p>
                  <p className={`text-[10px] ${totalDueAmt > 0 ? "text-red-500" : "text-gray-400"}`}>{sp.totalDue}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {details.payments.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] bg-gray-50 rounded-lg px-3 py-2">
                    <CreditCard size={12} className="text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-800 flex-1">{payTypeLabel[p.type] ?? p.type}</span>
                    <span className="text-gray-600">{p.amount.toLocaleString()} HTG</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${payStatusColor[p.status]}`}>{payStatusLabel[p.status]}</span>
                    <span className="text-gray-400 text-[10px]">{p.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-gray-700">{sp.requiredDocs}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${docsComplete === docsTotal ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-600"}`}>
                  {docsComplete === docsTotal ? sp.completeFile : sp.incompleteFile} ({docsComplete}/{docsTotal})
                </span>
              </div>
              <div className="space-y-1.5">
                {details.documents.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] bg-gray-50 rounded-lg px-3 py-2">
                    {d.provided ? <FileCheck size={13} className="text-green-500 shrink-0" /> : <AlertTriangle size={13} className="text-orange-500 shrink-0" />}
                    <span className="text-gray-800 font-medium flex-1">{docLabel(d.name)}</span>
                    <span className={`text-[10px] font-semibold ${d.provided ? "text-green-600" : "text-orange-600"}`}>
                      {d.provided ? sp.docProvided : sp.docMissing}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.scheduleTitle}</p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-[11px]">
                  <thead><tr className="bg-gray-50 text-gray-600">
                    <th className="px-2 py-1.5 text-left font-semibold">{sp.date}</th>
                    <th className="px-2 py-1.5 text-left font-semibold">Heure</th>
                    <th className="px-2 py-1.5 text-left font-semibold">{sp.subject}</th>
                    <th className="px-2 py-1.5 text-left font-semibold">Salle</th>
                  </tr></thead>
                  <tbody>
                    {details.schedule.map((s, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-2 py-1.5 font-medium text-gray-800">{s.day}</td>
                        <td className="px-2 py-1.5 text-gray-600">{s.time}</td>
                        <td className="px-2 py-1.5 text-[#013486] font-medium">{s.subject}</td>
                        <td className="px-2 py-1.5 text-gray-500">{s.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* ========== ACTIONS TAB ========== */}
          {tab === "actions" && (<>
            <div className="space-y-2">
              {/* Edit */}
              <Link href={`/admin/students/enroll`} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-[#F35403]/5 hover:border-[#F35403]/20 border border-gray-200 transition group">
                <div className="p-2 rounded-lg bg-[#F35403]/10 text-[#F35403]"><Edit3 size={16} /></div>
                <div><p className="text-sm font-semibold text-gray-900 group-hover:text-[#F35403]">{sp.actionEdit}</p><p className="text-[10px] text-gray-400">{sp.personalInfo}</p></div>
              </Link>

              {/* Change class */}
              <button onClick={onChangeClass} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-[#013486]/5 hover:border-[#013486]/20 border border-gray-200 transition group">
                <div className="p-2 rounded-lg bg-[#013486]/10 text-[#013486]"><Repeat size={16} /></div>
                <div className="text-left"><p className="text-sm font-semibold text-gray-900 group-hover:text-[#013486]">{sp.actionChangeClass}</p><p className="text-[10px] text-gray-400">{sp.currentClass}: {student.class}-{student.section}</p></div>
              </button>

              {/* Message parent */}
              <button onClick={onMessage} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 border border-gray-200 transition group">
                <div className="p-2 rounded-lg bg-green-100 text-green-600"><MessageSquare size={16} /></div>
                <div className="text-left"><p className="text-sm font-semibold text-gray-900 group-hover:text-green-700">{sp.actionMessage}</p><p className="text-[10px] text-gray-400">{student.parent}</p></div>
              </button>

              {/* Generate report card */}
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 border border-gray-200 transition group">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><ClipboardList size={16} /></div>
                <div className="text-left"><p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">{sp.actionReport}</p></div>
              </button>

              {/* Generate certificate */}
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition group">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Award size={16} /></div>
                <div className="text-left"><p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{sp.generateCertificate}</p></div>
              </button>

              {/* Student card */}
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 border border-gray-200 transition group">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><UserCheck size={16} /></div>
                <div className="text-left"><p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">{sp.generateCard}</p></div>
              </button>

              <div className="my-2 border-t border-gray-200" />

              {/* Suspend */}
              {student.adminStatus === "active" && (
                <button onClick={onSuspend} className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 rounded-xl hover:bg-orange-100 border border-orange-200 transition group">
                  <div className="p-2 rounded-lg bg-orange-200 text-orange-700"><Ban size={16} /></div>
                  <div className="text-left"><p className="text-sm font-semibold text-orange-700">{sp.actionSuspend}</p></div>
                </button>
              )}

              {student.adminStatus === "suspended" && (
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 rounded-xl hover:bg-green-100 border border-green-200 transition group">
                  <div className="p-2 rounded-lg bg-green-200 text-green-700"><UserCheck size={16} /></div>
                  <div className="text-left"><p className="text-sm font-semibold text-green-700">{sp.actionReactivate}</p></div>
                </button>
              )}

              {/* Transfer */}
              <button onClick={onTransfer} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 border border-gray-200 transition group">
                <div className="p-2 rounded-lg bg-gray-200 text-gray-600"><School size={16} /></div>
                <div className="text-left"><p className="text-sm font-semibold text-gray-700">{sp.actionTransfer}</p></div>
              </button>

              {/* Delete */}
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl hover:bg-red-100 border border-red-200 transition group">
                <div className="p-2 rounded-lg bg-red-200 text-red-700"><Trash2 size={16} /></div>
                <div className="text-left"><p className="text-sm font-semibold text-red-700">{sp.actionDelete}</p></div>
              </button>
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function AdminStudentsPage() {
  const { t } = useTranslation();
  const sp = t.studentsPage;

  /* State */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterDailyStatus, setFilterDailyStatus] = useState("all");
  const [filterAdminStatus, setFilterAdminStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | "class" | "average" | "adminStatus">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerStudent, setDrawerStudent] = useState<Student | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  /* Modals */
  const [modalType, setModalType] = useState<"changeClass" | "message" | "suspend" | "transfer" | "import" | null>(null);
  const [modalStudent, setModalStudent] = useState<Student | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  /* Click outside */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) setActionMenuId(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Labels */
  const dailyLabels: Record<string, string> = { present: sp.statusPresent, absent: sp.statusAbsent, late: sp.statusLate };
  const dailyStatusConfig: Record<string, { label: string; color: string }> = {
    present: { label: sp.statusPresent, color: "bg-green-50 text-green-700" },
    absent: { label: sp.statusAbsent, color: "bg-red-50 text-red-600" },
    late: { label: sp.statusLate, color: "bg-orange-50 text-orange-600" },
  };
  const adminLabels: Record<AdminStatus, string> = { active: sp.statusActive, suspended: sp.statusSuspended, graduated: sp.statusGraduated, transferred: sp.statusTransferred };

  /* FILTERING + SORTING */
  const filteredStudents = useMemo(() => {
    const filtered = allStudents.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = q === "" || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      return matchSearch
        && (filterClass === "all" || s.class === filterClass)
        && (filterDailyStatus === "all" || s.dailyStatus === filterDailyStatus)
        && (filterAdminStatus === "all" || s.adminStatus === filterAdminStatus);
    });
    return filtered.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return dir * `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      if (sortKey === "class") return dir * a.class.localeCompare(b.class);
      if (sortKey === "average") return dir * (a.average - b.average);
      if (sortKey === "adminStatus") return dir * a.adminStatus.localeCompare(b.adminStatus);
      return 0;
    });
  }, [searchQuery, filterClass, filterDailyStatus, filterAdminStatus, sortKey, sortDir]);

  /* PAGINATION */
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  /* STATS */
  const totalAbsent = allStudents.filter(s => s.dailyStatus === "absent").length;
  const totalNew = 6;
  const boys = allStudents.filter(s => s.gender === "M").length;
  const girls = allStudents.filter(s => s.gender === "F").length;
  const avgAll = Math.round(allStudents.reduce((sum, s) => sum + s.average, 0) / allStudents.length);
  const presentCount = allStudents.filter(s => s.dailyStatus === "present").length;
  const attendRatePct = Math.round((presentCount / allStudents.length) * 100);
  const genderChart = [{ name: sp.boys, value: boys }, { name: sp.girls, value: girls }];

  const resetFilters = () => { setSearchQuery(""); setFilterClass("all"); setFilterDailyStatus("all"); setFilterAdminStatus("all"); setCurrentPage(1); };
  const toggleSort = (key: typeof sortKey) => { if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } };
  const SortIcon = ({ col }: { col: typeof sortKey }) => sortKey === col ? (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={11} className="opacity-30" />;

  /* SELECTION */
  const allOnPageSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedIds.has(s.id));
  const toggleSelectAll = () => { const next = new Set(selectedIds); if (allOnPageSelected) paginatedStudents.forEach(s => next.delete(s.id)); else paginatedStudents.forEach(s => next.add(s.id)); setSelectedIds(next); };
  const toggleSelect = (id: string) => { const next = new Set(selectedIds); next.has(id) ? next.delete(id) : next.add(id); setSelectedIds(next); };

  /* EXPORT */
  const colHeaders = [sp.colStudent, sp.colCode, sp.colClass, sp.colAdminStatus, sp.colStatus, sp.colAverage, sp.colPhone, "Email"];
  const exportCSV = useCallback(() => {
    const header = ["N°", ...colHeaders].join(",");
    const rows = filteredStudents.map((s, i) => [i + 1, `${s.firstName} ${s.lastName}`, s.id, s.class, adminLabels[s.adminStatus], dailyLabels[s.dailyStatus], `${s.average}/100`, s.phone, s.email].join(","));
    downloadBlob([header, ...rows].join("\n"), "eleves_educa.csv", "text/csv");
    setExportOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStudents]);
  const exportExcel = useCallback(() => {
    const header = `<tr>${["N°", ...colHeaders].map(h => `<th>${h}</th>`).join("")}</tr>`;
    const rows = filteredStudents.map((s, i) => `<tr><td>${i + 1}</td><td>${s.firstName} ${s.lastName}</td><td>${s.id}</td><td>${s.class}</td><td>${adminLabels[s.adminStatus]}</td><td>${dailyLabels[s.dailyStatus]}</td><td>${s.average}/100</td><td>${s.phone}</td><td>${s.email}</td></tr>`).join("");
    downloadBlob(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>${header}${rows}</table></body></html>`, "eleves_educa.xls", "application/vnd.ms-excel");
    setExportOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStudents]);
  const exportPrintable = useCallback((autoPrint: boolean) => {
    const html = buildPrintableHTML(filteredStudents, colHeaders, sp.exportTitle, sp.exportGenerated, dailyLabels, adminLabels);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html); win.document.close();
    if (autoPrint) win.onload = () => win.print();
    setExportOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredStudents]);

  const exportOptions = [
    { label: sp.exportPDF, icon: FileText, color: "text-red-500", action: () => exportPrintable(false) },
    { label: sp.exportExcel, icon: FileSpreadsheet, color: "text-green-600", action: exportExcel },
    { label: sp.exportCSV, icon: Table2, color: "text-blue-500", action: exportCSV },
    { label: sp.print, icon: Printer, color: "text-gray-600", action: () => exportPrintable(true) },
  ];

  const openModal = (type: typeof modalType, student?: Student) => {
    setModalType(type);
    setModalStudent(student ?? null);
    setActionMenuId(null);
  };

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader title={t.pages.admin.students.title} description={t.pages.admin.students.desc} icon={<GraduationCap size={20} />} />
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => openModal("import")} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#013486] bg-[#013486]/10 border border-[#013486]/20 rounded-xl hover:bg-[#013486]/20 transition">
            <Upload size={15} /> {sp.importCSV}
          </button>
          <Link href="/admin/students/enroll" className="flex items-center gap-2 px-5 py-2.5 bg-[#F35403] text-white text-sm font-semibold rounded-xl hover:bg-[#d14a03] shadow-md hover:shadow-lg transition-all">
            <Plus size={16} /> {sp.enroll}
          </Link>
        </div>
      </div>

      {/* ====== STATS GRID (6 cards) ====== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { title: sp.totalStudents, value: allStudents.length, icon: Users, accent: "text-[#013486]", bg: "bg-[#013486]/10" },
          { title: sp.absentToday, value: totalAbsent, icon: UserX, accent: "text-red-500", bg: "bg-red-50" },
          { title: sp.newEnrolled, value: totalNew, icon: UserPlus, accent: "text-green-600", bg: "bg-green-50" },
          { title: sp.attendanceRate, value: `${attendRatePct}%`, icon: TrendingUp, accent: "text-emerald-600", bg: "bg-emerald-50" },
          { title: sp.avgPerformance, value: `${avgAll}/100`, icon: GraduationCap, accent: "text-[#F35403]", bg: "bg-[#F35403]/10" },
          { title: sp.boys + " / " + sp.girls, value: `${boys} / ${girls}`, icon: Users, accent: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 font-medium">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-xl ${stat.bg}`}><stat.icon size={16} className={stat.accent} /></div>
            </div>
            <div className="h-0.5 w-6 bg-[#F35403] rounded-full mt-2" />
          </div>
        ))}
      </div>

      {/* ====== CHARTS ROW ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.classDist}</p>
          <div className="h-32">
            <ResponsiveContainer><BarChart data={classChartData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" radius={[6, 6, 0, 0]}>{classChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Bar></BarChart></ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <p className="text-[11px] font-semibold text-gray-700 mb-2">{sp.genderDist}</p>
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 shrink-0">
              <ResponsiveContainer><PieChart><Pie data={genderChart} dataKey="value" innerRadius={28} outerRadius={48} paddingAngle={4}><Cell fill="#3b82f6" /><Cell fill="#ec4899" /></Pie><Tooltip /></PieChart></ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[12px]"><span className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-gray-600">{sp.boys}</span><strong className="ml-auto">{boys}</strong><span className="text-gray-400 text-[10px]">({Math.round(boys / allStudents.length * 100)}%)</span></div>
              <div className="flex items-center gap-2 text-[12px]"><span className="w-3 h-3 rounded-full bg-pink-500" /><span className="text-gray-600">{sp.girls}</span><strong className="ml-auto">{girls}</strong><span className="text-gray-400 text-[10px]">({Math.round(girls / allStudents.length * 100)}%)</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== FILTERS ====== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-[#F35403]" />
          <p className="text-[11px] font-semibold text-gray-700">{sp.filterTitle}</p>
          <span className="text-[10px] text-gray-400 ml-auto">{filteredStudents.length} {filteredStudents.length > 1 ? sp.results : sp.result}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setCurrentPage(1); }} className="px-3 py-2 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none">
            <option value="all">{sp.allClasses}</option>
            <option value="NS1">NS1</option><option value="NS2">NS2</option><option value="NS3">NS3</option><option value="NS4">NS4</option>
          </select>
          <select value={filterDailyStatus} onChange={e => { setFilterDailyStatus(e.target.value); setCurrentPage(1); }} className="px-3 py-2 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none">
            <option value="all">{sp.allStatuses}</option>
            <option value="present">{sp.statusPresent}</option><option value="absent">{sp.statusAbsent}</option><option value="late">{sp.statusLate}</option>
          </select>
          <select value={filterAdminStatus} onChange={e => { setFilterAdminStatus(e.target.value); setCurrentPage(1); }} className="px-3 py-2 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none">
            <option value="all">{sp.allAdminStatuses}</option>
            <option value="active">{sp.statusActive}</option><option value="suspended">{sp.statusSuspended}</option><option value="graduated">{sp.statusGraduated}</option><option value="transferred">{sp.statusTransferred}</option>
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder={sp.searchPlaceholder} className="w-full pl-9 pr-3 py-2 text-[12px] border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#F35403]/30 focus:border-[#F35403] outline-none" />
          </div>
          {(searchQuery || filterClass !== "all" || filterDailyStatus !== "all" || filterAdminStatus !== "all") && (
            <button onClick={resetFilters} className="px-3 py-2 text-[11px] font-medium text-[#F35403] bg-[#F35403]/10 rounded-lg hover:bg-[#F35403]/20 transition shrink-0">{sp.reset}</button>
          )}
          <div className="relative" ref={exportRef}>
            <button onClick={() => setExportOpen(!exportOpen)} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium text-white bg-[#F35403] rounded-lg hover:bg-[#d14a03] transition shrink-0">
              <Download size={13} /> {sp.export} <ChevronDown size={12} className={`transition-transform ${exportOpen ? "rotate-180" : ""}`} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50">
                {exportOptions.map((opt, i) => (
                  <button key={i} onClick={opt.action} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition">
                    <opt.icon size={15} className={opt.color} /> {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== BULK ACTIONS BAR ====== */}
      {selectedIds.size > 0 && (
        <div className="bg-[#013486] rounded-xl p-3 flex items-center gap-3 text-white animate-in fade-in duration-200">
          <span className="text-[12px] font-medium">{selectedIds.size} {sp.selected}</span>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-white/10 rounded-lg hover:bg-white/20 transition"><MessageSquare size={13} /> {sp.bulkMessage}</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-white/10 rounded-lg hover:bg-white/20 transition"><Download size={13} /> {sp.bulkExport}</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-red-500/80 rounded-lg hover:bg-red-500 transition"><Trash2 size={13} /> {sp.bulkDelete}</button>
          <button onClick={() => setSelectedIds(new Set())} className="p-1.5 hover:bg-white/10 rounded-lg transition"><X size={14} /></button>
        </div>
      )}

      {/* ====== TABLE ====== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{sp.listTitle}</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span>{sp.itemsPerPage}:</span>
              {[5, 10, 20].map(n => (
                <button key={n} onClick={() => { setItemsPerPage(n); setCurrentPage(1); }} className={`px-2 py-0.5 rounded ${itemsPerPage === n ? "bg-[#F35403] text-white font-semibold" : "bg-gray-100 hover:bg-gray-200"} transition`}>{n}</button>
              ))}
            </div>
            <span className="text-[10px] text-gray-400">{sp.page} {safeCurrentPage}/{totalPages}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50/80">
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-[#F35403] transition">
                    {allOnPageSelected ? <CheckSquare size={15} className="text-[#F35403]" /> : <Square size={15} />}
                  </button>
                </th>
                <th className="px-3 py-3 text-left font-semibold cursor-pointer hover:text-[#F35403] transition" onClick={() => toggleSort("name")}>
                  <span className="inline-flex items-center gap-1">{sp.colStudent} <SortIcon col="name" /></span>
                </th>
                <th className="px-3 py-3 text-left font-semibold">{sp.colCode}</th>
                <th className="px-3 py-3 text-left font-semibold cursor-pointer hover:text-[#F35403] transition" onClick={() => toggleSort("class")}>
                  <span className="inline-flex items-center gap-1">{sp.colClass} <SortIcon col="class" /></span>
                </th>
                <th className="px-3 py-3 text-left font-semibold">{sp.colGender}</th>
                <th className="px-3 py-3 text-left font-semibold cursor-pointer hover:text-[#F35403] transition" onClick={() => toggleSort("adminStatus")}>
                  <span className="inline-flex items-center gap-1">{sp.colAdminStatus} <SortIcon col="adminStatus" /></span>
                </th>
                <th className="px-3 py-3 text-left font-semibold">{sp.colStatus}</th>
                <th className="px-3 py-3 text-left font-semibold cursor-pointer hover:text-[#F35403] transition" onClick={() => toggleSort("average")}>
                  <span className="inline-flex items-center gap-1">{sp.colAverage} <SortIcon col="average" /></span>
                </th>
                <th className="px-3 py-3 text-left font-semibold">{sp.colPhone}</th>
                <th className="px-3 py-3 text-right font-semibold">{sp.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedStudents.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-10 text-center text-gray-400">{sp.noResults}</td></tr>
              ) : paginatedStudents.map((student) => {
                const daily = dailyStatusConfig[student.dailyStatus];
                const badge = perfBadge(student.average, sp);
                const isSelected = selectedIds.has(student.id);
                return (
                  <tr key={student.id} className={`hover:bg-[#F35403]/[0.02] transition group ${isSelected ? "bg-[#F35403]/[0.04]" : ""}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(student.id)} className="text-gray-400 hover:text-[#F35403] transition">
                        {isSelected ? <CheckSquare size={15} className="text-[#F35403]" /> : <Square size={15} />}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => setDrawerStudent(student)} className="flex items-center gap-2.5 text-left">
                        <div className="w-8 h-8 rounded-full bg-[#013486]/10 text-[#013486] flex items-center justify-center text-[11px] font-bold shrink-0">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-[#F35403] transition">{student.firstName} {student.lastName}</p>
                          <p className="text-[10px] text-gray-400">{student.email}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-3 py-3"><span className="font-mono text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{student.id}</span></td>
                    <td className="px-3 py-3"><span className="text-[11px] font-medium text-[#013486] bg-[#013486]/10 px-2 py-0.5 rounded-full">{student.class}-{student.section}</span></td>
                    <td className="px-3 py-3"><span className={`text-[11px] ${student.gender === "M" ? "text-blue-500" : "text-pink-500"}`}>{student.gender === "M" ? "♂" : "♀"}</span></td>
                    <td className="px-3 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${adminStatusColor[student.adminStatus]}`}>{adminLabels[student.adminStatus]}</span></td>
                    <td className="px-3 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${daily.color}`}>{daily.label}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[12px] font-bold ${student.average >= 70 ? "text-green-600" : student.average >= 50 ? "text-gray-700" : "text-red-500"}`}>{student.average}</span>
                        <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-[11px]">{student.phone}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="relative inline-block" ref={actionMenuId === student.id ? actionRef : undefined}>
                        <button onClick={() => setActionMenuId(actionMenuId === student.id ? null : student.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>
                        {actionMenuId === student.id && (
                          <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-40">
                            <button onClick={() => { setDrawerStudent(student); setActionMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 transition"><Eye size={14} className="text-[#013486]" /> {sp.actionView}</button>
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 transition"><Edit3 size={14} className="text-[#F35403]" /> {sp.actionEdit}</button>
                            <button onClick={() => openModal("changeClass", student)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 transition"><Repeat size={14} className="text-indigo-500" /> {sp.actionChangeClass}</button>
                            <button onClick={() => openModal("message", student)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 transition"><MessageSquare size={14} className="text-green-500" /> {sp.actionMessage}</button>
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 transition"><ClipboardList size={14} className="text-purple-500" /> {sp.actionReport}</button>
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 transition"><Award size={14} className="text-yellow-500" /> {sp.generateCertificate}</button>
                            <div className="my-1 border-t border-gray-100" />
                            {student.adminStatus === "active" && (
                              <button onClick={() => openModal("suspend", student)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-orange-600 hover:bg-orange-50 transition"><Ban size={14} /> {sp.actionSuspend}</button>
                            )}
                            <button onClick={() => openModal("transfer", student)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-gray-500 hover:bg-gray-50 transition"><School size={14} /> {sp.actionTransfer}</button>
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 transition"><Trash2 size={14} /> {sp.actionDelete}</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-[11px] text-gray-500">
            {sp.showing} {Math.min((safeCurrentPage - 1) * itemsPerPage + 1, filteredStudents.length)}-{Math.min(safeCurrentPage * itemsPerPage, filteredStudents.length)} {sp.on} {filteredStudents.length} {sp.students}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#F35403]/10 hover:border-[#F35403]/30 hover:text-[#F35403] disabled:opacity-30 transition"><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-[11px] font-semibold transition ${page === safeCurrentPage ? "bg-[#F35403] text-white shadow-sm" : "text-gray-600 hover:bg-[#F35403]/10 hover:text-[#F35403]"}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#F35403]/10 hover:border-[#F35403]/30 hover:text-[#F35403] disabled:opacity-30 transition"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* ====== STUDENT DETAIL DRAWER ====== */}
      {drawerStudent && (
        <StudentDrawer
          student={drawerStudent}
          onClose={() => setDrawerStudent(null)}
          sp={sp}
          onChangeClass={() => { openModal("changeClass", drawerStudent); }}
          onMessage={() => { openModal("message", drawerStudent); }}
          onSuspend={() => { openModal("suspend", drawerStudent); }}
          onTransfer={() => { openModal("transfer", drawerStudent); }}
        />
      )}

      {/* ====== MODALS ====== */}
      <Modal open={modalType === "changeClass"} onClose={() => setModalType(null)}>
        {modalStudent && <ChangeClassModal student={modalStudent} sp={sp} onClose={() => setModalType(null)} />}
      </Modal>
      <Modal open={modalType === "message"} onClose={() => setModalType(null)}>
        {modalStudent && <MessageModal student={modalStudent} sp={sp} onClose={() => setModalType(null)} />}
      </Modal>
      <Modal open={modalType === "suspend"} onClose={() => setModalType(null)}>
        {modalStudent && <SuspendModal student={modalStudent} sp={sp} onClose={() => setModalType(null)} />}
      </Modal>
      <Modal open={modalType === "transfer"} onClose={() => setModalType(null)}>
        {modalStudent && <TransferModal student={modalStudent} sp={sp} onClose={() => setModalType(null)} />}
      </Modal>
      <Modal open={modalType === "import"} onClose={() => setModalType(null)}>
        <ImportCSVModal sp={sp} onClose={() => setModalType(null)} />
      </Modal>
    </div>
  );
}
