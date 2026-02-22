"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  Calendar, Eye, Plus, X, CheckCircle, Clock, Settings,
  GraduationCap, BookOpen, Users, DollarSign, Archive,
  ArrowRightLeft, BarChart3, TrendingUp, TrendingDown,
  AlertTriangle, FileText, CalendarDays, Layers, Award,
  CreditCard, RefreshCw, Play, ChevronRight, Download,
  ToggleLeft, ToggleRight, Zap, Database,
} from "lucide-react";

/* ─── type alias ─── */
type SY = ReturnType<typeof useTranslation>["t"]["schoolYearPage"];

/* ─── palette ─── */
const PIE_COLORS = ["#013486", "#F35403", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  planned: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  ended: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
  archived: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

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

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
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

function ToggleRow({ label, desc, enabled, onToggle, icon }: {
  label: string; desc?: string; enabled: boolean; onToggle: () => void; icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        {icon && <span className="text-[#013486]">{icon}</span>}
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {desc && <p className="text-xs text-gray-500">{desc}</p>}
        </div>
      </div>
      <button onClick={onToggle} className="p-1">
        {enabled ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} className="text-gray-300" />}
      </button>
    </div>
  );
}

/* ─── mock data ─── */
const mockYears = [
  { name: "2025–2026", start: "2025-09-08", end: "2026-06-26", status: "active", students: 452, classes: 32 },
  { name: "2024–2025", start: "2024-09-09", end: "2025-06-27", status: "archived", students: 438, classes: 30 },
  { name: "2023–2024", start: "2023-09-11", end: "2024-06-28", status: "archived", students: 415, classes: 28 },
];

const mockCalendarEvents = [
  { name: "Rentrée scolaire", type: "other", start: "2025-09-08", end: "2025-09-08" },
  { name: "Vacances de la Toussaint", type: "holiday", start: "2025-10-27", end: "2025-11-03" },
  { name: "Examens 1er trimestre", type: "exam", start: "2025-12-08", end: "2025-12-19" },
  { name: "Vacances de Noël", type: "holiday", start: "2025-12-22", end: "2026-01-05" },
  { name: "Journée pédagogique", type: "pedagogical", start: "2026-01-12", end: "2026-01-12" },
  { name: "Jour des Ancêtres", type: "publicHoliday", start: "2026-01-02", end: "2026-01-02" },
  { name: "Carnaval", type: "holiday", start: "2026-02-16", end: "2026-02-18" },
  { name: "Examens 2e trimestre", type: "exam", start: "2026-03-16", end: "2026-03-27" },
  { name: "Vacances de Pâques", type: "holiday", start: "2026-04-06", end: "2026-04-17" },
  { name: "Examens finaux", type: "exam", start: "2026-06-08", end: "2026-06-19" },
  { name: "Fin des cours", type: "other", start: "2026-06-26", end: "2026-06-26" },
];

const mockPerformanceByMonth = [
  { month: "Sep", avg: 62 }, { month: "Oct", avg: 65 }, { month: "Nov", avg: 64 },
  { month: "Déc", avg: 68 }, { month: "Jan", avg: 70 }, { month: "Fév", avg: 72 },
];

const mockPerformanceByClass = [
  { name: "6ème A", avg: 72 }, { name: "6ème B", avg: 68 }, { name: "5ème A", avg: 75 },
  { name: "5ème B", avg: 64 }, { name: "4ème A", avg: 70 }, { name: "3ème A", avg: 66 },
  { name: "3ème C", avg: 62 },
];

const mockGenderDist = [{ name: "Garçons", value: 235 }, { name: "Filles", value: 217 }];

