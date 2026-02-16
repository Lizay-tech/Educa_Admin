"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  Users, Search, ChevronLeft, ChevronRight,
  Eye, Filter, Download, FileText, FileSpreadsheet, Printer,
  ChevronDown, MoreHorizontal, MessageSquare, Ban,
  Trash2, X, ArrowUpDown, CheckSquare, Square,
  UserCheck, Activity, Clock, GraduationCap, BookOpen,
  UserPlus, Send, Phone, Mail, CreditCard,
  Smartphone, DollarSign, Star, TrendingUp,
  AlertTriangle, Heart, Wallet, Receipt,
  MessageCircle, Bell,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
} from "recharts";

/* ================================================================
   TYPES
================================================================ */

type ParentStatus = "active" | "inactive" | "suspended" | "pending";
type Relation = "father" | "mother" | "tutor" | "other";
type MessageChannel = "internal" | "sms" | "whatsapp" | "email";
type MessageStatus = "sent" | "received" | "read" | "failed";
type PaymentStatus = "paid" | "pending" | "overdue" | "partial";
type PaymentType = "tuition" | "registration" | "uniform" | "transport" | "books" | "canteen";
type PaymentMethod = "cash" | "bank_transfer" | "mobile_money" | "check";

interface ChildInfo {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  average: number;
  attendanceRate: number;
  dailyStatus: "present" | "absent" | "late";
  status: "active" | "suspended";
}

interface CommunicationEntry {
  id: string;
  date: string;
  channel: MessageChannel;
  subject: string;
  preview: string;
  status: MessageStatus;
  direction: "in" | "out";
}

interface PaymentEntry {
  id: string;
  date: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  method: PaymentMethod;
  ref: string;
  childId: string;
}

interface FamilyInfo {
  fatherName: string;
  fatherPhone: string;
  fatherJob: string;
  fatherEmail: string;
  motherName: string;
  motherPhone: string;
  motherJob: string;
  motherEmail: string;
  tutorName?: string;
  tutorPhone?: string;
  tutorJob?: string;
  tutorEmail?: string;
  tutorRelation?: string;
}

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  profession: string;
  relation: Relation;
  status: ParentStatus;
  portalAccess: boolean;
  engagementScore: number; // 0–100
  registeredAt: string;
  lastActivity: string | null;
  children: ChildInfo[];
  family: FamilyInfo;
  totalDue: number;
  totalPaid: number;
}

/* ================================================================
   MOCK DATA
================================================================ */

