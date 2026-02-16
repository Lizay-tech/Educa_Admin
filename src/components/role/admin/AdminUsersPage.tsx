"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  Users, Search, ChevronLeft, ChevronRight,
  Eye, Filter, Download, FileText, FileSpreadsheet, Printer,
  ChevronDown, MoreHorizontal, MessageSquare, Ban,
  Trash2, X, ArrowUpDown, CheckSquare, Square,
  Shield, ShieldCheck, ShieldOff, UserCheck, Activity,
  Clock, GraduationCap, BookOpen, Briefcase, Key, Lock,
  UserPlus, Send, ToggleLeft, ToggleRight, RefreshCw,
  Monitor, Smartphone, Globe, Check, AlertTriangle,
  LogOut, Fingerprint, MapPin, Wifi,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
} from "recharts";

/* ================================================================
   TYPES
================================================================ */

type AccountRole = "admin_principal" | "admin_secondary" | "teacher" | "student" | "parent" | "staff";
type AccountStatus = "active" | "suspended" | "disabled" | "pending";

interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: AccountRole;
  status: AccountStatus;
  twoFA: boolean;
  createdAt: string;
  lastLogin: string | null;
  lastPasswordChange: string;
  activeSessions: number;
  linkedProfileId: string | null;
}

interface SessionEntry {
  id: string;
  device: string;
  ip: string;
  location: string;
  startedAt: string;
  current: boolean;
}

interface ConnectionLog {
  date: string;
  ip: string;
  device: string;
  location: string;
  status: "success" | "failed" | "blocked";
}

interface PermissionEntry {
  module: string;
  read: boolean;
  write: boolean;
  del: boolean;
  admin: boolean;
}

interface AccountDetails {
  sessions: SessionEntry[];
  connectionLogs: ConnectionLog[];
  permissions: PermissionEntry[];
  passwordStrength: "strong" | "medium" | "weak";
}

/* ================================================================
   MOCK DATA
================================================================ */

const allAccounts: UserAccount[] = [
  // --- Admin principal ---
  { id: "ACC-001", firstName: "Esaïe", lastName: "Directeur", email: "admin@educa.ht", phone: "509-4537-0001", role: "admin_principal", status: "active", twoFA: true, createdAt: "2024-01-01", lastLogin: "2025-02-14", lastPasswordChange: "2025-01-15", activeSessions: 2, linkedProfileId: null },
  // --- Admin secondaire ---
  { id: "ACC-002", firstName: "Marie-Luce", lastName: "Pierre", email: "ml.pierre@educa.ht", phone: "509-4812-0002", role: "admin_secondary", status: "active", twoFA: true, createdAt: "2024-01-01", lastLogin: "2025-02-14", lastPasswordChange: "2025-02-01", activeSessions: 1, linkedProfileId: null },
  { id: "ACC-003", firstName: "Jacques", lastName: "Moreau", email: "j.moreau@educa.ht", phone: "509-3322-5500", role: "admin_secondary", status: "active", twoFA: false, createdAt: "2024-03-15", lastLogin: "2025-02-14", lastPasswordChange: "2024-12-10", activeSessions: 1, linkedProfileId: "ST-001" },
  // --- Enseignants ---
  { id: "ACC-004", firstName: "Jean-Marc", lastName: "Duval", email: "jm.duval@educa.ht", phone: "509-4537-1001", role: "teacher", status: "active", twoFA: true, createdAt: "2015-09-01", lastLogin: "2025-02-14", lastPasswordChange: "2025-01-20", activeSessions: 1, linkedProfileId: "PR-001" },
  { id: "ACC-005", firstName: "Rose", lastName: "Clerveau", email: "r.clerveau@educa.ht", phone: "509-6312-1002", role: "teacher", status: "active", twoFA: false, createdAt: "2017-09-01", lastLogin: "2025-02-14", lastPasswordChange: "2024-11-05", activeSessions: 2, linkedProfileId: "PR-002" },
  { id: "ACC-006", firstName: "Pierre", lastName: "Augustin", email: "p.augustin@educa.ht", phone: "509-3421-1003", role: "teacher", status: "active", twoFA: false, createdAt: "2012-09-01", lastLogin: "2025-02-13", lastPasswordChange: "2024-09-15", activeSessions: 0, linkedProfileId: "PR-003" },
  { id: "ACC-007", firstName: "Sophia", lastName: "Joseph", email: "s.joseph@educa.ht", phone: "509-4812-1004", role: "teacher", status: "active", twoFA: true, createdAt: "2023-09-01", lastLogin: "2025-02-14", lastPasswordChange: "2025-02-10", activeSessions: 1, linkedProfileId: "PR-004" },
  { id: "ACC-008", firstName: "Roudy", lastName: "Germain", email: "r.germain@educa.ht", phone: "509-3765-1005", role: "teacher", status: "disabled", twoFA: false, createdAt: "2014-09-01", lastLogin: "2025-01-05", lastPasswordChange: "2024-06-20", activeSessions: 0, linkedProfileId: "PR-005" },
  // --- Élèves ---
  { id: "ACC-009", firstName: "Jean", lastName: "Baptiste", email: "jean.baptiste@educa.ht", phone: "509-4537-1345", role: "student", status: "active", twoFA: false, createdAt: "2024-09-01", lastLogin: "2025-02-13", lastPasswordChange: "2024-09-01", activeSessions: 1, linkedProfileId: "ED-01201" },
  { id: "ACC-010", firstName: "Marie", lastName: "Clerveau-E", email: "marie.clerveau@educa.ht", phone: "509-6312-3765", role: "student", status: "active", twoFA: false, createdAt: "2024-09-01", lastLogin: "2025-02-14", lastPasswordChange: "2024-09-01", activeSessions: 1, linkedProfileId: "ED-01202" },
  { id: "ACC-011", firstName: "Pierre", lastName: "Augustin-E", email: "pierre.augustin@educa.ht", phone: "509-3421-8901", role: "student", status: "active", twoFA: false, createdAt: "2024-09-01", lastLogin: "2025-02-12", lastPasswordChange: "2024-09-01", activeSessions: 0, linkedProfileId: "ED-01203" },
  { id: "ACC-012", firstName: "Roudy", lastName: "Delmas", email: "roudy.delmas@educa.ht", phone: "509-3765-2210", role: "student", status: "suspended", twoFA: false, createdAt: "2024-09-01", lastLogin: "2025-01-20", lastPasswordChange: "2024-09-01", activeSessions: 0, linkedProfileId: "ED-01205" },
  // --- Parents ---
  { id: "ACC-013", firstName: "Marc", lastName: "Baptiste-P", email: "marc.baptiste@email.com", phone: "509-3421-0011", role: "parent", status: "active", twoFA: false, createdAt: "2024-09-01", lastLogin: "2025-02-10", lastPasswordChange: "2024-09-01", activeSessions: 0, linkedProfileId: "PA-001" },
  { id: "ACC-014", firstName: "Sophie", lastName: "Clerveau-P", email: "sophie.clerv@email.com", phone: "509-4812-7722", role: "parent", status: "active", twoFA: false, createdAt: "2024-09-01", lastLogin: "2025-02-12", lastPasswordChange: "2024-10-15", activeSessions: 1, linkedProfileId: "PA-002" },
  { id: "ACC-015", firstName: "Rose", lastName: "Joseph-P", email: "rose.joseph.p@email.com", phone: "509-4567-3388", role: "parent", status: "pending", twoFA: false, createdAt: "2025-01-15", lastLogin: null, lastPasswordChange: "2025-01-15", activeSessions: 0, linkedProfileId: "PA-004" },
  // --- Personnel ---
  { id: "ACC-016", firstName: "Claire", lastName: "Dumont", email: "c.dumont@educa.ht", phone: "509-4901-3300", role: "staff", status: "active", twoFA: true, createdAt: "2020-03-01", lastLogin: "2025-02-14", lastPasswordChange: "2025-01-08", activeSessions: 1, linkedProfileId: "ST-002" },
  { id: "ACC-017", firstName: "Robert", lastName: "Bien-Aimé", email: "r.biennaime@educa.ht", phone: "509-3654-1188", role: "staff", status: "active", twoFA: false, createdAt: "2016-09-01", lastLogin: "2025-02-13", lastPasswordChange: "2024-08-20", activeSessions: 0, linkedProfileId: "ST-003" },
];

