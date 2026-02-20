"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/shared/PageHeader";
import {
  ClipboardCheck, Search, Filter, Download, ChevronDown, X, Plus,
  ArrowUpDown, ChevronLeft, ChevronRight, Calendar, Users,
  BarChart3, TrendingUp, Award, CheckCircle, AlertCircle, FileText,
  Edit2, Trash2, Copy, Bell, Lock, Unlock, Eye, Share2, Upload,
  BookOpen, GraduationCap, Printer, Mail, MessageCircle, Check,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

/* ─── constants ─── */
const PRIMARY = "#013486";
const ACCENT = "#F35403";

type ExamType = "homework" | "quiz" | "trimester" | "oral" | "practical" | "final";
type ExamStatus = "planned" | "inProgress" | "completed" | "cancelled" | "graded";
type Trimester = 1 | 2 | 3;
type ViewMode = "exams" | "grades" | "results" | "analysis" | "bulletin";

interface StudentGrade {
  studentId: string;
  studentName: string;
  grade: number | null;
  comment: string;
  mention: string;
}

interface Exam {
  id: string;
  name: string;
  subject: string;
  subjectColor: string;
  className: string;
  date: string;
  time: string;
  duration: number;
  type: ExamType;
  status: ExamStatus;
  coefficient: number;
  totalPoints: number;
  description: string;
  teacher: string;
  room: string;
  trimester: Trimester;
  grades: StudentGrade[];
  average: number | null;
  passRate: number | null;
  createdAt: string;
  validated: boolean;
  validatedBy: string | null;
  validatedAt: string | null;
}

/* ─── Subject colors ─── */
const SUBJECT_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  "Mathématiques": { bg: "bg-blue-50", text: "text-blue-700", accent: "#3B82F6" },
  "Français": { bg: "bg-purple-50", text: "text-purple-700", accent: "#8B5CF6" },
  "Sciences": { bg: "bg-green-50", text: "text-green-700", accent: "#22C55E" },
  "Histoire-Géo": { bg: "bg-amber-50", text: "text-amber-700", accent: "#F59E0B" },
  "Anglais": { bg: "bg-pink-50", text: "text-pink-700", accent: "#EC4899" },
  "Physique-Chimie": { bg: "bg-cyan-50", text: "text-cyan-700", accent: "#06B6D4" },
  "SVT": { bg: "bg-lime-50", text: "text-lime-700", accent: "#84CC16" },
  "Philosophie": { bg: "bg-indigo-50", text: "text-indigo-700", accent: "#6366F1" },
  "Éducation Physique": { bg: "bg-orange-50", text: "text-orange-700", accent: "#F97316" },
  "Informatique": { bg: "bg-teal-50", text: "text-teal-700", accent: "#14B8A6" },
  "Créole": { bg: "bg-rose-50", text: "text-rose-700", accent: "#F43F5E" },
  "Arts": { bg: "bg-fuchsia-50", text: "text-fuchsia-700", accent: "#D946EF" },
};
const SUBJECTS = Object.keys(SUBJECT_COLORS);

const CLASSES = [
  "6ème A", "6ème B", "5ème A", "5ème B", "4ème A", "4ème B",
  "3ème A", "3ème B", "2nde A", "1ère S", "Terminale S",
];
const TEACHERS = [
  "Jean-Marc Augustin", "Marie Claire Duval", "Pierre-Louis Noël",
  "Fabienne Saint-Cyr", "Rosemond Alcindor", "Yves Beaumont",
  "Nathalie François", "Jacques Mentor", "Claudette Pierre",
  "Emmanuel Désir", "Martine Dupont", "Paul Vertus",
];
const ROOMS = ["Salle 101", "Salle 102", "Salle 103", "Salle 201", "Salle 202", "Labo Sciences", "Salle Info", "Amphithéâtre"];

const STUDENT_NAMES = [
  "Alexis Jean-Baptiste", "Mélanie Augustin", "David Pierre-Louis",
  "Sophia Noël", "Emmanuel Beaumont", "Clara François",
  "Romain Alcindor", "Isabelle Mentor", "Thierry Duval",
  "Nadia Saint-Cyr", "Fabrice Désir", "Camille Vertus",
  "Patrick Joseph", "Léonie Marcelin", "Gérald Thomas",
  "Yvonne Casimir", "Ricardo Étienne", "Pascale Florestal",
  "Joël Démétrius", "Angélique Mondésir", "Bruno Lafontant",
  "Stéphanie Charles", "Wilfried Prophète", "Roseline Adrien",
  "Maxime Jean-Louis", "Catherine Baptiste", "Frédéric Lambert",
  "Laurence Michel", "André Sylvain", "Denise Moïse",
];

/* ─── Deterministic students per class ─── */
function getClassStudents(className: string): { id: string; name: string }[] {
  const ci = CLASSES.indexOf(className);
  const count = 28 + (ci % 3);
  return Array.from({ length: count }, (_, i) => ({
    id: `${className.replace(/[^a-zA-Z0-9]/g, "")}-${String(i + 1).padStart(3, "0")}`,
    name: STUDENT_NAMES[(ci * 7 + i) % STUDENT_NAMES.length],
  }));
}

/* ─── Generate mock exams ─── */
function generateExams(): Exam[] {
  const exams: Exam[] = [];
  const types: ExamType[] = ["homework", "quiz", "trimester", "oral", "practical", "final"];
  const allStatuses: ExamStatus[] = ["planned", "inProgress", "completed", "graded", "cancelled"];
  let id = 1;

  CLASSES.forEach((cls) => {
    const classStudents = getClassStudents(cls);
    SUBJECTS.slice(0, 6).forEach((subject, si) => {
      [1, 2, 3].forEach((trim) => {
        for (let e = 0; e < 2; e++) {
          const type = types[(si + e + trim) % types.length];
          const status: ExamStatus =
            trim === 1 ? (Math.random() > 0.15 ? "graded" : "completed")
              : trim === 2 ? allStatuses[(si + e) % 4]
                : "planned";
          const totalPoints = type === "final" ? 100 : 20;
          const coefficient = type === "homework" ? 1 : type === "quiz" ? 1 : type === "trimester" ? 3 : type === "final" ? 4 : 2;
          const duration = type === "homework" ? 60 : type === "quiz" ? 30 : type === "trimester" ? 120 : type === "final" ? 180 : 90;
          const month = trim === 1 ? 10 + Math.floor(Math.random() * 2) : trim === 2 ? 1 + Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 2);
          const day = 1 + Math.floor(Math.random() * 27);
          const year = trim === 1 ? 2025 : 2026;
          const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hour = 7 + Math.floor(Math.random() * 6);
          const time = `${String(hour).padStart(2, "0")}:${Math.random() > 0.5 ? "00" : "30"}`;
          const teacher = TEACHERS[si % TEACHERS.length];
          const room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
          const sc = SUBJECT_COLORS[subject] || { accent: "#6B7280" };

          const grades: StudentGrade[] = [];
          if (status === "graded" || status === "completed") {
            classStudents.forEach(student => {
              const grade = Math.round((Math.random() * totalPoints * 0.8 + totalPoints * 0.1) * 10) / 10;
              const pct = (grade / totalPoints) * 20;
              const mention = pct >= 16 ? "excellent" : pct >= 14 ? "veryGood" : pct >= 12 ? "good" : pct >= 10 ? "fairlyGood" : "insufficient";
              grades.push({ studentId: student.id, studentName: student.name, grade, comment: "", mention });
            });
          }

          const avg = grades.length > 0 ? Math.round((grades.reduce((a, g) => a + (g.grade || 0), 0) / grades.length) * 10) / 10 : null;
          const pass = grades.length > 0 ? Math.round((grades.filter(g => (g.grade || 0) >= totalPoints / 2).length / grades.length) * 100) : null;
          const validated = status === "graded" && trim === 1;

          exams.push({
            id: `EXM-${String(id++).padStart(4, "0")}`,
            name: `${type === "homework" ? "Devoir" : type === "quiz" ? "Interro" : type === "trimester" ? "Exam T" + trim : type === "oral" ? "Oral" : type === "practical" ? "TP" : "Final"} ${subject.substring(0, 4)} ${e + 1}`,
            subject, subjectColor: sc.accent, className: cls, date, time, duration, type, status,
            coefficient, totalPoints, description: `${type === "homework" ? "Devoir" : "Examen"} de ${subject} - ${cls}`,
            teacher, room, trimester: trim as Trimester, grades, average: avg, passRate: pass,
            createdAt: `${year}-${String(Math.max(1, month - 1)).padStart(2, "0")}-15`,
            validated, validatedBy: validated ? "Admin Principal" : null,
            validatedAt: validated ? `${year}-${String(month).padStart(2, "0")}-${String(Math.min(28, day + 5)).padStart(2, "0")}` : null,
          });
        }
      });
    });
  });
  return exams;
}

