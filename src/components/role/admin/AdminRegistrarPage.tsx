"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  FileText, Upload, Search, Plus, X, Eye, Edit3, Trash2,
  CheckCircle, XCircle, Clock, AlertTriangle, Download,
  ChevronLeft, ChevronRight, Printer, ScanLine, Bell,
  Shield, Users, FolderOpen, Camera, Mail, Cloud, FilePlus,
  Filter, QrCode, Share2, Archive,
} from "lucide-react";

/* ─── type alias ─── */
type RP = ReturnType<typeof useTranslation>["t"]["registrarPage"];

/* ─── palette ─── */
const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899"];
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  validated: { bg: "bg-green-50", text: "text-green-600" },
  pending: { bg: "bg-yellow-50", text: "text-yellow-600" },
  illegible: { bg: "bg-orange-50", text: "text-orange-600" },
  rejected: { bg: "bg-red-50", text: "text-red-600" },
  expired: { bg: "bg-gray-100", text: "text-gray-600" },
};

/* ─── types ─── */
type ViewMode = "overview" | "students" | "teachers" | "staff" | "parents" | "scan" | "print" | "alerts" | "audit";
type DocStatus = "validated" | "pending" | "illegible" | "rejected" | "expired";
type PersonType = "student" | "teacher" | "staff" | "parent";
type DocCategory = "identity" | "legal" | "medical" | "academic" | "administrative" | "hr" | "financial";

interface Document {
  id: string;
  personId: string;
  personName: string;
  personType: PersonType;
  className?: string;
  docName: string;
  category: DocCategory;
  status: DocStatus;
  uploadDate: string;
  expiryDate?: string;
  fileSize: string;
  uploadedBy: string;
  version: number;
}

interface Alert {
  id: string;
  type: "missing" | "expired" | "incomplete" | "renewal";
  personName: string;
  personType: PersonType;
  className?: string;
  docName: string;
  urgency: "high" | "medium" | "low";
  date: string;
  resolved: boolean;
}

interface AuditEntry {
  id: string;
  action: "created" | "modified" | "deleted" | "viewed" | "validated" | "rejected";
  docName: string;
  personName: string;
  performedBy: string;
  date: string;
  time: string;
  ip: string;
}

/* ─── mock data ─── */
const STUDENTS_LIST = [
  "Jean-Baptiste Pierre", "Marie-Claire Joseph", "Daphney Augustin", "Roberto Charles",
  "Wisline François", "Kervens Bien-Aimé", "Stéphanie Paul", "Jean-Robert Noël",
  "Fabiola Destin", "Claudia Michel", "Patrick Étienne", "Sandra Germain",
];
const TEACHERS_LIST = ["M. Dumas", "Mme Laurent", "M. Casimir", "Mme Romain", "M. Victor", "Mme Jean-Charles"];
const STAFF_LIST = ["P. Augustin", "S. Mercier", "R. Désir", "T. Benoît"];
const PARENTS_LIST = ["Mme Pierre", "M. Joseph", "Mme Augustin", "M. Charles", "Mme François"];
const CLASSES = ["6ème A", "6ème B", "5ème A", "5ème B", "4ème A", "3ème A"];

const STUDENT_DOC_TYPES = ["birthCertificate", "officialPhoto", "idCard", "parentalAuth", "emergencyContacts", "medicalCert", "vaccinations", "previousTranscripts", "signedEnrollment", "signedRules", "exitAuth", "imageAuth"];
const TEACHER_DOC_TYPES = ["diplomas", "teachingCert", "professionalCV", "teacherIdCard", "criminalRecord", "workContract", "professionalEvals"];
const STAFF_DOC_TYPES = ["staffContract", "staffIdCard", "staffDiplomas", "adminAuthorizations", "staffEvals", "hrDocuments"];
const PARENT_DOC_TYPES = ["parentIdCard", "legalAuthorizations", "procurations", "financialCommitment"];

const DOC_CATEGORIES: Record<string, DocCategory> = {
  birthCertificate: "identity", officialPhoto: "identity", idCard: "identity",
  parentalAuth: "legal", emergencyContacts: "legal", guardianshipDoc: "legal",
  medicalCert: "medical", vaccinations: "medical", medicalConditions: "medical",
  previousTranscripts: "academic", transferCert: "academic",
  signedEnrollment: "administrative", signedRules: "administrative", exitAuth: "administrative", imageAuth: "administrative",
  diplomas: "academic", teachingCert: "academic", professionalCV: "hr",
  teacherIdCard: "identity", criminalRecord: "legal", workContract: "hr", professionalEvals: "hr",
  staffContract: "hr", staffIdCard: "identity", staffDiplomas: "academic",
  adminAuthorizations: "administrative", staffEvals: "hr", hrDocuments: "hr",
  parentIdCard: "identity", legalAuthorizations: "legal", procurations: "legal", financialCommitment: "financial",
};

