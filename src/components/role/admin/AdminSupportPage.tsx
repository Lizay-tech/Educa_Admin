"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  Ticket, MessageSquare, BookOpen, TrendingUp, Plus, Search,
  X, Eye, ChevronLeft, ChevronRight, Send, Phone, Video,
  CheckCircle, Clock, AlertTriangle, Filter, Download,
  Headset, Bot, HelpCircle, FileText, Star, ThumbsUp,
  ThumbsDown, Paperclip, Image, Monitor, PhoneCall, Users,
  XCircle, Upload,
} from "lucide-react";

/* ─── type alias ─── */
type SP = ReturnType<typeof useTranslation>["t"]["supportPage"];

/* ─── palette ─── */
const PIE_COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];
const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  urgent: { bg: "bg-red-50", text: "text-red-600" },
  high: { bg: "bg-orange-50", text: "text-orange-600" },
  normal: { bg: "bg-blue-50", text: "text-blue-600" },
  low: { bg: "bg-green-50", text: "text-green-600" },
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: "bg-red-50", text: "text-red-600" },
  inProgress: { bg: "bg-yellow-50", text: "text-yellow-600" },
  waiting: { bg: "bg-purple-50", text: "text-purple-600" },
  resolved: { bg: "bg-green-50", text: "text-green-600" },
  closed: { bg: "bg-gray-100", text: "text-gray-500" },
};

/* ─── types ─── */
type ViewMode = "dashboard" | "tickets" | "chat" | "knowledge" | "stats";
type TicketPriority = "urgent" | "high" | "normal" | "low";
type TicketStatus = "open" | "inProgress" | "waiting" | "resolved" | "closed";
type TicketCategory = "technical" | "payment" | "schoolManagement" | "accountAccess" | "mobileApp" | "printing" | "network";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  createdByRole: string;
  school: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  messages: { from: string; text: string; date: string; isAgent: boolean }[];
}

interface KBArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  views: number;
  helpful: number;
  date: string;
  type: "tutorial" | "video" | "faq" | "procedure";
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "agent" | "bot";
  time: string;
}

/* ─── mock data ─── */
const AGENTS = ["Jean-Marc Dupont", "Marie Solange", "Franck Pierre", "Natacha Louis"];
const SCHOOLS = ["Collège Saint-Louis", "Lycée Toussaint", "École Nationale", "Institution Mixte", "Académie du Savoir"];

function generateTickets(): SupportTicket[] {
  const tickets: SupportTicket[] = [];
  const subjects = [
    "Impossible de se connecter", "Erreur d'impression bulletin", "Paiement non enregistré",
    "Problème affichage emploi du temps", "Accès refusé module notes", "Application mobile crash",
    "Réseau Wi-Fi école instable", "Comment créer une classe ?", "Mot de passe oublié",
    "Synchronisation données échouée", "Notification non reçue", "Export PDF échoue",
    "Inscription élève bloquée", "Certificat non généré", "Erreur calcul moyennes",
    "Double inscription détectée", "Module discipline inaccessible", "Impression en lot échoue",
    "Problème scanner documents", "Mise à jour bloquée",
  ];
  const categories: TicketCategory[] = ["technical", "payment", "schoolManagement", "accountAccess", "mobileApp", "printing", "network"];
  const priorities: TicketPriority[] = ["urgent", "high", "normal", "low"];
  const statuses: TicketStatus[] = ["open", "inProgress", "waiting", "resolved", "closed"];
  const users = ["Admin École A", "Prof. Laurent", "Parent Dupont", "Secrétaire B", "Dir. Casimir"];
  const roles = ["admin", "teacher", "parent", "staff", "admin"];

  for (let i = 0; i < 20; i++) {
    tickets.push({
      id: `TKT-${String(i + 1).padStart(4, "0")}`,
      subject: subjects[i],
      description: `Description détaillée du problème : ${subjects[i]}. L'utilisateur signale ce problème depuis le ${5 + (i % 20)} janvier.`,
      category: categories[i % categories.length],
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      createdBy: users[i % users.length],
      createdByRole: roles[i % roles.length],
      school: SCHOOLS[i % SCHOOLS.length],
      assignedTo: AGENTS[i % AGENTS.length],
      createdAt: `2025-01-${String(5 + (i % 25)).padStart(2, "0")} ${8 + (i % 10)}:${String((i * 7) % 60).padStart(2, "0")}`,
      updatedAt: `2025-01-${String(6 + (i % 24)).padStart(2, "0")} ${9 + (i % 8)}:${String((i * 11) % 60).padStart(2, "0")}`,
      messages: [
        { from: users[i % users.length], text: `Bonjour, ${subjects[i].toLowerCase()}. Merci de m'aider.`, date: `2025-01-${String(5 + (i % 25)).padStart(2, "0")}`, isAgent: false },
        ...(i % 2 === 0 ? [{ from: AGENTS[i % AGENTS.length], text: "Bonjour, nous prenons en charge votre demande. Pouvez-vous fournir plus de détails ?", date: `2025-01-${String(6 + (i % 24)).padStart(2, "0")}`, isAgent: true }] : []),
      ],
    });
  }
  return tickets;
}