const allParents: Parent[] = [
  {
    id: "PA-001", firstName: "Marc", lastName: "Baptiste", phone: "509-3421-0011", email: "marc.baptiste@email.com",
    address: "12 Rue Capois", city: "Port-au-Prince", profession: "Comptable", relation: "father",
    status: "active", portalAccess: true, engagementScore: 85, registeredAt: "2024-09-01", lastActivity: "2025-02-14",
    totalDue: 45000, totalPaid: 40000,
    children: [
      { id: "ED-01201", firstName: "Jean", lastName: "Baptiste", class: "9ème AF", average: 72, attendanceRate: 94, dailyStatus: "present", status: "active" },
    ],
    family: { fatherName: "Marc Baptiste", fatherPhone: "509-3421-0011", fatherJob: "Comptable", fatherEmail: "marc.baptiste@email.com", motherName: "Yolande Baptiste", motherPhone: "509-3421-0012", motherJob: "Infirmière", motherEmail: "yolande.b@email.com" },
  },
  {
    id: "PA-002", firstName: "Sophie", lastName: "Clerveau", phone: "509-4812-7722", email: "sophie.clerv@email.com",
    address: "45 Ave N", city: "Pétion-Ville", profession: "Avocate", relation: "mother",
    status: "active", portalAccess: true, engagementScore: 92, registeredAt: "2024-09-01", lastActivity: "2025-02-14",
    totalDue: 90000, totalPaid: 90000,
    children: [
      { id: "ED-01202", firstName: "Marie", lastName: "Clerveau", class: "8ème AF", average: 85, attendanceRate: 98, dailyStatus: "present", status: "active" },
      { id: "ED-01206", firstName: "Luc", lastName: "Clerveau", class: "5ème AF", average: 78, attendanceRate: 95, dailyStatus: "present", status: "active" },
    ],
    family: { fatherName: "Jacques Clerveau", fatherPhone: "509-3322-5500", fatherJob: "Ingénieur", fatherEmail: "j.clerveau@email.com", motherName: "Sophie Clerveau", motherPhone: "509-4812-7722", motherJob: "Avocate", motherEmail: "sophie.clerv@email.com" },
  },
  {
    id: "PA-003", firstName: "Pierre", lastName: "Augustin", phone: "509-3421-8901", email: "p.augustin.p@email.com",
    address: "78 Rue des Miracles", city: "Delmas", profession: "Professeur", relation: "father",
    status: "active", portalAccess: true, engagementScore: 68, registeredAt: "2024-09-01", lastActivity: "2025-02-12",
    totalDue: 45000, totalPaid: 30000,
    children: [
      { id: "ED-01203", firstName: "Pierre Jr.", lastName: "Augustin", class: "7ème AF", average: 64, attendanceRate: 88, dailyStatus: "absent", status: "active" },
    ],
    family: { fatherName: "Pierre Augustin", fatherPhone: "509-3421-8901", fatherJob: "Professeur", fatherEmail: "p.augustin.p@email.com", motherName: "Carla Augustin", motherPhone: "509-3421-8902", motherJob: "Commerçante", motherEmail: "carla.aug@email.com" },
  },
  {
    id: "PA-004", firstName: "Rose", lastName: "Joseph", phone: "509-4567-3388", email: "rose.joseph.p@email.com",
    address: "23 Impasse Soleil", city: "Tabarre", profession: "Commerçante", relation: "mother",
    status: "pending", portalAccess: false, engagementScore: 15, registeredAt: "2025-01-15", lastActivity: null,
    totalDue: 45000, totalPaid: 0,
    children: [
      { id: "ED-01204", firstName: "Sophia", lastName: "Joseph", class: "9ème AF", average: 88, attendanceRate: 97, dailyStatus: "present", status: "active" },
    ],
    family: { fatherName: "Rony Joseph", fatherPhone: "509-4567-3389", fatherJob: "Mécanicien", fatherEmail: "", motherName: "Rose Joseph", motherPhone: "509-4567-3388", motherJob: "Commerçante", motherEmail: "rose.joseph.p@email.com" },
  },
  {
    id: "PA-005", firstName: "Roudy", lastName: "Delmas-P", phone: "509-3765-2211", email: "roudy.delmas.p@email.com",
    address: "56 Rue Rivière", city: "Cap-Haïtien", profession: "Chauffeur", relation: "father",
    status: "active", portalAccess: false, engagementScore: 32, registeredAt: "2024-09-01", lastActivity: "2025-01-20",
    totalDue: 45000, totalPaid: 15000,
    children: [
      { id: "ED-01205", firstName: "Roudy Jr.", lastName: "Delmas", class: "6ème AF", average: 52, attendanceRate: 72, dailyStatus: "absent", status: "suspended" },
    ],
    family: { fatherName: "Roudy Delmas", fatherPhone: "509-3765-2211", fatherJob: "Chauffeur", fatherEmail: "roudy.delmas.p@email.com", motherName: "Gerda Delmas", motherPhone: "509-3765-2212", motherJob: "Couturière", motherEmail: "" },
  },
  {
    id: "PA-006", firstName: "Carline", lastName: "Moreau", phone: "509-4901-6655", email: "carline.moreau@email.com",
    address: "34 Blvd Toussaint", city: "Port-au-Prince", profession: "Directrice marketing", relation: "mother",
    status: "active", portalAccess: true, engagementScore: 95, registeredAt: "2023-09-01", lastActivity: "2025-02-14",
    totalDue: 135000, totalPaid: 135000,
    children: [
      { id: "ED-01207", firstName: "Anya", lastName: "Moreau", class: "NSI", average: 91, attendanceRate: 99, dailyStatus: "present", status: "active" },
      { id: "ED-01208", firstName: "Nathan", lastName: "Moreau", class: "8ème AF", average: 82, attendanceRate: 96, dailyStatus: "present", status: "active" },
      { id: "ED-01209", firstName: "Léa", lastName: "Moreau", class: "5ème AF", average: 87, attendanceRate: 97, dailyStatus: "late", status: "active" },
    ],
    family: { fatherName: "Frantz Moreau", fatherPhone: "509-4901-6656", fatherJob: "Banquier", fatherEmail: "frantz.moreau@email.com", motherName: "Carline Moreau", motherPhone: "509-4901-6655", motherJob: "Directrice marketing", motherEmail: "carline.moreau@email.com" },
  },
  {
    id: "PA-007", firstName: "Wilner", lastName: "Bien-Aimé", phone: "509-3654-1199", email: "wilner.ba@email.com",
    address: "11 Ruelle Paix", city: "Delmas", profession: "Électricien", relation: "father",
    status: "inactive", portalAccess: false, engagementScore: 10, registeredAt: "2024-09-01", lastActivity: "2024-11-05",
    totalDue: 45000, totalPaid: 20000,
    children: [
      { id: "ED-01210", firstName: "Wisner", lastName: "Bien-Aimé", class: "7ème AF", average: 58, attendanceRate: 80, dailyStatus: "absent", status: "active" },
    ],
    family: { fatherName: "Wilner Bien-Aimé", fatherPhone: "509-3654-1199", fatherJob: "Électricien", fatherEmail: "wilner.ba@email.com", motherName: "Marie-Claire Bien-Aimé", motherPhone: "509-3654-1200", motherJob: "Vendeuse", motherEmail: "" },
  },
  {
    id: "PA-008", firstName: "Esther", lastName: "Petit-Frère", phone: "509-4233-8877", email: "esther.pf@email.com",
    address: "89 Rue Christophe", city: "Pétion-Ville", profession: "Pharmacienne", relation: "mother",
    status: "active", portalAccess: true, engagementScore: 78, registeredAt: "2024-09-01", lastActivity: "2025-02-13",
    totalDue: 90000, totalPaid: 75000,
    children: [
      { id: "ED-01211", firstName: "Grâce", lastName: "Petit-Frère", class: "NSI", average: 76, attendanceRate: 93, dailyStatus: "present", status: "active" },
      { id: "ED-01212", firstName: "Samuel", lastName: "Petit-Frère", class: "6ème AF", average: 69, attendanceRate: 90, dailyStatus: "present", status: "active" },
    ],
    family: { fatherName: "Joël Petit-Frère", fatherPhone: "509-4233-8878", fatherJob: "Pasteur", fatherEmail: "joel.pf@email.com", motherName: "Esther Petit-Frère", motherPhone: "509-4233-8877", motherJob: "Pharmacienne", motherEmail: "esther.pf@email.com" },
  },
  {
    id: "PA-009", firstName: "Guerda", lastName: "Louis", phone: "509-3876-4400", email: "",
    address: "5 Impasse Liberté", city: "Carrefour", profession: "Marchande", relation: "tutor",
    status: "active", portalAccess: false, engagementScore: 42, registeredAt: "2024-09-01", lastActivity: "2025-02-08",
    totalDue: 45000, totalPaid: 25000,
    children: [
      { id: "ED-01213", firstName: "Ricardo", lastName: "Louis", class: "8ème AF", average: 61, attendanceRate: 85, dailyStatus: "late", status: "active" },
    ],
    family: { fatherName: "", fatherPhone: "", fatherJob: "", fatherEmail: "", motherName: "", motherPhone: "", motherJob: "", motherEmail: "", tutorName: "Guerda Louis", tutorPhone: "509-3876-4400", tutorJob: "Marchande", tutorEmail: "", tutorRelation: "Tante" },
  },
  {
    id: "PA-010", firstName: "Jean-Robert", lastName: "Charles", phone: "509-4455-6677", email: "jr.charles@email.com",
    address: "67 Rue Geffrard", city: "Port-au-Prince", profession: "Médecin", relation: "father",
    status: "active", portalAccess: true, engagementScore: 88, registeredAt: "2023-09-01", lastActivity: "2025-02-14",
    totalDue: 90000, totalPaid: 90000,
    children: [
      { id: "ED-01214", firstName: "Christelle", lastName: "Charles", class: "NSI", average: 94, attendanceRate: 99, dailyStatus: "present", status: "active" },
      { id: "ED-01215", firstName: "Fabien", lastName: "Charles", class: "7ème AF", average: 80, attendanceRate: 96, dailyStatus: "present", status: "active" },
    ],
    family: { fatherName: "Jean-Robert Charles", fatherPhone: "509-4455-6677", fatherJob: "Médecin", fatherEmail: "jr.charles@email.com", motherName: "Nadège Charles", motherPhone: "509-4455-6678", motherJob: "Architecte", motherEmail: "nadege.charles@email.com" },
  },
];

