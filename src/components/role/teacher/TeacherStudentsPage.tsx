"use client";

import PageHeader from "@/components/shared/PageHeader";
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  BarChart3,
  ClipboardCheck,
  X,
  AlertCircle,
  Award,
  Download,
  Save,
  Lock,
  Unlock,
  History,
  Edit2,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { mockTeacherStudents } from "@/lib/mockUser";
import { useState } from "react";

interface AddGradeForm {
  subject: string;
  evaluationType: string;
  grade: string;
  maxGrade: string;
  comment: string;
}

interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  evaluationType: string;
  grade: string;
  maxGrade: string;
  comment: string;
  percentage: number;
  status: "draft" | "validated" | "modification_requested" | "locked";
  createdAt: string;
  createdBy: string;
  validatedAt?: string;
  validatedBy?: string;
  modificationRequestedAt?: string;
  modificationReason?: string;
  modificationApprovedAt?: string;
  modificationApprovedBy?: string;
  history: {
    action: string;
    timestamp: string;
    user: string;
    details?: string;
  }[];
}

export default function TeacherStudentsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState<GradeRecord | null>(null);
  const [modificationReason, setModificationReason] = useState("");
  const [gradeForm, setGradeForm] = useState<AddGradeForm>({
    subject: "",
    evaluationType: "",
    grade: "",
    maxGrade: "100",
    comment: "",
  });

  // Mock grades data (simulated database)
  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>([
    {
      id: "1",
      studentId: "1",
      studentName: "Marie-Claire Joseph",
      subject: "Mathématiques",
      evaluationType: "Examen",
      grade: "85",
      maxGrade: "100",
      comment: "Bon travail, continue ainsi",
      percentage: 85,
      status: "validated",
      createdAt: "2024-02-10T10:30:00",
      createdBy: "Prof. ESAIE GUERSON",
      validatedAt: "2024-02-10T10:35:00",
      validatedBy: "Prof. ESAIE GUERSON",
      history: [
        {
          action: "Création",
          timestamp: "2024-02-10T10:30:00",
          user: "Prof. ESAIE GUERSON",
          details: "Note créée",
        },
        {
          action: "Validation",
          timestamp: "2024-02-10T10:35:00",
          user: "Prof. ESAIE GUERSON",
          details: "Note validée et verrouillée",
        },
      ],
    },
    {
      id: "2",
      studentId: "1",
      studentName: "Marie-Claire Joseph",
      subject: "Français",
      evaluationType: "Devoir",
      grade: "90",
      maxGrade: "100",
      comment: "",
      percentage: 90,
      status: "draft",
      createdAt: "2024-02-15T14:20:00",
      createdBy: "Prof. ESAIE GUERSON",
      history: [
        {
          action: "Création (Brouillon)",
          timestamp: "2024-02-15T14:20:00",
          user: "Prof. ESAIE GUERSON",
          details: "Note enregistrée en brouillon",
        },
      ],
    },
  ]);

  // Filtrer les élèves
  const filteredStudents = mockTeacherStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Stats globales
  const totalStudents = mockTeacherStudents.length;
  const avgPerformance = Math.round(
    mockTeacherStudents.reduce((acc, s) => acc + s.average, 0) / totalStudents
  );
  const studentsInDifficulty = mockTeacherStudents.filter((s) => s.average < 70).length;
  const excellentStudents = mockTeacherStudents.filter((s) => s.average >= 90).length;

  // Ouvrir le modal d'ajout de note
  const openAddGradeModal = (student: any) => {
    setSelectedStudent(student);
    setShowAddGradeModal(true);
    setGradeForm({
      subject: "",
      evaluationType: "",
      grade: "",
      maxGrade: "100",
      comment: "",
    });
  };

  // Voir les notes d'un élève
  const viewStudentGrades = (student: any) => {
    setSelectedStudent(student);
    setShowGradesModal(true);
  };

  // Sauvegarder en brouillon
  const handleSaveDraft = () => {
    const percentage = Math.round(
      (parseFloat(gradeForm.grade) / parseFloat(gradeForm.maxGrade)) * 100
    );
    const newGrade: GradeRecord = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      ...gradeForm,
      percentage,
      status: "draft",
      createdAt: new Date().toISOString(),
      createdBy: "Prof. ESAIE GUERSON",
      history: [
        {
          action: "Création (Brouillon)",
          timestamp: new Date().toISOString(),
          user: "Prof. ESAIE GUERSON",
          details: "Note enregistrée en brouillon",
        },
      ],
    };
    setGradeRecords([...gradeRecords, newGrade]);
    setShowAddGradeModal(false);
    setSelectedStudent(null);
  };

  // Valider et verrouiller la note
  const handleValidateGrade = () => {
    const percentage = Math.round(
      (parseFloat(gradeForm.grade) / parseFloat(gradeForm.maxGrade)) * 100
    );
    const newGrade: GradeRecord = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      ...gradeForm,
      percentage,
      status: "validated",
      createdAt: new Date().toISOString(),
      createdBy: "Prof. ESAIE GUERSON",
      validatedAt: new Date().toISOString(),
      validatedBy: "Prof. ESAIE GUERSON",
      history: [
        {
          action: "Création",
          timestamp: new Date().toISOString(),
          user: "Prof. ESAIE GUERSON",
          details: "Note créée",
        },
        {
          action: "Validation",
          timestamp: new Date().toISOString(),
          user: "Prof. ESAIE GUERSON",
          details: "Note validée et verrouillée",
        },
      ],
    };
    setGradeRecords([...gradeRecords, newGrade]);
    setShowAddGradeModal(false);
    setSelectedStudent(null);
  };

  // Valider un brouillon existant
  const validateDraft = (gradeId: string) => {
    setGradeRecords(
      gradeRecords.map((g) =>
        g.id === gradeId
          ? {
              ...g,
              status: "validated",
              validatedAt: new Date().toISOString(),
              validatedBy: "Prof. ESAIE GUERSON",
              history: [
                ...g.history,
                {
                  action: "Validation",
                  timestamp: new Date().toISOString(),
                  user: "Prof. ESAIE GUERSON",
                  details: "Note validée et verrouillée",
                },
              ],
            }
          : g
      )
    );
  };

  // Demander une modification
  const openModificationModal = (grade: GradeRecord) => {
    setSelectedGrade(grade);
    setModificationReason("");
    setShowModificationModal(true);
  };

  const submitModificationRequest = () => {
    if (!selectedGrade || !modificationReason.trim()) return;

    setGradeRecords(
      gradeRecords.map((g) =>
        g.id === selectedGrade.id
          ? {
              ...g,
              status: "modification_requested",
              modificationRequestedAt: new Date().toISOString(),
              modificationReason,
              history: [
                ...g.history,
                {
                  action: "Demande de modification",
                  timestamp: new Date().toISOString(),
                  user: "Prof. ESAIE GUERSON",
                  details: modificationReason,
                },
              ],
            }
          : g
      )
    );
    setShowModificationModal(false);
    setSelectedGrade(null);
    setModificationReason("");
  };

  // Voir l'historique
  const viewHistory = (grade: GradeRecord) => {
    setSelectedGrade(grade);
    setShowHistoryModal(true);
  };

  // Obtenir la couleur selon la performance
  const getPerformanceColor = (average: number) => {
    if (average >= 90) return "text-green-600 bg-green-50";
    if (average >= 75) return "text-blue-600 bg-blue-50";
    if (average >= 60) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  // Obtenir l'icône de tendance
  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp size={14} className="text-green-600" />;
    if (trend === "down") return <TrendingDown size={14} className="text-red-600" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: GradeRecord["status"]) => {
    const badges = {
      draft: (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          <Clock size={12} />
          Brouillon
        </span>
      ),
      validated: (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <Lock size={12} />
          Validée
        </span>
      ),
      modification_requested: (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          <Edit2 size={12} />
          En attente
        </span>
      ),
      locked: (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <Lock size={12} />
          Verrouillée
        </span>
      ),
    };
    return badges[status];
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes Élèves"
        description="Gérez vos élèves et ajoutez des notes rapidement"
        icon={<GraduationCap size={20} />}
      />

      {/* Stats globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#013486]/10 flex items-center justify-center">
              <GraduationCap size={20} className="text-[#013486]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Élèves</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#43a047]/10 flex items-center justify-center">
              <BarChart3 size={20} className="text-[#43a047]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Moyenne Gén.</p>
              <p className="text-2xl font-bold text-gray-900">{avgPerformance}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F35403]/10 flex items-center justify-center">
              <AlertCircle size={20} className="text-[#F35403]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">En difficulté</p>
              <p className="text-2xl font-bold text-gray-900">{studentsInDifficulty}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
              <Award size={20} className="text-[#7c3aed]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Excellents</p>
              <p className="text-2xl font-bold text-gray-900">{excellentStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Recherche */}
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
            >
              <option value="all">Toutes les classes</option>
              <option value="NS3">NS3</option>
              <option value="NS2">NS2</option>
              <option value="NS1">NS1</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              <Filter size={16} />
              Filtres
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-[#013486] text-white rounded-lg text-sm font-semibold hover:bg-[#0148c2] transition">
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Liste des élèves */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Élève
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Moyenne
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Présence
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                >
                  {/* Élève */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#013486] to-[#0148c2] flex items-center justify-center text-white font-semibold text-sm">
                        {student.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Classe */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#013486] text-white">
                      {student.class}
                    </span>
                  </td>

                  {/* Moyenne */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${student.average}%`,
                            backgroundColor:
                              student.average >= 90
                                ? "#43a047"
                                : student.average >= 75
                                ? "#013486"
                                : student.average >= 60
                                ? "#F35403"
                                : "#d32f2f",
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm font-bold px-2 py-1 rounded ${getPerformanceColor(
                          student.average
                        )}`}
                      >
                        {student.average}%
                      </span>
                    </div>
                  </td>

                  {/* Présence */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck size={14} className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {student.attendance}%
                      </span>
                    </div>
                  </td>

                  {/* Tendance */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(student.trend)}
                      <span className="text-xs text-gray-600 capitalize">
                        {student.trend === "up"
                          ? "Hausse"
                          : student.trend === "down"
                          ? "Baisse"
                          : "Stable"}
                      </span>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                        <Mail size={14} className="text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                        <Phone size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openAddGradeModal(student)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#013486] hover:bg-[#0148c2] rounded-lg transition"
                      >
                        <Plus size={14} />
                        Note
                      </button>
                      <button
                        onClick={() => viewStudentGrades(student)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Eye size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout de note */}
      {showAddGradeModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Ajouter une note
                </h2>
                <p className="text-sm text-gray-500">
                  Pour {selectedStudent.name} - {selectedStudent.class}
                </p>
              </div>
              <button
                onClick={() => setShowAddGradeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Matière */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Matière <span className="text-red-500">*</span>
                </label>
                <select
                  value={gradeForm.subject}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, subject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                >
                  <option value="">Sélectionner une matière</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Français">Français</option>
                  <option value="SVT">SVT Biologie</option>
                  <option value="Histoire-Géo">Histoire-Géographie</option>
                  <option value="Anglais">Anglais</option>
                  <option value="Physique">Physique</option>
                  <option value="Chimie">Chimie</option>
                </select>
              </div>

              {/* Type d'évaluation */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Type d'évaluation <span className="text-red-500">*</span>
                </label>
                <select
                  value={gradeForm.evaluationType}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, evaluationType: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                >
                  <option value="">Sélectionner le type</option>
                  <option value="Devoir">Devoir</option>
                  <option value="Contrôle">Contrôle</option>
                  <option value="Examen">Examen</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Participation">Participation</option>
                  <option value="Projet">Projet</option>
                </select>
              </div>

              {/* Note obtenue et maximale */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Note obtenue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={gradeForm.maxGrade}
                    value={gradeForm.grade}
                    onChange={(e) =>
                      setGradeForm({ ...gradeForm, grade: e.target.value })
                    }
                    placeholder="Ex: 85"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Note maximale <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={gradeForm.maxGrade}
                    onChange={(e) =>
                      setGradeForm({ ...gradeForm, maxGrade: e.target.value })
                    }
                    placeholder="Ex: 100"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
                  />
                </div>
              </div>

              {/* Pourcentage calculé */}
              {gradeForm.grade && gradeForm.maxGrade && (
                <div className="p-4 bg-[#013486]/5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pourcentage</span>
                    <span className="text-lg font-bold text-[#013486]">
                      {Math.round(
                        (parseFloat(gradeForm.grade) / parseFloat(gradeForm.maxGrade)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                </div>
              )}

              {/* Commentaire */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={gradeForm.comment}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, comment: e.target.value })
                  }
                  placeholder="Ajouter un commentaire sur cette évaluation..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowAddGradeModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDraft}
                  disabled={
                    !gradeForm.subject ||
                    !gradeForm.evaluationType ||
                    !gradeForm.grade ||
                    !gradeForm.maxGrade
                  }
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#013486] bg-white border-2 border-[#013486] rounded-lg hover:bg-[#013486]/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  Brouillon
                </button>
                <button
                  onClick={handleValidateGrade}
                  disabled={
                    !gradeForm.subject ||
                    !gradeForm.evaluationType ||
                    !gradeForm.grade ||
                    !gradeForm.maxGrade
                  }
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#013486] rounded-lg hover:bg-[#0148c2] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={16} />
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal des notes de l'élève */}
      {showGradesModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Notes de l'élève</h2>
                <p className="text-sm text-gray-500">
                  {selectedStudent.name} - {selectedStudent.class}
                </p>
              </div>
              <button
                onClick={() => setShowGradesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="space-y-3">
                {gradeRecords
                  .filter((g) => g.studentId === selectedStudent.id)
                  .map((grade) => (
                    <div
                      key={grade.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-[#013486]/30 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900">{grade.subject}</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {grade.evaluationType}
                            </span>
                            {getStatusBadge(grade.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-semibold text-[#013486]">
                              {grade.grade}/{grade.maxGrade} ({grade.percentage}%)
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(grade.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          {grade.comment && (
                            <p className="mt-2 text-sm text-gray-600 italic">
                              "{grade.comment}"
                            </p>
                          )}
                          {grade.modificationReason && (
                            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-xs font-semibold text-orange-700 mb-1">
                                Demande de modification :
                              </p>
                              <p className="text-sm text-orange-900">
                                {grade.modificationReason}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {grade.status === "draft" && (
                            <button
                              onClick={() => validateDraft(grade.id)}
                              className="p-2 hover:bg-green-50 rounded-lg transition group"
                              title="Valider"
                            >
                              <CheckCircle2
                                size={18}
                                className="text-green-600 group-hover:scale-110 transition"
                              />
                            </button>
                          )}
                          {grade.status === "validated" && (
                            <button
                              onClick={() => openModificationModal(grade)}
                              className="p-2 hover:bg-orange-50 rounded-lg transition group"
                              title="Demander modification"
                            >
                              <Edit2
                                size={18}
                                className="text-orange-600 group-hover:scale-110 transition"
                              />
                            </button>
                          )}
                          <button
                            onClick={() => viewHistory(grade)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition group"
                            title="Historique"
                          >
                            <History
                              size={18}
                              className="text-blue-600 group-hover:scale-110 transition"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                {gradeRecords.filter((g) => g.studentId === selectedStudent.id)
                  .length === 0 && (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Aucune note enregistrée</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de demande de modification */}
      {showModificationModal && selectedGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                Demande de modification
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Cette note est verrouillée. Justifiez votre demande de modification.
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Raison de la modification <span className="text-red-500">*</span>
              </label>
              <textarea
                value={modificationReason}
                onChange={(e) => setModificationReason(e.target.value)}
                placeholder="Expliquez pourquoi cette note doit être modifiée..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486] resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                La direction sera notifiée et devra approuver cette demande.
              </p>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModificationModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={submitModificationRequest}
                disabled={!modificationReason.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'historique */}
      {showHistoryModal && selectedGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Historique de la note
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedGrade.subject} - {selectedGrade.evaluationType}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {selectedGrade.history.map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#013486] text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      {index < selectedGrade.history.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {entry.action}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Par {entry.user}</p>
                      {entry.details && (
                        <p className="text-sm text-gray-500 mt-1 italic">
                          {entry.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun élève trouvé
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Essayez de modifier vos critères de recherche ou vos filtres.
          </p>
        </div>
      )}
    </div>
  );
}
