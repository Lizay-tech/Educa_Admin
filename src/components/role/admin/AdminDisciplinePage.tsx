"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  AlertTriangle, Clock, ShieldAlert, UserX, Award, FileText,
  BookOpen, History, Plus, Search, Filter, Download, Send,
  ChevronLeft, ChevronRight, X, Eye, Edit3, Trash2, Star,
  Trophy, Medal, CheckCircle, XCircle, Upload, MessageSquare,
  Phone, Mail, Bell, TrendingUp, TrendingDown, Users, Calendar,
} from "lucide-react";

/* ─── type alias ─── */
type DP = ReturnType<typeof useTranslation>["t"]["disciplinePage"];

/* ─── palette ─── */
const PIE_COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#10B981", "#EC4899"];
const SEV_COLOR: Record<string, string> = { low: "#10B981", medium: "#F59E0B", severe: "#EF4444", critical: "#7C3AED" };

/* ─── types ─── */
type ViewMode = "dashboard" | "incidents" | "delays" | "warnings" | "sanctions" | "rewards" | "reports" | "rules" | "history";
type Severity = "low" | "medium" | "severe" | "critical";
type InfractionType = "delay" | "unjustifiedAbsence" | "phoneForbidden" | "classIndiscipline" | "homeworkNotSubmitted" | "violence" | "uniformViolation" | "forbiddenBehavior" | "rulesViolation" | "other";

interface Incident {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  teacherName: string;
  date: string;
  time: string;
  type: InfractionType;
  severity: Severity;
  description: string;
  witnesses: string;
  actionTaken: string;
  status: "active" | "resolved" | "pending";
  pointsDeducted: number;
}

interface DelayRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  arrivalTime: string;
  expectedTime: string;
  duration: string;
  reason: string;
  justified: boolean;
  parentNotified: boolean;
}

interface Warning {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  number: number;
  type: "written" | "official";
  date: string;
  reason: string;
  pdfSent: boolean;
  archived: boolean;
}

interface Sanction {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  type: "internalSuspension" | "externalSuspension" | "communityWork" | "correctiveMeasure";
  startDate: string;
  endDate: string;
  duration: number;
  justification: string;
  validated: boolean;
  archived: boolean;
}

interface Reward {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  type: "star" | "trophy" | "medal" | "certificate";
  reason: string;
  date: string;
  parentNotified: boolean;
  points: number;
}

interface Rule {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isPdf: boolean;
  signedStudents: number;
  totalStudents: number;
  signedParents: number;
}

/* ─── mock data generators ─── */
const CLASSES = ["6ème A", "6ème B", "5ème A", "5ème B", "4ème A", "4ème B", "3ème A", "3ème B", "2nde A", "1ère S"];
const STUDENTS = [
  "Jean-Baptiste Pierre", "Marie-Claire Joseph", "Daphney Augustin", "Roberto Charles",
  "Wisline François", "Kervens Bien-Aimé", "Stéphanie Paul", "Jean-Robert Noël",
  "Fabiola Destin", "Claudia Michel", "Patrick Étienne", "Sandra Germain",
  "Hervé Saint-Louis", "Nathalie Jean", "Frantz Pierre-Louis", "Rosemarie Louis",
  "Emmanuel Benoît", "Guerda Toussaint", "Wilner Juste", "Marjorie Célestin",
];
const TEACHERS = ["M. Dumas", "Mme Laurent", "M. Casimir", "Mme Romain", "M. Victor", "Mme Jean-Charles"];
const INFRACTION_TYPES: InfractionType[] = ["delay", "unjustifiedAbsence", "phoneForbidden", "classIndiscipline", "homeworkNotSubmitted", "violence", "uniformViolation", "forbiddenBehavior", "rulesViolation", "other"];
const SEVERITIES: Severity[] = ["low", "medium", "severe", "critical"];

function generateIncidents(): Incident[] {
  const items: Incident[] = [];
  for (let i = 0; i < 45; i++) {
    const si = i % STUDENTS.length;
    const type = INFRACTION_TYPES[i % INFRACTION_TYPES.length];
    const sev = type === "violence" ? "critical" : type === "delay" ? "low" : SEVERITIES[i % 4];
    const pts = sev === "low" ? 2 : sev === "medium" ? 5 : sev === "severe" ? 10 : 15;
    items.push({
      id: `INC-${String(i + 1).padStart(3, "0")}`,
      studentId: `STD-${si + 1}`,
      studentName: STUDENTS[si],
      className: CLASSES[i % CLASSES.length],
      teacherName: TEACHERS[i % TEACHERS.length],
      date: `2025-${String(1 + (i % 3)).padStart(2, "0")}-${String(5 + (i % 23)).padStart(2, "0")}`,
      time: `${8 + (i % 6)}:${String(i % 60).padStart(2, "0")}`,
      type,
      severity: sev,
      description: `Incident #${i + 1} - ${type}`,
      witnesses: i % 3 === 0 ? "Aucun" : `${STUDENTS[(si + 3) % STUDENTS.length]}`,
      actionTaken: i % 4 === 0 ? "Rappel à l'ordre" : i % 4 === 1 ? "Retenue" : i % 4 === 2 ? "Convocation parent" : "Suspension",
      status: i % 5 === 0 ? "pending" : i % 3 === 0 ? "resolved" : "active",
      pointsDeducted: pts,
    });
  }
  return items;
}