function generateDocuments(): Document[] {
  const docs: Document[] = [];
  let id = 1;
  const statuses: DocStatus[] = ["validated", "validated", "validated", "pending", "expired"];

  STUDENTS_LIST.forEach((name, si) => {
    STUDENT_DOC_TYPES.forEach((dt, di) => {
      if ((si + di) % 3 !== 2) {
        docs.push({
          id: `DOC-${String(id++).padStart(4, "0")}`,
          personId: `STD-${si + 1}`,
          personName: name,
          personType: "student",
          className: CLASSES[si % CLASSES.length],
          docName: dt,
          category: DOC_CATEGORIES[dt] || "administrative",
          status: statuses[(si + di) % statuses.length],
          uploadDate: `2024-09-${String(1 + (di % 28)).padStart(2, "0")}`,
          expiryDate: dt === "medicalCert" || dt === "vaccinations" ? `2025-09-${String(1 + di).padStart(2, "0")}` : undefined,
          fileSize: `${120 + (si * 30 + di * 15) % 900} KB`,
          uploadedBy: "Admin",
          version: 1,
        });
      }
    });
  });

  TEACHERS_LIST.forEach((name, ti) => {
    TEACHER_DOC_TYPES.forEach((dt, di) => {
      docs.push({
        id: `DOC-${String(id++).padStart(4, "0")}`,
        personId: `TCH-${ti + 1}`,
        personName: name,
        personType: "teacher",
        docName: dt,
        category: DOC_CATEGORIES[dt] || "hr",
        status: statuses[(ti + di) % statuses.length],
        uploadDate: `2024-08-${String(15 + di).padStart(2, "0")}`,
        fileSize: `${200 + (ti * 50 + di * 25) % 600} KB`,
        uploadedBy: "RH",
        version: 1,
      });
    });
  });

  STAFF_LIST.forEach((name, si) => {
    STAFF_DOC_TYPES.forEach((dt, di) => {
      docs.push({
        id: `DOC-${String(id++).padStart(4, "0")}`,
        personId: `STF-${si + 1}`,
        personName: name,
        personType: "staff",
        docName: dt,
        category: DOC_CATEGORIES[dt] || "hr",
        status: statuses[(si + di) % statuses.length],
        uploadDate: `2024-08-${String(10 + di).padStart(2, "0")}`,
        fileSize: `${150 + si * 40} KB`,
        uploadedBy: "Direction",
        version: 1,
      });
    });
  });

  PARENTS_LIST.forEach((name, pi) => {
    PARENT_DOC_TYPES.forEach((dt, di) => {
      if ((pi + di) % 4 !== 3) {
        docs.push({
          id: `DOC-${String(id++).padStart(4, "0")}`,
          personId: `PAR-${pi + 1}`,
          personName: name,
          personType: "parent",
          docName: dt,
          category: DOC_CATEGORIES[dt] || "legal",
          status: statuses[(pi + di) % statuses.length],
          uploadDate: `2024-09-${String(5 + di).padStart(2, "0")}`,
          fileSize: `${100 + pi * 35} KB`,
          uploadedBy: "Admin",
          version: 1,
        });
      }
    });
  });

  return docs;
}

function generateAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const types: Alert["type"][] = ["missing", "expired", "incomplete", "renewal"];
  STUDENTS_LIST.slice(0, 6).forEach((name, i) => {
    alerts.push({
      id: `ALR-${String(i + 1).padStart(3, "0")}`,
      type: types[i % 4],
      personName: name,
      personType: "student",
      className: CLASSES[i % CLASSES.length],
      docName: STUDENT_DOC_TYPES[i % STUDENT_DOC_TYPES.length],
      urgency: i < 2 ? "high" : i < 4 ? "medium" : "low",
      date: `2025-01-${String(10 + i).padStart(2, "0")}`,
      resolved: i > 4,
    });
  });
  TEACHERS_LIST.slice(0, 3).forEach((name, i) => {
    alerts.push({
      id: `ALR-${String(7 + i).padStart(3, "0")}`,
      type: i === 0 ? "expired" : "renewal",
      personName: name,
      personType: "teacher",
      docName: TEACHER_DOC_TYPES[i % TEACHER_DOC_TYPES.length],
      urgency: i === 0 ? "high" : "medium",
      date: `2025-01-${String(5 + i).padStart(2, "0")}`,
      resolved: false,
    });
  });
  return alerts;
}

