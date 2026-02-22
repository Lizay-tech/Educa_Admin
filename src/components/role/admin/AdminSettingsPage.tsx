"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  Settings, Building2, Palette, LogIn, FileText, Mail,
  LayoutGrid, Shield, Zap, Upload, X, CheckCircle, Image,
  Globe, Eye, ToggleLeft, ToggleRight, Clock, User,
  Trash2, RotateCcw, QrCode, Stamp, PenLine, MapPin,
  Phone, AtSign, Link, Sun, Moon, Monitor,
} from "lucide-react";

/* ─── type alias ─── */
type SP = ReturnType<typeof useTranslation>["t"]["settingsPage"];

/* ─── helpers ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[70] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up">
      <CheckCircle size={18} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose}><X size={16} /></button>
    </div>
  );
}

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function UploadZone({ label, help, formats, onUpload }: {
  label: string; help: string; formats: string; onUpload: () => void;
}) {
  return (
    <button onClick={onUpload}
      className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#013486]/40 hover:bg-[#013486]/5 transition group">
      <div className="w-12 h-12 bg-[#013486]/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#013486]/20 transition">
        <Upload size={20} className="text-[#013486]" />
      </div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{help}</p>
      <p className="text-[10px] text-gray-400 mt-1">{formats}</p>
    </button>
  );
}

function ToggleRow({ label, desc, enabled, onToggle, icon }: {
  label: string; desc?: string; enabled: boolean; onToggle: () => void; icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        {icon && <span className="text-[#013486]">{icon}</span>}
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {desc && <p className="text-xs text-gray-500">{desc}</p>}
        </div>
      </div>
      <button onClick={onToggle} className="p-1">
        {enabled
          ? <ToggleRight size={28} className="text-green-500" />
          : <ToggleLeft size={28} className="text-gray-300" />}
      </button>
    </div>
  );
}

function ColorInput({ label, help, value, onChange }: {
  label: string; help?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {help && <p className="text-xs text-gray-400">{help}</p>}
      </div>
      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{value}</span>
    </div>
  );
}

/* ─── mock data ─── */
const mockModules = [
  { key: "dashboard", label: "Dashboard", enabled: true },
  { key: "users", label: "Utilisateurs", enabled: true },
  { key: "students", label: "Élèves", enabled: true },
  { key: "teachers", label: "Enseignants", enabled: true },
  { key: "parents", label: "Parents", enabled: true },
  { key: "staff", label: "Personnel", enabled: true },
  { key: "classes", label: "Classes", enabled: true },
  { key: "subjects", label: "Matières", enabled: true },
  { key: "schedule", label: "Emploi du Temps", enabled: true },
  { key: "schoolYear", label: "Année Scolaire", enabled: true },
  { key: "exams", label: "Examens & Notes", enabled: true },
  { key: "discipline", label: "Discipline", enabled: true },
  { key: "performance", label: "Suivi & Performance", enabled: true },
  { key: "communication", label: "Communication", enabled: true },
  { key: "registrar", label: "Registrariat", enabled: true },
  { key: "services", label: "Services & Abonnement", enabled: false },
  { key: "ai", label: "Intelligence Artificielle", enabled: false },
  { key: "support", label: "Support & Assistance", enabled: true },
  { key: "security", label: "Sécurité", enabled: true },
];