/* generate detail data deterministically */
function getAccountDetails(a: UserAccount): AccountDetails {
  const idx = parseInt(a.id.replace(/[^0-9]/g, ""), 10);
  const devices = ["Chrome / Windows", "Safari / iPhone", "Firefox / Mac", "App EDUCA / Android"];
  const locations = ["Port-au-Prince, HT", "Pétion-Ville, HT", "Delmas, HT", "Tabarre, HT", "Cap-Haïtien, HT"];

  const sessions: SessionEntry[] = Array.from({ length: a.activeSessions }, (_, i) => ({
    id: `SES-${idx}-${i}`,
    device: devices[(idx + i) % devices.length],
    ip: `192.168.${1 + (idx % 5)}.${10 + (i * 3 + idx) % 240}`,
    location: locations[(idx + i) % locations.length],
    startedAt: `2025-02-${String(14 - i).padStart(2, "0")} ${8 + (idx + i) % 12}:${String((idx * 7 + i * 13) % 60).padStart(2, "0")}`,
    current: i === 0,
  }));

  const logStatuses: ConnectionLog["status"][] = ["success", "success", "success", "success", "failed", "success", "blocked", "success", "success", "success"];
  const connectionLogs: ConnectionLog[] = a.lastLogin ? Array.from({ length: 10 }, (_, i) => ({
    date: `2025-02-${String(14 - i).padStart(2, "0")} ${8 + (idx + i) % 14}:${String((idx * 3 + i * 11) % 60).padStart(2, "0")}`,
    ip: `192.168.${1 + (idx % 5)}.${10 + (i * 7 + idx) % 240}`,
    device: devices[(idx + i) % devices.length],
    location: locations[(idx + i * 2) % locations.length],
    status: logStatuses[(idx + i) % logStatuses.length],
  })) : [];

  const modules = ["Dashboard", "Élèves", "Enseignants", "Notes", "Communication", "Documents", "Paramètres"];
  const permissions: PermissionEntry[] = modules.map((mod, i) => ({
    module: mod,
    read: true,
    write: a.role === "admin_principal" || a.role === "admin_secondary" || (a.role === "staff" && i < 5) || (a.role === "teacher" && (i === 0 || i === 1 || i === 3)),
    del: a.role === "admin_principal" || (a.role === "admin_secondary" && i < 5) || (a.role === "staff" && i < 3),
    admin: a.role === "admin_principal" || (a.role === "admin_secondary" && i === 0),
  }));

  const strengths: AccountDetails["passwordStrength"][] = ["strong", "medium", "weak"];
  const passwordStrength = a.twoFA ? "strong" : strengths[idx % 3];

  return { sessions, connectionLogs, permissions, passwordStrength };
}

