"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { roleMenu, resolveKey } from "@/lib/roleConfig";
import { useSession } from "@/lib/SessionContext";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Search, Globe, LogOut, X } from "lucide-react";

const activeModules = ["subscription", "ai"];

type SidebarProps = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { session, logout } = useSession();
  const menuItems = roleMenu[session.user.role];
  const { t, locale, setLocale } = useTranslation();

  const toggleLang = () => setLocale(locale === "fr" ? "ht" : "fr");

  return (
    <aside
      className="
        w-64 h-full min-h-0 flex flex-col relative overflow-hidden
        text-white shadow-2xl
      "
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/menu_back.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0141a3]/90 via-[#012f75]/85 to-[#000f29]/95" />

      {/* ================= HEADER ================= */}
      <div className="px-5 py-6 shrink-0 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-wide">
            EDUCA
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition"
              aria-label={t.common.close}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex items-center bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
          <Search size={16} className="text-white/80" />
          <input
            type="text"
            placeholder={t.sidebar.search}
            className="bg-transparent outline-none text-sm ml-2 placeholder-white/60 w-full"
          />
        </div>
      </div>

      {/* ================= MENU ================= */}
      <div className="relative flex-1 min-h-0 z-10">
        <div className="h-full overflow-y-auto px-4 custom-scroll">
          <nav className="flex flex-col gap-1.5 py-4">
            {menuItems.map((item) => {
              if (item.module && !activeModules.includes(item.module)) {
                return null;
              }

              const isActive = pathname === item.path;
              const label = resolveKey(t, item.labelKey);

              const iconMap: Record<string, string> = {
                "menu.admin.dashboard": "/icon/dashboard.png",
                "menu.admin.users": "/icon/users.png",
                "menu.teacher.dashboard": "/icon/dashboard.png",
                "menu.student.dashboard": "/icon/dashboard.png",
              };
              const icon = iconMap[item.labelKey];

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? "bg-[#F35403] shadow-lg"
                        : "hover:bg-[#F35403] hover:shadow-md hover:scale-[1.02]"
                    }
                  `}
                >
                  {icon && (
                    <Image
                      src={icon}
                      alt=""
                      width={18}
                      height={18}
                      className="shrink-0 brightness-0 invert"
                    />
                  )}
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#000f29] to-transparent" />
      </div>

      {/* ================= FOOTER ================= */}
      <div className="px-5 py-6 border-t border-white/10 space-y-3 shrink-0 relative z-10">
        <button
          onClick={toggleLang}
          className="flex items-center gap-3 text-sm hover:bg-[#F35403] px-3 py-2 rounded-xl transition w-full"
        >
          <Globe size={16} />
          {t.sidebar.langLabel}
          <span className="ml-auto text-[10px] text-white/50 uppercase">
            {locale === "fr" ? "FR" : "KR"}
          </span>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-3 text-sm hover:bg-[#F35403] px-3 py-2 rounded-xl transition w-full"
        >
          <LogOut size={16} />
          {t.sidebar.logout}
        </button>

        <div className="text-xs text-white/60 pt-2">
          {t.sidebar.langCode}
        </div>
      </div>
    </aside>
  );
}