const mockPaymentSchedule = [
  { month: "Sep", amount: 5000, due: "2025-09-15", paid: true },
  { month: "Oct", amount: 5000, due: "2025-10-15", paid: true },
  { month: "Nov", amount: 5000, due: "2025-11-15", paid: true },
  { month: "Déc", amount: 5000, due: "2025-12-15", paid: true },
  { month: "Jan", amount: 5000, due: "2026-01-15", paid: true },
  { month: "Fév", amount: 5000, due: "2026-02-15", paid: false },
  { month: "Mar", amount: 5000, due: "2026-03-15", paid: false },
  { month: "Avr", amount: 5000, due: "2026-04-15", paid: false },
  { month: "Mai", amount: 5000, due: "2026-05-15", paid: false },
  { month: "Jun", amount: 5000, due: "2026-06-15", paid: false },
];

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function AdminSchoolYearPage() {
  const { t } = useTranslation();
  const c: SY = t.schoolYearPage;

  const tabs = [
    { key: "overview", label: c.tabOverview, icon: <Eye size={15} /> },
    { key: "calendar", label: c.tabCalendar, icon: <CalendarDays size={15} /> },
    { key: "periods", label: c.tabPeriods, icon: <Layers size={15} /> },
    { key: "evaluation", label: c.tabEvaluation, icon: <Award size={15} /> },
    { key: "enrollment", label: c.tabEnrollment, icon: <GraduationCap size={15} /> },
    { key: "classes", label: c.tabClasses, icon: <Users size={15} /> },
    { key: "stats", label: c.tabStats, icon: <BarChart3 size={15} /> },
    { key: "finance", label: c.tabFinance, icon: <CreditCard size={15} /> },
    { key: "archive", label: c.tabArchive, icon: <Archive size={15} /> },
    { key: "transition", label: c.tabTransition, icon: <ArrowRightLeft size={15} /> },
  ];

  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.schoolYear.title}
        description={t.pages.admin.schoolYear.desc}
        icon={<Calendar size={20} />}
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

      {activeTab === "overview" && <OverviewTab c={c} showToast={showToast} />}
      {activeTab === "calendar" && <CalendarTab c={c} showToast={showToast} />}
      {activeTab === "periods" && <PeriodsTab c={c} showToast={showToast} />}
      {activeTab === "evaluation" && <EvaluationTab c={c} showToast={showToast} />}
      {activeTab === "enrollment" && <EnrollmentTab c={c} showToast={showToast} />}
      {activeTab === "classes" && <ClassAssignmentTab c={c} showToast={showToast} />}
      {activeTab === "stats" && <StatsTab c={c} />}
      {activeTab === "finance" && <FinanceTab c={c} showToast={showToast} />}
      {activeTab === "archive" && <ArchiveTab c={c} showToast={showToast} />}
      {activeTab === "transition" && <TransitionTab c={c} showToast={showToast} />}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ═══════════════════════ TAB 1: OVERVIEW ═══════════════════════ */
