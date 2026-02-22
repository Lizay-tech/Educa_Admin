"use client";

import {
  Users,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  BookOpen,
  BarChart3,
  ArrowRight,
  Mail,
  AlertCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CalendarDays,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";

import {
  mockTeacherStats,
  mockTeacherCourses,
  mockTeacherStudents,
  mockAnnouncements,
  mockWeeklyPerformance,
  mockUser,
  mockSchool,
  mockTeacherClasses,
} from "@/lib/mockUser";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import AcademicCalendarModal from "@/components/dashboard/AcademicCalendarModal";
import { useRef, useState } from "react";

export default function TeacherWidgets() {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const firstName = mockUser.name.split(" ")[0];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const stats = [
    {
      label: t.teacherStats.myClasses,
      value: mockTeacherStats.totalClasses.value,
      variation: mockTeacherStats.totalClasses.variation,
      icon: <BookOpen size={18} />,
      iconBg: "bg-[#013486]/10",
      accent: "text-[#013486]",
    },
    {
      label: t.teacherStats.myStudents,
      value: mockTeacherStats.totalStudents.value,
      variation: mockTeacherStats.totalStudents.variation,
      icon: <Users size={18} />,
      iconBg: "bg-[#F35403]/10",
      accent: "text-[#F35403]",
    },
    {
      label: t.teacherStats.pendingEvaluations,
      value: mockTeacherStats.pendingEvaluations.value,
      variation: mockTeacherStats.pendingEvaluations.variation,
      icon: <ClipboardCheck size={18} />,
      iconBg: "bg-[#7c3aed]/10",
      accent: "text-[#7c3aed]",
      action: t.teacherStats.review,
    },
    {
      label: t.teacherStats.participation,
      value: `${mockTeacherStats.participationRate.value}%`,
      variation: mockTeacherStats.participationRate.variation,
      icon: <BarChart3 size={18} />,
      iconBg: "bg-[#43a047]/10",
      accent: "text-[#43a047]",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header Dashboard Enseignant */}
      <div className="relative bg-gradient-to-r from-[#013486]/5 via-white to-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 overflow-hidden">
        {/* Accent décoratif */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#013486] rounded-l-xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* LEFT SECTION */}
          <div className="space-y-1">
            {/* Nom établissement */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-[#013486] tracking-tight">
                {mockSchool.name}
              </h1>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                <MapPin size={12} />
                {mockSchool.city}
              </span>
            </div>

            {/* Message de bienvenue */}
            <p className="text-xs sm:text-sm text-gray-500">
              {t.dashboard.welcome}{" "}
              <span className="font-medium text-gray-700">
                {mockSchool.name}
              </span>,{" "}
              <span className="font-semibold text-[#013486]">
                {firstName}
              </span>.
            </p>
          </div>

          {/* RIGHT SECTION - Sans bouton Support */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCalendar(true)}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl
                        bg-gradient-to-r from-[#013486] to-[#0148c2] text-white
                        shadow-md hover:shadow-lg transition-all"
            >
              <CalendarDays size={16} className="group-hover:scale-110 transition" />
              {t.dashboard.calendar}
            </button>

            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <SlidersHorizontal size={14} />
              {t.dashboard.filters}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Calendrier */}
      {showCalendar && (
        <AcademicCalendarModal onClose={() => setShowCalendar(false)} />
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4"
          >
            <div className="h-0.5 w-8 bg-[#F35403] rounded-full mb-3 group-hover:w-14 transition-all" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`${stat.iconBg} ${stat.accent} p-2 rounded-lg`}>
                  {stat.icon}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {stat.value}
                  </p>
                </div>
              </div>

              {stat.action ? (
                <button className="flex items-center gap-1 text-xs font-medium text-[#013486] hover:text-[#F35403] transition">
                  {stat.action}
                  <ArrowRight size={12} />
                </button>
              ) : stat.variation !== null ? (
                <span
                  className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    stat.variation >= 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {stat.variation >= 0 ? (
                    <TrendingUp size={11} />
                  ) : (
                    <TrendingDown size={11} />
                  )}
                  {stat.variation >= 0 ? "+" : ""}
                  {stat.variation}%
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Section Principale: Mes Cours */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Mes Cours
            </h2>
            <p className="text-sm text-gray-500">
              {mockTeacherCourses.length} cours actifs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>

            {/* Menu Actions */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                <MoreVertical size={18} className="text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showActionsMenu && (
                <>
                  {/* Overlay pour fermer au clic extérieur */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActionsMenu(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 top-12 z-20 w-56 bg-white rounded-xl border border-gray-200 shadow-xl py-2">
                    {/* Header */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-900">
                        Actions rapides
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Gestion des cours
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#013486]/5 transition">
                        <ClipboardCheck size={16} className="text-[#013486]" />
                        <span>Prendre présence</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F35403]/5 transition">
                        <BarChart3 size={16} className="text-[#F35403]" />
                        <span>Ajouter des notes</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#43a047]/5 transition">
                        <BookOpen size={16} className="text-[#43a047]" />
                        <span>Créer un devoir</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#7c3aed]/5 transition">
                        <Award size={16} className="text-[#7c3aed]" />
                        <span>Voir statistiques</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1" />

                    {/* Secondary Actions */}
                    <div className="py-1">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                        <ArrowRight size={16} className="text-gray-400" />
                        <span>Voir tous les cours</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scroll horizontal des cours */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {mockTeacherCourses.map((course) => (
            <div
              key={course.id}
              className="group relative flex-shrink-0 w-[230px] bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Image avec nom et nombre d'élèves */}
              <div className="relative h-[140px] overflow-hidden">
                {/* Image de fond */}
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, transparent 0%, ${course.color}dd 100%)`
                  }}
                />

                {/* Contenu sur l'image */}
                <div className="absolute inset-0 p-3.5 flex flex-col justify-between">
                  {/* Menu 3 points en haut à droite */}
                  <div className="flex justify-end">
                    <button className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition">
                      <MoreVertical size={14} className="text-white" />
                    </button>
                  </div>

                  {/* Nom et informations en bas */}
                  <div>
                    <h3 className="text-base font-bold text-white drop-shadow-lg mb-1.5 line-clamp-2 leading-tight">
                      {course.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-white drop-shadow bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">
                        {course.level}
                      </span>
                      <span className="text-[10px] font-medium text-white/90 drop-shadow">
                        {course.year}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users size={13} className="text-white drop-shadow" />
                        <span className="text-xs font-bold text-white drop-shadow">
                          {course.students} élèves
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                        <span className="text-[10px] font-medium text-white/90 drop-shadow">
                          {course.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Mes Classes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Mes Classes
            </h2>
            <p className="text-sm text-gray-500">
              {mockTeacherClasses.length} classes assignées
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#013486] bg-[#013486]/10 hover:bg-[#013486]/15 rounded-lg transition">
            Voir tout
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockTeacherClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Barre de couleur en haut */}
              <div
                className="absolute top-0 left-0 w-full h-1.5"
                style={{ backgroundColor: classItem.color }}
              />

              <div className="p-5">
                {/* Header - Nom de la classe */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {classItem.name}
                    </h3>
                    <span
                      className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: classItem.color }}
                    >
                      {classItem.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {classItem.fullName}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    📅 {classItem.year}
                  </p>
                </div>

                {/* Informations principales */}
                <div className="space-y-3 mb-4">
                  {/* Nombre d'élèves */}
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {classItem.students} élèves
                    </span>
                  </div>

                  {/* Salle */}
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    🏫 {classItem.room}
                  </div>
                </div>

                {/* Indicateurs pédagogiques */}
                <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  {/* Présence */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">📍 Présence</span>
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

                  {/* Moyenne */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">📊 Moyenne</span>
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

                  {/* Élèves en difficulté */}
                  {classItem.studentsInDifficulty > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        ⚠ En difficulté
                      </span>
                      <span className="text-xs font-bold text-red-600">
                        {classItem.studentsInDifficulty}
                      </span>
                    </div>
                  )}
                </div>

                {/* Informations utiles */}
                <div className="space-y-1.5 mb-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>📅 Prochain cours:</span>
                    <span className="font-medium">{classItem.nextClass}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📝 Devoirs:</span>
                    <span className="font-medium">
                      {classItem.pendingHomework} à corriger
                    </span>
                  </div>
                </div>

                {/* Actions rapides au hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-[#013486] bg-[#013486]/5 hover:bg-[#013486]/10 rounded transition">
                      <Users size={12} />
                      Élèves
                    </button>
                    <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-[#F35403] bg-[#F35403]/5 hover:bg-[#F35403]/10 rounded transition">
                      <ClipboardCheck size={12} />
                      Présence
                    </button>
                    <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-[#43a047] bg-[#43a047]/5 hover:bg-[#43a047]/10 rounded transition">
                      <BarChart3 size={12} />
                      Notes
                    </button>
                    <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-[#7c3aed] bg-[#7c3aed]/5 hover:bg-[#7c3aed]/10 rounded transition">
                      <Award size={12} />
                      Stats
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grille: Étudiants & Annonces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Liste des élèves récents */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t.teacherDashboard.recentStudents}
              </h2>
              <p className="text-sm text-gray-500">
                {t.teacherDashboard.studentsSubtitle}
              </p>
            </div>
            <button className="text-sm font-medium text-[#013486] hover:text-[#F35403] transition">
              {t.teacherDashboard.seeAll}
            </button>
          </div>

          <div className="space-y-3">
            {mockTeacherStudents.map((student) => (
              <div
                key={student.id}
                className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-[#013486]/5 rounded-lg transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Photo */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#013486] to-[#0148c2] flex items-center justify-center text-white font-semibold">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail size={12} />
                      {student.email}
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Performance</p>
                    <p className="text-sm font-bold text-[#013486]">
                      {student.performance}%
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-gray-400 group-hover:text-[#013486] group-hover:translate-x-1 transition"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Annonces & Avis */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t.teacherDashboard.announcements}
              </h2>
              <p className="text-sm text-gray-500">
                {t.teacherDashboard.announcementsSubtitle}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {mockAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border-l-4 ${
                  announcement.priority === "high"
                    ? "border-red-500 bg-red-50"
                    : announcement.priority === "medium"
                    ? "border-orange-500 bg-orange-50"
                    : "border-blue-500 bg-blue-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={18}
                    className={
                      announcement.priority === "high"
                        ? "text-red-600"
                        : announcement.priority === "medium"
                        ? "text-orange-600"
                        : "text-blue-600"
                    }
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {announcement.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-500">{announcement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques de performance hebdomadaire */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {t.teacherDashboard.weeklyPerformance}
            </h2>
            <p className="text-sm text-gray-500">
              {t.teacherDashboard.performanceSubtitle}
            </p>
          </div>
          <Award size={24} className="text-[#F35403]" />
        </div>

        <div className="grid grid-cols-5 gap-3">
          {mockWeeklyPerformance.map((day) => (
            <div
              key={day.day}
              className="text-center p-4 bg-gradient-to-br from-[#013486]/5 to-[#013486]/10 rounded-lg"
            >
              <p className="text-xs font-medium text-gray-600 mb-2">
                {day.day}
              </p>
              <p className="text-2xl font-bold text-[#013486]">{day.rate}%</p>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#013486] rounded-full"
                  style={{ width: `${day.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Indicateurs globaux */}
        <div className="mt-5 pt-5 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">
              {t.teacherDashboard.weeklyEvaluations}
            </p>
            <p className="text-xl font-bold text-[#013486]">87%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">
              {t.teacherDashboard.globalParticipation}
            </p>
            <p className="text-xl font-bold text-[#43a047]">94%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">
              {t.teacherDashboard.globalSuccess}
            </p>
            <p className="text-xl font-bold text-[#F35403]">77%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">
              {t.teacherDashboard.positiveNotes}
            </p>
            <p className="text-xl font-bold text-[#7c3aed]">94%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
