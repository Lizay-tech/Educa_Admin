"use client";

import PageHeader from "@/components/shared/PageHeader";
import {
  LayoutGrid,
  Search,
  Filter,
  Users,
  ClipboardCheck,
  BarChart3,
  Award,
  BookOpen,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreVertical,
  Download,
  Plus,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { mockTeacherClasses } from "@/lib/mockUser";
import { useState } from "react";

export default function TeacherClassesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtrer les classes
  const filteredClasses = mockTeacherClasses.filter((classItem) => {
    const matchesSearch = classItem.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      classItem.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "all" || classItem.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  // Stats globales
  const totalStudents = mockTeacherClasses.reduce((acc, c) => acc + c.students, 0);
  const avgAttendance = Math.round(
    mockTeacherClasses.reduce((acc, c) => acc + c.attendance, 0) / mockTeacherClasses.length
  );
  const avgGrade = Math.round(
    mockTeacherClasses.reduce((acc, c) => acc + c.average, 0) / mockTeacherClasses.length
  );
  const totalInDifficulty = mockTeacherClasses.reduce(
    (acc, c) => acc + c.studentsInDifficulty,
    0
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes Classes"
        description="Gérez et consultez toutes vos classes assignées"
        icon={<LayoutGrid size={20} />}
      />

      {/* Stats globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#013486]/10 flex items-center justify-center">
              <LayoutGrid size={20} className="text-[#013486]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{mockTeacherClasses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F35403]/10 flex items-center justify-center">
              <Users size={20} className="text-[#F35403]" />
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
              <ClipboardCheck size={20} className="text-[#43a047]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Présence Moy.</p>
              <p className="text-2xl font-bold text-gray-900">{avgAttendance}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center">
              <BarChart3 size={20} className="text-[#7c3aed]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Moyenne Gén.</p>
              <p className="text-2xl font-bold text-gray-900">{avgGrade}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Recherche */}
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une classe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#013486]/20 focus:border-[#013486]"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#013486]/20"
            >
              <option value="all">Tous les niveaux</option>
              <option value="Secondaire">Secondaire</option>
              <option value="Fondamental">Fondamental</option>
              <option value="Primaire">Primaire</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              <Filter size={16} />
              Filtres
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-[#013486] text-white rounded-lg text-sm font-semibold hover:bg-[#0148c2] transition">
              <Download size={16} />
              Exporter
            </button>

            {/* Toggle View Mode */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition ${
                  viewMode === "grid"
                    ? "bg-white text-[#013486] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition ${
                  viewMode === "list"
                    ? "bg-white text-[#013486] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <BookOpen size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des classes */}
      {viewMode === "grid" ? (
        // Vue grille
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Header avec couleur */}
              <div
                className="h-2"
                style={{ backgroundColor: classItem.color }}
              />

              <div className="p-6">
                {/* Titre et badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {classItem.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">
                      {classItem.fullName}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: classItem.color }}
                  >
                    {classItem.level}
                  </span>
                </div>

                {/* Infos principales */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">📅 Année</span>
                    <span className="font-semibold text-gray-900">{classItem.year}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">👥 Élèves</span>
                    <span className="font-semibold text-gray-900">{classItem.students}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">🏫 Salle</span>
                    <span className="font-semibold text-gray-900">{classItem.room}</span>
                  </div>
                </div>

                {/* Indicateurs */}
                <div className="space-y-3 mb-5 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">📍 Présence</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${classItem.attendance}%`,
                            backgroundColor:
                              classItem.attendance >= 90
                                ? "#43a047"
                                : classItem.attendance >= 80
                                ? "#F35403"
                                : "#d32f2f",
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          classItem.attendance >= 90
                            ? "text-green-600"
                            : classItem.attendance >= 80
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {classItem.attendance}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">📊 Moyenne</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${classItem.average}%`,
                            backgroundColor:
                              classItem.average >= 75
                                ? "#43a047"
                                : classItem.average >= 60
                                ? "#F35403"
                                : "#d32f2f",
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          classItem.average >= 75
                            ? "text-green-600"
                            : classItem.average >= 60
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {classItem.average}%
                      </span>
                    </div>
                  </div>

                  {classItem.studentsInDifficulty > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">⚠ En difficulté</span>
                      <span className="text-xs font-bold text-red-600">
                        {classItem.studentsInDifficulty}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#013486] bg-[#013486]/5 hover:bg-[#013486]/10 rounded-lg transition">
                    <Eye size={14} />
                    Voir détails
                  </button>
                  <button className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-[#F35403] bg-[#F35403]/5 hover:bg-[#F35403]/10 rounded-lg transition">
                    <ClipboardCheck size={14} />
                    Présence
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vue liste
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Élèves
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Présence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Moyenne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Salle
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClasses.map((classItem) => (
                  <tr
                    key={classItem.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1 h-12 rounded-full"
                          style={{ backgroundColor: classItem.color }}
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {classItem.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {classItem.fullName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: classItem.color }}
                      >
                        {classItem.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {classItem.students}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${classItem.attendance}%`,
                              backgroundColor:
                                classItem.attendance >= 90
                                  ? "#43a047"
                                  : classItem.attendance >= 80
                                  ? "#F35403"
                                  : "#d32f2f",
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {classItem.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${classItem.average}%`,
                              backgroundColor:
                                classItem.average >= 75
                                  ? "#43a047"
                                  : classItem.average >= 60
                                  ? "#F35403"
                                  : "#d32f2f",
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {classItem.average}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{classItem.room}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {filteredClasses.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune classe trouvée
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Essayez de modifier vos critères de recherche ou vos filtres.
          </p>
        </div>
      )}
    </div>
  );
}
