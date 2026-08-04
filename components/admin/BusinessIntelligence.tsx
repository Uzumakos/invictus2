"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, DollarSign, Receipt, Landmark, CheckSquare, 
  Settings, User, Plus, Search, Edit2, Trash2, CheckCircle2, AlertTriangle, 
  Save, X, ArrowRight, FileText, Check, Download, Loader2, Calendar, 
  Sliders, ShieldAlert, Award, FileSpreadsheet, Eye, HelpCircle, HardDrive, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RevenueRecord {
  id: string;
  clientName: string;
  projectName: string;
  category: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  date: string;
  status: string;
  notes?: string;
}

interface ExpenseRecord {
  id: string;
  expenseName: string;
  category: string;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  recurring: boolean;
  frequency?: string;
  paymentMethod: string;
  invoiceUrl?: string;
  notes?: string;
}

interface SubscriptionRecord {
  id: string;
  serviceName: string;
  category: string;
  vendor: string;
  monthlyCost: number;
  yearlyCost: number;
  renewalDate: string;
  autoRenew: boolean;
  website?: string;
  paymentMethod: string;
  status: string;
  notes?: string;
}

interface BudgetRecord {
  id: string;
  category: string;
  allocatedBudget: number;
  year: number;
  month: number;
}

interface FundingGoal {
  id: string;
  // camelCase (form state)
  goalName?: string;
  targetCost?: number;
  currentSavings?: number;
  fundingStrategy?: string;
  strategyValue?: number;
  desiredPurchaseDate?: string;
  purchaseUrl?: string;
  mediaUrl?: string;
  // snake_case (Supabase response)
  goal_name?: string;
  target_cost?: number;
  current_savings?: number;
  funding_strategy?: string;
  strategy_value?: number;
  desired_purchase_date?: string;
  purchase_url?: string;
  media_url?: string;
  // Shared fields
  category: string;
  description?: string;
  vendor?: string;
  currency: string;
  priority: string;
  status: string;
  notes?: string;
}

interface ContributionRecord {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  source: string;
}

interface AssetRecord {
  id: string;
  assetName: string;
  category: string;
  purchaseDate: string;
  purchaseCost: number;
  vendor?: string;
  invoiceReference?: string;
  warrantyExpiration?: string;
  serialNumber?: string;
  condition: string;
  assignedUser?: string;
  maintenanceSchedule?: string;
  depreciationPeriod?: number;
  replacementEstimate?: number;
  status: string;
  mediaUrl?: string;
  notes?: string;
}

