"use client";

import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/* ================= MOCK DATA ================= */

const students = [
  {
    name: "Jean Dupont",
    email: "upicantel@gmail.com",
    id: "NS-01210",
    avatar: "https://i.pravatar.cc/40?img=1",
    online: true,
  },
  {
    name: "Marie Tertin",
    email: "marie@gmail.com",
    id: "NS-01222",
    avatar: "https://i.pravatar.cc/40?img=2",
    online: false,
  },
  {
    name: "Paul Francis",
    email: "paul@gmail.com",
    id: "NS-01241",
    avatar: "https://i.pravatar.cc/40?img=3",
    online: true,
  },
  {
    name: "Sandra Michel",
    email: "sandra@gmail.com",
    id: "NS-01297",
    avatar: "https://i.pravatar.cc/40?img=4",
    online: false,
  },
  {
    name: "Gérard Joseph",
    email: "gerard@gmail.com",
    id: "NS-01267",
    avatar: "https://i.pravatar.cc/40?img=5",
    online: true,
  },
];

const teachers = [
  {
    name: "Mme Laura Georges",
    role: "Terminale ST2",
    avatar: "https://i.pravatar.cc/40?img=6",
  },
  {
    name: "Prof. Jacques Laurent",
    role: "NS3 2023-2024",
    avatar: "https://i.pravatar.cc/40?img=7",
  },
  {
    name: "M. David Prince",
    role: "NS2 2023-2024",
    avatar: "https://i.pravatar.cc/40?img=8",
  },
  {
    name: "Meil Pierre",
    role: "NS1 2023-2024",
    avatar: "https://i.pravatar.cc/40?img=9",
  },
];

/* ================= COMPONENT ================= */

export default function AdminOverviewSection() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">

      {/* ================= ETUDIANTS ================= */}
      <CardContainer title={t.overview.students} action={t.stats.seeAll}>
        <div className="divide-y divide-gray-100">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded-lg transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-100"
                  />
                  {student.online && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-[1.5px] border-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    {student.name}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {student.email}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-medium bg-[#013486]/10 text-[#013486] px-2 py-0.5 rounded-full">
                {student.id}
              </span>
            </div>
          ))}
        </div>
      </CardContainer>

      {/* ================= TEACHERS ================= */}
      <CardContainer title={t.overview.teachers} action={t.stats.seeAll}>
        <div className="divide-y divide-gray-100">
          {teachers.map((teacher, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded-lg transition"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-100"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    {teacher.name}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {teacher.role}
                  </p>
                </div>
              </div>
              <button className="text-[11px] text-[#013486] font-medium hover:text-[#F35403] transition">
                {t.overview.profile}
              </button>
            </div>
          ))}
        </div>
      </CardContainer>

      {/* ================= STATISTIQUES ================= */}
      <div className="space-y-3 sm:space-y-4">
        <StatsCard
          title={t.overview.academicStats}
          stats={[
            { label: t.overview.weekEvals, value: 3, progress: 60 },
            { label: t.overview.lateEvals, value: -2, progress: 30 },
          ]}
        />
        <StatsCard
          title={t.overview.performanceTitle}
          stats={[
            { label: t.overview.weekEvals, value: 2, progress: 40 },
            { label: t.overview.successRate, value: 76, suffix: "%", progress: 76 },
          ]}
        />
      </div>

    </div>
  );
}

/* ================= CARD CONTAINER ================= */

function CardContainer({
  title,
  action,
  children,
}: {
  title: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-4">

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-800">
          {title}
        </h3>

        <button className="flex items-center gap-1 text-[11px] font-medium text-[#013486] hover:text-[#F35403] transition">
          {action}
          <ArrowRight size={12} />
        </button>
      </div>

      {children}
    </div>
  );
}

/* ================= STATS CARD ================= */

function StatsCard({
  title,
  stats,
}: {
  title: string;
  stats: {
    label: string;
    value: number;
    suffix?: string;
    progress: number;
  }[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-4">

      <h3 className="text-xs font-semibold text-gray-800 mb-3">
        {title}
      </h3>

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-500">
                {stat.label}
              </span>
              <span
                className={`text-xs font-semibold ${
                  stat.value >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {stat.value > 0 && "+"}
                {stat.value}
                {stat.suffix}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-gradient-to-r from-[#013486] to-[#F35403] rounded-full transition-all duration-500"
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
