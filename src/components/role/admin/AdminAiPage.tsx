"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Sparkles, Brain, AlertTriangle, GraduationCap, BookOpen,
  FileText, BarChart3, Settings, Plus, Search, X, Eye,
  ChevronLeft, ChevronRight, Send, CheckCircle, Clock,
  TrendingUp, TrendingDown, Users, Zap, Bot, Mic,
  Download, ToggleLeft, ToggleRight, Shield, Globe,
  Lightbulb, Target, Activity, Cpu, RefreshCw,
} from "lucide-react";

/* ─── type alias ─── */
type AP = ReturnType<typeof useTranslation>["t"]["aiPage"];

/* ─── palette ─── */
const PIE_COLORS = ["#013486", "#F35403", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  low: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
};

/* ─── mock data ─── */
const mockAtRiskStudents = Array.from({ length: 12 }, (_, i) => ({
  id: `STU-${String(i + 1).padStart(3, "0")}`,
  name: ["Jean Pierre", "Marie Claire", "Paul Henri", "Sophie Belizaire", "Marc Antoine",
    "Julie Dupont", "Robert Louis", "Anne Marie", "Pierre Charles", "Claudine Jean",
    "Emmanuel Pascal", "Francoise Moise"][i],
  class: ["6\u00e8me A", "5\u00e8me B", "4\u00e8me A", "3\u00e8me C", "6\u00e8me B", "5\u00e8me A"][i % 6],
  riskScore: [92, 85, 78, 72, 68, 55, 48, 42, 38, 35, 28, 22][i],
  riskLevel: i < 4 ? "high" : i < 8 ? "medium" : "low",
  factors: [
    ["absences", "gradeDrop", "homework"],
    ["gradeDrop", "engagement", "behavior"],
    ["absences", "homework"],
    ["gradeDrop", "isolation"],
    ["absences", "engagement"],
    ["homework", "behavior"],
  ][i % 6] as string[],
  alertSent: i < 6,
  trend: i % 3 === 0 ? "up" : "down",
}));

const mockPerformanceData = [
  { subject: "Math", classAvg: 72, schoolAvg: 68, nationalAvg: 65 },
  { subject: "Fran\u00e7ais", classAvg: 78, schoolAvg: 74, nationalAvg: 70 },
  { subject: "Sciences", classAvg: 65, schoolAvg: 62, nationalAvg: 60 },
  { subject: "Histoire", classAvg: 70, schoolAvg: 67, nationalAvg: 64 },
  { subject: "Anglais", classAvg: 60, schoolAvg: 58, nationalAvg: 55 },
  { subject: "Physique", classAvg: 55, schoolAvg: 52, nationalAvg: 50 },
];

const mockAiUsage = [
  { m: "Sep", analyses: 120, alerts: 15, content: 45 },
  { m: "Oct", analyses: 180, alerts: 22, content: 68 },
  { m: "Nov", analyses: 250, alerts: 35, content: 92 },
  { m: "Dec", analyses: 150, alerts: 18, content: 55 },
  { m: "Jan", analyses: 300, alerts: 40, content: 110 },
  { m: "Feb", analyses: 280, alerts: 38, content: 105 },
];

const mockByModule = [
  { name: "Performance", value: 30 },
  { name: "D\u00e9crochage", value: 20 },
  { name: "Tuteur", value: 25 },
  { name: "Contenu", value: 15 },
  { name: "D\u00e9cision", value: 10 },
];

