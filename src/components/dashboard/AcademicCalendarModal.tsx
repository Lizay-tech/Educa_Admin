"use client";

import { useState, useMemo } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import {
  academicCalendar,
  schoolEvents,
} from "@/lib/datasets/academicCalendar";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";

/* ================= CONFIG ================= */

const typeLabels: Record<string, string> = {
  holiday: "Férié",
  school: "École",
  vacation: "Vacances",
  exam: "Examen",
};

const typeDotColor: Record<string, string> = {
  holiday: "bg-red-500",
  school: "bg-[#013486]",
  vacation: "bg-orange-400",
  exam: "bg-purple-500",
};

const typeBadgeColor: Record<string, string> = {
  holiday: "bg-red-50 text-red-600 border-red-100",
  school: "bg-[#013486]/10 text-[#013486] border-[#013486]/20",
  vacation: "bg-orange-50 text-orange-600 border-orange-100",
  exam: "bg-purple-50 text-purple-600 border-purple-100",
};

const DAYS_OF_WEEK = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/* Trouver le premier mois avec événements */
const firstEventDate =
  academicCalendar.length > 0
    ? new Date(
        [...academicCalendar].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )[0].date
      )
    : new Date();

/* ================= VIEWS ================= */
type ViewMode = "calendar" | "events";

/* ================= COMPONENT ================= */

