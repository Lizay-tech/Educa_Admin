"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Search,
  Filter,
  Plus,
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  Award,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  X,
  ChevronDown,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  class: string;
  average: number;
  evaluations: number;
  pending: number;
  trend: "up" | "down" | "stable";
}

interface Evaluation {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  type: string;
  studentsGraded: number;
  totalStudents: number;
  average?: number;
}

export default function TeacherGradesPage() {
  const [activeTab, setActiveTab] = useState<"entry" | "evaluations" | "statistics">("entry");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showAddGradeForm, setShowAddGradeForm] = useState(false);

  // Grade form states
  const [selectedClassForGrade, setSelectedClassForGrade] = useState("");
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState("");
  const [gradeFormData, setGradeFormData] = useState({
    subject: "",
    evaluationType: "",
    evaluationTitle: "",
    gradeObtained: "",
    maxGrade: "100",
    coefficient: "1",
    comment: "",
  });

  // Mock data
  const students: Student[] = [
    { id: "1", name: "Marie-Claire Joseph", class: "NS3", average: 87, evaluations: 12, pending: 2, trend: "up" },
    { id: "2", name: "Jean-Baptiste Pierre", class: "NS2", average: 92, evaluations: 10, pending: 0, trend: "stable" },
    { id: "3", name: "Sophia Delva", class: "NS3", average: 78, evaluations: 11, pending: 3, trend: "down" },
    { id: "4", name: "Marcus Laurent", class: "NS1", average: 85, evaluations: 9, pending: 1, trend: "up" },
  ];

  const evaluations: Evaluation[] = [
    { id: "1", title: "Équations du second degré", subject: "Mathématiques", class: "NS3", date: "2024-02-25", type: "Examen", studentsGraded: 32, totalStudents: 32, average: 76 },
    { id: "2", title: "La conjugaison", subject: "Français", class: "NS2", date: "2024-02-28", type: "Devoir", studentsGraded: 18, totalStudents: 30 },
    { id: "3", title: "La photosynthèse", subject: "SVT", class: "NS3", date: "2024-03-05", type: "Contrôle", studentsGraded: 0, totalStudents: 28 },
  ];

  const stats = {
    totalEvaluations: 45,
    averageGrade: 82,
    completedEvaluations: 38,
    pendingGrades: 127,
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#013486] flex items-center justify-center">
              <ClipboardCheck size={20} className="text-white" />
            </div>
            Notes & Évaluations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Saisie et gestion complète des notes scolaires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            <Download size={16} />
            Exporter
          </button>
          {activeTab === "entry" && (
            <button
              onClick={() => {
                setShowAddGradeForm(!showAddGradeForm);
                if (!showAddGradeForm) {
                  // Reset form when opening
                  setSelectedClassForGrade("");
                  setSelectedStudentForGrade("");
                  setGradeFormData({
                    subject: "",
                    evaluationType: "",
                    evaluationTitle: "",
                    gradeObtained: "",
                    maxGrade: "100",
                    coefficient: "1",
                    comment: "",
                  });
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                showAddGradeForm
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-[#013486] text-white hover:bg-[#0148c2]"
              }`}
            >
              {showAddGradeForm ? (
                <>
                  <X size={16} />
                  Annuler
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Ajouter une note
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#013486]/10 flex items-center justify-center">
              <FileText size={20} className="text-[#013486]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Évaluations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvaluations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#43a047]/10 flex items-center justify-center">
              <BarChart3 size={20} className="text-[#43a047]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Moyenne générale</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageGrade}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-[#7c3aed]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedEvaluations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F35403]/10 flex items-center justify-center">
              <Clock size={20} className="text-[#F35403]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">À corriger</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingGrades}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("entry")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === "entry"
                ? "bg-[#013486] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Edit2 size={16} />
            Saisie des notes
          </button>
          <button
            onClick={() => setActiveTab("evaluations")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === "evaluations"
                ? "bg-[#013486] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText size={16} />
            Évaluations
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === "statistics"
                ? "bg-[#013486] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BarChart3 size={16} />
            Statistiques
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "entry" && (
        <div className="space-y-4">
          {/* Add Grade Form */}
          {showAddGradeForm && (
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border-2 border-[#013486]/20 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#013486] flex items-center justify-center">
                  <ClipboardCheck size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Nouvelle saisie de note</h3>
                  <p className="text-sm text-gray-500">Complétez les informations pour enregistrer une note</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Class & Student Selection */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={18} className="text-[#013486]" />
                      <h4 className="font-bold text-gray-900">Classe</h4>
                    </div>
                    <select
                      value={selectedClassForGrade}
                      onChange={(e) => {
                        setSelectedClassForGrade(e.target.value);
                        setSelectedStudentForGrade("");
                      }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
                    >
                      <option value="">Sélectionner une classe</option>
                      <option value="NS3">NS3 (28 élèves)</option>
                      <option value="NS2">NS2 (30 élèves)</option>
                      <option value="NS1">NS1 (25 élèves)</option>
                      <option value="Philo">Philo (22 élèves)</option>
                    </select>
                  </div>

                  {selectedClassForGrade && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={18} className="text-[#013486]" />
                        <h4 className="font-bold text-gray-900">Élève</h4>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll">
                        {students
                          .filter((s) => s.class === selectedClassForGrade)
                          .map((student) => (
                            <button
                              key={student.id}
                              onClick={() => setSelectedStudentForGrade(student.id)}
                              className={`w-full p-3 rounded-lg border-2 transition text-left ${
                                selectedStudentForGrade === student.id
                                  ? "border-[#013486] bg-[#013486]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#013486] to-[#0148c2] flex items-center justify-center text-white font-semibold text-xs">
                                    {student.name.split(" ").map((n) => n[0]).join("")}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                                    <p className="text-xs text-gray-500">Moy: {student.average}%</p>
                                  </div>
                                </div>
                                {selectedStudentForGrade === student.id && (
                                  <CheckCircle2 size={16} className="text-[#013486]" />
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Evaluation Details */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={18} className="text-[#013486]" />
                      <h4 className="font-bold text-gray-900">Détails de l'évaluation</h4>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Matière *
                        </label>
                        <select
                          value={gradeFormData.subject}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, subject: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Mathématiques">Mathématiques</option>
                          <option value="Français">Français</option>
                          <option value="Anglais">Anglais</option>
                          <option value="SVT">SVT</option>
                          <option value="Physique-Chimie">Physique-Chimie</option>
                          <option value="Histoire-Géo">Histoire-Géographie</option>
                          <option value="EPS">EPS</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Type d'évaluation *
                        </label>
                        <select
                          value={gradeFormData.evaluationType}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, evaluationType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Devoir">Devoir</option>
                          <option value="Examen">Examen</option>
                          <option value="Interro">Interrogation</option>
                          <option value="Projet">Projet</option>
                          <option value="TP">Travaux Pratiques</option>
                          <option value="Participation">Participation</option>
                          <option value="Contrôle">Contrôle continu</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Titre de l'évaluation *
                        </label>
                        <input
                          type="text"
                          value={gradeFormData.evaluationTitle}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, evaluationTitle: e.target.value })}
                          placeholder="Ex: Équations du second degré"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Grade Entry */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award size={18} className="text-[#013486]" />
                      <h4 className="font-bold text-gray-900">Note</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Note obtenue *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={gradeFormData.gradeObtained}
                            onChange={(e) => setGradeFormData({ ...gradeFormData, gradeObtained: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Sur
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={gradeFormData.maxGrade}
                            onChange={(e) => setGradeFormData({ ...gradeFormData, maxGrade: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Coefficient
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={gradeFormData.coefficient}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, coefficient: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
                        />
                      </div>

                      {gradeFormData.gradeObtained && gradeFormData.maxGrade && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-[#013486]/5 to-[#0148c2]/5 border border-[#013486]/20">
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-600 mb-1">Pourcentage</p>
                            <p className={`text-3xl font-bold ${
                              ((parseFloat(gradeFormData.gradeObtained) / parseFloat(gradeFormData.maxGrade)) * 100) >= 90 ? "text-green-600" :
                              ((parseFloat(gradeFormData.gradeObtained) / parseFloat(gradeFormData.maxGrade)) * 100) >= 75 ? "text-blue-600" :
                              ((parseFloat(gradeFormData.gradeObtained) / parseFloat(gradeFormData.maxGrade)) * 100) >= 60 ? "text-orange-600" : "text-red-600"
                            }`}>
                              {((parseFloat(gradeFormData.gradeObtained) / parseFloat(gradeFormData.maxGrade)) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Commentaire
                        </label>
                        <textarea
                          value={gradeFormData.comment}
                          onChange={(e) => setGradeFormData({ ...gradeFormData, comment: e.target.value })}
                          placeholder="Appréciation..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    alert("Note enregistrée en brouillon ✓");
                    setShowAddGradeForm(false);
                  }}
                  disabled={
                    !selectedClassForGrade ||
                    !selectedStudentForGrade ||
                    !gradeFormData.subject ||
                    !gradeFormData.evaluationType ||
                    !gradeFormData.evaluationTitle ||
                    !gradeFormData.gradeObtained ||
                    !gradeFormData.maxGrade
                  }
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enregistrer en brouillon
                </button>
                <button
                  onClick={() => {
                    alert("Note validée et enregistrée ✓");
                    setShowAddGradeForm(false);
                  }}
                  disabled={
                    !selectedClassForGrade ||
                    !selectedStudentForGrade ||
                    !gradeFormData.subject ||
                    !gradeFormData.evaluationType ||
                    !gradeFormData.evaluationTitle ||
                    !gradeFormData.gradeObtained ||
                    !gradeFormData.maxGrade
                  }
                  className="px-6 py-2.5 bg-[#43a047] text-white rounded-lg text-sm font-semibold hover:bg-[#388e3c] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Valider la note
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          {!showAddGradeForm && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
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
                <div className="flex items-center gap-2 w-full sm:w-auto">
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
                </div>
              </div>
            </div>
          )}

          {/* Students Table */}
          {!showAddGradeForm && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Élève</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Classe</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Moyenne</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Évaluations</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">En attente</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#013486] to-[#0148c2] flex items-center justify-center text-white font-semibold text-sm">
                          {student.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#013486] text-white">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          student.average >= 90 ? "text-green-600" :
                          student.average >= 75 ? "text-blue-600" :
                          student.average >= 60 ? "text-orange-600" : "text-red-600"
                        }`}>
                          {student.average}%
                        </span>
                        {student.trend === "up" && <TrendingUp size={14} className="text-green-600" />}
                        {student.trend === "down" && <TrendingUp size={14} className="text-red-600 rotate-180" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{student.evaluations}</span>
                    </td>
                    <td className="px-6 py-4">
                      {student.pending > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          <AlertCircle size={12} />
                          {student.pending}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition">
                          <Plus size={16} className="text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Eye size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {activeTab === "evaluations" && (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <div key={evaluation.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{evaluation.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {evaluation.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {evaluation.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {evaluation.class}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(evaluation.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-semibold">{Math.round((evaluation.studentsGraded / evaluation.totalStudents) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#013486] rounded-full transition-all"
                          style={{ width: `${(evaluation.studentsGraded / evaluation.totalStudents) * 100}%` }}
                        />
                      </div>
                    </div>
                    {evaluation.average && (
                      <div className="text-sm">
                        <span className="text-gray-600">Moyenne: </span>
                        <span className="font-bold text-[#013486]">{evaluation.average}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#013486] text-white rounded-lg text-sm font-semibold hover:bg-[#0148c2] transition">
                  Corriger
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "statistics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution des moyennes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#013486]" />
              Distribution des moyennes
            </h3>
            <div className="space-y-3">
              {[
                { label: "Excellent (90-100%)", count: 12, color: "bg-green-500", percent: 30 },
                { label: "Bien (75-89%)", count: 18, color: "bg-blue-500", percent: 45 },
                { label: "Passable (60-74%)", count: 8, color: "bg-orange-500", percent: 20 },
                { label: "Faible (<60%)", count: 2, color: "bg-red-500", percent: 5 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-semibold text-gray-900">{item.count} élèves</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques par matière */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-[#013486]" />
              Moyennes par matière
            </h3>
            <div className="space-y-3">
              {[
                { subject: "Mathématiques", average: 85, color: "#013486" },
                { subject: "Français", average: 88, color: "#F35403" },
                { subject: "SVT", average: 79, color: "#43a047" },
                { subject: "Histoire-Géo", average: 82, color: "#d32f2f" },
              ].map((item) => (
                <div key={item.subject} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700">{item.subject}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.average}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