/* generate communication + payment data deterministically */
function getParentDetails(p: Parent) {
  const idx = parseInt(p.id.replace(/[^0-9]/g, ""), 10);
  const channels: MessageChannel[] = ["internal", "sms", "email", "whatsapp"];
  const statuses: MessageStatus[] = ["sent", "read", "received", "read", "failed", "sent", "read", "read"];
  const subjects = ["Absence signalée", "Rappel paiement", "Réunion parents", "Bulletin envoyé", "Avertissement"];

  const communications: CommunicationEntry[] = p.lastActivity ? Array.from({ length: 6 }, (_, i) => ({
    id: `MSG-${idx}-${i}`,
    date: `2025-02-${String(14 - i * 2).padStart(2, "0")}`,
    channel: channels[(idx + i) % channels.length],
    subject: subjects[(idx + i) % subjects.length],
    preview: `Contenu du message ${i + 1} pour ${p.firstName}...`,
    status: statuses[(idx + i) % statuses.length],
    direction: (i % 3 === 0 ? "in" : "out") as "in" | "out",
  })) : [];

  const payTypes: PaymentType[] = ["tuition", "registration", "uniform", "books", "transport", "canteen"];
  const payMethods: PaymentMethod[] = ["cash", "mobile_money", "bank_transfer", "check"];
  const payStatuses: PaymentStatus[] = ["paid", "paid", "paid", "pending", "overdue", "partial"];

  const payments: PaymentEntry[] = Array.from({ length: Math.min(8, Math.ceil(p.totalPaid / 5000)), }, (_, i) => ({
    id: `PAY-${idx}-${i}`,
    date: `2025-0${1 + Math.floor(i / 3)}-${String(5 + (i * 7) % 25).padStart(2, "0")}`,
    amount: i < 2 ? 15000 : 5000 + (idx * 1000 + i * 500) % 10000,
    type: payTypes[(idx + i) % payTypes.length],
    status: payStatuses[(idx + i) % payStatuses.length],
    method: payMethods[(idx + i) % payMethods.length],
    ref: `REF-${String(idx * 100 + i).padStart(5, "0")}`,
    childId: p.children[i % p.children.length]?.id ?? p.children[0]?.id ?? "",
  }));

  return { communications, payments };
}

const COLORS = ["#013486", "#F35403", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

/* ================================================================
   HELPERS
================================================================ */

type PP = ReturnType<typeof useTranslation>["t"]["parentsPage"];

const statusColor: Record<ParentStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  suspended: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};

const avatarGradient: Record<Relation, string> = {
  father: "bg-gradient-to-br from-[#013486] to-[#2563EB]",
  mother: "bg-gradient-to-br from-violet-500 to-violet-700",
  tutor: "bg-gradient-to-br from-amber-500 to-amber-700",
  other: "bg-gradient-to-br from-gray-500 to-gray-700",
};

function getStatusLabel(status: ParentStatus, pp: PP): string {
  const map: Record<ParentStatus, string> = {
    active: pp.statusActive,
    inactive: pp.statusInactive,
    suspended: pp.statusSuspended,
    pending: pp.statusPending,
  };
  return map[status];
}

function getRelationLabel(rel: Relation, pp: PP): string {
  const map: Record<Relation, string> = {
    father: pp.relationFather,
    mother: pp.relationMother,
    tutor: pp.relationTutor,
    other: pp.relationOther,
  };
  return map[rel];
}

function getEngagementLabel(score: number, pp: PP): { label: string; color: string } {
  if (score >= 70) return { label: pp.engagementHigh, color: "bg-emerald-100 text-emerald-700" };
  if (score >= 40) return { label: pp.engagementMedium, color: "bg-amber-100 text-amber-700" };
  return { label: pp.engagementLow, color: "bg-red-100 text-red-700" };
}

function formatHTG(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} G`;
}

function buildPrintableHTML(
  parents: Parent[], headers: string[], title: string, generated: string, pp: PP,
) {
  const now = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const rows = parents.map((p, i) =>
    `<tr><td>${i + 1}</td><td>${p.firstName} ${p.lastName}</td><td>${p.phone}</td><td>${p.email || "-"}</td><td>${p.children.map(c => c.firstName).join(", ")}</td><td>${getStatusLabel(p.status, pp)}</td><td>${formatHTG(p.totalDue - p.totalPaid)}</td></tr>`
  ).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1a1a1a;padding:30px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #013486;padding-bottom:16px;margin-bottom:24px}.header h1{font-size:20px;color:#013486}.header .sub{font-size:11px;color:#666}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#013486;color:#fff;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #e5e7eb}tr:nth-child(even){background:#f9fafb}.footer{margin-top:24px;padding-top:12px;border-top:2px solid #F35403;font-size:10px;color:#999;text-align:center}@media print{body{padding:15px}}</style></head><body><div class="header"><div><h1>EDUCA</h1><p class="sub">${title}</p></div><div style="text-align:right"><p class="sub">${generated} ${now}</p><p class="sub">${parents.length} records</p></div></div><table><thead><tr><th>N°</th>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table><div class="footer">EDUCA — ${title} — ${now}</div></body></html>`;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob(["\uFEFF" + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* ================================================================
   MODAL COMPONENTS
================================================================ */

function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl ${wide ? "max-w-2xl" : "max-w-lg"} w-full mx-4 max-h-[85vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function AddParentModal({ pp }: { pp: PP }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.firstName}</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.lastName}</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.phone}</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="509-XXXX-XXXX" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.email}</label>
          <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.address}</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.city}</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.profession}</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.relation}</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="father">{pp.relationFather}</option>
            <option value="mother">{pp.relationMother}</option>
            <option value="tutor">{pp.relationTutor}</option>
            <option value="other">{pp.relationOther}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.associateChild}</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option>ED-01201 — Jean Baptiste (9ème AF)</option>
          <option>ED-01202 — Marie Clerveau (8ème AF)</option>
          <option>ED-01203 — Pierre Jr. Augustin (7ème AF)</option>
        </select>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" className="rounded accent-[#013486]" />
          {pp.enablePortal}
        </label>
      </div>
      <button className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors flex items-center justify-center gap-2">
        <UserPlus size={14} />{pp.save}
      </button>
    </div>
  );
}