export default function AcademicCalendarModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(firstEventDate);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<ViewMode>("calendar");

  /* Indexer les événements par date (YYYY-MM-DD) */
  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof academicCalendar> = {};
    for (const ev of academicCalendar) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, []);

  /* Jours à afficher dans la grille */
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  /* Événements du mois courant */
  const monthEvents = useMemo(() => {
    return academicCalendar.filter((ev) => {
      const d = new Date(ev.date);
      return isSameMonth(d, currentMonth);
    });
  }, [currentMonth]);

  /* Événements du jour sélectionné */
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, "yyyy-MM-dd");
    return eventsByDate[key] || [];
  }, [selectedDay, eventsByDate]);

  /* Événements scolaires triés */
  const sortedSchoolEvents = useMemo(() => {
    return [...schoolEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, []);

  const goToPrev = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNext = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}
        <div className="bg-gradient-to-r from-[#013486] to-[#0148c2] px-5 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <CalendarDays size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  Calendrier Académique
                </h2>
                <p className="text-[11px] text-white/60 mt-0.5">
                  {academicCalendar.length} événements &bull; Année 2024-2025
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle vue */}
              <div className="flex bg-white/15 rounded-lg p-0.5">
                <button
                  onClick={() => setView("calendar")}
                  className={`p-1.5 rounded-md transition ${
                    view === "calendar"
                      ? "bg-white/25 text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                  title="Calendrier"
                >
                  <CalendarDays size={14} />
                </button>
                <button
                  onClick={() => setView("events")}
                  className={`p-1.5 rounded-md transition ${
                    view === "events"
                      ? "bg-white/25 text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                  title="Événements scolaires"
                >
                  <GraduationCap size={14} />
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= CONTENU ================= */}
        <div className="flex-1 overflow-y-auto">
          {view === "calendar" ? (
            /* ==================== VUE CALENDRIER ==================== */
            <div className="p-5">
              {/* Navigation mois */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrev}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <ChevronLeft size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                  <h3 className="text-sm font-bold text-gray-900 ml-2 capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: fr })}
                  </h3>
                  {monthEvents.length > 0 && (
                    <span className="text-[10px] bg-[#013486]/10 text-[#013486] font-semibold px-2 py-0.5 rounded-full">
                      {monthEvents.length} évt{monthEvents.length > 1 && "s"}
                    </span>
                  )}
                </div>

                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-[11px] font-semibold text-[#013486] bg-[#013486]/10 rounded-lg hover:bg-[#013486]/20 transition"
                >
                  Aujourd&apos;hui
                </button>
              </div>

              {/* Grille calendrier */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                {calendarDays.map((day, idx) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayEvents = eventsByDate[key] || [];
                  const inMonth = isSameMonth(day, currentMonth);
                  const today = isToday(day);
                  const isSelected = selectedDay
                    ? isSameDay(day, selectedDay)
                    : false;
                  const hasEvents = dayEvents.length > 0 && inMonth;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(day)}
                      className={`
                        relative flex flex-col items-center py-2 min-h-[52px] sm:min-h-[60px] transition-all
                        ${inMonth ? "bg-white" : "bg-gray-50/80"}
                        ${isSelected ? "bg-[#013486]/5 ring-1 ring-[#013486]/30 z-10" : "hover:bg-gray-50"}
                        ${hasEvents && !isSelected ? "bg-blue-50/30" : ""}
                      `}
                    >
                      <span
                        className={`
                          text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition
                          ${!inMonth ? "text-gray-300" : "text-gray-700"}
                          ${today ? "bg-[#013486] text-white font-bold" : ""}
                          ${isSelected && !today ? "bg-[#013486]/10 text-[#013486] font-bold" : ""}
                        `}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Dots pour les événements */}
                      {hasEvents && (
                        <div className="flex items-center gap-0.5 mt-1">
                          {dayEvents.slice(0, 3).map((ev, i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${typeDotColor[ev.type] || "bg-gray-400"}`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-gray-400 font-bold ml-0.5">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Légende */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {Object.entries(typeDotColor).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-[10px] text-gray-500 font-medium">
                      {typeLabels[type]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Détails du jour sélectionné */}
              {selectedDay && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-800 capitalize">
                      {format(selectedDay, "EEEE dd MMMM yyyy", {
                        locale: fr,
                      })}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {selectedDayEvents.length} événement
                      {selectedDayEvents.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {selectedDayEvents.length === 0 ? (
                    <p className="text-[11px] text-gray-400 py-3 text-center">
                      Aucun événement ce jour.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {selectedDayEvents.map((event, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 border transition hover:shadow-sm ${
                            typeBadgeColor[event.type] ||
                            "bg-gray-50 text-gray-600 border-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${typeDotColor[event.type] || "bg-gray-400"}`}
                            />
                            <span className="text-[11px] font-semibold">
                              {event.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-medium opacity-70">
                            {typeLabels[event.type] || event.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Événements du mois en résumé */}
              {!selectedDay && monthEvents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-700 mb-2">
                    Événements du mois
                  </p>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {[...monthEvents]
                      .sort(
                        (a, b) =>
                          new Date(a.date).getTime() -
                          new Date(b.date).getTime()
                      )
                      .map((event, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg px-3 py-2 bg-gray-50 border border-gray-100 hover:bg-gray-100/60 transition cursor-pointer"
                          onClick={() => {
                            setSelectedDay(new Date(event.date));
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${typeDotColor[event.type] || "bg-gray-400"}`}
                            />
                            <span className="text-[11px] font-medium text-gray-800">
                              {event.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {format(new Date(event.date), "dd MMM", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ==================== VUE ÉVÉNEMENTS SCOLAIRES ==================== */
            <div className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap size={16} className="text-[#013486]" />
                <h3 className="text-sm font-bold text-gray-900">
                  Événements Scolaires
                </h3>
                <span className="text-[10px] bg-[#013486]/10 text-[#013486] font-semibold px-2 py-0.5 rounded-full">
                  {schoolEvents.length}
                </span>
              </div>

              {/* Filtres rapides par type */}
              <EventFilterList
                events={sortedSchoolEvents}
                onNavigate={(date) => {
                  setCurrentMonth(date);
                  setSelectedDay(date);
                  setView("calendar");
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= LISTE ÉVÉNEMENTS AVEC FILTRE ================= */

function EventFilterList({
  events,
  onNavigate,
}: {
  events: typeof academicCalendar;
  onNavigate: (date: Date) => void;
}) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((ev) => ev.type === filter);
  }, [events, filter]);

  /* Grouper par mois */
  const grouped = useMemo(() => {
    const map: Record<string, typeof events> = {};
    for (const ev of filtered) {
      const monthKey = format(new Date(ev.date), "yyyy-MM");
      if (!map[monthKey]) map[monthKey] = [];
      map[monthKey].push(ev);
    }
    return map;
  }, [filtered]);

  const filterButtons = [
    { key: "all", label: "Tout", color: "bg-gray-100 text-gray-700" },
    { key: "school", label: "École", color: "bg-[#013486]/10 text-[#013486]" },
    { key: "exam", label: "Examens", color: "bg-purple-50 text-purple-600" },
    {
      key: "vacation",
      label: "Vacances",
      color: "bg-orange-50 text-orange-600",
    },
    { key: "holiday", label: "Fériés", color: "bg-red-50 text-red-600" },
  ];

  return (
    <>
      {/* Filtres */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {filterButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition ${
              filter === btn.key
                ? `${btn.color} border-current shadow-sm`
                : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {btn.label}
            {filter === btn.key && (
              <span className="ml-1">
                ({filter === "all" ? events.length : filtered.length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste groupée par mois */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
        {Object.entries(grouped).map(([monthKey, monthEvents]) => (
          <div key={monthKey}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 capitalize">
              {format(new Date(monthKey + "-01"), "MMMM yyyy", { locale: fr })}
            </p>

            <div className="space-y-1.5">
              {monthEvents.map((event, index) => (
                <div
                  key={index}
                  onClick={() => onNavigate(new Date(event.date))}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 border cursor-pointer transition hover:shadow-sm active:scale-[0.99] ${
                    typeBadgeColor[event.type] ||
                    "bg-gray-50 text-gray-600 border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        typeDotColor[event.type]?.replace("bg-", "bg-") ||
                        "bg-gray-400"
                      } text-white`}
                    >
                      {format(new Date(event.date), "dd")}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold leading-tight">
                        {event.title}
                      </p>
                      <p className="text-[10px] opacity-60 mt-0.5">
                        {format(new Date(event.date), "EEEE", { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium opacity-60">
                      {typeLabels[event.type]}
                    </span>
                    <ChevronRight size={12} className="opacity-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-[11px] text-gray-400 text-center py-8">
            Aucun événement pour ce filtre.
          </p>
        )}
      </div>
    </>
  );
}