const mockChatMessages = [
  { role: "user" as const, text: "Quelles sont les causes d'un triangle rectangle ?" },
  { role: "ai" as const, text: "Un triangle rectangle est un triangle qui poss\u00e8de un angle droit (90\u00b0). Ses propri\u00e9t\u00e9s principales sont :\n\n1. **Th\u00e9or\u00e8me de Pythagore** : a\u00b2 + b\u00b2 = c\u00b2\n2. Le c\u00f4t\u00e9 oppos\u00e9 \u00e0 l'angle droit s'appelle l'hypot\u00e9nuse\n3. Les deux autres c\u00f4t\u00e9s sont les cath\u00e8tes\n\nVoulez-vous un exemple concret ?" },
  { role: "user" as const, text: "Oui, donne-moi un exemple avec des chiffres" },
  { role: "ai" as const, text: "Bien s\u00fbr ! Prenons un triangle avec :\n- Cath\u00e8te a = 3 cm\n- Cath\u00e8te b = 4 cm\n\nCalcul de l'hypot\u00e9nuse c :\nc\u00b2 = 3\u00b2 + 4\u00b2 = 9 + 16 = 25\nc = \u221a25 = **5 cm**\n\nC'est le fameux triangle 3-4-5 !" },
];

const mockGeneratedContent = Array.from({ length: 6 }, (_, i) => ({
  id: `GEN-${String(i + 1).padStart(3, "0")}`,
  title: ["Quiz - Fractions", "R\u00e9sum\u00e9 - R\u00e9volution fran\u00e7aise", "Fiches - Verbes irr\u00e9guliers",
    "Exercices - \u00c9quations", "Quiz - Photosynthèse", "R\u00e9sum\u00e9 - G\u00e9ographie Ha\u00efti"][i],
  type: (["quiz", "summary", "flashcards", "worksheet", "quiz", "summary"] as const)[i],
  subject: ["Math", "Histoire", "Fran\u00e7ais", "Math", "Sciences", "G\u00e9ographie"][i],
  level: ["6\u00e8me", "3\u00e8me", "5\u00e8me", "4\u00e8me", "6\u00e8me", "3\u00e8me"][i],
  date: `2025-0${1 + i}-${10 + i}`,
  questions: [15, 0, 20, 10, 12, 0][i],
}));

const mockRadarData = [
  { subject: "Math", score: 72 },
  { subject: "FR", score: 78 },
  { subject: "Sci", score: 65 },
  { subject: "Hist", score: 70 },
  { subject: "EN", score: 60 },
  { subject: "Phy", score: 55 },
];