function generateArticles(): KBArticle[] {
  return [
    { id: "KB-001", title: "Comment inscrire un nouvel élève", category: "tutorial", content: "Guide complet pour l'inscription d'un nouvel élève dans le système EDUCA...", views: 1245, helpful: 89, date: "2024-10-15", type: "tutorial" },
    { id: "KB-002", title: "Imprimer un bulletin scolaire", category: "tutorial", content: "Étapes pour générer et imprimer un bulletin scolaire depuis le module Examens...", views: 987, helpful: 72, date: "2024-10-20", type: "tutorial" },
    { id: "KB-003", title: "Récupérer un mot de passe", category: "faq", content: "Procédure de récupération de mot de passe pour tous les types d'utilisateurs...", views: 2340, helpful: 156, date: "2024-09-05", type: "faq" },
    { id: "KB-004", title: "Créer et gérer les classes", category: "tutorial", content: "Comment créer, modifier et organiser les classes dans EDUCA...", views: 856, helpful: 63, date: "2024-11-01", type: "tutorial" },
    { id: "KB-005", title: "Configuration de l'imprimante", category: "procedure", content: "Guide de configuration pour scanner et imprimer avec EDUCA...", views: 654, helpful: 45, date: "2024-11-10", type: "procedure" },
    { id: "KB-006", title: "Utilisation du module Notes", category: "video", content: "Vidéo explicative complète du module Examens & Notes...", views: 1567, helpful: 120, date: "2024-10-25", type: "video" },
    { id: "KB-007", title: "FAQ - Gestion des paiements", category: "faq", content: "Réponses aux questions fréquentes sur les paiements et facturations...", views: 432, helpful: 38, date: "2024-12-01", type: "faq" },
    { id: "KB-008", title: "Guide du module Discipline", category: "tutorial", content: "Comment utiliser le module de gestion disciplinaire...", views: 789, helpful: 56, date: "2024-12-15", type: "tutorial" },
  ];
}