function generateDelays(): DelayRecord[] {
  const items: DelayRecord[] = [];
  for (let i = 0; i < 30; i++) {
    const si = i % STUDENTS.length;
    const mins = 5 + (i % 35);
    items.push({
      id: `DLY-${String(i + 1).padStart(3, "0")}`,
      studentId: `STD-${si + 1}`,
      studentName: STUDENTS[si],
      className: CLASSES[i % CLASSES.length],
      date: `2025-01-${String(5 + (i % 25)).padStart(2, "0")}`,
      arrivalTime: `${7 + Math.floor(mins / 60)}:${String((45 + mins) % 60).padStart(2, "0")}`,
      expectedTime: "07:45",
      duration: `${mins} min`,
      reason: i % 3 === 0 ? "Embouteillage" : i % 3 === 1 ? "Transport en commun" : "Sans motif",
      justified: i % 3 !== 2,
      parentNotified: i % 2 === 0,
    });
  }
  return items;
}

function generateWarnings(): Warning[] {
  const items: Warning[] = [];
  for (let i = 0; i < 15; i++) {
    const si = i % STUDENTS.length;
    items.push({
      id: `WRN-${String(i + 1).padStart(3, "0")}`,
      studentId: `STD-${si + 1}`,
      studentName: STUDENTS[si],
      className: CLASSES[i % CLASSES.length],
      number: (i % 3) + 1,
      type: i % 2 === 0 ? "written" : "official",
      date: `2025-01-${String(8 + i).padStart(2, "0")}`,
      reason: i % 2 === 0 ? "Absences répétées injustifiées" : "Comportement perturbateur en classe",
      pdfSent: i % 3 === 0,
      archived: i > 10,
    });
  }
  return items;
}

function generateSanctions(): Sanction[] {
  const items: Sanction[] = [];
  const types: Sanction["type"][] = ["internalSuspension", "externalSuspension", "communityWork", "correctiveMeasure"];
  for (let i = 0; i < 12; i++) {
    const si = i % STUDENTS.length;
    const dur = i % 4 === 0 ? 1 : i % 4 === 1 ? 3 : i % 4 === 2 ? 5 : 2;
    items.push({
      id: `SAN-${String(i + 1).padStart(3, "0")}`,
      studentId: `STD-${si + 1}`,
      studentName: STUDENTS[si],
      className: CLASSES[i % CLASSES.length],
      type: types[i % 4],
      startDate: `2025-01-${String(10 + i).padStart(2, "0")}`,
      endDate: `2025-01-${String(10 + i + dur).padStart(2, "0")}`,
      duration: dur,
      justification: `Sanction suite à incident grave #${i + 1}`,
      validated: i % 3 !== 2,
      archived: i > 8,
    });
  }
  return items;
}

function generateRewards(): Reward[] {
  const items: Reward[] = [];
  const types: Reward["type"][] = ["star", "trophy", "medal", "certificate"];
  for (let i = 0; i < 20; i++) {
    const si = (i * 3) % STUDENTS.length;
    items.push({
      id: `RWD-${String(i + 1).padStart(3, "0")}`,
      studentId: `STD-${si + 1}`,
      studentName: STUDENTS[si],
      className: CLASSES[i % CLASSES.length],
      type: types[i % 4],
      reason: i % 3 === 0 ? "Comportement exemplaire tout le mois" : i % 3 === 1 ? "Aide aux camarades" : "Amélioration notable",
      date: `2025-01-${String(5 + i).padStart(2, "0")}`,
      parentNotified: i % 2 === 0,
      points: i % 4 === 0 ? 5 : i % 4 === 1 ? 10 : i % 4 === 2 ? 8 : 15,
    });
  }
  return items;
}

function generateRules(): Rule[] {
  return [
    { id: "RUL-001", title: "Règlement intérieur 2024-2025", content: "Document officiel du règlement intérieur de l'établissement couvrant toutes les sections : présence, tenue, comportement, examens, sécurité.", createdAt: "2024-09-01", isPdf: true, signedStudents: 340, totalStudents: 380, signedParents: 310 },
    { id: "RUL-002", title: "Charte d'utilisation du numérique", content: "Règles pour l'utilisation des appareils numériques, téléphones portables et ordinateurs dans l'enceinte de l'établissement.", createdAt: "2024-09-05", isPdf: false, signedStudents: 380, totalStudents: 380, signedParents: 350 },
    { id: "RUL-003", title: "Code vestimentaire", content: "Uniforme obligatoire : chemise blanche, pantalon/jupe bleu marine, chaussures noires. Tout écart sera sanctionné.", createdAt: "2024-09-01", isPdf: false, signedStudents: 375, totalStudents: 380, signedParents: 370 },
  ];
}