function generateAudit(): AuditEntry[] {
  const entries: AuditEntry[] = [];
  const actions: AuditEntry["action"][] = ["created", "viewed", "validated", "modified", "rejected", "deleted"];
  const users = ["Admin Principal", "Secrétaire", "Directeur", "RH"];
  for (let i = 0; i < 25; i++) {
    entries.push({
      id: `AUD-${String(i + 1).padStart(4, "0")}`,
      action: actions[i % actions.length],
      docName: STUDENT_DOC_TYPES[i % STUDENT_DOC_TYPES.length],
      personName: STUDENTS_LIST[i % STUDENTS_LIST.length],
      performedBy: users[i % users.length],
      date: `2025-01-${String(20 - (i % 18)).padStart(2, "0")}`,
      time: `${8 + (i % 10)}:${String((i * 7) % 60).padStart(2, "0")}`,
      ip: `192.168.1.${10 + (i % 40)}`,
    });
  }
  return entries;
}

/* ─── Component ─── */
export default function AdminRegistrarPage() {
  const { t } = useTranslation();
  const rp: RP = t.registrarPage;

  /* state */
  const [view, setView] = useState<ViewMode>("overview");
  const [documents] = useState<Document[]>(generateDocuments);
  const [alerts] = useState<Alert[]>(generateAlerts);
  const [auditLog] = useState<AuditEntry[]>(generateAudit);

  /* filters */
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  /* modals */
  const [showUpload, setShowUpload] = useState(false);
  const [drawerDoc, setDrawerDoc] = useState<Document | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* ─── helpers ─── */
  const docNameLabel = (key: string): string => (rp as Record<string, string>)[key] ?? key;
  const catLabel = (c: DocCategory): string => {
    const map: Record<DocCategory, string> = { identity: rp.catIdentity, legal: rp.catLegal, medical: rp.catMedical, academic: rp.catAcademic, administrative: rp.catAdministrative, hr: rp.catHR, financial: rp.catFinancial };
    return map[c];
  };
  const statusLabel = (s: DocStatus): string => {
    const map: Record<DocStatus, string> = { validated: rp.statusValidated, pending: rp.statusPending, illegible: rp.statusIllegible, rejected: rp.statusRejected, expired: rp.statusExpired };
    return map[s];
  };
  const personTypeLabel = (p: PersonType) => {
    const map: Record<PersonType, string> = { student: rp.student, teacher: rp.teacher, staff: rp.staff, parent: rp.parent };
    return map[p];
  };

  /* ─── filtered docs by person type ─── */
  const getFilteredDocs = (personType?: PersonType) => {
    let data = documents;
    if (personType) data = data.filter(d => d.personType === personType);
    if (filterCategory !== "all") data = data.filter(d => d.category === filterCategory);
    if (filterStatus !== "all") data = data.filter(d => d.status === filterStatus);
    if (searchQ) data = data.filter(d => d.personName.toLowerCase().includes(searchQ.toLowerCase()) || docNameLabel(d.docName).toLowerCase().includes(searchQ.toLowerCase()));
    return data;
  };

  const currentDocs = getFilteredDocs(
    view === "students" ? "student" : view === "teachers" ? "teacher" : view === "staff" ? "staff" : view === "parents" ? "parent" : undefined
  );
  const totalPages = Math.ceil(currentDocs.length / perPage);
  const paginatedDocs = currentDocs.slice((page - 1) * perPage, page * perPage);

  /* ─── dashboard data ─── */
  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    documents.forEach(d => { byStatus[d.status] = (byStatus[d.status] || 0) + 1; });
    const byCat: Record<string, number> = {};
    documents.forEach(d => { byCat[d.category] = (byCat[d.category] || 0) + 1; });
    return {
      total: documents.length,
      validated: byStatus.validated || 0,
      pending: byStatus.pending || 0,
      expired: byStatus.expired || 0,
      rejected: byStatus.rejected || 0,
      illegible: byStatus.illegible || 0,
      byStatus: Object.entries(byStatus).map(([k, v]) => ({ name: statusLabel(k as DocStatus), value: v })),
      byCategory: Object.entries(byCat).map(([k, v]) => ({ name: catLabel(k as DocCategory), value: v })),
      completionRate: Math.round((byStatus.validated || 0) / documents.length * 100),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, rp]);

  /* ─── person completion rates ─── */
  const getPersonCompletion = (personType: PersonType) => {
    const docs = documents.filter(d => d.personType === personType);
    const validated = docs.filter(d => d.status === "validated").length;
    return docs.length > 0 ? Math.round(validated / docs.length * 100) : 0;
  };

  /* ─── tabs ─── */
  const tabs: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: rp.tabOverview, icon: <FolderOpen className="w-4 h-4" /> },
    { key: "students", label: rp.tabStudents, icon: <Users className="w-4 h-4" /> },
    { key: "teachers", label: rp.tabTeachers, icon: <Users className="w-4 h-4" /> },
    { key: "staff", label: rp.tabStaff, icon: <Users className="w-4 h-4" /> },
    { key: "parents", label: rp.tabParents, icon: <Users className="w-4 h-4" /> },
    { key: "scan", label: rp.tabScan, icon: <ScanLine className="w-4 h-4" /> },
    { key: "print", label: rp.tabPrint, icon: <Printer className="w-4 h-4" /> },
    { key: "alerts", label: rp.tabAlerts, icon: <Bell className="w-4 h-4" /> },
    { key: "audit", label: rp.tabAudit, icon: <Shield className="w-4 h-4" /> },
  ];

  /* ─── render document table ─── */
  const renderDocTable = (personType?: PersonType) => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }} placeholder={rp.search} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
          </div>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="all">{rp.filterByCategory}</option>
            {(["identity", "legal", "medical", "academic", "administrative", "hr", "financial"] as DocCategory[]).map(c => <option key={c} value={c}>{catLabel(c)}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="all">{rp.filterByStatus}</option>
            {(["validated", "pending", "expired", "rejected", "illegible"] as DocStatus[]).map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 bg-[#013486] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#012a6d] transition-colors">
            <Upload className="w-4 h-4" />{rp.uploadFile}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                <th className="text-left px-4 py-3">ID</th>
                {!personType && <th className="text-left px-4 py-3">{rp.type}</th>}
                <th className="text-left px-4 py-3">{rp.name}</th>
                {personType === "student" && <th className="text-left px-4 py-3">{rp.class}</th>}
                <th className="text-left px-4 py-3">Document</th>
                <th className="text-left px-4 py-3">{rp.category}</th>
                <th className="text-left px-4 py-3">{rp.status}</th>
                <th className="text-left px-4 py-3">{rp.date}</th>
                <th className="text-left px-4 py-3">{rp.actions}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocs.map(doc => (
                <tr key={doc.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{doc.id}</td>
                  {!personType && <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{personTypeLabel(doc.personType)}</span></td>}
                  <td className="px-4 py-3 font-medium text-gray-900">{doc.personName}</td>
                  {personType === "student" && <td className="px-4 py-3 text-gray-600 text-xs">{doc.className}</td>}
                  <td className="px-4 py-3 text-gray-800">{docNameLabel(doc.docName)}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg">{catLabel(doc.category)}</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${STATUS_COLORS[doc.status]?.bg} ${STATUS_COLORS[doc.status]?.text}`}>
                      {statusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{doc.uploadDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setDrawerDoc(doc)} className="p-1.5 hover:bg-gray-100 rounded-lg" title={rp.viewDetails}><Eye className="w-4 h-4 text-gray-500" /></button>
                      {doc.status === "pending" && <>
                        <button onClick={() => showToast(rp.documentValidated)} className="p-1.5 hover:bg-green-50 rounded-lg" title={rp.validate}><CheckCircle className="w-4 h-4 text-green-500" /></button>
                        <button onClick={() => showToast(rp.documentRejected)} className="p-1.5 hover:bg-red-50 rounded-lg" title={rp.reject}><XCircle className="w-4 h-4 text-red-400" /></button>
                      </>}
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg" title={rp.download}><Download className="w-4 h-4 text-blue-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">{rp.showing} {(page - 1) * perPage + 1}-{Math.min(page * perPage, currentDocs.length)} {rp.of} {currentDocs.length}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-3 py-1.5 text-xs font-medium">{rp.page} {page}/{totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top">
          <CheckCircle className="w-5 h-5" />{toast}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => { setView(tab.key); setPage(1); setSearchQ(""); setFilterCategory("all"); setFilterStatus("all"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${view === tab.key ? "bg-[#013486] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════ OVERVIEW ════════════════════════ */}
      {view === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: rp.totalDocuments, value: stats.total, color: "bg-blue-50 text-blue-700", icon: <FileText className="w-5 h-5" /> },
              { label: rp.validated, value: stats.validated, color: "bg-green-50 text-green-700", icon: <CheckCircle className="w-5 h-5" /> },
              { label: rp.pending, value: stats.pending, color: "bg-yellow-50 text-yellow-700", icon: <Clock className="w-5 h-5" /> },
              { label: rp.expired, value: stats.expired, color: "bg-gray-100 text-gray-700", icon: <AlertTriangle className="w-5 h-5" /> },
              { label: rp.rejected, value: stats.rejected, color: "bg-red-50 text-red-700", icon: <XCircle className="w-5 h-5" /> },
              { label: rp.completionRate, value: `${stats.completionRate}%`, color: "bg-purple-50 text-purple-700", icon: <Shield className="w-5 h-5" /> },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 ${s.color}`}>
                <div className="flex items-center gap-2 mb-2 opacity-80">{s.icon}<span className="text-xs font-medium">{s.label}</span></div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{rp.documentsByCategory}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.byCategory}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#013486" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{rp.documentsByStatus}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.byStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {stats.byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion by person type */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["student", "teacher", "staff", "parent"] as PersonType[]).map(pt => {
              const rate = getPersonCompletion(pt);
              const count = documents.filter(d => d.personType === pt).length;
              return (
                <div key={pt} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{personTypeLabel(pt)}</h3>
                    <span className={`text-lg font-bold ${rate >= 80 ? "text-green-600" : rate >= 50 ? "text-yellow-600" : "text-red-600"}`}>{rate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className={`h-2 rounded-full ${rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${rate}%` }} />
                  </div>
                  <p className="text-xs text-gray-500">{count} {rp.totalDocuments.toLowerCase()}</p>
                </div>
              );
            })}
          </div>

          {/* Recent uploads */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{rp.recentUploads}</h3>
            <div className="space-y-3">
              {documents.slice(0, 8).map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#013486]/10 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-[#013486]" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{docNameLabel(doc.docName)}</p>
                      <p className="text-xs text-gray-500">{doc.personName} &middot; {doc.fileSize}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_COLORS[doc.status]?.bg} ${STATUS_COLORS[doc.status]?.text}`}>{statusLabel(doc.status)}</span>
                    <p className="text-xs text-gray-400 mt-1">{doc.uploadDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ PERSON TABS ════════════════════════ */}
      {(view === "students" || view === "teachers" || view === "staff" || view === "parents") && renderDocTable(
        view === "students" ? "student" : view === "teachers" ? "teacher" : view === "staff" ? "staff" : "parent"
      )}

      {/* ════════════════════════ SCAN ════════════════════════ */}
      {view === "scan" && (
        <div className="space-y-6">
          {/* Scan workflow */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{rp.scanTitle}</h2>

            {/* Steps */}
            <div className="grid md:grid-cols-6 gap-4 mb-8">
              {[rp.step1, rp.step2, rp.step3, rp.step4, rp.step5, rp.step6].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-[#013486] text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">{i + 1}</div>
                  <p className="text-xs text-gray-600">{step}</p>
                </div>
              ))}
            </div>

            {/* Scan form */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{rp.selectPerson}</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    <optgroup label={rp.student}>{STUDENTS_LIST.map(s => <option key={s}>{s}</option>)}</optgroup>
                    <optgroup label={rp.teacher}>{TEACHERS_LIST.map(s => <option key={s}>{s}</option>)}</optgroup>
                    <optgroup label={rp.staff}>{STAFF_LIST.map(s => <option key={s}>{s}</option>)}</optgroup>
                    <optgroup label={rp.parent}>{PARENTS_LIST.map(s => <option key={s}>{s}</option>)}</optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{rp.selectDocType}</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {STUDENT_DOC_TYPES.map(dt => <option key={dt} value={dt}>{docNameLabel(dt)}</option>)}
                  </select>
                </div>

                {/* Scan modes */}
                <div className="space-y-2">
                  {[
                    { label: rp.scanToComputer, icon: <ScanLine className="w-4 h-4" />, desc: "" },
                    { label: rp.scanToFolder, icon: <FolderOpen className="w-4 h-4" />, desc: "" },
                    { label: rp.scanToEmail, icon: <Mail className="w-4 h-4" />, desc: "" },
                  ].map((mode, i) => (
                    <button key={i} className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-[#013486] hover:bg-blue-50 transition-colors text-left">
                      <div className="w-8 h-8 bg-[#013486]/10 rounded-lg flex items-center justify-center text-[#013486]">{mode.icon}</div>
                      <span className="text-sm font-medium text-gray-800">{mode.label}</span>
                    </button>
                  ))}
                </div>

                <button onClick={() => showToast(rp.uploadSuccess)} className="w-full bg-[#013486] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#012a6d] flex items-center justify-center gap-2">
                  <ScanLine className="w-4 h-4" />{rp.scanNow}
                </button>
              </div>

              {/* Preview area */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
                <ScanLine className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-sm text-gray-500 mb-2">{rp.preview}</p>
                <p className="text-xs text-gray-400">{rp.dragAndDrop}</p>
              </div>
            </div>
          </div>

          {/* Image processing options */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{rp.autoEnhance}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: rp.autoEnhance, icon: "✨" },
                { label: rp.removeShadows, icon: "🌓" },
                { label: rp.autoStraighten, icon: "📐" },
                { label: rp.optimizeContrast, icon: "🎨" },
                { label: rp.smartCompression, icon: "📦" },
                { label: rp.convertToPdf, icon: "📄" },
              ].map((opt, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-xs text-gray-700">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* OCR */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{rp.ocrTitle}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: rp.searchableDocument, icon: <Search className="w-5 h-5" /> },
                { label: rp.textExtraction, icon: <FileText className="w-5 h-5" /> },
                { label: rp.autoTypeDetection, icon: <Filter className="w-5 h-5" /> },
                { label: rp.smartIndexing, icon: <Archive className="w-5 h-5" /> },
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="text-purple-600">{feat.icon}</div>
                  <span className="text-sm font-medium text-purple-800">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ PRINT ════════════════════════ */}
      {view === "print" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{rp.printTitle}</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: rp.officialCertificates, icon: <FileText className="w-6 h-6" />, color: "bg-blue-50 text-blue-700" },
                { label: rp.contracts, icon: <FileText className="w-6 h-6" />, color: "bg-green-50 text-green-700" },
                { label: rp.idCards, icon: <Users className="w-6 h-6" />, color: "bg-purple-50 text-purple-700" },
                { label: rp.reportCards, icon: <FileText className="w-6 h-6" />, color: "bg-orange-50 text-orange-700" },
                { label: rp.attestations, icon: <FileText className="w-6 h-6" />, color: "bg-yellow-50 text-yellow-700" },
                { label: rp.completeFiles, icon: <FolderOpen className="w-6 h-6" />, color: "bg-red-50 text-red-700" },
              ].map((item, i) => (
                <div key={i} className={`rounded-2xl p-6 ${item.color} cursor-pointer hover:shadow-md transition-shadow`}>
                  <div className="mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-sm mb-4">{item.label}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => showToast(rp.exportPdf)} className="flex items-center gap-1 text-xs font-medium bg-white/60 hover:bg-white px-3 py-1.5 rounded-lg">
                      <Download className="w-3.5 h-3.5" />{rp.exportPdf}
                    </button>
                    <button className="flex items-center gap-1 text-xs font-medium bg-white/60 hover:bg-white px-3 py-1.5 rounded-lg">
                      <Printer className="w-3.5 h-3.5" />{rp.printNow}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced printing features */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{rp.electronicSignature}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: rp.printPreview, icon: <Eye className="w-5 h-5" /> },
                { label: rp.qrVerification, icon: <QrCode className="w-5 h-5" /> },
                { label: rp.secureWatermark, icon: <Shield className="w-5 h-5" /> },
                { label: rp.batchPrint, icon: <Printer className="w-5 h-5" /> },
                { label: rp.electronicSignature, icon: <Edit3 className="w-5 h-5" /> },
                { label: rp.secureSharing, icon: <Share2 className="w-5 h-5" /> },
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="text-[#013486]">{feat.icon}</div>
                  <span className="text-sm font-medium text-gray-800">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ ALERTS ════════════════════════ */}
      {view === "alerts" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{rp.alertsTitle}</h2>
            <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg font-semibold">{alerts.filter(a => !a.resolved).length} {rp.urgentAlerts}</span>
          </div>

          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`bg-white rounded-2xl shadow-sm border p-5 flex items-center justify-between ${alert.resolved ? "border-gray-100 opacity-60" : alert.urgency === "high" ? "border-red-200 bg-red-50/30" : alert.urgency === "medium" ? "border-yellow-200 bg-yellow-50/30" : "border-gray-100"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.urgency === "high" ? "bg-red-100 text-red-600" : alert.urgency === "medium" ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-500"}`}>
                    {alert.type === "missing" ? <XCircle className="w-5 h-5" /> : alert.type === "expired" ? <Clock className="w-5 h-5" /> : alert.type === "incomplete" ? <AlertTriangle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{alert.type === "missing" ? rp.missingDocuments : alert.type === "expired" ? rp.expiredCertificates : alert.type === "incomplete" ? rp.incompleteFiles : rp.contractsToRenew}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{personTypeLabel(alert.personType)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{alert.personName} {alert.className ? `· ${alert.className}` : ""} — {docNameLabel(alert.docName)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{alert.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.resolved ? (
                    <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-lg">{rp.statusValidated}</span>
                  ) : (
                    <>
                      <button onClick={() => showToast(rp.documentValidated)} className="text-xs bg-[#013486] text-white px-3 py-1.5 rounded-lg hover:bg-[#012a6d]">{rp.resolveAlert}</button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Mail className="w-4 h-4 text-gray-500" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════ AUDIT ════════════════════════ */}
      {view === "audit" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-900">{rp.auditTrail}</h2>
          </div>

          {/* Security features */}
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { label: rp.fileEncryption, icon: <Shield className="w-4 h-4" /> },
              { label: rp.roleBasedAccess, icon: <Users className="w-4 h-4" /> },
              { label: rp.accessLog, icon: <Eye className="w-4 h-4" /> },
              { label: rp.autoBackup, icon: <Archive className="w-4 h-4" /> },
              { label: rp.rgpdCompliance, icon: <CheckCircle className="w-4 h-4" /> },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-3 py-2.5">
                {feat.icon}<span className="text-xs font-medium">{feat.label}</span>
              </div>
            ))}
          </div>

          {/* Audit table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">{rp.action}</th>
                    <th className="text-left px-4 py-3">Document</th>
                    <th className="text-left px-4 py-3">{rp.name}</th>
                    <th className="text-left px-4 py-3">{rp.addedBy}</th>
                    <th className="text-left px-4 py-3">{rp.dateTime}</th>
                    <th className="text-left px-4 py-3">{rp.ipAddress}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map(entry => (
                    <tr key={entry.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{entry.id}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                          entry.action === "created" ? "bg-green-50 text-green-600" :
                          entry.action === "validated" ? "bg-blue-50 text-blue-600" :
                          entry.action === "modified" ? "bg-yellow-50 text-yellow-600" :
                          entry.action === "deleted" ? "bg-red-50 text-red-600" :
                          entry.action === "rejected" ? "bg-orange-50 text-orange-600" :
                          "bg-gray-50 text-gray-600"
                        }`}>
                          {entry.action === "created" ? rp.createdBy.split(" ")[0] :
                           entry.action === "modified" ? rp.modifiedBy.split(" ")[0] :
                           entry.action === "deleted" ? rp.deletedBy.split(" ")[0] :
                           entry.action === "validated" ? rp.validate :
                           entry.action === "rejected" ? rp.reject :
                           rp.view}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{docNameLabel(entry.docName)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{entry.personName}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.performedBy}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{entry.date} {entry.time}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{entry.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ UPLOAD MODAL ════════════════════════ */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{rp.uploadFile}</h2>
              <button onClick={() => setShowUpload(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{rp.selectPerson}</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <optgroup label={rp.student}>{STUDENTS_LIST.map(s => <option key={s}>{s}</option>)}</optgroup>
                  <optgroup label={rp.teacher}>{TEACHERS_LIST.map(s => <option key={s}>{s}</option>)}</optgroup>
                  <optgroup label={rp.staff}>{STAFF_LIST.map(s => <option key={s}>{s}</option>)}</optgroup>
                  <optgroup label={rp.parent}>{PARENTS_LIST.map(s => <option key={s}>{s}</option>)}</optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{rp.selectDocType}</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {STUDENT_DOC_TYPES.map(dt => <option key={dt} value={dt}>{docNameLabel(dt)}</option>)}
                  {TEACHER_DOC_TYPES.map(dt => <option key={dt} value={dt}>{docNameLabel(dt)}</option>)}
                </select>
              </div>

              {/* Upload methods */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: rp.uploadFile, icon: <Upload className="w-5 h-5" /> },
                  { label: rp.scanDocument, icon: <ScanLine className="w-5 h-5" /> },
                  { label: rp.takePhoto, icon: <Camera className="w-5 h-5" /> },
                  { label: rp.importFromEmail, icon: <Mail className="w-5 h-5" /> },
                  { label: rp.importFromCloud, icon: <Cloud className="w-5 h-5" /> },
                  { label: rp.generateFromEduca, icon: <FilePlus className="w-5 h-5" /> },
                ].map((method, i) => (
                  <button key={i} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-[#013486] hover:bg-blue-50 transition-colors text-left">
                    <div className="text-[#013486]">{method.icon}</div>
                    <span className="text-xs font-medium text-gray-700">{method.label}</span>
                  </button>
                ))}
              </div>

              {/* Drop zone */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">{rp.dragAndDrop}</p>
                <p className="text-xs text-gray-400">{rp.maxFileSize}: 10 MB &middot; {rp.supportedFormats}: PDF, JPG, PNG</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowUpload(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">{rp.cancel}</button>
                <button onClick={() => { setShowUpload(false); showToast(rp.uploadSuccess); }} className="flex-1 bg-[#013486] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#012a6d]">{rp.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ DOCUMENT DRAWER ════════════════════════ */}
      {drawerDoc && (
        <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={() => setDrawerDoc(null)}>
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900">{rp.viewDetails}</h2>
              <button onClick={() => setDrawerDoc(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Document preview */}
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <FileText className="w-16 h-16 text-[#013486]/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">{docNameLabel(drawerDoc.docName)}</p>
                <p className="text-xs text-gray-400 mt-1">{drawerDoc.fileSize}</p>
              </div>

              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500">{rp.name}</p><p className="text-sm font-semibold text-gray-900">{drawerDoc.personName}</p></div>
                  <div><p className="text-xs text-gray-500">{rp.type}</p><p className="text-sm font-semibold text-gray-900">{personTypeLabel(drawerDoc.personType)}</p></div>
                  {drawerDoc.className && <div><p className="text-xs text-gray-500">{rp.class}</p><p className="text-sm font-semibold text-gray-900">{drawerDoc.className}</p></div>}
                  <div><p className="text-xs text-gray-500">{rp.category}</p><p className="text-sm font-semibold text-gray-900">{catLabel(drawerDoc.category)}</p></div>
                  <div><p className="text-xs text-gray-500">{rp.date}</p><p className="text-sm font-semibold text-gray-900">{drawerDoc.uploadDate}</p></div>
                  <div>
                    <p className="text-xs text-gray-500">{rp.status}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${STATUS_COLORS[drawerDoc.status]?.bg} ${STATUS_COLORS[drawerDoc.status]?.text}`}>{statusLabel(drawerDoc.status)}</span>
                  </div>
                </div>
              </div>

              {/* Expiry */}
              {drawerDoc.expiryDate && (
                <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-xs text-yellow-700 font-medium">{rp.expired}</p>
                    <p className="text-sm text-yellow-800">{drawerDoc.expiryDate}</p>
                  </div>
                </div>
              )}

              {/* Version */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">{rp.previousVersions}</p>
                <p className="text-sm text-gray-800">v{drawerDoc.version}</p>
                <p className="text-xs text-gray-400 mt-1">{rp.addedBy}: {drawerDoc.uploadedBy}</p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                {drawerDoc.status === "pending" && (
                  <>
                    <button onClick={() => { setDrawerDoc(null); showToast(rp.documentValidated); }} className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700">
                      <CheckCircle className="w-4 h-4" />{rp.validate}
                    </button>
                    <button onClick={() => { setDrawerDoc(null); showToast(rp.documentRejected); }} className="flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700">
                      <XCircle className="w-4 h-4" />{rp.reject}
                    </button>
                  </>
                )}
                <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200">
                  <Download className="w-4 h-4" />{rp.download}
                </button>
                <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200">
                  <Printer className="w-4 h-4" />{rp.print}
                </button>
              </div>

              {/* QR code verification */}
              <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                <QrCode className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">{rp.qrCodeVerification}</p>
                  <p className="text-xs text-blue-600">{drawerDoc.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
