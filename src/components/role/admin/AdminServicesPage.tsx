"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  CreditCard, Eye, Package, Receipt, ArrowUpCircle, Bell,
  Zap, CheckCircle, X, Crown, Star, Shield, MessageSquare,
  Smartphone, Fingerprint, Wifi, Brain, Headset, GraduationCap,
  ToggleLeft, ToggleRight, Download, Clock, AlertTriangle,
  ChevronRight, DollarSign, Check, Gift, Tag, Sparkles,
  Users, Database, TrendingUp,
} from "lucide-react";

/* ─── type alias ─── */
type SV = ReturnType<typeof useTranslation>["t"]["servicesPage"];

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

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function SectionCard({ title, desc, children, action }: {
  title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
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
        {enabled ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} className="text-gray-300" />}
      </button>
    </div>
  );
}

/* ─── mock data ─── */
const mockInvoices = [
  { id: "INV-2025-006", date: "2025-02-01", amount: 15000, status: "pending" },
  { id: "INV-2025-005", date: "2025-01-01", amount: 15000, status: "paid" },
  { id: "INV-2025-004", date: "2024-12-01", amount: 15000, status: "paid" },
  { id: "INV-2025-003", date: "2024-11-01", amount: 15000, status: "paid" },
  { id: "INV-2025-002", date: "2024-10-01", amount: 15000, status: "paid" },
  { id: "INV-2025-001", date: "2024-09-01", amount: 15000, status: "paid" },
];

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function AdminServicesPage() {
  const { t } = useTranslation();
  const c: SV = t.servicesPage;

  const tabs = [
    { key: "overview", label: c.tabOverview, icon: <Eye size={15} /> },
    { key: "plans", label: c.tabPlans, icon: <Package size={15} /> },
    { key: "services", label: c.tabServices, icon: <Zap size={15} /> },
    { key: "billing", label: c.tabBilling, icon: <Receipt size={15} /> },
    { key: "upgrade", label: c.tabUpgrade, icon: <ArrowUpCircle size={15} /> },
    { key: "notifications", label: c.tabNotifications, icon: <Bell size={15} /> },
    { key: "advanced", label: c.tabAdvanced, icon: <Sparkles size={15} /> },
  ];

  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t.pages.admin.services.title}
        description={t.pages.admin.services.desc}
        icon={<CreditCard size={20} />}
      />

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition
              ${activeTab === tab.key ? "bg-[#013486] text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab c={c} />}
      {activeTab === "plans" && <PlansTab c={c} showToast={showToast} />}
      {activeTab === "services" && <ServicesTab c={c} showToast={showToast} />}
      {activeTab === "billing" && <BillingTab c={c} showToast={showToast} />}
      {activeTab === "upgrade" && <UpgradeTab c={c} showToast={showToast} />}
      {activeTab === "notifications" && <NotificationsTab c={c} showToast={showToast} />}
      {activeTab === "advanced" && <AdvancedTab c={c} showToast={showToast} />}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ═══════════════════════ TAB 1: OVERVIEW ═══════════════════════ */
function OverviewTab({ c }: { c: SV }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.overviewTitle}</h2>

      {/* Current plan hero */}
      <div className="bg-gradient-to-r from-[#013486] to-[#0148c2] rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 right-20 w-20 h-20 bg-white/5 rounded-full -mb-8" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wider">{c.currentPlan}</p>
            <div className="flex items-center gap-2 mt-1">
              <Crown size={24} className="text-amber-300" />
              <h3 className="text-3xl font-bold">{c.planStandard}</h3>
            </div>
            <p className="text-sm text-white/70 mt-2">15,000 HTG / {c.perMonth}</p>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 justify-end">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm text-green-300">{c.statusActive}</span>
            </div>
            <p className="text-xs text-white/50">{c.renewalDate}: 2025-03-01</p>
            <p className="text-xs text-white/50">18 {c.daysUntilRenewal}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={c.activeServices} value="12" icon={<Zap size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard label={c.totalUsers} value="510" icon={<Users size={20} className="text-[#013486]" />} color="bg-[#013486]/10" sub="/ 600" />
        <StatCard label={c.storageUsed} value="2.4 GB" icon={<Database size={20} className="text-purple-600" />} color="bg-purple-100" sub="/ 5 GB" />
        <StatCard label={c.modulesActive} value="15" icon={<Package size={20} className="text-amber-600" />} color="bg-amber-100" sub="/ 19" />
      </div>

      {/* Usage bars */}
      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title={c.usersLimit}>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>510 {c.totalUsers}</span>
              <span>600 max</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-[#013486] to-[#0148c2]" style={{ width: "85%" }} />
            </div>
            <p className="text-xs text-amber-600">85% — Limite bientôt atteinte</p>
          </div>
        </SectionCard>

        <SectionCard title={c.storageLimit}>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>2.4 GB</span>
              <span>5 GB max</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: "48%" }} />
            </div>
            <p className="text-xs text-green-600">48% — Utilisation normale</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 2: PLANS ═══════════════════════ */
function PlansTab({ c, showToast }: { c: SV; showToast: (m: string) => void }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      key: "essential", name: c.planEssential, desc: c.essentialDesc,
      priceM: 0, priceY: 0, color: "border-green-300 bg-green-50",
      icon: <Star size={24} className="text-green-600" />, iconBg: "bg-green-100",
      badge: c.planFree, badgeColor: "bg-green-100 text-green-700",
      users: "50", storage: "500 MB", current: false,
      features: [c.essentialF1, c.essentialF2, c.essentialF3, c.essentialF4, c.essentialF5],
    },
    {
      key: "standard", name: c.planStandard, desc: c.standardDesc,
      priceM: 15000, priceY: 144000, color: "border-[#013486] bg-[#013486]/5 ring-2 ring-[#013486]/20",
      icon: <Crown size={24} className="text-[#013486]" />, iconBg: "bg-[#013486]/10",
      badge: c.currentPlanBadge, badgeColor: "bg-[#013486] text-white",
      users: "600", storage: "5 GB", current: true,
      features: [c.standardF1, c.standardF2, c.standardF3, c.standardF4, c.standardF5, c.standardF6],
    },
    {
      key: "premium", name: c.planPremium, desc: c.premiumDesc,
      priceM: 35000, priceY: 336000, color: "border-purple-300 bg-purple-50",
      icon: <Shield size={24} className="text-purple-600" />, iconBg: "bg-purple-100",
      badge: c.recommended, badgeColor: "bg-purple-100 text-purple-700",
      users: c.unlimited, storage: "20 GB", current: false,
      features: [c.premiumF1, c.premiumF2, c.premiumF3, c.premiumF4, c.premiumF5, c.premiumF6, c.premiumF7],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{c.plansTitle}</h2>
          <p className="text-sm text-gray-500">{c.plansDesc}</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setBilling("monthly")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${billing === "monthly" ? "bg-white shadow text-[#013486]" : "text-gray-500"}`}>
            {c.monthly}
          </button>
          <button onClick={() => setBilling("annual")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1 ${billing === "annual" ? "bg-white shadow text-[#013486]" : "text-gray-500"}`}>
            {c.annual} <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">{c.savePercent}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.key} className={`rounded-2xl border-2 p-5 space-y-4 transition ${plan.color}`}>
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.iconBg}`}>{plan.icon}</div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {(billing === "monthly" ? plan.priceM : plan.priceY).toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">HTG {billing === "monthly" ? c.perMonth : c.perYear}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{c.maxUsers}: {plan.users}</span>
              <span>{c.maxStorage}: {plan.storage}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase">{c.features}</p>
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 shrink-0" />
                  <span className="text-xs text-gray-600">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => !plan.current && showToast(c.planUpdated)}
              className={`w-full py-2.5 text-sm font-semibold rounded-xl transition ${plan.current
                ? "bg-gray-200 text-gray-500 cursor-default"
                : "bg-[#013486] text-white hover:bg-[#012a6e] shadow"}`}>
              {plan.current ? c.currentPlanBadge : c.choosePlan}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 3: SERVICES ═══════════════════════ */
function ServicesTab({ c, showToast }: { c: SV; showToast: (m: string) => void }) {
  const [services, setServices] = useState([
    { key: "sms", label: c.svcSms, desc: c.svcSmsDesc, icon: <MessageSquare size={20} />, price: "2,500 HTG/mois", active: true, included: false },
    { key: "payment", label: c.svcPayment, desc: c.svcPaymentDesc, icon: <Smartphone size={20} />, price: "3,000 HTG/mois", active: false, included: false },
    { key: "biometric", label: c.svcBiometric, desc: c.svcBiometricDesc, icon: <Fingerprint size={20} />, price: "5,000 HTG/mois", active: false, included: false },
    { key: "offline", label: c.svcOffline, desc: c.svcOfflineDesc, icon: <Wifi size={20} />, price: "4,000 HTG/mois", active: false, included: false },
    { key: "ai", label: c.svcAi, desc: c.svcAiDesc, icon: <Brain size={20} />, price: "8,000 HTG/mois", active: false, included: false },
    { key: "support", label: c.svcPremiumSupport, desc: c.svcPremiumSupportDesc, icon: <Headset size={20} />, price: "3,500 HTG/mois", active: true, included: true },
    { key: "training", label: c.svcTraining, desc: c.svcTrainingDesc, icon: <GraduationCap size={20} />, price: "10,000 HTG/session", active: false, included: false },
  ]);

  const toggleService = (key: string) => {
    setServices(prev => prev.map(s => {
      if (s.key !== key) return s;
      const newActive = !s.active;
      showToast(newActive ? c.serviceActivated : c.serviceDeactivated);
      return { ...s, active: newActive };
    }));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.servicesTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.servicesDesc}</p>

      <div className="grid md:grid-cols-2 gap-3">
        {services.map(svc => (
          <div key={svc.key} className={`rounded-xl border p-4 transition ${svc.active ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-white"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${svc.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {svc.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-900">{svc.label}</h4>
                    {svc.included && (
                      <span className="text-[10px] bg-[#013486]/10 text-[#013486] px-2 py-0.5 rounded-full">{c.includedInPlan}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{svc.desc}</p>
                  <p className="text-xs font-semibold text-[#F35403] mt-2">{svc.price}</p>
                </div>
              </div>
              <button onClick={() => toggleService(svc.key)} className="p-1 shrink-0">
                {svc.active
                  ? <ToggleRight size={28} className="text-green-500" />
                  : <ToggleLeft size={28} className="text-gray-300" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 4: BILLING ═══════════════════════ */
function BillingTab({ c, showToast }: { c: SV; showToast: (m: string) => void }) {
  const [autoRenew, setAutoRenew] = useState(true);

  const statusColors: Record<string, { bg: string; text: string }> = {
    paid: { bg: "bg-green-100", text: "text-green-700" },
    pending: { bg: "bg-amber-100", text: "text-amber-700" },
    overdue: { bg: "bg-red-100", text: "text-red-700" },
  };
  const statusLabels: Record<string, string> = {
    paid: c.invoicePaid, pending: c.invoicePending, overdue: c.invoiceOverdue,
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.billingTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.billingDesc}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label={c.totalPaid} value="75,000 HTG" icon={<CheckCircle size={20} className="text-green-600" />} color="bg-green-100" />
        <StatCard label={c.nextPayment} value="15,000 HTG" icon={<Clock size={20} className="text-amber-600" />} color="bg-amber-100" sub="01/03" />
        <StatCard label={c.paymentMethod} value={c.methodMobile} icon={<Smartphone size={20} className="text-[#013486]" />} color="bg-[#013486]/10" />
        <StatCard label={c.autoRenewal} value={autoRenew ? "ON" : "OFF"} icon={<TrendingUp size={20} className="text-purple-600" />} color="bg-purple-100" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Invoices */}
        <SectionCard title={c.invoices}>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-3 py-2">{c.invoiceNumber}</th>
                  <th className="text-left px-3 py-2">{c.invoiceDate}</th>
                  <th className="text-right px-3 py-2">{c.invoiceAmount}</th>
                  <th className="text-center px-3 py-2">{c.invoiceStatus}</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockInvoices.map(inv => {
                  const sc = statusColors[inv.status] || statusColors.pending;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-900">{inv.id}</td>
                      <td className="px-3 py-2.5 text-gray-500">{inv.date}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{inv.amount.toLocaleString()} HTG</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                          {statusLabels[inv.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 justify-end">
                          {inv.status === "pending" && (
                            <button onClick={() => showToast(c.paymentConfirmed)}
                              className="text-xs text-[#013486] hover:underline">{c.payNow}</button>
                          )}
                          <button className="p-1 rounded hover:bg-gray-100 text-gray-400"><Download size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Payment methods & auto-renewal */}
        <div className="space-y-4">
          <SectionCard title={c.paymentMethod}>
            <div className="space-y-2">
              {[
                { label: c.methodMobile, icon: <Smartphone size={16} />, detail: "MonCash ***456", active: true },
                { label: c.methodBank, icon: <DollarSign size={16} />, detail: "Unibank ***789", active: false },
                { label: c.methodCard, icon: <CreditCard size={16} />, detail: "Visa ***1234", active: false },
              ].map((pm, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${pm.active ? "border-[#013486] bg-[#013486]/5" : "border-gray-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pm.active ? "bg-[#013486]/10 text-[#013486]" : "bg-gray-100 text-gray-400"}`}>
                      {pm.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pm.label}</p>
                      <p className="text-xs text-gray-400">{pm.detail}</p>
                    </div>
                  </div>
                  {pm.active && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={c.autoRenewal}>
            <ToggleRow label={c.autoRenewal} desc={c.autoRenewalHelp} enabled={autoRenew}
              onToggle={() => setAutoRenew(!autoRenew)} icon={<TrendingUp size={14} />} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 5: UPGRADE ═══════════════════════ */
function UpgradeTab({ c, showToast }: { c: SV; showToast: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.upgradeTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.upgradeDesc}</p>

      {/* Current → Target */}
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-white rounded-xl border-2 border-[#013486] p-4 text-center">
          <Crown size={24} className="text-[#013486] mx-auto mb-2" />
          <p className="text-xs text-gray-500">{c.currentPlan}</p>
          <p className="text-lg font-bold text-[#013486]">{c.planStandard}</p>
          <p className="text-sm text-gray-500">15,000 HTG{c.perMonth}</p>
        </div>
        <ChevronRight size={24} className="text-gray-300 shrink-0" />
        <div className="flex-1 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 p-4 text-center">
          <Shield size={24} className="text-purple-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">{c.recommended}</p>
          <p className="text-lg font-bold text-purple-700">{c.planPremium}</p>
          <p className="text-sm text-gray-500">35,000 HTG{c.perMonth}</p>
        </div>
      </div>

      {/* Benefits */}
      <SectionCard title={c.upgradeBenefits}>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { label: c.newModules, icon: <Package size={16} />, desc: "IA, Paiement mobile, Automatisations" },
            { label: c.newLimits, icon: <Users size={16} />, desc: "600 → Illimité" },
            { label: c.premiumAccess, icon: <Shield size={16} />, desc: "Branding, Support prioritaire" },
            { label: c.instantActivation, icon: <Zap size={16} />, desc: "Activation immédiate" },
            { label: c.noDataLoss, icon: <Database size={16} />, desc: "Migration sécurisée" },
            { label: c.continuity, icon: <CheckCircle size={16} />, desc: "Aucune interruption" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">{b.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{b.label}</p>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Comparison table */}
      <SectionCard title={c.comparePlans}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-2">{c.feature}</th>
                <th className="text-center px-4 py-2">{c.planEssential}</th>
                <th className="text-center px-4 py-2 bg-[#013486]/5">{c.planStandard}</th>
                <th className="text-center px-4 py-2">{c.planPremium}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ["Gestion élèves", true, true, true],
                ["Notifications SMS", false, true, true],
                ["Portail parents", false, true, true],
                ["Gestion financière", false, true, true],
                ["Intelligence artificielle", false, false, true],
                ["Paiement mobile", false, false, true],
                ["Support prioritaire", false, false, true],
                ["Branding complet", false, false, true],
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{row[0] as string}</td>
                  {[1, 2, 3].map(j => (
                    <td key={j} className={`px-4 py-2 text-center ${j === 2 ? "bg-[#013486]/5" : ""}`}>
                      {row[j] ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="flex justify-center gap-3">
        <button onClick={() => showToast(c.upgradeSuccess)}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl">
          <ArrowUpCircle size={16} /> {c.upgradeBtn}
        </button>
      </div>

      {/* Downgrade warning */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-700">{c.downgradeBtn}</p>
          <p className="text-xs text-amber-600 mt-1">{c.downgradeWarning}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 6: NOTIFICATIONS ═══════════════════════ */
function NotificationsTab({ c, showToast }: { c: SV; showToast: (m: string) => void }) {
  const [notifs, setNotifs] = useState({
    expiry: true, payment: true, suspension: true, activation: true,
  });
  const [channels, setChannels] = useState({ email: true, sms: false, dashboard: true });
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(7);

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.notifsTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.notifsDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        <SectionCard title={c.notifsTitle}>
          <ToggleRow label={c.notifExpiry} desc={c.notifExpiryHelp} enabled={notifs.expiry}
            onToggle={() => setNotifs(p => ({ ...p, expiry: !p.expiry }))} icon={<Clock size={14} />} />
          <ToggleRow label={c.notifPayment} desc={c.notifPaymentHelp} enabled={notifs.payment}
            onToggle={() => setNotifs(p => ({ ...p, payment: !p.payment }))} icon={<CreditCard size={14} />} />
          <ToggleRow label={c.notifSuspension} desc={c.notifSuspensionHelp} enabled={notifs.suspension}
            onToggle={() => setNotifs(p => ({ ...p, suspension: !p.suspension }))} icon={<AlertTriangle size={14} />} />
          <ToggleRow label={c.notifActivation} desc={c.notifActivationHelp} enabled={notifs.activation}
            onToggle={() => setNotifs(p => ({ ...p, activation: !p.activation }))} icon={<Zap size={14} />} />
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title={c.daysBeforeExpiry}>
            <div className="flex items-center gap-3">
              <input type="number" value={daysBeforeExpiry} onChange={e => setDaysBeforeExpiry(Number(e.target.value))}
                className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              <span className="text-sm text-gray-500">jours</span>
            </div>
          </SectionCard>

          <SectionCard title="Canaux de notification">
            <ToggleRow label={c.notifEmail} enabled={channels.email}
              onToggle={() => setChannels(p => ({ ...p, email: !p.email }))} />
            <ToggleRow label={c.notifSms} enabled={channels.sms}
              onToggle={() => setChannels(p => ({ ...p, sms: !p.sms }))} />
            <ToggleRow label={c.notifDashboard} enabled={channels.dashboard}
              onToggle={() => setChannels(p => ({ ...p, dashboard: !p.dashboard }))} />
          </SectionCard>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => showToast(c.saved)} className="flex items-center gap-2 px-6 py-2.5 bg-[#013486] text-white text-sm font-semibold rounded-xl shadow hover:bg-[#012a6e]">
          <CheckCircle size={16} /> {c.save}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ TAB 7: ADVANCED ═══════════════════════ */
function AdvancedTab({ c, showToast }: { c: SV; showToast: (m: string) => void }) {
  const [coupon, setCoupon] = useState("");
  const [autoInvoice, setAutoInvoice] = useState(true);

  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{c.advancedTitle}</h2>
      <p className="text-sm text-gray-500 -mt-3">{c.advancedDesc}</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Free trial */}
        <SectionCard title={c.freeTrial}>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200 text-center">
            <Gift size={32} className="text-amber-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-900">{c.freeTrial}</h4>
            <p className="text-xs text-gray-500 mt-1">{c.freeTrialHelp}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-2xl font-bold text-amber-600">14</span>
              <span className="text-sm text-gray-500">{c.freeTrialDays}</span>
            </div>
            <button onClick={() => showToast(c.serviceActivated)}
              className="mt-3 px-6 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600">
              {c.startTrial}
            </button>
          </div>
        </SectionCard>

        {/* Coupons */}
        <SectionCard title={c.coupons}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-gray-400" />
              <input value={coupon} onChange={e => setCoupon(e.target.value)}
                placeholder={c.enterCoupon}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#013486]/30" />
              <button onClick={() => { showToast(coupon ? c.couponApplied : c.invalidCoupon); setCoupon(""); }}
                className="px-4 py-2 text-sm bg-[#013486] text-white rounded-lg hover:bg-[#012a6e]">
                {c.applyCoupon}
              </button>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-700 font-medium">EDUCA2025 — 15% de réduction appliqué</p>
            </div>
          </div>
        </SectionCard>

        {/* Multi-year */}
        <SectionCard title={c.multiYearPlan}>
          <p className="text-xs text-gray-500">{c.multiYearHelp}</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: "1 an", price: "180,000 HTG", save: "" },
              { label: "2 ans", price: "324,000 HTG", save: "-10%" },
              { label: "3 ans", price: "432,000 HTG", save: "-20%" },
            ].map((opt, i) => (
              <button key={i} className={`p-3 rounded-xl border-2 text-center transition ${i === 0
                ? "border-[#013486] bg-[#013486]/5" : "border-gray-200 hover:border-gray-300"}`}>
                <p className="text-sm font-bold text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.price}</p>
                {opt.save && <p className="text-xs font-semibold text-green-600 mt-1">{opt.save}</p>}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Other settings */}
        <SectionCard title="Options">
          <ToggleRow label={c.autoInvoicing} enabled={autoInvoice} onToggle={() => setAutoInvoice(!autoInvoice)} icon={<Receipt size={14} />} />
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs font-medium text-red-700">{c.suspensionPolicy}</p>
            <p className="text-xs text-red-600 mt-1">{c.suspensionPolicyDesc}</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