function SendMessageModal({ parent, pp }: { parent: Parent; pp: PP }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.messageTo}</label>
        <input value={`${parent.firstName} ${parent.lastName} (${parent.phone})`} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.messageChannel}</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="internal">{pp.channelInternal}</option>
            <option value="sms">{pp.channelSMS}</option>
            <option value="whatsapp">{pp.channelWhatsApp}</option>
            <option value="email">{pp.channelEmail}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.messageTemplate}</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="custom">{pp.templateCustom}</option>
            <option value="absence">{pp.templateAbsence}</option>
            <option value="payment">{pp.templatePayment}</option>
            <option value="meeting">{pp.templateMeeting}</option>
            <option value="report">{pp.templateReport}</option>
            <option value="discipline">{pp.templateDiscipline}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.messageSubject}</label>
        <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.messageBody}</label>
        <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <button className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors flex items-center justify-center gap-2">
        <Send size={14} />{pp.messageSend}
      </button>
    </div>
  );
}

function AddPaymentModal({ parent, pp }: { parent: Parent; pp: PP }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.paymentChild}</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {parent.children.map(c => (
            <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.class})</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.paymentTypeLabel}</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="tuition">{pp.tuition}</option>
            <option value="registration">{pp.registration}</option>
            <option value="uniform">{pp.uniform}</option>
            <option value="transport">{pp.transport}</option>
            <option value="books">{pp.books}</option>
            <option value="canteen">{pp.canteen}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.paymentAmountLabel}</label>
          <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.paymentMethodLabel}</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="cash">{pp.cash}</option>
          <option value="mobile_money">{pp.mobileMoney}</option>
          <option value="bank_transfer">{pp.bankTransfer}</option>
          <option value="check">{pp.check}</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{pp.paymentNote}</label>
        <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <button className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
        <CreditCard size={14} />{pp.confirm}
      </button>
    </div>
  );
}

/* ================================================================
   PARENT DRAWER
================================================================ */

type DrawerTab = "profile" | "children" | "communication" | "payments" | "actions";

