"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AdminService,
  ExpenseService,
  InventoryService,
  InvoiceService,
  LeadsService,
} from "@/services";
import { RootState } from "@/store";
import { User } from "@/types";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FiActivity,
  FiArrowDown,
  FiArrowUp,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiFileText,
  FiPackage,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { LuCalendarRange } from "react-icons/lu";
import { MdCheckCircle, MdPending } from "react-icons/md";
import { useSelector } from "react-redux";

// ============================
// TYPES & INTERFACES
// ============================
interface DashboardStats {
  totalSalesOfficers: number;
  activeSalesOfficers: number;
  totalLeads: number;
  totalInvoices: number;
  totalInventory: number;
  pendingInvoices: number;
  completedLeads: number;
  todayExpenses: number;
}

interface OfficerPerformance {
  salesOfficerId: string;
  full_name: string;
  email: string;
  leadCounts: {
    pending: number;
    in_progress: number;
    completed: number;
    total: number;
  };
}

type PerformancePeriod = "daily" | "weekly" | "monthly" | "custom";

interface TrendData {
  current: number;
  previous: number;
  percentage: number;
  isPositive: boolean;
}

// ============================
// MAIN COMPONENT
// ============================
const SuperAdminHomePageTemplate = () => {
  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  // Services
  const expenseService = new ExpenseService();
  const leadService = new LeadsService();
  const invoiceService = new InvoiceService();
  const inventoryService = new InventoryService();
  const adminService = new AdminService();

  // === STATE MANAGEMENT ===
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSalesOfficers: 0,
    activeSalesOfficers: 0,
    totalLeads: 0,
    totalInvoices: 0,
    totalInventory: 0,
    pendingInvoices: 0,
    completedLeads: 0,
    todayExpenses: 0,
  });

  const [expenseSummary, setExpenseSummary] = useState({
    today: 0,
    yesterday: 0,
    last7: 0,
    last30: 0,
  });

  const [expenseTrends, setExpenseTrends] = useState<TrendData>({
    current: 0,
    previous: 0,
    percentage: 0,
    isPositive: false,
  });

  const [officerReports, setOfficerReports] = useState<OfficerPerformance[]>(
    [],
  );

  const [performancePeriod, setPerformancePeriod] =
    useState<PerformancePeriod>("monthly");
  const [performanceCustomRange, setPerformanceCustomRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [invoiceStats, setInvoiceStats] = useState({
    pending: 0,
    received: 0,
    cancelled: 0,
    totalAmount: 0,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  const [isLeadsLoading, setIsLeadsLoading] = useState(true);

  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportRange, setReportRange] = useState<
    "today" | "yesterday" | "last7" | "last30" | "custom"
  >("last30");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch sales officers performance
  const fetchOfficerPerformance = async (
    period: PerformancePeriod,
    customRange?: { from: Date | undefined; to: Date | undefined },
  ) => {
    if (period === "custom" && (!customRange?.from || !customRange?.to)) {
      return;
    }

    setIsLeadsLoading(true);
    try {
      const response = await adminService.getSalesOfficersPerformance({
        period,
        ...(period === "custom" && customRange?.from && customRange?.to
          ? {
              from: format(customRange.from, "yyyy-MM-dd"),
              to: format(customRange.to, "yyyy-MM-dd"),
            }
          : {}),
      });
      setOfficerReports(response.data);
    } catch (err) {
      console.error("Failed to fetch officer performance", err);
      setOfficerReports([]);
    } finally {
      setIsLeadsLoading(false);
    }
  };

  // ============================
  // DATA FETCHING FUNCTIONS
  // ============================

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const [
        salesOfficers,
        leadsRes,
        invoicesRes,
        inventoryRes,
        todayExpenses,
      ] = await Promise.all([
        adminService.getAllSalesOfficerMadeByAdmin(1, 1000),
        leadService.getLeads(1, 1000, {}),
        invoiceService.getInvoicesReportedToMe(1, 1000, {}),
        inventoryService.getInventory(1, 1000, {}),
        expenseService.getExpenses(1, 1000, { dateFilter: "today" }),
      ]);

      const activeSO = salesOfficers.data.filter(
        (so: User) => so.status === "active",
      ).length;
      const completedLeads = leadsRes.data.filter(
        (lead: any) => lead.status === "completed",
      ).length;
      const pendingInvoices = invoicesRes.data.filter(
        (inv: any) => inv.status === "pending",
      ).length;
      const todayExpenseTotal = todayExpenses.data.reduce(
        (sum: number, e: any) => sum + (e.amount || 0),
        0,
      );

      setDashboardStats({
        totalSalesOfficers: salesOfficers.pagination.total,
        activeSalesOfficers: activeSO,
        totalLeads: leadsRes.pagination.total,
        totalInvoices: invoicesRes.pagination.total,
        totalInventory: inventoryRes.pagination.total,
        pendingInvoices,
        completedLeads,
        todayExpenses: todayExpenseTotal,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenseSummary = async () => {
    setIsExpensesLoading(true);
    try {
      // Use the new simplified Stats API
      const stats = await expenseService.getExpensesStats();

      setExpenseSummary({
        today: stats.today || 0,
        yesterday: stats.yesterday || 0,
        last7: stats.last7Days || 0,
        last30: stats.last30Days || 0,
      });

      // Calculate trend for last 7 days (optional - if you want to keep the trend feature)
      // This requires an additional API call to get previous week data
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const prevWeekStart = subDays(weekStart, 7);
      const prevWeekEnd = subDays(weekStart, 1);

      const prevWeekRes = await expenseService.getExpenses(1, 1000, {
        customDateRange: { from: prevWeekStart, to: prevWeekEnd },
      });

      const prevWeekTotal = prevWeekRes.data.reduce(
        (sum: number, item: any) => sum + (item.amount || 0),
        0,
      );

      const percentageChange =
        prevWeekTotal > 0
          ? ((stats.last7Days - prevWeekTotal) / prevWeekTotal) * 100
          : 0;

      setExpenseTrends({
        current: stats.last7Days || 0,
        previous: prevWeekTotal,
        percentage: Math.abs(percentageChange),
        isPositive: percentageChange >= 0,
      });
    } catch (err) {
      console.error("Failed to fetch expense summary", err);
      setExpenseSummary({
        today: 0,
        yesterday: 0,
        last7: 0,
        last30: 0,
      });
    } finally {
      setIsExpensesLoading(false);
    }
  };

  const fetchInvoiceStats = async () => {
    try {
      const invoicesRes = await invoiceService.getInvoicesReportedToMe(
        1,
        1000,
        {},
      );
      const invoices = invoicesRes.data;

      const pending = invoices.filter(
        (inv: any) => inv.status === "pending",
      ).length;
      const received = invoices.filter(
        (inv: any) => inv.status === "received_so",
      ).length;
      const cancelled = invoices.filter(
        (inv: any) => inv.status === "cancelled",
      ).length;
      const totalAmount = invoices.reduce(
        (sum: number, inv: any) => sum + (inv.amount || 0),
        0,
      );

      setInvoiceStats({ pending, received, cancelled, totalAmount });
    } catch (err) {
      console.error("Failed to fetch invoice stats", err);
    }
  };

  useEffect(() => {
    if (user?.role.role_type === "super_admin") {
      fetchDashboardStats();
      fetchExpenseSummary();
      fetchOfficerPerformance(performancePeriod);
      fetchInvoiceStats();
    }
  }, [user]);

  useEffect(() => {
    if (
      user?.role.role_type === "super_admin" &&
      performancePeriod !== "custom"
    ) {
      fetchOfficerPerformance(performancePeriod);
    }
  }, [performancePeriod, user]);

  const [isCustomPopoverOpen, setIsCustomPopoverOpen] = useState(false);

  const handleApplyCustomRange = () => {
    if (!performanceCustomRange.from || !performanceCustomRange.to) return;
    setPerformancePeriod("custom");
    fetchOfficerPerformance("custom", performanceCustomRange);
    setIsCustomPopoverOpen(false);
  };

  const generatePdfReport = async () => {
    setIsGenerating(true);
    try {
      let fromDate: Date | undefined;
      let toDate: Date | undefined;

      const now = new Date();
      switch (reportRange) {
        case "today":
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          toDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999,
          );
          break;
        case "yesterday":
          fromDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1,
          );
          toDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1,
            23,
            59,
            59,
            999,
          );
          break;
        case "last7":
          fromDate = subDays(now, 6);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(now);
          toDate.setHours(23, 59, 59, 999);
          break;
        case "last30":
          fromDate = subDays(now, 29);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(now);
          toDate.setHours(23, 59, 59, 999);
          break;
        case "custom":
          if (!customDateRange.from || !customDateRange.to) {
            alert("Please select both From and To dates for custom range.");
            setIsGenerating(false);
            return;
          }
          fromDate = new Date(customDateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(customDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          break;
        default:
          throw new Error("Invalid report range");
      }

      if (!fromDate || !toDate) {
        alert("Please select a valid date range.");
        setIsGenerating(false);
        return;
      }

      console.log("Fetching expenses with filters:", {
        customDateFrom: fromDate.toISOString().split("T")[0],
        customDateTo: toDate.toISOString().split("T")[0],
      });

      // 👇 Call the API with the customDateRange filter
      const expenses = await expenseService.getExpenses(1, 10000, {
        customDateRange: { from: fromDate, to: toDate },
      });

      if (!expenses.data || expenses.data.length === 0) {
        alert("No expenses found for the selected period.");
        setIsGenerating(false);
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(20, 44, 75);
      doc.text("Fatima Marketing", 14, 20);

      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.text("Expense Report", 14, 28);

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Period: ${format(fromDate, "dd MMM yyyy")} – ${format(toDate, "dd MMM yyyy")}`,
        14,
        36,
      );
      doc.text(`Generated: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 42);

      autoTable(doc, {
        startY: 50,
        head: [["Date", "Expense Name", "Amount (PKR)"]],
        body: expenses.data.map((e: any) => [
          format(new Date(e.createdAt), "dd MMM yyyy"),
          e.name,
          `Rs. ${e.amount.toLocaleString()}`,
        ]),
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: {
          fillColor: [0, 183, 232],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      const total = expenses.data.reduce(
        (sum: number, e: any) => sum + e.amount,
        0,
      );

      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(20, 44, 75);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Expenses: Rs. ${total.toLocaleString()}`, 14, finalY);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Report contains ${expenses.data.length} expense entries`,
        14,
        finalY + 8,
      );

      doc.save(
        `Expense_Report_${format(fromDate, "yyyy-MM-dd")}_to_${format(toDate, "yyyy-MM-dd")}.pdf`,
      );
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
      setIsReportModalOpen(false);
    }
  };

  // ============================
  // SKELETON LOADERS
  // ============================
  const StatCardSkeleton = () => (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mt-1" />
      </CardContent>
    </Card>
  );

  const ExpenseCardSkeleton = () => (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
      </CardContent>
    </Card>
  );

  const OfficerCardSkeleton = () => (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-10 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between mb-1">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/6" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-300 h-2 rounded-full w-1/2" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  // ============================
  // RENDER
  // ============================
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 min-h-screen">
      <main className="max-w-[95%] mx-auto px-1 sm:px-6 py-8">
        {/* ===== HEADER ===== */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#00B7E8] to-[#0095c4] shadow-lg shadow-[#00B7E8]/20">
                <FiShield className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#142C4B]">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-slate-500">
                  Welcome back,{" "}
                  <span className="font-medium text-slate-700">
                    {user?.full_name || "Admin"}
                  </span>
                </p>
              </div>
            </div>
          </div>
          {/* <p className="text-sm lg:text-base text-slate-600 ml-[52px]">
            Comprehensive overview of your business operations and team
            performance
          </p> */}
          <hr className="border-slate-200 mt-5" />
        </div>

        {/* ===== KEY METRICS GRID ===== */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#142C4B]">
            <FiActivity className="text-[#00B7E8]" />
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Sales Officers"
                  value={dashboardStats.totalSalesOfficers}
                  subtitle={`${dashboardStats.activeSalesOfficers} active`}
                  icon={<FiUsers className="text-2xl" />}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  trend={
                    dashboardStats.activeSalesOfficers > 0
                      ? {
                          value: Math.round(
                            (dashboardStats.activeSalesOfficers /
                              dashboardStats.totalSalesOfficers) *
                              100,
                          ),
                          isPositive: true,
                        }
                      : undefined
                  }
                />
                <StatCard
                  title="Total Leads"
                  value={dashboardStats.totalLeads}
                  subtitle={`${dashboardStats.completedLeads} completed`}
                  icon={<FiFileText className="text-2xl" />}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                  trend={
                    dashboardStats.completedLeads > 0
                      ? {
                          value: Math.round(
                            (dashboardStats.completedLeads /
                              dashboardStats.totalLeads) *
                              100,
                          ),
                          isPositive: true,
                        }
                      : undefined
                  }
                />
                <StatCard
                  title="Invoices"
                  value={dashboardStats.totalInvoices}
                  subtitle={`${dashboardStats.pendingInvoices} pending`}
                  icon={<FiDollarSign className="text-2xl" />}
                  iconBg="bg-purple-50"
                  iconColor="text-purple-600"
                  trend={
                    dashboardStats.pendingInvoices > 0
                      ? {
                          value: dashboardStats.pendingInvoices,
                          isPositive: false,
                        }
                      : undefined
                  }
                />
                <StatCard
                  title="Inventory Items"
                  value={dashboardStats.totalInventory}
                  subtitle="Total properties"
                  icon={<FiPackage className="text-2xl" />}
                  iconBg="bg-orange-50"
                  iconColor="text-orange-600"
                />
              </>
            )}
          </div>
        </section>

        {/* ===== TWO COLUMN LAYOUT ===== */}
        <div className="grid gap-6 mb-8">
          {/* LEFT COLUMN - Expenses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Summary */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 text-[#142C4B]">
                    <FiDollarSign className="text-[#00B7E8]" />
                    Expense Summary
                  </h2>
                  <p className="text-sm text-slate-500">
                    Track your spending patterns
                  </p>
                </div>
                <Button
                  onClick={() => setIsReportModalOpen(true)}
                  size="sm"
                  className="flex items-center gap-2 h-11 px-5 rounded-lg bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white font-medium shadow-sm shadow-[#00B7E8]/20 hover:shadow-lg hover:shadow-[#00B7E8]/30 transition-all duration-200"
                >
                  <FiDownload className="text-base" />
                  Generate Report
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isExpensesLoading ? (
                  <>
                    <ExpenseCardSkeleton />
                    <ExpenseCardSkeleton />
                    <ExpenseCardSkeleton />
                    <ExpenseCardSkeleton />
                  </>
                ) : (
                  <>
                    <ExpenseSummaryCard
                      title="Today"
                      amount={expenseSummary.today}
                      icon={<FiClock className="text-base" />}
                    />
                    <ExpenseSummaryCard
                      title="Yesterday"
                      amount={expenseSummary.yesterday}
                      icon={<FiClock className="text-base" />}
                    />
                    <ExpenseSummaryCard
                      title="Last 7 Days"
                      amount={expenseSummary.last7}
                      icon={<FiTrendingUp className="text-base" />}
                      trend={expenseTrends}
                    />
                    <ExpenseSummaryCard
                      title="Last 30 Days"
                      amount={expenseSummary.last30}
                      icon={<FiActivity className="text-base" />}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Invoice Overview */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#142C4B]">
                <FiFileText className="text-[#00B7E8]" />
                Invoice Overview
              </h2>
              <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all rounded-2xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <InvoiceMetric
                      label="Pending"
                      value={invoiceStats.pending}
                      icon={<MdPending className="text-2xl" />}
                      color="text-yellow-600"
                      bgColor="bg-yellow-50"
                    />
                    <InvoiceMetric
                      label="Received"
                      value={invoiceStats.received}
                      icon={<MdCheckCircle className="text-2xl" />}
                      color="text-green-600"
                      bgColor="bg-green-50"
                    />
                    <InvoiceMetric
                      label="Cancelled"
                      value={invoiceStats.cancelled}
                      icon={<FiX className="text-2xl" />}
                      color="text-red-600"
                      bgColor="bg-red-50"
                    />
                    <InvoiceMetric
                      label="Total Amount"
                      value={`${(invoiceStats.totalAmount / 1000).toFixed(0)}K`}
                      icon={<FiDollarSign className="text-2xl" />}
                      color="text-blue-600"
                      bgColor="bg-blue-50"
                      isAmount
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>

        {/* ===== SALES OFFICERS PERFORMANCE ===== */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#142C4B]">
                <FiUsers className="text-[#00B7E8]" />
                Sales Officers Performance
              </h2>
              <p className="text-sm text-slate-500">
                Lead status breakdown by assigned officer
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={performancePeriod === p ? "default" : "outline"}
                  onClick={() => setPerformancePeriod(p)}
                  className={cn(
                    "h-9 px-4 rounded-lg font-medium capitalize transition-all duration-200",
                    performancePeriod === p
                      ? "bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white shadow-sm shadow-[#00B7E8]/20"
                      : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                  )}
                >
                  {p}
                </Button>
              ))}

              <Popover
                open={isCustomPopoverOpen}
                onOpenChange={setIsCustomPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant={
                      performancePeriod === "custom" ? "default" : "outline"
                    }
                    className={cn(
                      "h-9 px-4 rounded-lg font-medium flex items-center gap-1.5 transition-all duration-200",
                      performancePeriod === "custom"
                        ? "bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white shadow-sm shadow-[#00B7E8]/20"
                        : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                    )}
                  >
                    <LuCalendarRange className="text-sm" />
                    {performancePeriod === "custom" &&
                    performanceCustomRange.from &&
                    performanceCustomRange.to
                      ? `${format(performanceCustomRange.from, "dd MMM")} – ${format(performanceCustomRange.to, "dd MMM")}`
                      : "Custom"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-4 rounded-2xl border-gray-200 shadow-xl"
                  align="end"
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                        From
                      </p>
                      <Calendar
                        mode="single"
                        selected={performanceCustomRange.from}
                        onSelect={(date) =>
                          setPerformanceCustomRange((prev) => ({
                            ...prev,
                            from: date,
                          }))
                        }
                        initialFocus
                        classNames={{
                          day_selected:
                            "bg-[#00B7E8] text-white hover:bg-[#0095c4] rounded-lg",
                          day_today: "bg-gray-100 text-gray-900 rounded-lg",
                          day: "hover:bg-gray-50 rounded-lg",
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                        To
                      </p>
                      <Calendar
                        mode="single"
                        selected={performanceCustomRange.to}
                        onSelect={(date) =>
                          setPerformanceCustomRange((prev) => ({
                            ...prev,
                            to: date,
                          }))
                        }
                        classNames={{
                          day_selected:
                            "bg-[#00B7E8] text-white hover:bg-[#0095c4] rounded-lg",
                          day_today: "bg-gray-100 text-gray-900 rounded-lg",
                          day: "hover:bg-gray-50 rounded-lg",
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="w-full h-10 rounded-lg bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white font-medium shadow-sm shadow-[#00B7E8]/20"
                      disabled={
                        !performanceCustomRange.from ||
                        !performanceCustomRange.to
                      }
                      onClick={handleApplyCustomRange}
                    >
                      Apply Range
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isLeadsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <OfficerCardSkeleton />
              <OfficerCardSkeleton />
              <OfficerCardSkeleton />
            </div>
          ) : officerReports.length === 0 ? (
            <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl">
              <CardContent className="p-12 text-center">
                <FiUsers className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  No sales officers available yet
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Sales officers will appear here once assigned
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {officerReports.map((so) => {
                const { leadCounts } = so;
                const completionRate =
                  leadCounts.total > 0
                    ? Math.round(
                        (leadCounts.completed / leadCounts.total) * 100,
                      )
                    : 0;

                return (
                  <Card
                    key={so.salesOfficerId}
                    className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <CardTitle className="text-base font-semibold text-slate-900">
                          {so.full_name}
                        </CardTitle>
                        <span className="text-xs font-bold text-[#00B7E8] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                          {leadCounts.total} leads
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">{so.email}</p>

                      <div className="space-y-2.5">
                        <StatusRow
                          label="Pending"
                          count={leadCounts.pending}
                          total={leadCounts.total}
                          color="bg-yellow-50 text-yellow-700 border border-yellow-200"
                        />
                        <StatusRow
                          label="In Progress"
                          count={leadCounts.in_progress}
                          total={leadCounts.total}
                          color="bg-blue-50 text-blue-700 border border-blue-200"
                        />
                        <StatusRow
                          label="Completed"
                          count={leadCounts.completed}
                          total={leadCounts.total}
                          color="bg-green-50 text-green-700 border border-green-200"
                        />
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-500 font-medium">
                            Completion Rate
                          </span>
                          <span className="font-semibold text-slate-700">
                            {completionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ===== GENERATE REPORT MODAL ===== */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#00B7E8] to-[#0095c4] shadow-lg shadow-[#00B7E8]/20">
                  <LuCalendarRange className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Generate Report
                  </h3>
                  <p className="text-xs text-gray-500">
                    Export expense data as PDF
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Time Period
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["today", "yesterday", "last7", "last30"] as const).map(
                    (range) => (
                      <Button
                        key={range}
                        variant={reportRange === range ? "default" : "outline"}
                        onClick={() => setReportRange(range)}
                        className={cn(
                          "h-11 rounded-lg font-medium transition-all duration-200",
                          reportRange === range
                            ? "bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white shadow-sm shadow-[#00B7E8]/20"
                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                        )}
                      >
                        {range === "today"
                          ? "Today"
                          : range === "yesterday"
                            ? "Yesterday"
                            : range === "last7"
                              ? "Last 7 Days"
                              : "Last 30 Days"}
                      </Button>
                    ),
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Custom Date Range
                </label>
                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal h-11 rounded-lg border-gray-200 hover:border-[#00B7E8]"
                      >
                        {customDateRange.from ? (
                          format(customDateRange.from, "dd MMM yyyy")
                        ) : (
                          <span className="text-gray-400">From...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 shadow-xl">
                      <Calendar
                        mode="single"
                        selected={customDateRange.from}
                        onSelect={(date) => {
                          setCustomDateRange((prev) => ({
                            ...prev,
                            from: date,
                          }));
                          setReportRange("custom");
                        }}
                        initialFocus
                        classNames={{
                          day_selected:
                            "bg-[#00B7E8] text-white hover:bg-[#0095c4] rounded-lg",
                          day_today: "bg-gray-100 text-gray-900 rounded-lg",
                          day: "hover:bg-gray-50 rounded-lg",
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal h-11 rounded-lg border-gray-200 hover:border-[#00B7E8]"
                      >
                        {customDateRange.to ? (
                          format(customDateRange.to, "dd MMM yyyy")
                        ) : (
                          <span className="text-gray-400">To...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 shadow-xl">
                      <Calendar
                        mode="single"
                        selected={customDateRange.to}
                        onSelect={(date) => {
                          setCustomDateRange((prev) => ({ ...prev, to: date }));
                          setReportRange("custom");
                        }}
                        initialFocus
                        classNames={{
                          day_selected:
                            "bg-[#00B7E8] text-white hover:bg-[#0095c4] rounded-lg",
                          day_today: "bg-gray-100 text-gray-900 rounded-lg",
                          day: "hover:bg-gray-50 rounded-lg",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 h-11 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generatePdfReport}
                  disabled={isGenerating}
                  className="flex-1 h-11 rounded-lg font-medium bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white shadow-sm shadow-[#00B7E8]/20 hover:shadow-lg hover:shadow-[#00B7E8]/30 transition-all duration-200 disabled:opacity-70"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiDownload className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================
// REUSABLE COMPONENTS
// ============================

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  trend,
}: StatCardProps) => (
  <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <div className={iconColor}>{icon}</div>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold",
              trend.isPositive
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200",
            )}
          >
            {trend.isPositive ? (
              <FiArrowUp className="text-xs" />
            ) : (
              <FiArrowDown className="text-xs" />
            )}
            {trend.value}
            {typeof trend.value === "number" &&
            trend.value < 100 &&
            title !== "Invoices"
              ? "%"
              : ""}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </CardContent>
  </Card>
);

interface ExpenseSummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: TrendData;
}

const ExpenseSummaryCard = ({
  title,
  amount,
  icon,
  trend,
}: ExpenseSummaryCardProps) => (
  <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <div className="text-slate-400 bg-gray-50 p-1.5 rounded-lg">{icon}</div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-xl font-bold text-[#00B7E8] mb-1">
        Rs. {amount.toLocaleString()}
      </p>
      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          {trend.isPositive ? (
            <FiTrendingUp className="text-green-500" />
          ) : (
            <FiTrendingUp className="text-red-500" />
          )}
          <span
            className={cn(
              "font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600",
            )}
          >
            {trend.percentage.toFixed(1)}% vs last week
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

interface StatusRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

const StatusRow = ({ label, count, total, color }: StatusRowProps) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-600 font-medium">{label}</span>
      <div className="flex items-center gap-2.5">
        <span className="text-xs text-slate-400 font-medium">
          {percentage}%
        </span>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold min-w-[40px] text-center",
            color,
          )}
        >
          {count}
        </span>
      </div>
    </div>
  );
};

interface InvoiceMetricProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isAmount?: boolean;
}

const InvoiceMetric = ({
  label,
  value,
  icon,
  color,
  bgColor,
  isAmount,
}: InvoiceMetricProps) => (
  <div className="flex flex-col items-center text-center">
    <div className={cn("p-3 rounded-xl mb-2", bgColor)}>
      <div className={color}>{icon}</div>
    </div>
    <p className={cn("text-2xl font-bold mb-1", color)}>
      {isAmount && "Rs. "}
      {value}
    </p>
    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
      {label}
    </p>
  </div>
);

export default SuperAdminHomePageTemplate;
