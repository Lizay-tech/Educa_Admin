"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import PageHeader from "@/components/shared/PageHeader";
import {
  CalendarDays, Search, Filter, Download, ChevronDown, Plus, X, MoreVertical,
  Printer, FileSpreadsheet, FileText, Clock, MapPin, Users, BookOpen,
  GraduationCap, AlertTriangle, ArrowUpDown, Eye, Edit3, Trash2, Copy,
  ArrowRightLeft, Bell, RefreshCw, ChevronLeft, ChevronRight, LayoutGrid,
  List, User, DoorOpen, Wand2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
type SlotType = "course" | "lab" | "exam" | "tutoring" | "activity" | "break" | "meeting";
type SlotStatus = "active" | "cancelled" | "modified" | "conflict" | "pending";
type ViewMode = "weekly" | "daily" | "list";
type GroupBy = "class" | "teacher" | "room";
type RoomType = "classroom" | "lab" | "gym" | "library" | "auditorium" | "computer";

interface ScheduleSlot {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  subject: string;
  subjectCode: string;
  teacher: string;
  teacherId: string;
  className: string;
  classId: string;
  room: string;
  roomId: string;
  type: SlotType;
  status: SlotStatus;
  recurrence: "weekly" | "oneTime";
  notes: string;
  color: string;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
  available: boolean;
}

interface HistoryEntry {
  id: string;
  date: string;
  user: string;
  type: "created" | "moved" | "modified" | "cancelled" | "restored";
  description: string;
}

interface Conflict {
  id: string;
  type: "teacher" | "room" | "class" | "overlap";
  slotA: string;
  slotB: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Type alias for translation keys                                    */
/* ------------------------------------------------------------------ */
type SP = ReturnType<typeof useTranslation>["t"]["schedulePage"];

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PRIMARY = "#013486";
const ACCENT = "#F35403";
const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];
const DAYS: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const TIME_PERIODS = [
  { start: "07:00", end: "07:45", label: "period1" },
  { start: "07:45", end: "08:30", label: "period2" },
  { start: "08:30", end: "08:45", label: "morningBreak", isBreak: true },
  { start: "08:45", end: "09:30", label: "period3" },
  { start: "09:30", end: "10:15", label: "period4" },
  { start: "10:15", end: "11:00", label: "period5" },
  { start: "11:00", end: "11:45", label: "period6" },
  { start: "11:45", end: "12:30", label: "lunchBreak", isBreak: true },
  { start: "12:30", end: "13:15", label: "period7" },
  { start: "13:15", end: "14:00", label: "period8" },
  { start: "14:00", end: "14:15", label: "afternoonBreak", isBreak: true },
];

const SUBJECT_COLORS: Record<string, string> = {
  "Mathématiques": "bg-blue-100 border-blue-400 text-blue-800",
  "Français": "bg-violet-100 border-violet-400 text-violet-800",
  "Sciences": "bg-emerald-100 border-emerald-400 text-emerald-800",
  "Histoire": "bg-amber-100 border-amber-400 text-amber-800",
  "Anglais": "bg-pink-100 border-pink-400 text-pink-800",
  "Géographie": "bg-teal-100 border-teal-400 text-teal-800",
  "Physique-Chimie": "bg-cyan-100 border-cyan-400 text-cyan-800",
  "Philosophie": "bg-purple-100 border-purple-400 text-purple-800",
  "Créole": "bg-orange-100 border-orange-400 text-orange-800",
  "Éducation Physique": "bg-lime-100 border-lime-400 text-lime-800",
  "Informatique": "bg-indigo-100 border-indigo-400 text-indigo-800",
  "Arts Plastiques": "bg-fuchsia-100 border-fuchsia-400 text-fuchsia-800",
};

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const ROOMS: Room[] = [
  { id: "R1", name: "Salle 101", capacity: 40, type: "classroom", available: true },
  { id: "R2", name: "Salle 102", capacity: 40, type: "classroom", available: true },
  { id: "R3", name: "Salle 103", capacity: 35, type: "classroom", available: true },
  { id: "R4", name: "Salle 104", capacity: 35, type: "classroom", available: true },
  { id: "R5", name: "Salle 201", capacity: 30, type: "classroom", available: true },
  { id: "R6", name: "Salle 202", capacity: 30, type: "classroom", available: true },
  { id: "R7", name: "Labo Sciences", capacity: 25, type: "lab", available: true },
  { id: "R8", name: "Salle Info", capacity: 20, type: "computer", available: true },
  { id: "R9", name: "Gymnase", capacity: 60, type: "gym", available: true },
  { id: "R10", name: "Bibliothèque", capacity: 50, type: "library", available: true },
];

const CLASSES = [
  "NS1-A", "NS1-B", "NS2-A", "NS2-B", "NS3-A", "NS3-B",
  "NS4-A", "NS4-B", "Philo-A", "6AF-A", "5AF-A",
];

const TEACHERS = [
  { id: "T1", name: "Jean-Baptiste Pierre", subject: "Mathématiques" },
  { id: "T2", name: "Marie Desrosiers", subject: "Français" },
  { id: "T3", name: "Paul Estimé", subject: "Sciences" },
  { id: "T4", name: "Rose Sylvain", subject: "Histoire" },
  { id: "T5", name: "Jacques Théodore", subject: "Anglais" },
  { id: "T6", name: "Suzanne Michel", subject: "Géographie" },
  { id: "T7", name: "André Voltaire", subject: "Physique-Chimie" },
  { id: "T8", name: "Claire Noël", subject: "Philosophie" },
  { id: "T9", name: "Daniel Bien-Aimé", subject: "Créole" },
  { id: "T10", name: "Françoise Laurent", subject: "Éducation Physique" },
  { id: "T11", name: "Marc Duval", subject: "Informatique" },
  { id: "T12", name: "Éliane Baptiste", subject: "Arts Plastiques" },
];

function generateSlots(): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  let id = 1;
  const subjects = ["Mathématiques", "Français", "Sciences", "Histoire", "Anglais",
    "Géographie", "Physique-Chimie", "Créole", "Éducation Physique", "Informatique"];
  const activePeriods = TIME_PERIODS.filter(p => !p.isBreak);

  for (const cls of CLASSES) {
    for (let d = 0; d < 6; d++) {
      const day = DAYS[d];
      const slotsPerDay = d === 5 ? 4 : 6;
      const dayPeriods = activePeriods.slice(0, slotsPerDay);

      for (let p = 0; p < dayPeriods.length; p++) {
        const subIdx = (id + d + p) % subjects.length;
        const subject = subjects[subIdx];
        const teacher = TEACHERS.find(t => t.subject === subject) || TEACHERS[0];
        const room = ROOMS[(id + p) % ROOMS.length];
        const isConflict = id === 15 || id === 42;
        const isCancelled = id === 28;

        slots.push({
          id: `SLOT-${String(id).padStart(4, "0")}`,
          day,
          startTime: dayPeriods[p].start,
          endTime: dayPeriods[p].end,
          subject,
          subjectCode: subject.substring(0, 3).toUpperCase(),
          teacher: teacher.name,
          teacherId: teacher.id,
          className: cls,
          classId: `CLS-${cls}`,
          room: room.name,
          roomId: room.id,
          type: subject === "Éducation Physique" ? "activity" :
            subject === "Informatique" ? "lab" :
              subject === "Sciences" && p === 2 ? "lab" : "course",
          status: isConflict ? "conflict" : isCancelled ? "cancelled" : "active",
          recurrence: "weekly",
          notes: "",
          color: SUBJECT_COLORS[subject] || "bg-gray-100 border-gray-400 text-gray-800",
        });
        id++;
      }
    }
  }
  return slots;
}

