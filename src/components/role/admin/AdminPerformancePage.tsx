"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp, TrendingDown, Eye, Users, BookOpen, BarChart3,
  Target, Bell, FileText, GitCompareArrows, CheckCircle, X,
  Search, AlertTriangle, Clock, Download, ChevronRight,
  Minus, ArrowUpRight, ArrowDownRight, Send, Brain,
} from "lucide-react";

/* ─── type alias ─── */
type PP = ReturnType<typeof useTranslation>["t"]["performancePage"];

/* ─── palette ─── */
const PIE_COLORS = ["#013486", "#F35403", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

/* ─── helpers ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[70] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up">
      <CheckCircle size={18} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose}><X size={16} /></button>
    </div>
  );
}

function StatCard({ label, value, icon, color, trend, sub }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; trend?: "up" | "down" | "stable"; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      {trend && (
        <div className={`text-xs font-medium ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-400"}`}>
          {trend === "up" ? <TrendingUp size={14} /> : trend === "down" ? <TrendingDown size={14} /> : <Minus size={14} />}
        </div>
      )}
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function SectionCard({ title, desc, children, action }: {
  title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ─── mock data ─── */
const mockStudents = Array.from({ length: 15 }, (_, i) => ({
  id: `STU-${String(i + 1).padStart(3, "0")}`,
  name: ["Jean Pierre", "Marie Claire", "Paul Henri", "Sophie B.", "Marc Antoine",
    "Julie Dupont", "Robert Louis", "Anne Marie", "Pierre Charles", "Claudine J.",
    "Emmanuel P.", "Françoise M.", "Luc Étienne", "Nathalie R.", "Frantz J."][i],
  class: ["6ème A", "6ème B", "5ème A", "5ème B", "4ème A", "3ème A", "3ème C"][i % 7],
  average: [78, 65, 82, 55, 71, 88, 42, 76, 68, 59, 85, 62, 74, 48, 91][i],
  attendance: [95, 88, 97, 72, 90, 99, 65, 93, 86, 78, 96, 80, 92, 70, 98][i],
  trend: (["up", "down", "up", "down", "stable", "up", "down", "up", "stable", "down", "up", "down", "up", "down", "up"] as const)[i],
  alert: i === 3 || i === 6 || i === 13 ? "critical" : i === 9 || i === 11 ? "warning" : "none",
}));

const mockClassPerf = [
  { name: "6ème A", avg: 72, rate: 85, absent: 5.2 },
  { name: "6ème B", avg: 68, rate: 78, absent: 7.1 },
  { name: "5ème A", avg: 75, rate: 88, absent: 4.8 },
  { name: "5ème B", avg: 64, rate: 72, absent: 8.5 },
  { name: "4ème A", avg: 70, rate: 82, absent: 6.0 },
  { name: "3ème A", avg: 66, rate: 76, absent: 7.8 },
  { name: "3ème C", avg: 62, rate: 70, absent: 9.2 },
];

const mockSubjectPerf = [
  { name: "Mathématiques", avg: 62, rate: 68, difficulty: "difficult" },
  { name: "Français", avg: 74, rate: 82, difficulty: "moderate" },
  { name: "Sciences", avg: 65, rate: 72, difficulty: "moderate" },
  { name: "Histoire-Géo", avg: 70, rate: 78, difficulty: "easy" },
  { name: "Anglais", avg: 58, rate: 65, difficulty: "difficult" },
  { name: "Physique", avg: 55, rate: 60, difficulty: "difficult" },
];

const mockEvolution = [
  { period: "Sep", rate: 65, avg: 62, absent: 8 },
  { period: "Oct", rate: 68, avg: 64, absent: 7 },
  { period: "Nov", rate: 70, avg: 66, absent: 7.5 },
  { period: "Déc", rate: 72, avg: 68, absent: 6 },
  { period: "Jan", rate: 75, avg: 70, absent: 5.5 },
  { period: "Fév", rate: 76, avg: 72, absent: 5 },
];

const mockAlerts = [
  { student: "Sophie B.", type: "performanceDrop", class: "5ème B", date: "2025-02-15", status: "active", sentTo: ["teacher", "parent"] },
  { student: "Robert Louis", type: "absenteeism", class: "3ème C", date: "2025-02-14", status: "active", sentTo: ["teacher", "administration"] },
  { student: "Frantz J.", type: "dropoutRisk", class: "3ème C", date: "2025-02-13", status: "active", sentTo: ["teacher", "parent", "administration"] },
  { student: "Claudine J.", type: "homework", class: "3ème A", date: "2025-02-12", status: "resolved", sentTo: ["teacher"] },
  { student: "Nathalie R.", type: "performanceDrop", class: "3ème C", date: "2025-02-10", status: "resolved", sentTo: ["teacher", "parent"] },
  { student: "Emmanuel P.", type: "absenteeism", class: "5ème A", date: "2025-02-08", status: "resolved", sentTo: ["parent"] },
];

const mockRadar = [
  { subject: "Math", score: 62 }, { subject: "FR", score: 74 }, { subject: "Sci", score: 65 },
  { subject: "Hist", score: 70 }, { subject: "EN", score: 58 }, { subject: "Phy", score: 55 },
];

const mockReports = [
  { name: "Rapport T1 — 6ème A", type: "performance", date: "2025-01-15", format: "PDF" },
  { name: "Bulletin T1 — Tous", type: "bulletin", date: "2025-01-10", format: "PDF" },
  { name: "Statistiques semestrielles", type: "stats", date: "2025-01-05", format: "Excel" },
  { name: "Rapport inspection Ministère", type: "inspection", date: "2024-12-20", format: "PDF" },
];

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function AdminPerformancePage() {
  const { t } = useTranslation();
  const c: PP = t.performancePage;

  const tabs = [
    { key: "overview", label: c.tabOverview, icon: <Eye size={15} /> },
    { key: "students", label: c.tabStudents, icon: <Users size={15} /> },
    { key: "classes", label: c.tabClasses, icon: <BookOpen size={15} /> },
    { key: "subjects", label: c.tabSubjects, icon: <BarChart3 size={15} /> },
    { key: "kpi", label: c.tabKpi, icon: <Target size={15} /> },
    { key: "alerts", label: c.tabAlerts, icon: <Bell size={15} /> },
    { key: "reports", label: c.tabReports, icon: <FileText size={15} /> },
    { key: "comparison", label: c.tabComparison, icon: <GitCompareArrows size={15} /> },
  ];

  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-5">
      <PageHeader title={t.pages.admin.performance.title} description={t.pages.admin.performance.desc} icon={<TrendingUp size={20} />} />

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition
              ${activeTab === tab.key ? "bg-[#013486] text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab c={c} />}
      {activeTab === "students" && <StudentsTab c={c} />}
      {activeTab === "classes" && <ClassesTab c={c} />}
      {activeTab === "subjects" && <SubjectsTab c={c} />}
      {activeTab === "kpi" && <KpiTab c={c} />}
      {activeTab === "alerts" && <AlertsTab c={c} showToast={showToast} />}
      {activeTab === "reports" && <ReportsTab c={c} showToast={showToast} />}
      {activeTab === "comparison" && <ComparisonTab c={c} />}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ═══════════════════════ TAB 1: OVERVIEW ═══════════════════════ */
function OverviewTab({ c }: { c: PP }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.overviewTitle}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label={c.successRate} value="76%" icon={<TrendingUp size={20} className="text-green-600" />} color="bg-green-100" trend="up" />
        <StatCard label={c.avgGrade} value="68/100" icon={<BarChart3 size={20} className="text-[#013486]" />} color="bg-[#013486]/10" trend="up" />
        <StatCard label={c.absenteeismRate} value="6.2%" icon={<Clock size={20} className="text-red-600" />} color="bg-red-100" trend="down" />
        <StatCard label={c.totalStudents} value="452" icon={<Users size={20} className="text-purple-600" />} color="bg-purple-100" />
        <StatCard label={c.studentsInDifficulty} value="38" icon={<AlertTriangle size={20} className="text-amber-600" />} color="bg-amber-100" />
        <StatCard label={c.studentsExcelling} value="64" icon={<Target size={20} className="text-[#F35403]" />} color="bg-[#F35403]/10" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title={c.performanceEvolution}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} name={c.successRate} />
              <Line type="monotone" dataKey="avg" stroke="#013486" strokeWidth={2} name={c.avgGrade} />
              <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} name={c.absenteeismRate} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={c.performanceBySubject}>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={mockRadar}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name={c.avgGrade} dataKey="score" stroke="#013486" fill="#013486" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title={c.performanceByLevel}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockClassPerf}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="avg" fill="#013486" name={c.avgGrade} radius={[4, 4, 0, 0]} />
            <Bar dataKey="rate" fill="#10B981" name={c.successRate} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════ TAB 2: STUDENTS ═══════════════════════ */