const COLORS = ["#013486", "#F35403", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

/* ================================================================
   HELPERS
================================================================ */

type UP = ReturnType<typeof useTranslation>["t"]["usersPage"];

const roleIcon: Record<AccountRole, React.ReactNode> = {
  admin_principal: <ShieldCheck size={12} />,
  admin_secondary: <Shield size={12} />,
  teacher: <BookOpen size={12} />,
  student: <GraduationCap size={12} />,
  parent: <Users size={12} />,
  staff: <Briefcase size={12} />,
};

const roleColor: Record<AccountRole, string> = {
  admin_principal: "bg-red-100 text-red-700",
  admin_secondary: "bg-orange-100 text-orange-700",
  teacher: "bg-emerald-100 text-emerald-700",
  student: "bg-blue-100 text-blue-700",
  parent: "bg-violet-100 text-violet-700",
  staff: "bg-amber-100 text-amber-700",
};

const statusColor: Record<AccountStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
  disabled: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
};

const avatarGradient: Record<AccountRole, string> = {
  admin_principal: "bg-gradient-to-br from-red-500 to-red-700",
  admin_secondary: "bg-gradient-to-br from-orange-500 to-orange-700",
  teacher: "bg-gradient-to-br from-emerald-500 to-emerald-700",
  student: "bg-gradient-to-br from-[#013486] to-[#2563EB]",
  parent: "bg-gradient-to-br from-violet-500 to-violet-700",
  staff: "bg-gradient-to-br from-amber-500 to-amber-700",
};

function getRoleLabel(role: AccountRole, up: UP): string {
  const map: Record<AccountRole, string> = {
    admin_principal: up.roleAdminPrincipal,
    admin_secondary: up.roleAdminSecondary,
    teacher: up.roleTeacher,
    student: up.roleStudent,
    parent: up.roleParent,
    staff: up.roleStaff,
  };
  return map[role];
}

function getStatusLabel(status: AccountStatus, up: UP): string {
  const map: Record<AccountStatus, string> = {
    active: up.statusActive,
    suspended: up.statusSuspended,
    disabled: up.statusDisabled,
    pending: up.statusPending,
  };
  return map[status];
}

function buildPrintableHTML(
  accounts: UserAccount[], headers: string[], title: string, generated: string,
  up: UP,
) {
  const now = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const rows = accounts.map((a, i) =>
    `<tr><td>${i + 1}</td><td>${a.firstName} ${a.lastName}</td><td>${a.email}</td><td>${getRoleLabel(a.role, up)}</td><td>${getStatusLabel(a.status, up)}</td><td>${a.twoFA ? "✓" : "✗"}</td><td>${a.lastLogin ?? "-"}</td></tr>`
  ).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1a1a1a;padding:30px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #013486;padding-bottom:16px;margin-bottom:24px}.header h1{font-size:20px;color:#013486}.header .sub{font-size:11px;color:#666}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#013486;color:#fff;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #e5e7eb}tr:nth-child(even){background:#f9fafb}.footer{margin-top:24px;padding-top:12px;border-top:2px solid #F35403;font-size:10px;color:#999;text-align:center}@media print{body{padding:15px}}</style></head><body><div class="header"><div><h1>EDUCA</h1><p class="sub">${title}</p></div><div style="text-align:right"><p class="sub">${generated} ${now}</p><p class="sub">${accounts.length} records</p></div></div><table><thead><tr><th>N°</th>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table><div class="footer">EDUCA — ${title} — ${now}</div></body></html>`;
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

function CreateAccountModal({ up }: { up: UP }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{up.firstName}</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{up.lastName}</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.email}</label>
        <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="nom@educa.ht" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.phone}</label>
        <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="509-XXXX-XXXX" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.role}</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="student">{up.roleStudent}</option>
          <option value="teacher">{up.roleTeacher}</option>
          <option value="parent">{up.roleParent}</option>
          <option value="staff">{up.roleStaff}</option>
          <option value="admin_secondary">{up.roleAdminSecondary}</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.password}</label>
        <div className="flex gap-2">
          <input type="text" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono bg-gray-50" value="Xp7$mK2qLr" readOnly />
          <button className="px-3 py-2 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 flex items-center gap-1"><RefreshCw size={12} />{up.generatePassword}</button>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" className="rounded accent-[#013486]" defaultChecked />
          {up.sendCredentials}
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" className="rounded accent-[#013486]" defaultChecked />
          {up.forceChangeOnLogin}
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" className="rounded accent-[#013486]" />
          {up.enable2FAOnCreation}
        </label>
      </div>
      <button className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors flex items-center justify-center gap-2">
        <UserPlus size={14} />{up.save}
      </button>
    </div>
  );
}

function MessageModal({ account, up }: { account: UserAccount; up: UP }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.messageTo}</label>
        <input value={`${account.firstName} ${account.lastName} (${account.email})`} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.messageSubject}</label>
        <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.messageBody}</label>
        <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <button className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors flex items-center justify-center gap-2"><Send size={14} />{up.messageSend}</button>
    </div>
  );
}