const mockHistory = [
  { date: "2025-02-15", user: "ESAIE GUERSON LARA", action: "Logo modifié", detail: "Nouveau logo téléversé" },
  { date: "2025-02-10", user: "ESAIE GUERSON LARA", action: "Couleurs modifiées", detail: "Couleur principale → #013486" },
  { date: "2025-01-28", user: "ESAIE GUERSON LARA", action: "Nom modifié", detail: "Lycée Jacques Roumain" },
  { date: "2025-01-15", user: "ESAIE GUERSON LARA", action: "Slogan ajouté", detail: "Excellence • Discipline • Réussite" },
  { date: "2025-01-05", user: "ESAIE GUERSON LARA", action: "Configuration initiale", detail: "Paramètres de base configurés" },
];

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const c: SP = t.settingsPage;

  const tabs = [
    { key: "identity", label: c.tabIdentity, icon: <Building2 size={15} /> },
    { key: "colors", label: c.tabColors, icon: <Palette size={15} /> },
    { key: "login", label: c.tabLogin, icon: <LogIn size={15} /> },
    { key: "documents", label: c.tabDocuments, icon: <FileText size={15} /> },
    { key: "emails", label: c.tabEmails, icon: <Mail size={15} /> },
    { key: "modules", label: c.tabModules, icon: <LayoutGrid size={15} /> },
    { key: "permissions", label: c.tabPermissions, icon: <Shield size={15} /> },
    { key: "advanced", label: c.tabAdvanced, icon: <Zap size={15} /> },
  ];

  const [activeTab, setActiveTab] = useState("identity");
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.settings.title}
        description={t.pages.admin.settings.desc}
        icon={<Settings size={20} />}
      />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition
              ${activeTab === tab.key ? "bg-[#013486] text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "identity" && <IdentityTab c={c} showToast={showToast} />}
      {activeTab === "colors" && <ColorsTab c={c} showToast={showToast} />}
      {activeTab === "login" && <LoginTab c={c} showToast={showToast} />}
      {activeTab === "documents" && <DocumentsTab c={c} showToast={showToast} />}
      {activeTab === "emails" && <EmailsTab c={c} showToast={showToast} />}
      {activeTab === "modules" && <ModulesTab c={c} showToast={showToast} />}
      {activeTab === "permissions" && <PermissionsTab c={c} showToast={showToast} />}
      {activeTab === "advanced" && <AdvancedTab c={c} showToast={showToast} />}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ═══════════════════════ TAB 1: IDENTITY ═══════════════════════ */
function IdentityTab({ c, showToast }: { c: SP; showToast: (m: string) => void }) {
  const [schoolName, setSchoolName] = useState("Lycée Jacques Roumain");

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.identityTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.identityDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* School Name */}
        <SectionCard title={c.schoolName}>
          <div>
            <input value={schoolName} onChange={e => setSchoolName(e.target.value)}
              placeholder={c.schoolNamePlaceholder}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
            <p className="text-xs text-gray-400 mt-2">{c.schoolNameHelp}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">{c.displayedIn}</p>
            <div className="flex flex-wrap gap-1.5">
              {[c.topBar, c.loginPage, c.autoEmails, c.officialDocs].map((place, i) => (
                <span key={i} className="text-xs bg-[#013486]/10 text-[#013486] px-2.5 py-1 rounded-full">{place}</span>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Preview */}
        <SectionCard title={c.previewHeader}>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#013486]/5 via-white to-white px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#013486]/10 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="text-[#013486]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#013486]">{schoolName || "EDUCA"}</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={10} /> Port-au-Prince</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex gap-2">
                {["Dashboard", "Élèves", "Classes"].map((item, i) => (
                  <span key={i} className={`text-xs px-3 py-1.5 rounded-lg ${i === 0 ? "bg-[#013486] text-white" : "bg-gray-100 text-gray-500"}`}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Logo */}
        <SectionCard title={c.schoolLogo}>
          <p className="text-xs text-gray-400">{c.schoolLogoHelp}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">{c.lightVersion}</p>
              <UploadZone label={c.uploadLogo} help={c.dragOrClick} formats={c.acceptedFormats} onUpload={() => showToast(c.logoUploaded)} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">{c.darkVersion}</p>
              <UploadZone label={c.uploadLogo} help={c.dragOrClick} formats={c.acceptedFormats} onUpload={() => showToast(c.logoUploaded)} />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
              <Building2 size={24} className="text-[#013486]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{c.currentLogo}</p>
              <p className="text-xs text-gray-400">logo-ljr.png — 128×128px</p>
            </div>
            <button className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <Trash2 size={12} /> {c.removeLogo}
            </button>
          </div>
        </SectionCard>

        {/* Favicon */}
        <SectionCard title={c.favicon}>
          <p className="text-xs text-gray-400">{c.faviconHelp}</p>
          <UploadZone label={c.uploadFavicon} help={c.dragOrClick} formats="PNG, ICO — 32×32px" onUpload={() => showToast(c.faviconUploaded)} />
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-[#013486] rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">LJR</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">favicon.ico</p>
              <p className="text-xs text-gray-400">32×32px</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-2">
        <button onClick={() => showToast(c.saved)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 2: COLORS & THEME ═══════════════════════ */
function ColorsTab({ c, showToast }: { c: SP; showToast: (m: string) => void }) {
  const [colors, setColors] = useState({
    primary: "#013486",
    secondary: "#F35403",
    button: "#013486",
    sidebar: "#0F172A",
    sidebarText: "#FFFFFF",
  });
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "auto">("light");

  const updateColor = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.colorsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.colorsDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Color inputs */}
        <SectionCard title={c.primaryColor}>
          <div className="space-y-4">
            <ColorInput label={c.primaryColor} help={c.primaryColorHelp} value={colors.primary} onChange={v => updateColor("primary", v)} />
            <ColorInput label={c.secondaryColor} help={c.secondaryColorHelp} value={colors.secondary} onChange={v => updateColor("secondary", v)} />
            <ColorInput label={c.buttonColor} value={colors.button} onChange={v => updateColor("button", v)} />
            <ColorInput label={c.sidebarColor} value={colors.sidebar} onChange={v => updateColor("sidebar", v)} />
            <ColorInput label={c.sidebarTextColor} value={colors.sidebarText} onChange={v => updateColor("sidebarText", v)} />
          </div>
          <button onClick={() => {
            setColors({ primary: "#013486", secondary: "#F35403", button: "#013486", sidebar: "#0F172A", sidebarText: "#FFFFFF" });
            showToast(c.colorsReset);
          }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#013486]">
            <RotateCcw size={12} /> {c.resetColors}
          </button>
        </SectionCard>

        {/* Preview */}
        <div className="space-y-4">
          <SectionCard title={c.colorPreview}>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {/* Mini sidebar preview */}
              <div className="flex h-48">
                <div className="w-16 flex flex-col items-center gap-2 py-3" style={{ backgroundColor: colors.sidebar }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                    <Building2 size={14} style={{ color: colors.sidebarText }} />
                  </div>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-1.5 rounded-full opacity-40" style={{ backgroundColor: colors.sidebarText }} />
                  ))}
                </div>
                <div className="flex-1 bg-gray-50 p-3 space-y-2">
                  <div className="h-8 rounded-lg flex items-center px-3" style={{ backgroundColor: `${colors.primary}10` }}>
                    <div className="w-20 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: colors.primary }}>Button 1</button>
                    <button className="px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: colors.secondary }}>Button 2</button>
                    <button className="px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: colors.button }}>Button 3</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[colors.primary, colors.secondary, colors.button].map((col, i) => (
                      <div key={i} className="h-12 rounded-lg opacity-20" style={{ backgroundColor: col }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Theme mode */}
          <SectionCard title={c.themeMode}>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "light" as const, label: c.lightMode, desc: c.lightModeDesc, icon: <Sun size={18} /> },
                { key: "dark" as const, label: c.darkMode, desc: c.darkModeDesc, icon: <Moon size={18} /> },
                { key: "auto" as const, label: c.autoMode, desc: c.autoModeDesc, icon: <Monitor size={18} /> },
              ].map(mode => (
                <button key={mode.key} onClick={() => setThemeMode(mode.key)}
                  className={`p-3 rounded-xl border-2 text-center transition ${themeMode === mode.key
                    ? "border-[#013486] bg-[#013486]/5"
                    : "border-gray-200 hover:border-gray-300"}`}>
                  <div className={`mx-auto mb-2 ${themeMode === mode.key ? "text-[#013486]" : "text-gray-400"}`}>{mode.icon}</div>
                  <p className={`text-xs font-semibold ${themeMode === mode.key ? "text-[#013486]" : "text-gray-600"}`}>{mode.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{mode.desc}</p>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => showToast(c.saved)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 3: LOGIN SCREEN ═══════════════════════ */
function LoginTab({ c, showToast }: { c: SP; showToast: (m: string) => void }) {
  const [welcomeMsg, setWelcomeMsg] = useState("Bienvenue sur le portail scolaire du Lycée Jacques Roumain");
  const [slogan, setSlogan] = useState("Excellence • Discipline • Réussite");
  const [showName, setShowName] = useState(true);
  const [showSlogan, setShowSlogan] = useState(true);

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.loginTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.loginDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Form */}
        <div className="space-y-4">
          <SectionCard title={c.loginLogo}>
            <UploadZone label={c.uploadLogo} help={c.dragOrClick} formats={c.acceptedFormats} onUpload={() => showToast(c.logoUploaded)} />
          </SectionCard>

          <SectionCard title={c.loginBackground}>
            <UploadZone label={c.uploadBackground} help={c.dragOrClick} formats="PNG, JPG — 1920×1080px" onUpload={() => showToast(c.logoUploaded)} />
          </SectionCard>

          <SectionCard title={c.welcomeMessage}>
            <input value={welcomeMsg} onChange={e => setWelcomeMsg(e.target.value)}
              placeholder={c.welcomeMessagePlaceholder}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
          </SectionCard>

          <SectionCard title={c.schoolSlogan}>
            <input value={slogan} onChange={e => setSlogan(e.target.value)}
              placeholder={c.schoolSloganPlaceholder}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
          </SectionCard>

          <SectionCard title="Options">
            <ToggleRow label={c.showSchoolName} enabled={showName} onToggle={() => setShowName(!showName)} icon={<Building2 size={14} />} />
            <ToggleRow label={c.showSlogan} enabled={showSlogan} onToggle={() => setShowSlogan(!showSlogan)} icon={<Eye size={14} />} />
          </SectionCard>
        </div>

        {/* Preview */}
        <SectionCard title={c.loginPreview}>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gradient-to-br from-[#013486] to-[#0148c2] p-6 min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Building2 size={32} className="text-white" />
            </div>
            {showName && <h2 className="text-lg font-bold text-white mb-1">Lycée Jacques Roumain</h2>}
            {showSlogan && <p className="text-xs text-white/70 mb-6">{slogan}</p>}
            <div className="w-full max-w-xs space-y-3">
              <p className="text-sm text-white/90 mb-4">{welcomeMsg}</p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5">
                <p className="text-xs text-white/50 text-left">Email</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5">
                <p className="text-xs text-white/50 text-left">Mot de passe</p>
              </div>
              <div className="bg-white rounded-lg px-4 py-2.5 text-center">
                <p className="text-sm font-semibold text-[#013486]">Se connecter</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => showToast(c.saved)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 4: DOCUMENTS ═══════════════════════ */
function DocumentsTab({ c, showToast }: { c: SP; showToast: (m: string) => void }) {
  const [docSettings, setDocSettings] = useState({
    logoOnDocs: true, signature: true, watermark: false, stamp: true, qrCode: true,
  });

  const toggleDoc = (key: keyof typeof docSettings) => {
    setDocSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const docTypes = [
    { label: c.certificates, enabled: true },
    { label: c.reportCards, enabled: true },
    { label: c.attestations, enabled: true },
    { label: c.studentCards, enabled: true },
    { label: c.invoices, enabled: false },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.documentsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.documentsDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Settings */}
        <div className="space-y-4">
          <SectionCard title={c.logoOnDocs}>
            <ToggleRow label={c.logoOnDocs} desc={c.schoolLogoHelp} enabled={docSettings.logoOnDocs} onToggle={() => toggleDoc("logoOnDocs")} icon={<Image size={14} />} />
          </SectionCard>

          <SectionCard title={c.directorSignature}>
            <ToggleRow label={c.directorSignature} enabled={docSettings.signature} onToggle={() => toggleDoc("signature")} icon={<PenLine size={14} />} />
            <UploadZone label={c.uploadSignature} help={c.dragOrClick} formats="PNG (transparent) — 300×100px" onUpload={() => showToast(c.logoUploaded)} />
          </SectionCard>

          <SectionCard title={c.officialWatermark}>
            <ToggleRow label={c.officialWatermark} enabled={docSettings.watermark} onToggle={() => toggleDoc("watermark")} icon={<Eye size={14} />} />
          </SectionCard>

          <SectionCard title={c.digitalStamp}>
            <ToggleRow label={c.digitalStamp} enabled={docSettings.stamp} onToggle={() => toggleDoc("stamp")} icon={<Stamp size={14} />} />
            <UploadZone label={c.uploadStamp} help={c.dragOrClick} formats="PNG (transparent) — 200×200px" onUpload={() => showToast(c.logoUploaded)} />
          </SectionCard>

          <SectionCard title={c.qrVerification}>
            <ToggleRow label={c.qrVerification} desc={c.qrHelp} enabled={docSettings.qrCode} onToggle={() => toggleDoc("qrCode")} icon={<QrCode size={14} />} />
          </SectionCard>
        </div>

        {/* Preview & applies to */}
        <div className="space-y-4">
          <SectionCard title={c.docPreview}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 min-h-[300px] relative">
              {/* Watermark */}
              {docSettings.watermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <span className="text-6xl font-bold text-gray-900 rotate-[-30deg]">OFFICIEL</span>
                </div>
              )}
              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                  {docSettings.logoOnDocs && (
                    <div className="w-12 h-12 bg-[#013486]/10 rounded-xl flex items-center justify-center">
                      <Building2 size={20} className="text-[#013486]" />
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#013486]">Lycée Jacques Roumain</p>
                    <p className="text-[10px] text-gray-400">Port-au-Prince, Haïti</p>
                  </div>
                </div>
                {/* Body */}
                <div className="text-center mb-6">
                  <h3 className="text-base font-bold text-gray-900">CERTIFICAT DE SCOLARITÉ</h3>
                  <p className="text-xs text-gray-500 mt-2">Année scolaire 2024-2025</p>
                </div>
                <div className="space-y-1 mb-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-2 bg-gray-100 rounded-full" style={{ width: `${90 - i * 15}%` }} />)}
                </div>
                {/* Footer */}
                <div className="flex items-end justify-between mt-8 pt-3 border-t border-gray-100">
                  {docSettings.signature && (
                    <div className="text-center">
                      <div className="w-20 h-8 border-b border-gray-300 mb-1" />
                      <p className="text-[9px] text-gray-400">Le Directeur</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {docSettings.stamp && (
                      <div className="w-10 h-10 rounded-full border-2 border-[#013486]/30 flex items-center justify-center">
                        <Stamp size={12} className="text-[#013486]/40" />
                      </div>
                    )}
                    {docSettings.qrCode && (
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <QrCode size={14} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={c.appliesTo}>
            <div className="space-y-2">
              {docTypes.map((doc, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{doc.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doc.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {doc.enabled ? c.enabledOnDoc : "—"}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => showToast(c.saved)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 5: EMAILS & NOTIFICATIONS ═══════════════════════ */
function EmailsTab({ c, showToast }: { c: SP; showToast: (m: string) => void }) {
  const [emailSettings, setEmailSettings] = useState({
    schoolName: "Lycée Jacques Roumain",
    signature: "La Direction du Lycée Jacques Roumain",
    address: "15, Rue Capois, Port-au-Prince",
    phone: "+509 2222-3333",
    email: "contact@ljr.edu.ht",
    website: "www.ljr.edu.ht",
    showLogo: true,
  });

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.emailsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.emailsDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Form */}
        <div className="space-y-4">
          <SectionCard title={c.emailSchoolName}>
            <input value={emailSettings.schoolName} onChange={e => setEmailSettings(prev => ({ ...prev, schoolName: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
          </SectionCard>

          <SectionCard title={c.emailLogo}>
            <ToggleRow label={c.emailLogo} enabled={emailSettings.showLogo}
              onToggle={() => setEmailSettings(prev => ({ ...prev, showLogo: !prev.showLogo }))}
              icon={<Image size={14} />} />
          </SectionCard>

          <SectionCard title={c.emailSignature}>
            <input value={emailSettings.signature} onChange={e => setEmailSettings(prev => ({ ...prev, signature: e.target.value }))}
              placeholder={c.emailSignaturePlaceholder}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
          </SectionCard>

          <SectionCard title={c.schoolAddress}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400 shrink-0" />
                <input value={emailSettings.address} onChange={e => setEmailSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder={c.schoolAddressPlaceholder}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <input value={emailSettings.phone} onChange={e => setEmailSettings(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={c.schoolPhonePlaceholder}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div className="flex items-center gap-2">
                <AtSign size={14} className="text-gray-400 shrink-0" />
                <input value={emailSettings.email} onChange={e => setEmailSettings(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={c.schoolEmailPlaceholder}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
              <div className="flex items-center gap-2">
                <Link size={14} className="text-gray-400 shrink-0" />
                <input value={emailSettings.website} onChange={e => setEmailSettings(prev => ({ ...prev, website: e.target.value }))}
                  placeholder={c.schoolWebsitePlaceholder}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Email Preview */}
        <SectionCard title={c.emailPreview}>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            {/* Email header bar */}
            <div className="bg-[#013486] px-5 py-4 text-center">
              {emailSettings.showLogo && (
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Building2 size={20} className="text-white" />
                </div>
              )}
              <h3 className="text-sm font-bold text-white">{emailSettings.schoolName}</h3>
            </div>
            {/* Email body */}
            <div className="p-5 bg-white space-y-3">
              <p className="text-sm text-gray-700">Cher parent,</p>
              <div className="space-y-1">
                {[1, 2, 3].map(i => <div key={i} className="h-2 bg-gray-100 rounded-full" style={{ width: `${95 - i * 10}%` }} />)}
              </div>
              <p className="text-sm text-gray-700 mt-4">Cordialement,</p>
              <p className="text-sm font-medium text-[#013486]">{emailSettings.signature}</p>
            </div>
            {/* Email footer */}
            <div className="bg-gray-50 px-5 py-3 text-center border-t border-gray-100">
              <p className="text-[10px] text-gray-400">{emailSettings.address}</p>
              <p className="text-[10px] text-gray-400">{emailSettings.phone} | {emailSettings.email}</p>
              <p className="text-[10px] text-[#013486]">{emailSettings.website}</p>
            </div>
          </div>
          <button onClick={() => showToast(c.emailSent)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm border border-[#013486] text-[#013486] rounded-lg hover:bg-[#013486]/5 mt-2">
            <Mail size={14} /> {c.testEmail}
          </button>
        </SectionCard>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => showToast(c.saved)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 6: MODULES ═══════════════════════ */
function ModulesTab({ c, showToast }: { c: SP; showToast: (m: string) => void }) {
  const [modules, setModules] = useState(mockModules);

  const toggleModule = (key: string) => {
    setModules(prev => prev.map(m => m.key === key ? { ...m, enabled: !m.enabled } : m));
  };

  const enabledCount = modules.filter(m => m.enabled).length;
  const disabledCount = modules.filter(m => !m.enabled).length;

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.modulesTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.modulesDesc}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <ToggleRight size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{enabledCount}</p>
            <p className="text-xs text-gray-500">{c.visibleModules}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <ToggleLeft size={18} className="text-gray-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{disabledCount}</p>
            <p className="text-xs text-gray-500">{c.hiddenModules}</p>
          </div>
        </div>
      </div>

      {/* Module list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{c.moduleName}</h3>
          <span className="text-xs text-gray-400">{c.moduleStatus}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {modules.map(mod => (
            <div key={mod.key} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${mod.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm text-gray-700">{mod.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${mod.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {mod.enabled ? c.moduleEnabled : c.moduleDisabled}
                </span>
                <button onClick={() => toggleModule(mod.key)} className="p-0.5">
                  {mod.enabled
                    ? <ToggleRight size={24} className="text-green-500" />
                    : <ToggleLeft size={24} className="text-gray-300" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => showToast(c.saved)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 7: PERMISSIONS ═══════════════════════ */
function PermissionsTab({ c, showToast }: { c: SP; showToast: (m: string) => void }) {
  const [permissions, setPermissions] = useState([
    { role: c.mainAdmin, branding: "edit" as const, colors: "edit" as const, docs: "edit" as const, emails: "edit" as const, modules: "edit" as const },
    { role: c.direction, branding: "edit" as const, colors: "edit" as const, docs: "view" as const, emails: "view" as const, modules: "none" as const },
    { role: c.secretary, branding: "view" as const, colors: "none" as const, docs: "view" as const, emails: "view" as const, modules: "none" as const },
  ]);

  const levelColors = {
    edit: "bg-green-100 text-green-700",
    view: "bg-blue-100 text-blue-700",
    none: "bg-gray-100 text-gray-500",
  };
  const levelLabels = { edit: c.canModify, view: c.viewOnly, none: c.noAccess };
  const levels = ["edit", "view", "none"] as const;

  const cyclePerm = (rowIdx: number, field: "branding" | "colors" | "docs" | "emails" | "modules") => {
    setPermissions(prev => prev.map((row, i) => {
      if (i !== rowIdx) return row;
      const current = row[field];
      const nextIdx = (levels.indexOf(current) + 1) % levels.length;
      return { ...row, [field]: levels[nextIdx] };
    }));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.permissionsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.permissionsDesc}</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-3">{c.permRole}</th>
                <th className="text-center px-4 py-3">{c.permBranding}</th>
                <th className="text-center px-4 py-3">{c.permColors}</th>
                <th className="text-center px-4 py-3">{c.permDocs}</th>
                <th className="text-center px-4 py-3">{c.permEmails}</th>
                <th className="text-center px-4 py-3">{c.permModules}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {permissions.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#013486]/10 rounded-lg flex items-center justify-center">
                        <User size={14} className="text-[#013486]" />
                      </div>
                      <span className="font-medium text-gray-900">{row.role}</span>
                    </div>
                  </td>
                  {(["branding", "colors", "docs", "emails", "modules"] as const).map(field => (
                    <td key={field} className="px-4 py-3 text-center">
                      <button onClick={() => cyclePerm(i, field)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColors[row[field]]}`}>
                        {levelLabels[row[field]]}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#013486]/5 rounded-xl p-4 border border-[#013486]/10">
        <p className="text-xs text-[#013486]">
          <Shield size={12} className="inline mr-1" />
          Cliquez sur un niveau d&apos;accès pour le modifier. Les changements seront appliqués après enregistrement.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => showToast(c.permSaved)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 8: ADVANCED ═══════════════════════ */
function AdvancedTab({ c, showToast }: { c: SP; showToast: (m: string) => void }) {
  const [subdomain, setSubdomain] = useState("lycee-jr");
  const [features, setFeatures] = useState({
    multiThemes: false, whiteLabel: false, multiSchool: false, autoBackup: true,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.advancedTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.advancedDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Features */}
        <div className="space-y-4">
          <SectionCard title={c.customSubdomain}>
            <p className="text-xs text-gray-400">{c.subdomainHelp}</p>
            <div className="flex items-center gap-2">
              <input value={subdomain} onChange={e => setSubdomain(e.target.value)}
                placeholder={c.subdomainPlaceholder}
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              <span className="text-sm text-gray-400">.educa.ht</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-[#013486]/5 rounded-lg">
              <Globe size={14} className="text-[#013486]" />
              <span className="text-xs text-[#013486] font-medium">{subdomain}.educa.ht</span>
            </div>
          </SectionCard>

          <SectionCard title="Options">
            <ToggleRow label={c.multiThemes} desc={c.multiThemesHelp} enabled={features.multiThemes} onToggle={() => toggleFeature("multiThemes")} icon={<Palette size={14} />} />
            <ToggleRow label={c.whiteLabel} desc={c.whiteLabelHelp} enabled={features.whiteLabel} onToggle={() => toggleFeature("whiteLabel")} icon={<Eye size={14} />} />
            <ToggleRow label={c.multiSchool} desc={c.multiSchoolHelp} enabled={features.multiSchool} onToggle={() => toggleFeature("multiSchool")} icon={<Building2 size={14} />} />
            <ToggleRow label={c.autoBackup} desc={c.autoBackupHelp} enabled={features.autoBackup} onToggle={() => toggleFeature("autoBackup")} icon={<RotateCcw size={14} />} />
          </SectionCard>
        </div>

        {/* History */}
        <SectionCard title={c.changeHistory}>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-3 py-2">{c.changeDate}</th>
                  <th className="text-left px-3 py-2">{c.changeUser}</th>
                  <th className="text-left px-3 py-2">{c.changeAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockHistory.map((entry, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={10} /> {entry.date}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{entry.user}</td>
                    <td className="px-3 py-2.5">
                      <p className="text-xs font-medium text-gray-900">{entry.action}</p>
                      <p className="text-[10px] text-gray-400">{entry.detail}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => showToast(c.saved)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}
