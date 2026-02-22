"use client";

import PageHeader from "@/components/shared/PageHeader";
import {
  ClipboardCheck,
  Search,
  Filter,
  Plus,
  Calendar,
  BookOpen,
  Users,
  Edit2,
  Trash2,
  Eye,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  FileText,
  X,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { useState } from "react";

interface Evaluation {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  class: string;
  type: "Devoir" | "Examen" | "Interro" | "Projet" | "TP" | "Participation" | "Contrôle";
  date: string;
  maxScore: number;
  coefficient: number;
  period: "Trimestre 1" | "Trimestre 2" | "Trimestre 3" | "Semestre 1" | "Semestre 2";
  description: string;
  status: "draft" | "published" | "graded" | "completed";
  studentsGraded: number;
  totalStudents: number;
  averageScore?: number;
  createdAt: string;
  attachments?: string[];
}

interface EvaluationForm {
  title: string;
  subject: string;
  class: string;
  type: string;
  date: string;
  maxScore: string;
  coefficient: string;
  period: string;
  description: string;
}

export default function TeacherEvaluationsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  const [evaluationForm, setEvaluationForm] = useState<EvaluationForm>({
    title: "",
    subject: "",
    class: "",
    type: "",
    date: "",
    maxScore: "100",
    coefficient: "1",
    period: "",
    description: "",
  });

  // Mock evaluations data
  const [evaluations, setEvaluations] = useState<Evaluation[]>([
    {
      id: "1",
      title: "Équations du second degré",
      subject: "Mathématiques",
      subjectColor: "#013486",
      class: "NS3",
      type: "Examen",
      date: "2024-02-25",
      maxScore: 100,
      coefficient: 3,
      period: "Trimestre 2",
      description: "Examen couvrant les équations, les systèmes et les fonctions",
      status: "graded",
      studentsGraded: 32,
      totalStudents: 32,
      averageScore: 76,
      createdAt: "2024-02-10T10:00:00",
      attachments: ["sujet_math_ns3.pdf"],
    },
    {
      id: "2",
      title: "La conjugaison au passé simple",
      subject: "Français",
      subjectColor: "#F35403",
      class: "NS2",
      type: "Devoir",
      date: "2024-02-28",
      maxScore: 20,
      coefficient: 1,
      period: "Trimestre 2",
      description: "Exercices de conjugaison et dictée",
      status: "published",
      studentsGraded: 18,
      totalStudents: 30,
      createdAt: "2024-02-15T14:30:00",
    },
    {
      id: "3",
      title: "La photosynthèse",
      subject: "SVT",
      subjectColor: "#43a047",
      class: "NS3",
      type: "Contrôle",
      date: "2024-03-05",
      maxScore: 50,
      coefficient: 2,
      period: "Trimestre 2",
      description: "Contrôle sur le processus de photosynthèse et la respiration cellulaire",
      status: "draft",
      studentsGraded: 0,
      totalStudents: 28,
      createdAt: "2024-02-18T09:15:00",
    },
    {
      id: "4",
      title: "La révolution haïtienne",
      subject: "Histoire-Géo",
      subjectColor: "#d32f2f",
      class: "NS1",
      type: "Projet",
      date: "2024-03-10",
      maxScore: 100,
      coefficient: 2,
      period: "Trimestre 2",
      description: "Projet de recherche sur les causes et conséquences de la révolution",
      status: "published",
      studentsGraded: 5,
      totalStudents: 25,
      createdAt: "2024-02-05T11:20:00",
    },
  ]);

  // Filtrer les évaluations
  const filteredEvaluations = evaluations.filter((evaluation) => {
    const matchesSearch =
      evaluation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || evaluation.subject === selectedSubject;
    const matchesClass = selectedClass === "all" || evaluation.class === selectedClass;
    const matchesType = selectedType === "all" || evaluation.type === selectedType;
    const matchesStatus = selectedStatus === "all" || evaluation.status === selectedStatus;
    return matchesSearch && matchesSubject && matchesClass && matchesType && matchesStatus;
  });

  // Stats globales
  const totalEvaluations = evaluations.length;
  const publishedEvaluations = evaluations.filter((e) => e.status === "published" || e.status === "graded" || e.status === "completed").length;
  const pendingGrading = evaluations.reduce((acc, e) => acc + (e.totalStudents - e.studentsGraded), 0);
  const completedEvaluations = evaluations.filter((e) => e.status === "completed" || (e.status === "graded" && e.studentsGraded === e.totalStudents)).length;

  // Ouvrir le modal de création
  const openCreateModal = () => {
    setShowCreateModal(true);
    setEvaluationForm({
      title: "",
      subject: "",
      class: "",
      type: "",
      date: "",
      maxScore: "100",
      coefficient: "1",
      period: "",
      description: "",
    });
  };

  // Créer une évaluation
  const handleCreateEvaluation = (saveAsDraft: boolean) => {
    const subjectColors: { [key: string]: string } = {
      "Mathématiques": "#013486",
      "Français": "#F35403",
      "SVT": "#43a047",
      "Histoire-Géo": "#d32f2f",
      "Anglais": "#1e88e5",
      "Physique": "#5e35b1",
      "Chimie": "#e53935",
    };

    const newEvaluation: Evaluation = {
      id: Date.now().toString(),
      title: evaluationForm.title,
      subject: evaluationForm.subject,
      subjectColor: subjectColors[evaluationForm.subject] || "#013486",
      class: evaluationForm.class,
      type: evaluationForm.type as Evaluation["type"],
      date: evaluationForm.date,
      maxScore: parseFloat(evaluationForm.maxScore),
      coefficient: parseFloat(evaluationForm.coefficient),
      period: evaluationForm.period as Evaluation["period"],
      description: evaluationForm.description,
      status: saveAsDraft ? "draft" : "published",
      studentsGraded: 0,
      totalStudents: evaluationForm.class === "NS3" ? 32 : evaluationForm.class === "NS2" ? 30 : 28,
      createdAt: new Date().toISOString(),
    };

    setEvaluations([newEvaluation, ...evaluations]);
    setShowCreateModal(false);
  };

  // Voir les détails d'une évaluation
  const viewDetails = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowDetailsModal(true);
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: Evaluation["status"], studentsGraded: number, totalStudents: number) => {
    if (status === "draft") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          <Clock size={12} />
          Brouillon
        </span>
      );
    }
    if (status === "published" && studentsGraded === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          <FileText size={12} />
          Publiée
        </span>
      );
    }
    if (studentsGraded > 0 && studentsGraded < totalStudents) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          <AlertCircle size={12} />
          En cours
        </span>
      );
    }
    if (studentsGraded === totalStudents) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle2 size={12} />
          Terminée
        </span>
      );
    }
    return null;
  };

  // Obtenir le badge de type
  const getTypeBadge = (type: string) => {
    const typeColors: { [key: string]: string } = {
      Devoir: "bg-purple-100 text-purple-700",
      Examen: "bg-red-100 text-red-700",
      Interro: "bg-yellow-100 text-yellow-700",
      Projet: "bg-green-100 text-green-700",
      TP: "bg-blue-100 text-blue-700",
      Participation: "bg-pink-100 text-pink-700",
      Contrôle: "bg-orange-100 text-orange-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[type] || "bg-gray-100 text-gray-700"}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Évaluations"
        description="Créez et gérez vos évaluations, devoirs et examens"
        icon={<ClipboardCheck size={20} />}
      />

      {/* Stats globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#013486]/10 flex items-center justify-center">
              <ClipboardCheck size={20} className="text-[#013486]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalEvaluations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1e88e5]/10 flex items-center justify-center">
              <FileText size={20} className="text-[#1e88e5]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Publiées</p>
              <p className="text-2xl font-bold text-gray-900">{publishedEvaluations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F35403]/10 flex items-center justify-center">
              <AlertCircle size={20} className="text-[#F35403]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">À corriger</p>
              <p className="text-2xl font-bold text-gray-900">{pendingGrading}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#43a047]/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-[#43a047]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">{completedEvaluations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          {/* Recherche */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une évaluation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
            >
              <option value="all">Toutes matières</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Français">Français</option>
              <option value="SVT">SVT</option>
              <option value="Histoire-Géo">Histoire-Géo</option>
              <option value="Anglais">Anglais</option>
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
            >
              <option value="all">Toutes classes</option>
              <option value="NS3">NS3</option>
              <option value="NS2">NS2</option>
              <option value="NS1">NS1</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
            >
              <option value="all">Tous types</option>
              <option value="Devoir">Devoir</option>
              <option value="Examen">Examen</option>
              <option value="Interro">Interro</option>
              <option value="Projet">Projet</option>
              <option value="Contrôle">Contrôle</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
            >
              <option value="all">Tous statuts</option>
              <option value="draft">Brouillon</option>
              <option value="published">Publiée</option>
              <option value="graded">En cours</option>
              <option value="completed">Terminée</option>
            </select>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#013486] text-white rounded-lg text-sm font-semibold hover:bg-[#0148c2] transition"
            >
              <Plus size={16} />
              Créer
            </button>
          </div>
        </div>
      </div>

      {/* Liste des évaluations */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Évaluation
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Matière
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Progression
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvaluations.map((evaluation) => (
                <tr
                  key={evaluation.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => viewDetails(evaluation)}
                >
                  {/* Évaluation */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: evaluation.subjectColor }}
                      >
                        {evaluation.class}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{evaluation.title}</p>
                        <p className="text-xs text-gray-500">
                          Sur {evaluation.maxScore} • Coeff. {evaluation.coefficient}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Matière */}
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: evaluation.subjectColor }}
                    >
                      {evaluation.subject}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">{getTypeBadge(evaluation.type)}</td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(evaluation.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </td>

                  {/* Progression */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {evaluation.studentsGraded}/{evaluation.totalStudents}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {Math.round((evaluation.studentsGraded / evaluation.totalStudents) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#013486] rounded-full transition-all"
                          style={{
                            width: `${(evaluation.studentsGraded / evaluation.totalStudents) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-6 py-4">
                    {getStatusBadge(evaluation.status, evaluation.studentsGraded, evaluation.totalStudents)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => viewDetails(evaluation)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition"
                        title="Voir détails"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-green-50 rounded-lg transition" title="Corriger">
                        <Edit2 size={16} className="text-green-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création d'évaluation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Créer une évaluation</h2>
                <p className="text-sm text-gray-500">
                  Définissez les paramètres de votre évaluation
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Titre de l'évaluation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={evaluationForm.title}
                  onChange={(e) =>
                    setEvaluationForm({ ...evaluationForm, title: e.target.value })
                  }
                  placeholder="Ex: Équations du second degré"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                />
              </div>

              {/* Matière et Classe */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Matière <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={evaluationForm.subject}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, subject: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Français">Français</option>
                    <option value="SVT">SVT</option>
                    <option value="Histoire-Géo">Histoire-Géo</option>
                    <option value="Anglais">Anglais</option>
                    <option value="Physique">Physique</option>
                    <option value="Chimie">Chimie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Classe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={evaluationForm.class}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, class: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                  >
                    <option value="">Sélectionner</option>
                    <option value="NS3">NS3</option>
                    <option value="NS2">NS2</option>
                    <option value="NS1">NS1</option>
                  </select>
                </div>
              </div>

              {/* Type et Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Type d'évaluation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={evaluationForm.type}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Devoir">Devoir</option>
                    <option value="Examen">Examen</option>
                    <option value="Interro">Interro rapide</option>
                    <option value="Projet">Projet</option>
                    <option value="TP">Travaux pratiques</option>
                    <option value="Participation">Participation</option>
                    <option value="Contrôle">Contrôle continu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={evaluationForm.date}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                  />
                </div>
              </div>

              {/* Note max, Coefficient, Période */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Note max <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={evaluationForm.maxScore}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, maxScore: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Coefficient <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={evaluationForm.coefficient}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, coefficient: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Période <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={evaluationForm.period}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, period: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                  >
                    <option value="">Sélect.</option>
                    <option value="Trimestre 1">Trim. 1</option>
                    <option value="Trimestre 2">Trim. 2</option>
                    <option value="Trimestre 3">Trim. 3</option>
                    <option value="Semestre 1">Sem. 1</option>
                    <option value="Semestre 2">Sem. 2</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description / Consignes
                </label>
                <textarea
                  value={evaluationForm.description}
                  onChange={(e) =>
                    setEvaluationForm({ ...evaluationForm, description: e.target.value })
                  }
                  placeholder="Décrivez les sujets couverts, consignes spéciales..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCreateEvaluation(true)}
                  disabled={
                    !evaluationForm.title ||
                    !evaluationForm.subject ||
                    !evaluationForm.class ||
                    !evaluationForm.type ||
                    !evaluationForm.date ||
                    !evaluationForm.period
                  }
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#013486] bg-white border-2 border-[#013486] rounded-lg hover:bg-[#013486]/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Clock size={16} />
                  Brouillon
                </button>
                <button
                  onClick={() => handleCreateEvaluation(false)}
                  disabled={
                    !evaluationForm.title ||
                    !evaluationForm.subject ||
                    !evaluationForm.class ||
                    !evaluationForm.type ||
                    !evaluationForm.date ||
                    !evaluationForm.period
                  }
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#013486] rounded-lg hover:bg-[#0148c2] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={16} />
                  Publier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails d'évaluation */}
      {showDetailsModal && selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedEvaluation.title}</h2>
                <p className="text-sm text-gray-500">
                  {selectedEvaluation.subject} • {selectedEvaluation.class}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="font-semibold text-gray-900">{selectedEvaluation.type}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedEvaluation.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Note maximale</p>
                  <p className="font-semibold text-gray-900">{selectedEvaluation.maxScore}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Coefficient</p>
                  <p className="font-semibold text-gray-900">{selectedEvaluation.coefficient}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Période</p>
                  <p className="font-semibold text-gray-900">{selectedEvaluation.period}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Statut</p>
                  {getStatusBadge(
                    selectedEvaluation.status,
                    selectedEvaluation.studentsGraded,
                    selectedEvaluation.totalStudents
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedEvaluation.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                    {selectedEvaluation.description}
                  </p>
                </div>
              )}

              {/* Progression */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Progression</h3>
                <div className="p-4 bg-gradient-to-r from-[#013486]/5 to-transparent rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Notes saisies</span>
                    <span className="text-lg font-bold text-[#013486]">
                      {selectedEvaluation.studentsGraded}/{selectedEvaluation.totalStudents}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#013486] rounded-full transition-all"
                      style={{
                        width: `${(selectedEvaluation.studentsGraded / selectedEvaluation.totalStudents) * 100}%`,
                      }}
                    />
                  </div>
                  {selectedEvaluation.averageScore && (
                    <p className="text-xs text-gray-500 mt-2">
                      Moyenne actuelle: <span className="font-semibold">{selectedEvaluation.averageScore}%</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[#013486] text-white rounded-lg font-semibold hover:bg-[#0148c2] transition">
                  <Edit2 size={16} />
                  Saisir les notes
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                  <BarChart3 size={16} />
                  Statistiques
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {filteredEvaluations.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune évaluation trouvée
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            Essayez de modifier vos critères de recherche ou créez votre première évaluation.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#013486] text-white rounded-lg text-sm font-semibold hover:bg-[#0148c2] transition"
          >
            <Plus size={16} />
            Créer une évaluation
          </button>
        </div>
      )}
    </div>
  );
}
