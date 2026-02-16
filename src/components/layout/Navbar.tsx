"use client";

import { useState, useRef, useEffect } from "react";
import { mockUser } from "@/lib/mockUser";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  Menu,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

type NavbarProps = {
  onToggleSidebar?: () => void;
};

const notifications = [
  {
    id: 1,
    name: "Jean Pierre",
    message: "Nouvelle inscription d'un \u00e9tudiant...",
  },
  {
    id: 2,
    name: "Marie Claire",
    message: "Demande de validation d'\u00e9cole en attente...",
  },
  {
    id: 3,
    name: "Syst\u00e8me EDUCA",
    message: "Sauvegarde automatique effectu\u00e9e avec succ\u00e8s.",
  },
];

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { t } = useTranslation();
  const roleKey = mockUser.role.toLowerCase() as "admin" | "teacher" | "student";
  const currentRole = t.roles[roleKey];

  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setOpenProfile(false);
      }

      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setOpenNotif(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative h-14 sm:h-16 flex items-center px-3 sm:px-4 md:px-6 shadow-md">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/menu_back.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#013486]/90 via-[#013486]/75 to-[#013486]/60 backdrop-blur-[2px]" />

      <div className="relative z-10 flex items-center justify-between w-full gap-2">

        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-white hover:bg-white/10 transition shrink-0"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-white truncate">
              {t.nav.dashboard}
            </h2>
            <p className="text-[10px] sm:text-xs text-white/70 truncate">
              {currentRole.subtitle}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 sm:gap-3 md:gap-4 shrink-0">

          {/* NOTIFICATIONS */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setOpenNotif(!openNotif);
                setOpenProfile(false);
              }}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition"
            >
              <Bell size={18} className="text-white sm:w-5 sm:h-5" />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-0.5 text-[10px] sm:text-[11px] font-bold flex items-center justify-center bg-[#F35403] text-white rounded-full animate-pulse shadow-md">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown Notifications */}
            {openNotif && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-14 sm:top-auto sm:mt-3 w-auto sm:w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">

                {/* HEADER */}
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b bg-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {t.nav.notifications}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {notifications.length} {t.nav.newNotifs}
                  </span>
                </div>

                {/* LISTE */}
                <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 transition cursor-pointer border-b last:border-none group"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#013486]/10 text-[#013486] flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0">
                        {notif.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-[#013486] transition truncate">
                            {notif.name}
                          </p>
                          <span className="w-2 h-2 bg-[#F35403] rounded-full shrink-0"></span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                <div className="px-4 sm:px-5 py-3 bg-[#F35403]/10 text-center border-t">
                  <button className="text-sm font-medium text-[#F35403] hover:underline transition">
                    {t.nav.seeAllNotifs}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PROFILE */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setOpenProfile(!openProfile);
                setOpenNotif(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 px-1.5 sm:px-2 md:px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {mockUser.name.charAt(0)}
              </div>

              <div className="hidden md:block text-left min-w-0">
                <p className="text-sm font-medium text-white truncate max-w-[140px] lg:max-w-[180px]">
                  {mockUser.name}
                </p>
                <p className="text-xs text-white/70">
                  {currentRole.title}
                </p>
              </div>

              <ChevronDown
                size={14}
                className={`hidden sm:block text-white/70 transition-transform ${
                  openProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Profil */}
            {openProfile && (
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-14 sm:top-auto sm:mt-3 w-auto sm:w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">

                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#013486] text-white flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
                    {mockUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {mockUser.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {mockUser.email}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <Shield size={14} />
                      {t.nav.secureAccount}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm">
                    <Settings size={16} />
                    {t.nav.accountSettings}
                  </button>

                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition text-sm">
                    <LogOut size={16} />
                    {t.nav.logout}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
