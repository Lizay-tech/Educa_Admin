"use client";

import PageHeader from "@/components/shared/PageHeader";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function StudentProgressPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.student.progress.title}
        description={t.pages.student.progress.desc}
        icon={<TrendingUp size={20} />}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-[#013486]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={28} className="text-[#013486]" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{t.pages.student.progress.title}</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          {t.pages.comingSoon}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F35403]/10 text-[#F35403] text-xs font-medium rounded-full">
          {t.pages.underConstruction}
        </div>
      </div>
    </div>
  );
}
