"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  MessageSquare, Megaphone, Bell, Users, Video, Newspaper, Zap,
  Plus, Search, X, Eye, ChevronLeft, ChevronRight, Send, Star,
  Paperclip, Mic, Phone, Mail, Smartphone, Clock, Filter,
  Download, Pin, Trash2, Archive, Reply, Forward, CheckCircle,
  AlertTriangle, Calendar, PlayCircle, Settings, ToggleLeft,
  ToggleRight, FileText, TrendingUp, Hash, Globe, Image,
} from "lucide-react";

/* ─── type alias ─── */
type CP = ReturnType<typeof useTranslation>["t"]["communicationPage"];

/* ─── palette ─── */
const PIE_COLORS = ["#013486", "#F35403", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  published: { bg: "bg-green-100", text: "text-green-700" },
  draft: { bg: "bg-gray-100", text: "text-gray-700" },
  scheduled: { bg: "bg-blue-100", text: "text-blue-700" },
  expired: { bg: "bg-red-100", text: "text-red-700" },
  active: { bg: "bg-green-100", text: "text-green-700" },
  inactive: { bg: "bg-gray-100", text: "text-gray-700" },
  delivered: { bg: "bg-green-100", text: "text-green-700" },
  failed: { bg: "bg-red-100", text: "text-red-700" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
  read: { bg: "bg-blue-100", text: "text-blue-700" },
  unread: { bg: "bg-orange-100", text: "text-orange-700" },
};
const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-100", text: "text-red-700" },
  high: { bg: "bg-orange-100", text: "text-orange-700" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700" },
  low: { bg: "bg-green-100", text: "text-green-700" },
};

/* ─── mock data ─── */
const mockMessages = Array.from({ length: 30 }, (_, i) => ({
  id: `MSG-${String(i + 1).padStart(3, "0")}`,
  from: ["Jean Marc Baptiste", "Marie Claire Dupont", "Pierre Louis", "Admin EDUCA", "Sophie Belizaire"][i % 5],
  to: ["Parents 6\u00e8me A", "Prof. Math", "Direction", "Tous les enseignants", "Classe 3\u00e8me B"][i % 5],
  subject: ["R\u00e9union parents-profs", "Notes du trimestre", "Fermeture exceptionnelle", "Nouvelle politique", "Sortie scolaire"][i % 5],
  preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt...",
  date: `2025-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}`,
  time: `${8 + (i % 10)}:${String(i % 60).padStart(2, "0")}`,
  type: (["personal", "group", "broadcast", "urgent", "internal"] as const)[i % 5],
  status: (["read", "unread", "read", "unread", "read"] as const)[i % 5],
  starred: i % 4 === 0,
  hasAttachment: i % 3 === 0,
}));

const mockAnnouncements = Array.from({ length: 15 }, (_, i) => ({
  id: `ANN-${String(i + 1).padStart(3, "0")}`,
  title: ["Rentr\u00e9e scolaire 2025", "Examens de mi-session", "F\u00eate de l'\u00e9cole", "Nouveau r\u00e8glement", "Journ\u00e9e portes ouvertes",
    "Vacances de No\u00ebl", "Inscription ouverte", "R\u00e9union du conseil", "Activit\u00e9s parascolaires", "Concours de science"][i % 10],
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus.",
  author: ["Admin", "Direction", "Secr\u00e9tariat", "Coord. p\u00e9dagogique"][i % 4],
  target: (["all", "teachers", "students", "parents", "staff"] as const)[i % 5],
  priority: (["high", "medium", "low", "critical", "medium"] as const)[i % 5],
  status: (["published", "draft", "scheduled", "published", "expired"] as const)[i % 5],
  date: `2025-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}`,
  pinned: i < 2,
  views: 45 + i * 12,
  reactions: 5 + i * 3,
  comments: i * 2,
}));

const mockGroups = Array.from({ length: 12 }, (_, i) => ({
  id: `GRP-${String(i + 1).padStart(3, "0")}`,
  name: ["Parents 6\u00e8me A", "Enseignants Math", "Club Sciences", "Conseil p\u00e9dagogique", "\u00c9quipe sportive",
    "Parents 5\u00e8me B", "Chorale scolaire", "Projet environnemental", "Staff administratif", "Direction g\u00e9n\u00e9rale",
    "3\u00e8me C - Parents", "Comit\u00e9 de f\u00eate"][i],
  type: (["class", "subject", "project", "team", "parents", "custom"] as const)[i % 6],
  members: 8 + i * 3,
  admin: ["Jean M. Baptiste", "Marie C. Dupont", "Pierre Louis"][i % 3],
  lastActivity: `Il y a ${1 + i} heure${i > 0 ? "s" : ""}`,
  unread: i % 3 === 0 ? 2 + i : 0,
}));

const mockMeetings = Array.from({ length: 10 }, (_, i) => ({
  id: `MTG-${String(i + 1).padStart(3, "0")}`,
  title: ["R\u00e9union parents-profs T1", "Conseil de classe 6\u00e8me", "Formation p\u00e9dagogique", "Comit\u00e9 de discipline",
    "Planification examens", "R\u00e9union du personnel", "Conseil d'administration", "R\u00e9union de rentr\u00e9e",
    "Bilan trimestriel", "Journ\u00e9e p\u00e9dagogique"][i],
  type: (["parentTeacher", "classMeeting", "staffMeeting", "boardMeeting"] as const)[i % 4],
  date: `2025-${String(1 + (i % 12)).padStart(2, "0")}-${String(10 + i).padStart(2, "0")}`,
  time: `${9 + (i % 4)}:00`,
  duration: `${1 + (i % 2)}h`,
  participants: 5 + i * 2,
  status: i < 5 ? "upcoming" : "past",
  hasRecording: i >= 5,
}));

const mockArticles = Array.from({ length: 8 }, (_, i) => ({
  id: `ART-${String(i + 1).padStart(3, "0")}`,
  title: ["Nos \u00e9l\u00e8ves brillent au concours national", "Journ\u00e9e sportive annuelle", "Inauguration du labo informatique",
    "Interview du directeur", "Les sciences \u00e0 l'honneur", "Festival culturel ha\u00eftien", "\u00c9dito: vision 2025", "Club de lecture"][i],
  category: (["news", "sports", "science", "editorial", "culture", "events", "achievements"] as const)[i % 7],
  author: ["R\u00e9daction", "\u00c9quipe sportive", "Prof. Sciences", "Direction"][i % 4],
  date: `2025-${String(1 + i).padStart(2, "0")}-15`,
  status: (["published", "draft", "published", "published"] as const)[i % 4],
  views: 120 + i * 30,
  featured: i === 0,
}));

const mockRules = Array.from({ length: 6 }, (_, i) => ({
  id: `RULE-${String(i + 1).padStart(3, "0")}`,
  name: ["Alerte absence", "Rappel paiement", "Publication notes", "Rappel examen", "Bienvenue inscription", "Anniversaire"][i],
  trigger: (["absence", "latePayment", "gradePublished", "examScheduled", "newEnrollment", "birthday"] as const)[i],
  action: (["sendSms", "sendEmail", "sendPush", "sendWhatsapp", "sendEmail", "sendPush"] as const)[i],
  active: i < 4,
  executions: 12 + i * 8,
  lastRun: `2025-01-${String(10 + i).padStart(2, "0")} ${8 + i}:30`,
  successRate: 85 + i * 2,
}));

/* ─── chart data ─── */
const monthlyMessages = [
  { m: "Sep", email: 120, sms: 80, push: 200, whatsapp: 45 },
  { m: "Oct", email: 150, sms: 95, push: 230, whatsapp: 60 },
  { m: "Nov", email: 180, sms: 110, push: 260, whatsapp: 75 },
  { m: "Dec", email: 90, sms: 50, push: 150, whatsapp: 30 },
  { m: "Jan", email: 200, sms: 120, push: 280, whatsapp: 90 },
  { m: "Feb", email: 170, sms: 100, push: 250, whatsapp: 70 },
];

const messagesByChannel = [
  { name: "Email", value: 35 },
  { name: "SMS", value: 20 },
  { name: "Push", value: 30 },
  { name: "WhatsApp", value: 10 },
  { name: "In-app", value: 5 },
];

const messagesByType = [
  { name: "Personnel", value: 40 },
  { name: "Groupe", value: 25 },
  { name: "Diffusion", value: 20 },
  { name: "Urgent", value: 10 },
  { name: "Interne", value: 5 },
];

/* ─── helpers ─── */
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
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
export default function AdminCommunicationPage() {
  const { t } = useTranslation();
  const c: CP = t.communicationPage;

  const tabs = [
    { key: "dashboard", label: c.tabDashboard, icon: <TrendingUp size={15} /> },
    { key: "messages", label: c.tabMessages, icon: <MessageSquare size={15} /> },
    { key: "announcements", label: c.tabAnnouncements, icon: <Megaphone size={15} /> },
    { key: "notifications", label: c.tabNotifications, icon: <Bell size={15} /> },
    { key: "groups", label: c.tabGroups, icon: <Users size={15} /> },
    { key: "meetings", label: c.tabMeetings, icon: <Video size={15} /> },
    { key: "journal", label: c.tabJournal, icon: <Newspaper size={15} /> },
    { key: "automation", label: c.tabAutomation, icon: <Zap size={15} /> },
  ];

  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.communication.title}
        description={t.pages.admin.communication.desc}
        icon={<MessageSquare size={20} />}
      />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition
              ${activeTab === tab.key ? "bg-[#013486] text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "dashboard" && <DashboardTab c={c} />}
      {activeTab === "messages" && <MessagesTab c={c} showToast={showToast} />}
      {activeTab === "announcements" && <AnnouncementsTab c={c} showToast={showToast} />}
      {activeTab === "notifications" && <NotificationsTab c={c} showToast={showToast} />}
      {activeTab === "groups" && <GroupsTab c={c} showToast={showToast} />}
      {activeTab === "meetings" && <MeetingsTab c={c} showToast={showToast} />}
      {activeTab === "journal" && <JournalTab c={c} showToast={showToast} />}
      {activeTab === "automation" && <AutomationTab c={c} showToast={showToast} />}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ═══════════════════════ TAB 1: DASHBOARD ═══════════════════════ */
function DashboardTab({ c }: { c: CP }) {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label={c.totalMessages} value="2,847" icon={<MessageSquare size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.totalAnnouncements} value="42" icon={<Megaphone size={20} className="text-[#F35403]" />} color="bg-[#F35403]/10" />
        <StatCard label={c.activeGroups} value="18" icon={<Users size={20} className="text-purple-600" />} color="bg-purple-100" />
        <StatCard label={c.scheduledMeetings} value="5" icon={<Video size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard label={c.responseRate} value="87%" icon={<TrendingUp size={20} className="text-amber-600" />} color="bg-amber-100" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Messages over time */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{c.messagesOverTime}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyMessages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="m" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="email" stroke="#013486" strokeWidth={2} name="Email" />
              <Line type="monotone" dataKey="sms" stroke="#F35403" strokeWidth={2} name="SMS" />
              <Line type="monotone" dataKey="push" stroke="#10B981" strokeWidth={2} name="Push" />
              <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2} name="WhatsApp" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By channel + by type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{c.messagesByChannel}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={messagesByChannel} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {messagesByChannel.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{c.messagesByType}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={messagesByType} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {messagesByType.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick channels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: c.channelEmail, icon: <Mail size={20} />, count: "1,240", color: "text-[#013486]", bg: "bg-[#013486]/10" },
          { label: c.channelSms, icon: <Smartphone size={20} />, count: "560", color: "text-[#F35403]", bg: "bg-[#F35403]/10" },
          { label: c.channelWhatsapp, icon: <Phone size={20} />, count: "340", color: "text-green-600", bg: "bg-green-100" },
          { label: c.channelPush, icon: <Bell size={20} />, count: "707", color: "text-purple-600", bg: "bg-purple-100" },
        ].map((ch, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ch.bg} ${ch.color}`}>{ch.icon}</div>
            <div>
              <p className="text-lg font-bold text-gray-900">{ch.count}</p>
              <p className="text-xs text-gray-500">{ch.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement + top senders */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{c.engagementStats}</h3>
          <div className="space-y-3">
            {[
              { label: c.deliveryRate, value: 96 },
              { label: c.openRate, value: 72 },
              { label: c.responseRate, value: 87 },
              { label: c.parentEngagement, value: 65 },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-semibold text-gray-900">{s.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-[#013486]" style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{c.topSenders}</h3>
          <div className="space-y-2">
            {[
              { name: "Admin EDUCA", count: 342, role: "Admin" },
              { name: "Marie C. Dupont", count: 215, role: "Enseignant" },
              { name: "Pierre Louis", count: 178, role: "Coord. p\u00e9d." },
              { name: "Sophie Belizaire", count: 145, role: "Secr\u00e9tariat" },
              { name: "Jean M. Baptiste", count: 120, role: "Direction" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#013486]/10 flex items-center justify-center text-xs font-bold text-[#013486]">
                    {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.role}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#013486]">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 2: MESSAGES ═══════════════════════ */
function MessagesTab({ c, showToast }: { c: CP; showToast: (m: string) => void }) {
  const [folder, setFolder] = useState("inbox");
  const [searchQ, setSearchQ] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<typeof mockMessages[0] | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const folders = [
    { key: "inbox", label: c.inbox, icon: <Mail size={14} />, count: 12 },
    { key: "sent", label: c.sent, icon: <Send size={14} />, count: 0 },
    { key: "drafts", label: c.drafts, icon: <FileText size={14} />, count: 3 },
    { key: "starred", label: c.starred, icon: <Star size={14} />, count: 5 },
    { key: "archived", label: c.archived, icon: <Archive size={14} />, count: 0 },
    { key: "trash", label: c.trash, icon: <Trash2 size={14} />, count: 0 },
  ];

  const filtered = mockMessages.filter(m =>
    m.subject.toLowerCase().includes(searchQ.toLowerCase()) ||
    m.from.toLowerCase().includes(searchQ.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <div className="w-52 shrink-0 space-y-2">
        <button onClick={() => setComposeOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e] transition"
        >
          <Plus size={16} /> {c.compose}
        </button>
        {folders.map(f => (
          <button key={f.key} onClick={() => { setFolder(f.key); setPage(1); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition
              ${folder === f.key ? "bg-[#013486]/10 text-[#013486] font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            {f.icon}
            <span className="flex-1 text-left">{f.label}</span>
            {f.count > 0 && <span className="text-xs bg-[#F35403] text-white px-1.5 py-0.5 rounded-full">{f.count}</span>}
          </button>
        ))}
      </div>

      {/* Message list */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-3 border-b border-gray-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={c.search}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
          </div>
        </div>

        {/* Messages */}
        <div className="divide-y divide-gray-50">
          {paged.map(msg => (
            <div key={msg.id} onClick={() => setSelectedMsg(msg)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition
                ${msg.status === "unread" ? "bg-[#013486]/5 font-medium" : ""}`}
            >
              <button onClick={(e) => { e.stopPropagation(); }} className="text-gray-300 hover:text-yellow-400">
                <Star size={14} className={msg.starred ? "fill-yellow-400 text-yellow-400" : ""} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm truncate ${msg.status === "unread" ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {msg.from}
                  </span>
                  {msg.hasAttachment && <Paperclip size={12} className="text-gray-400 shrink-0" />}
                  <Badge label={msg.type} color={msg.type === "urgent"
                    ? PRIORITY_COLORS.high
                    : { bg: "bg-gray-100", text: "text-gray-600" }} />
                </div>
                <p className="text-sm text-gray-800 truncate">{msg.subject}</p>
                <p className="text-xs text-gray-400 truncate">{msg.preview}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">{msg.date}</p>
                <p className="text-xs text-gray-400">{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>{c.showing} {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} {c.of} {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
            <span>{c.page} {page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Message detail drawer */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedMsg(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto animate-slide-left">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{selectedMsg.subject}</h3>
              <button onClick={() => setSelectedMsg(null)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#013486]/10 flex items-center justify-center text-sm font-bold text-[#013486]">
                  {selectedMsg.from.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedMsg.from}</p>
                  <p className="text-xs text-gray-500">{c.to}: {selectedMsg.to}</p>
                  <p className="text-xs text-gray-400">{selectedMsg.date} {selectedMsg.time}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                {selectedMsg.preview}<br /><br />
                Ceci est le contenu complet du message. Il peut contenir plusieurs paragraphes, des liens et des informations d&eacute;taill&eacute;es sur le sujet en question.
              </div>
              {selectedMsg.hasAttachment && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Paperclip size={14} className="text-blue-600" />
                  <span className="text-sm text-blue-700">document.pdf (245 KB)</span>
                  <button className="ml-auto text-xs text-blue-600 hover:underline"><Download size={14} /></button>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => { showToast(c.reply); setSelectedMsg(null); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">
                  <Reply size={14} /> {c.reply}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Forward size={14} /> {c.forward}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Archive size={14} /> {c.archiveMessage}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setComposeOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{c.compose}</h3>
              <button onClick={() => setComposeOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{c.to}</label>
                <input className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.subject}</label>
                <input className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.body}</label>
                <textarea rows={6} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Paperclip size={16} /></button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Image size={16} /></button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Mic size={16} /></button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setComposeOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{c.saveDraft}</button>
              <button onClick={() => { setComposeOpen(false); showToast(c.sendMessage); }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">
                <Send size={14} /> {c.sendMessage}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ TAB 3: ANNOUNCEMENTS ═══════════════════════ */
function AnnouncementsTab({ c, showToast }: { c: CP; showToast: (m: string) => void }) {
  const [searchQ, setSearchQ] = useState("");
  const [filterTarget, setFilterTarget] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<typeof mockAnnouncements[0] | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const targetLabels: Record<string, string> = {
    all: c.targetAll, teachers: c.targetTeachers, students: c.targetStudents,
    parents: c.targetParents, staff: c.targetStaff,
  };
  const statusLabels: Record<string, string> = {
    published: c.published, draft: c.draft, scheduled: c.scheduled, expired: c.expired,
  };

  const filtered = mockAnnouncements.filter(a =>
    (filterTarget === "all" || a.target === filterTarget) &&
    (filterStatus === "all" || a.status === filterStatus) &&
    a.title.toLowerCase().includes(searchQ.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">{c.announcementsTitle}</h2>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <Plus size={16} /> {c.createAnnouncement}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={c.search}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
        </div>
        <select value={filterTarget} onChange={e => { setFilterTarget(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
          <option value="all">{c.announcementTarget}</option>
          {Object.entries(targetLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
          <option value="all">{c.filterByStatus}</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Announcements grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {paged.map(ann => (
          <div key={ann.id} onClick={() => setSelectedAnn(ann)}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {ann.pinned && <Pin size={12} className="text-[#F35403]" />}
                <Badge label={statusLabels[ann.status] || ann.status} color={STATUS_COLORS[ann.status] || STATUS_COLORS.pending} />
                <Badge label={ann.priority} color={PRIORITY_COLORS[ann.priority] || PRIORITY_COLORS.medium} />
              </div>
              <span className="text-xs text-gray-400">{ann.date}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{ann.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ann.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{ann.author}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Eye size={12} /> {ann.views}</span>
                <span className="flex items-center gap-1"><MessageSquare size={12} /> {ann.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
          <span>{c.page} {page}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
        </div>
      )}

      {/* Announcement detail drawer */}
      {selectedAnn && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedAnn(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto animate-slide-left">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{selectedAnn.title}</h3>
              <button onClick={() => setSelectedAnn(null)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge label={statusLabels[selectedAnn.status] || selectedAnn.status} color={STATUS_COLORS[selectedAnn.status] || STATUS_COLORS.pending} />
                <Badge label={selectedAnn.priority} color={PRIORITY_COLORS[selectedAnn.priority] || PRIORITY_COLORS.medium} />
                <Badge label={targetLabels[selectedAnn.target] || selectedAnn.target} color={{ bg: "bg-blue-100", text: "text-blue-700" }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Eye size={16} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-lg font-bold text-gray-900">{selectedAnn.views}</p>
                  <p className="text-xs text-gray-500">{c.views}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Star size={16} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-lg font-bold text-gray-900">{selectedAnn.reactions}</p>
                  <p className="text-xs text-gray-500">{c.reactions}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <MessageSquare size={16} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-lg font-bold text-gray-900">{selectedAnn.comments}</p>
                  <p className="text-xs text-gray-500">{c.comments}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                {selectedAnn.content}<br /><br />
                Contenu d&eacute;taill&eacute; de l&apos;annonce avec toutes les informations n&eacute;cessaires pour les destinataires concern&eacute;s.
              </div>
              <div className="text-xs text-gray-400">
                <p>{c.articleAuthor}: {selectedAnn.author}</p>
                <p>{c.date}: {selectedAnn.date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { showToast(c.editAnnouncement); setSelectedAnn(null); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                  {c.edit}
                </button>
                <button onClick={() => { showToast(c.publishAnnouncement); setSelectedAnn(null); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">
                  {c.publishAnnouncement}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create announcement modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{c.createAnnouncement}</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{c.announcementTitle}</label>
                <input className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.announcementContent}</label>
                <textarea rows={4} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.announcementTarget}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    {Object.entries(targetLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.announcementPriority}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    <option value="low">{c.low}</option>
                    <option value="medium">{c.medium}</option>
                    <option value="high">{c.high}</option>
                    <option value="critical">{c.critical}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{c.cancel}</button>
              <button onClick={() => { setCreateOpen(false); showToast(c.publishAnnouncement); }}
                className="px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">{c.publishAnnouncement}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ TAB 4: NOTIFICATIONS ═══════════════════════ */
function NotificationsTab({ c, showToast }: { c: CP; showToast: (m: string) => void }) {
  const [sendOpen, setSendOpen] = useState(false);

  const notifStats = [
    { label: c.deliveryRate, value: "96%", color: "text-green-600" },
    { label: c.openRate, value: "72%", color: "text-blue-600" },
    { label: c.smsCredits, value: "4,200", color: "text-[#F35403]" },
    { label: c.smsSent, value: "1,340", color: "text-[#013486]" },
  ];

  const channels = [
    { key: "push", label: c.pushNotification, icon: <Bell size={20} />, sent: 2100, color: "text-purple-600", bg: "bg-purple-100" },
    { key: "email", label: c.emailNotification, icon: <Mail size={20} />, sent: 1240, color: "text-[#013486]", bg: "bg-[#013486]/10" },
    { key: "sms", label: c.smsNotification, icon: <Smartphone size={20} />, sent: 560, color: "text-[#F35403]", bg: "bg-[#F35403]/10" },
    { key: "whatsapp", label: c.whatsappNotification, icon: <Phone size={20} />, sent: 340, color: "text-green-600", bg: "bg-green-100" },
  ];

  const templates = [
    { name: c.notifAbsence, channel: "SMS", trigger: c.triggerAbsence },
    { name: c.notifGrade, channel: "Push", trigger: c.triggerGradePublished },
    { name: c.notifExam, channel: "Email", trigger: c.triggerExamScheduled },
    { name: c.notifPayment, channel: "WhatsApp", trigger: c.triggerLatePayment },
    { name: c.notifEvent, channel: "Push", trigger: c.triggerEventCreated },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{c.notificationsTitle}</h2>
        <button onClick={() => setSendOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <Plus size={16} /> {c.sendNotification}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {notifStats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Channels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {channels.map(ch => (
          <div key={ch.key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ch.bg} ${ch.color} mb-3`}>
              {ch.icon}
            </div>
            <p className="text-sm font-semibold text-gray-900">{ch.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{ch.sent.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{c.messagesSent}</p>
          </div>
        ))}
      </div>

      {/* Templates */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{c.smsTemplate}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {templates.map((tpl, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#013486]/10 flex items-center justify-center">
                  <Bell size={14} className="text-[#013486]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{tpl.name}</p>
                  <p className="text-xs text-gray-500">{tpl.trigger}</p>
                </div>
              </div>
              <Badge label={tpl.channel} color={{ bg: "bg-blue-100", text: "text-blue-700" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Send notification modal */}
      {sendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSendOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{c.sendNotification}</h3>
              <button onClick={() => setSendOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{c.notifType}</label>
                <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                  <option>{c.notifAbsence}</option>
                  <option>{c.notifGrade}</option>
                  <option>{c.notifExam}</option>
                  <option>{c.notifEvent}</option>
                  <option>{c.notifPayment}</option>
                  <option>{c.notifGeneral}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.notifChannel}</label>
                <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                  <option>{c.pushNotification}</option>
                  <option>{c.emailNotification}</option>
                  <option>{c.smsNotification}</option>
                  <option>{c.whatsappNotification}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.notifTarget}</label>
                <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                  <option>{c.targetAll}</option>
                  <option>{c.targetTeachers}</option>
                  <option>{c.targetStudents}</option>
                  <option>{c.targetParents}</option>
                  <option>{c.targetStaff}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.body}</label>
                <textarea rows={3} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="radio" name="schedule" defaultChecked className="text-[#013486]" /> {c.notifImmediate}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="radio" name="schedule" className="text-[#013486]" /> {c.notifScheduled}
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSendOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{c.cancel}</button>
              <button onClick={() => { setSendOpen(false); showToast(c.sendNotification); }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">
                <Send size={14} /> {c.sendNotification}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ TAB 5: GROUPS ═══════════════════════ */
function GroupsTab({ c, showToast }: { c: CP; showToast: (m: string) => void }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [filterType, setFilterType] = useState("all");

  const typeLabels: Record<string, string> = {
    class: c.groupClass, subject: c.groupSubject, project: c.groupProject,
    team: c.groupTeam, parents: c.groupParents, custom: c.groupCustom,
  };
  const typeColors: Record<string, { bg: string; text: string }> = {
    class: { bg: "bg-blue-100", text: "text-blue-700" },
    subject: { bg: "bg-purple-100", text: "text-purple-700" },
    project: { bg: "bg-green-100", text: "text-green-700" },
    team: { bg: "bg-amber-100", text: "text-amber-700" },
    parents: { bg: "bg-pink-100", text: "text-pink-700" },
    custom: { bg: "bg-gray-100", text: "text-gray-700" },
  };

  const filtered = mockGroups.filter(g =>
    (filterType === "all" || g.type === filterType) &&
    g.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">{c.groupsTitle}</h2>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <Plus size={16} /> {c.createGroup}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={c.search}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
          <option value="all">{c.filterByType}</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Group cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(g => (
          <div key={g.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#013486]/10 flex items-center justify-center">
                  <Hash size={18} className="text-[#013486]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{g.name}</h3>
                  <Badge label={typeLabels[g.type] || g.type} color={typeColors[g.type] || typeColors.custom} />
                </div>
              </div>
              {g.unread > 0 && (
                <span className="bg-[#F35403] text-white text-xs px-2 py-0.5 rounded-full font-medium">{g.unread}</span>
              )}
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Users size={12} /> {c.memberCount}</span>
                <span className="font-medium text-gray-700">{g.members}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{c.groupAdmin}</span>
                <span className="font-medium text-gray-700">{g.admin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Clock size={12} /> {c.lastActivity}</span>
                <span className="text-gray-400">{g.lastActivity}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button className="flex-1 text-xs text-center py-1.5 bg-[#013486]/10 text-[#013486] rounded-lg hover:bg-[#013486]/20 font-medium">
                <MessageSquare size={12} className="inline mr-1" /> {c.chat}
              </button>
              <button className="flex-1 text-xs text-center py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">
                <Settings size={12} className="inline mr-1" /> {c.groupSettings}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create group modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{c.createGroup}</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{c.groupName}</label>
                <input className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.groupDescription}</label>
                <textarea rows={2} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.groupType}</label>
                <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{c.cancel}</button>
              <button onClick={() => { setCreateOpen(false); showToast(c.createGroup); }}
                className="px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">{c.createGroup}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ TAB 6: MEETINGS ═══════════════════════ */
function MeetingsTab({ c, showToast }: { c: CP; showToast: (m: string) => void }) {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const typeLabels: Record<string, string> = {
    parentTeacher: c.parentTeacher, classMeeting: c.classMeeting,
    staffMeeting: c.staffMeeting, boardMeeting: c.boardMeeting,
  };
  const typeColors: Record<string, { bg: string; text: string }> = {
    parentTeacher: { bg: "bg-blue-100", text: "text-blue-700" },
    classMeeting: { bg: "bg-green-100", text: "text-green-700" },
    staffMeeting: { bg: "bg-purple-100", text: "text-purple-700" },
    boardMeeting: { bg: "bg-amber-100", text: "text-amber-700" },
  };

  const upcoming = mockMeetings.filter(m => m.status === "upcoming");
  const past = mockMeetings.filter(m => m.status === "past");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{c.meetingsTitle}</h2>
        <button onClick={() => setScheduleOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <Plus size={16} /> {c.scheduleMeeting}
        </button>
      </div>

      {/* Upcoming */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{c.upcomingMeetings}</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcoming.map(mtg => (
            <div key={mtg.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <Badge label={typeLabels[mtg.type] || mtg.type} color={typeColors[mtg.type] || typeColors.staffMeeting} />
                <span className="text-xs text-gray-400">{mtg.id}</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{mtg.title}</h4>
              <div className="space-y-1 text-xs text-gray-500">
                <p className="flex items-center gap-1"><Calendar size={12} /> {mtg.date}</p>
                <p className="flex items-center gap-1"><Clock size={12} /> {mtg.time} ({mtg.duration})</p>
                <p className="flex items-center gap-1"><Users size={12} /> {mtg.participants} {c.meetingParticipants.toLowerCase()}</p>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => showToast(c.startMeeting)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                  <Video size={12} /> {c.startMeeting}
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">
                  {c.edit}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{c.pastMeetings}</h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-3">{c.meetingTitle}</th>
                <th className="text-left px-4 py-3">{c.groupType}</th>
                <th className="text-left px-4 py-3">{c.meetingDate}</th>
                <th className="text-left px-4 py-3">{c.meetingDuration}</th>
                <th className="text-left px-4 py-3">{c.meetingParticipants}</th>
                <th className="text-left px-4 py-3">{c.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {past.map(mtg => (
                <tr key={mtg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{mtg.title}</td>
                  <td className="px-4 py-3">
                    <Badge label={typeLabels[mtg.type] || mtg.type} color={typeColors[mtg.type] || typeColors.staffMeeting} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{mtg.date}</td>
                  <td className="px-4 py-3 text-gray-500">{mtg.duration}</td>
                  <td className="px-4 py-3 text-gray-500">{mtg.participants}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {mtg.hasRecording && (
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#013486]" title={c.meetingRecording}>
                          <PlayCircle size={14} />
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title={c.meetingNotes}>
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule meeting modal */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setScheduleOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{c.scheduleMeeting}</h3>
              <button onClick={() => setScheduleOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{c.meetingTitle}</label>
                <input className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.meetingDate}</label>
                  <input type="date" className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.meetingTime}</label>
                  <input type="time" className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.meetingDuration}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    <option>30 min</option>
                    <option>1h</option>
                    <option>1h30</option>
                    <option>2h</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.groupType}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.meetingAgenda}</label>
                <textarea rows={3} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setScheduleOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{c.cancel}</button>
              <button onClick={() => { setScheduleOpen(false); showToast(c.scheduleMeeting); }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">
                <Calendar size={14} /> {c.scheduleMeeting}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ TAB 7: JOURNAL ═══════════════════════ */
function JournalTab({ c, showToast }: { c: CP; showToast: (m: string) => void }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const catLabels: Record<string, string> = {
    news: c.catNews, sports: c.catSports, science: c.catScience,
    editorial: c.catEditorial, culture: c.catCulture, events: c.catEvents, achievements: c.catAchievements,
  };
  const catColors: Record<string, { bg: string; text: string }> = {
    news: { bg: "bg-blue-100", text: "text-blue-700" },
    sports: { bg: "bg-green-100", text: "text-green-700" },
    science: { bg: "bg-purple-100", text: "text-purple-700" },
    editorial: { bg: "bg-amber-100", text: "text-amber-700" },
    culture: { bg: "bg-pink-100", text: "text-pink-700" },
    events: { bg: "bg-cyan-100", text: "text-cyan-700" },
    achievements: { bg: "bg-orange-100", text: "text-orange-700" },
  };

  const filtered = filterCat === "all" ? mockArticles : mockArticles.filter(a => a.category === filterCat);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{c.journalTitle}</h2>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <Plus size={16} /> {c.createArticle}
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilterCat("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition
            ${filterCat === "all" ? "bg-[#013486] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          {c.all}
        </button>
        {Object.entries(catLabels).map(([k, v]) => (
          <button key={k} onClick={() => setFilterCat(k)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition
              ${filterCat === k ? "bg-[#013486] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {v}
          </button>
        ))}
      </div>

      {/* Featured article */}
      {filtered.some(a => a.featured) && (
        <div className="bg-gradient-to-r from-[#013486] to-[#0148c2] rounded-xl p-6 text-white">
          <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">{c.featuredArticle}</span>
          <h3 className="text-lg font-bold mt-3">{filtered.find(a => a.featured)?.title}</h3>
          <p className="text-sm text-white/80 mt-2">
            Article principal du journal scolaire avec les derni&egrave;res nouvelles et &eacute;v&eacute;nements importants de l&apos;&eacute;tablissement.
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
            <span>{filtered.find(a => a.featured)?.author}</span>
            <span>{filtered.find(a => a.featured)?.date}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {filtered.find(a => a.featured)?.views}</span>
          </div>
        </div>
      )}

      {/* Articles grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.filter(a => !a.featured).map(article => (
          <div key={article.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Newspaper size={32} className="text-gray-300" />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge label={catLabels[article.category] || article.category} color={catColors[article.category] || catColors.news} />
                <Badge label={article.status === "published" ? c.published : c.draft}
                  color={STATUS_COLORS[article.status] || STATUS_COLORS.draft} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{article.title}</h3>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                <span>{article.author} &bull; {article.date}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {article.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create article modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{c.createArticle}</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{c.articleTitle}</label>
                <input className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.articleContent}</label>
                <textarea rows={5} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.articleCategory}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    {Object.entries(catLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.articleImage}</label>
                  <input type="file" className="w-full mt-1 text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#013486]/10 file:text-[#013486]" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{c.cancel}</button>
              <button onClick={() => { setCreateOpen(false); showToast(c.publishArticle); }}
                className="px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">{c.publishArticle}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ TAB 8: AUTOMATION ═══════════════════════ */
function AutomationTab({ c, showToast }: { c: CP; showToast: (m: string) => void }) {
  const [createOpen, setCreateOpen] = useState(false);

  const triggerLabels: Record<string, string> = {
    absence: c.triggerAbsence, latePayment: c.triggerLatePayment,
    gradePublished: c.triggerGradePublished, examScheduled: c.triggerExamScheduled,
    newEnrollment: c.triggerNewEnrollment, birthday: c.triggerBirthday, eventCreated: c.triggerEventCreated,
  };
  const actionLabels: Record<string, string> = {
    sendEmail: c.actionSendEmail, sendSms: c.actionSendSms,
    sendWhatsapp: c.actionSendWhatsapp, sendPush: c.actionSendPush,
  };

  const actionIcons: Record<string, React.ReactNode> = {
    sendEmail: <Mail size={14} />,
    sendSms: <Smartphone size={14} />,
    sendWhatsapp: <Phone size={14} />,
    sendPush: <Bell size={14} />,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{c.automationTitle}</h2>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <Plus size={16} /> {c.createRule}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={c.ruleActive} value={mockRules.filter(r => r.active).length}
          icon={<Zap size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard label={c.executionsToday} value="28"
          icon={<TrendingUp size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.successRate} value="94%"
          icon={<CheckCircle size={20} className="text-amber-600" />} color="bg-amber-100" />
      </div>

      {/* Rules */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3">{c.ruleName}</th>
              <th className="text-left px-4 py-3">{c.ruleTrigger}</th>
              <th className="text-left px-4 py-3">{c.ruleAction}</th>
              <th className="text-left px-4 py-3">{c.ruleStatus}</th>
              <th className="text-left px-4 py-3">{c.successRate}</th>
              <th className="text-left px-4 py-3">{c.lastExecution}</th>
              <th className="text-left px-4 py-3">{c.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockRules.map(rule => (
              <tr key={rule.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className={rule.active ? "text-green-500" : "text-gray-300"} />
                    <span className="font-medium text-gray-900">{rule.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge label={triggerLabels[rule.trigger] || rule.trigger} color={{ bg: "bg-blue-100", text: "text-blue-700" }} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {actionIcons[rule.action]}
                    <span className="text-gray-600">{actionLabels[rule.action] || rule.action}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge label={rule.active ? c.ruleActive : c.ruleInactive}
                    color={rule.active ? STATUS_COLORS.active : STATUS_COLORS.inactive} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${rule.successRate}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{rule.successRate}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{rule.lastRun}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => showToast(rule.active ? c.ruleInactive : c.ruleActive)}
                      className="p-1.5 rounded-lg hover:bg-gray-100">
                      {rule.active
                        ? <ToggleRight size={16} className="text-green-500" />
                        : <ToggleLeft size={16} className="text-gray-400" />}
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <Settings size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Execution log */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{c.executionLog}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { day: "Lun", success: 12, fail: 1 },
            { day: "Mar", success: 15, fail: 0 },
            { day: "Mer", success: 8, fail: 2 },
            { day: "Jeu", success: 18, fail: 1 },
            { day: "Ven", success: 20, fail: 0 },
            { day: "Sam", success: 5, fail: 0 },
            { day: "Dim", success: 2, fail: 0 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="success" fill="#10B981" name={c.successRate} radius={[4, 4, 0, 0]} />
            <Bar dataKey="fail" fill="#EF4444" name={c.failed} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Create rule modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{c.createRule}</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">{c.ruleName}</label>
                <input className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">{c.ruleDescription}</label>
                <textarea rows={2} className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.ruleTrigger}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    {Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">{c.ruleAction}</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30">
                    {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">{c.cancel}</button>
              <button onClick={() => { setCreateOpen(false); showToast(c.createRule); }}
                className="px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">{c.createRule}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
