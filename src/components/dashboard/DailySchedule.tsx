"use client";

import { useState, useMemo } from "react";
import { Clock, MapPin, User, Coffee, UtensilsCrossed, BookOpen } from "lucide-react";
import { classesDataset } from "@/lib/datasets/classes";
import { schedulesDataset, DAYS, type DayKey } from "@/lib/datasets/schedules";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/* Jour actuel en français → clé */
const todayIndex = new Date().getDay();
const dayMap: Record<number, DayKey> = {
  1: "lundi",
  2: "mardi",
  3: "mercredi",
  4: "jeudi",
  5: "vendredi",
};
const defaultDay: DayKey = dayMap[todayIndex] || "lundi";

/* Couleurs des matières */
const subjectColors: Record<string, string> = {
  Mathématiques: "border-l-[#013486]",
  Français: "border-l-[#F35403]",
  Anglais: "border-l-purple-500",
  Physique: "border-l-cyan-500",
  Chimie: "border-l-emerald-500",
  "Sciences Naturelles": "border-l-green-500",
  Biologie: "border-l-green-500",
  Littérature: "border-l-rose-500",
  Philosophie: "border-l-amber-600",
  Histoire: "border-l-yellow-600",
  "Histoire-Géographie": "border-l-yellow-600",
  Géographie: "border-l-yellow-600",
  Informatique: "border-l-indigo-500",
  Créole: "border-l-orange-400",
  "Éducation Physique": "border-l-teal-500",
  "Éducation Civique": "border-l-sky-500",
  "Sciences Sociales": "border-l-amber-500",
  "Arts Plastiques": "border-l-pink-400",
  Musique: "border-l-violet-400",
};

export default function DailySchedule() {
  const { t } = useTranslation();
  const [selectedClass, setSelectedClass] = useState(classesDataset[0].id);
  const [selectedDay, setSelectedDay] = useState<DayKey>(defaultDay);

  const schedule = useMemo(() => {
    return schedulesDataset[selectedClass]?.[selectedDay] || [];
  }, [selectedClass, selectedDay]);

  const courseCount = schedule.filter((p) => p.type === "course").length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-[#013486]/10 p-1.5 rounded-lg">
              <BookOpen size={14} className="text-[#013486]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t.schedule.title}
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 ml-8">
            {courseCount} {t.schedule.courses} &bull;{" "}
            <span className="capitalize">
              {format(new Date(), "EEEE dd MMMM", { locale: fr })}
            </span>
          </p>
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-2 py-1 text-[11px] rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-[#013486]"
        >
          {classesDataset.map((classe) => (
            <option key={classe.id} value={classe.id}>
              {classe.name}
            </option>
          ))}
        </select>
      </div>

      {/* JOURS DE LA SEMAINE */}
      <div className="flex gap-1 mb-3">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition capitalize ${
              selectedDay === day
                ? "bg-[#013486] text-white shadow-sm"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* LISTE DES PÉRIODES */}
      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
        {schedule.length === 0 ? (
          <p className="text-[11px] text-gray-400 text-center py-8">
            {t.schedule.noSchedule}
          </p>
        ) : (
          schedule.map((period, idx) => {
            if (period.type === "break") {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-1.5 px-3"
                >
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Coffee size={10} />
                    {period.subject} &bull; {period.startTime} - {period.endTime}
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              );
            }

            if (period.type === "lunch") {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-1.5 px-3"
                >
                  <div className="flex-1 h-px bg-orange-200" />
                  <div className="flex items-center gap-1 text-[10px] text-orange-400 font-medium">
                    <UtensilsCrossed size={10} />
                    {period.subject} &bull; {period.startTime}
                  </div>
                  <div className="flex-1 h-px bg-orange-200" />
                </div>
              );
            }

            const borderColor =
              subjectColors[period.subject] || "border-l-gray-300";

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition p-2.5 border-l-[3px] ${borderColor}`}
              >
                {/* HEURE */}
                <div className="shrink-0 text-center w-12">
                  <p className="text-[11px] font-bold text-[#013486]">
                    {period.startTime}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {period.endTime}
                  </p>
                </div>

                {/* CONTENU */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-gray-900 truncate">
                    {period.subject}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-gray-500">
                      <User size={10} className="shrink-0" />
                      <span className="truncate">{period.teacher}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin size={10} className="shrink-0" />
                      {period.room}
                    </span>
                  </div>
                </div>

                {/* DURÉE */}
                <div className="shrink-0 flex items-center gap-1 text-[9px] text-gray-400 bg-white px-1.5 py-0.5 rounded-full border border-gray-100">
                  <Clock size={9} />
                  {t.schedule.duration}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