export default function BusinessIntelligence() {
  const [tab, setTab] = useState<"dashboard" | "revenue" | "expense" | "subscriptions" | "budget" | "cashflow" | "profit" | "forecast" | "assets" | "reports" | "settings">("dashboard");
  const [loading, setLoading] = useState(true);
  
  // Data lists
  const [revenues, setRevenues] = useState<RevenueRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [fundingGoals, setFundingGoals] = useState<FundingGoal[]>([]);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [biData, setBiData] = useState<any>({
    mtdRevenue: 0,
    ytdRevenue: 0,
    mtdExpenses: 0,
    ytdExpenses: 0,
    netProfit: 0,
    cashAvailable: 0,
    monthlyRecurringRevenue: 0,
    outstandingInvoicesAmount: 0,
    outstandingInvoicesCount: 0,
    pendingPaymentsAmount: 0,
    upcomingRenewals: [],
    estimatedTaxes: 0,
    profitMargin: 0,
    burnRate: 0,
    savingsRate: 0,
    avgProjectValue: 0,
    avgDiscoveryCallRevenue: 0,
    topClient: "None",
    mostProfitableService: "None",
    businessHealthScore: 100,
    businessHealthLevel: "Excellent",
    businessHealthRecommendations: [],
    cashFlowTrend: [],
    revenueByCategory: {},
    revenueByClient: {},
    mostExpensiveExpenseCategory: "None",
    kpis: {},
    financialForecast: [],
    smartInsights: [],
    budgetReport: []
  });

  // Date helpers (used in budget form)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  // Subscription growth from BI analytics
  const subscriptionGrowth: number = biData.subscriptionGrowth ?? 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // Funding goal contribution modal
  const [contribGoal, setContribGoal] = useState<FundingGoal | null>(null);
  const [manualContribAmount, setManualContribAmount] = useState("");
  const [manualContribSource, setManualContribSource] = useState("Manual Contribution");

  // Purchase asset modal
  const [purchaseGoal, setPurchaseGoal] = useState<FundingGoal | null>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [warrantyExpiration, setWarrantyExpiration] = useState("");
  const [condition, setCondition] = useState("New");
  const [assignedUser, setAssignedUser] = useState("Amedee Erns Baptiste");
  const [depreciationPeriod, setDepreciationPeriod] = useState("36");
  const [replacementEstimate, setReplacementEstimate] = useState("");

  // Goal Simulation state
  const [simRevenue, setSimRevenue] = useState("8000");
  const [simPct, setSimPct] = useState("10");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        revRes, expRes, subRes, budRes, goalRes, contribRes, assetRes, biRes
      ] = await Promise.all([
        fetch("/api/revenues"),
        fetch("/api/expenses"),
        fetch("/api/subscriptions"),
        fetch("/api/budgets"),
        fetch("/api/funding-goals"),
        fetch("/api/funding-contributions"),
        fetch("/api/asset-registry"),
        fetch("/api/analytics/bi")
      ]);

      if (revRes.ok) setRevenues(await revRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
      if (subRes.ok) setSubscriptions(await subRes.json());
      if (budRes.ok) setBudgets(await budRes.json());
      if (goalRes.ok) setFundingGoals(await goalRes.json());
      if (contribRes.ok) setContributions(await contribRes.json());
      if (assetRes.ok) setAssets(await assetRes.json());
      if (biRes.ok) setBiData(await biRes.json());

    } catch (err) {
      console.error("Failed to load BI Hub datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = async (e: React.FormEvent, resource: string, payload: any) => {
    e.preventDefault();
    const url = editingItem ? `/api/${resource}/${editingItem.id}` : `/api/${resource}`;
    const method = editingItem ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        triggerToast(`${editingItem ? "Updated" : "Created"} successfully.`);
        setIsFormOpen(false);
        setEditingItem(null);
        loadAllData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (resource: string, id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast("Record deleted successfully.");
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribGoal || !manualContribAmount) return;

    const amt = parseFloat(manualContribAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const targetCost = contribGoal.target_cost ?? contribGoal.targetCost ?? 0;
      const currentSavings = contribGoal.current_savings ?? contribGoal.currentSavings ?? 0;
      const remaining = targetCost - currentSavings;
      const actualContrib = Math.min(amt, remaining);

      // 1. Log contribution
      await fetch("/api/funding-contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: contribGoal.id,
          amount: actualContrib,
          date: new Date().toISOString().split("T")[0],
          source: manualContribSource || "Manual Contribution"
        })
      });

      // 2. Update Goal Savings
      const newSavings = currentSavings + actualContrib;
      const newStatus = newSavings >= targetCost ? "Ready to Purchase" : "Saving";

      await fetch(`/api/funding-goals/${contribGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSavings: newSavings,
          status: newStatus
        })
      });

      // 3. Create notification if reached 100%
      if (newSavings >= targetCost) {
        await fetch("/api/portal-notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: `notif_${Math.random().toString(36).substring(2, 8)}`,
            clientEmail: "admin@invictus.com",
            text: `Goal "${contribGoal.goal_name ?? contribGoal.goalName ?? "Goal"}" is fully funded at $${targetCost.toLocaleString()}!`,
            type: "alert",
            read: false,
            timestamp: new Date().toISOString()
          })
        });
      }

      triggerToast("Contribution allocated successfully.");
      setContribGoal(null);
      setManualContribAmount("");
      loadAllData();

    } catch (err) {
      console.error(err);
    }
  };

  const handlePurchaseAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseGoal) return;

    try {
      const cost = purchaseGoal.target_cost ?? purchaseGoal.targetCost ?? 0;
      const pGoalName = purchaseGoal.goal_name ?? purchaseGoal.goalName ?? "Asset";

      // 1. Move to Asset Registry
      await fetch("/api/asset-registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetName: pGoalName,
          category: purchaseGoal.category,
          purchaseDate: new Date().toISOString().split("T")[0],
          purchaseCost: cost,
          vendor: purchaseGoal.vendor || "",
          invoiceReference: `INV-${pGoalName.toUpperCase().replace(/\s+/g, "-")}`,
          warrantyExpiration: warrantyExpiration || null,
          serialNumber: serialNumber || "",
          condition: condition,
          assignedUser: assignedUser,
          depreciationPeriod: parseInt(depreciationPeriod) || 36,
          replacementEstimate: replacementEstimate ? parseFloat(replacementEstimate) : cost,
          status: "Active",
          mediaUrl: purchaseGoal.media_url ?? purchaseGoal.mediaUrl ?? "",
          notes: `Purchased automatically from Funding Goal: ${pGoalName}`,
          goalId: purchaseGoal.id
        })
      });

      // 2. Subtract from business cash by generating a balancing expense
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenseName: `Asset Purchase: ${pGoalName}`,
          category: "Equipment",
          vendor: purchaseGoal.vendor || "Direct Vendor",
          amount: cost,
          currency: purchaseGoal.currency || "USD",
          date: new Date().toISOString().split("T")[0],
          recurring: false,
          paymentMethod: "Savings Reserve",
          notes: `Automated debit for funded asset purchase: ${pGoalName}`
        })
      });

      // 3. Mark Funding Goal as Purchased
      await fetch(`/api/funding-goals/${purchaseGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Purchased",
          notes: `Asset registry linked. Purchased on ${new Date().toLocaleDateString()}`
        })
      });

      triggerToast(`Asset "${pGoalName}" recorded in Registry! Debit logged in expenses.`);
      setPurchaseGoal(null);
      setSerialNumber("");
      setWarrantyExpiration("");
      setReplacementEstimate("");
      loadAllData();

    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = (reportType: string, format: string) => {
    window.open(`/api/analytics/bi/export?reportType=${reportType}&format=${format}`, "_blank");
  };

  // Seed mock data helper to fill the database locally with realistic entries
  const handleSeedMockData = async () => {
    if (!confirm("This will insert mock revenues, expenses, subscriptions, budgets, and goals to demonstrate BI calculations. Proceed?")) return;
    setLoading(true);
    try {
      // Mock Client ID (fetch or generate uuid)
      const mockClientId = "b9f91a56-ccde-4c22-b5e1-8873426788f8"; // standard UUID or let it insert

      // A. Seed Budgets
      const budgetItems = [
        { category: "Software", allocatedBudget: 1500, year: 2026, month: 8 },
        { category: "AI", allocatedBudget: 500, year: 2026, month: 8 },
        { category: "Cloud", allocatedBudget: 1000, year: 2026, month: 8 },
        { category: "Marketing", allocatedBudget: 1200, year: 2026, month: 8 },
        { category: "Office", allocatedBudget: 400, year: 2026, month: 8 }
      ];
      for (const b of budgetItems) {
        await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(b)
        });
      }

      // B. Seed Subscriptions
      const subItems = [
        { serviceName: "Claude Pro", category: "AI Tools", vendor: "Anthropic", monthlyCost: 20, yearlyCost: 240, renewalDate: "2026-08-15", autoRenew: true, website: "anthropic.com", paymentMethod: "Credit Card", status: "active" },
        { serviceName: "Cursor IDE", category: "AI Tools", vendor: "Anysphere", monthlyCost: 20, yearlyCost: 240, renewalDate: "2026-08-20", autoRenew: true, website: "cursor.com", paymentMethod: "Credit Card", status: "active" },
        { serviceName: "Vercel Hosting", category: "Hosting", vendor: "Vercel", monthlyCost: 40, yearlyCost: 480, renewalDate: "2026-08-28", autoRenew: true, website: "vercel.com", paymentMethod: "PayPal", status: "active" }
      ];
      for (const s of subItems) {
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(s)
        });
      }

      // C. Seed Revenues
      const revItems = [
        { clientName: "ABC Corp", projectName: "MVP Software Build", category: "Software Development", amount: 4500, currency: "USD", paymentMethod: "Stripe", date: "2026-08-01", status: "paid", notes: "First milestone payment" },
        { clientName: "XYZ LLC", projectName: "AI Workshop", category: "AI Consulting", amount: 3200, currency: "USD", paymentMethod: "Wire", date: "2026-08-03", status: "paid", notes: "Consultation retainer" }
      ];
      for (const r of revItems) {
        await fetch("/api/revenues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(r)
        });
      }

      // D. Seed Expenses
      const expItems = [
        { expenseName: "Vercel SaaS", category: "Hosting", vendor: "Vercel", amount: 40, currency: "USD", date: "2026-08-01", recurring: true, frequency: "monthly", paymentMethod: "PayPal" },
        { expenseName: "Marketing Ads", category: "Marketing", vendor: "Google Ads", amount: 250, currency: "USD", date: "2026-08-02", recurring: false, paymentMethod: "Credit Card" }
      ];
      for (const e of expItems) {
        await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(e)
        });
      }

      // E. Seed Funding Goals
      const goalItems = [
        { goalName: "MacBook Pro M4 Max", category: "Equipment", targetCost: 3500, currency: "USD", currentSavings: 2800, priority: "High", status: "Saving", fundingStrategy: "percentage_revenue", strategyValue: 10, description: "Main development workstation replacement" },
        { goalName: "Emergency Reserve Fund", category: "Reserve", targetCost: 10000, currency: "USD", currentSavings: 5000, priority: "High", status: "Saving", fundingStrategy: "monthly_fixed", strategyValue: 500, description: "3 months operational expenses" }
      ];
      for (const g of goalItems) {
        await fetch("/api/funding-goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(g)
        });
      }

      triggerToast("Mock seed datasets loaded successfully.");
      loadAllData();
    } catch (err: any) {
      alert(`Seed failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs text-gray-300 font-sans min-h-screen">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-5 right-5 bg-emerald-950 border border-emerald-500/25 px-4 py-3 rounded-xl text-emerald-400 font-bold z-50 flex items-center space-x-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#CDD4DD]/10 pb-4">
        <div>
          <span className="text-[9px] font-sans font-bold text-[#FF7A00] tracking-widest uppercase block">FINANCIAL COMMAND</span>
          <h2 className="font-serif font-bold text-2xl text-white">Business Intelligence Hub</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {tab === "revenue" && (
            <button
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
              className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log Revenue</span>
            </button>
          )}
          {tab === "expense" && (
            <button
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
              className="bg-red-600 hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          )}
          {tab === "subscriptions" && (
            <button
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
              className="bg-blue-600 hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              <span>New SaaS</span>
            </button>
          )}
          {tab === "assets" && (
            <button
              onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
              className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Funding Goal</span>
            </button>
          )}
          <button
            onClick={loadAllData}
            className="p-2 border border-[#CDD4DD]/10 rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Workspace Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-[#CDD4DD]/10 pb-3">
        {[
          { id: "dashboard", label: "Executive Dashboard", icon: BarChart3 },
          { id: "revenue", label: "Revenue Center", icon: DollarSign },
          { id: "expense", label: "Expense Center", icon: Receipt },
          { id: "subscriptions", label: "SaaS Subscriptions", icon: Landmark },
          { id: "budget", label: "Budget Planner", icon: Sliders },
          { id: "cashflow", label: "Cash Flow", icon: TrendingUp },
          { id: "profit", label: "Profit Analytics", icon: BarChart3 },
          { id: "forecast", label: "Financial Forecast", icon: Calendar },
          { id: "assets", label: "Investment Planner & Assets", icon: Sliders },
          { id: "reports", label: "Reports & Export", icon: FileSpreadsheet },
          { id: "settings", label: "BI Settings", icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id as any);
                setSearchQuery("");
                setFilterCategory("all");
              }}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                isActive
                  ? "bg-[#FF7A00]/15 border border-[#FF7A00]/40 text-[#FF7A00]"
                  : "bg-transparent border border-transparent text-gray-500 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading Overlay */}
      {loading ? (
        <div className="h-64 flex flex-col justify-center items-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#FF7A00] animate-spin" />
          <span className="font-mono text-gray-500">Compiling financial indexes...</span>
        </div>
      ) : (
        <div className="animate-fadeIn">

          {/* TAB 1: EXECUTIVE FINANCIAL DASHBOARD */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              {/* Stat Cards Grid (21 Cards requested) */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {[
                  { label: "Revenue (MTD)", value: biData.mtdRevenue, prefix: "$", color: "text-emerald-400" },
                  { label: "Revenue (YTD)", value: biData.ytdRevenue, prefix: "$", color: "text-[#FF7A00]" },
                  { label: "Expenses (MTD)", value: biData.mtdExpenses, prefix: "$", color: "text-red-400" },
                  { label: "Expenses (YTD)", value: biData.ytdExpenses, prefix: "$", color: "text-red-400" },
                  { label: "Net Profit (YTD)", value: biData.netProfit, prefix: "$", color: "text-white" },
                  { label: "Cash Available", value: biData.cashAvailable, prefix: "$", color: "text-emerald-400" },
                  { label: "Monthly SaaS Cost", value: biData.monthlyRecurringRevenue, prefix: "$", color: "text-blue-400" },
                  { label: "Outstanding Invoices", value: biData.outstandingInvoicesAmount, prefix: "$", sub: `${biData.outstandingInvoicesCount} invoices` },
                  { label: "Pending Payments", value: biData.pendingPaymentsAmount, prefix: "$" },
                  { label: "Estimated Taxes (15%)", value: biData.estimatedTaxes, prefix: "$", color: "text-amber-500" },
                  { label: "Profit Margin", value: biData.profitMargin, suffix: "%" },
                  { label: "Burn Rate", value: biData.burnRate, prefix: "$" },
                  { label: "Savings Rate", value: biData.savingsRate, suffix: "%" },
                  { label: "Avg Project Value", value: biData.avgProjectValue, prefix: "$" },
                  { label: "Avg Discovery Revenue", value: biData.avgDiscoveryCallRevenue, prefix: "$" },
                  { label: "Top Client", text: biData.topClient, color: "text-[#FF7A00]" },
                  { label: "Top Service Category", text: biData.mostProfitableService },
                  { label: "Forecast Next Month", value: biData.financialForecast?.[0]?.projected, prefix: "$", color: "text-emerald-400" }
                ].map((card, idx) => (
                  <div key={idx} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-4 rounded-2xl space-y-1">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">{card.label}</span>
                    {card.text ? (
                      <p className={`text-xs font-bold truncate ${card.color || "text-white"}`}>{card.text}</p>
                    ) : (
                      <p className={`text-base font-bold font-mono ${card.color || "text-white"}`}>
                        {card.prefix || ""}{card.value?.toLocaleString()}{card.suffix || ""}
                      </p>
                    )}
                    {card.sub && <span className="block text-[8px] text-gray-500 font-mono">{card.sub}</span>}
                  </div>
                ))}

                {/* Business Health Score Card */}
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-4 rounded-2xl col-span-2 flex items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Business Health Score</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold font-mono text-[#FF7A00]">{biData.businessHealthScore}</span>
                      <span className={`text-[8px] font-bold uppercase border px-2 py-0.5 rounded ${
                        biData.businessHealthLevel === "Excellent" || biData.businessHealthLevel === "Healthy" 
                          ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                          : "bg-red-950/40 border-red-500/20 text-red-400"
                      }`}>{biData.businessHealthLevel}</span>
                    </div>
                    <span className="block text-[8px] text-gray-500">Deterministic metrics summary</span>
                  </div>
                  <Award className="w-8 h-8 text-[#FF7A00] opacity-80" />
                </div>
              </div>

              {/* Warnings and Health Score Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl md:col-span-2 space-y-4">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4.5 h-4.5 text-[#FF7A00]" />
                    <h3 className="font-serif font-bold text-sm text-white">Actionable Business Recommendations</h3>
                  </div>
                  <ul className="space-y-2 text-[10px] text-gray-400 pl-4 list-disc">
                    {biData.businessHealthRecommendations?.map((rec: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-white">Smart Insights</h3>
                  <div className="space-y-2.5">
                    {biData.smartInsights?.map((ins: string, idx: number) => (
                      <div key={idx} className="bg-[#121A1B] p-2.5 rounded-xl border border-[#CDD4DD]/5 leading-normal">
                        {ins}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVENUE CENTER */}
          {tab === "revenue" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search revenue by client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">All Categories</option>
                  <option value="Software Development">Software Development</option>
                  <option value="AI Consulting">AI Consulting</option>
                  <option value="Digital Transformation">Digital Transformation</option>
                  <option value="Discovery Calls">Discovery Calls</option>
                  <option value="Training">Training</option>
                  <option value="Speaking">Speaking</option>
                  <option value="Digital Products">Digital Products</option>
                  <option value="Affiliate">Affiliate</option>
                  <option value="Maintenance Contracts">Maintenance Contracts</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="bg-[#121A1B] border-b border-[#CDD4DD]/10 text-gray-500 text-[8px] uppercase tracking-wider">
                      <th className="p-4">Date</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Project</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Method</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDD4DD]/5 text-[10px]">
                    {revenues
                      .filter(r => {
                        const mSearch = r.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
                        const mCat = filterCategory === "all" || r.category === filterCategory;
                        return mSearch && mCat;
                      })
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 text-gray-400">{r.date}</td>
                          <td className="p-4 font-bold text-white">{r.clientName}</td>
                          <td className="p-4 text-gray-400">{r.projectName}</td>
                          <td className="p-4"><span className="bg-[#CDD4DD]/10 px-2 py-0.5 rounded text-[8px] text-gray-300">{r.category}</span></td>
                          <td className="p-4 text-gray-500 uppercase">{r.paymentMethod}</td>
                          <td className="p-4 text-right font-bold text-emerald-400">${Number(r.amount).toLocaleString()}</td>
                          <td className="p-4 flex justify-center gap-2">
                            <button onClick={() => { setEditingItem(r); setIsFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete("revenues", r.id)} className="p-1.5 text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                    ))}
                    {revenues.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-gray-500">No revenue logs. Log one to trigger savings rules.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EXPENSE CENTER */}
          {tab === "expense" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search expenses by vendor or item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">All Categories</option>
                  <option value="Software">Software</option>
                  <option value="AI Tools">AI Tools</option>
                  <option value="Cloud Services">Cloud Services</option>
                  <option value="Hosting">Hosting</option>
                  <option value="Domains">Domains</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Advertising">Advertising</option>
                  <option value="Travel">Travel</option>
                  <option value="Education">Education</option>
                  <option value="Office">Office</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Taxes">Taxes</option>
                  <option value="Bank Fees">Bank Fees</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="bg-[#121A1B] border-b border-[#CDD4DD]/10 text-gray-500 text-[8px] uppercase tracking-wider">
                      <th className="p-4">Date</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Recurring</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDD4DD]/5 text-[10px]">
                    {expenses
                      .filter(e => {
                        const mSearch = e.expenseName?.toLowerCase().includes(searchQuery.toLowerCase()) || e.vendor?.toLowerCase().includes(searchQuery.toLowerCase());
                        const mCat = filterCategory === "all" || e.category === filterCategory;
                        return mSearch && mCat;
                      })
                      .map((e) => (
                        <tr key={e.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 text-gray-400">{e.date}</td>
                          <td className="p-4 font-bold text-white">{e.expenseName}</td>
                          <td className="p-4"><span className="bg-[#CDD4DD]/10 px-2 py-0.5 rounded text-[8px] text-gray-300">{e.category}</span></td>
                          <td className="p-4 text-gray-400">{e.vendor}</td>
                          <td className="p-4 text-right font-bold text-red-400">${Number(e.amount).toLocaleString()}</td>
                          <td className="p-4 text-center text-gray-500">{e.recurring ? `Yes (${e.frequency})` : "No"}</td>
                          <td className="p-4 flex justify-center gap-2">
                            <button onClick={() => { setEditingItem(e); setIsFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete("expenses", e.id)} className="p-1.5 text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr><td colSpan={7} className="p-8 text-center text-gray-500">No expenses logged.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIPTION MANAGER */}
          {tab === "subscriptions" && (
            <div className="space-y-6">
              {/* Subscription Dashboard Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Monthly SaaS Cost</span>
                  <p className="text-xl font-bold font-mono text-blue-400">${biData.monthlyRecurringRevenue?.toLocaleString()}</p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Yearly SaaS Cost</span>
                  <p className="text-xl font-bold font-mono text-white">${(biData.monthlyRecurringRevenue * 12)?.toLocaleString()}</p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Most Expensive SaaS</span>
                  <p className="text-sm font-bold text-[#FF7A00] truncate mt-1">{biData.mostExpensiveExpenseCategory || "None"}</p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">MoM SaaS Growth</span>
                  <p className={`text-lg font-bold font-mono ${(subscriptionGrowth as number) > 0 ? "text-red-400" : "text-emerald-400"}`}>{(subscriptionGrowth as number) > 0 ? "+" : ""}{subscriptionGrowth}%</p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Renewals Next 30 Days</span>
                  <p className="text-xl font-bold font-mono text-white">{biData.upcomingRenewals?.length || 0}</p>
                </div>
              </div>

              {/* Subscription List Table */}
              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="bg-[#121A1B] border-b border-[#CDD4DD]/10 text-gray-500 text-[8px] uppercase tracking-wider">
                      <th className="p-4">Service</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4 text-right">Monthly Cost</th>
                      <th className="p-4 text-right">Yearly Cost</th>
                      <th className="p-4">Renewal Date</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDD4DD]/5 text-[10px]">
                    {subscriptions.map((s) => (
                      <tr key={s.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center space-x-1.5">
                          <span>{s.serviceName}</span>
                          {s.website && <a href={`https://${s.website}`} target="_blank" className="text-gray-500 hover:text-white"><Eye className="w-3 h-3" /></a>}
                        </td>
                        <td className="p-4 text-gray-400">{s.category}</td>
                        <td className="p-4 text-gray-400">{s.vendor}</td>
                        <td className="p-4 text-right font-bold text-blue-400">${Number(s.monthlyCost).toLocaleString()}</td>
                        <td className="p-4 text-right text-gray-400">${Number(s.yearlyCost).toLocaleString()}</td>
                        <td className="p-4 text-gray-400">{s.renewalDate}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-sans font-bold uppercase border ${
                            s.status === "active" ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                          }`}>{s.status}</span>
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                          <button onClick={() => { setEditingItem(s); setIsFormOpen(true); }} className="p-1.5 text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete("subscriptions", s.id)} className="p-1.5 text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                    {subscriptions.length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-gray-500">No active SaaS subscriptions logged.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: BUDGET PLANNER */}
          {tab === "budget" && (
            <div className="space-y-6">
              {/* Budgets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {biData.budgetReport?.map((b: any, idx: number) => {
                  const pct = Math.min(b.percentageUsed, 100);
                  const isExceeded = b.exceeded;
                  return (
                    <div key={idx} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-xs">{b.category}</span>
                        {isExceeded && (
                          <span className="bg-red-950/40 border border-red-500/20 text-red-400 text-[8px] px-2 py-0.5 rounded flex items-center gap-1 font-bold animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>EXCEEDED</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between font-mono text-[10px] text-gray-400">
                          <span>Allocated:</span>
                          <span className="text-white">${b.allocatedBudget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-mono text-[10px] text-gray-400">
                          <span>Spent:</span>
                          <span className={`${isExceeded ? "text-red-400" : "text-white"}`}>${b.spent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-mono text-[10px] text-gray-400 border-t border-[#CDD4DD]/5 pt-1">
                          <span>Remaining:</span>
                          <span className={`${b.remaining < 0 ? "text-red-400" : "text-emerald-400"}`}>${b.remaining.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-gray-500">
                          <span>Usage</span>
                          <span>{b.percentageUsed}%</span>
                        </div>
                        <div className="w-full bg-[#121A1B] h-2 rounded-full overflow-hidden border border-[#CDD4DD]/5">
                          <div className={`h-full rounded-full transition-all ${isExceeded ? "bg-red-500" : b.percentageUsed > 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Set Budgets Form Button */}
              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-2xl max-w-lg space-y-4">
                <h3 className="font-serif font-bold text-sm text-white">Define Monthly Budgets</h3>
                <p className="text-[10px] text-gray-500">Update the allocated ceiling limits for each category. Changes take effect immediately for the current month.</p>
                <button
                  onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
                  className="bg-[#FF7A00] hover:bg-opacity-80 px-4 py-2 rounded-xl text-xs font-bold text-white border-0 cursor-pointer"
                >
                  Configure Allocated Budgets
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: CASH FLOW */}
          {tab === "cashflow" && (
            <div className="space-y-6">
              {/* Stat Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">MTD Income</span>
                  <p className="text-xl font-bold font-mono text-emerald-400">${biData.mtdRevenue?.toLocaleString()}</p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">MTD Expenses</span>
                  <p className="text-xl font-bold font-mono text-red-400">${biData.mtdExpenses?.toLocaleString()}</p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">MTD Net Cash Flow</span>
                  <p className={`text-xl font-bold font-mono ${(biData.mtdRevenue - biData.mtdExpenses) > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    ${(biData.mtdRevenue - biData.mtdExpenses).toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Cash Balance</span>
                  <p className="text-xl font-bold font-mono text-white">${biData.cashAvailable?.toLocaleString()}</p>
                </div>
              </div>

              {/* Cash Flow Graph */}
              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-2xl space-y-4">
                <h3 className="font-serif font-bold text-sm text-white">Monthly Cash Flow Trends (Income vs Expenses)</h3>
                
                <div className="h-64 flex items-end justify-between pt-6 pb-2 border-b border-[#CDD4DD]/5 font-mono text-[9px] text-gray-500">
                  {biData.cashFlowTrend?.length === 0 ? (
                    <div className="w-full text-center text-gray-500">No cash flow logs found.</div>
                  ) : (
                    biData.cashFlowTrend.map((bar: any, idx: number) => {
                      const maxVal = Math.max(...biData.cashFlowTrend.map((b: any) => Math.max(b.income, b.expenses)), 1);
                      const incPct = (bar.income / maxVal) * 100;
                      const expPct = (bar.expenses / maxVal) * 100;

                      return (
                        <div key={idx} className="flex flex-col items-center space-y-3 flex-grow group px-1">
                          <div className="flex space-x-1.5 items-end h-40">
                            {/* Income Bar */}
                            <div className="w-4 bg-emerald-950/20 rounded-t relative flex items-end overflow-hidden" style={{ height: "140px" }} title={`Income: $${bar.income}`}>
                              <div className="w-full bg-emerald-500" style={{ height: `${incPct}%` }} />
                            </div>
                            {/* Expense Bar */}
                            <div className="w-4 bg-red-950/20 rounded-t relative flex items-end overflow-hidden" style={{ height: "140px" }} title={`Expenses: $${bar.expenses}`}>
                              <div className="w-full bg-red-500" style={{ height: `${expPct}%` }} />
                            </div>
                          </div>
                          
                          <span className="text-[8px] uppercase font-bold tracking-wider">{bar.month}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <div className="flex justify-center space-x-6 text-[9px] font-bold">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded" />
                    <span className="text-gray-400">Total Monthly Income</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded" />
                    <span className="text-gray-400">Total Monthly Expenses</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFIT ANALYTICS */}
          {tab === "profit" && (
            <div className="space-y-6">
              {/* Ratios and Averages */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Gross Margin</span>
                  <p className="text-xl font-bold font-mono text-[#FF7A00]">{biData.grossMargin}%</p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Net Margin</span>
                  <p className="text-xl font-bold font-mono text-white">{biData.profitMargin}%</p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Average Monthly Profit</span>
                  <p className="text-xl font-bold font-mono text-emerald-400">${biData.avgMonthlyProfit?.toLocaleString()}</p>
                </div>
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                  <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider">Average Yearly Profit</span>
                  <p className="text-xl font-bold font-mono text-white">${biData.avgYearlyProfit?.toLocaleString()}</p>
                </div>
              </div>

              {/* Detailed Breakdown Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue by Category */}
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-white">Revenue breakdown by Service Category</h3>
                  <div className="space-y-3 font-mono text-[10px]">
                    {Object.entries(biData.revenueByCategory || {}).map(([cat, amt]: any, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-2">
                        <span className="text-gray-400">{cat}</span>
                        <span className="text-white font-bold">${amt.toLocaleString()}</span>
                      </div>
                    ))}
                    {Object.keys(biData.revenueByCategory || {}).length === 0 && (
                      <span className="text-gray-500">No segment data found.</span>
                    )}
                  </div>
                </div>

                {/* Revenue by Client */}
                <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-white">Revenue breakdown by Clients</h3>
                  <div className="space-y-3 font-mono text-[10px]">
                    {Object.entries(biData.revenueByClient || {}).map(([client, amt]: any, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-2">
                        <span className="text-gray-400">{client}</span>
                        <span className="text-white font-bold">${amt.toLocaleString()}</span>
                      </div>
                    ))}
                    {Object.keys(biData.revenueByClient || {}).length === 0 && (
                      <span className="text-gray-500">No client data found.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: FINANCIAL FORECAST */}
          {tab === "forecast" && (
            <div className="space-y-6">
              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-6 rounded-2xl space-y-2">
                <h3 className="font-serif font-bold text-sm text-white">Financial Forecast Console</h3>
                <p className="text-[10px] text-gray-500 leading-relaxed max-w-2xl">
                  Projections are calculated dynamically using: 
                  <span className="text-white font-bold"> (Active Subscriptions MRR × T) + Confirm Bookings + Pending/Overdue Invoices + (Average Historical Non-Recurring Revenue × T)</span>. 
                  Adjust baseline multipliers to evaluate potential growth.
                </p>
              </div>

              {/* Projections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {biData.financialForecast?.map((f: any, idx: number) => (
                  <div key={idx} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-3 text-center glow-card">
                    <span className="text-gray-500 uppercase tracking-widest text-[8px] font-bold block">{f.period} Horizon</span>
                    <p className="text-xl font-bold font-mono text-emerald-400">${f.projected?.toLocaleString()}</p>
                    <span className="text-[8px] text-gray-500 block leading-normal">Sum of MRR, scheduled contracts & historical non-recurring averages.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: ASSET PLANNER & REGISTRY */}
          {tab === "assets" && (
            <div className="space-y-6">
              {/* Asset Tab Internal Navigation */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Goals Listing */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif font-bold text-sm text-white">Active Funding Goals</h3>
                    <span className="text-[10px] text-gray-500 font-mono">Simultaneous Goals Supported</span>
                  </div>

                  <div className="space-y-4">
                    {fundingGoals
                      .filter(g => g.status !== "Purchased")
                      .map((goal) => {
                        const targetCost = goal.target_cost ?? goal.targetCost ?? 0;
                        const currentSavings = goal.current_savings ?? goal.currentSavings ?? 0;
                        const fundingStrategy = goal.funding_strategy ?? goal.fundingStrategy ?? "manual";
                        const strategyVal = goal.strategy_value ?? goal.strategyValue ?? 0;
                        const goalDisplayName = goal.goal_name ?? goal.goalName ?? "Unnamed Goal";
                        const pct = Math.min(100, Math.round((currentSavings / (targetCost || 1)) * 100));
                        const isReady = currentSavings >= targetCost;
                        const remaining = targetCost - currentSavings;
                        
                        return (
                          <div key={goal.id} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-serif font-bold text-sm text-white">{goalDisplayName}</h4>
                                <span className="text-[8px] text-gray-500 uppercase font-mono">{goal.category} &middot; Priority: {goal.priority}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setContribGoal(goal)}
                                  className="bg-[#121A1B] hover:bg-white/5 border border-[#CDD4DD]/10 px-3 py-1.5 rounded-lg text-[9px] font-bold text-[#FF7A00] cursor-pointer"
                                >
                                  Add Funds
                                </button>
                                {isReady && (
                                  <button
                                    onClick={() => setPurchaseGoal(goal)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer border-0"
                                  >
                                    Purchase Asset
                                  </button>
                                )}
                                <button onClick={() => handleDelete("funding-goals", goal.id)} className="p-1.5 text-red-500 hover:bg-white/5 rounded border-0 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono text-gray-400">
                              <div>
                                <span className="block text-[8px] text-gray-500">Target Cost</span>
                                <span className="text-white font-bold">${targetCost.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-gray-500">Saved</span>
                                <span className="text-emerald-400 font-bold">${currentSavings.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-gray-500">Remaining</span>
                                <span className="text-white font-bold">${remaining.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] text-gray-500">Strategy</span>
                                <span className="text-blue-400 uppercase text-[8px]">
                                  {fundingStrategy === "percentage_revenue" ? `${strategyVal}% of revenue` 
                                   : fundingStrategy === "fixed_revenue" ? `$${strategyVal} / project` 
                                   : fundingStrategy === "monthly_fixed" ? `$${strategyVal}/month` 
                                   : "Manual"}
                                </span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[8px] text-gray-500">
                                <span>Progress</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="w-full bg-[#121A1B] h-2 rounded-full overflow-hidden border border-[#CDD4DD]/5">
                                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>

                            {/* Affordability indicator */}
                            <div className="bg-[#121A1B] p-2.5 rounded-xl border border-[#CDD4DD]/5 flex justify-between items-center text-[9px]">
                              <span>Status: <strong className="text-white uppercase">{isReady ? "Ready to Buy" : goal.status}</strong></span>
                              <span>Risk: <strong className={isReady ? "text-emerald-400" : "text-amber-500"}>{isReady ? "Low (Funded)" : "Medium"}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    {fundingGoals.filter(g => g.status !== "Purchased").length === 0 && (
                      <p className="text-center text-gray-500 py-6">No active funding goals. Create one to start saving!</p>
                    )}
                  </div>
                </div>

                {/* Right Side: Simulation and Asset Registry */}
                <div className="space-y-6">
                  {/* Strategy Simulator */}
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-[#FF7A00]" />
                      <h3 className="font-serif font-bold text-sm text-white">Savings Simulator</h3>
                    </div>

                    <div className="space-y-3 text-[10px]">
                      <div>
                        <label className="block text-gray-500 mb-1">Expected Monthly Income ($)</label>
                        <input
                          type="number"
                          value={simRevenue}
                          onChange={(e) => setSimRevenue(e.target.value)}
                          className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">Strategy Saving Percentage (%)</label>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={simPct}
                          onChange={(e) => setSimPct(e.target.value)}
                          className="w-full accent-[#FF7A00]"
                        />
                        <div className="flex justify-between text-gray-500 text-[8px] mt-1">
                          <span>1%</span>
                          <span className="text-[#FF7A00] font-bold">{simPct}% selected</span>
                          <span>50%</span>
                        </div>
                      </div>

                      <div className="bg-[#121A1B] p-3 rounded-xl border border-[#CDD4DD]/5 space-y-1.5 font-mono text-[9px]">
                        <div className="flex justify-between text-gray-400">
                          <span>Expected Monthly Savings:</span>
                          <span className="text-white font-bold">${((parseFloat(simRevenue) || 0) * (parseFloat(simPct) || 0) / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Simulated completion for a $3,000 asset:</span>
                          <span className="text-emerald-400 font-bold">
                            {Math.ceil(3000 / (((parseFloat(simRevenue) || 1) * (parseFloat(simPct) || 1) / 100) || 1))} months
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Asset Registry Summary */}
                  <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-4">
                    <h3 className="font-serif font-bold text-sm text-white">Asset Registry</h3>
                    <p className="text-[10px] text-gray-500">List of owned business machinery, hardware and assets migrated from completed goals.</p>

                    <div className="space-y-3">
                      {assets.map((asset) => (
                        <div key={asset.id} className="bg-[#121A1B] p-3 rounded-xl border border-[#CDD4DD]/5 space-y-1">
                          <h4 className="font-bold text-white text-[10px]">{asset.assetName}</h4>
                          <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                            <span>Cost: ${Number(asset.purchaseCost).toLocaleString()}</span>
                            <span>Date: {asset.purchaseDate}</span>
                          </div>
                          <span className="block text-[8px] text-gray-500 font-mono">SN: {asset.serialNumber || "N/A"}</span>
                        </div>
                      ))}
                      {assets.length === 0 && (
                        <p className="text-center text-gray-500 py-3 text-[9px]">No purchased assets registered.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 10: REPORTS & EXPORT */}
          {tab === "reports" && (
            <div className="space-y-6">
              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl">
                <h3 className="font-serif font-bold text-sm text-white">Business Intelligence Reports & Audit Logs</h3>
                <p className="text-[10px] text-gray-500 mt-1">Select a report format to compile and download audit spreadsheets or print-ready PDF summaries.</p>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { id: "monthly_financial", label: "Monthly Financial Summary", desc: "Revenues vs Expenses for the current calendar month." },
                  { id: "annual_financial", label: "Annual Financial Summary", desc: "YTD month-by-month cash accumulation statement." },
                  { id: "revenue", label: "Revenue Ledger", desc: "Detailed breakdown of all logged business income." },
                  { id: "expense", label: "Expense Ledger", desc: "Detailed breakdown of all logged business expenses." },
                  { id: "subscription", label: "SaaS Subscriptions", desc: "List of active SaaS subscriptions, monthly costs, and upcoming renewal triggers." },
                  { id: "budget", label: "Budget Compliance", desc: "Current month's budget ceilings vs actual spent ratios." },
                  { id: "cash_flow", label: "Cash Flow Statement", desc: "Transaction history ledger detailing incoming and outgoing cash flows." },
                  { id: "funding_goal", label: "Funding Goals Report", desc: "Planning progress details on all active goals." },
                  { id: "savings", label: "Goal Savings Ledger", desc: "Audit logs of contributions allocated to asset goals." },
                  { id: "asset_register", label: "Business Asset Register", desc: "Inventory registry of active business machinery and serial numbers." }
                ].map((rep) => (
                  <div key={rep.id} className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{rep.label}</h4>
                      <p className="text-gray-500 text-[10px] mt-1 leading-relaxed">{rep.desc}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleExport(rep.id, "csv")}
                        className="bg-[#121A1B] hover:bg-white/5 border border-[#CDD4DD]/10 px-3 py-2 rounded-xl text-[9px] font-bold text-gray-300 flex items-center gap-1 cursor-pointer flex-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>CSV</span>
                      </button>
                      <button
                        onClick={() => handleExport(rep.id, "excel")}
                        className="bg-[#121A1B] hover:bg-white/5 border border-[#CDD4DD]/10 px-3 py-2 rounded-xl text-[9px] font-bold text-[#FF7A00] flex items-center gap-1 cursor-pointer flex-1"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Excel</span>
                      </button>
                      <button
                        onClick={() => handleExport(rep.id, "pdf")}
                        className="bg-[#121A1B] hover:bg-white/5 border border-[#CDD4DD]/10 px-3 py-2 rounded-xl text-[9px] font-bold text-emerald-400 flex items-center gap-1 cursor-pointer flex-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {tab === "settings" && (
            <div className="space-y-6 max-w-lg">
              <div className="bg-[#1A2324] border border-[#CDD4DD]/10 p-5 rounded-2xl space-y-4">
                <h3 className="font-serif font-bold text-sm text-white">BI Settings & Seeding</h3>
                <p className="text-[10px] text-gray-500">Configure parameters for taxes, risk calculations, and database initialization.</p>

                <div className="space-y-3 font-mono text-[10px] text-gray-400 pt-2">
                  <div className="flex justify-between border-b border-[#CDD4DD]/5 pb-2">
                    <span>Configured Tax Rate:</span>
                    <span className="text-white font-bold">15% (Editable in code)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#CDD4DD]/5 pb-2">
                    <span>Emergency Reserve Threshold:</span>
                    <span className="text-white font-bold">3 × Average Monthly Expenses</span>
                  </div>
                  <div className="flex justify-between border-b border-[#CDD4DD]/5 pb-2">
                    <span>Currency Reference:</span>
                    <span className="text-white font-bold">USD / HTG</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#CDD4DD]/10 space-y-4">
                  <h4 className="font-bold text-white text-xs">Load Sandbox Datasets</h4>
                  <p className="text-[9px] text-gray-500 leading-normal">
                    If this is your first time loading the Business Intelligence Hub, click the seed button below. It will inject mock revenues, budgets, subscriptions and goals so you can see live calculations in the dashboard.
                  </p>
                  <button
                    onClick={handleSeedMockData}
                    className="bg-[#1A2324] hover:bg-white/5 border border-[#CDD4DD]/15 px-4 py-2.5 rounded-xl text-xs font-bold text-[#FF7A00] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Seed Sample BI Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Manual Contribution Modal */}
      <AnimatePresence>
        {contribGoal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-3">
                <h3 className="font-serif font-bold text-base text-white">Log Goal Contribution</h3>
                <button type="button" onClick={() => setContribGoal(null)} className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleManualContribution} className="space-y-4">
                <div>
                  <span className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Goal Details</span>
                  <p className="text-white font-bold">{contribGoal.goal_name ?? contribGoal.goalName}</p>
                  <p className="text-emerald-500 text-xs font-bold mt-1">Saved: ${(contribGoal.current_savings ?? contribGoal.currentSavings ?? 0).toLocaleString()} / Target: ${(contribGoal.target_cost ?? contribGoal.targetCost ?? 0).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Contribution Amount ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={manualContribAmount}
                    onChange={(e) => setManualContribAmount(e.target.value)}
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    placeholder="Enter amount to contribute"
                  />
                </div>

                <div>
                  <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Source / Note *</label>
                  <input
                    type="text"
                    required
                    value={manualContribSource}
                    onChange={(e) => setManualContribSource(e.target.value)}
                    className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setContribGoal(null)}
                    className="px-4 py-2 border border-[#CDD4DD]/15 text-white text-xs font-bold rounded-xl bg-transparent hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer border-0 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Deposit</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Purchase Asset Modal */}
      <AnimatePresence>
        {purchaseGoal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A2324] border border-[#CDD4DD]/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-3">
                <h3 className="font-serif font-bold text-base text-white">Purchase & Register Asset</h3>
                <button type="button" onClick={() => setPurchaseGoal(null)} className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePurchaseAsset} className="space-y-4">
                <div>
                  <span className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Asset Details</span>
                  <p className="text-white font-bold">{purchaseGoal.goal_name ?? purchaseGoal.goalName}</p>
                  <p className="text-emerald-500 text-xs font-bold mt-1">Purchase Price: ${(purchaseGoal.target_cost ?? purchaseGoal.targetCost ?? 0).toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Serial Number</label>
                    <input
                      type="text"
                      placeholder="e.g. SN-98319-X"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Warranty Expiration</label>
                    <input
                      type="date"
                      value={warrantyExpiration}
                      onChange={(e) => setWarrantyExpiration(e.target.value)}
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Condition</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2.5 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Depreciation (Months)</label>
                    <input
                      type="number"
                      value={depreciationPeriod}
                      onChange={(e) => setDepreciationPeriod(e.target.value)}
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Assigned User</label>
                    <input
                      type="text"
                      value={assignedUser}
                      onChange={(e) => setAssignedUser(e.target.value)}
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-gray-500 uppercase font-bold mb-1">Replacement Est ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 3500"
                      value={replacementEstimate}
                      onChange={(e) => setReplacementEstimate(e.target.value)}
                      className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPurchaseGoal(null)}
                    className="px-4 py-2 border border-[#CDD4DD]/15 text-white text-xs font-bold rounded-xl bg-transparent hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer border-0 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Purchase & Registry</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CRUD Creation Form Modal Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-[#1A2324] border-l border-[#CDD4DD]/10 h-full max-w-md w-full p-6 space-y-4 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-[#CDD4DD]/5 pb-3">
                  <h3 className="font-serif font-bold text-base text-white capitalize">
                    {editingItem ? `Edit ${tab} record` : `Create new ${tab}`}
                  </h3>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* FORM: REVENUE */}
                {tab === "revenue" && (
                  <form onSubmit={(e) => handleSave(e, "revenues", {
                    clientName: (e.target as any).clientName.value,
                    projectName: (e.target as any).projectName.value,
                    category: (e.target as any).category.value,
                    amount: parseFloat((e.target as any).amount.value),
                    currency: (e.target as any).currency.value,
                    paymentMethod: (e.target as any).paymentMethod.value,
                    date: (e.target as any).date.value,
                    status: (e.target as any).status.value,
                    notes: (e.target as any).notes.value
                  })} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Client *</label>
                      <input type="text" name="clientName" defaultValue={editingItem?.clientName || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Project Name *</label>
                      <input type="text" name="projectName" defaultValue={editingItem?.projectName || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Category *</label>
                      <select name="category" defaultValue={editingItem?.category || "Software Development"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                        <option value="Software Development">Software Development</option>
                        <option value="AI Consulting">AI Consulting</option>
                        <option value="Digital Transformation">Digital Transformation</option>
                        <option value="Discovery Calls">Discovery Calls</option>
                        <option value="Training">Training</option>
                        <option value="Speaking">Speaking</option>
                        <option value="Digital Products">Digital Products</option>
                        <option value="Affiliate">Affiliate</option>
                        <option value="Maintenance Contracts">Maintenance Contracts</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Amount ($) *</label>
                        <input type="number" step="any" name="amount" defaultValue={editingItem?.amount || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none text-right" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Currency</label>
                        <select name="currency" defaultValue={editingItem?.currency || "USD"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                          <option value="USD">USD ($)</option>
                          <option value="HTG">HTG (Gourdes)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Method</label>
                        <input type="text" name="paymentMethod" defaultValue={editingItem?.paymentMethod || "stripe"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Date *</label>
                        <input type="date" name="date" defaultValue={editingItem?.date || new Date().toISOString().split("T")[0]} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Status</label>
                      <select name="status" defaultValue={editingItem?.status || "paid"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Notes</label>
                      <textarea name="notes" rows={3} defaultValue={editingItem?.notes || ""} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none resize-none" />
                    </div>
                    <button type="submit" className="w-full bg-[#FF7A00] hover:bg-opacity-95 text-white font-bold py-2.5 rounded-xl border-0 cursor-pointer">Save Revenue</button>
                  </form>
                )}

                {/* FORM: EXPENSE */}
                {tab === "expense" && (
                  <form onSubmit={(e) => handleSave(e, "expenses", {
                    expenseName: (e.target as any).expenseName.value,
                    category: (e.target as any).category.value,
                    vendor: (e.target as any).vendor.value,
                    amount: parseFloat((e.target as any).amount.value),
                    currency: (e.target as any).currency.value,
                    paymentMethod: (e.target as any).paymentMethod.value,
                    date: (e.target as any).date.value,
                    recurring: (e.target as any).recurring.checked,
                    frequency: (e.target as any).frequency.value,
                    notes: (e.target as any).notes.value
                  })} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Expense Item Name *</label>
                      <input type="text" name="expenseName" defaultValue={editingItem?.expenseName || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Category *</label>
                      <select name="category" defaultValue={editingItem?.category || "Software"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                        <option value="Software">Software</option>
                        <option value="AI Tools">AI Tools</option>
                        <option value="Cloud Services">Cloud Services</option>
                        <option value="Hosting">Hosting</option>
                        <option value="Domains">Domains</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Advertising">Advertising</option>
                        <option value="Travel">Travel</option>
                        <option value="Education">Education</option>
                        <option value="Office">Office</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Accounting">Accounting</option>
                        <option value="Taxes">Taxes</option>
                        <option value="Bank Fees">Bank Fees</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Vendor *</label>
                      <input type="text" name="vendor" defaultValue={editingItem?.vendor || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Amount ($) *</label>
                        <input type="number" step="any" name="amount" defaultValue={editingItem?.amount || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none text-right" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Currency</label>
                        <select name="currency" defaultValue={editingItem?.currency || "USD"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                          <option value="USD">USD ($)</option>
                          <option value="HTG">HTG (Gourdes)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Method</label>
                        <input type="text" name="paymentMethod" defaultValue={editingItem?.paymentMethod || "Credit Card"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Date *</label>
                        <input type="date" name="date" defaultValue={editingItem?.date || new Date().toISOString().split("T")[0]} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-[#121A1B] p-2.5 rounded-xl border border-[#CDD4DD]/5">
                      <input type="checkbox" name="recurring" defaultChecked={editingItem?.recurring || false} className="accent-[#FF7A00]" />
                      <label className="text-[10px] text-gray-400 font-bold">Is this a recurring operational expense?</label>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Frequency</label>
                      <select name="frequency" defaultValue={editingItem?.frequency || "monthly"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="one-time">One-time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Notes</label>
                      <textarea name="notes" rows={3} defaultValue={editingItem?.notes || ""} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none resize-none" />
                    </div>
                    <button type="submit" className="w-full bg-red-600 hover:bg-opacity-95 text-white font-bold py-2.5 rounded-xl border-0 cursor-pointer">Save Expense</button>
                  </form>
                )}

                {/* FORM: SUBSCRIPTION */}
                {tab === "subscriptions" && (
                  <form onSubmit={(e) => handleSave(e, "subscriptions", {
                    serviceName: (e.target as any).serviceName.value,
                    category: (e.target as any).category.value,
                    vendor: (e.target as any).vendor.value,
                    monthlyCost: parseFloat((e.target as any).monthlyCost.value),
                    yearlyCost: parseFloat((e.target as any).yearlyCost.value),
                    renewalDate: (e.target as any).renewalDate.value,
                    autoRenew: (e.target as any).autoRenew.checked,
                    website: (e.target as any).website.value,
                    paymentMethod: (e.target as any).paymentMethod.value,
                    status: (e.target as any).status.value,
                    notes: (e.target as any).notes.value
                  })} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">SaaS Service Name *</label>
                      <input type="text" name="serviceName" defaultValue={editingItem?.serviceName || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Category *</label>
                        <input type="text" name="category" defaultValue={editingItem?.category || "AI Tools"} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Vendor *</label>
                        <input type="text" name="vendor" defaultValue={editingItem?.vendor || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Monthly Cost ($) *</label>
                        <input type="number" step="any" name="monthlyCost" defaultValue={editingItem?.monthlyCost || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none text-right" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Yearly Cost ($) *</label>
                        <input type="number" step="any" name="yearlyCost" defaultValue={editingItem?.yearlyCost || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none text-right" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Renewal Date *</label>
                        <input type="date" name="renewalDate" defaultValue={editingItem?.renewalDate || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Status</label>
                        <select name="status" defaultValue={editingItem?.status || "active"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-[#121A1B] p-2.5 rounded-xl border border-[#CDD4DD]/5">
                      <input type="checkbox" name="autoRenew" defaultChecked={editingItem?.autoRenew ?? true} className="accent-[#FF7A00]" />
                      <label className="text-[10px] text-gray-400 font-bold">Auto-renew active</label>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Website URL (no https)</label>
                      <input type="text" name="website" defaultValue={editingItem?.website || ""} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" placeholder="e.g. claude.ai" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Payment Method</label>
                      <input type="text" name="paymentMethod" defaultValue={editingItem?.paymentMethod || "Credit Card"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Notes</label>
                      <textarea name="notes" rows={2} defaultValue={editingItem?.notes || ""} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none resize-none" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-opacity-95 text-white font-bold py-2.5 rounded-xl border-0 cursor-pointer">Save Subscription</button>
                  </form>
                )}

                {/* FORM: BUDGETS (Allocated Ceiling Updates) */}
                {tab === "budget" && (
                  <form onSubmit={(e) => handleSave(e, "budgets", {
                    category: (e.target as any).category.value,
                    allocatedBudget: parseFloat((e.target as any).allocatedBudget.value),
                    year: currentYear,
                    month: currentMonth
                  })} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Budget Category *</label>
                      <select name="category" defaultValue={editingItem?.category || "Software"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                        <option value="Software">Software</option>
                        <option value="AI">AI</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Travel">Travel</option>
                        <option value="Office">Office</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Allocated Budget Ceiling ($) *</label>
                      <input type="number" name="allocatedBudget" defaultValue={editingItem?.allocatedBudget || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none text-right" />
                    </div>
                    <button type="submit" className="w-full bg-[#FF7A00] hover:bg-opacity-95 text-white font-bold py-2.5 rounded-xl border-0 cursor-pointer">Update Budget Ceiling</button>
                  </form>
                )}

                {/* FORM: FUNDING GOALS */}
                {tab === "assets" && (
                  <form onSubmit={(e) => handleSave(e, "funding-goals", {
                    goalName: (e.target as any).goalName.value,
                    category: (e.target as any).category.value,
                    description: (e.target as any).description.value,
                    vendor: (e.target as any).vendor.value,
                    purchaseUrl: (e.target as any).purchaseUrl.value,
                    mediaUrl: (e.target as any).mediaUrl.value,
                    targetCost: parseFloat((e.target as any).targetCost.value),
                    currency: (e.target as any).currency.value,
                    currentSavings: parseFloat((e.target as any).currentSavings.value || 0),
                    desiredPurchaseDate: (e.target as any).desiredPurchaseDate.value,
                    priority: (e.target as any).priority.value,
                    status: editingItem?.status || "Planned",
                    fundingStrategy: (e.target as any).fundingStrategy.value,
                    strategyValue: parseFloat((e.target as any).strategyValue.value)
                  })} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Goal / Investment Name *</label>
                      <input type="text" name="goalName" defaultValue={editingItem?.goalName || ""} placeholder="e.g. MacBook Pro M4" required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Category *</label>
                        <input type="text" name="category" defaultValue={editingItem?.category || "Equipment"} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Priority</label>
                        <select name="priority" defaultValue={editingItem?.priority || "Medium"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Target Cost ($) *</label>
                        <input type="number" name="targetCost" defaultValue={editingItem?.targetCost || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none text-right" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Current Savings ($)</label>
                        <input type="number" name="currentSavings" defaultValue={editingItem?.currentSavings || 0} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none text-right" disabled={!!editingItem} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Funding Strategy *</label>
                        <select name="fundingStrategy" defaultValue={editingItem?.fundingStrategy || "percentage_revenue"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                          <option value="percentage_revenue">Percentage of Payments</option>
                          <option value="fixed_revenue">Fixed / Completed Project</option>
                          <option value="monthly_fixed">Monthly Fixed Contribution</option>
                          <option value="manual">Manual Deposits Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Strategy Value (%, $ or $/Mo) *</label>
                        <input type="number" name="strategyValue" defaultValue={editingItem?.strategyValue || ""} required className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none text-right" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Desired Purchase Date</label>
                        <input type="date" name="desiredPurchaseDate" defaultValue={editingItem?.desiredPurchaseDate || ""} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Currency</label>
                        <select name="currency" defaultValue={editingItem?.currency || "USD"} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer">
                          <option value="USD">USD ($)</option>
                          <option value="HTG">HTG (Gourdes)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Vendor</label>
                      <input type="text" name="vendor" defaultValue={editingItem?.vendor || ""} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Purchase / Reference URL</label>
                      <input type="text" name="purchaseUrl" defaultValue={editingItem?.purchaseUrl || ""} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Media / Image URL</label>
                      <input type="text" name="mediaUrl" defaultValue={editingItem?.mediaUrl || ""} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-[#CDD4DD]/40 mb-1">Description / Notes</label>
                      <textarea name="description" rows={3} defaultValue={editingItem?.description || ""} className="w-full bg-[#121A1B] border border-[#CDD4DD]/10 rounded-xl px-4 py-2 text-white focus:outline-none resize-none" />
                    </div>
                    <button type="submit" className="w-full bg-[#FF7A00] hover:bg-opacity-95 text-white font-bold py-2.5 rounded-xl border-0 cursor-pointer">Save Goal</button>
                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
