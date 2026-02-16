"use client";

import { mockUser, mockSchool } from "@/lib/mockUser";
import { Headset, SlidersHorizontal, MapPin } from "lucide-react";
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import AcademicCalendarModal from "@/components/dashboard/AcademicCalendarModal";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function DashboardHeader() {
  const { t } = useTranslation();
  const firstName = mockUser.name.split(" ")[0];
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <>
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

          {/* RIGHT SECTION */}
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

            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#013486] bg-[#013486]/10 hover:bg-[#013486]/15 rounded-lg transition">
              <Headset size={14} />
              {t.dashboard.support}
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
    </>
  );
}