const ALL_SLOTS = generateSlots();

function getSlotDetails(slot: ScheduleSlot): { history: HistoryEntry[]; conflicts: Conflict[] } {
  const history: HistoryEntry[] = [
    { id: "H1", date: "2025-09-02", user: "Admin", type: "created", description: "Créneau créé" },
    { id: "H2", date: "2025-10-15", user: "Admin", type: "modified", description: "Salle modifiée" },
  ];
  const conflicts: Conflict[] = slot.status === "conflict" ? [
    { id: "C1", type: "teacher", slotA: slot.id, slotB: "SLOT-0042", description: `${slot.teacher} est déjà assigné` },
  ] : [];
  return { history, conflicts };
}

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */
function getTypeLabel(type: SlotType, sp: SP): string {
  const map: Record<SlotType, string> = {
    course: sp.typeCourse, lab: sp.typeLab, exam: sp.typeExam,
    tutoring: sp.typeTutoring, activity: sp.typeActivity,
    break: sp.typeBreak, meeting: sp.typeMeeting,
  };
  return map[type];
}

function getStatusColor(status: SlotStatus): string {
  const map: Record<SlotStatus, string> = {
    active: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    modified: "bg-amber-100 text-amber-700",
    conflict: "bg-red-100 text-red-700",
    pending: "bg-gray-100 text-gray-700",
  };
  return map[status];
}