function ChangeRoleModal({ account, up }: { account: UserAccount; up: UP }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.currentRole}</label>
        <input value={getRoleLabel(account.role, up)} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.newRole}</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {(["student", "teacher", "parent", "staff", "admin_secondary"] as AccountRole[]).filter(r => r !== account.role).map(r => (
            <option key={r} value={r}>{getRoleLabel(r, up)}</option>
          ))}
        </select>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700">{up.changeRoleWarning}</p>
      </div>
      <button className="w-full py-2.5 bg-[#013486] text-white rounded-lg text-sm font-medium hover:bg-[#013486]/90 transition-colors">{up.confirm}</button>
    </div>
  );
}

function ResetPasswordModal({ up }: { up: UP }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{up.resetPasswordDesc}</p>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.newPassword}</label>
        <div className="flex gap-2">
          <input type="text" value="Ax7$kPm2Qr" readOnly className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 font-mono" />
          <button className="px-3 py-2 text-xs bg-gray-100 rounded-lg hover:bg-gray-200"><RefreshCw size={14} /></button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600">
        <input type="checkbox" className="rounded accent-[#013486]" defaultChecked />
        {up.sendCredentials}
      </label>
      <label className="flex items-center gap-2 text-xs text-gray-600">
        <input type="checkbox" className="rounded accent-[#013486]" defaultChecked />
        {up.forceChangeOnLogin}
      </label>
      <button className="w-full py-2.5 bg-[#F35403] text-white rounded-lg text-sm font-medium hover:bg-[#F35403]/90 transition-colors">{up.confirm}</button>
    </div>
  );
}

function SuspendModal({ up }: { up: UP }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.suspendReason}</label>
        <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{up.suspendDuration}</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="7">{up.suspend7Days}</option>
          <option value="30">{up.suspend30Days}</option>
          <option value="90">{up.suspend90Days}</option>
          <option value="indefinite">{up.suspendIndefinite}</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-xs text-gray-600">
        <input type="checkbox" className="rounded accent-[#013486]" defaultChecked />
        {up.suspendNotify}
      </label>
      <button className="w-full py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
        <Ban size={14} />{up.confirm}
      </button>
    </div>
  );
}

/* ================================================================
   ACCOUNT DRAWER
================================================================ */

type DrawerTab = "account" | "security" | "permissions" | "connections" | "actions";

