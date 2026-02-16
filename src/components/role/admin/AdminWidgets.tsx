"use client";

import {
  GraduationCap,
  LayoutGrid,
  Users,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

import { mockStats } from "@/lib/mockUser";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AdminAnalytics from "@/components/dashboard/AdminAnalytics";
import GradesEvolution from "@/components/dashboard/GradesEvolution";
import AdminOverviewSection from "@/components/dashboard/AdminOverviewSection";

export default function AdminWidgets() {
  const { t } = useTranslation();

  const stats = [
    {
      label: t.stats.totalStudents,
      value: mockStats.totalEleves.value,
      variation: mockStats.totalEleves.variation,
      icon: <GraduationCap size={18} />,
      iconBg: "bg-[#013486]/10",
      accent: "text-[#013486]",
    },
    {
      label: t.stats.totalClasses,
      value: mockStats.totalClasses.value,
      variation: mockStats.totalClasses.variation,
      icon: <LayoutGrid size={18} />,
      iconBg: "bg-[#F35403]/10",
      accent: "text-[#F35403]",
    },
    {
      label: t.stats.totalUsers,
      value: mockStats.totalUtilisateurs.value,
      variation: mockStats.totalUtilisateurs.variation,
      icon: <Users size={18} />,
      iconBg: "bg-[#43a047]/10",
      accent: "text-[#43a047]",
    },
    {
      label: t.stats.evaluations,
      value: mockStats.totalEvaluations.value,
      variation: null,
      icon: <ClipboardCheck size={18} />,
      iconBg: "bg-[#7c3aed]/10",
      accent: "text-[#7c3aed]",
      action: t.stats.seeAll,
    },
  ];

  return (
    <div className="space-y-5">

      <DashboardHeader />

      {/* KPI */}
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
                    {stat.value.toLocaleString("fr-FR")}
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

      <AdminAnalytics />
      <GradesEvolution />
      <AdminOverviewSection />
    </div>
  );
}