function OverviewTab({ c, showToast }: { c: SY; showToast: (m: string) => void }) {
  const current = mockYears[0];
  const elapsed = 164;
  const total = 290;
  const pct = Math.round((elapsed / total) * 100);

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.overviewTitle}</h2>

      {/* Current year card */}
      <div className="bg-gradient-to-r from-[#013486] to-[#0148c2] rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/60">{c.currentYear}</p>
            <h3 className="text-2xl font-bold">{current.name}</h3>
            <p className="text-sm text-white/80 mt-1">{current.start} → {current.end}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-400/20 text-green-300 text-xs font-medium rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full" /> {c.statusActive}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/70">
            <span>{c.progress} — {pct}%</span>
            <span>{elapsed}/{total} {c.totalDays}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5">
            <div className="h-2.5 rounded-full bg-white" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>{elapsed} {c.daysElapsed}</span>
            <span>{total - elapsed} {c.daysRemaining}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={c.totalDays} value={total} icon={<CalendarDays size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.daysElapsed} value={elapsed} icon={<Clock size={20} className="text-[#F35403]" />} color="bg-[#F35403]/10" />
        <StatCard label="Élèves" value={current.students} icon={<Users size={20} className="text-purple-600" />} color="bg-purple-100" />
        <StatCard label="Classes" value={current.classes} icon={<BookOpen size={20} className="text-green-600" />} color="bg-green-100" />
      </div>

      {/* Year history */}
      <SectionCard title={c.yearHistory}
        action={<button onClick={() => showToast(c.yearCreated)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]"><Plus size={12} /> {c.createYear}</button>}>
        <div className="space-y-2">
          {mockYears.map((year, i) => {
            const sc = STATUS_COLORS[year.status] || STATUS_COLORS.ended;
            return (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${sc.bg} border-gray-100`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${sc.dot}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{year.name}</p>
                    <p className="text-xs text-gray-500">{year.start} → {year.end}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{year.students} élèves • {year.classes} classes</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                    {year.status === "active" ? c.statusActive : year.status === "planned" ? c.statusPlanned : year.status === "ended" ? c.statusEnded : c.statusArchived}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-center gap-3">
        <AlertTriangle size={16} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700">{c.oneActiveWarning}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 2: CALENDAR ═══════════════════════ */
function CalendarTab({ c, showToast }: { c: SY; showToast: (m: string) => void }) {
  const typeColors: Record<string, { bg: string; text: string }> = {
    holiday: { bg: "bg-orange-100", text: "text-orange-700" },
    publicHoliday: { bg: "bg-red-100", text: "text-red-700" },
    pedagogical: { bg: "bg-purple-100", text: "text-purple-700" },
    exam: { bg: "bg-blue-100", text: "text-blue-700" },
    other: { bg: "bg-gray-100", text: "text-gray-700" },
  };
  const typeLabels: Record<string, string> = {
    holiday: c.typeHoliday, publicHoliday: c.typePublicHoliday,
    pedagogical: c.typePedagogical, exam: c.typeExam, other: c.typeOther,
  };

  const schoolDays = 185;
  const holidayDays = 65;
  const examDays = 30;

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.calendarTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.calendarDesc}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={c.totalSchoolDays} value={schoolDays} icon={<BookOpen size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.totalHolidays} value={holidayDays} icon={<Calendar size={20} className="text-orange-600" />} color="bg-orange-100" />
        <StatCard label={c.totalExamDays} value={examDays} icon={<FileText size={20} className="text-blue-600" />} color="bg-blue-100" />
      </div>

      {/* Events list */}
      <SectionCard title={c.calendarTitle}
        action={<button onClick={() => showToast(c.eventAdded)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]"><Plus size={12} /> {c.addEvent}</button>}>
        <div className="space-y-2">
          {mockCalendarEvents.map((evt, i) => {
            const tc = typeColors[evt.type] || typeColors.other;
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tc.bg}`}>
                    <CalendarDays size={14} className={tc.text} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{evt.name}</p>
                    <p className="text-xs text-gray-500">{evt.start}{evt.end !== evt.start ? ` → ${evt.end}` : ""}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>
                  {typeLabels[evt.type]}
                </span>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════ TAB 3: PERIODS ═══════════════════════ */
function PeriodsTab({ c, showToast }: { c: SY; showToast: (m: string) => void }) {
  const [system, setSystem] = useState<"trimester" | "semester" | "custom">("trimester");

  const periods = system === "trimester" ? [
    { name: c.trimester1, start: "2025-09-08", end: "2025-12-19", status: "completed", weight: 33 },
    { name: c.trimester2, start: "2026-01-06", end: "2026-03-27", status: "active", weight: 33 },
    { name: c.trimester3, start: "2026-04-20", end: "2026-06-26", status: "upcoming", weight: 34 },
  ] : [
    { name: c.semester1, start: "2025-09-08", end: "2026-01-31", status: "completed", weight: 50 },
    { name: c.semester2, start: "2026-02-03", end: "2026-06-26", status: "active", weight: 50 },
  ];

  const statusColors: Record<string, { bg: string; text: string }> = {
    completed: { bg: "bg-green-100", text: "text-green-700" },
    active: { bg: "bg-blue-100", text: "text-blue-700" },
    upcoming: { bg: "bg-gray-100", text: "text-gray-600" },
  };
  const statusLabels: Record<string, string> = {
    completed: c.periodCompleted, active: c.periodActive, upcoming: c.periodUpcoming,
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.periodsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.periodsDesc}</p>

      {/* System selector */}
      <SectionCard title={c.periodSystem}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "trimester" as const, label: c.trimester, icon: <Layers size={18} /> },
            { key: "semester" as const, label: c.semester, icon: <Layers size={18} /> },
            { key: "custom" as const, label: c.customPeriods, icon: <Settings size={18} /> },
          ].map(opt => (
            <button key={opt.key} onClick={() => setSystem(opt.key)}
              className={`p-3 rounded-xl border-2 text-center transition ${system === opt.key
                ? "border-[#013486] bg-[#013486]/5" : "border-gray-200 hover:border-gray-300"}`}>
              <div className={`mx-auto mb-1 ${system === opt.key ? "text-[#013486]" : "text-gray-400"}`}>{opt.icon}</div>
              <p className={`text-xs font-semibold ${system === opt.key ? "text-[#013486]" : "text-gray-600"}`}>{opt.label}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Periods */}
      <SectionCard title={system === "trimester" ? c.trimester : c.semester}
        action={system === "custom" ? <button onClick={() => showToast(c.periodAdded)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg"><Plus size={12} /> {c.addPeriod}</button> : undefined}>
        <div className="space-y-3">
          {periods.map((p, i) => {
            const sc = statusColors[p.status] || statusColors.upcoming;
            return (
              <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#013486]/10 rounded-lg flex items-center justify-center">
                      <Layers size={14} className="text-[#013486]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{p.name}</h4>
                      <p className="text-xs text-gray-500">{p.start} → {p.end}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                    {statusLabels[p.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{c.weight}: {p.weight}%</span>
                  <div className="w-32 bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-[#013486]" style={{ width: `${p.weight}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={() => showToast(c.saved)} className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 4: EVALUATION ═══════════════════════ */
function EvaluationTab({ c, showToast }: { c: SY; showToast: (m: string) => void }) {
  const [gradingSystem, setGradingSystem] = useState("outOf20");
  const [minPass, setMinPass] = useState("10");

  const evalTypes = [
    { name: c.typeHomework, coeff: 1, enabled: true },
    { name: c.typeQuiz, coeff: 2, enabled: true },
    { name: c.typeExamEval, coeff: 4, enabled: true },
    { name: c.typeProject, coeff: 2, enabled: true },
    { name: c.typeParticipation, coeff: 1, enabled: false },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.evalTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.evalDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Grading system */}
        <SectionCard title={c.gradingSystem}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "outOf10", label: c.outOf10 },
              { key: "outOf20", label: c.outOf20 },
              { key: "outOf100", label: c.outOf100 },
              { key: "letter", label: c.letterGrade },
            ].map(opt => (
              <button key={opt.key} onClick={() => setGradingSystem(opt.key)}
                className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition ${gradingSystem === opt.key
                  ? "border-[#013486] bg-[#013486]/5 text-[#013486]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium text-gray-600">{c.minPassGrade}</label>
            <input type="number" value={minPass} onChange={e => setMinPass(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
          </div>
        </SectionCard>

        {/* Eval types */}
        <SectionCard title={c.evalTypes}
          action={<button onClick={() => showToast(c.saved)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg"><Plus size={12} /> {c.addEvalType}</button>}>
          <div className="space-y-2">
            {evalTypes.map((et, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${et.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="text-sm text-gray-700">{et.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{c.coefficient}: {et.coeff}</span>
                  <div className="w-8 h-4 bg-gray-200 rounded-full flex items-center">
                    <div className={`w-3 h-3 rounded-full ${et.enabled ? "bg-green-500 ml-auto mr-0.5" : "bg-gray-400 ml-0.5"}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Period weighting */}
      <SectionCard title={c.periodWeighting}>
        <div className="grid grid-cols-3 gap-3">
          {[{ name: "1er Trim.", weight: 30 }, { name: "2e Trim.", weight: 30 }, { name: "3e Trim.", weight: 40 }].map((p, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-sm font-semibold text-gray-900">{p.name}</p>
              <p className="text-2xl font-bold text-[#013486] mt-1">{p.weight}%</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="h-1.5 rounded-full bg-[#013486]" style={{ width: `${p.weight}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={() => showToast(c.saved)} className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 5: ENROLLMENT ═══════════════════════ */
function EnrollmentTab({ c, showToast }: { c: SY; showToast: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.enrollTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.enrollDesc}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={c.totalEnrolled} value="452" icon={<Users size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.newEnrollments} value="68" icon={<Plus size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard label={c.reenrollments} value="372" icon={<RefreshCw size={20} className="text-blue-600" />} color="bg-blue-100" />
        <StatCard label={c.pendingEnrollments} value="12" icon={<Clock size={20} className="text-amber-600" />} color="bg-amber-100" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Periods */}
        <SectionCard title={c.enrollPeriod}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">{c.enrollPeriod}</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input type="date" defaultValue="2025-06-01" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
                <input type="date" defaultValue="2025-09-05" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{c.reenrollPeriod}</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input type="date" defaultValue="2025-05-15" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
                <input type="date" defaultValue="2025-08-31" className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{c.enrollFees}</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="number" defaultValue={5000} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
                <span className="text-sm font-medium text-gray-500">{c.currency}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Conditions */}
        <SectionCard title={c.admissionConditions}
          action={<button onClick={() => showToast(c.saved)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#013486] text-white rounded-lg"><Plus size={12} /> {c.addCondition}</button>}>
          <div className="space-y-2">
            {[
              { label: c.conditionAge, detail: "6 ans minimum", enabled: true },
              { label: c.conditionDocs, detail: "Acte de naissance, carnet de santé", enabled: true },
              { label: c.conditionPrevYear, detail: "Moyenne ≥ 10/20", enabled: true },
              { label: c.conditionPayment, detail: "Frais d'inscription payés", enabled: true },
            ].map((cond, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <CheckCircle size={14} className="text-green-500" />
                  <div>
                    <p className="text-sm text-gray-700">{cond.label}</p>
                    <p className="text-xs text-gray-400">{cond.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <button onClick={() => showToast(c.saved)} className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 6: CLASS ASSIGNMENT ═══════════════════════ */
function ClassAssignmentTab({ c, showToast }: { c: SY; showToast: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.classesTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.classesDesc}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label={c.classCreated} value="32" icon={<BookOpen size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.studentsAssigned} value="440" icon={<Users size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard label={c.promotedStudents} value="398" icon={<TrendingUp size={20} className="text-blue-600" />} color="bg-blue-100" />
        <StatCard label={c.repeatingStudents} value="42" icon={<RefreshCw size={20} className="text-amber-600" />} color="bg-amber-100" />
        <StatCard label={c.unassigned} value="12" icon={<AlertTriangle size={20} className="text-red-600" />} color="bg-red-100" />
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: c.createClassesForYear, icon: <Plus size={20} />, color: "from-[#013486] to-[#0148c2]" },
          { label: c.autoPromotion, icon: <TrendingUp size={20} />, color: "from-green-500 to-green-600" },
          { label: c.manageRepeaters, icon: <RefreshCw size={20} />, color: "from-amber-500 to-amber-600" },
          { label: c.transferStudents, icon: <ArrowRightLeft size={20} />, color: "from-purple-500 to-purple-600" },
        ].map((action, i) => (
          <button key={i} onClick={() => showToast(c.classesGenerated)}
            className={`bg-gradient-to-br ${action.color} text-white rounded-xl p-5 text-center hover:shadow-lg transition`}>
            <div className="mx-auto mb-2">{action.icon}</div>
            <p className="text-sm font-semibold">{action.label}</p>
          </button>
        ))}
      </div>

      {/* Simulation */}
      <SectionCard title={c.simulatePromotion}>
        <div className="bg-[#013486]/5 rounded-xl p-4 border border-[#013486]/10">
          <div className="flex items-center gap-3 mb-3">
            <Zap size={16} className="text-[#013486]" />
            <p className="text-sm text-[#013486] font-medium">{c.simulatePromotion}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: c.promotedStudents, value: "398", pct: "91%", color: "text-green-600" },
              { label: c.repeatingStudents, value: "42", pct: "9%", color: "text-amber-600" },
              { label: c.unassigned, value: "12", pct: "3%", color: "text-red-600" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-lg p-3 text-center">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xs font-medium text-gray-400">{stat.pct}</p>
              </div>
            ))}
          </div>
          <button onClick={() => showToast(c.promotionDone)}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-lg hover:bg-[#012a6e]">
            <CheckCircle size={14} /> {c.confirmPromotion}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════ TAB 7: STATS ═══════════════════════ */
function StatsTab({ c }: { c: SY }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.statsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.statsDesc}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={c.successRate} value="72%" icon={<TrendingUp size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard label={c.absenteeismRate} value="6.2%" icon={<AlertTriangle size={20} className="text-red-600" />} color="bg-red-100" />
        <StatCard label={c.avgPerformance} value="68/100" icon={<BarChart3 size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label="Élèves" value="452" icon={<Users size={20} className="text-purple-600" />} color="bg-purple-100" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title={c.performanceEvolution}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockPerformanceByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[50, 80]} />
              <Tooltip />
              <Line type="monotone" dataKey="avg" stroke="#013486" strokeWidth={2} name={c.avgPerformance} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title={c.byClass}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockPerformanceByClass}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[50, 80]} />
              <Tooltip />
              <Bar dataKey="avg" fill="#013486" radius={[4, 4, 0, 0]} name={c.avgPerformance} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Gender distribution */}
        <SectionCard title={c.byGender}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={mockGenderDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {mockGenderDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Year comparison */}
        <SectionCard title={c.compareYears}>
          <div className="space-y-3">
            {[
              { year: "2025–2026", rate: 72, trend: "up" },
              { year: "2024–2025", rate: 68, trend: "up" },
              { year: "2023–2024", rate: 65, trend: "down" },
            ].map((y, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{y.year}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-[#013486]" style={{ width: `${y.rate}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{y.rate}%</span>
                  {y.trend === "up"
                    ? <TrendingUp size={14} className="text-green-500" />
                    : <TrendingDown size={14} className="text-red-500" />}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-sm border border-[#013486] text-[#013486] rounded-lg hover:bg-[#013486]/5">
            <Download size={14} /> {c.exportStats}
          </button>
        </SectionCard>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 8: FINANCE ═══════════════════════ */
function FinanceTab({ c, showToast }: { c: SY; showToast: (m: string) => void }) {
  const [paymentMode, setPaymentMode] = useState("monthly");
  const totalExpected = 50000;
  const totalCollected = 25000;

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.financeTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.financeDesc}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={c.totalExpected} value="50,000 HTG" icon={<DollarSign size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.totalCollected} value="25,000 HTG" icon={<CheckCircle size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard label={c.paidStudents} value="324" icon={<Users size={20} className="text-blue-600" />} color="bg-blue-100" />
        <StatCard label={c.overduePayments} value="45" icon={<AlertTriangle size={20} className="text-red-600" />} color="bg-red-100" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Tuition config */}
        <SectionCard title={c.annualTuition}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">{c.annualTuition}</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="number" defaultValue={50000} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
                <span className="text-sm font-medium text-gray-500">{c.currency}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{c.paymentModalities}</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { key: "full", label: c.paymentFull },
                  { key: "monthly", label: c.paymentMonthly },
                  { key: "quarterly", label: c.paymentQuarterly },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setPaymentMode(opt.key)}
                    className={`p-2 rounded-lg border-2 text-xs font-medium text-center transition ${paymentMode === opt.key
                      ? "border-[#013486] bg-[#013486]/5 text-[#013486]" : "border-gray-200 text-gray-600"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{c.latePenalty}</label>
              <div className="flex items-center gap-2 mt-1">
                <input type="number" defaultValue={5} className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Payment schedule */}
        <SectionCard title={c.paymentSchedule}>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {mockPaymentSchedule.map((p, i) => (
              <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${p.paid ? "bg-green-50" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2">
                  {p.paid
                    ? <CheckCircle size={14} className="text-green-500" />
                    : <Clock size={14} className="text-gray-400" />}
                  <span className="text-sm text-gray-700">{p.month}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{p.amount.toLocaleString()} {c.currency}</span>
                  <span className="text-xs text-gray-400">{p.due}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{c.totalCollected}</span>
              <span>{Math.round((totalCollected / totalExpected) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-[#013486] to-[#F35403]" style={{ width: `${(totalCollected / totalExpected) * 100}%` }} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <button onClick={() => showToast(c.saved)} className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 9: ARCHIVE ═══════════════════════ */
function ArchiveTab({ c, showToast }: { c: SY; showToast: (m: string) => void }) {
  const [autoArchive, setAutoArchive] = useState(true);

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.archiveTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.archiveDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title={c.autoArchive}>
          <ToggleRow label={c.autoArchive} desc={c.autoArchiveHelp} enabled={autoArchive}
            onToggle={() => setAutoArchive(!autoArchive)} icon={<Database size={14} />} />
          <div className="space-y-2 mt-2">
            {[c.gradePreservation, c.classHistory, c.academicRecords].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-sm text-green-700">{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={c.archivedYears}>
          <div className="space-y-2">
            {[
              { year: "2024–2025", size: "245 MB", date: "2025-07-15" },
              { year: "2023–2024", size: "218 MB", date: "2024-07-12" },
              { year: "2022–2023", size: "195 MB", date: "2023-07-10" },
            ].map((arch, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Archive size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{arch.year}</p>
                    <p className="text-xs text-gray-400">{c.archiveSize}: {arch.size} • {c.lastArchive}: {arch.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-200 text-[#013486]"><Eye size={14} /></button>
                  <button onClick={() => showToast(c.archiveDone)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"><Download size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 10: TRANSITION ═══════════════════════ */
function TransitionTab({ c, showToast }: { c: SY; showToast: (m: string) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const steps = [
    { label: c.step1, icon: <X size={16} />, desc: "Clôturer l'année 2025–2026" },
    { label: c.step2, icon: <TrendingUp size={16} />, desc: "Promouvoir 398 élèves" },
    { label: c.step3, icon: <Archive size={16} />, desc: "Archiver les données" },
    { label: c.step4, icon: <Plus size={16} />, desc: "Créer l'année 2026–2027" },
    { label: c.step5, icon: <Play size={16} />, desc: "Activer la nouvelle année" },
  ];

  const startTransition = () => {
    setTransitioning(true);
    setCurrentStep(0);
    const advance = (step: number) => {
      if (step < steps.length) {
        setTimeout(() => { setCurrentStep(step + 1); advance(step + 1); }, 1200);
      } else {
        setTimeout(() => { setTransitioning(false); showToast(c.transitionSuccess); }, 500);
      }
    };
    advance(0);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.transitionTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.transitionDesc}</p>

      {/* Warning */}
      <div className="bg-red-50 rounded-xl p-4 border border-red-200 flex items-start gap-3">
        <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-700">{c.transitionWarning}</p>
          <p className="text-xs text-red-500 mt-1">{c.estimatedTime}</p>
        </div>
      </div>

      {/* Steps */}
      <SectionCard title={c.transitionTitle}>
        <div className="space-y-3">
          {steps.map((step, i) => {
            const status = i < currentStep ? "completed" : i === currentStep && transitioning ? "inProgress" : "pending";
            return (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition ${
                status === "completed" ? "bg-green-50 border-green-200"
                : status === "inProgress" ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  status === "completed" ? "bg-green-500 text-white"
                  : status === "inProgress" ? "bg-blue-500 text-white animate-pulse"
                  : "bg-gray-200 text-gray-400"}`}>
                  {status === "completed" ? <CheckCircle size={18} /> : step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Étape {i + 1}</span>
                    <ChevronRight size={12} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  status === "completed" ? "bg-green-100 text-green-700"
                  : status === "inProgress" ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500"}`}>
                  {status === "completed" ? c.stepCompleted : status === "inProgress" ? c.stepInProgress : c.stepPending}
                </span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Action */}
      <div className="flex justify-center">
        <button onClick={startTransition} disabled={transitioning}
          className={`flex items-center gap-2 px-8 py-3 text-sm font-semibold rounded-xl shadow-lg transition ${
            transitioning
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-[#F35403] to-[#e04800] text-white hover:shadow-xl"}`}>
          {transitioning ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRightLeft size={16} />}
          {c.startTransition}
        </button>
      </div>
    </div>
  );
}