const ALL_EXAMS = generateExams();
type EP = ReturnType<typeof useTranslation>["t"]["examsPage"];

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function AdminExamsPage() {
  const { t } = useTranslation();
  const ep: EP = t.examsPage;

  /* ── state ── */
  const [viewMode, setViewMode] = useState<ViewMode>("exams");
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterType, setFilterType] = useState<ExamType | "">("");
  const [filterTrimester, setFilterTrimester] = useState<Trimester | 0>(0);
  const [filterStatus, setFilterStatus] = useState<ExamStatus | "">("");
  const [sortCol, setSortCol] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerExam, setDrawerExam] = useState<Exam | null>(null);
  const [drawerTab, setDrawerTab] = useState<"details" | "grades" | "statistics" | "actions">("details");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /* Grade Entry state */
  const [geClass, setGeClass] = useState("");
  const [geExamId, setGeExamId] = useState<string | null>(null);
  const [editGrades, setEditGrades] = useState<Record<string, { grade: string; comment: string }>>({});
  const [showValidateConfirm, setShowValidateConfirm] = useState(false);
  const [validatedExams, setValidatedExams] = useState<Set<string>>(() => {
    const s = new Set<string>();
    ALL_EXAMS.forEach(e => { if (e.validated) s.add(e.id); });
    return s;
  });
  const [savedGrades, setSavedGrades] = useState<Record<string, Record<string, { grade: number | null; comment: string }>>>({});

  /* Bulletin state */
  const [bulClass, setBulClass] = useState("");
  const [bulTrimester, setBulTrimester] = useState<Trimester>(1);
  const [bulStudent, setBulStudent] = useState("");

  /* Toast */
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const exportRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 15;

  /* ── click outside ── */
  useEffect(() => {
    function h(e: MouseEvent) { if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => {
    function h(e: MouseEvent) { if (drawerRef.current && !drawerRef.current.contains(e.target as Node) && drawerExam) setDrawerExam(null); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [drawerExam]);

  /* ── helpers ── */
  const getTypeLabel = useCallback((type: ExamType): string => {
    const m: Record<ExamType, string> = { homework: ep.typeHomework, quiz: ep.typeQuiz, trimester: ep.typeTrimester, oral: ep.typeOral, practical: ep.typePractical, final: ep.typeFinal };
    return m[type];
  }, [ep]);

  const getStatusColor = (s: ExamStatus) => {
    const m: Record<ExamStatus, string> = { planned: "bg-blue-100 text-blue-700", inProgress: "bg-amber-100 text-amber-700", completed: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-700", graded: "bg-purple-100 text-purple-700" };
    return m[s];
  };
  const getStatusLabel = (s: ExamStatus): string => {
    const m: Record<ExamStatus, string> = { planned: ep.statusPlanned, inProgress: ep.statusInProgress, completed: ep.statusCompleted, cancelled: ep.statusCancelled, graded: ep.statusGraded };
    return m[s];
  };
  const getMentionLabel = (m: string): string => {
    const map: Record<string, string> = { excellent: ep.excellent, veryGood: ep.veryGood, good: ep.good, fairlyGood: ep.fairlyGood, insufficient: ep.insufficient };
    return map[m] || m;
  };
  const getMentionColor = (m: string) => {
    const map: Record<string, string> = { excellent: "bg-emerald-100 text-emerald-700", veryGood: "bg-blue-100 text-blue-700", good: "bg-cyan-100 text-cyan-700", fairlyGood: "bg-amber-100 text-amber-700", insufficient: "bg-red-100 text-red-700" };
    return map[m] || "bg-gray-100 text-gray-700";
  };
  const computeMention = (grade: number, total: number) => {
    const p = (grade / total) * 20;
    return p >= 16 ? "excellent" : p >= 14 ? "veryGood" : p >= 12 ? "good" : p >= 10 ? "fairlyGood" : "insufficient";
  };
  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  /* ── filtering & sorting ── */
  const filtered = useMemo(() => {
    let data = [...ALL_EXAMS];
    if (search) { const s = search.toLowerCase(); data = data.filter(e => e.name.toLowerCase().includes(s) || e.subject.toLowerCase().includes(s) || e.className.toLowerCase().includes(s) || e.teacher.toLowerCase().includes(s)); }
    if (filterClass) data = data.filter(e => e.className === filterClass);
    if (filterSubject) data = data.filter(e => e.subject === filterSubject);
    if (filterType) data = data.filter(e => e.type === filterType);
    if (filterTrimester) data = data.filter(e => e.trimester === filterTrimester);
    if (filterStatus) data = data.filter(e => e.status === filterStatus);
    data.sort((a, b) => {
      let v = 0;
      if (sortCol === "date") v = a.date.localeCompare(b.date);
      else if (sortCol === "name") v = a.name.localeCompare(b.name);
      else if (sortCol === "subject") v = a.subject.localeCompare(b.subject);
      else if (sortCol === "class") v = a.className.localeCompare(b.className);
      else if (sortCol === "average") v = (a.average || 0) - (b.average || 0);
      else if (sortCol === "passRate") v = (a.passRate || 0) - (b.passRate || 0);
      return sortDir === "asc" ? v : -v;
    });
    return data;
  }, [search, filterClass, filterSubject, filterType, filterTrimester, filterStatus, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeFilterCount = [filterClass, filterSubject, filterType, filterTrimester, filterStatus].filter(Boolean).length;

  /* ── stats ── */
  const stats = useMemo(() => {
    const total = ALL_EXAMS.length;
    const completed = ALL_EXAMS.filter(e => e.status === "completed" || e.status === "graded").length;
    const planned = ALL_EXAMS.filter(e => e.status === "planned").length;
    const toGrade = ALL_EXAMS.filter(e => e.status === "completed").length;
    const withAvg = ALL_EXAMS.filter(e => e.average !== null);
    const globalAvg = withAvg.length > 0 ? Math.round((withAvg.reduce((a, e) => a + ((e.average || 0) / e.totalPoints) * 20, 0) / withAvg.length) * 10) / 10 : 0;
    const withPR = ALL_EXAMS.filter(e => e.passRate !== null);
    const globalPR = withPR.length > 0 ? Math.round(withPR.reduce((a, e) => a + (e.passRate || 0), 0) / withPR.length) : 0;
    return { total, completed, planned, toGrade, globalAvg, globalPR };
  }, []);

  /* ── grade entry logic ── */
  const geExams = useMemo(() => geClass ? ALL_EXAMS.filter(e => e.className === geClass && (e.status === "completed" || e.status === "graded")) : [], [geClass]);
  const geSelectedExam = useMemo(() => geExamId ? ALL_EXAMS.find(e => e.id === geExamId) || null : null, [geExamId]);
  const geIsValidated = geExamId ? validatedExams.has(geExamId) : false;

  const initEditGrades = useCallback((exam: Exam) => {
    const students = getClassStudents(exam.className);
    const saved = savedGrades[exam.id];
    const grades: Record<string, { grade: string; comment: string }> = {};
    students.forEach(s => {
      if (saved && saved[s.id]) {
        grades[s.id] = { grade: saved[s.id].grade !== null ? String(saved[s.id].grade) : "", comment: saved[s.id].comment };
      } else {
        const existing = exam.grades.find(g => g.studentId === s.id);
        grades[s.id] = { grade: existing?.grade !== null && existing?.grade !== undefined ? String(existing.grade) : "", comment: existing?.comment || "" };
      }
    });
    setEditGrades(grades);
  }, [savedGrades]);

  useEffect(() => { if (geSelectedExam) initEditGrades(geSelectedExam); }, [geSelectedExam, initEditGrades]);

  const handleSaveGrades = () => {
    if (!geExamId) return;
    const g: Record<string, { grade: number | null; comment: string }> = {};
    Object.entries(editGrades).forEach(([sid, { grade, comment }]) => {
      g[sid] = { grade: grade ? parseFloat(grade) : null, comment };
    });
    setSavedGrades(prev => ({ ...prev, [geExamId]: g }));
    setToast(ep.gradesSavedSuccess);
  };

  const handleValidateGrades = () => {
    handleSaveGrades();
    if (geExamId) setValidatedExams(prev => new Set([...prev, geExamId]));
    setShowValidateConfirm(false);
    setToast(ep.gradesValidatedSuccess);
  };

  /* ── chart data ── */
  const chartGradeDistribution = useMemo(() => {
    const ranges = [{ l: "0-5", mn: 0, mx: 5, c: 0 }, { l: "5-10", mn: 5, mx: 10, c: 0 }, { l: "10-12", mn: 10, mx: 12, c: 0 }, { l: "12-14", mn: 12, mx: 14, c: 0 }, { l: "14-16", mn: 14, mx: 16, c: 0 }, { l: "16-20", mn: 16, mx: 20.01, c: 0 }];
    ALL_EXAMS.filter(e => e.status === "graded").forEach(ex => { ex.grades.forEach(g => { if (g.grade !== null) { const n = (g.grade / ex.totalPoints) * 20; const r = ranges.find(r => n >= r.mn && n < r.mx); if (r) r.c++; } }); });
    return ranges.map(r => ({ name: r.l, value: r.c }));
  }, []);

  const chartAvgBySubject = useMemo(() => {
    const m: Record<string, { s: number; c: number }> = {};
    ALL_EXAMS.filter(e => e.average !== null).forEach(e => { if (!m[e.subject]) m[e.subject] = { s: 0, c: 0 }; m[e.subject].s += ((e.average || 0) / e.totalPoints) * 20; m[e.subject].c++; });
    return Object.entries(m).map(([k, v]) => ({ name: k.length > 10 ? k.substring(0, 10) + "." : k, value: Math.round((v.s / v.c) * 10) / 10 })).sort((a, b) => b.value - a.value);
  }, []);

  const chartPassRateTrend = useMemo(() => {
    const tm: Record<number, { s: number; c: number }> = { 1: { s: 0, c: 0 }, 2: { s: 0, c: 0 }, 3: { s: 0, c: 0 } };
    ALL_EXAMS.filter(e => e.passRate !== null).forEach(e => { tm[e.trimester].s += e.passRate || 0; tm[e.trimester].c++; });
    return [
      { name: ep.trimester1, value: tm[1].c > 0 ? Math.round(tm[1].s / tm[1].c) : 0 },
      { name: ep.trimester2, value: tm[2].c > 0 ? Math.round(tm[2].s / tm[2].c) : 0 },
      { name: ep.trimester3, value: tm[3].c > 0 ? Math.round(tm[3].s / tm[3].c) : 0 },
    ];
  }, [ep]);

  const chartExamTypes = useMemo(() => {
    const m: Record<string, number> = {};
    ALL_EXAMS.forEach(e => { const l = getTypeLabel(e.type); m[l] = (m[l] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [getTypeLabel]);

  const chartAvgByClass = useMemo(() => {
    return CLASSES.slice(0, 8).map(cls => {
      const exams = ALL_EXAMS.filter(e => e.className === cls && e.average !== null);
      const avg = exams.length > 0 ? Math.round((exams.reduce((a, e) => a + ((e.average || 0) / e.totalPoints) * 20, 0) / exams.length) * 10) / 10 : 0;
      return { name: cls.length > 6 ? cls.substring(0, 6) : cls, value: avg };
    });
  }, []);

  const PIE_COLORS = ["#3B82F6", "#8B5CF6", "#22C55E", "#F59E0B", "#EC4899", "#06B6D4"];

  /* ── sort/select/export handlers ── */
  const toggleSort = (col: string) => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("asc"); } };
  const toggleSelect = (id: string) => { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const toggleSelectAll = () => { if (selected.size === paged.length) setSelected(new Set()); else setSelected(new Set(paged.map(e => e.id))); };

  const handleExport = (format: string) => {
    setShowExport(false);
    if (format === "print") {
      const html = buildPrintableHTML(filtered, ep);
      const blob = new Blob([html], { type: "text/html" });
      const w = window.open(URL.createObjectURL(blob));
      if (w) setTimeout(() => w.print(), 500);
    }
  };

  const resetFilters = () => { setFilterClass(""); setFilterSubject(""); setFilterType(""); setFilterTrimester(0); setFilterStatus(""); setSearch(""); setPage(1); };

  const getPageNumbers = () => {
    const p: (number | "...")[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) p.push(i); }
    else { p.push(1); if (page > 3) p.push("..."); for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) p.push(i); if (page < totalPages - 2) p.push("..."); p.push(totalPages); }
    return p;
  };

  /* ── bulletin helpers ── */
  const bulStudents = useMemo(() => bulClass ? getClassStudents(bulClass) : [], [bulClass]);
  const bulExams = useMemo(() => bulClass ? ALL_EXAMS.filter(e => e.className === bulClass && e.trimester === bulTrimester && e.status === "graded") : [], [bulClass, bulTrimester]);

  const getBulletinData = (studentId: string) => {
    const subjectGrades: { subject: string; grade: number; total: number; coef: number; mention: string }[] = [];
    let totalWeighted = 0, totalCoef = 0;
    SUBJECTS.slice(0, 6).forEach(subject => {
      const exams = bulExams.filter(e => e.subject === subject);
      if (exams.length === 0) return;
      let sGrade = 0, sCoef = 0;
      exams.forEach(ex => {
        const sg = savedGrades[ex.id]?.[studentId] || ex.grades.find(g => g.studentId === studentId);
        const g = sg ? (typeof sg === "object" && "grade" in sg ? sg.grade : null) : null;
        if (g !== null) { const norm = (g / ex.totalPoints) * 20; sGrade += norm * ex.coefficient; sCoef += ex.coefficient; }
      });
      if (sCoef > 0) {
        const avg = Math.round((sGrade / sCoef) * 10) / 10;
        subjectGrades.push({ subject, grade: avg, total: 20, coef: sCoef, mention: computeMention(avg, 20) });
        totalWeighted += avg * sCoef;
        totalCoef += sCoef;
      }
    });
    const generalAvg = totalCoef > 0 ? Math.round((totalWeighted / totalCoef) * 10) / 10 : 0;
    const mention = computeMention(generalAvg, 20);
    return { subjectGrades, generalAvg, mention };
  };

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="space-y-5">
      <PageHeader title={t.pages.admin.exams.title} description={t.pages.admin.exams.desc} icon={<ClipboardCheck size={20} />} />

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top">
          <Check size={16} /> <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: ep.totalExams, value: stats.total, icon: ClipboardCheck, color: PRIMARY },
          { label: ep.completedExams, value: stats.completed, icon: CheckCircle, color: "#22C55E" },
          { label: ep.toGrade, value: stats.toGrade, icon: Edit2, color: ACCENT },
          { label: ep.upcomingExams, value: stats.planned, icon: Calendar, color: "#8B5CF6" },
          { label: ep.averageScore, value: `${stats.globalAvg}/20`, icon: BarChart3, color: "#3B82F6" },
          { label: ep.passRate, value: `${stats.globalPR}%`, icon: TrendingUp, color: "#22C55E" },
          { label: ep.totalStudentsGraded, value: ALL_EXAMS.filter(e => e.status === "graded").reduce((a, e) => a + e.grades.length, 0), icon: Users, color: "#06B6D4" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: s.color + "15" }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Container ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          {/* 5 View Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 flex-wrap">
            {([
              { key: "exams" as const, label: ep.viewExams, icon: ClipboardCheck },
              { key: "grades" as const, label: ep.viewGrades, icon: Edit2 },
              { key: "results" as const, label: ep.viewResults, icon: Award },
              { key: "analysis" as const, label: ep.analysisTab, icon: BarChart3 },
              { key: "bulletin" as const, label: ep.bulletinTab, icon: GraduationCap },
            ]).map(v => (
              <button key={v.key} onClick={() => { setViewMode(v.key); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === v.key ? "bg-white text-[#013486] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <v.icon size={13} />{v.label}
              </button>
            ))}
          </div>

          {viewMode === "exams" && (
            <>
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={t.common.search + "..."} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]" />
              </div>
              <button onClick={() => setShowFilters(f => !f)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${showFilters || activeFilterCount > 0 ? "border-[#013486] text-[#013486] bg-[#013486]/5" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <Filter size={13} />{activeFilterCount > 0 && <span className="bg-[#013486] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
              </button>
              <div className="relative" ref={exportRef}>
                <button onClick={() => setShowExport(p => !p)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"><Download size={13} /><ChevronDown size={12} /></button>
                {showExport && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-30 w-48 py-1">
                    {[{ k: "pdf", l: ep.exportPDF }, { k: "xlsx", l: ep.exportExcel }, { k: "csv", l: ep.exportCSV }, { k: "print", l: ep.print }].map(f => (
                      <button key={f.k} onClick={() => handleExport(f.k)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">{f.l}</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-white shadow-sm hover:opacity-90" style={{ backgroundColor: PRIMARY }}><Plus size={14} />{ep.addExam}</button>
            </>
          )}
        </div>

        {/* Filters */}
        {viewMode === "exams" && showFilters && (
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3">
            <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(1); }} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white"><option value="">{ep.allClasses}</option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <select value={filterSubject} onChange={e => { setFilterSubject(e.target.value); setPage(1); }} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white"><option value="">{ep.allSubjects}</option>{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <select value={filterType} onChange={e => { setFilterType(e.target.value as ExamType | ""); setPage(1); }} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white"><option value="">{ep.allTypes}</option>{(["homework", "quiz", "trimester", "oral", "practical", "final"] as ExamType[]).map(tp => <option key={tp} value={tp}>{getTypeLabel(tp)}</option>)}</select>
            <select value={filterTrimester} onChange={e => { setFilterTrimester(Number(e.target.value) as Trimester | 0); setPage(1); }} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white"><option value={0}>{ep.allTrimesters}</option><option value={1}>{ep.trimester1}</option><option value={2}>{ep.trimester2}</option><option value={3}>{ep.trimester3}</option></select>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as ExamStatus | ""); setPage(1); }} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white"><option value="">{ep.allStatuses}</option>{(["planned", "inProgress", "completed", "cancelled", "graded"] as ExamStatus[]).map(st => <option key={st} value={st}>{getStatusLabel(st)}</option>)}</select>
            {activeFilterCount > 0 && <button onClick={resetFilters} className="text-xs text-[#F35403] hover:underline flex items-center gap-1"><X size={12} />{ep.resetFilters}</button>}
          </div>
        )}

        {/* Bulk */}
        {viewMode === "exams" && selected.size > 0 && (
          <div className="p-3 border-b border-gray-100 bg-[#013486]/5 flex items-center gap-3">
            <span className="text-xs font-medium text-[#013486]">{selected.size} {ep.selected}</span>
            <button className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">{ep.deleteSelected}</button>
            <button className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">{ep.exportSelected}</button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 hover:underline ml-auto">{ep.deselectAll}</button>
          </div>
        )}

        {/* ═══════ TAB 1: EXAMS TABLE ═══════ */}
        {viewMode === "exams" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-3 w-8"><input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleSelectAll} className="rounded" /></th>
                    {[{ k: "name", l: ep.colExamName }, { k: "subject", l: ep.colSubject }, { k: "class", l: ep.colClass }, { k: "date", l: ep.colDate }, { k: "type", l: ep.colType }, { k: "status", l: ep.colStatus }, { k: "average", l: ep.colAverage }, { k: "passRate", l: ep.colPassRate }].map(c => (
                      <th key={c.k} onClick={() => toggleSort(c.k)} className="p-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">{c.l}<ArrowUpDown size={12} className={sortCol === c.k ? "text-[#013486]" : "text-gray-300"} /></div>
                      </th>
                    ))}
                    <th className="p-3 text-xs font-medium text-gray-500">{ep.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(exam => {
                    const sc = SUBJECT_COLORS[exam.subject] || { bg: "bg-gray-50", text: "text-gray-700" };
                    const isVal = validatedExams.has(exam.id);
                    return (
                      <tr key={exam.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-3"><input type="checkbox" checked={selected.has(exam.id)} onChange={() => toggleSelect(exam.id)} className="rounded" /></td>
                        <td className="p-3">
                          <button onClick={() => { setDrawerExam(exam); setDrawerTab("details"); }} className="text-sm font-medium text-gray-900 hover:text-[#013486] text-left flex items-center gap-1.5">
                            {isVal && <Lock size={11} className="text-emerald-600" />}{exam.name}
                          </button>
                          <p className="text-xs text-gray-400">{exam.teacher}</p>
                        </td>
                        <td className="p-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>{exam.subject}</span></td>
                        <td className="p-3 text-sm text-gray-600">{exam.className}</td>
                        <td className="p-3"><span className="text-sm text-gray-600">{formatDate(exam.date)}</span><p className="text-xs text-gray-400">{exam.time} · {exam.duration}{ep.minutes}</p></td>
                        <td className="p-3"><span className="text-xs text-gray-600">{getTypeLabel(exam.type)}</span></td>
                        <td className="p-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>{getStatusLabel(exam.status)}</span></td>
                        <td className="p-3 text-sm font-medium text-gray-700">{exam.average !== null ? `${exam.average}/${exam.totalPoints}` : "—"}</td>
                        <td className="p-3 text-sm text-gray-600">{exam.passRate !== null ? `${exam.passRate}%` : "—"}</td>
                        <td className="p-3"><button onClick={() => { setDrawerExam(exam); setDrawerTab("details"); }} className="text-xs text-[#013486] hover:underline">{ep.viewDetails}</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {paged.length === 0 && <div className="p-12 text-center"><ClipboardCheck size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-sm font-medium text-gray-500">{ep.noExams}</p><p className="text-xs text-gray-400 mt-1">{ep.noExamsDesc}</p></div>}
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">{ep.showing} {(page - 1) * PER_PAGE + 1} {ep.to} {Math.min(page * PER_PAGE, filtered.length)} {ep.of} {filtered.length} {ep.results}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
                  {getPageNumbers().map((p, i) => p === "..." ? <span key={`d${i}`} className="px-2 text-xs text-gray-400">&hellip;</span> : <button key={p} onClick={() => setPage(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium ${page === p ? "text-white" : "text-gray-600 hover:bg-gray-100"}`} style={page === p ? { backgroundColor: PRIMARY } : undefined}>{p}</button>)}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════ TAB 2: GRADE ENTRY ═══════ */}
        {viewMode === "grades" && (
          <div className="p-5">
            {/* Selectors */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">{ep.selectClassToGrade}</label>
                <select value={geClass} onChange={e => { setGeClass(e.target.value); setGeExamId(null); }} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
                  <option value="">{ep.selectClassToGrade}...</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {geClass && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">{ep.selectExamToGrade}</label>
                  <select value={geExamId || ""} onChange={e => setGeExamId(e.target.value || null)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
                    <option value="">{ep.selectExamToGrade}...</option>
                    {geExams.map(ex => <option key={ex.id} value={ex.id}>{ex.name} — {ex.subject} ({formatDate(ex.date)})</option>)}
                  </select>
                </div>
              )}
              {geExamId && (
                <div className="flex items-end pb-0.5">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${geIsValidated ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {geIsValidated ? <><Lock size={11} />{ep.validatedStatus}</> : <><Edit2 size={11} />{ep.draftStatus}</>}
                  </span>
                </div>
              )}
            </div>

            {/* Empty states */}
            {!geClass && (
              <div className="text-center py-16"><BookOpen size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-sm text-gray-500">{ep.selectClassFirst}</p></div>
            )}
            {geClass && !geExamId && geExams.length === 0 && (
              <div className="text-center py-16"><AlertCircle size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-sm text-gray-500">{ep.noExamsForClass}</p></div>
            )}
            {geClass && !geExamId && geExams.length > 0 && (
              <div className="text-center py-16"><FileText size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-sm text-gray-500">{ep.selectExamFirst}</p></div>
            )}

            {/* Grade Table */}
            {geSelectedExam && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{ep.enterGradesFor} : {geSelectedExam.name}</h3>
                    <p className="text-xs text-gray-400">{geSelectedExam.subject} · {geSelectedExam.className} · Coef. {geSelectedExam.coefficient} · {ep.outOf} {geSelectedExam.totalPoints}</p>
                  </div>
                  {geIsValidated && geSelectedExam.validatedBy && (
                    <div className="text-right">
                      <p className="text-xs text-emerald-600 font-medium">{ep.validatedBy}: {geSelectedExam.validatedBy}</p>
                      {geSelectedExam.validatedAt && <p className="text-xs text-gray-400">{ep.validatedAt}: {formatDate(geSelectedExam.validatedAt)}</p>}
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-3 text-left text-xs font-medium text-gray-500 w-10">#</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500">{ep.colStudent}</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 w-28">{ep.colGrade}</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 w-60">{ep.commentPlaceholder}</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 w-24">{ep.colMention}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getClassStudents(geSelectedExam.className).map((student, idx) => {
                        const eg = editGrades[student.id] || { grade: "", comment: "" };
                        const gradeNum = eg.grade ? parseFloat(eg.grade) : null;
                        const mention = gradeNum !== null ? computeMention(gradeNum, geSelectedExam.totalPoints) : null;
                        return (
                          <tr key={student.id} className={`border-b border-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                            <td className="p-3 text-xs text-gray-400">{idx + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})` }}>
                                  {student.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                </div>
                                <span className="text-sm text-gray-900">{student.name}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={geSelectedExam.totalPoints}
                                  step={0.5}
                                  value={eg.grade}
                                  disabled={geIsValidated}
                                  onChange={e => setEditGrades(prev => ({ ...prev, [student.id]: { ...prev[student.id], grade: e.target.value } }))}
                                  className={`w-16 px-2 py-1.5 text-sm border rounded-lg text-center font-medium ${geIsValidated ? "bg-gray-100 text-gray-500 border-gray-200" : "border-gray-300 focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"}`}
                                  placeholder="—"
                                />
                                <span className="text-xs text-gray-400">/{geSelectedExam.totalPoints}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={eg.comment}
                                disabled={geIsValidated}
                                onChange={e => setEditGrades(prev => ({ ...prev, [student.id]: { ...prev[student.id], comment: e.target.value } }))}
                                className={`w-full px-2 py-1.5 text-xs border rounded-lg ${geIsValidated ? "bg-gray-100 text-gray-500 border-gray-200" : "border-gray-300 focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"}`}
                                placeholder={ep.commentPlaceholder}
                              />
                            </td>
                            <td className="p-3">
                              {mention ? <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getMentionColor(mention)}`}>{getMentionLabel(mention)}</span> : <span className="text-xs text-gray-300">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Action Bar */}
                {!geIsValidated && (
                  <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-white"><Upload size={13} />{ep.importCSVFile}</button>
                      <p className="text-xs text-gray-400">{ep.importCSVDesc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleSaveGrades} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-white bg-white">
                        <FileText size={13} />{ep.saveDraft}
                      </button>
                      <button onClick={() => setShowValidateConfirm(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-white hover:opacity-90" style={{ backgroundColor: "#22C55E" }}>
                        <Lock size={13} />{ep.validateAndLock}
                      </button>
                    </div>
                  </div>
                )}
                {geIsValidated && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                    <Lock size={14} className="text-emerald-600" />
                    <p className="text-xs text-emerald-700 font-medium">{ep.gradesValidatedSuccess}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════ TAB 3: RESULTS ═══════ */}
        {viewMode === "results" && (
          <div className="p-5 space-y-4">
            {CLASSES.slice(0, 8).map(cls => {
              const classExams = ALL_EXAMS.filter(e => e.className === cls && e.status === "graded");
              const avg = classExams.length > 0 ? Math.round((classExams.reduce((a, e) => a + ((e.average || 0) / e.totalPoints) * 20, 0) / classExams.length) * 10) / 10 : 0;
              const pass = classExams.length > 0 ? Math.round(classExams.reduce((a, e) => a + (e.passRate || 0), 0) / classExams.length) : 0;
              const students = getClassStudents(cls);
              // compute student averages for ranking
              const studentAvgs = students.map(s => {
                let tw = 0, tc = 0;
                classExams.forEach(ex => {
                  const g = ex.grades.find(gr => gr.studentId === s.id);
                  if (g?.grade !== null && g?.grade !== undefined) { tw += ((g.grade) / ex.totalPoints) * 20 * ex.coefficient; tc += ex.coefficient; }
                });
                return { ...s, avg: tc > 0 ? Math.round((tw / tc) * 10) / 10 : 0 };
              }).sort((a, b) => b.avg - a.avg);

              return (
                <div key={cls} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-[#013486]/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: PRIMARY }}>{cls.substring(0, 2)}</div>
                      <div><h4 className="text-sm font-semibold text-gray-900">{cls}</h4><p className="text-xs text-gray-400">{students.length} {t.pages.admin.exams.desc && "élèves"} · {classExams.length} {ep.completedExams.toLowerCase()}</p></div>
                    </div>
                    <div className="flex items-center gap-5 text-right">
                      <div><p className="text-lg font-bold text-gray-900">{avg}/20</p><p className="text-xs text-gray-400">{ep.generalAverage}</p></div>
                      <div><p className="text-lg font-bold" style={{ color: pass >= 60 ? "#22C55E" : ACCENT }}>{pass}%</p><p className="text-xs text-gray-400">{ep.passRate}</p></div>
                    </div>
                  </div>
                  {/* Top 5 students */}
                  <div className="p-3 border-t border-gray-100">
                    <div className="grid grid-cols-5 gap-2">
                      {studentAvgs.slice(0, 5).map((s, rank) => (
                        <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${rank === 0 ? "bg-amber-400" : rank === 1 ? "bg-gray-400" : rank === 2 ? "bg-amber-700" : "bg-gray-300"}`}>{rank + 1}</div>
                          <div className="min-w-0"><p className="text-xs font-medium text-gray-700 truncate">{s.name}</p><p className="text-xs text-gray-400">{s.avg}/20</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Subjects */}
                  <div className="p-3 border-t border-gray-100">
                    <div className="grid grid-cols-6 gap-2">
                      {SUBJECTS.slice(0, 6).map(subj => {
                        const se = classExams.filter(e => e.subject === subj);
                        const sa = se.length > 0 ? Math.round((se.reduce((a, e) => a + ((e.average || 0) / e.totalPoints) * 20, 0) / se.length) * 10) / 10 : 0;
                        const scc = SUBJECT_COLORS[subj] || { bg: "bg-gray-50", text: "text-gray-700" };
                        return <div key={subj} className={`rounded-lg p-2 text-center ${scc.bg}`}><p className={`text-xs font-medium ${scc.text} truncate`}>{subj.substring(0, 5)}.</p><p className={`text-sm font-bold ${scc.text}`}>{sa > 0 ? sa : "—"}</p></div>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════ TAB 4: ANALYSIS ═══════ */}
        {viewMode === "analysis" && (
          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{ep.chartGradeDistribution}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartGradeDistribution}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill={PRIMARY} radius={[4, 4, 0, 0]} name={ep.studentCount} /></BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{ep.chartAverageBySubject}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartAvgBySubject} layout="vertical"><XAxis type="number" domain={[0, 20]} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} /><Tooltip /><Bar dataKey="value" fill={ACCENT} radius={[0, 4, 4, 0]} name={ep.colAverage} /></BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{ep.chartPassRateTrend}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartPassRateTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="value" stroke={PRIMARY} strokeWidth={2} dot={{ r: 4 }} name={ep.passRate} /></LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{ep.chartExamTypes}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart><Pie data={chartExamTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>{chartExamTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{ep.avgByClass}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartAvgByClass}><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis domain={[0, 20]} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} name={ep.generalAverage} /></BarChart>
                </ResponsiveContainer>
              </div>
              {/* Smart indicators */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">{ep.globalPerformance}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50 rounded-lg p-3"><p className="text-xs text-red-600 mb-1">{ep.studentInDifficulty}</p><p className="text-2xl font-bold text-red-700">{ALL_EXAMS.filter(e => e.status === "graded").reduce((a, e) => a + e.grades.filter(g => ((g.grade || 0) / e.totalPoints) * 20 < 10).length, 0)}</p></div>
                  <div className="bg-emerald-50 rounded-lg p-3"><p className="text-xs text-emerald-600 mb-1">{ep.performingStudent}</p><p className="text-2xl font-bold text-emerald-700">{ALL_EXAMS.filter(e => e.status === "graded").reduce((a, e) => a + e.grades.filter(g => ((g.grade || 0) / e.totalPoints) * 20 >= 14).length, 0)}</p></div>
                </div>
                <div className="space-y-2">
                  {SUBJECTS.slice(0, 6).map(subj => {
                    const exams = ALL_EXAMS.filter(e => e.subject === subj && e.average !== null);
                    const avg = exams.length > 0 ? Math.round((exams.reduce((a, e) => a + ((e.average || 0) / e.totalPoints) * 20, 0) / exams.length) * 10) / 10 : 0;
                    return (
                      <div key={subj} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-20 truncate">{subj.substring(0, 8)}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${(avg / 20) * 100}%`, backgroundColor: avg >= 12 ? "#22C55E" : avg >= 10 ? "#F59E0B" : "#EF4444" }} /></div>
                        <span className="text-xs font-medium text-gray-700 w-10 text-right">{avg}/20</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ TAB 5: BULLETIN ═══════ */}
        {viewMode === "bulletin" && (
          <div className="p-5">
            <div className="flex flex-wrap items-end gap-3 mb-5">
              <div className="min-w-[180px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">{ep.selectClassToGrade}</label>
                <select value={bulClass} onChange={e => { setBulClass(e.target.value); setBulStudent(""); }} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white">
                  <option value="">{ep.allClasses}</option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="min-w-[140px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldTrimester}</label>
                <select value={bulTrimester} onChange={e => setBulTrimester(Number(e.target.value) as Trimester)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white">
                  <option value={1}>{ep.trimester1}</option><option value={2}>{ep.trimester2}</option><option value={3}>{ep.trimester3}</option>
                </select>
              </div>
              {bulClass && (
                <div className="min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">{ep.selectStudentOrAll}</label>
                  <select value={bulStudent} onChange={e => setBulStudent(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white">
                    <option value="">{ep.allStudentsOption}</option>
                    {bulStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              {bulClass && (
                <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-white hover:opacity-90" style={{ backgroundColor: PRIMARY }}>
                  <Download size={13} />{ep.downloadBulletinPDF}
                </button>
              )}
            </div>

            {!bulClass && (
              <div className="text-center py-16"><GraduationCap size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-sm text-gray-500">{ep.selectClassFirst}</p></div>
            )}

            {bulClass && (
              <div className="space-y-4">
                {(bulStudent ? bulStudents.filter(s => s.id === bulStudent) : bulStudents.slice(0, 5)).map(student => {
                  const bul = getBulletinData(student.id);
                  // Compute rank
                  const allAvgs = bulStudents.map(s => getBulletinData(s.id).generalAvg).sort((a, b) => b - a);
                  const rank = allAvgs.indexOf(bul.generalAvg) + 1;

                  return (
                    <div key={student.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-[#013486] to-[#013486]/80 text-white p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold">{ep.bulletinTitle}</h3>
                            <p className="text-xs opacity-80">Lycée Jacques Roumain · {ep.academicYear} 2025-2026</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs opacity-80">{bulClass} · {bulTrimester === 1 ? ep.trimester1 : bulTrimester === 2 ? ep.trimester2 : ep.trimester3}</p>
                          </div>
                        </div>
                      </div>
                      {/* Student info */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})` }}>
                          {student.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                        </div>
                        <div><p className="text-sm font-semibold text-gray-900">{student.name}</p><p className="text-xs text-gray-400">{bulClass}</p></div>
                      </div>
                      {/* Grades table */}
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50/50">
                            <th className="p-2.5 text-left text-xs font-medium text-gray-500">{ep.subjectLabel}</th>
                            <th className="p-2.5 text-center text-xs font-medium text-gray-500 w-16">{ep.gradeLabel}</th>
                            <th className="p-2.5 text-center text-xs font-medium text-gray-500 w-14">{ep.coeffLabel}</th>
                            <th className="p-2.5 text-center text-xs font-medium text-gray-500 w-16">{ep.averageLabel}</th>
                            <th className="p-2.5 text-center text-xs font-medium text-gray-500 w-20">{ep.appreciationLabel}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bul.subjectGrades.map((sg, i) => (
                            <tr key={sg.subject} className={`border-b border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                              <td className="p-2.5 text-sm text-gray-700">{sg.subject}</td>
                              <td className="p-2.5 text-center text-sm font-medium text-gray-900">{sg.grade}</td>
                              <td className="p-2.5 text-center text-xs text-gray-500">{sg.coef}</td>
                              <td className="p-2.5 text-center text-sm font-medium text-gray-700">{sg.grade}/20</td>
                              <td className="p-2.5 text-center"><span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getMentionColor(sg.mention)}`}>{getMentionLabel(sg.mention)}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Footer */}
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div><p className="text-xs text-gray-400">{ep.generalAverage}</p><p className="text-lg font-bold text-gray-900">{bul.generalAvg}/20</p></div>
                            <div><p className="text-xs text-gray-400">{ep.ranking}</p><p className="text-lg font-bold text-gray-900">{rank}/{bulStudents.length}</p></div>
                            <div><p className="text-xs text-gray-400">{ep.colMention}</p><p className={`text-sm font-bold ${bul.generalAvg >= 12 ? "text-emerald-600" : bul.generalAvg >= 10 ? "text-amber-600" : "text-red-600"}`}>{getMentionLabel(bul.mention)}</p></div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right"><p className="text-xs text-gray-400">{ep.decision}</p><p className={`text-sm font-bold ${bul.generalAvg >= 10 ? "text-emerald-600" : "text-red-600"}`}>{bul.generalAvg >= 10 ? ep.admitted : ep.repeating}</p></div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-300 flex items-center justify-between">
                          <p className="text-xs text-gray-400 italic">{ep.principalSignature}: ________________</p>
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"><Mail size={11} />{ep.sendByEmail}</button>
                            <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"><MessageCircle size={11} />{ep.sendByWhatsApp}</button>
                            <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"><Share2 size={11} />{ep.shareWithParent}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════ DRAWER ═══════════════════ */}
      {drawerExam && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" />
          <div ref={drawerRef} className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div><h3 className="text-sm font-semibold text-gray-900">{drawerExam.name}</h3><p className="text-xs text-gray-400">{drawerExam.className} · {drawerExam.subject}</p></div>
              <button onClick={() => setDrawerExam(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="flex border-b border-gray-200 px-4">
              {([{ key: "details" as const, label: ep.tabDetails }, { key: "grades" as const, label: ep.tabGrades }, { key: "statistics" as const, label: ep.tabStatistics }, { key: "actions" as const, label: ep.tabActions }]).map(tab => (
                <button key={tab.key} onClick={() => setDrawerTab(tab.key)} className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-all ${drawerTab === tab.key ? "border-[#013486] text-[#013486]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{tab.label}</button>
              ))}
            </div>

            {drawerTab === "details" && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[{ l: ep.examSubject, v: drawerExam.subject }, { l: ep.examClass, v: drawerExam.className }, { l: ep.examDate, v: formatDate(drawerExam.date) }, { l: ep.examTime, v: drawerExam.time }, { l: ep.examDuration, v: `${drawerExam.duration} ${ep.minutes}` }, { l: ep.examType, v: getTypeLabel(drawerExam.type) }, { l: ep.examCoefficient, v: String(drawerExam.coefficient) }, { l: ep.examTotalPoints, v: String(drawerExam.totalPoints) }, { l: ep.examTeacher, v: drawerExam.teacher }, { l: ep.examRoom, v: drawerExam.room }, { l: ep.examTrimester, v: drawerExam.trimester === 1 ? ep.trimester1 : drawerExam.trimester === 2 ? ep.trimester2 : ep.trimester3 }, { l: ep.examStatus, v: getStatusLabel(drawerExam.status) }].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-0.5">{item.l}</p><p className="text-sm font-medium text-gray-900">{item.v}</p></div>
                  ))}
                </div>
                {drawerExam.average !== null && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-xs text-blue-600 mb-0.5">{ep.classAverage}</p><p className="text-lg font-bold text-blue-700">{drawerExam.average}/{drawerExam.totalPoints}</p></div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center"><p className="text-xs text-emerald-600 mb-0.5">{ep.passRate}</p><p className="text-lg font-bold text-emerald-700">{drawerExam.passRate}%</p></div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center"><p className="text-xs text-purple-600 mb-0.5">{ep.highestGrade}</p><p className="text-lg font-bold text-purple-700">{drawerExam.grades.length > 0 ? Math.max(...drawerExam.grades.map(g => g.grade || 0)) : "—"}/{drawerExam.totalPoints}</p></div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center"><p className="text-xs text-amber-600 mb-0.5">{ep.lowestGrade}</p><p className="text-lg font-bold text-amber-700">{drawerExam.grades.length > 0 ? Math.min(...drawerExam.grades.filter(g => g.grade !== null).map(g => g.grade!)) : "—"}/{drawerExam.totalPoints}</p></div>
                  </div>
                )}
              </div>
            )}

            {drawerTab === "grades" && (
              <div className="p-4">
                {drawerExam.grades.length === 0 ? (
                  <div className="text-center py-8"><FileText size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-500">{ep.noGradesYet}</p></div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-3">{drawerExam.grades.filter(g => g.grade !== null).length}/{drawerExam.grades.length} {ep.totalStudentsGraded.toLowerCase()}</p>
                    {drawerExam.grades.map((g, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})` }}>{g.studentName.split(" ").map(n => n[0]).join("").substring(0, 2)}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{g.studentName}</p></div>
                        <span className="text-sm font-bold text-gray-900">{g.grade !== null ? g.grade : "—"}<span className="text-xs text-gray-400 font-normal">/{drawerExam.totalPoints}</span></span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMentionColor(g.mention)}`}>{getMentionLabel(g.mention)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {drawerTab === "statistics" && (
              <div className="p-4 space-y-4">
                {drawerExam.grades.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-lg p-3 text-center"><p className="text-xs text-emerald-600">{ep.passedStudents}</p><p className="text-lg font-bold text-emerald-700">{drawerExam.grades.filter(g => (g.grade || 0) >= drawerExam.totalPoints / 2).length}</p></div>
                      <div className="bg-red-50 rounded-lg p-3 text-center"><p className="text-xs text-red-600">{ep.failedStudents}</p><p className="text-lg font-bold text-red-700">{drawerExam.grades.filter(g => (g.grade || 0) < drawerExam.totalPoints / 2).length}</p></div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">{ep.gradeDistribution}</h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={(() => { const tp = drawerExam.totalPoints; const r = [{ l: `0-${Math.round(tp * 0.25)}`, mn: 0, mx: tp * 0.25, c: 0 }, { l: `${Math.round(tp * 0.25)}-${Math.round(tp * 0.5)}`, mn: tp * 0.25, mx: tp * 0.5, c: 0 }, { l: `${Math.round(tp * 0.5)}-${Math.round(tp * 0.7)}`, mn: tp * 0.5, mx: tp * 0.7, c: 0 }, { l: `${Math.round(tp * 0.7)}-${tp}`, mn: tp * 0.7, mx: tp + 1, c: 0 }]; drawerExam.grades.forEach(g => { if (g.grade !== null) { const x = r.find(rg => g.grade! >= rg.mn && g.grade! < rg.mx); if (x) x.c++; } }); return r.map(x => ({ name: x.l, value: x.c })); })()}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" fill={PRIMARY} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">{ep.performanceSummary}</h4>
                      <div className="space-y-2">
                        {[{ l: ep.excellent, f: (p: number) => p >= 16, c: "#22C55E" }, { l: ep.veryGood, f: (p: number) => p >= 14 && p < 16, c: "#3B82F6" }, { l: ep.good, f: (p: number) => p >= 12 && p < 14, c: "#06B6D4" }, { l: ep.fairlyGood, f: (p: number) => p >= 10 && p < 12, c: "#F59E0B" }, { l: ep.insufficient, f: (p: number) => p < 10, c: "#EF4444" }].map((m, i) => {
                          const cnt = drawerExam.grades.filter(g => m.f(((g.grade || 0) / drawerExam.totalPoints) * 20)).length;
                          return <div key={i} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.c }} /><span className="text-xs text-gray-600 flex-1">{m.l}</span><span className="text-xs font-medium text-gray-900">{cnt}</span><span className="text-xs text-gray-400">({drawerExam.grades.length > 0 ? Math.round((cnt / drawerExam.grades.length) * 100) : 0}%)</span></div>;
                        })}
                      </div>
                    </div>
                  </>
                ) : <div className="text-center py-8"><BarChart3 size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-500">{ep.noGradesYet}</p></div>}
              </div>
            )}

            {drawerTab === "actions" && (
              <div className="p-4 space-y-2">
                {[
                  { icon: Edit2, label: ep.editExam, color: PRIMARY },
                  { icon: Copy, label: ep.duplicateExam, color: "#6366F1" },
                  { icon: Eye, label: ep.publishResults, color: "#22C55E" },
                  { icon: Bell, label: ep.notifyStudents, color: "#3B82F6" },
                  { icon: Bell, label: ep.notifyParents, color: "#8B5CF6" },
                  { icon: Share2, label: ep.shareResults, color: "#06B6D4" },
                  { icon: Lock, label: ep.lockGrades, color: "#F59E0B" },
                  { icon: FileText, label: ep.printExam, color: "#6B7280" },
                  { icon: Download, label: ep.downloadReportCard, color: PRIMARY },
                  { icon: AlertCircle, label: ep.cancelExam, color: "#F97316" },
                  { icon: Trash2, label: ep.deleteExam, color: "#EF4444" },
                ].map((a, i) => (
                  <button key={i} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: a.color + "15" }}><a.icon size={15} style={{ color: a.color }} /></div>
                    <span className="text-sm text-gray-700">{a.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════ ADD EXAM MODAL ═══════════════════ */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowAddModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-sm font-semibold text-gray-900">{ep.addExam}</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldExamName}</label><input type="text" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldSubject}</label><select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"><option value="">{ep.selectSubject}</option>{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldClass}</label><select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"><option value="">{ep.selectClass}</option>{CLASSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldDate}</label><input type="date" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldTime}</label><input type="time" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldDuration}</label><input type="number" defaultValue={60} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldCoefficient}</label><input type="number" defaultValue={1} min={1} max={10} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldTotalPoints}</label><input type="number" defaultValue={20} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldType}</label><select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"><option value="">{ep.selectType}</option>{(["homework", "quiz", "trimester", "oral", "practical", "final"] as ExamType[]).map(tp => <option key={tp} value={tp}>{getTypeLabel(tp)}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldTrimester}</label><select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"><option value="">{ep.selectTrimester}</option><option value="1">{ep.trimester1}</option><option value="2">{ep.trimester2}</option><option value="3">{ep.trimester3}</option></select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">{ep.fieldDescription}</label><textarea rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] resize-none" /></div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex items-center justify-end gap-2 rounded-b-2xl">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{ep.cancel}</button>
              <button className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90" style={{ backgroundColor: PRIMARY }}>{ep.createExam}</button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════ VALIDATION CONFIRM MODAL ═══════════════════ */}
      {showValidateConfirm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[55]" onClick={() => setShowValidateConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[56] w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center"><AlertCircle size={20} className="text-amber-600" /></div>
              <div><h3 className="text-sm font-semibold text-gray-900">{ep.validateAndLock}</h3><p className="text-xs text-gray-500">{ep.validationWarning}</p></div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowValidateConfirm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{ep.cancel}</button>
              <button onClick={handleValidateGrades} className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90" style={{ backgroundColor: "#22C55E" }}>{ep.confirm}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════ HELPER: Print HTML ═══════════════════ */
function buildPrintableHTML(exams: Exam[], ep: EP): string {
  const rows = exams.map(e => `<tr><td>${e.name}</td><td>${e.subject}</td><td>${e.className}</td><td>${e.date}</td><td>${e.type}</td><td>${e.average !== null ? e.average + "/" + e.totalPoints : "\u2014"}</td><td>${e.passRate !== null ? e.passRate + "%" : "\u2014"}</td></tr>`).join("");
  return `<!DOCTYPE html><html><head><title>${ep.totalExams}</title><style>body{font-family:system-ui;margin:2rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5;font-weight:600}h1{font-size:18px;margin-bottom:1rem}</style></head><body><h1>${ep.totalExams}</h1><table><thead><tr><th>${ep.colExamName}</th><th>${ep.colSubject}</th><th>${ep.colClass}</th><th>${ep.colDate}</th><th>${ep.colType}</th><th>${ep.colAverage}</th><th>${ep.colPassRate}</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}