/* ─── Component ─── */
export default function AdminSupportPage() {
  const { t } = useTranslation();
  const sp: SP = t.supportPage;

  /* state */
  const [view, setView] = useState<ViewMode>("dashboard");
  const [tickets] = useState<SupportTicket[]>(generateTickets);
  const [articles] = useState<KBArticle[]>(generateArticles);

  /* filters */
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  /* modals */
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [drawerTicket, setDrawerTicket] = useState<SupportTicket | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* chat state */
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", text: "Bonjour ! Comment puis-je vous aider ?", sender: "agent", time: "09:00" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { id: String(Date.now()), text: chatInput, sender: "user", time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      const botMsg: ChatMessage = { id: String(Date.now() + 1), text: "Merci pour votre message. Un agent va vous répondre sous peu.", sender: "agent", time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
      setChatMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  /* ─── helpers ─── */
  const catLabel = (c: TicketCategory): string => {
    const map: Record<TicketCategory, string> = { technical: sp.catTechnical, payment: sp.catPayment, schoolManagement: sp.catSchoolManagement, accountAccess: sp.catAccountAccess, mobileApp: sp.catMobileApp, printing: sp.catPrinting, network: sp.catNetwork };
    return map[c];
  };
  const priorityLabel = (p: TicketPriority): string => {
    const map: Record<TicketPriority, string> = { urgent: sp.urgent, high: sp.high, normal: sp.normal, low: sp.low };
    return map[p];
  };
  const statusLabel = (s: TicketStatus): string => {
    const map: Record<TicketStatus, string> = { open: sp.statusOpen, inProgress: sp.statusInProgress, waiting: sp.statusWaiting, resolved: sp.statusResolved, closed: sp.statusClosed };
    return map[s];
  };
  const articleTypeIcon = (type: KBArticle["type"]) => {
    return type === "tutorial" ? <BookOpen className="w-4 h-4" /> : type === "video" ? <Video className="w-4 h-4" /> : type === "faq" ? <HelpCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  };

  /* ─── dashboard data ─── */
  const dashStats = useMemo(() => {
    return {
      open: tickets.filter(t => t.status === "open").length,
      inProgress: tickets.filter(t => t.status === "inProgress").length,
      resolvedToday: tickets.filter(t => t.status === "resolved").length,
      avgTime: "4.2",
      satisfaction: 94,
      total: tickets.length,
    };
  }, [tickets]);

  /* chart: by category */
  const chartByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: catLabel(k as TicketCategory), value: v }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, sp]);

  /* chart: by priority */
  const chartByPriority = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => { counts[t.priority] = (counts[t.priority] || 0) + 1; });
    return (["urgent", "high", "normal", "low"] as TicketPriority[]).map(p => ({ name: priorityLabel(p), value: counts[p] || 0 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, sp]);

  /* chart: monthly trend */
  const chartMonthly = useMemo(() => {
    const months = ["Sep", "Oct", "Nov", "Dec", "Jan"];
    return months.map((m, i) => ({ name: m, tickets: 8 + i * 3 + (i === 4 ? 5 : 0), resolved: 6 + i * 2 + (i === 3 ? 3 : 0) }));
  }, []);

  /* chart: by status */
  const chartByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: statusLabel(k as TicketStatus), value: v }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, sp]);

  /* ─── filtered tickets ─── */
  const filteredTickets = useMemo(() => {
    let data = tickets;
    if (filterCategory !== "all") data = data.filter(t => t.category === filterCategory);
    if (filterPriority !== "all") data = data.filter(t => t.priority === filterPriority);
    if (filterStatus !== "all") data = data.filter(t => t.status === filterStatus);
    if (searchQ) data = data.filter(t => t.subject.toLowerCase().includes(searchQ.toLowerCase()) || t.createdBy.toLowerCase().includes(searchQ.toLowerCase()));
    return data;
  }, [tickets, filterCategory, filterPriority, filterStatus, searchQ]);

  const totalPages = Math.ceil(filteredTickets.length / perPage);
  const paginatedTickets = filteredTickets.slice((page - 1) * perPage, page * perPage);

  /* ─── tabs ─── */
  const tabs: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: sp.tabDashboard, icon: <TrendingUp className="w-4 h-4" /> },
    { key: "tickets", label: sp.tabTickets, icon: <Ticket className="w-4 h-4" /> },
    { key: "chat", label: sp.tabChat, icon: <MessageSquare className="w-4 h-4" /> },
    { key: "knowledge", label: sp.tabKnowledge, icon: <BookOpen className="w-4 h-4" /> },
    { key: "stats", label: sp.tabStats, icon: <TrendingUp className="w-4 h-4" /> },
  ];

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
            <button key={tab.key} onClick={() => { setView(tab.key); setPage(1); setSearchQ(""); setFilterCategory("all"); setFilterPriority("all"); setFilterStatus("all"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${view === tab.key ? "bg-[#013486] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════ DASHBOARD ════════════════════════ */}
      {view === "dashboard" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: sp.openTickets, value: dashStats.open, color: "bg-red-50 text-red-700", icon: <AlertTriangle className="w-5 h-5" /> },
              { label: sp.inProgressTickets, value: dashStats.inProgress, color: "bg-yellow-50 text-yellow-700", icon: <Clock className="w-5 h-5" /> },
              { label: sp.resolvedToday, value: dashStats.resolvedToday, color: "bg-green-50 text-green-700", icon: <CheckCircle className="w-5 h-5" /> },
              { label: sp.avgResolutionTime, value: `${dashStats.avgTime}h`, color: "bg-blue-50 text-blue-700", icon: <Clock className="w-5 h-5" /> },
              { label: sp.satisfaction, value: `${dashStats.satisfaction}%`, color: "bg-purple-50 text-purple-700", icon: <Star className="w-5 h-5" /> },
              { label: sp.totalTickets, value: dashStats.total, color: "bg-gray-100 text-gray-700", icon: <Ticket className="w-5 h-5" /> },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 ${s.color}`}>
                <div className="flex items-center gap-2 mb-2 opacity-80">{s.icon}<span className="text-xs font-medium">{s.label}</span></div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Support channels */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: sp.liveChat, desc: sp.chatTitle, icon: <MessageSquare className="w-6 h-6" />, color: "bg-blue-50 text-blue-700", action: () => setView("chat") },
              { label: sp.voiceSupport, desc: sp.callSupport, icon: <Phone className="w-6 h-6" />, color: "bg-green-50 text-green-700", action: () => showToast(sp.callInProgress) },
              { label: sp.videoSupport, desc: sp.screenShare, icon: <Video className="w-6 h-6" />, color: "bg-purple-50 text-purple-700", action: () => showToast(sp.startVideo) },
              { label: sp.chatbot, desc: sp.askChatbot, icon: <Bot className="w-6 h-6" />, color: "bg-orange-50 text-orange-700", action: () => setView("chat") },
            ].map((channel, i) => (
              <div key={i} onClick={channel.action} className={`rounded-2xl p-5 ${channel.color} cursor-pointer hover:shadow-md transition-shadow`}>
                <div className="mb-3">{channel.icon}</div>
                <h3 className="font-semibold text-sm">{channel.label}</h3>
                <p className="text-xs opacity-70 mt-1">{channel.desc}</p>
              </div>
            ))}
          </div>

          {/* Recent tickets */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">{sp.ticketsTitle}</h3>
              <button onClick={() => setView("tickets")} className="text-xs text-[#013486] font-medium hover:underline">{sp.viewDetails}</button>
            </div>
            <div className="space-y-3">
              {tickets.slice(0, 5).map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${ticket.priority === "urgent" ? "bg-red-500" : ticket.priority === "high" ? "bg-orange-500" : ticket.priority === "normal" ? "bg-blue-500" : "bg-green-500"}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ticket.subject}</p>
                      <p className="text-xs text-gray-500">{ticket.createdBy} &middot; {ticket.school}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_COLORS[ticket.status]?.bg} ${STATUS_COLORS[ticket.status]?.text}`}>{statusLabel(ticket.status)}</span>
                    <p className="text-xs text-gray-400 mt-1">{ticket.createdAt.split(" ")[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ TICKETS ════════════════════════ */}
      {view === "tickets" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }} placeholder={sp.search} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none" />
              </div>
              <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="all">{sp.filterByCategory}</option>
                {(["technical", "payment", "schoolManagement", "accountAccess", "mobileApp", "printing", "network"] as TicketCategory[]).map(c => <option key={c} value={c}>{catLabel(c)}</option>)}
              </select>
              <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="all">{sp.filterByPriority}</option>
                {(["urgent", "high", "normal", "low"] as TicketPriority[]).map(p => <option key={p} value={p}>{priorityLabel(p)}</option>)}
              </select>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="all">{sp.filterByStatus}</option>
                {(["open", "inProgress", "waiting", "resolved", "closed"] as TicketStatus[]).map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
              <button onClick={() => setShowNewTicket(true)} className="flex items-center gap-2 bg-[#013486] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#012a6d] transition-colors">
                <Plus className="w-4 h-4" />{sp.createTicket}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <th className="text-left px-4 py-3">{sp.ticketId}</th>
                    <th className="text-left px-4 py-3">{sp.subject}</th>
                    <th className="text-left px-4 py-3">{sp.category}</th>
                    <th className="text-left px-4 py-3">{sp.priority}</th>
                    <th className="text-left px-4 py-3">{sp.status}</th>
                    <th className="text-left px-4 py-3">{sp.school}</th>
                    <th className="text-left px-4 py-3">{sp.assignedTo}</th>
                    <th className="text-left px-4 py-3">{sp.date}</th>
                    <th className="text-left px-4 py-3">{sp.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTickets.map(ticket => (
                    <tr key={ticket.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{ticket.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{ticket.subject}</p>
                        <p className="text-xs text-gray-500">{ticket.createdBy}</p>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">{catLabel(ticket.category)}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${PRIORITY_COLORS[ticket.priority]?.bg} ${PRIORITY_COLORS[ticket.priority]?.text}`}>
                          {priorityLabel(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${STATUS_COLORS[ticket.status]?.bg} ${STATUS_COLORS[ticket.status]?.text}`}>
                          {statusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{ticket.school}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{ticket.assignedTo}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{ticket.createdAt.split(" ")[0]}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDrawerTicket(ticket)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-500" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{sp.showing} {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredTickets.length)} {sp.of} {filteredTickets.length}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-3 py-1.5 text-xs font-medium">{sp.page} {page}/{totalPages || 1}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ CHAT ════════════════════════ */}
      {view === "chat" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat window */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">JS</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{sp.liveChat}</p>
                  <p className="text-xs text-green-500">{sp.online}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => showToast(sp.callInProgress)} className="p-2 hover:bg-gray-100 rounded-lg"><Phone className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => showToast(sp.startVideo)} className="p-2 hover:bg-gray-100 rounded-lg"><Video className="w-4 h-4 text-gray-500" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-lg"><Monitor className="w-4 h-4 text-gray-500" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.sender === "user" ? "bg-[#013486] text-white" : msg.sender === "bot" ? "bg-purple-50 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-white/60" : "text-gray-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg"><Paperclip className="w-4 h-4 text-gray-400" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-lg"><Image className="w-4 h-4 text-gray-400" /></button>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                  placeholder={sp.typeMessage}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] outline-none"
                />
                <button onClick={sendChatMessage} className="bg-[#013486] text-white px-4 py-2 rounded-xl hover:bg-[#012a6d] transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Online agents */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{sp.onlineAgents}</h3>
              <div className="space-y-3">
                {AGENTS.map((agent, i) => (
                  <div key={agent} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${i < 3 ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="text-sm text-gray-800">{agent}</span>
                    </div>
                    <span className={`text-xs ${i < 3 ? "text-green-500" : "text-gray-400"}`}>{i < 3 ? sp.online : sp.offline}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{sp.voiceSupport}</h3>
              <div className="space-y-2">
                <button onClick={() => showToast(sp.callInProgress)} className="w-full flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors">
                  <PhoneCall className="w-4 h-4" /><span className="text-sm font-medium">{sp.callSupport}</span>
                </button>
                <button onClick={() => showToast(sp.startVideo)} className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors">
                  <Video className="w-4 h-4" /><span className="text-sm font-medium">{sp.videoSupport}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                  <Monitor className="w-4 h-4" /><span className="text-sm font-medium">{sp.screenShare}</span>
                </button>
              </div>
            </div>

            {/* Chatbot suggestions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Bot className="w-4 h-4" />{sp.suggestedQuestions}</h3>
              <div className="space-y-2">
                {[sp.howToEnroll, sp.howToPrint, sp.howToResetPwd, sp.howToCreateClass].map((q, i) => (
                  <button key={i} onClick={() => { setChatInput(q); }} className="w-full text-left text-xs text-gray-600 p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ KNOWLEDGE BASE ════════════════════════ */}
      {view === "knowledge" && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-gradient-to-r from-[#013486] to-[#0148c2] rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">{sp.knowledgeBase}</h2>
            <p className="text-sm text-white/70 mb-4">{sp.searchKnowledge}</p>
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={sp.searchKnowledge} className="w-full pl-12 pr-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-white/30 outline-none" />
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: sp.all, value: "all" },
              { label: sp.tutorials, value: "tutorial" },
              { label: sp.videoGuides, value: "video" },
              { label: sp.faq, value: "faq" },
              { label: sp.adminProcedures, value: "procedure" },
            ].map(f => (
              <button key={f.value} onClick={() => setFilterCategory(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterCategory === f.value ? "bg-[#013486] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Articles */}
          <div className="grid md:grid-cols-2 gap-4">
            {articles
              .filter(a => filterCategory === "all" || a.type === filterCategory)
              .filter(a => !searchQ || a.title.toLowerCase().includes(searchQ.toLowerCase()))
              .map(article => (
                <div key={article.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-[#013486]/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${article.type === "tutorial" ? "bg-blue-50 text-blue-600" : article.type === "video" ? "bg-red-50 text-red-600" : article.type === "faq" ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600"}`}>
                        {articleTypeIcon(article.type)}
                      </div>
                      <span className="text-xs text-gray-400">{article.id}</span>
                    </div>
                    <span className="text-xs text-gray-400">{article.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{article.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{article.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.views} {sp.views}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" />{article.helpful}</span>
                    </div>
                    <button className="text-xs text-[#013486] font-medium hover:underline">{sp.viewArticle}</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ════════════════════════ STATS ════════════════════════ */}
      {view === "stats" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{sp.statsTitle}</h2>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Monthly trend */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{sp.monthlyTrend}</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartMonthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="tickets" stroke="#EF4444" name={sp.totalTickets} strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke="#10B981" name={sp.statusResolved} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* By category */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{sp.ticketsByCategory}</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartByCategory}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#013486" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* By priority */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{sp.ticketsByPriority}</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={chartByPriority} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {chartByPriority.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* By status */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{sp.ticketsByStatus}</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={chartByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {chartByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Performance metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold text-[#013486]">4.2h</p>
              <p className="text-xs text-gray-500 mt-1">{sp.avgResolution}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold text-green-600">94%</p>
              <p className="text-xs text-gray-500 mt-1">{sp.resolutionRate}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold text-purple-600">4.8/5</p>
              <p className="text-xs text-gray-500 mt-1">{sp.supportQuality}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold text-orange-600">5</p>
              <p className="text-xs text-gray-500 mt-1">{sp.commonProblems}</p>
            </div>
          </div>

          {/* Common problems */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{sp.commonProblems}</h3>
            <div className="space-y-3">
              {[
                { name: "Connexion impossible", count: 45, pct: 22 },
                { name: "Erreur impression", count: 32, pct: 16 },
                { name: "Problème paiement", count: 28, pct: 14 },
                { name: "Accès refusé", count: 24, pct: 12 },
                { name: "Application mobile", count: 18, pct: 9 },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-gray-500 w-6">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{p.name}</span>
                      <span className="text-xs text-gray-500">{p.count} tickets ({p.pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#013486] h-1.5 rounded-full" style={{ width: `${p.pct * 3}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ NEW TICKET MODAL ════════════════════════ */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setShowNewTicket(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{sp.createTicket}</h2>
              <button onClick={() => setShowNewTicket(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{sp.subject}</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{sp.category}</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {(["technical", "payment", "schoolManagement", "accountAccess", "mobileApp", "printing", "network"] as TicketCategory[]).map(c => <option key={c} value={c}>{catLabel(c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{sp.priority}</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {(["urgent", "high", "normal", "low"] as TicketPriority[]).map(p => <option key={p} value={p}>{priorityLabel(p)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{sp.description}</label>
                <textarea rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{sp.attachment}</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{sp.screenshot} / {sp.attachment}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowNewTicket(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">{sp.cancel}</button>
                <button onClick={() => { setShowNewTicket(false); showToast(sp.ticketCreated); }} className="flex-1 bg-[#013486] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#012a6d]">{sp.createTicket}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ TICKET DRAWER ════════════════════════ */}
      {drawerTicket && (
        <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={() => setDrawerTicket(null)}>
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{drawerTicket.id}</h2>
                <p className="text-xs text-gray-500">{drawerTicket.subject}</p>
              </div>
              <button onClick={() => setDrawerTicket(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500">{sp.category}</p><span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">{catLabel(drawerTicket.category)}</span></div>
                <div><p className="text-xs text-gray-500">{sp.priority}</p><span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${PRIORITY_COLORS[drawerTicket.priority]?.bg} ${PRIORITY_COLORS[drawerTicket.priority]?.text}`}>{priorityLabel(drawerTicket.priority)}</span></div>
                <div><p className="text-xs text-gray-500">{sp.status}</p><span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STATUS_COLORS[drawerTicket.status]?.bg} ${STATUS_COLORS[drawerTicket.status]?.text}`}>{statusLabel(drawerTicket.status)}</span></div>
                <div><p className="text-xs text-gray-500">{sp.assignedTo}</p><p className="text-sm font-medium text-gray-800">{drawerTicket.assignedTo}</p></div>
                <div><p className="text-xs text-gray-500">{sp.school}</p><p className="text-sm font-medium text-gray-800">{drawerTicket.school}</p></div>
                <div><p className="text-xs text-gray-500">{sp.createdAt}</p><p className="text-sm text-gray-800">{drawerTicket.createdAt}</p></div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-500 mb-1">{sp.description}</p>
                <p className="text-sm text-gray-800">{drawerTicket.description}</p>
              </div>

              {/* Conversation */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{sp.conversationHistory}</h3>
                <div className="space-y-3">
                  {drawerTicket.messages.map((msg, i) => (
                    <div key={i} className={`p-3 rounded-xl ${msg.isAgent ? "bg-blue-50" : "bg-gray-50"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold ${msg.isAgent ? "text-blue-700" : "text-gray-700"}`}>{msg.from}</span>
                        <span className="text-xs text-gray-400">{msg.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply */}
              <div>
                <textarea rows={3} placeholder={sp.respond + "..."} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none mb-3" />
                <div className="flex gap-2">
                  <button onClick={() => showToast(sp.responseSent)} className="flex-1 bg-[#013486] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#012a6d] flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />{sp.respond}
                  </button>
                  <button onClick={() => { setDrawerTicket(null); showToast(sp.ticketClosed); }} className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                    {sp.closeTicket}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                <button className="flex items-center justify-center gap-2 text-xs bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200"><Users className="w-3.5 h-3.5" />{sp.assignAgent}</button>
                <button className="flex items-center justify-center gap-2 text-xs bg-gray-100 text-gray-700 py-2 rounded-xl hover:bg-gray-200"><Filter className="w-3.5 h-3.5" />{sp.changeStatus}</button>
                <button className="flex items-center justify-center gap-2 text-xs bg-orange-50 text-orange-700 py-2 rounded-xl hover:bg-orange-100"><AlertTriangle className="w-3.5 h-3.5" />{sp.escalate}</button>
                <button onClick={() => { setDrawerTicket(null); showToast(sp.ticketUpdated); }} className="flex items-center justify-center gap-2 text-xs bg-green-50 text-green-700 py-2 rounded-xl hover:bg-green-100"><CheckCircle className="w-3.5 h-3.5" />{sp.statusResolved}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