function getStatusLabel(status: SlotStatus, sp: SP): string {
  const map: Record<SlotStatus, string> = {
    active: sp.statusActive, cancelled: sp.statusCancelled,
    modified: sp.statusModified, conflict: sp.statusConflict,
    pending: sp.statusPending,
  };
  return map[status];
}

function getDayLabel(day: DayOfWeek, sp: SP): string {
  return sp[day];
}

function getDayShort(day: DayOfWeek, sp: SP): string {
  const map: Record<DayOfWeek, string> = {
    monday: sp.mondayShort, tuesday: sp.tuesdayShort, wednesday: sp.wednesdayShort,
    thursday: sp.thursdayShort, friday: sp.fridayShort, saturday: sp.saturdayShort,
  };
  return map[day];
}

function buildPrintableHTML(title: string, slots: ScheduleSlot[], sp: SP): string {
  const rows = slots.map(s =>
    `<tr><td>${getDayLabel(s.day, sp)}</td><td>${s.startTime}-${s.endTime}</td><td>${s.className}</td><td>${s.subject}</td><td>${s.teacher}</td><td>${s.room}</td></tr>`
  ).join("");
  return `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#013486;color:#fff}h1{color:#013486;font-size:18px}tr:nth-child(even){background:#f9f9f9}</style></head><body><h1>${title}</h1><p>${sp.exportGenerated}: ${new Date().toLocaleDateString()}</p><table><thead><tr><th>${sp.colDay}</th><th>${sp.colTime}</th><th>${sp.colClass}</th><th>${sp.colSubject}</th><th>${sp.colTeacher}</th><th>${sp.colRoom}</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/* ---------- Slot Drawer ---------- */
function SlotDrawer({ slot, onClose, sp }: { slot: ScheduleSlot; onClose: () => void; sp: SP }) {
  const [tab, setTab] = useState<"details" | "history" | "conflicts" | "actions">("details");
  const { history, conflicts } = getSlotDetails(slot);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const tabs = [
    { key: "details" as const, label: sp.tabDetails },
    { key: "history" as const, label: sp.tabHistory },
    { key: "conflicts" as const, label: sp.tabConflicts, badge: conflicts.length },
    { key: "actions" as const, label: sp.tabActions },
  ];

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex justify-end">
      <div ref={drawerRef} className="w-full max-w-lg bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${PRIMARY}08, ${PRIMARY}15)` }}>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{slot.subject}</h2>
            <p className="text-sm text-gray-500">{slot.className} — {getDayLabel(slot.day, sp)} {slot.startTime}-{slot.endTime}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4 gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5
                ${tab === t.key ? "border-[#013486] text-[#013486]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
              {t.badge ? <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">{t.badge}</span> : null}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Details tab */}
          {tab === "details" && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">{sp.slotInfo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    [sp.slotSubject, slot.subject],
                    [sp.slotClass, slot.className],
                    [sp.slotTeacher, slot.teacher],
                    [sp.slotRoom, slot.room],
                    [sp.slotDay, getDayLabel(slot.day, sp)],
                    [sp.slotStart, slot.startTime],
                    [sp.slotEnd, slot.endTime],
                    [sp.slotType, getTypeLabel(slot.type, sp)],
                    [sp.slotRecurrence, slot.recurrence === "weekly" ? sp.recurring : sp.oneTime],
                    [sp.schoolYear, "2024-2025"],
                  ].map(([label, val], i) => (
                    <div key={i}>
                      <p className="text-gray-500 text-xs">{label}</p>
                      <p className="font-medium text-gray-900">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(slot.status)}`}>
                  {getStatusLabel(slot.status, sp)}
                </span>
                {slot.status === "conflict" && (
                  <span className="flex items-center gap-1 text-xs text-red-600"><AlertTriangle size={12} /> {sp.conflictsTitle}</span>
                )}
              </div>

              {/* Teacher info card */}
              <div className="bg-white border rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{sp.teacherContact}</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                    {slot.teacher.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{slot.teacher}</p>
                    <p className="text-xs text-gray-500">{slot.subject}</p>
                  </div>
                </div>
              </div>

              {/* Room info */}
              <div className="bg-white border rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{sp.roomCapacity}</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <DoorOpen size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{slot.room}</p>
                    <p className="text-xs text-gray-500">{ROOMS.find(r => r.id === slot.roomId)?.capacity || 35} places</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* History tab */}
          {tab === "history" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">{sp.changeHistory}</h3>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">{sp.noHistory}</p>
              ) : history.map(h => (
                <div key={h.id} className="bg-gray-50 rounded-xl p-3 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs
                    ${h.type === "created" ? "bg-emerald-500" : h.type === "moved" ? "bg-blue-500" :
                      h.type === "cancelled" ? "bg-red-500" : "bg-amber-500"}`}>
                    {h.type === "created" ? <Plus size={14} /> : h.type === "moved" ? <ArrowRightLeft size={14} /> :
                      h.type === "cancelled" ? <X size={14} /> : <Edit3 size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{h.description}</p>
                    <p className="text-xs text-gray-500">{sp.changedBy}: {h.user} — {h.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Conflicts tab */}
          {tab === "conflicts" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">{sp.conflictsTitle}</h3>
              {conflicts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-gray-500">{sp.noConflicts}</p>
                </div>
              ) : conflicts.map(c => (
                <div key={c.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    <p className="text-sm font-semibold text-red-700">
                      {c.type === "teacher" ? sp.conflictTeacher :
                        c.type === "room" ? sp.conflictRoom :
                          c.type === "class" ? sp.conflictClass : sp.conflictOverlap}
                    </p>
                  </div>
                  <p className="text-xs text-red-600 mb-3">{c.description}</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">{sp.resolveConflict}</button>
                    <button className="px-3 py-1.5 text-xs font-medium bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50">{sp.ignoreConflict}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions tab */}
          {tab === "actions" && (
            <div className="space-y-2">
              {[
                { icon: Edit3, label: sp.actionEditSlot, desc: sp.actionEditSlotDesc, color: "text-blue-600 bg-blue-50" },
                { icon: ArrowRightLeft, label: sp.actionMoveSlot, desc: sp.actionMoveSlotDesc, color: "text-indigo-600 bg-indigo-50" },
                { icon: RefreshCw, label: sp.actionSwapSlot, desc: sp.actionSwapSlotDesc, color: "text-violet-600 bg-violet-50" },
                { icon: Copy, label: sp.actionDuplicate, desc: sp.actionDuplicateDesc, color: "text-teal-600 bg-teal-50" },
                { icon: X, label: sp.actionCancel, desc: sp.actionCancelDesc, color: "text-amber-600 bg-amber-50" },
                { icon: Bell, label: sp.actionNotify, desc: sp.actionNotifyDesc, color: "text-cyan-600 bg-cyan-50" },
                { icon: Download, label: sp.actionExportClass, desc: sp.actionExportClassDesc, color: "text-emerald-600 bg-emerald-50" },
                { icon: Trash2, label: sp.actionDelete, desc: sp.actionDeleteDesc, color: "text-red-600 bg-red-50" },
              ].map(({ icon: Icon, label, desc, color }, i) => (
                <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Add Slot Modal ---------- */
function AddSlotModal({ onClose, sp }: { onClose: () => void; sp: SP }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{sp.addSlotTitle}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Class */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldClass} *</label>
            <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
              <option value="">{sp.selectClass}</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Subject */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldSubject} *</label>
            <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
              <option value="">{sp.selectSubject}</option>
              {TEACHERS.map(t => <option key={t.id} value={t.subject}>{t.subject}</option>)}
            </select>
          </div>
          {/* Teacher */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldTeacher} *</label>
            <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
              <option value="">{sp.selectTeacher}</option>
              {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
            </select>
          </div>
          {/* Room */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldRoom} *</label>
            <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
              <option value="">{sp.selectRoom}</option>
              {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} places)</option>)}
            </select>
          </div>
          {/* Day + Time row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldDay} *</label>
              <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
                <option value="">{sp.selectDay}</option>
                {DAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldStartTime} *</label>
              <input type="time" defaultValue="07:00" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldEndTime} *</label>
              <input type="time" defaultValue="07:45" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]" />
            </div>
          </div>
          {/* Type + Recurrence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldType}</label>
              <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
                <option value="course">{sp.typeCourse}</option>
                <option value="lab">{sp.typeLab}</option>
                <option value="exam">{sp.typeExam}</option>
                <option value="tutoring">{sp.typeTutoring}</option>
                <option value="activity">{sp.typeActivity}</option>
                <option value="meeting">{sp.typeMeeting}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldRecurrence}</label>
              <select className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
                <option value="weekly">{sp.recurring}</option>
                <option value="oneTime">{sp.oneTime}</option>
              </select>
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{sp.fieldNotes}</label>
            <textarea rows={2} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] resize-none" />
          </div>
        </div>
        <div className="p-5 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50">{sp.cancel}</button>
          <button className="px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90" style={{ background: PRIMARY }}>{sp.createSlot}</button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */
export default function AdminSchedulePage() {
  const { t } = useTranslation();
  const sp = t.schedulePage;

  /* State */
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [groupBy, setGroupBy] = useState<GroupBy>("class");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | "">("");
  const [search, setSearch] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState<string>("day");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const perPage = 15;

  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Filtered slots */
  const filtered = useMemo(() => {
    let list = ALL_SLOTS;
    if (selectedClass) list = list.filter(s => s.className === selectedClass);
    if (selectedTeacher) list = list.filter(s => s.teacherId === selectedTeacher);
    if (selectedRoom) list = list.filter(s => s.roomId === selectedRoom);
    if (selectedDay) list = list.filter(s => s.day === selectedDay);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.className.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.teacher.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedClass, selectedTeacher, selectedRoom, selectedDay, search]);

  /* Stats */
  const uniqueClasses = new Set(filtered.map(s => s.classId)).size;
  const uniqueTeachers = new Set(filtered.map(s => s.teacherId)).size;
  const uniqueRooms = new Set(filtered.map(s => s.roomId)).size;
  const totalHours = filtered.length * 0.75;
  const conflictsCount = filtered.filter(s => s.status === "conflict").length;

  const stats = [
    { label: sp.totalSlots, value: filtered.length.toString(), icon: CalendarDays, color: "from-blue-500 to-blue-600" },
    { label: sp.totalHoursWeek, value: totalHours.toFixed(0) + "h", icon: Clock, color: "from-indigo-500 to-indigo-600" },
    { label: sp.classesScheduled, value: uniqueClasses.toString(), icon: GraduationCap, color: "from-violet-500 to-violet-600" },
    { label: sp.teachersAssigned, value: uniqueTeachers.toString(), icon: Users, color: "from-emerald-500 to-emerald-600" },
    { label: sp.roomsUsed, value: uniqueRooms.toString(), icon: MapPin, color: "from-teal-500 to-teal-600" },
    { label: sp.avgHoursPerDay, value: (totalHours / 6).toFixed(1) + "h", icon: BookOpen, color: "from-amber-500 to-amber-600" },
    { label: sp.conflicts, value: conflictsCount.toString(), icon: AlertTriangle, color: conflictsCount > 0 ? "from-red-500 to-red-600" : "from-gray-400 to-gray-500" },
  ];

  /* Chart data */
  const hoursPerDayData = DAYS.map(d => ({
    name: getDayShort(d, sp),
    value: filtered.filter(s => s.day === d).length * 0.75,
  }));

  const subjectMap: Record<string, number> = {};
  filtered.forEach(s => { subjectMap[s.subject] = (subjectMap[s.subject] || 0) + 1; });
  const slotsBySubjectData = Object.entries(subjectMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 12) + "…" : name, value }));

  const roomOccData = ROOMS.slice(0, 6).map(r => ({
    name: r.name.length > 10 ? r.name.slice(0, 10) + "…" : r.name,
    value: filtered.filter(s => s.roomId === r.id).length,
  }));

  const teacherLoadData = TEACHERS.slice(0, 8).map(t => ({
    name: t.name.split(" ").pop() || t.name,
    value: filtered.filter(s => s.teacherId === t.id).length * 0.75,
  }));

  /* Sorted list (for list view) */
  const sortedList = useMemo(() => {
    const dayOrder: Record<string, number> = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortCol === "day") cmp = (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0) || a.startTime.localeCompare(b.startTime);
      else if (sortCol === "time") cmp = a.startTime.localeCompare(b.startTime);
      else if (sortCol === "class") cmp = a.className.localeCompare(b.className);
      else if (sortCol === "subject") cmp = a.subject.localeCompare(b.subject);
      else if (sortCol === "teacher") cmp = a.teacher.localeCompare(b.teacher);
      else if (sortCol === "room") cmp = a.room.localeCompare(b.room);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.ceil(sortedList.length / perPage);
  const paged = sortedList.slice((currentPage - 1) * perPage, currentPage * perPage);

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  function toggleSelect(id: string) {
    setSelectedSlots(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function resetFilters() {
    setSelectedClass(""); setSelectedTeacher(""); setSelectedRoom(""); setSelectedDay(""); setSearch("");
  }

  /* Weekly grid helper: get slots for a specific class/day */
  const gridEntity = groupBy === "class" ? selectedClass || CLASSES[0] : groupBy === "teacher" ? selectedTeacher || TEACHERS[0].id : selectedRoom || ROOMS[0].id;

  function getGridSlots(day: DayOfWeek, periodStart: string): ScheduleSlot[] {
    return filtered.filter(s => {
      if (s.day !== day || s.startTime !== periodStart) return false;
      if (groupBy === "class") return s.className === (selectedClass || CLASSES[0]);
      if (groupBy === "teacher") return s.teacherId === (selectedTeacher || TEACHERS[0].id);
      return s.roomId === (selectedRoom || ROOMS[0].id);
    });
  }

  /* Export handlers */
  function handleExport(type: string) {
    setShowExport(false);
    const title = sp.exportTitle;
    if (type === "print") {
      const html = buildPrintableHTML(title, filtered, sp);
      const w = window.open("", "_blank");
      if (w) { w.document.write(html); w.document.close(); w.print(); }
    } else if (type === "csv") {
      const header = `${sp.colDay},${sp.colTime},${sp.colClass},${sp.colSubject},${sp.colTeacher},${sp.colRoom}`;
      const rows = filtered.map(s => `${getDayLabel(s.day, sp)},${s.startTime}-${s.endTime},${s.className},${s.subject},${s.teacher},${s.room}`);
      downloadBlob([header, ...rows].join("\n"), "emploi-du-temps.csv", "text/csv");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t.pages.admin.schedule.title} description={t.pages.admin.schedule.desc} icon={<CalendarDays size={20} />} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon size={15} className="text-white" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hours per Day */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{sp.hoursPerDay}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hoursPerDayData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill={PRIMARY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Slots by Subject */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{sp.slotsBySubject}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={slotsBySubjectData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                {slotsBySubjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Room Occupancy */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{sp.roomOccupancy}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={roomOccData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Teacher Workload */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{sp.teacherWorkload}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={teacherLoadData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* View mode + Group by + Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-900">{sp.filterTitle}</span>
            <span className="text-xs text-gray-500 ml-1">
              {filtered.length} {filtered.length <= 1 ? sp.result : sp.results}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              {([
                { mode: "weekly" as ViewMode, icon: LayoutGrid, label: sp.viewWeekly },
                { mode: "daily" as ViewMode, icon: CalendarDays, label: sp.viewDaily },
                { mode: "list" as ViewMode, icon: List, label: sp.viewList },
              ]).map(v => (
                <button key={v.mode} onClick={() => setViewMode(v.mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                    ${viewMode === v.mode ? "bg-[#013486] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                  <v.icon size={14} />{v.label}
                </button>
              ))}
            </div>
            {/* Group by toggle (for weekly/daily) */}
            {viewMode !== "list" && (
              <div className="flex border rounded-lg overflow-hidden">
                {([
                  { key: "class" as GroupBy, icon: GraduationCap, label: sp.viewByClass },
                  { key: "teacher" as GroupBy, icon: User, label: sp.viewByTeacher },
                  { key: "room" as GroupBy, icon: DoorOpen, label: sp.viewByRoom },
                ]).map(g => (
                  <button key={g.key} onClick={() => setGroupBy(g.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                      ${groupBy === g.key ? "bg-[#F35403] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                    <g.icon size={14} />{g.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setCurrentPage(1); }}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
            <option value="">{sp.allClasses}</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selectedTeacher} onChange={e => { setSelectedTeacher(e.target.value); setCurrentPage(1); }}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
            <option value="">{sp.allTeachers}</option>
            {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={selectedRoom} onChange={e => { setSelectedRoom(e.target.value); setCurrentPage(1); }}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
            <option value="">{sp.allRooms}</option>
            {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select value={selectedDay} onChange={e => { setSelectedDay(e.target.value as DayOfWeek | ""); setCurrentPage(1); }}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]">
            <option value="">{sp.allShifts}</option>
            {DAYS.map(d => <option key={d} value={d}>{getDayLabel(d, sp)}</option>)}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder={sp.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]" />
          </div>
          <button onClick={resetFilters} className="px-3 py-2 text-sm font-medium text-gray-600 border rounded-lg hover:bg-gray-50">{sp.reset}</button>
        </div>
      </div>

      {/* Bulk selection bar */}
      {selectedSlots.size > 0 && (
        <div className="bg-[#013486] text-white rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium">{selectedSlots.size} {sp.selected}</span>
          <div className="flex items-center gap-2">
            {[
              { label: sp.bulkMove, icon: ArrowRightLeft },
              { label: sp.bulkDuplicate, icon: Copy },
              { label: sp.bulkAssignRoom, icon: DoorOpen },
              { label: sp.bulkDelete, icon: Trash2 },
            ].map(({ label, icon: Icon }, i) => (
              <button key={i} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Icon size={14} />{label}
              </button>
            ))}
            <button onClick={() => setSelectedSlots(new Set())} className="ml-2 p-1 hover:bg-white/10 rounded"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Action buttons row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 shadow-sm" style={{ background: PRIMARY }}>
            <Plus size={16} />{sp.addNew}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-lg text-gray-700 hover:bg-gray-50">
            <Wand2 size={16} />{sp.autoGenerate}
          </button>
        </div>
        <div className="relative" ref={exportRef}>
          <button onClick={() => setShowExport(!showExport)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-lg text-gray-700 hover:bg-gray-50">
            <Download size={16} />{sp.export}<ChevronDown size={14} />
          </button>
          {showExport && (
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded-xl shadow-lg z-20 py-1">
              {[
                { label: sp.exportPDF, icon: FileText, key: "pdf" },
                { label: sp.exportExcel, icon: FileSpreadsheet, key: "excel" },
                { label: sp.exportCSV, icon: FileText, key: "csv" },
                { label: sp.printSchedule, icon: Printer, key: "print" },
              ].map(e => (
                <button key={e.key} onClick={() => handleExport(e.key)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <e.icon size={14} />{e.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/*  WEEKLY VIEW                                  */}
      {/* ============================================ */}
      {viewMode === "weekly" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 w-20">{sp.timeSlot}</th>
                  {DAYS.map(d => (
                    <th key={d} className="p-3 text-center text-xs font-semibold text-gray-600 min-w-[140px]">
                      {getDayLabel(d, sp)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_PERIODS.map((period, pi) => (
                  <tr key={pi} className={`border-b ${period.isBreak ? "bg-gray-50" : "hover:bg-gray-50/50"}`}>
                    <td className="p-2 text-xs text-gray-500 font-medium whitespace-nowrap">
                      <div>{period.start}</div>
                      <div className="text-[10px] text-gray-400">{period.end}</div>
                    </td>
                    {DAYS.map(day => {
                      if (period.isBreak) {
                        return (
                          <td key={day} className="p-1 text-center">
                            <div className="text-[10px] text-gray-400 italic">
                              {period.label === "morningBreak" ? sp.morningBreak :
                                period.label === "lunchBreak" ? sp.lunchBreak : sp.afternoonBreak}
                            </div>
                          </td>
                        );
                      }
                      const slots = getGridSlots(day, period.start);
                      return (
                        <td key={day} className="p-1">
                          {slots.length > 0 ? slots.map(s => (
                            <button key={s.id} onClick={() => setSelectedSlot(s)}
                              className={`w-full p-1.5 rounded-lg border-l-3 text-left transition-all hover:shadow-sm ${s.color} ${s.status === "cancelled" ? "opacity-50 line-through" : ""}`}>
                              <p className="text-[11px] font-semibold truncate">{s.subject}</p>
                              <p className="text-[10px] truncate opacity-80">{s.teacher.split(" ").pop()}</p>
                              <p className="text-[10px] truncate opacity-60">{s.room}</p>
                            </button>
                          )) : (
                            <div className="w-full h-12 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                              <span className="text-[10px] text-gray-300">{sp.freeSlot}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t bg-gray-50 text-xs text-gray-500 text-center">
            {groupBy === "class" && `${sp.viewByClass}: ${selectedClass || CLASSES[0]}`}
            {groupBy === "teacher" && `${sp.viewByTeacher}: ${TEACHERS.find(t => t.id === (selectedTeacher || TEACHERS[0].id))?.name}`}
            {groupBy === "room" && `${sp.viewByRoom}: ${ROOMS.find(r => r.id === (selectedRoom || ROOMS[0].id))?.name}`}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/*  DAILY VIEW                                   */}
      {/* ============================================ */}
      {viewMode === "daily" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Day selector */}
          <div className="flex items-center justify-center gap-2 p-4 border-b">
            {DAYS.map(d => (
              <button key={d} onClick={() => setSelectedDay(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${(selectedDay || "monday") === d ? "bg-[#013486] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {getDayLabel(d, sp)}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-2">
            {TIME_PERIODS.map((period, pi) => {
              if (period.isBreak) {
                return (
                  <div key={pi} className="flex items-center gap-3 py-2">
                    <div className="w-16 text-xs text-gray-400 text-right">{period.start}</div>
                    <div className="flex-1 border-t border-dashed border-gray-300 relative">
                      <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-2 text-[10px] text-gray-400">
                        {period.label === "morningBreak" ? sp.morningBreak :
                          period.label === "lunchBreak" ? sp.lunchBreak : sp.afternoonBreak}
                      </span>
                    </div>
                  </div>
                );
              }

              const daySlots = filtered.filter(s => s.day === (selectedDay || "monday") && s.startTime === period.start);

              return (
                <div key={pi} className="flex gap-3">
                  <div className="w-16 text-xs text-gray-500 text-right pt-3 font-medium">
                    <div>{period.start}</div>
                    <div className="text-[10px] text-gray-400">{period.end}</div>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {daySlots.length > 0 ? daySlots.map(s => (
                      <button key={s.id} onClick={() => setSelectedSlot(s)}
                        className={`p-3 rounded-xl border-l-4 text-left hover:shadow-md transition-all ${s.color} ${s.status === "cancelled" ? "opacity-50" : ""}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{s.subject}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStatusColor(s.status)}`}>
                            {getStatusLabel(s.status, sp)}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-80">{s.className} — {s.teacher.split(" ").pop()}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">{s.room}</p>
                      </button>
                    )) : (
                      <div className="p-3 rounded-xl border border-dashed border-gray-200 flex items-center justify-center min-h-[60px]">
                        <span className="text-xs text-gray-300">{sp.slotEmpty}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/*  LIST VIEW                                    */}
      {/* ============================================ */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 w-10">
                    <input type="checkbox"
                      checked={paged.length > 0 && paged.every(s => selectedSlots.has(s.id))}
                      onChange={() => {
                        const allSelected = paged.every(s => selectedSlots.has(s.id));
                        const newSet = new Set(selectedSlots);
                        paged.forEach(s => allSelected ? newSet.delete(s.id) : newSet.add(s.id));
                        setSelectedSlots(newSet);
                      }}
                      className="rounded border-gray-300" />
                  </th>
                  {[
                    { key: "day", label: sp.colDay },
                    { key: "time", label: sp.colTime },
                    { key: "class", label: sp.colClass },
                    { key: "subject", label: sp.colSubject },
                    { key: "teacher", label: sp.colTeacher },
                    { key: "room", label: sp.colRoom },
                  ].map(col => (
                    <th key={col.key} className="p-3 text-left text-xs font-semibold text-gray-600">
                      <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-gray-900">
                        {col.label}<ArrowUpDown size={12} />
                      </button>
                    </th>
                  ))}
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">{sp.colType}</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600">{sp.colStatus}</th>
                  <th className="p-3 text-center text-xs font-semibold text-gray-600">{sp.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-12 text-gray-400">{sp.noSlot}</td></tr>
                ) : paged.map(s => (
                  <tr key={s.id} className={`border-b hover:bg-gray-50 transition-colors ${s.status === "cancelled" ? "opacity-50" : ""}`}>
                    <td className="p-3">
                      <input type="checkbox" checked={selectedSlots.has(s.id)} onChange={() => toggleSelect(s.id)} className="rounded border-gray-300" />
                    </td>
                    <td className="p-3 text-sm font-medium text-gray-900">{getDayLabel(s.day, sp)}</td>
                    <td className="p-3 text-sm text-gray-600">{s.startTime} - {s.endTime}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-[#013486]/10 text-[#013486] text-xs font-medium rounded-lg">{s.className}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.color.split(" ")[0]?.replace("bg-", "bg-") || "bg-gray-300"}`} />
                        <span className="text-sm text-gray-900">{s.subject}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{s.teacher.split(" ").slice(-1)[0]}</td>
                    <td className="p-3 text-sm text-gray-600">{s.room}</td>
                    <td className="p-3">
                      <span className="text-xs text-gray-500">{getTypeLabel(s.type, sp)}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(s.status)}`}>
                        {getStatusLabel(s.status, sp)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => setSelectedSlot(s)} className="p-1.5 hover:bg-gray-100 rounded-lg" title={sp.viewDetails}>
                        <Eye size={15} className="text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                {sp.showing} {(currentPage - 1) * perPage + 1} {sp.to} {Math.min(currentPage * perPage, sortedList.length)} {sp.of} {sortedList.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40"><ChevronLeft size={16} /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                        ${currentPage === page ? "bg-[#013486] text-white" : "text-gray-600 hover:bg-gray-200"}`}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drawer */}
      {selectedSlot && <SlotDrawer slot={selectedSlot} onClose={() => setSelectedSlot(null)} sp={sp} />}

      {/* Modal */}
      {showModal && <AddSlotModal onClose={() => setShowModal(false)} sp={sp} />}
    </div>
  );
}
