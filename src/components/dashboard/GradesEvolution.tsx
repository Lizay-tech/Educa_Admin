"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Trophy, Medal } from "lucide-react";

import { classesDataset } from "@/lib/datasets/classes";
import { schoolYearsDataset } from "@/lib/datasets/schoolYears";
import { classAveragesDataset } from "@/lib/datasets/classAverages";
import { useTranslation } from "@/lib/i18n/LanguageContext";

/* MOCK NOTES */
const notesData = [
  { name: "Sep", moyenne1: 55 },
  { name: "Oct", moyenne1: 60 },
  { name: "Nov", moyenne1: 58 },
  { name: "Déc", moyenne1: 65 },
  { name: "Jan", moyenne1: 67 },
  { name: "Fév", moyenne1: 70 },
];

export default function GradesEvolution() {
  const { t } = useTranslation();
  const [selectedClass, setSelectedClass] = useState(classesDataset[0].id);
  const [selectedYear, setSelectedYear] = useState(schoolYearsDataset[0].id);

  const students = classAveragesDataset[selectedClass] || [];
  const sortedStudents = [...students].sort((a, b) => b.average - a.average);

  const classMoyenne =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.average, 0) / students.length
        )
      : 0;

  /* ================= IMAGE SELON MOYENNE ================= */

  const getAverageImage = () => {
    if (classMoyenne >= 70) return "/excelent.png";
    if (classMoyenne >= 50) return "/moyen.png";
    return "/bas.png";
  };

  const firstValue = notesData[0].moyenne1;
  const progression = classMoyenne - firstValue;
  const isAlert = classMoyenne < 50;

  const niveau =
    classMoyenne >= 70
      ? t.grades.excellent
      : classMoyenne >= 50
      ? t.grades.average
      : t.grades.low;

  const niveauColor =
    classMoyenne >= 70
      ? "bg-green-50 text-green-700"
      : classMoyenne >= 50
      ? "bg-orange-50 text-orange-600"
      : "bg-red-50 text-red-600";

  const rankIcon = (index: number) => {
    if (index === 0) return <Trophy size={14} className="text-yellow-500" />;
    if (index === 1) return <Medal size={14} className="text-gray-400" />;
    if (index === 2) return <Medal size={14} className="text-amber-600" />;
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {t.grades.title}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {t.grades.subtitle}
          </p>
        </div>

        <div className="flex gap-1.5">
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

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2 py-1 text-[11px] rounded-lg border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-[#013486]"
          >
            {schoolYearsDataset.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= KPI + IMAGE + ANALYSE ================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* KPI + IMAGE */}
        <div className="relative bg-gradient-to-br from-[#013486]/10 to-white border border-[#013486]/20 rounded-xl overflow-hidden flex items-stretch">

          {/* IMAGE — collée bord à bord (tête en haut, pieds en bas) */}
          <div className="relative w-28 shrink-0 self-stretch">
            <Image
              src={getAverageImage()}
              alt="Niveau moyenne"
              fill
              className="object-cover object-center drop-shadow-md"
            />
          </div>

          {/* TEXTE KPI */}
          <div className="flex-1 py-3 px-3 flex flex-col justify-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
              {t.grades.currentAvg}
            </p>

            <div className="flex items-end gap-1 mt-0.5">
              <p
                className={`text-3xl font-extrabold ${
                  isAlert ? "text-red-600" : "text-[#013486]"
                }`}
              >
                {classMoyenne}
              </p>
              <span className="text-[11px] text-gray-400 mb-1">/100</span>
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <span
                className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${niveauColor}`}
              >
                {niveau}
              </span>

              <span
                className={`text-[11px] font-semibold ${
                  progression >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {progression >= 0 ? "+" : ""}
                {progression} pts
              </span>
            </div>
          </div>
        </div>

        {/* ANALYSE */}
        <div className="bg-[#F35403]/5 border border-[#F35403]/20 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#F35403] mb-1.5">
              {t.grades.autoAnalysis}
            </p>

            <p className="text-[12px] text-gray-700 leading-relaxed">
              {t.grades.classAvg}{" "}
              <span className="font-semibold">{classMoyenne}/100</span>.
              {classMoyenne >= 70 && (
                <> {t.grades.excellentMsg}</>
              )}
              {classMoyenne >= 50 && classMoyenne < 70 && (
                <> {t.grades.averageMsg}</>
              )}
              {classMoyenne < 50 && (
                <> {t.grades.lowMsg}</>
              )}
            </p>
          </div>

          {/* ALERT BOX */}
          {isAlert && (
            <div className="flex items-start gap-2 mt-2 bg-red-50 border border-red-200 rounded-lg px-2.5 py-2">
              <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-600 leading-snug">
                {t.grades.alertMsg}
              </p>
            </div>
          )}
        </div>

        {/* CLASSEMENT */}
        <div className="flex flex-col">
          <p className="text-[11px] font-semibold text-gray-700 mb-1.5">
            {t.grades.ranking} — {classesDataset.find((c) => c.id === selectedClass)?.name}
          </p>

          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-0.5">
            {sortedStudents.map((student, index) => (
              <div
                key={student.id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] transition ${
                  index < 3 ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-[10px] font-bold text-gray-400">
                    {index + 1}
                  </span>
                  {rankIcon(index)}
                  <span className="text-gray-800">{student.name}</span>
                </div>

                <span
                  className={`font-bold text-[12px] ${
                    student.average < 50
                      ? "text-red-500"
                      : student.average >= 80
                      ? "text-green-600"
                      : "text-gray-700"
                  }`}
                >
                  {student.average}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}