/* ─── Component ─── */
export default function AdminDisciplinePage() {
  const { t } = useTranslation();
  const dp: DP = t.disciplinePage;

  /* state */
  const [view, setView] = useState<ViewMode>("dashboard");
  const [incidents] = useState<Incident[]>(generateIncidents);
  const [delays] = useState<DelayRecord[]>(generateDelays);
  const [warnings] = useState<Warning[]>(generateWarnings);
  const [sanctions] = useState<Sanction[]>(generateSanctions);
  const [rewards] = useState<Reward[]>(generateRewards);
  const [rules] = useState<Rule[]>(generateRules);

  /* filters */
  const [filterClass, setFilterClass] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  /* pagination */
  const [page, setPage] = useState(1);
  const perPage = 10;

  /* modals / drawers */
  const [drawerItem, setDrawerItem] = useState<Incident | null>(null);
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [showNewDelay, setShowNewDelay] = useState(false);
  const [showNewReward, setShowNewReward] = useState(false);
  const [showNewRule, setShowNewRule] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<string | null>(null);

  /* toast */
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* ─── helpers ─── */
  const sevLabel = (s: Severity) => dp[s];
  const typeLabel = (t: InfractionType) => dp[t];
  const statusLabel = (s: string) => s === "active" ? dp.active : s === "resolved" ? dp.resolved : dp.pending;
  const sanctionTypeLabel = (t: Sanction["type"]) =>
    t === "internalSuspension" ? dp.internalSuspension : t === "externalSuspension" ? dp.externalSuspension : t === "communityWork" ? dp.communityWork : dp.correctiveMeasure;
  const rewardIcon = (t: Reward["type"]) =>
    t === "star" ? <Star className="w-4 h-4 text-yellow-500" /> : t === "trophy" ? <Trophy className="w-4 h-4 text-amber-600" /> : t === "medal" ? <Medal className="w-4 h-4 text-blue-500" /> : <Award className="w-4 h-4 text-green-600" />;
  const rewardLabel = (t: Reward["type"]) => dp[t];

  /* ─── dashboard data ─── */
  const dashStats = useMemo(() => {
    const thisMonthIncidents = incidents.filter(i => i.date.startsWith("2025-01"));
    const thisMonthDelays = delays.filter(d => d.date.startsWith("2025-01"));
    return {
      totalIncidents: thisMonthIncidents.length,
      totalDelays: thisMonthDelays.length,
      unjustifiedAbs: thisMonthIncidents.filter(i => i.type === "unjustifiedAbsence").length,
      activeWarnings: warnings.filter(w => !w.archived).length,
      activeSuspensions: sanctions.filter(s => !s.archived && s.validated).length,
      atRisk: new Set(incidents.filter(i => i.pointsDeducted >= 10).map(i => i.studentId)).size,
    };
  }, [incidents, delays, warnings, sanctions]);

  /* chart: monthly evolution */
  const chartMonthly = useMemo(() => {
    const months = [dp.september, dp.october, dp.november, dp.december, dp.january];
    return months.map((m, i) => ({ name: m, incidents: 12 + i * 3 + (i === 4 ? 8 : 0), delays: 8 + i * 2, rewards: 5 + i }));
  }, [dp]);

  /* chart: by type */
  const chartByType = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: typeLabel(k as InfractionType), value: v }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents, dp]);

  /* chart: severity */
  const chartSeverity = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach(i => { counts[i.severity] = (counts[i.severity] || 0) + 1; });
    return SEVERITIES.map(s => ({ name: sevLabel(s), value: counts[s] || 0, color: SEV_COLOR[s] }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents, dp]);

  /* top classes */
  const topClasses = useMemo(() => {
    const counts: Record<string, number> = {};
    CLASSES.forEach(c => { counts[c] = 0; });
    incidents.forEach(i => { counts[i.className] = (counts[i.className] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => a[1] - b[1]).slice(0, 5).map(([c, n]) => ({ name: c, incidents: n }));
  }, [incidents]);

  /* top exemplary students */
  const topStudents = useMemo(() => {
    const pts: Record<string, { name: string; points: number }> = {};
    rewards.forEach(r => {
      if (!pts[r.studentId]) pts[r.studentId] = { name: r.studentName, points: 0 };
      pts[r.studentId].points += r.points;
    });
    return Object.values(pts).sort((a, b) => b.points - a.points).slice(0, 5);
  }, [rewards]);

  /* student discipline score */
  const getStudentScore = (studentId: string) => {
    let score = 100;
    incidents.filter(i => i.studentId === studentId).forEach(i => { score -= i.pointsDeducted; });
    rewards.filter(r => r.studentId === studentId).forEach(r => { score += r.points; });
    return Math.max(0, Math.min(100, score));
  };

  /* ─── filtered data ─── */
  const filteredIncidents = useMemo(() => {
    let data = incidents;
    if (filterClass !== "all") data = data.filter(i => i.className === filterClass);
    if (filterSeverity !== "all") data = data.filter(i => i.severity === filterSeverity);
    if (filterType !== "all") data = data.filter(i => i.type === filterType);
    if (filterStatus !== "all") data = data.filter(i => i.status === filterStatus);
    if (searchQ) data = data.filter(i => i.studentName.toLowerCase().includes(searchQ.toLowerCase()));
    return data;
  }, [incidents, filterClass, filterSeverity, filterType, filterStatus, searchQ]);

  const filteredDelays = useMemo(() => {
    let data = delays;
    if (filterClass !== "all") data = data.filter(d => d.className === filterClass);
    if (searchQ) data = data.filter(d => d.studentName.toLowerCase().includes(searchQ.toLowerCase()));
    return data;
  }, [delays, filterClass, searchQ]);

  const totalPages = Math.ceil(
    (view === "incidents" ? filteredIncidents.length : view === "delays" ? filteredDelays.length : view === "warnings" ? warnings.length : view === "sanctions" ? sanctions.length : view === "rewards" ? rewards.length : 1) / perPage
  );
  const paginate = <T,>(arr: T[]) => arr.slice((page - 1) * perPage, page * perPage);

  /* ─── tabs config ─── */
  const tabs: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: dp.tabDashboard, icon: <TrendingUp className="w-4 h-4" /> },
    { key: "incidents", label: dp.tabIncidents, icon: <AlertTriangle className="w-4 h-4" /> },
    { key: "delays", label: dp.tabDelays, icon: <Clock className="w-4 h-4" /> },
    { key: "warnings", label: dp.tabWarnings, icon: <ShieldAlert className="w-4 h-4" /> },
    { key: "sanctions", label: dp.tabSanctions, icon: <UserX className="w-4 h-4" /> },
    { key: "rewards", label: dp.tabRewards, icon: <Award className="w-4 h-4" /> },
    { key: "reports", label: dp.tabReports, icon: <FileText className="w-4 h-4" /> },
    { key: "rules", label: dp.tabRules, icon: <BookOpen className="w-4 h-4" /> },
    { key: "history", label: dp.tabHistory, icon: <History className="w-4 h-4" /> },
  ];

  /* ─── student history for drawer ─── */
  const studentHistoryData = useMemo(() => {
    if (!historyStudent) return null;
    return {
      delays: delays.filter(d => d.studentId === historyStudent),
      incidents: incidents.filter(i => i.studentId === historyStudent),
      warnings: warnings.filter(w => w.studentId === historyStudent),
      sanctions: sanctions.filter(s => s.studentId === historyStudent),
      rewards: rewards.filter(r => r.studentId === historyStudent),
      score: getStudentScore(historyStudent),
      name: STUDENTS[parseInt(historyStudent.split("-")[1]) - 1] || "",
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyStudent, delays, incidents, warnings, sanctions, rewards]);

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
            <button key={tab.key} onClick={() => { setView(tab.key); setPage(1); setSearchQ(""); setFilterClass("all"); setFilterSeverity("all"); setFilterType("all"); setFilterStatus("all"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${view === tab.key ? "bg-[#013486] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════ DASHBOARD ════════════════════════ */}
      {view === "dashboard" && (
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: dp.totalIncidents, value: dashStats.totalIncidents, color: "bg-red-50 text-red-700", icon: <AlertTriangle className="w-5 h-5" /> },
              { label: dp.totalDelays, value: dashStats.totalDelays, color: "bg-yellow-50 text-yellow-700", icon: <Clock className="w-5 h-5" /> },
              { label: dp.unjustifiedAbsences, value: dashStats.unjustifiedAbs, color: "bg-blue-50 text-blue-700", icon: <XCircle className="w-5 h-5" /> },
              { label: dp.activeWarnings, value: dashStats.activeWarnings, color: "bg-purple-50 text-purple-700", icon: <ShieldAlert className="w-5 h-5" /> },
              { label: dp.activeSuspensions, value: dashStats.activeSuspensions, color: "bg-gray-100 text-gray-700", icon: <UserX className="w-5 h-5" /> },
              { label: dp.atRiskStudents, value: dashStats.atRisk, color: "bg-green-50 text-green-700", icon: <Users className="w-5 h-5" /> },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 ${s.color}`}>
                <div className="flex items-center gap-2 mb-2 opacity-80">{s.icon}<span className="text-xs font-medium">{s.label}</span></div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs opacity-60 mt-1">{dp.thisMonth}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly evolution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{dp.monthlyEvolution}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="incidents" stroke="#EF4444" name={dp.tabIncidents} strokeWidth={2} />
                  <Line type="monotone" dataKey="delays" stroke="#F59E0B" name={dp.tabDelays} strokeWidth={2} />
                  <Line type="monotone" dataKey="rewards" stroke="#10B981" name={dp.tabRewards} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* By type */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{dp.incidentsByType}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={chartByType} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {chartByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Severity + Top classes + Top students */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Severity distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{dp.severityDistribution}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartSeverity}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartSeverity.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Most disciplined classes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{dp.mostDisciplinedClasses}</h3>
              <div className="space-y-3">
                {topClasses.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-600"}`}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{c.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{c.incidents} {dp.tabIncidents.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exemplary students */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{dp.exemplaryStudents}</h3>
              <div className="space-y-3">
                {topStudents.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-green-100 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                        {i === 0 ? <Star className="w-3.5 h-3.5" /> : i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{s.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-green-600">+{s.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ INCIDENTS ════════════════════════ */}
      {view === "incidents" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }} placeholder={dp.search} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
              </div>
              <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="all">{dp.filterByClass}</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="all">{dp.filterBySeverity}</option>
                {SEVERITIES.map(s => <option key={s} value={s}>{sevLabel(s)}</option>)}
              </select>
              <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="all">{dp.filterByType}</option>
                {INFRACTION_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
              </select>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="all">{dp.filterByStatus}</option>
                <option value="active">{dp.active}</option>
                <option value="resolved">{dp.resolved}</option>
                <option value="pending">{dp.pending}</option>
              </select>
              <button onClick={() => setShowNewIncident(true)} className="flex items-center gap-2 bg-[#013486] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#012a6d] transition-colors">
                <Plus className="w-4 h-4" />{dp.newIncident}
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
                    <th className="text-left px-4 py-3">{dp.student}</th>
                    <th className="text-left px-4 py-3">{dp.class}</th>
                    <th className="text-left px-4 py-3">{dp.filterByType}</th>
                    <th className="text-left px-4 py-3">{dp.severity}</th>
                    <th className="text-left px-4 py-3">{dp.date}</th>
                    <th className="text-left px-4 py-3">{dp.status}</th>
                    <th className="text-left px-4 py-3">{dp.disciplinaryPoints}</th>
                    <th className="text-left px-4 py-3">{dp.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredIncidents).map(inc => (
                    <tr key={inc.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{inc.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{inc.studentName}</td>
                      <td className="px-4 py-3 text-gray-600">{inc.className}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{typeLabel(inc.type)}</span></td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: SEV_COLOR[inc.severity] + "20", color: SEV_COLOR[inc.severity] }}>
                          {sevLabel(inc.severity)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{inc.date}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${inc.status === "active" ? "bg-red-50 text-red-600" : inc.status === "resolved" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                          {statusLabel(inc.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-red-600 font-semibold">-{inc.pointsDeducted}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setDrawerItem(inc)} className="p-1.5 hover:bg-gray-100 rounded-lg" title={dp.viewDetails}><Eye className="w-4 h-4 text-gray-500" /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg" title={dp.edit}><Edit3 className="w-4 h-4 text-blue-500" /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg" title={dp.delete}><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{dp.showing} {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredIncidents.length)} {dp.of} {filteredIncidents.length}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-3 py-1.5 text-xs font-medium">{dp.page} {page}/{totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ DELAYS ════════════════════════ */}
      {view === "delays" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }} placeholder={dp.search} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
              </div>
              <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="all">{dp.filterByClass}</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => setShowNewDelay(true)} className="flex items-center gap-2 bg-[#013486] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#012a6d] transition-colors">
                <Plus className="w-4 h-4" />{dp.registerDelay}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">{dp.student}</th>
                    <th className="text-left px-4 py-3">{dp.class}</th>
                    <th className="text-left px-4 py-3">{dp.date}</th>
                    <th className="text-left px-4 py-3">{dp.arrivalTime}</th>
                    <th className="text-left px-4 py-3">{dp.expectedTime}</th>
                    <th className="text-left px-4 py-3">{dp.delayDuration}</th>
                    <th className="text-left px-4 py-3">{dp.reason}</th>
                    <th className="text-left px-4 py-3">{dp.status}</th>
                    <th className="text-left px-4 py-3">{dp.parentNotified}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredDelays).map(d => (
                    <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{d.studentName}</td>
                      <td className="px-4 py-3 text-gray-600">{d.className}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{d.date}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">{d.arrivalTime}</td>
                      <td className="px-4 py-3 text-gray-500">{d.expectedTime}</td>
                      <td className="px-4 py-3 text-orange-600 font-semibold">{d.duration}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{d.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${d.justified ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                          {d.justified ? dp.justified : dp.unjustified}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.parentNotified ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{dp.showing} {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredDelays.length)} {dp.of} {filteredDelays.length}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-3 py-1.5 text-xs font-medium">{dp.page} {page}/{Math.ceil(filteredDelays.length / perPage)}</span>
                <button onClick={() => setPage(p => Math.min(Math.ceil(filteredDelays.length / perPage), p + 1))} disabled={page === Math.ceil(filteredDelays.length / perPage)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ WARNINGS ════════════════════════ */}
      {view === "warnings" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{dp.warningsTitle}</h2>
            <button onClick={() => showToast(dp.warningIssued)} className="flex items-center gap-2 bg-[#013486] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#012a6d]">
              <Plus className="w-4 h-4" />{dp.add}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {warnings.map(w => (
              <div key={w.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">{w.id}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${w.type === "official" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-700"}`}>
                    {w.type === "official" ? dp.officialWarning : dp.writtenWarning}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{w.studentName}</p>
                  <p className="text-xs text-gray-500">{w.className} &middot; {dp.warningNumber}{w.number}</p>
                </div>
                <p className="text-sm text-gray-600">{w.reason}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{w.date}</span>
                  <div className="flex gap-2">
                    {w.pdfSent && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-md">{dp.sendPdfToParent}</span>}
                    {w.archived && <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{dp.legalArchive}</span>}
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg"><Send className="w-3.5 h-3.5" />{dp.sendPdfToParent}</button>
                  <button className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg"><Download className="w-3.5 h-3.5" />PDF</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════ SANCTIONS ════════════════════════ */}
      {view === "sanctions" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{dp.sanctionsTitle}</h2>
            <button onClick={() => showToast(dp.sanctionApplied)} className="flex items-center gap-2 bg-[#013486] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#012a6d]">
              <Plus className="w-4 h-4" />{dp.add}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">{dp.student}</th>
                    <th className="text-left px-4 py-3">{dp.class}</th>
                    <th className="text-left px-4 py-3">{dp.filterByType}</th>
                    <th className="text-left px-4 py-3">{dp.startDate}</th>
                    <th className="text-left px-4 py-3">{dp.endDate}</th>
                    <th className="text-left px-4 py-3">{dp.duration}</th>
                    <th className="text-left px-4 py-3">{dp.directionValidation}</th>
                    <th className="text-left px-4 py-3">{dp.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {sanctions.map(s => (
                    <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{s.studentName}</td>
                      <td className="px-4 py-3 text-gray-600">{s.className}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${s.type === "externalSuspension" ? "bg-red-50 text-red-600" : s.type === "internalSuspension" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}>
                          {sanctionTypeLabel(s.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{s.startDate}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{s.endDate}</td>
                      <td className="px-4 py-3 font-semibold text-gray-700">{s.duration} {dp.days}</td>
                      <td className="px-4 py-3">
                        {s.validated ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-500" /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Download className="w-4 h-4 text-blue-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ REWARDS ════════════════════════ */}
      {view === "rewards" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{dp.rewardsTitle}</h2>
            <button onClick={() => setShowNewReward(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700">
              <Plus className="w-4 h-4" />{dp.add}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3 hover:border-green-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rewardIcon(r.type)}
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">{rewardLabel(r.type)}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">+{r.points} pts</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{r.studentName}</p>
                  <p className="text-xs text-gray-500">{r.className}</p>
                </div>
                <p className="text-sm text-gray-600">{r.reason}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{r.date}</span>
                  {r.parentNotified && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-md flex items-center gap-1"><Bell className="w-3 h-3" />{dp.parentCongrats}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════ REPORTS ════════════════════════ */}
      {view === "reports" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{dp.reportsTitle}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: dp.monthlyStudentReport, icon: <Users className="w-6 h-6" />, color: "bg-blue-50 text-blue-700" },
                { label: dp.classReport, icon: <Calendar className="w-6 h-6" />, color: "bg-purple-50 text-purple-700" },
                { label: dp.annualReport, icon: <FileText className="w-6 h-6" />, color: "bg-green-50 text-green-700" },
                { label: dp.globalStats, icon: <TrendingUp className="w-6 h-6" />, color: "bg-orange-50 text-orange-700" },
              ].map((r, i) => (
                <div key={i} className={`rounded-2xl p-6 ${r.color} cursor-pointer hover:shadow-md transition-shadow`}>
                  <div className="mb-4">{r.icon}</div>
                  <h3 className="font-semibold text-sm mb-3">{r.label}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => showToast(dp.reportGenerated)} className="flex items-center gap-1 text-xs font-medium bg-white/60 hover:bg-white px-3 py-1.5 rounded-lg transition-colors">
                      <Download className="w-3.5 h-3.5" />PDF
                    </button>
                    <button onClick={() => showToast(dp.reportGenerated)} className="flex items-center gap-1 text-xs font-medium bg-white/60 hover:bg-white px-3 py-1.5 rounded-lg transition-colors">
                      <Download className="w-3.5 h-3.5" />Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global stats summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{dp.globalStats}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
                <p className="text-xs text-gray-500 mt-1">{dp.totalIncidents}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{delays.length}</p>
                <p className="text-xs text-gray-500 mt-1">{dp.totalDelays}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{warnings.length}</p>
                <p className="text-xs text-gray-500 mt-1">{dp.activeWarnings}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{rewards.length}</p>
                <p className="text-xs text-gray-500 mt-1">{dp.tabRewards}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ RULES ════════════════════════ */}
      {view === "rules" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">{dp.rulesTitle}</h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200">
                <Upload className="w-4 h-4" />{dp.uploadRulesPdf}
              </button>
              <button onClick={() => setShowNewRule(true)} className="flex items-center gap-2 bg-[#013486] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#012a6d]">
                <Plus className="w-4 h-4" />{dp.addRuleManually}
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rules.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{r.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{r.createdAt}</p>
                  </div>
                  {r.isPdf && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-lg">PDF</span>}
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{r.content}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{dp.studentSignature}</span>
                    <span className="font-semibold text-gray-800">{r.signedStudents}/{r.totalStudents}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#013486] h-2 rounded-full" style={{ width: `${(r.signedStudents / r.totalStudents) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{dp.parentSignatureRequired}</span>
                    <span className="font-semibold text-gray-800">{r.signedParents}/{r.totalStudents}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(r.signedParents / r.totalStudents) * 100}%` }} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-1 text-xs text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg"><Eye className="w-3.5 h-3.5" />{dp.view}</button>
                  <button className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 hover:bg-gray-50 py-1.5 rounded-lg"><Edit3 className="w-3.5 h-3.5" />{dp.edit}</button>
                  <button className="flex-1 flex items-center justify-center gap-1 text-xs text-red-500 hover:bg-red-50 py-1.5 rounded-lg"><Trash2 className="w-3.5 h-3.5" />{dp.delete}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════ HISTORY ════════════════════════ */}
      {view === "history" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{dp.studentHistory}</h2>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={dp.search} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
            </div>
          </div>

          {/* Student cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STUDENTS.filter(s => !searchQ || s.toLowerCase().includes(searchQ.toLowerCase())).map((name, i) => {
              const sid = `STD-${i + 1}`;
              const score = getStudentScore(sid);
              const studentIncidents = incidents.filter(inc => inc.studentId === sid).length;
              const studentDelays = delays.filter(d => d.studentId === sid).length;
              const studentRewards = rewards.filter(r => r.studentId === sid).length;
              return (
                <div key={sid} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:border-[#013486]/30 transition-colors" onClick={() => setHistoryStudent(sid)}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">{CLASSES[i % CLASSES.length]}</p>
                    </div>
                    <div className={`text-lg font-bold ${score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                      {score}/100
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-400" />{studentIncidents}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-yellow-500" />{studentDelays}</span>
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-green-500" />{studentRewards}</span>
                  </div>
                  <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════ INCIDENT DRAWER ════════════════════════ */}
      {drawerItem && (
        <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={() => setDrawerItem(null)}>
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900">{drawerItem.id}</h2>
              <button onClick={() => setDrawerItem(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Student info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">{dp.student}</p><p className="font-semibold text-gray-900">{drawerItem.studentName}</p></div>
                  <div><p className="text-xs text-gray-500">{dp.class}</p><p className="font-semibold text-gray-900">{drawerItem.className}</p></div>
                  <div><p className="text-xs text-gray-500">{dp.reportingTeacher}</p><p className="font-semibold text-gray-900">{drawerItem.teacherName}</p></div>
                  <div><p className="text-xs text-gray-500">{dp.dateTime}</p><p className="font-semibold text-gray-900">{drawerItem.date} {drawerItem.time}</p></div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ backgroundColor: SEV_COLOR[drawerItem.severity] + "20", color: SEV_COLOR[drawerItem.severity] }}>
                    {sevLabel(drawerItem.severity)}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">{typeLabel(drawerItem.type)}</span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-lg ${drawerItem.status === "active" ? "bg-red-50 text-red-600" : drawerItem.status === "resolved" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                    {statusLabel(drawerItem.status)}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">{dp.detailedDescription}</p>
                  <p className="text-sm text-gray-800">{drawerItem.description}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">{dp.witnesses}</p>
                  <p className="text-sm text-gray-800">{drawerItem.witnesses}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">{dp.actionTaken}</p>
                  <p className="text-sm text-gray-800">{drawerItem.actionTaken}</p>
                </div>

                <div className="bg-red-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-red-700">{dp.disciplinaryPoints}</span>
                  <span className="text-xl font-bold text-red-600">-{drawerItem.pointsDeducted}</span>
                </div>
              </div>

              {/* Thresholds */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">{dp.thresholds}</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-gray-600">-10 {dp.points}</span><span className="text-yellow-600 font-medium">{dp.warningThreshold}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">-20 {dp.points}</span><span className="text-orange-600 font-medium">{dp.parentMeetingThreshold}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">-40 {dp.points}</span><span className="text-red-600 font-medium">{dp.suspensionThreshold}</span></div>
                </div>
              </div>

              {/* Communication buttons */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">{dp.parentComm}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => showToast(dp.messageSent)} className="flex items-center gap-2 justify-center bg-green-50 text-green-700 py-2.5 rounded-xl text-sm hover:bg-green-100"><Phone className="w-4 h-4" />{dp.notifySms}</button>
                  <button onClick={() => showToast(dp.messageSent)} className="flex items-center gap-2 justify-center bg-green-50 text-green-700 py-2.5 rounded-xl text-sm hover:bg-green-100"><MessageSquare className="w-4 h-4" />WhatsApp</button>
                  <button onClick={() => showToast(dp.messageSent)} className="flex items-center gap-2 justify-center bg-blue-50 text-blue-700 py-2.5 rounded-xl text-sm hover:bg-blue-100"><Mail className="w-4 h-4" />{dp.notifyEmail}</button>
                  <button onClick={() => showToast(dp.messageSent)} className="flex items-center gap-2 justify-center bg-purple-50 text-purple-700 py-2.5 rounded-xl text-sm hover:bg-purple-100"><Bell className="w-4 h-4" />{dp.appNotif}</button>
                </div>
              </div>

              {/* Audit trail */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">{dp.auditTrail}</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>{dp.createdBy}: {drawerItem.teacherName} &middot; {drawerItem.date} {drawerItem.time}</p>
                  <p>{dp.ipAddress}: 192.168.1.{Math.floor(Math.random() * 254) + 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ NEW INCIDENT MODAL ════════════════════════ */}
      {showNewIncident && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setShowNewIncident(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{dp.newIncident}</h2>
              <button onClick={() => setShowNewIncident(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{dp.student}</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {STUDENTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{dp.class}</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{dp.filterByType}</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {INFRACTION_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{dp.severity}</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {SEVERITIES.map(s => <option key={s} value={s}>{sevLabel(s)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.detailedDescription}</label>
                <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.witnesses}</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.actionTaken}</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.attachments}</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{dp.attachments}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowNewIncident(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">{dp.cancel}</button>
                <button onClick={() => { setShowNewIncident(false); showToast(dp.incidentCreated); }} className="flex-1 bg-[#013486] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#012a6d]">{dp.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ NEW DELAY MODAL ════════════════════════ */}
      {showNewDelay && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setShowNewDelay(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{dp.registerDelay}</h2>
              <button onClick={() => setShowNewDelay(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.student}</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {STUDENTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.class}</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{dp.arrivalTime}</label>
                  <input type="time" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{dp.expectedTime}</label>
                  <input type="time" defaultValue="07:45" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.reason}</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="justified" className="rounded" />
                <label htmlFor="justified" className="text-sm text-gray-700">{dp.justified}</label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowNewDelay(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">{dp.cancel}</button>
                <button onClick={() => { setShowNewDelay(false); showToast(dp.delayRegistered); }} className="flex-1 bg-[#013486] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#012a6d]">{dp.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ NEW REWARD MODAL ════════════════════════ */}
      {showNewReward && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setShowNewReward(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{dp.rewardsTitle}</h2>
              <button onClick={() => setShowNewReward(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.student}</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {STUDENTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.class}</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["star", "trophy", "medal", "certificate"] as Reward["type"][]).map(rt => (
                    <button key={rt} className="flex flex-col items-center gap-1 p-3 border border-gray-200 rounded-xl hover:border-[#013486] hover:bg-blue-50 transition-colors">
                      {rewardIcon(rt)}
                      <span className="text-xs text-gray-600">{rewardLabel(rt)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.reason}</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="notifyParent" className="rounded" defaultChecked />
                <label htmlFor="notifyParent" className="text-sm text-gray-700">{dp.parentCongrats}</label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowNewReward(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">{dp.cancel}</button>
                <button onClick={() => { setShowNewReward(false); showToast(dp.rewardGiven); }} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700">{dp.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ NEW RULE MODAL ════════════════════════ */}
      {showNewRule && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setShowNewRule(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{dp.addRuleManually}</h2>
              <button onClick={() => setShowNewRule(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.ruleTitle}</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{dp.ruleContent}</label>
                <textarea rows={6} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="reqStudentSig" className="rounded" defaultChecked />
                  <label htmlFor="reqStudentSig" className="text-sm text-gray-700">{dp.studentSignature}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="reqParentSig" className="rounded" defaultChecked />
                  <label htmlFor="reqParentSig" className="text-sm text-gray-700">{dp.parentSignatureRequired}</label>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowNewRule(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">{dp.cancel}</button>
                <button onClick={() => { setShowNewRule(false); showToast(dp.ruleSaved); }} className="flex-1 bg-[#013486] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#012a6d]">{dp.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ STUDENT HISTORY DRAWER ════════════════════════ */}
      {historyStudent && studentHistoryData && (
        <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={() => setHistoryStudent(null)}>
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{dp.disciplinaryFile}</h2>
                <p className="text-sm text-gray-500">{studentHistoryData.name}</p>
              </div>
              <button onClick={() => setHistoryStudent(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Score */}
              <div className={`rounded-2xl p-6 text-center ${studentHistoryData.score >= 80 ? "bg-green-50" : studentHistoryData.score >= 50 ? "bg-yellow-50" : "bg-red-50"}`}>
                <p className="text-sm font-medium text-gray-600 mb-1">{dp.disciplineScore}</p>
                <p className={`text-4xl font-bold ${studentHistoryData.score >= 80 ? "text-green-600" : studentHistoryData.score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                  {studentHistoryData.score}/100
                </p>
                <div className="w-full max-w-xs mx-auto bg-white/50 rounded-full h-3 mt-3">
                  <div className={`h-3 rounded-full ${studentHistoryData.score >= 80 ? "bg-green-500" : studentHistoryData.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${studentHistoryData.score}%` }} />
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xl font-bold text-red-600">{studentHistoryData.incidents.length}</p>
                  <p className="text-xs text-gray-500">{dp.incidentsHistory}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xl font-bold text-yellow-600">{studentHistoryData.delays.length}</p>
                  <p className="text-xs text-gray-500">{dp.delaysHistory}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xl font-bold text-green-600">{studentHistoryData.rewards.length}</p>
                  <p className="text-xs text-gray-500">{dp.rewardsHistory}</p>
                </div>
              </div>

              {/* Incidents list */}
              {studentHistoryData.incidents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" />{dp.incidentsHistory}</h3>
                  <div className="space-y-2">
                    {studentHistoryData.incidents.map(inc => (
                      <div key={inc.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{typeLabel(inc.type)}</p>
                          <p className="text-xs text-gray-500">{inc.date}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ backgroundColor: SEV_COLOR[inc.severity] + "20", color: SEV_COLOR[inc.severity] }}>
                            {sevLabel(inc.severity)}
                          </span>
                          <p className="text-xs text-red-600 font-semibold mt-1">-{inc.pointsDeducted} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings list */}
              {studentHistoryData.warnings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-purple-500" />{dp.warningsHistory}</h3>
                  <div className="space-y-2">
                    {studentHistoryData.warnings.map(w => (
                      <div key={w.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{dp.warningNumber}{w.number}</p>
                          <p className="text-xs text-gray-500">{w.date} &middot; {w.type === "official" ? dp.officialWarning : dp.writtenWarning}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sanctions list */}
              {studentHistoryData.sanctions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><UserX className="w-4 h-4 text-gray-700" />{dp.suspensionsHistory}</h3>
                  <div className="space-y-2">
                    {studentHistoryData.sanctions.map(s => (
                      <div key={s.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{sanctionTypeLabel(s.type)}</p>
                          <p className="text-xs text-gray-500">{s.startDate} → {s.endDate} ({s.duration} {dp.days})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewards list */}
              {studentHistoryData.rewards.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-green-500" />{dp.rewardsHistory}</h3>
                  <div className="space-y-2">
                    {studentHistoryData.rewards.map(r => (
                      <div key={r.id} className="bg-green-50 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {rewardIcon(r.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-800">{r.reason}</p>
                            <p className="text-xs text-gray-500">{r.date}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-600">+{r.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => showToast(dp.reportGenerated)} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200">
                  <Download className="w-4 h-4" />{dp.exportPdf}
                </button>
                <button onClick={() => showToast(dp.messageSent)} className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-xl text-sm font-medium hover:bg-green-100">
                  <Send className="w-4 h-4" />{dp.send}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