function ParentDrawer({
  parent, onClose, pp, onAction,
}: {
  parent: Parent; onClose: () => void; pp: PP;
  onAction: (action: string, p: Parent) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("profile");
  const details = useMemo(() => getParentDetails(parent), [parent]);
  const balance = parent.totalDue - parent.totalPaid;
  const engagement = getEngagementLabel(parent.engagementScore, pp);

  const tabs: { key: DrawerTab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: pp.tabProfile, icon: <Users size={12} /> },
    { key: "children", label: pp.tabChildren, icon: <GraduationCap size={12} /> },
    { key: "communication", label: pp.tabCommunication, icon: <MessageSquare size={12} /> },
    { key: "payments", label: pp.tabPayments, icon: <Wallet size={12} /> },
    { key: "actions", label: pp.tabActions, icon: <Activity size={12} /> },
  ];

  const channelIcon: Record<MessageChannel, React.ReactNode> = {
    internal: <MessageCircle size={12} />,
    sms: <Smartphone size={12} />,
    whatsapp: <Phone size={12} />,
    email: <Mail size={12} />,
  };

  const msgStatusColor: Record<MessageStatus, string> = {
    sent: "bg-blue-100 text-blue-700",
    received: "bg-emerald-100 text-emerald-700",
    read: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  };

  const payStatusColor: Record<PaymentStatus, string> = {
    paid: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
    partial: "bg-blue-100 text-blue-700",
  };

  const getPayTypeLabel = (type: PaymentType): string => {
    const map: Record<PaymentType, string> = {
      tuition: pp.tuition, registration: pp.registration, uniform: pp.uniform,
      transport: pp.transport, books: pp.books, canteen: pp.canteen,
    };
    return map[type];
  };

  const getPayStatusLabel = (status: PaymentStatus): string => {
    const map: Record<PaymentStatus, string> = {
      paid: pp.paymentPaid, pending: pp.paymentPending, overdue: pp.paymentOverdue, partial: pp.paymentPartial,
    };
    return map[status];
  };

  const getPayMethodLabel = (m: PaymentMethod): string => {
    const map: Record<PaymentMethod, string> = {
      cash: pp.cash, bank_transfer: pp.bankTransfer, mobile_money: pp.mobileMoney, check: pp.check,
    };
    return map[m];
  };

  const getMsgStatusLabel = (s: MessageStatus): string => {
    const map: Record<MessageStatus, string> = {
      sent: pp.msgSent, received: pp.msgReceived, read: pp.msgRead, failed: pp.msgFailed,
    };
    return map[s];
  };

  const childDailyColor: Record<string, string> = {
    present: "bg-emerald-100 text-emerald-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-amber-100 text-amber-700",
  };

  const childDailyLabel: Record<string, string> = {
    present: pp.childPresent,
    absent: pp.childAbsent,
    late: pp.childLate,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${avatarGradient[parent.relation]}`}>
                {parent.firstName[0]}{parent.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{parent.firstName} {parent.lastName}</h2>
                <p className="text-xs text-gray-500">{parent.id} · {getRelationLabel(parent.relation, pp)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>
          {/* Badges */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[parent.status]}`}>
              {getStatusLabel(parent.status, pp)}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${parent.portalAccess ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              {parent.portalAccess ? pp.portalActive : pp.portalInactive}
            </span>
            {balance > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                <DollarSign size={10} />{formatHTG(balance)}
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${engagement.color} flex items-center gap-1`}>
              <Star size={10} />{parent.engagementScore}% — {engagement.label}
            </span>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${tab === t.key ? "bg-[#013486] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* -------- PROFILE -------- */}
          {tab === "profile" && (
            <>
              {/* Personal info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Users size={14} />{pp.personalInfo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">{pp.codeLabel}</span><p className="font-medium font-mono">{parent.id}</p></div>
                  <div><span className="text-gray-500 text-xs">{pp.relationLabel}</span><p className="font-medium">{getRelationLabel(parent.relation, pp)}</p></div>
                  <div><span className="text-gray-500 text-xs">{pp.professionLabel}</span><p className="font-medium">{parent.profession}</p></div>
                  <div><span className="text-gray-500 text-xs">{pp.registeredSince}</span><p className="font-medium">{parent.registeredAt}</p></div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Phone size={14} />{pp.contactInfo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">{pp.phoneLabel}</span><p className="font-medium">{parent.phone}</p></div>
                  <div><span className="text-gray-500 text-xs">{pp.emailLabel}</span><p className="font-medium">{parent.email || "-"}</p></div>
                  <div><span className="text-gray-500 text-xs">{pp.addressLabel}</span><p className="font-medium">{parent.address}</p></div>
                  <div><span className="text-gray-500 text-xs">{pp.cityLabel}</span><p className="font-medium">{parent.city}</p></div>
                  <div><span className="text-gray-500 text-xs">{pp.portalAccess}</span>
                    <p className={`font-medium flex items-center gap-1 ${parent.portalAccess ? "text-emerald-600" : "text-gray-400"}`}>
                      {parent.portalAccess ? <><UserCheck size={12} />{pp.portalActive}</> : pp.portalInactive}
                    </p>
                  </div>
                  <div><span className="text-gray-500 text-xs">{pp.lastActivity}</span>
                    <p className="font-medium">{parent.lastActivity ?? "-"}</p>
                  </div>
                </div>
              </div>

              {/* Family info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Heart size={14} />{pp.familyInfo}</h3>

                {/* Father */}
                {parent.family.fatherName && (
                  <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                    <h4 className="text-xs font-semibold text-[#013486] flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-[#013486]/10 rounded flex items-center justify-center text-[10px]">P</span>
                      {pp.fatherInfo}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-400">{pp.fatherName}</span><p className="font-medium">{parent.family.fatherName}</p></div>
                      <div><span className="text-gray-400">{pp.fatherPhone}</span><p className="font-medium">{parent.family.fatherPhone || "-"}</p></div>
                      <div><span className="text-gray-400">{pp.fatherJob}</span><p className="font-medium">{parent.family.fatherJob || "-"}</p></div>
                      <div><span className="text-gray-400">{pp.fatherEmail}</span><p className="font-medium">{parent.family.fatherEmail || "-"}</p></div>
                    </div>
                  </div>
                )}

                {/* Mother */}
                {parent.family.motherName && (
                  <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                    <h4 className="text-xs font-semibold text-violet-600 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-violet-50 rounded flex items-center justify-center text-[10px]">M</span>
                      {pp.motherInfo}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-400">{pp.motherName}</span><p className="font-medium">{parent.family.motherName}</p></div>
                      <div><span className="text-gray-400">{pp.motherPhone}</span><p className="font-medium">{parent.family.motherPhone || "-"}</p></div>
                      <div><span className="text-gray-400">{pp.motherJob}</span><p className="font-medium">{parent.family.motherJob || "-"}</p></div>
                      <div><span className="text-gray-400">{pp.motherEmail}</span><p className="font-medium">{parent.family.motherEmail || "-"}</p></div>
                    </div>
                  </div>
                )}

                {/* Tutor */}
                {parent.family.tutorName && (
                  <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
                    <h4 className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-amber-50 rounded flex items-center justify-center text-[10px]">T</span>
                      {pp.tutorInfo}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-400">{pp.tutorName}</span><p className="font-medium">{parent.family.tutorName}</p></div>
                      <div><span className="text-gray-400">{pp.tutorPhone}</span><p className="font-medium">{parent.family.tutorPhone || "-"}</p></div>
                      <div><span className="text-gray-400">{pp.tutorJob}</span><p className="font-medium">{parent.family.tutorJob || "-"}</p></div>
                      <div><span className="text-gray-400">{pp.tutorRelation}</span><p className="font-medium">{parent.family.tutorRelation || "-"}</p></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement score */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><TrendingUp size={14} />{pp.engagementScore}</h3>
                <p className="text-xs text-gray-400">{pp.engagementDesc}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${parent.engagementScore >= 70 ? "bg-emerald-500" : parent.engagementScore >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${parent.engagementScore}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${parent.engagementScore >= 70 ? "text-emerald-600" : parent.engagementScore >= 40 ? "text-amber-600" : "text-red-600"}`}>
                    {parent.engagementScore}%
                  </span>
                </div>
              </div>
            </>
          )}

          {/* -------- CHILDREN -------- */}
          {tab === "children" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <GraduationCap size={14} />{pp.associatedChildren} ({parent.children.length})
              </h3>
              {parent.children.length === 0 ? (
                <p className="text-sm text-gray-400">{pp.noChildren}</p>
              ) : parent.children.map(child => (
                <div key={child.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#013486] to-[#2563EB] flex items-center justify-center text-white text-sm font-bold">
                        {child.firstName[0]}{child.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{child.firstName} {child.lastName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{child.id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${childDailyColor[child.dailyStatus]}`}>
                      {childDailyLabel[child.dailyStatus]}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                      <p className="text-xs text-gray-400">{pp.childClass}</p>
                      <p className="text-sm font-bold text-gray-900">{child.class}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                      <p className="text-xs text-gray-400">{pp.childAverage}</p>
                      <p className={`text-sm font-bold ${child.average >= 70 ? "text-emerald-600" : child.average >= 50 ? "text-amber-600" : "text-red-600"}`}>{child.average}/100</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                      <p className="text-xs text-gray-400">{pp.childAttendance}</p>
                      <p className={`text-sm font-bold ${child.attendanceRate >= 90 ? "text-emerald-600" : child.attendanceRate >= 80 ? "text-amber-600" : "text-red-600"}`}>{child.attendanceRate}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                      <p className="text-xs text-gray-400">{pp.childStatus}</p>
                      <p className={`text-sm font-bold ${child.status === "active" ? "text-emerald-600" : "text-red-600"}`}>
                        {child.status === "active" ? pp.statusActive : pp.statusSuspended}
                      </p>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2">
                    {[
                      { label: pp.viewGrades, icon: <BookOpen size={12} />, color: "text-[#013486] bg-[#013486]/10" },
                      { label: pp.viewAttendance, icon: <Clock size={12} />, color: "text-emerald-600 bg-emerald-50" },
                      { label: pp.viewPayments, icon: <Wallet size={12} />, color: "text-amber-600 bg-amber-50" },
                      { label: pp.viewFile, icon: <FileText size={12} />, color: "text-violet-600 bg-violet-50" },
                    ].map((qa, i) => (
                      <button key={i} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${qa.color} hover:opacity-80 transition-opacity`}>
                        {qa.icon}{qa.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* -------- COMMUNICATION -------- */}
          {tab === "communication" && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><MessageSquare size={14} />{pp.communicationHistory}</h3>
                <button onClick={() => onAction("message", parent)} className="text-xs px-3 py-1.5 bg-[#013486] text-white rounded-lg flex items-center gap-1 hover:bg-[#013486]/90">
                  <Send size={12} />{pp.sendMessage}
                </button>
              </div>
              {details.communications.length === 0 ? (
                <p className="text-sm text-gray-400">{pp.noCommunication}</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-50 text-gray-500 border-b">
                      <th className="px-3 py-2 text-left font-medium">{pp.msgDate}</th>
                      <th className="px-3 py-2 text-left font-medium">{pp.msgChannel}</th>
                      <th className="px-3 py-2 text-left font-medium">{pp.msgSubject}</th>
                      <th className="px-3 py-2 text-center font-medium">{pp.msgStatus}</th>
                    </tr></thead>
                    <tbody>
                      {details.communications.map((msg) => (
                        <tr key={msg.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{msg.date}</td>
                          <td className="px-3 py-2">
                            <span className="flex items-center gap-1.5">{channelIcon[msg.channel]}{msg.channel.toUpperCase()}</span>
                          </td>
                          <td className="px-3 py-2">
                            <div>
                              <p className="font-medium text-gray-800">{msg.subject}</p>
                              <p className="text-[10px] text-gray-400">{msg.preview}</p>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${msgStatusColor[msg.status]}`}>
                              {getMsgStatusLabel(msg.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* -------- PAYMENTS -------- */}
          {tab === "payments" && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">{pp.totalDue}</p>
                  <p className="text-lg font-bold text-gray-900">{formatHTG(parent.totalDue)}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-emerald-600">{pp.totalPaid}</p>
                  <p className="text-lg font-bold text-emerald-700">{formatHTG(parent.totalPaid)}</p>
                </div>
                <div className={`${balance > 0 ? "bg-red-50" : "bg-emerald-50"} rounded-xl p-3 text-center`}>
                  <p className={`text-xs ${balance > 0 ? "text-red-600" : "text-emerald-600"}`}>{pp.remainingBalance}</p>
                  <p className={`text-lg font-bold ${balance > 0 ? "text-red-700" : "text-emerald-700"}`}>{formatHTG(balance)}</p>
                </div>
              </div>

              {/* Payment progress bar */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{pp.totalPaid}</span>
                  <span>{parent.totalDue > 0 ? Math.round((parent.totalPaid / parent.totalDue) * 100) : 0}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${parent.totalDue > 0 ? Math.min(100, (parent.totalPaid / parent.totalDue) * 100) : 0}%` }}
                  />
                </div>
                {parent.children.length > 1 && (
                  <p className="text-[10px] text-gray-400">{formatHTG(parent.totalDue / parent.children.length)} {pp.perChild}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Receipt size={14} />{pp.paymentHistory}</h3>
                <button onClick={() => onAction("addPayment", parent)} className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg flex items-center gap-1 hover:bg-emerald-700">
                  <CreditCard size={12} />{pp.actionAddPayment}
                </button>
              </div>

              {details.payments.length === 0 ? (
                <p className="text-sm text-gray-400">{pp.noPayments}</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-50 text-gray-500 border-b">
                      <th className="px-3 py-2 text-left font-medium">{pp.paymentDate}</th>
                      <th className="px-3 py-2 text-left font-medium">{pp.paymentType}</th>
                      <th className="px-3 py-2 text-right font-medium">{pp.paymentAmount}</th>
                      <th className="px-3 py-2 text-left font-medium">{pp.paymentMethod}</th>
                      <th className="px-3 py-2 text-center font-medium">{pp.paymentStatus}</th>
                      <th className="px-3 py-2 text-left font-medium">{pp.paymentRef}</th>
                    </tr></thead>
                    <tbody>
                      {details.payments.map((pay) => (
                        <tr key={pay.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{pay.date}</td>
                          <td className="px-3 py-2 font-medium">{getPayTypeLabel(pay.type)}</td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">{formatHTG(pay.amount)}</td>
                          <td className="px-3 py-2 text-gray-500">{getPayMethodLabel(pay.method)}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${payStatusColor[pay.status]}`}>
                              {getPayStatusLabel(pay.status)}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-400">{pay.ref}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* -------- ACTIONS -------- */}
          {tab === "actions" && (
            <div className="space-y-2">
              {[
                { key: "message", icon: <MessageSquare size={14} />, label: pp.actionMessage, color: "text-[#013486]" },
                { key: "sms", icon: <Smartphone size={14} />, label: pp.actionSMS, color: "text-emerald-600" },
                { key: "whatsapp", icon: <Phone size={14} />, label: pp.actionWhatsApp, color: "text-green-600" },
                { key: "email", icon: <Mail size={14} />, label: pp.actionEmail, color: "text-blue-600" },
                { key: "viewPayments", icon: <Wallet size={14} />, label: pp.actionViewPayments, color: "text-amber-600" },
                { key: "addPayment", icon: <CreditCard size={14} />, label: pp.actionAddPayment, color: "text-emerald-600" },
                { key: "exportData", icon: <Download size={14} />, label: pp.actionExportData, color: "text-[#013486]" },
                { key: "generateCard", icon: <FileText size={14} />, label: pp.actionGenerateCard, color: "text-violet-600" },
                ...(parent.status === "active"
                  ? [{ key: "suspend", icon: <Ban size={14} />, label: pp.actionSuspend, color: "text-red-500" }]
                  : [{ key: "reactivate", icon: <UserCheck size={14} />, label: pp.actionReactivate, color: "text-emerald-600" }]
                ),
                { key: "delete", icon: <Trash2 size={14} />, label: pp.actionDelete, color: "text-red-500" },
              ].map(a => (
                <button key={a.key} onClick={() => onAction(a.key, parent)}
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

export default function AdminParentsPage() {
  const { t } = useTranslation();
  const pp = t.parentsPage;

  /* --- state --- */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterEngagement, setFilterEngagement] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | "status" | "children" | "balance" | "engagement">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerParent, setDrawerParent] = useState<Parent | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"addParent" | "message" | "addPayment" | null>(null);
  const [modalParent, setModalParent] = useState<Parent | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) setActionMenuId(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* --- filtering, sorting, pagination --- */
  const allClasses = useMemo(() => {
    const classSet = new Set<string>();
    allParents.forEach(p => p.children.forEach(c => classSet.add(c.class)));
    return Array.from(classSet).sort();
  }, []);

  const filtered = useMemo(() => {
    let result = [...allParents];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q)
      );
    }
    if (filterStatus) result = result.filter(p => p.status === filterStatus);
    if (filterClass) result = result.filter(p => p.children.some(c => c.class === filterClass));
    if (filterEngagement === "high") result = result.filter(p => p.engagementScore >= 70);
    if (filterEngagement === "medium") result = result.filter(p => p.engagementScore >= 40 && p.engagementScore < 70);
    if (filterEngagement === "low") result = result.filter(p => p.engagementScore < 40);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else if (sortKey === "children") cmp = a.children.length - b.children.length;
      else if (sortKey === "balance") cmp = (a.totalDue - a.totalPaid) - (b.totalDue - b.totalPaid);
      else cmp = a.engagementScore - b.engagementScore;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [searchQuery, filterStatus, filterClass, filterEngagement, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterStatus, filterClass, filterEngagement]);

  /* --- stats --- */
  const countByStatus = (s: ParentStatus) => allParents.filter(p => p.status === s).length;
  const portalCount = allParents.filter(p => p.portalAccess).length;
  const totalBalance = allParents.reduce((sum, p) => sum + Math.max(0, p.totalDue - p.totalPaid), 0);
  const avgEngagement = Math.round(allParents.reduce((sum, p) => sum + p.engagementScore, 0) / allParents.length);

  const statusChartData = [
    { name: pp.statusActive, value: countByStatus("active") },
    { name: pp.statusInactive, value: countByStatus("inactive") },
    { name: pp.statusSuspended, value: countByStatus("suspended") },
    { name: pp.statusPending, value: countByStatus("pending") },
  ].filter(d => d.value > 0);

  const childrenChartData = [
    { name: pp.childrenCount1, value: allParents.filter(p => p.children.length === 1).length },
    { name: pp.childrenCount2, value: allParents.filter(p => p.children.length === 2).length },
    { name: pp.childrenCount3, value: allParents.filter(p => p.children.length >= 3).length },
  ].filter(d => d.value > 0);

  const engagementChartData = [
    { name: pp.engagementHigh, value: allParents.filter(p => p.engagementScore >= 70).length },
    { name: pp.engagementMedium, value: allParents.filter(p => p.engagementScore >= 40 && p.engagementScore < 70).length },
    { name: pp.engagementLow, value: allParents.filter(p => p.engagementScore < 40).length },
  ].filter(d => d.value > 0);

  const paymentChartData = [
    { name: pp.paid, value: allParents.filter(p => p.totalPaid >= p.totalDue).length },
    { name: pp.partial, value: allParents.filter(p => p.totalPaid > 0 && p.totalPaid < p.totalDue).length },
    { name: pp.unpaid, value: allParents.filter(p => p.totalPaid === 0 && p.totalDue > 0).length },
  ].filter(d => d.value > 0);

  /* --- selection --- */
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(p => p.id)));
  };

  /* --- sort toggle --- */
  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  /* --- export --- */
  const doExport = (type: "pdf" | "excel" | "csv" | "print") => {
    setExportOpen(false);
    const headers = [pp.colParent, pp.colPhone, pp.colEmail, pp.colChildren, pp.colStatus, pp.colBalance];
    if (type === "pdf" || type === "print") {
      const html = buildPrintableHTML(filtered, headers, pp.exportTitle, pp.exportGenerated, pp);
      const w = window.open("", "_blank");
      if (w) { w.document.write(html); w.document.close(); if (type === "print") setTimeout(() => w.print(), 300); }
    } else if (type === "csv") {
      const csv = [headers.join(","), ...filtered.map(p => [
        `${p.firstName} ${p.lastName}`, p.phone, p.email || "-",
        p.children.map(c => c.firstName).join("; "),
        getStatusLabel(p.status, pp), formatHTG(p.totalDue - p.totalPaid),
      ].join(","))].join("\n");
      downloadBlob(csv, "parents_educa.csv", "text/csv");
    } else {
      const html = `<table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>${filtered.map(p => `<tr><td>${p.firstName} ${p.lastName}</td><td>${p.phone}</td><td>${p.email || "-"}</td><td>${p.children.map(c => c.firstName).join(", ")}</td><td>${getStatusLabel(p.status, pp)}</td><td>${formatHTG(p.totalDue - p.totalPaid)}</td></tr>`).join("")}</table>`;
      downloadBlob(html, "parents_educa.xls", "application/vnd.ms-excel");
    }
  };

  /* --- drawer action handler --- */
  const handleDrawerAction = (action: string, parent: Parent) => {
    setDrawerParent(null);
    setModalParent(parent);
    if (action === "message" || action === "sms" || action === "whatsapp" || action === "email") setModalType("message");
    else if (action === "addPayment") setModalType("addPayment");
    else if (action === "delete") {
      if (confirm(pp.confirmDelete)) { /* mock delete */ }
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.parents.title}
        description={t.pages.admin.parents.desc}
        icon={<Users size={20} />}
      />

      {/* ====== STAT CARDS ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: pp.totalParents, value: allParents.length, icon: <Users size={18} />, bg: "bg-[#013486]/5", text: "text-[#013486]" },
          { label: pp.activeParents, value: countByStatus("active"), icon: <UserCheck size={18} />, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: pp.inactiveParents, value: countByStatus("inactive"), icon: <Ban size={18} />, bg: "bg-gray-100", text: "text-gray-500" },
          { label: pp.withPortal, value: portalCount, icon: <Smartphone size={18} />, bg: "bg-violet-50", text: "text-violet-600" },
          { label: pp.withoutPortal, value: allParents.length - portalCount, icon: <AlertTriangle size={18} />, bg: "bg-amber-50", text: "text-amber-600" },
          { label: pp.unpaidBalance, value: formatHTG(totalBalance), icon: <DollarSign size={18} />, bg: "bg-red-50", text: "text-red-600", isString: true },
          { label: pp.engagementAvg, value: `${avgEngagement}%`, icon: <Star size={18} />, bg: "bg-[#F35403]/5", text: "text-[#F35403]", isString: true },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center ${s.text} mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ====== CHARTS ====== */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{pp.statusDistribution}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusChartData.map((_, i) => <Cell key={i} fill={["#10B981", "#9CA3AF", "#EF4444", "#F59E0B"][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Children distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{pp.childrenDistribution}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={childrenChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#013486" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Engagement distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{pp.engagementDistribution}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={engagementChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {engagementChartData.map((_, i) => <Cell key={i} fill={["#10B981", "#F59E0B", "#EF4444"][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Payment overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{pp.paymentOverview}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {paymentChartData.map((_, i) => <Cell key={i} fill={["#10B981", "#F59E0B", "#EF4444"][i]} />)}
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
          <span className="text-sm font-medium text-gray-700">{pp.filterTitle}</span>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} {filtered.length === 1 ? pp.result : pp.results}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Status */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{pp.allStatuses}</option>
            <option value="active">{pp.statusActive}</option>
            <option value="inactive">{pp.statusInactive}</option>
            <option value="suspended">{pp.statusSuspended}</option>
            <option value="pending">{pp.statusPending}</option>
          </select>
          {/* Class */}
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{pp.allClasses}</option>
            {allClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Engagement */}
          <select value={filterEngagement} onChange={e => setFilterEngagement(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{pp.allEngagements}</option>
            <option value="high">{pp.engagementHigh}</option>
            <option value="medium">{pp.engagementMedium}</option>
            <option value="low">{pp.engagementLow}</option>
          </select>
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={pp.searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg" />
          </div>
          {/* Reset */}
          <button onClick={() => { setSearchQuery(""); setFilterStatus(""); setFilterClass(""); setFilterEngagement(""); }}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">{pp.reset}</button>
          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button onClick={() => setExportOpen(!exportOpen)} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <Download size={13} />{pp.export}<ChevronDown size={12} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 min-w-[160px]">
                <button onClick={() => doExport("pdf")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><FileText size={12} />{pp.exportPDF}</button>
                <button onClick={() => doExport("excel")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><FileSpreadsheet size={12} />{pp.exportExcel}</button>
                <button onClick={() => doExport("csv")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><FileText size={12} />{pp.exportCSV}</button>
                <button onClick={() => doExport("print")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Printer size={12} />{pp.print}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== BULK SELECTION BAR ====== */}
      {selectedIds.size > 0 && (
        <div className="bg-[#013486] text-white rounded-xl p-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm font-medium">{selectedIds.size} {pp.selected}</span>
          <div className="flex gap-2 flex-wrap">
            <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1"><MessageSquare size={12} />{pp.bulkMessage}</button>
            <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1"><Smartphone size={12} />{pp.bulkSMS}</button>
            <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1"><Download size={12} />{pp.bulkExport}</button>
            <button className="text-xs px-3 py-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 flex items-center gap-1"><Trash2 size={12} />{pp.bulkDelete}</button>
          </div>
        </div>
      )}

      {/* ====== TABLE ====== */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{pp.listTitle}</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>{pp.itemsPerPage}:</span>
              <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-200 rounded px-1.5 py-0.5 text-xs">
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
              </select>
            </div>
            <button onClick={() => { setModalParent(null); setModalType("addParent"); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#013486] text-white text-xs font-medium rounded-lg hover:bg-[#013486]/90">
              <UserPlus size={14} />{pp.addParent}
            </button>
          </div>
        </div>

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
                  <span className="flex items-center gap-1">{pp.colParent}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{pp.colPhone}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{pp.colEmail}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("children")}>
                  <span className="flex items-center gap-1">{pp.colChildren}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{pp.colClasses}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("balance")}>
                  <span className="flex items-center gap-1">{pp.colBalance}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("status")}>
                  <span className="flex items-center gap-1">{pp.colStatus}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("engagement")}>
                  <span className="flex items-center gap-1">{pp.colEngagement}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{pp.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">{pp.noResults}</td></tr>
              ) : paginated.map((parent) => {
                const bal = parent.totalDue - parent.totalPaid;
                const eng = getEngagementLabel(parent.engagementScore, pp);
                return (
                  <tr key={parent.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(parent.id)} className="text-gray-400 hover:text-[#013486]">
                        {selectedIds.has(parent.id) ? <CheckSquare size={16} className="text-[#013486]" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${avatarGradient[parent.relation]}`}>
                          {parent.firstName[0]}{parent.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{parent.firstName} {parent.lastName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{parent.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 flex items-center gap-1"><Phone size={10} className="text-gray-400" />{parent.phone}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{parent.email || <span className="text-gray-300">-</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {parent.children.map(c => (
                          <span key={c.id} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
                            {c.firstName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {[...new Set(parent.children.map(c => c.class))].map(cls => (
                          <span key={cls} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">{cls}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {bal > 0 ? (
                        <span className="text-red-600 font-medium flex items-center gap-1"><DollarSign size={10} />{formatHTG(bal)}</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">{pp.balancePaid}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[parent.status]}`}>
                        {getStatusLabel(parent.status, pp)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${parent.engagementScore >= 70 ? "bg-emerald-500" : parent.engagementScore >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${parent.engagementScore}%` }} />
                        </div>
                        <span className={`text-[10px] font-medium ${eng.color.split(" ")[1]}`}>{parent.engagementScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDrawerParent(parent)} className="p-1.5 rounded-lg hover:bg-[#013486]/10 text-[#013486]"><Eye size={14} /></button>
                        <button onClick={() => { setModalParent(parent); setModalType("message"); }} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"><MessageSquare size={14} /></button>
                        <div className="relative">
                          <button onClick={() => setActionMenuId(actionMenuId === parent.id ? null : parent.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal size={14} /></button>
                          {actionMenuId === parent.id && (
                            <div ref={actionMenuRef} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 min-w-[200px]">
                              <button onClick={() => { setActionMenuId(null); setDrawerParent(parent); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Eye size={12} />{pp.actionView}</button>
                              <button onClick={() => { setActionMenuId(null); setModalParent(parent); setModalType("message"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><MessageSquare size={12} />{pp.actionMessage}</button>
                              <button onClick={() => { setActionMenuId(null); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Smartphone size={12} />{pp.actionSMS}</button>
                              <button onClick={() => { setActionMenuId(null); setModalParent(parent); setModalType("addPayment"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><CreditCard size={12} />{pp.actionAddPayment}</button>
                              <div className="border-t border-gray-100 my-1" />
                              <button onClick={() => { setActionMenuId(null); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2 text-amber-600"><Ban size={12} />{pp.actionSuspend}</button>
                              <button onClick={() => { setActionMenuId(null); if (confirm(pp.confirmDelete)) { /* mock */ } }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2 text-red-500"><Trash2 size={12} />{pp.actionDelete}</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {pp.showing} {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} {pp.on} {filtered.length} {pp.parents}
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
      {drawerParent && (
        <ParentDrawer parent={drawerParent} onClose={() => setDrawerParent(null)} pp={pp} onAction={handleDrawerAction} />
      )}

      {/* ====== MODALS ====== */}
      <Modal open={modalType === "addParent"} onClose={() => setModalType(null)} title={pp.addParentTitle} wide>
        <AddParentModal pp={pp} />
      </Modal>
      <Modal open={modalType === "message" && !!modalParent} onClose={() => setModalType(null)} title={pp.sendMessageTitle}>
        {modalParent && <SendMessageModal parent={modalParent} pp={pp} />}
      </Modal>
      <Modal open={modalType === "addPayment" && !!modalParent} onClose={() => setModalType(null)} title={pp.addPaymentTitle}>
        {modalParent && <AddPaymentModal parent={modalParent} pp={pp} />}
      </Modal>
    </div>
  );
}