/* ─── helpers ─── */
function StatCard({ label, value, icon, color, trend }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; trend?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      {trend && (
        <div className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        </div>
      )}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: { bg: string; text: string } }) {
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color.bg} ${color.text}`}>{label}</span>;
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[70] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up">
      <CheckCircle size={18} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose}><X size={16} /></button>
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function AdminAiPage() {
  const { t } = useTranslation();
  const c: AP = t.aiPage;

  const tabs = [
    { key: "dashboard", label: c.tabDashboard, icon: <Sparkles size={15} /> },
    { key: "performance", label: c.tabPerformance, icon: <BarChart3 size={15} /> },
    { key: "dropout", label: c.tabDropout, icon: <AlertTriangle size={15} /> },
    { key: "tutor", label: c.tabTutor, icon: <GraduationCap size={15} /> },
    { key: "teacher", label: c.tabTeacherAssist, icon: <BookOpen size={15} /> },
    { key: "content", label: c.tabContent, icon: <FileText size={15} /> },
    { key: "decision", label: c.tabDecision, icon: <Target size={15} /> },
    { key: "settings", label: c.tabSettings, icon: <Settings size={15} /> },
  ];

  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.ai.title}
        description={t.pages.admin.ai.desc}
        icon={<Sparkles size={20} />}
      />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition
              ${activeTab === tab.key ? "bg-[#013486] text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && <DashboardTab c={c} />}
      {activeTab === "performance" && <PerformanceTab c={c} />}
      {activeTab === "dropout" && <DropoutTab c={c} showToast={showToast} />}
      {activeTab === "tutor" && <TutorTab c={c} />}
      {activeTab === "teacher" && <TeacherAssistTab c={c} showToast={showToast} />}
      {activeTab === "content" && <ContentTab c={c} showToast={showToast} />}
      {activeTab === "decision" && <DecisionTab c={c} />}
      {activeTab === "settings" && <SettingsTab c={c} showToast={showToast} />}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ═══════════════════════ TAB 1: DASHBOARD ═══════════════════════ */
function DashboardTab({ c }: { c: AP }) {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label={c.activeModels} value="8" icon={<Cpu size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.analysesPerformed} value="1,280" icon={<BarChart3 size={20} className="text-[#F35403]" />} color="bg-[#F35403]/10" trend="up" />
        <StatCard label={c.studentsMonitored} value="456" icon={<Users size={20} className="text-purple-600" />} color="bg-purple-100" />
        <StatCard label={c.alertsGenerated} value="38" icon={<AlertTriangle size={20} className="text-red-600" />} color="bg-red-100" />
        <StatCard label={c.contentGenerated} value="475" icon={<FileText size={20} className="text-green-600" />} color="bg-green-100" trend="up" />
        <StatCard label={c.accuracy} value="94%" icon={<Target size={20} className="text-amber-600" />} color="bg-amber-100" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.aiUsageOverTime}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockAiUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="m" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="analyses" stroke="#013486" strokeWidth={2} name={c.analysesPerformed} />
              <Line type="monotone" dataKey="alerts" stroke="#EF4444" strokeWidth={2} name={c.alertsGenerated} />
              <Line type="monotone" dataKey="content" stroke="#10B981" strokeWidth={2} name={c.contentGenerated} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.aiByModule}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={mockByModule} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {mockByModule.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI modules overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.recentActivity}</h3>
        <div className="space-y-3">
          {[
            { icon: <AlertTriangle size={14} className="text-red-500" />, text: "3 nouveaux \u00e9l\u00e8ves d\u00e9tect\u00e9s \u00e0 risque de d\u00e9crochage", time: "Il y a 2h", color: "bg-red-50" },
            { icon: <FileText size={14} className="text-green-500" />, text: "Quiz auto-g\u00e9n\u00e9r\u00e9 pour Math 6\u00e8me A", time: "Il y a 3h", color: "bg-green-50" },
            { icon: <BarChart3 size={14} className="text-blue-500" />, text: "Analyse trimestrielle compl\u00e9t\u00e9e pour 12 classes", time: "Il y a 5h", color: "bg-blue-50" },
            { icon: <GraduationCap size={14} className="text-purple-500" />, text: "28 sessions de tutorat IA aujourd'hui", time: "Il y a 6h", color: "bg-purple-50" },
            { icon: <Lightbulb size={14} className="text-amber-500" />, text: "Nouvelles recommandations pour 5 enseignants", time: "Il y a 8h", color: "bg-amber-50" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${item.color}`}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">{item.icon}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{item.text}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 2: PERFORMANCE ═══════════════════════ */
