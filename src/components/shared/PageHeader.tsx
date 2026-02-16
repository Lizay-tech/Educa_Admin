"use client";

import { usePathname } from "next/navigation";

type PageHeaderProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export default function PageHeader({ title, description, icon }: PageHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="relative bg-gradient-to-r from-[#013486]/5 via-white to-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#013486] rounded-l-xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="bg-[#013486]/10 p-2.5 rounded-xl text-[#013486]">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-[#013486] tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400">
          {segments.map((seg, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              <span className={i === segments.length - 1 ? "text-[#013486] font-semibold capitalize" : "capitalize"}>
                {decodeURIComponent(seg)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