function StudentsTab({ c }: { c: PP }) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);

  const filtered = useMemo(() =>
    mockStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase())),
    [search]);

  const alertColors: Record<string, { bg: string; text: string }> = {
    none: { bg: "bg-green-100", text: "text-green-700" },
    warning: { bg: "bg-amber-100", text: "text-amber-700" },
    critical: { bg: "bg-red-100", text: "text-red-700" },
  };
  const alertLabels: Record<string, string> = { none: c.noAlert, warning: c.warning, critical: c.critical };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{c.studentsTitle}</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={c.searchStudent}
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3">{c.studentName}</th>
              <th className="text-left px-4 py-3">{c.class}</th>
              <th className="text-center px-4 py-3">{c.average}</th>
              <th className="text-center px-4 py-3">{c.attendance}</th>
              <th className="text-center px-4 py-3">{c.trend}</th>
              <th className="text-center px-4 py-3">{c.alertLevel}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(s => {
              const ac = alertColors[s.alert];
              return (
                <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedStudent(s)}>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.class}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${s.average >= 70 ? "text-green-600" : s.average >= 50 ? "text-amber-600" : "text-red-600"}`}>{s.average}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{s.attendance}%</td>
                  <td className="px-4 py-3 text-center">
                    {s.trend === "up" ? <ArrowUpRight size={16} className="text-green-500 mx-auto" />
                      : s.trend === "down" ? <ArrowDownRight size={16} className="text-red-500 mx-auto" />
                      : <Minus size={16} className="text-gray-400 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ac.bg} ${ac.text}`}>{alertLabels[s.alert]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded hover:bg-gray-100 text-[#013486]"><Eye size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${selectedStudent.average >= 70 ? "text-green-600" : selectedStudent.average >= 50 ? "text-amber-600" : "text-red-600"}`}>{selectedStudent.average}</p>
                  <p className="text-xs text-gray-500">{c.average}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#013486]">{selectedStudent.attendance}%</p>
                  <p className="text-xs text-gray-500">{c.attendance}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">{selectedStudent.class}</p>
                  <p className="text-xs text-gray-500">{c.class}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{c.gradesBySubject}</h4>
                <div className="space-y-2">
                  {mockSubjectPerf.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${s.avg >= 70 ? "bg-green-500" : s.avg >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s.avg}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8">{s.avg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: c.homeworkRate, value: "85%", color: "text-[#013486]" },
                  { label: c.participationScore, value: "72%", color: "text-green-600" },
                  { label: c.behaviorScore, value: "90%", color: "text-purple-600" },
                ].map((s, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded-lg text-center">
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ TAB 3: CLASSES ═══════════════════════ */
function ClassesTab({ c }: { c: PP }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.classesTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.classesDesc}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={c.bestClass} value="5ème A" icon={<TrendingUp size={20} className="text-green-600" />} color="bg-green-100" sub="75 avg" />
        <StatCard label={c.worstClass} value="3ème C" icon={<TrendingDown size={20} className="text-red-600" />} color="bg-red-100" sub="62 avg" />
        <StatCard label={c.classAverage} value="68" icon={<BarChart3 size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.classSuccessRate} value="76%" icon={<Target size={20} className="text-amber-600" />} color="bg-amber-100" />
      </div>

      <SectionCard title={c.classComparison}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={mockClassPerf} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="avg" fill="#013486" name={c.classAverage} radius={[0, 4, 4, 0]} />
            <Bar dataKey="rate" fill="#10B981" name={c.classSuccessRate} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title={c.classRanking}>
        <div className="space-y-2">
          {[...mockClassPerf].sort((a, b) => b.avg - a.avg).map((cls, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                <span className="text-sm font-medium text-gray-900">{cls.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{cls.avg}/100</p>
                  <p className="text-xs text-gray-400">{cls.rate}% {c.classSuccessRate}</p>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${cls.avg >= 70 ? "bg-green-500" : cls.avg >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${cls.avg}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════ TAB 4: SUBJECTS ═══════════════════════ */
function SubjectsTab({ c }: { c: PP }) {
  const diffColors: Record<string, { bg: string; text: string }> = {
    easy: { bg: "bg-green-100", text: "text-green-700" },
    moderate: { bg: "bg-amber-100", text: "text-amber-700" },
    difficult: { bg: "bg-red-100", text: "text-red-700" },
  };
  const diffLabels: Record<string, string> = { easy: c.easy, moderate: c.moderate, difficult: c.difficult };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.subjectsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.subjectsDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title={c.subjectEvolution}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockSubjectPerf}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avg" fill="#013486" name={c.subjectAvg} radius={[4, 4, 0, 0]} />
              <Bar dataKey="rate" fill="#10B981" name={c.subjectPassRate} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={c.subjectDifficulty}>
          <div className="space-y-2">
            {mockSubjectPerf.map((s, i) => {
              const dc = diffColors[s.difficulty];
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{s.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dc.bg} ${dc.text}`}>{diffLabels[s.difficulty]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${s.avg >= 70 ? "bg-green-500" : s.avg >= 55 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s.avg}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-8">{s.avg}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
          <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2"><TrendingDown size={14} /> {c.mostDifficult}</h3>
          <div className="space-y-2">
            {mockSubjectPerf.filter(s => s.difficulty === "difficult").map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-white/80 p-2.5 rounded-lg">
                <span className="text-sm text-red-800">{s.name}</span>
                <span className="text-sm font-bold text-red-700">{s.avg}/100</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2"><TrendingUp size={14} /> {c.mostSuccessful}</h3>
          <div className="space-y-2">
            {mockSubjectPerf.filter(s => s.avg >= 70).map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-white/80 p-2.5 rounded-lg">
                <span className="text-sm text-green-800">{s.name}</span>
                <span className="text-sm font-bold text-green-700">{s.avg}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 5: KPI ═══════════════════════ */
function KpiTab({ c }: { c: PP }) {
  const academicKpis = [
    { label: c.successRate, target: 80, actual: 76, unit: "%" },
    { label: c.avgGrade, target: 70, actual: 68, unit: "/100" },
    { label: c.repeatRate, target: 5, actual: 8, unit: "%" },
    { label: c.dropoutRate, target: 2, actual: 3.5, unit: "%" },
  ];
  const behavioralKpis = [
    { label: c.punctuality, target: 95, actual: 91, unit: "%" },
    { label: c.engagement, target: 85, actual: 78, unit: "%" },
    { label: c.lateRate, target: 3, actual: 5.2, unit: "%" },
    { label: c.participationRate, target: 80, actual: 72, unit: "%" },
    { label: c.homeworkCompletion, target: 90, actual: 82, unit: "%" },
  ];

  function KpiRow({ label, target, actual, unit }: { label: string; target: number; actual: number; unit: string }) {
    const isLowerBetter = label === c.repeatRate || label === c.dropoutRate || label === c.lateRate || label === c.absenteeismRate;
    const good = isLowerBetter ? actual <= target : actual >= target;
    const gap = actual - target;
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
        <span className="text-sm text-gray-700 flex-1">{label}</span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">{c.target}: {target}{unit}</span>
          <span className={`text-sm font-bold ${good ? "text-green-600" : "text-red-600"}`}>{actual}{unit}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${good ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {gap > 0 ? "+" : ""}{gap.toFixed(1)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.kpiTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.kpiDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title={c.academicKpi}>
          <div className="space-y-2">
            {academicKpis.map((k, i) => <KpiRow key={i} {...k} />)}
          </div>
        </SectionCard>

        <SectionCard title={c.behavioralKpi}>
          <div className="space-y-2">
            {behavioralKpis.map((k, i) => <KpiRow key={i} {...k} />)}
          </div>
        </SectionCard>
      </div>

      {/* KPI gauge-style cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: c.successRate, value: 76, target: 80, color: "#10B981" },
          { label: c.engagement, value: 78, target: 85, color: "#013486" },
          { label: c.punctuality, value: 91, target: 95, color: "#8B5CF6" },
          { label: c.homeworkCompletion, value: 82, target: 90, color: "#F59E0B" },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={k.color} strokeWidth="4" strokeDasharray={`${k.value * 1.76} 176`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">{k.value}%</span>
            </div>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="text-[10px] text-gray-400">{c.target}: {k.target}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 6: ALERTS ═══════════════════════ */
function AlertsTab({ c, showToast }: { c: PP; showToast: (m: string) => void }) {
  const typeLabels: Record<string, string> = {
    performanceDrop: c.alertPerformanceDrop, absenteeism: c.alertAbsenteeism,
    dropoutRisk: c.alertDropoutRisk, homework: c.alertHomework, behavior: c.alertBehavior,
  };
  const typeColors: Record<string, { bg: string; text: string }> = {
    performanceDrop: { bg: "bg-amber-100", text: "text-amber-700" },
    absenteeism: { bg: "bg-red-100", text: "text-red-700" },
    dropoutRisk: { bg: "bg-red-100", text: "text-red-700" },
    homework: { bg: "bg-blue-100", text: "text-blue-700" },
    behavior: { bg: "bg-purple-100", text: "text-purple-700" },
  };
  const recipientLabels: Record<string, string> = { teacher: c.teacher, parent: c.parent, administration: c.administration };

  const active = mockAlerts.filter(a => a.status === "active");
  const resolved = mockAlerts.filter(a => a.status === "resolved");

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.alertsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.alertsDesc}</p>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={c.activeAlerts} value={active.length} icon={<AlertTriangle size={20} className="text-red-600" />} color="bg-red-100" />
        <StatCard label={c.resolvedAlerts} value={resolved.length} icon={<CheckCircle size={20} className="text-green-600" />} color="bg-green-100" />
      </div>

      <SectionCard title={c.activeAlerts}>
        <div className="space-y-3">
          {active.map((alert, i) => {
            const tc = typeColors[alert.type] || typeColors.performanceDrop;
            return (
              <div key={i} className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-sm font-semibold text-gray-900">{alert.student}</span>
                    <span className="text-xs text-gray-500">{alert.class}</span>
                  </div>
                  <span className="text-xs text-gray-400">{alert.date}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>{typeLabels[alert.type]}</span>
                  <span className="text-xs text-gray-400">{c.sentTo}: {alert.sentTo.map(r => recipientLabels[r]).join(", ")}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => showToast(c.alertMarkedResolved)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <CheckCircle size={12} /> {c.markResolved}
                  </button>
                  <button onClick={() => showToast(c.notificationSent)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">
                    <Send size={12} /> {c.sendNotification}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title={c.alertHistory}>
        <div className="space-y-2">
          {resolved.map((alert, i) => {
            const tc = typeColors[alert.type] || typeColors.performanceDrop;
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm text-gray-700">{alert.student}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>{typeLabels[alert.type]}</span>
                </div>
                <span className="text-xs text-gray-400">{alert.date}</span>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════ TAB 7: REPORTS ═══════════════════════ */
function ReportsTab({ c, showToast }: { c: PP; showToast: (m: string) => void }) {
  const [reportType, setReportType] = useState("performance");
  const [reportFormat, setReportFormat] = useState("pdf");

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.reportsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.reportsDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title={c.generateReport}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">{c.reportType}</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                <option value="bulletin">{c.reportBulletin}</option>
                <option value="performance">{c.reportPerformance}</option>
                <option value="stats">{c.reportStats}</option>
                <option value="inspection">{c.reportInspection}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{c.reportPeriod}</label>
                <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                  <option>1er Trimestre</option>
                  <option>2e Trimestre</option>
                  <option>3e Trimestre</option>
                  <option>Année complète</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.reportClass}</label>
                <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                  <option>Toutes les classes</option>
                  {mockClassPerf.map((cls, i) => <option key={i}>{cls.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{c.reportFormat}</label>
              <div className="flex gap-2 mt-1">
                {[
                  { key: "pdf", label: c.formatPdf },
                  { key: "excel", label: c.formatExcel },
                  { key: "csv", label: c.formatCsv },
                ].map(f => (
                  <button key={f.key} onClick={() => setReportFormat(f.key)}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition ${reportFormat === f.key
                      ? "border-[#013486] bg-[#013486]/5 text-[#013486] font-semibold" : "border-gray-200 text-gray-600"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => showToast(c.reportGenerated)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-lg hover:bg-[#012a6e]">
              <FileText size={14} /> {c.generateReport}
            </button>
          </div>
        </SectionCard>

        <SectionCard title={c.recentReports}>
          <div className="space-y-2">
            {mockReports.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#013486]/10 rounded-lg flex items-center justify-center">
                    <FileText size={14} className="text-[#013486]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.date} • {r.format}</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-gray-200 text-[#013486]"><Download size={14} /></button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 8: COMPARISON ═══════════════════════ */
function ComparisonTab({ c }: { c: PP }) {
  const [mode, setMode] = useState("periods");

  const periodComparison = [
    { subject: "Mathématiques", p1: 60, p2: 65, diff: 5 },
    { subject: "Français", p1: 72, p2: 74, diff: 2 },
    { subject: "Sciences", p1: 63, p2: 65, diff: 2 },
    { subject: "Histoire-Géo", p1: 68, p2: 70, diff: 2 },
    { subject: "Anglais", p1: 55, p2: 58, diff: 3 },
    { subject: "Physique", p1: 52, p2: 55, diff: 3 },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.comparisonTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.comparisonDesc}</p>

      <div className="flex gap-2">
        {[
          { key: "periods", label: c.comparePeriods },
          { key: "classes", label: c.compareClasses },
          { key: "years", label: c.compareYears },
          { key: "subjects", label: c.compareSubjects },
        ].map(m => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition ${mode === m.key
              ? "bg-[#013486] text-white shadow" : "text-gray-600 bg-gray-100 hover:bg-gray-200"}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title={`${c.period1} ${c.vs} ${c.period2}`}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={periodComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="p1" fill="#013486" name={c.period1} radius={[4, 4, 0, 0]} />
              <Bar dataKey="p2" fill="#10B981" name={c.period2} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={c.difference}>
          <div className="space-y-2">
            {periodComparison.map((row, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-700">{row.subject}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{row.p1} → {row.p2}</span>
                  <span className={`flex items-center gap-1 text-sm font-bold ${row.diff > 0 ? "text-green-600" : row.diff < 0 ? "text-red-600" : "text-gray-400"}`}>
                    {row.diff > 0 ? <ArrowUpRight size={14} /> : row.diff < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                    {row.diff > 0 ? "+" : ""}{row.diff}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.diff > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {row.diff > 0 ? c.improvement : row.diff < 0 ? c.decline : c.noChange}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Year comparison */}
      <SectionCard title={c.compareYears}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { year: "2023–2024", rate: 65, avg: 62 },
            { year: "2024–2025", rate: 72, avg: 68 },
            { year: "2025–2026", rate: 76, avg: 72 },
          ].map((y, i) => (
            <div key={i} className={`p-4 rounded-xl border-2 text-center ${i === 2 ? "border-[#013486] bg-[#013486]/5" : "border-gray-200"}`}>
              <p className="text-sm font-semibold text-gray-900">{y.year}</p>
              <p className="text-2xl font-bold text-[#013486] mt-2">{y.rate}%</p>
              <p className="text-xs text-gray-500">{c.successRate}</p>
              <p className="text-lg font-bold text-gray-700 mt-1">{y.avg}/100</p>
              <p className="text-xs text-gray-400">{c.avgGrade}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