function AccountDrawer({
  account, onClose, up, onAction,
}: {
  account: UserAccount; onClose: () => void; up: UP;
  onAction: (action: string, a: UserAccount) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("account");
  const details = useMemo(() => getAccountDetails(account), [account]);

  const tabs: { key: DrawerTab; label: string; icon: React.ReactNode }[] = [
    { key: "account", label: up.tabAccount, icon: <Users size={12} /> },
    { key: "security", label: up.tabSecurity, icon: <Shield size={12} /> },
    { key: "permissions", label: up.tabPermissions, icon: <Lock size={12} /> },
    { key: "connections", label: up.tabConnections, icon: <Wifi size={12} /> },
    { key: "actions", label: up.tabActions, icon: <Activity size={12} /> },
  ];

  const deviceIcon = (d: string) => {
    if (d.includes("iPhone") || d.includes("Android") || d.includes("Mobile") || d.includes("App")) return <Smartphone size={12} />;
    return <Monitor size={12} />;
  };

  const logStatusColor: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    blocked: "bg-amber-100 text-amber-700",
  };
  const logStatusLabel: Record<string, string> = {
    success: up.logSuccess,
    failed: up.logFailed,
    blocked: up.logBlocked,
  };

  const pwStrengthColor: Record<string, string> = {
    strong: "bg-emerald-500", medium: "bg-amber-500", weak: "bg-red-500",
  };
  const pwStrengthLabel: Record<string, string> = {
    strong: up.passwordStrong, medium: up.passwordMedium, weak: up.passwordWeak,
  };

  const profileTypeLabel: Record<string, string> = {
    student: up.profileStudent, teacher: up.profileTeacher,
    parent: up.profileParent, staff: up.profileStaff,
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${avatarGradient[account.role]}`}>
                {account.firstName[0]}{account.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{account.firstName} {account.lastName}</h2>
                <p className="text-xs text-gray-500">{account.id} · {account.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>
          {/* Badges */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleColor[account.role]}`}>
              {roleIcon[account.role]} {getRoleLabel(account.role, up)}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[account.status]}`}>
              {getStatusLabel(account.status, up)}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${account.twoFA ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              {account.twoFA ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
              2FA: {account.twoFA ? up.twoFAActive : up.twoFAInactive}
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

          {/* -------- ACCOUNT -------- */}
          {tab === "account" && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Lock size={14} />{up.accountInfo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">{up.accountId}</span><p className="font-medium font-mono">{account.id}</p></div>
                  <div><span className="text-gray-500 text-xs">{up.emailLabel}</span><p className="font-medium">{account.email}</p></div>
                  <div><span className="text-gray-500 text-xs">{up.phoneLabel}</span><p className="font-medium">{account.phone}</p></div>
                  <div><span className="text-gray-500 text-xs">{up.roleLabel}</span>
                    <p className="font-medium flex items-center gap-1">{roleIcon[account.role]} {getRoleLabel(account.role, up)}</p>
                  </div>
                  <div><span className="text-gray-500 text-xs">{up.statusLabel}</span>
                    <p><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[account.status]}`}>{getStatusLabel(account.status, up)}</span></p>
                  </div>
                  <div><span className="text-gray-500 text-xs">{up.twoFALabel}</span>
                    <p className={`font-medium flex items-center gap-1 ${account.twoFA ? "text-emerald-600" : "text-gray-400"}`}>
                      {account.twoFA ? <><ShieldCheck size={12} />{up.twoFAActive}</> : <><ShieldOff size={12} />{up.twoFAInactive}</>}
                    </p>
                  </div>
                  <div><span className="text-gray-500 text-xs">{up.createdAt}</span><p className="font-medium">{account.createdAt}</p></div>
                  <div><span className="text-gray-500 text-xs">{up.lastLogin}</span><p className="font-medium">{account.lastLogin ?? up.neverConnected}</p></div>
                  <div><span className="text-gray-500 text-xs">{up.lastPasswordChange}</span><p className="font-medium">{account.lastPasswordChange}</p></div>
                  <div><span className="text-gray-500 text-xs">{up.activeSessions}</span>
                    <p className="font-medium">{account.activeSessions} {account.activeSessions <= 1 ? up.activeSuffix : up.activesSuffix}</p>
                  </div>
                </div>
              </div>

              {/* Linked profile */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Activity size={14} />{up.linkedProfile}</h3>
                {account.linkedProfileId ? (
                  <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${avatarGradient[account.role]}`}>
                        {roleIcon[account.role]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{account.linkedProfileId}</p>
                        <p className="text-[10px] text-gray-400">{up.profileType}: {profileTypeLabel[account.role === "admin_principal" || account.role === "admin_secondary" ? "staff" : account.role] ?? account.role}</p>
                      </div>
                    </div>
                    <button className="text-xs text-[#013486] font-medium hover:underline flex items-center gap-1"><Eye size={12} />{up.viewProfile}</button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">{up.noProfile}</p>
                )}
              </div>
            </>
          )}

          {/* -------- SECURITY -------- */}
          {tab === "security" && (
            <>
              {/* 2FA */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Fingerprint size={14} />{up.twoFAStatus}</h3>
                <p className="text-xs text-gray-500">{up.twoFADescription}</p>
                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    {account.twoFA ? <ShieldCheck size={18} className="text-emerald-500" /> : <ShieldOff size={18} className="text-gray-400" />}
                    <span className={`text-sm font-medium ${account.twoFA ? "text-emerald-600" : "text-gray-500"}`}>
                      {account.twoFA ? up.twoFAActive : up.twoFAInactive}
                    </span>
                  </div>
                  <button className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${account.twoFA ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                    {account.twoFA ? up.twoFADisable : up.twoFAEnable}
                  </button>
                </div>
              </div>

              {/* Password info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Key size={14} />{up.passwordInfo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">{up.passwordStrength}</span>
                    <p className="font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${pwStrengthColor[details.passwordStrength]}`} />
                      {pwStrengthLabel[details.passwordStrength]}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">{up.passwordLastChanged}</span>
                    <p className="font-medium">{account.lastPasswordChange}</p>
                  </div>
                </div>
                {/* Password strength bar */}
                <div className="flex gap-1">
                  <div className={`h-1.5 flex-1 rounded-full ${details.passwordStrength !== "weak" ? "bg-amber-400" : "bg-red-400"}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${details.passwordStrength === "strong" ? "bg-emerald-400" : details.passwordStrength === "medium" ? "bg-amber-400" : "bg-gray-200"}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${details.passwordStrength === "strong" ? "bg-emerald-400" : "bg-gray-200"}`} />
                </div>
              </div>

              {/* Active sessions */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Globe size={14} />{up.activeSessions} ({details.sessions.length})</h3>
                  {details.sessions.length > 0 && (
                    <button className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1"><LogOut size={12} />{up.revokeAllSessions}</button>
                  )}
                </div>
                {details.sessions.length === 0 ? (
                  <p className="text-sm text-gray-400">{up.noActiveSessions}</p>
                ) : (
                  <div className="space-y-2">
                    {details.sessions.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                        <div className="flex items-center gap-2.5">
                          {deviceIcon(s.device)}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-gray-800">{s.device}</p>
                              {s.current && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-medium">{up.currentSession}</span>}
                            </div>
                            <p className="text-[10px] text-gray-400">{s.ip} · {s.location}</p>
                            <p className="text-[10px] text-gray-400">{up.sessionStarted}: {s.startedAt}</p>
                          </div>
                        </div>
                        {!s.current && (
                          <button className="text-[10px] text-red-500 font-medium hover:underline">{up.revokeSession}</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* -------- PERMISSIONS -------- */}
          {tab === "permissions" && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Shield size={14} />{up.permissionsTitle}</h3>
              <p className="text-xs text-gray-400">{up.permissionDescription}</p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead><tr className="bg-white text-gray-500 border-b">
                    <th className="px-3 py-2 text-left font-medium">{up.permissionModule}</th>
                    <th className="px-3 py-2 text-center font-medium">{up.permissionRead}</th>
                    <th className="px-3 py-2 text-center font-medium">{up.permissionWrite}</th>
                    <th className="px-3 py-2 text-center font-medium">{up.permissionDelete}</th>
                    <th className="px-3 py-2 text-center font-medium">{up.permissionAdmin}</th>
                  </tr></thead>
                  <tbody>
                    {details.permissions.map((p, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-3 py-2 font-medium">{p.module}</td>
                        {[p.read, p.write, p.del, p.admin].map((v, j) => (
                          <td key={j} className="px-3 py-2 text-center">
                            {v ? <Check size={14} className="mx-auto text-emerald-500" /> : <X size={14} className="mx-auto text-gray-300" />}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------- CONNECTIONS -------- */}
          {tab === "connections" && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Clock size={14} />{up.connectionLogTitle}</h3>
              {details.connectionLogs.length === 0 ? (
                <p className="text-sm text-gray-400">{up.noConnectionLog}</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-white text-gray-500 border-b">
                      <th className="px-3 py-2 text-left font-medium">{up.logDate}</th>
                      <th className="px-3 py-2 text-left font-medium">{up.logDevice}</th>
                      <th className="px-3 py-2 text-left font-medium">{up.logIP}</th>
                      <th className="px-3 py-2 text-left font-medium">{up.logLocation}</th>
                      <th className="px-3 py-2 text-center font-medium">{up.logStatus}</th>
                    </tr></thead>
                    <tbody>
                      {details.connectionLogs.map((log, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{log.date}</td>
                          <td className="px-3 py-2">
                            <span className="flex items-center gap-1">{deviceIcon(log.device)}{log.device}</span>
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-500">{log.ip}</td>
                          <td className="px-3 py-2 text-gray-500 flex items-center gap-1"><MapPin size={10} />{log.location}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${logStatusColor[log.status]}`}>
                              {logStatusLabel[log.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* -------- ACTIONS -------- */}
          {tab === "actions" && (
            <div className="space-y-2">
              {[
                { key: "resetPassword", icon: <Key size={14} />, label: up.actionResetPassword, color: "text-amber-600" },
                { key: "changeRole", icon: <Shield size={14} />, label: up.actionChangeRole, color: "text-violet-600" },
                { key: account.twoFA ? "disable2FA" : "enable2FA", icon: account.twoFA ? <ShieldOff size={14} /> : <ShieldCheck size={14} />, label: account.twoFA ? up.actionDisable2FA : up.actionEnable2FA, color: account.twoFA ? "text-red-500" : "text-emerald-600" },
                { key: "message", icon: <MessageSquare size={14} />, label: up.actionSendMessage, color: "text-[#013486]" },
                { key: "revokeSessions", icon: <LogOut size={14} />, label: up.actionRevokeSessions, color: "text-orange-600" },
                { key: "exportData", icon: <Download size={14} />, label: up.actionExportData, color: "text-[#013486]" },
                ...(account.status === "active"
                  ? [
                      { key: "suspend", icon: <Ban size={14} />, label: up.actionSuspend, color: "text-red-500" },
                      { key: "disable", icon: <ToggleLeft size={14} />, label: up.actionDisable, color: "text-gray-600" },
                    ]
                  : account.status === "suspended"
                  ? [{ key: "reactivate", icon: <UserCheck size={14} />, label: up.actionReactivate, color: "text-emerald-600" }]
                  : account.status === "disabled"
                  ? [{ key: "activate", icon: <ToggleRight size={14} />, label: up.actionActivate, color: "text-emerald-600" }]
                  : [{ key: "activate", icon: <ToggleRight size={14} />, label: up.actionActivate, color: "text-emerald-600" }]
                ),
                { key: "delete", icon: <Trash2 size={14} />, label: up.actionDelete, color: "text-red-500" },
              ].map(a => (
                <button key={a.key} onClick={() => onAction(a.key, account)}
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

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const up = t.usersPage;

  /* --- state --- */
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filter2FA, setFilter2FA] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | "role" | "status" | "lastLogin">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerAccount, setDrawerAccount] = useState<UserAccount | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"create" | "message" | "changeRole" | "resetPassword" | "suspend" | null>(null);
  const [modalAccount, setModalAccount] = useState<UserAccount | null>(null);

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
  const filtered = useMemo(() => {
    let result = [...allAccounts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    }
    if (filterRole) result = result.filter(a => a.role === filterRole);
    if (filterStatus) result = result.filter(a => a.status === filterStatus);
    if (filter2FA === "on") result = result.filter(a => a.twoFA);
    if (filter2FA === "off") result = result.filter(a => !a.twoFA);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
      else if (sortKey === "role") cmp = a.role.localeCompare(b.role);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else cmp = (a.lastLogin ?? "").localeCompare(b.lastLogin ?? "");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [searchQuery, filterRole, filterStatus, filter2FA, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterRole, filterStatus, filter2FA]);

  /* --- stats --- */
  const countByStatus = (s: AccountStatus) => allAccounts.filter(a => a.status === s).length;
  const countByRole = (r: AccountRole) => allAccounts.filter(a => a.role === r).length;
  const count2FA = allAccounts.filter(a => a.twoFA).length;
  const connectedToday = allAccounts.filter(a => a.lastLogin === "2025-02-14").length;

  const roleChartData = [
    { name: up.roleAdminPrincipal, value: countByRole("admin_principal") },
    { name: up.roleAdminSecondary, value: countByRole("admin_secondary") },
    { name: up.roleTeacher, value: countByRole("teacher") },
    { name: up.roleStudent, value: countByRole("student") },
    { name: up.roleParent, value: countByRole("parent") },
    { name: up.roleStaff, value: countByRole("staff") },
  ].filter(d => d.value > 0);

  const statusChartData = [
    { name: up.statusActive, value: countByStatus("active") },
    { name: up.statusSuspended, value: countByStatus("suspended") },
    { name: up.statusDisabled, value: countByStatus("disabled") },
    { name: up.statusPending, value: countByStatus("pending") },
  ].filter(d => d.value > 0);

  const monthlyData = [
    { month: "Sep", count: 8 }, { month: "Oct", count: 3 }, { month: "Nov", count: 2 },
    { month: "Dec", count: 1 }, { month: "Jan", count: 2 }, { month: "Fev", count: 1 },
  ];

  const securityData = [
    { name: up.withTwoFA, value: count2FA },
    { name: up.withoutTwoFA, value: allAccounts.length - count2FA },
  ];

  /* --- selection --- */
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(a => a.id)));
  };

  /* --- sort toggle --- */
  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  /* --- export --- */
  const doExport = (type: "pdf" | "excel" | "csv" | "print") => {
    setExportOpen(false);
    const headers = [up.colUser, up.colEmail, up.colRole, up.colStatus, up.col2FA, up.colLastLogin];
    if (type === "pdf" || type === "print") {
      const html = buildPrintableHTML(filtered, headers, up.exportTitle, up.exportGenerated, up);
      const w = window.open("", "_blank");
      if (w) { w.document.write(html); w.document.close(); if (type === "print") setTimeout(() => w.print(), 300); }
    } else if (type === "csv") {
      const csv = [headers.join(","), ...filtered.map(a => [
        `${a.firstName} ${a.lastName}`, a.email, getRoleLabel(a.role, up), getStatusLabel(a.status, up), a.twoFA ? "✓" : "✗", a.lastLogin ?? "-",
      ].join(","))].join("\n");
      downloadBlob(csv, "comptes_educa.csv", "text/csv");
    } else {
      const html = `<table border="1"><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>${filtered.map(a => `<tr><td>${a.firstName} ${a.lastName}</td><td>${a.email}</td><td>${getRoleLabel(a.role, up)}</td><td>${getStatusLabel(a.status, up)}</td><td>${a.twoFA ? "✓" : "✗"}</td><td>${a.lastLogin ?? "-"}</td></tr>`).join("")}</table>`;
      downloadBlob(html, "comptes_educa.xls", "application/vnd.ms-excel");
    }
  };

  /* --- drawer action handler --- */
  const handleDrawerAction = (action: string, account: UserAccount) => {
    setDrawerAccount(null);
    setModalAccount(account);
    if (action === "message") setModalType("message");
    else if (action === "changeRole") setModalType("changeRole");
    else if (action === "resetPassword") setModalType("resetPassword");
    else if (action === "suspend") setModalType("suspend");
    else if (action === "delete") {
      if (confirm(up.confirmDelete)) { /* mock delete */ }
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.users.title}
        description={t.pages.admin.users.desc}
        icon={<Users size={20} />}
      />

      {/* ====== STAT CARDS ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: up.totalAccounts, value: allAccounts.length, icon: <Users size={18} />, bg: "bg-[#013486]/5", text: "text-[#013486]" },
          { label: up.activeAccounts, value: countByStatus("active"), icon: <UserCheck size={18} />, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: up.suspendedAccounts, value: countByStatus("suspended"), icon: <Ban size={18} />, bg: "bg-red-50", text: "text-red-600" },
          { label: up.pendingAccounts, value: countByStatus("pending"), icon: <Clock size={18} />, bg: "bg-amber-50", text: "text-amber-600" },
          { label: up.disabledAccounts, value: countByStatus("disabled"), icon: <ToggleLeft size={18} />, bg: "bg-gray-100", text: "text-gray-500" },
          { label: up.twoFAEnabled, value: count2FA, icon: <Fingerprint size={18} />, bg: "bg-violet-50", text: "text-violet-600" },
          { label: up.connectedToday, value: connectedToday, icon: <Wifi size={18} />, bg: "bg-[#F35403]/5", text: "text-[#F35403]" },
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
        {/* Role distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{up.roleDistribution}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {roleChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Status distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{up.statusDistribution}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusChartData.map((_, i) => <Cell key={i} fill={["#10B981", "#EF4444", "#9CA3AF", "#F59E0B"][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Security overview (2FA) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{up.securityOverview}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={securityData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Monthly registrations */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{up.monthlyRegistrations}</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#013486" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ====== FILTERS ====== */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">{up.filterTitle}</span>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} {filtered.length === 1 ? up.result : up.results}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Role */}
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{up.allRoles}</option>
            <option value="admin_principal">{up.roleAdminPrincipal}</option>
            <option value="admin_secondary">{up.roleAdminSecondary}</option>
            <option value="teacher">{up.roleTeacher}</option>
            <option value="student">{up.roleStudent}</option>
            <option value="parent">{up.roleParent}</option>
            <option value="staff">{up.roleStaff}</option>
          </select>
          {/* Status */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{up.allStatuses}</option>
            <option value="active">{up.statusActive}</option>
            <option value="suspended">{up.statusSuspended}</option>
            <option value="disabled">{up.statusDisabled}</option>
            <option value="pending">{up.statusPending}</option>
          </select>
          {/* 2FA */}
          <select value={filter2FA} onChange={e => setFilter2FA(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option value="">{up.all2FA}</option>
            <option value="on">{up.twoFAActive}</option>
            <option value="off">{up.twoFAInactive}</option>
          </select>
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={up.searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg" />
          </div>
          {/* Reset */}
          <button onClick={() => { setSearchQuery(""); setFilterRole(""); setFilterStatus(""); setFilter2FA(""); }}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">{up.reset}</button>
          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button onClick={() => setExportOpen(!exportOpen)} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <Download size={13} />{up.export}<ChevronDown size={12} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 min-w-[160px]">
                <button onClick={() => doExport("pdf")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><FileText size={12} />{up.exportPDF}</button>
                <button onClick={() => doExport("excel")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><FileSpreadsheet size={12} />{up.exportExcel}</button>
                <button onClick={() => doExport("csv")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><FileText size={12} />{up.exportCSV}</button>
                <button onClick={() => doExport("print")} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Printer size={12} />{up.print}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== BULK SELECTION BAR ====== */}
      {selectedIds.size > 0 && (
        <div className="bg-[#013486] text-white rounded-xl p-3 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm font-medium">{selectedIds.size} {up.selected}</span>
          <div className="flex gap-2 flex-wrap">
            <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1"><UserCheck size={12} />{up.bulkActivate}</button>
            <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1"><Ban size={12} />{up.bulkSuspend}</button>
            <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1"><LogOut size={12} />{up.bulkRevokeSessions}</button>
            <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-1"><Download size={12} />{up.bulkExport}</button>
            <button className="text-xs px-3 py-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 flex items-center gap-1"><Trash2 size={12} />{up.bulkDelete}</button>
          </div>
        </div>
      )}

      {/* ====== TABLE ====== */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{up.listTitle}</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>{up.itemsPerPage}:</span>
              <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-200 rounded px-1.5 py-0.5 text-xs">
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
              </select>
            </div>
            <button onClick={() => { setModalAccount(null); setModalType("create"); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#013486] text-white text-xs font-medium rounded-lg hover:bg-[#013486]/90">
              <UserPlus size={14} />{up.createAccount}
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
                  <span className="flex items-center gap-1">{up.colUser}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{up.colEmail}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("role")}>
                  <span className="flex items-center gap-1">{up.colRole}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("status")}>
                  <span className="flex items-center gap-1">{up.colStatus}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{up.col2FA}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 cursor-pointer" onClick={() => toggleSort("lastLogin")}>
                  <span className="flex items-center gap-1">{up.colLastLogin}<ArrowUpDown size={10} /></span>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{up.colSessions}</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">{up.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">{up.noResults}</td></tr>
              ) : paginated.map((account) => (
                <tr key={account.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(account.id)} className="text-gray-400 hover:text-[#013486]">
                      {selectedIds.has(account.id) ? <CheckSquare size={16} className="text-[#013486]" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${avatarGradient[account.role]}`}>
                        {account.firstName[0]}{account.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{account.firstName} {account.lastName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{account.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{account.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColor[account.role]}`}>
                      {roleIcon[account.role]} {getRoleLabel(account.role, up)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[account.status]}`}>
                      {getStatusLabel(account.status, up)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {account.twoFA ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600"><ShieldCheck size={14} /></span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-300"><ShieldOff size={14} /></span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {account.lastLogin ? (
                      <span className="flex items-center gap-1"><Clock size={10} />{account.lastLogin}</span>
                    ) : (
                      <span className="text-gray-300">{up.neverConnected}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {account.activeSessions > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-medium">
                        <Globe size={10} />{account.activeSessions}
                      </span>
                    ) : (
                      <span className="text-gray-300">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDrawerAccount(account)} className="p-1.5 rounded-lg hover:bg-[#013486]/10 text-[#013486]"><Eye size={14} /></button>
                      <div className="relative">
                        <button onClick={() => setActionMenuId(actionMenuId === account.id ? null : account.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal size={14} /></button>
                        {actionMenuId === account.id && (
                          <div ref={actionMenuRef} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 min-w-[220px]">
                            <button onClick={() => { setActionMenuId(null); setDrawerAccount(account); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Eye size={12} />Détails du compte</button>
                            <button onClick={() => { setActionMenuId(null); setModalAccount(account); setModalType("resetPassword"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Key size={12} />{up.actionResetPassword}</button>
                            <button onClick={() => { setActionMenuId(null); setModalAccount(account); setModalType("changeRole"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><Shield size={12} />{up.actionChangeRole}</button>
                            <button onClick={() => { setActionMenuId(null); setModalAccount(account); setModalType("message"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"><MessageSquare size={12} />{up.actionSendMessage}</button>
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => { setActionMenuId(null); setModalAccount(account); setModalType("suspend"); }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2 text-amber-600"><Ban size={12} />{up.actionSuspend}</button>
                            <button onClick={() => { setActionMenuId(null); if (confirm(up.confirmDelete)) { /* mock */ } }} className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2 text-red-500"><Trash2 size={12} />{up.actionDelete}</button>
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
            {up.showing} {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} {up.on} {filtered.length} {up.accounts}
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
      {drawerAccount && (
        <AccountDrawer account={drawerAccount} onClose={() => setDrawerAccount(null)} up={up} onAction={handleDrawerAction} />
      )}

      {/* ====== MODALS ====== */}
      <Modal open={modalType === "create"} onClose={() => setModalType(null)} title={up.createAccountTitle}>
        <CreateAccountModal up={up} />
      </Modal>
      <Modal open={modalType === "message" && !!modalAccount} onClose={() => setModalType(null)} title={up.messageTitle}>
        {modalAccount && <MessageModal account={modalAccount} up={up} />}
      </Modal>
      <Modal open={modalType === "changeRole" && !!modalAccount} onClose={() => setModalType(null)} title={up.changeRoleTitle}>
        {modalAccount && <ChangeRoleModal account={modalAccount} up={up} />}
      </Modal>
      <Modal open={modalType === "resetPassword"} onClose={() => setModalType(null)} title={up.resetPasswordTitle}>
        <ResetPasswordModal up={up} />
      </Modal>
      <Modal open={modalType === "suspend"} onClose={() => setModalType(null)} title={up.suspendTitle}>
        <SuspendModal up={up} />
      </Modal>
    </div>
  );
}