function PerformanceTab({ c }: { c: AP }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.performanceTitle}</h2>

      {/* Comparison chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.nationalComparison}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={mockPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="classAvg" fill="#013486" name={c.classAverage} radius={[4, 4, 0, 0]} />
            <Bar dataKey="schoolAvg" fill="#F35403" name={c.schoolAverage} radius={[4, 4, 0, 0]} />
            <Bar dataKey="nationalAvg" fill="#10B981" name={c.nationalAverage} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Radar chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.performanceEvolution}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={mockRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name={c.classAverage} dataKey="score" stroke="#013486" fill="#013486" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Strong/Weak subjects */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
              <TrendingUp size={14} /> {c.strongSubjects}
            </h3>
            <div className="space-y-2">
              {mockPerformanceData.filter(s => s.classAvg >= 70).map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: `${s.classAvg}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-green-700">{s.classAvg}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
              <TrendingDown size={14} /> {c.weakSubjects}
            </h3>
            <div className="space-y-2">
              {mockPerformanceData.filter(s => s.classAvg < 70).map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-red-500" style={{ width: `${s.classAvg}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-red-700">{s.classAvg}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-[#013486] to-[#0148c2] rounded-xl p-5 text-white">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Lightbulb size={16} /> {c.recommendation}</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            "Renforcer le soutien en Physique : 45% des \u00e9l\u00e8ves sous la moyenne",
            "Maintenir l'approche actuelle en Fran\u00e7ais : +8% vs national",
            "Envisager du tutorat pair-\u00e0-pair en Anglais pour les 5\u00e8mes",
          ].map((r, i) => (
            <div key={i} className="bg-white/10 rounded-lg p-3 text-sm text-white/90">{r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 3: DROPOUT DETECTION ═══════════════════════ */
function DropoutTab({ c, showToast }: { c: AP; showToast: (m: string) => void }) {
  const [selectedStudent, setSelectedStudent] = useState<typeof mockAtRiskStudents[0] | null>(null);
  const [filterRisk, setFilterRisk] = useState("all");

  const riskLabels: Record<string, string> = { high: c.highRisk, medium: c.mediumRisk, low: c.lowRisk };
  const factorLabels: Record<string, string> = {
    absences: c.frequentAbsences, gradeDrop: c.gradeDrop, engagement: c.lowEngagement,
    homework: c.missingHomework, behavior: c.behaviorIssues, isolation: c.socialIsolation,
  };

  const filtered = filterRisk === "all" ? mockAtRiskStudents : mockAtRiskStudents.filter(s => s.riskLevel === filterRisk);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{c.dropoutTitle}</h2>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
          <option value="all">{c.all}</option>
          <option value="high">{c.highRisk}</option>
          <option value="medium">{c.mediumRisk}</option>
          <option value="low">{c.lowRisk}</option>
        </select>
      </div>

      {/* Risk summary */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={c.highRisk} value={mockAtRiskStudents.filter(s => s.riskLevel === "high").length}
          icon={<AlertTriangle size={20} className="text-red-600" />} color="bg-red-100" />
        <StatCard label={c.mediumRisk} value={mockAtRiskStudents.filter(s => s.riskLevel === "medium").length}
          icon={<AlertTriangle size={20} className="text-amber-600" />} color="bg-amber-100" />
        <StatCard label={c.lowRisk} value={mockAtRiskStudents.filter(s => s.riskLevel === "low").length}
          icon={<CheckCircle size={20} className="text-green-600" />} color="bg-green-100" />
      </div>

      {/* Risk evolution chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.riskEvolution}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={[
            { m: "Sep", high: 2, medium: 5, low: 8 },
            { m: "Oct", high: 3, medium: 4, low: 7 },
            { m: "Nov", high: 4, medium: 5, low: 6 },
            { m: "Dec", high: 3, medium: 6, low: 5 },
            { m: "Jan", high: 4, medium: 4, low: 4 },
            { m: "Feb", high: 4, medium: 4, low: 4 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="m" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="high" stroke="#EF4444" strokeWidth={2} name={c.highRisk} />
            <Line type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={2} name={c.mediumRisk} />
            <Line type="monotone" dataKey="low" stroke="#10B981" strokeWidth={2} name={c.lowRisk} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Student cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(stu => {
          const rc = RISK_COLORS[stu.riskLevel];
          return (
            <div key={stu.id} onClick={() => setSelectedStudent(stu)}
              className={`rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition ${rc.bg} ${rc.border}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{stu.name}</h4>
                  <p className="text-xs text-gray-500">{stu.class}</p>
                </div>
                <div className={`text-lg font-bold ${rc.text}`}>{stu.riskScore}%</div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                <Badge label={riskLabels[stu.riskLevel]} color={{ bg: rc.bg, text: rc.text }} />
                {stu.alertSent && <Badge label={c.alertSent} color={{ bg: "bg-blue-100", text: "text-blue-700" }} />}
              </div>
              <div className="flex flex-wrap gap-1">
                {stu.factors.map((f, i) => (
                  <span key={i} className="text-xs bg-white/80 text-gray-600 px-2 py-0.5 rounded-full">
                    {factorLabels[f] || f}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Student detail drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedStudent(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto animate-slide-left">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h3>
              <button onClick={() => setSelectedStudent(null)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-3xl font-bold ${RISK_COLORS[selectedStudent.riskLevel].text}`}>{selectedStudent.riskScore}%</p>
                  <p className="text-xs text-gray-500">{c.riskScore}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{selectedStudent.class}</p>
                  <p className="text-xs text-gray-500">{c.class}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{c.riskFactors}</h4>
                <div className="space-y-2">
                  {selectedStudent.factors.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                      <AlertTriangle size={14} className="text-red-500" />
                      <span className="text-sm text-red-700">{factorLabels[f] || f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{c.preventionPlan}</h4>
                <div className="space-y-2">
                  {[c.interventionRecommended, c.parentNotified, c.meetingScheduled].map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <CheckCircle size={14} className="text-blue-500" />
                      <span className="text-sm text-blue-700">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { showToast(c.alertSent); setSelectedStudent(null); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-[#F35403] text-white rounded-lg hover:bg-[#d44a03]">
                  <AlertTriangle size={14} /> {c.earlyWarning}
                </button>
                <button onClick={() => { showToast(c.parentNotified); setSelectedStudent(null); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">
                  <Users size={14} /> {c.parentNotified}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ TAB 4: TUTOR ═══════════════════════ */
function TutorTab({ c }: { c: AP }) {
  const [messages, setMessages] = useState(mockChatMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev,
      { role: "user" as const, text: input },
      { role: "ai" as const, text: "Je r\u00e9fl\u00e9chis \u00e0 votre question... L'IA g\u00e9n\u00e8re une r\u00e9ponse personnalis\u00e9e bas\u00e9e sur le programme scolaire et le niveau de l'\u00e9l\u00e8ve." },
    ]);
    setInput("");
  };

  const quickActions = [
    { label: c.explainLesson, icon: <BookOpen size={14} /> },
    { label: c.solveExercise, icon: <Brain size={14} /> },
    { label: c.simplify, icon: <Lightbulb size={14} /> },
    { label: c.giveExample, icon: <Target size={14} /> },
    { label: c.stepByStep, icon: <Activity size={14} /> },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">{c.tutorTitle}</h2>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Chat area */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ height: 520 }}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#013486] to-[#0148c2] flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{c.tutorChat}</h3>
              <p className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line
                  ${msg.role === "user"
                    ? "bg-[#013486] text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="px-4 py-2 border-t border-gray-50 flex gap-1.5 overflow-x-auto">
            {quickActions.map((qa, i) => (
              <button key={i} onClick={() => setInput(qa.label)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#013486]/10 text-[#013486] rounded-full whitespace-nowrap hover:bg-[#013486]/20">
                {qa.icon} {qa.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Mic size={18} /></button>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder={c.typeYourQuestion}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
            <button onClick={sendMessage}
              className="p-2 rounded-lg bg-[#013486] text-white hover:bg-[#012a6e]"><Send size={18} /></button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{c.suggestedTopics}</h4>
            <div className="space-y-2">
              {["Fractions et d\u00e9cimaux", "Verbes irr\u00e9guliers", "Photosynthèse", "\u00c9quations du 1er degr\u00e9", "G\u00e9ographie d'Ha\u00efti"].map((t, i) => (
                <button key={i} onClick={() => setInput(t)}
                  className="w-full text-left text-sm text-gray-700 p-2 rounded-lg hover:bg-[#013486]/5 transition">
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">{c.learningPath}</h4>
            <div className="space-y-2">
              {[
                { label: c.personalizedExercises, pct: 72, color: "bg-[#013486]" },
                { label: c.adaptiveDifficulty, pct: 85, color: "bg-green-500" },
                { label: c.progressTracking, pct: 60, color: "bg-amber-500" },
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{p.label}</span>
                    <span className="font-semibold">{p.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 5: TEACHER ASSISTANT ═══════════════════════ */
function TeacherAssistTab({ c, showToast }: { c: AP; showToast: (m: string) => void }) {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [genType, setGenType] = useState("exercise");

  const tools = [
    { key: "exercise", label: c.generateExercise, icon: <FileText size={20} />, desc: "Auto-g\u00e9n\u00e9rer des exercices adapt\u00e9s" },
    { key: "exam", label: c.generateExam, icon: <BookOpen size={20} />, desc: "Cr\u00e9er des examens complets" },
    { key: "activity", label: c.generateActivity, icon: <Lightbulb size={20} />, desc: "Proposer des activit\u00e9s p\u00e9dagogiques" },
    { key: "strategy", label: c.teachingStrategy, icon: <Target size={20} />, desc: "Strat\u00e9gies d'enseignement adapt\u00e9es" },
    { key: "analysis", label: c.classAnalysis, icon: <BarChart3 size={20} />, desc: "Analyse d\u00e9taill\u00e9e de la classe" },
    { key: "plan", label: c.lessonPlan, icon: <Brain size={20} />, desc: "G\u00e9n\u00e9rer un plan de cours" },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.teacherAssistTitle}</h2>

      {/* Tool cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map(tool => (
          <button key={tool.key} onClick={() => { setGenType(tool.key); setGenerateOpen(true); }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-left hover:shadow-md hover:border-[#013486]/30 transition group">
            <div className="w-12 h-12 rounded-xl bg-[#013486]/10 flex items-center justify-center mb-3 group-hover:bg-[#013486]/20 transition">
              <span className="text-[#013486]">{tool.icon}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{tool.label}</h3>
            <p className="text-xs text-gray-500">{tool.desc}</p>
          </button>
        ))}
      </div>

      {/* Recent class analysis */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.classAnalysis}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="classAvg" fill="#013486" name={c.classAverage} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Generate modal */}
      {generateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setGenerateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {tools.find(t => t.key === genType)?.label}
              </h3>
              <button onClick={() => setGenerateOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.selectSubject}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    <option>{c.mathematics}</option>
                    <option>{c.french}</option>
                    <option>{c.sciences}</option>
                    <option>{c.history}</option>
                    <option>{c.english}</option>
                    <option>{c.physics}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.selectClass}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    <option>6\u00e8me A</option>
                    <option>5\u00e8me B</option>
                    <option>4\u00e8me A</option>
                    <option>3\u00e8me C</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.selectTopic}</label>
                <input className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30"
                  placeholder="Ex: Les fractions..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.difficultyLevel}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    <option>{c.easy}</option>
                    <option>{c.medium}</option>
                    <option>{c.hard}</option>
                    <option>{c.advanced}</option>
                  </select>
                </div>
                {(genType === "exercise" || genType === "exam") && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">{c.numberOfQuestions}</label>
                    <input type="number" defaultValue={10} min={1} max={50}
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
                  </div>
                )}
              </div>
              {(genType === "exercise" || genType === "exam") && (
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.questionType}</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[c.multipleChoice, c.openEnded, c.trueFalse, c.fillBlanks, c.matching].map((qt, i) => (
                      <label key={i} className="flex items-center gap-1.5 text-sm text-gray-700">
                        <input type="checkbox" defaultChecked={i < 2} className="rounded text-[#013486]" /> {qt}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setGenerateOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{c.cancel}</button>
              <button onClick={() => { setGenerateOpen(false); showToast(c.generate); }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">
                <Sparkles size={14} /> {c.generate}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ TAB 6: CONTENT GENERATION ═══════════════════════ */
function ContentTab({ c, showToast }: { c: AP; showToast: (m: string) => void }) {
  const typeLabels: Record<string, string> = {
    quiz: c.quiz, summary: c.summary, flashcards: c.flashcards, worksheet: c.worksheet,
  };
  const typeColors: Record<string, { bg: string; text: string }> = {
    quiz: { bg: "bg-blue-100", text: "text-blue-700" },
    summary: { bg: "bg-green-100", text: "text-green-700" },
    flashcards: { bg: "bg-purple-100", text: "text-purple-700" },
    worksheet: { bg: "bg-amber-100", text: "text-amber-700" },
  };

  const generators = [
    { key: "quiz", label: c.generateQuiz, icon: <Brain size={24} />, color: "from-blue-500 to-blue-600" },
    { key: "summary", label: c.generateSummary, icon: <FileText size={24} />, color: "from-green-500 to-green-600" },
    { key: "flashcards", label: c.generateFlashcards, icon: <BookOpen size={24} />, color: "from-purple-500 to-purple-600" },
    { key: "worksheet", label: c.generateWorksheet, icon: <GraduationCap size={24} />, color: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.contentTitle}</h2>

      {/* Generator cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {generators.map(gen => (
          <button key={gen.key} onClick={() => showToast(gen.label)}
            className={`bg-gradient-to-br ${gen.color} text-white rounded-xl p-5 text-center hover:shadow-lg transition`}>
            <div className="mx-auto mb-2">{gen.icon}</div>
            <p className="text-sm font-semibold">{gen.label}</p>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={c.quiz} value="42" icon={<Brain size={20} className="text-blue-600" />} color="bg-blue-100" />
        <StatCard label={c.summary} value="28" icon={<FileText size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard label={c.flashcards} value="65" icon={<BookOpen size={20} className="text-purple-600" />} color="bg-purple-100" />
        <StatCard label={c.worksheet} value="34" icon={<GraduationCap size={20} className="text-amber-600" />} color="bg-amber-100" />
      </div>

      {/* Recent generations */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{c.recentGenerations}</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3">{c.contentType}</th>
              <th className="text-left px-4 py-3">{c.subject}</th>
              <th className="text-left px-4 py-3">{c.gradeLevel}</th>
              <th className="text-left px-4 py-3">{c.date}</th>
              <th className="text-left px-4 py-3">{c.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockGeneratedContent.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge label={typeLabels[item.type] || item.type} color={typeColors[item.type] || typeColors.quiz} />
                    <span className="font-medium text-gray-900">{item.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{item.subject}</td>
                <td className="px-4 py-3 text-gray-500">{item.level}</td>
                <td className="px-4 py-3 text-gray-500">{item.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#013486]"><Eye size={14} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Download size={14} /></button>
                    <button onClick={() => showToast(c.regenerate)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 7: DECISION SUPPORT ═══════════════════════ */
function DecisionTab({ c }: { c: AP }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.decisionTitle}</h2>

      {/* Health indices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: c.schoolHealthIndex, value: 78, color: "text-[#013486]", bg: "bg-[#013486]/10" },
          { label: c.engagementIndex, value: 72, color: "text-green-600", bg: "bg-green-100" },
          { label: c.qualityIndex, value: 85, color: "text-purple-600", bg: "bg-purple-100" },
          { label: c.successRate, value: 68, color: "text-amber-600", bg: "bg-amber-100" },
        ].map((idx, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={idx.color === "text-[#013486]" ? "#013486" : idx.color === "text-green-600" ? "#16a34a" : idx.color === "text-purple-600" ? "#9333ea" : "#d97706"}
                  strokeWidth="4" strokeDasharray={`${idx.value * 1.76} 176`} strokeLinecap="round" />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${idx.color}`}>{idx.value}%</span>
            </div>
            <p className="text-xs text-gray-500">{idx.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.successRate} {c.bySubject}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockPerformanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <YAxis dataKey="subject" type="category" tick={{ fontSize: 11 }} width={70} />
              <Tooltip />
              <Bar dataKey="classAvg" fill="#013486" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.trends}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={[
              { m: "Sep", rate: 65, absenteeism: 8 },
              { m: "Oct", rate: 67, absenteeism: 7 },
              { m: "Nov", rate: 70, absenteeism: 9 },
              { m: "Dec", rate: 68, absenteeism: 12 },
              { m: "Jan", rate: 72, absenteeism: 6 },
              { m: "Feb", rate: 74, absenteeism: 5 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="m" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="rate" stroke="#013486" strokeWidth={2} name={c.successRate} />
              <Line type="monotone" dataKey="absenteeism" stroke="#EF4444" strokeWidth={2} name={c.absenteeismRate} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-500" /> {c.insights}
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { title: "Corr\u00e9lation absent\u00e9isme-notes", text: "Les \u00e9l\u00e8ves avec +5 absences/mois ont 40% de chances en moins de r\u00e9ussir.", icon: <AlertTriangle size={14} className="text-red-500" /> },
            { title: "Effet du tutorat IA", text: "Les \u00e9l\u00e8ves utilisant le tuteur IA montrent +12% d'am\u00e9lioration en 3 mois.", icon: <TrendingUp size={14} className="text-green-500" /> },
            { title: "Pic de performance", text: "Les meilleures performances sont observ\u00e9es en janvier-f\u00e9vrier.", icon: <Activity size={14} className="text-blue-500" /> },
            { title: "Pr\u00e9diction fin d'ann\u00e9e", text: "Taux de r\u00e9ussite pr\u00e9dit : 76% (+4% vs ann\u00e9e derni\u00e8re).", icon: <Target size={14} className="text-purple-500" /> },
          ].map((insight, i) => (
            <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">{insight.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 8: SETTINGS ═══════════════════════ */
function SettingsTab({ c, showToast }: { c: AP; showToast: (m: string) => void }) {
  const [settings, setSettings] = useState({
    enableAI: true, autoAlerts: true, parentNotifs: true,
    teacherSuggestions: true, biasDetection: true, transparency: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.settingsTitle}</h2>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* AI Controls */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">{c.enableAI}</h3>
          {[
            { key: "enableAI" as const, label: c.enableAI, desc: "Activer/d\u00e9sactiver toute l'IA" },
            { key: "autoAlerts" as const, label: c.autoAlerts, desc: "Alertes automatiques de d\u00e9crochage" },
            { key: "parentNotifs" as const, label: c.parentNotifications, desc: "Notifications aux parents" },
            { key: "teacherSuggestions" as const, label: c.teacherSuggestions, desc: "Suggestions p\u00e9dagogiques" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <button onClick={() => toggle(item.key)} className="p-1">
                {settings[item.key]
                  ? <ToggleRight size={24} className="text-green-500" />
                  : <ToggleLeft size={24} className="text-gray-300" />}
              </button>
            </div>
          ))}
        </div>

        {/* Security & Ethics */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={16} className="text-[#013486]" /> {c.dataPrivacy}
          </h3>
          {[
            { key: "transparency" as const, label: c.algorithmTransparency, icon: <Eye size={14} /> },
            { key: "biasDetection" as const, label: c.biasDetection, icon: <Shield size={14} /> },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-[#013486]">{item.icon}</span>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
              </div>
              <button onClick={() => toggle(item.key)} className="p-1">
                {settings[item.key]
                  ? <ToggleRight size={24} className="text-green-500" />
                  : <ToggleLeft size={24} className="text-gray-300" />}
              </button>
            </div>
          ))}

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{c.modelVersion}</span>
              <span className="font-medium text-gray-900">EDUCA-AI v2.4</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{c.lastTraining}</span>
              <span className="font-medium text-gray-900">2025-01-15</span>
            </div>
          </div>
        </div>

        {/* API Usage */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.apiUsage}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#013486]">50,000</p>
              <p className="text-xs text-gray-500">{c.monthlyQuota}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#F35403]">32,450</p>
              <p className="text-xs text-gray-500">{c.usedQuota}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">17,550</p>
              <p className="text-xs text-gray-500">{c.remainingQuota}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-[#013486] to-[#F35403]" style={{ width: "65%" }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">{c.resetDate}: 2025-03-01</p>
          </div>
        </div>
      </div>

      {/* Translation features */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe size={16} className="text-[#013486]" /> {c.translationTitle}
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { label: c.frenchToCreole, icon: <Globe size={16} /> },
            { label: c.creoleToFrench, icon: <Globe size={16} /> },
            { label: c.simplifyLanguage, icon: <Lightbulb size={16} /> },
            { label: c.ageAdaptation, icon: <Users size={16} /> },
            { label: c.inclusiveEducation, icon: <GraduationCap size={16} /> },
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-[#013486]">{feat.icon}</span>
              <span className="text-sm text-gray-700">{feat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => showToast(c.save)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}
