"use client";

import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { Calendar } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/* DATASETS */
import { presenceDataset } from "@/lib/datasets/presence";

/* COMPONENT */
import DailySchedule from "@/components/dashboard/DailySchedule";

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  /* ================= PRESENCE LOGIC ================= */

  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  const todayPresence = useMemo(() => {
    return (
      presenceDataset[formattedDate] || {
        totalStudents: 0,
        presents: 0,
        absents: 0,
        late: 0,
        teachers: 0,
      }
    );
  }, [formattedDate]);

  const presencePercentage =
    todayPresence.totalStudents > 0
      ? Math.round(
          (todayPresence.presents / todayPresence.totalStudents) * 100
        )
      : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">

      {/* ================= HORAIRE DU JOUR ================= */}
      <DailySchedule />

      {/* ================= PRESENCE SECTION ================= */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t.presence.title}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {t.presence.subtitle}
            </p>
          </div>

          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => {
              if (date) setSelectedDate(date);
            }}
            locale={fr}
            dateFormat="dd MMM yyyy"
            popperPlacement="bottom-end"
            customInput={
              <button className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#013486]/10 text-[#013486] rounded-full hover:bg-[#013486]/20 transition font-medium">
                <Calendar size={12} />
                {format(selectedDate, "dd MMM yyyy", { locale: fr })}
              </button>
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* DONUT */}
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: t.presence.present, value: presencePercentage },
                      { name: t.presence.absent, value: 100 - presencePercentage },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={62}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill="#013486" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">
                  {presencePercentage}%
                </span>
                <span className="text-[10px] text-gray-400">
                  {t.presence.presenceLabel}
                </span>
              </div>
            </div>

            {/* LEGEND */}
            <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#013486]" />
                {t.presence.present}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                {t.presence.absent}
              </div>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 gap-2">
            <PresenceCard label={t.presence.totalStudents} value={todayPresence.totalStudents} color="bg-gray-50" textColor="text-gray-900" />
            <PresenceCard label={t.presence.present} value={todayPresence.presents} color="bg-green-50" textColor="text-green-700" />
            <PresenceCard label={t.presence.absent} value={todayPresence.absents} color="bg-red-50" textColor="text-red-600" />
            <PresenceCard label={t.presence.late} value={todayPresence.late} color="bg-orange-50" textColor="text-orange-600" />
            <PresenceCard label={t.presence.teachers} value={todayPresence.teachers} color="bg-[#013486]/10" textColor="text-[#013486]" />

            <div className="bg-[#F35403]/5 border border-[#F35403]/20 rounded-lg p-2.5 flex items-center">
              <p className="text-[11px] text-gray-600 leading-tight">
                {todayPresence.presents}/{todayPresence.totalStudents} {t.presence.present}
                {todayPresence.absents > 0 && (
                  <span className="text-red-500 font-medium">
                    {" "}&bull; {todayPresence.absents} {t.presence.absences}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT CARD ================= */
function PresenceCard({
  label,
  value,
  color,
  textColor,
}: {
  label: string;
  value: number;
  color: string;
  textColor: string;
}) {
  return (
    <div className={`rounded-lg p-2.5 ${color} border border-gray-100`}>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={`text-base font-bold ${textColor} mt-0.5`}>
        {value}
      </p>
    </div>
  );
}
